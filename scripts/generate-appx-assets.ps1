$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$assetsDir = Join-Path $root "assets"
$windowsAssetsDir = Join-Path $assetsDir "windows"
$appxDir = Join-Path $root "build\\appx"
$appListTargetSizes = @(16, 20, 24, 30, 32, 36, 40, 44, 48, 60, 64, 72, 80, 96, 256)

New-Item -ItemType Directory -Force -Path $appxDir | Out-Null

function New-ResizedPng {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,
    [Parameter(Mandatory = $true)]
    [string]$DestinationPath,
    [Parameter(Mandatory = $true)]
    [int]$Width,
    [Parameter(Mandatory = $true)]
    [int]$Height,
    [switch]$TransparentBackground
  )

  $source = [System.Drawing.Image]::FromFile($SourcePath)

  try {
    $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

      try {
        if ($TransparentBackground) {
          $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
          $graphics.Clear([System.Drawing.Color]::Transparent)
        } else {
          $graphics.Clear([System.Drawing.Color]::White)
        }

        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $scale = [Math]::Min($Width / $source.Width, $Height / $source.Height)
        $drawWidth = [int][Math]::Round($source.Width * $scale)
        $drawHeight = [int][Math]::Round($source.Height * $scale)
        $x = [int][Math]::Floor(($Width - $drawWidth) / 2)
        $y = [int][Math]::Floor(($Height - $drawHeight) / 2)

        $graphics.DrawImage($source, $x, $y, $drawWidth, $drawHeight)
      }
      finally {
        $graphics.Dispose()
      }

      $bitmap.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $bitmap.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }
}

function New-IcoFromPngs {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$PngPaths,
    [Parameter(Mandatory = $true)]
    [string]$IcoPath
  )

  $entries = foreach ($pngPath in $PngPaths) {
    Add-Type -AssemblyName System.Drawing
    $bitmap = [System.Drawing.Bitmap]::FromFile($pngPath)
    try {
      [PSCustomObject]@{
        Path = $pngPath
        Width = $bitmap.Width
        Height = $bitmap.Height
        Bytes = [System.IO.File]::ReadAllBytes($pngPath)
      }
    }
    finally {
      $bitmap.Dispose()
    }
  }

  $tempIcoPath = "$IcoPath.tmp"
  $fileStream = [System.IO.File]::Open($tempIcoPath, [System.IO.FileMode]::Create)

  try {
    $writer = New-Object System.IO.BinaryWriter($fileStream)

    try {
      $writer.Write([UInt16]0)
      $writer.Write([UInt16]1)
      $writer.Write([UInt16]$entries.Count)

      $imageOffset = 6 + (16 * $entries.Count)
      foreach ($entry in $entries) {
        $writer.Write([byte]([Math]::Min($entry.Width, 256) % 256))
        $writer.Write([byte]([Math]::Min($entry.Height, 256) % 256))
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]32)
        $writer.Write([UInt32]$entry.Bytes.Length)
        $writer.Write([UInt32]$imageOffset)
        $imageOffset += $entry.Bytes.Length
      }

      foreach ($entry in $entries) {
        $writer.Write($entry.Bytes)
      }
    }
    finally {
      $writer.Dispose()
    }
  }
  finally {
    $fileStream.Dispose()
  }

  Move-Item -Force $tempIcoPath $IcoPath
}

$masterIconPath = Join-Path $assetsDir "icon.png"

New-ResizedPng -SourcePath $masterIconPath -DestinationPath (Join-Path $windowsAssetsDir "16x16.png") -Width 16 -Height 16 -TransparentBackground
New-ResizedPng -SourcePath $masterIconPath -DestinationPath (Join-Path $windowsAssetsDir "32x32.png") -Width 32 -Height 32 -TransparentBackground
New-ResizedPng -SourcePath $masterIconPath -DestinationPath (Join-Path $windowsAssetsDir "48x48.png") -Width 48 -Height 48 -TransparentBackground
New-ResizedPng -SourcePath $masterIconPath -DestinationPath (Join-Path $windowsAssetsDir "64x64.png") -Width 64 -Height 64 -TransparentBackground
New-ResizedPng -SourcePath $masterIconPath -DestinationPath (Join-Path $windowsAssetsDir "128x128.png") -Width 128 -Height 128 -TransparentBackground
New-ResizedPng -SourcePath $masterIconPath -DestinationPath (Join-Path $windowsAssetsDir "256x256.png") -Width 256 -Height 256 -TransparentBackground
New-IcoFromPngs -PngPaths @(
  (Join-Path $windowsAssetsDir "16x16.png"),
  (Join-Path $windowsAssetsDir "32x32.png"),
  (Join-Path $windowsAssetsDir "48x48.png"),
  (Join-Path $windowsAssetsDir "64x64.png"),
  (Join-Path $windowsAssetsDir "128x128.png"),
  (Join-Path $windowsAssetsDir "256x256.png")
) -IcoPath (Join-Path $windowsAssetsDir "icon.ico")

Copy-Item (Join-Path $windowsAssetsDir "256x256.png") (Join-Path $appxDir "StoreLogo.png") -Force
Copy-Item (Join-Path $windowsAssetsDir "256x256.png") (Join-Path $appxDir "Square44x44Logo.png") -Force
Copy-Item (Join-Path $windowsAssetsDir "256x256.png") (Join-Path $appxDir "Square150x150Logo.png") -Force
Copy-Item (Join-Path $assetsDir "42026204254.png") (Join-Path $appxDir "Wide310x150Logo.png") -Force

foreach ($targetSize in $appListTargetSizes) {
  $baseFileName = "Square44x44Logo.targetsize-$targetSize.png"
  $unplatedFileName = "Square44x44Logo.targetsize-$targetSize" + "_altform-unplated.png"
  $lightUnplatedFileName = "Square44x44Logo.targetsize-$targetSize" + "_altform-lightunplated.png"
  $basePath = Join-Path $appxDir $baseFileName
  $unplatedPath = Join-Path $appxDir $unplatedFileName
  $lightUnplatedPath = Join-Path $appxDir $lightUnplatedFileName

  New-ResizedPng -SourcePath $masterIconPath -DestinationPath $basePath -Width $targetSize -Height $targetSize -TransparentBackground
  Copy-Item $basePath $unplatedPath -Force
  Copy-Item $basePath $lightUnplatedPath -Force
}
