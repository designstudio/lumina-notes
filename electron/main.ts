import { BrowserWindow, app, dialog, ipcMain, shell } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const isDev = !app.isPackaged;
const rendererEntry = process.env.ELECTRON_RENDERER_ENTRY;
const notesFileName = "notes.json";
const storageConfigFileName = "storage.json";
const legacyUserDataFolderName = "lumina-notes";

if (isDev) {
  const devDataRoot = path.join(process.cwd(), ".electron-dev");
  app.disableHardwareAcceleration();
  app.setPath("userData", path.join(devDataRoot, "userData"));
  app.setPath("sessionData", path.join(devDataRoot, "sessionData"));
}

type StoredNote = {
  id: string;
  title: string;
  preview: string;
  body: string;
  folder: string;
  tags: string[];
  pinned?: boolean;
  sortOrder?: number;
  color: string;
  createdAt: string;
  updatedAt: string;
  checklist: { id: string; label: string; done: boolean }[];
};

type StorageConfig = {
  notesDirectoryPath?: string;
};

type AppearanceMode = "light" | "dark";

function isSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getDefaultNotesDirectoryPath() {
  return app.getPath("userData");
}

function getStorageConfigPath() {
  return path.join(app.getPath("userData"), storageConfigFileName);
}

async function loadStorageConfig(): Promise<StorageConfig> {
  try {
    const raw = await fs.readFile(getStorageConfigPath(), "utf8");
    return JSON.parse(raw) as StorageConfig;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function saveStorageConfig(config: StorageConfig) {
  const filePath = getStorageConfigPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(config, null, 2), "utf8");
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function migrateLegacyUserData() {
  if (isDev) {
    return;
  }

  const currentUserDataPath = app.getPath("userData");
  const legacyUserDataPath = path.join(app.getPath("appData"), legacyUserDataFolderName);

  if (currentUserDataPath === legacyUserDataPath) {
    return;
  }

  const hasCurrentNotes = await pathExists(path.join(currentUserDataPath, notesFileName));
  const hasCurrentStorageConfig = await pathExists(path.join(currentUserDataPath, storageConfigFileName));

  if (hasCurrentNotes || hasCurrentStorageConfig) {
    return;
  }

  const hasLegacyNotes = await pathExists(path.join(legacyUserDataPath, notesFileName));
  const hasLegacyStorageConfig = await pathExists(path.join(legacyUserDataPath, storageConfigFileName));

  if (!hasLegacyNotes && !hasLegacyStorageConfig) {
    return;
  }

  await fs.mkdir(currentUserDataPath, { recursive: true });

  if (hasLegacyNotes) {
    await fs.copyFile(
      path.join(legacyUserDataPath, notesFileName),
      path.join(currentUserDataPath, notesFileName)
    );
  }

  if (hasLegacyStorageConfig) {
    await fs.copyFile(
      path.join(legacyUserDataPath, storageConfigFileName),
      path.join(currentUserDataPath, storageConfigFileName)
    );
  }
}

async function getNotesDirectoryPath() {
  const config = await loadStorageConfig();
  return config.notesDirectoryPath || getDefaultNotesDirectoryPath();
}

async function getNotesFilePath() {
  return path.join(await getNotesDirectoryPath(), notesFileName);
}

async function getNotesStorageInfo() {
  const filePath = await getNotesFilePath();
  return {
    filePath,
    directoryPath: path.dirname(filePath)
  };
}

async function openNotesStorageDirectory() {
  const { directoryPath } = await getNotesStorageInfo();
  return shell.openPath(directoryPath);
}

async function chooseNotesStorageDirectory() {
  const currentInfo = await getNotesStorageInfo();
  const result = await dialog.showOpenDialog({
    title: "Choose notes folder",
    defaultPath: currentInfo.directoryPath,
    properties: ["openDirectory", "createDirectory"]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return currentInfo;
  }

  const nextDirectoryPath = result.filePaths[0];
  const nextFilePath = path.join(nextDirectoryPath, notesFileName);

  if (nextDirectoryPath === currentInfo.directoryPath) {
    return currentInfo;
  }

  await fs.mkdir(nextDirectoryPath, { recursive: true });

  try {
    await fs.access(currentInfo.filePath);
    try {
      await fs.access(nextFilePath);
    } catch {
      await fs.copyFile(currentInfo.filePath, nextFilePath);
    }
  } catch {
    // No existing notes file yet, so there is nothing to migrate.
  }

  await saveStorageConfig({ notesDirectoryPath: nextDirectoryPath });

  return {
    filePath: nextFilePath,
    directoryPath: nextDirectoryPath
  };
}

function sanitizeExportFileName(value: string) {
  return value.replace(/[<>:"/\|?*]+/g, " ").replace(/\s+/g, " ").trim() || "note";
}

async function exportNotesData(parentWindow: BrowserWindow | null, data: unknown) {
  const notesInfo = await getNotesStorageInfo();
  const timestamp = new Date().toISOString().replace(/[\:.]/g, "-");
  const defaultPath = path.join(notesInfo.directoryPath, `lumina-notes-export-${timestamp}.json`);

  const saveDialogOptions = {
    title: "Export data",
    defaultPath,
    filters: [
      {
        name: "JSON",
        extensions: ["json"]
      }
    ]
  };
  const result = parentWindow ? await dialog.showSaveDialog(parentWindow, saveDialogOptions) : await dialog.showSaveDialog(saveDialogOptions);

  if (result.canceled || !result.filePath) {
    return null;
  }

  const payload = JSON.stringify(data, null, 2);
  await fs.mkdir(path.dirname(result.filePath), { recursive: true });
  await fs.writeFile(result.filePath, payload, "utf8");

  return result.filePath;
}

async function exportNoteMarkdown(parentWindow: BrowserWindow | null, title: string, markdown: string) {
  const notesInfo = await getNotesStorageInfo();
  const defaultPath = path.join(notesInfo.directoryPath, `${sanitizeExportFileName(title)}.md`);

  const saveDialogOptions = {
    title: "Export as Markdown",
    defaultPath,
    filters: [{ name: "Markdown", extensions: ["md"] }]
  };
  const result = parentWindow ? await dialog.showSaveDialog(parentWindow, saveDialogOptions) : await dialog.showSaveDialog(saveDialogOptions);

  if (result.canceled || !result.filePath) {
    return null;
  }

  await fs.mkdir(path.dirname(result.filePath), { recursive: true });
  await fs.writeFile(result.filePath, markdown, "utf8");
  return result.filePath;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPdfDocument(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { margin: 18mm; }
      :root {
        color-scheme: light;
        font-family: "Segoe UI", Arial, sans-serif;
        color: #111111;
        background: #ffffff;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #111111;
        background: #ffffff;
      }
      .document {
        width: 100%;
      }
      h1 {
        margin: 0 0 16px;
        font-size: 32px;
        line-height: 1.2;
      }
      h2 {
        margin: 32px 0 14px;
        font-size: 22px;
        line-height: 1.24;
      }
      h3 {
        margin: 26px 0 12px;
        font-size: 18px;
        line-height: 1.28;
      }
      h4, p, ul, ol, blockquote, table, figure {
        margin: 0 0 14px;
      }
      ul, ol { padding-left: 22px; }
      li { margin-bottom: 6px; }
      blockquote {
        padding-left: 14px;
        border-left: 3px solid #d9d9d9;
        color: #4f4f4f;
      }
      code {
        padding: 2px 5px;
        border-radius: 5px;
        background: #f4f4f4;
        font-family: "Cascadia Mono", Consolas, monospace;
        font-size: 0.92em;
      }
      pre {
        padding: 14px;
        border-radius: 12px;
        background: #f4f4f4;
        overflow: auto;
      }
      pre code {
        padding: 0;
        background: transparent;
      }
      a {
        color: #0f6cbd;
        text-decoration: underline;
      }
      mark {
        padding: 0 2px;
        border-radius: 3px;
        background: #fff2a8;
      }
      img {
        display: block;
        max-width: 100%;
        height: auto;
        margin: 6px 0 16px;
        border-radius: 12px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 10px 12px;
        border: 1px solid #dddddd;
        text-align: left;
        vertical-align: top;
      }
      th {
        background: #f6f6f6;
      }
      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        vertical-align: middle;
      }
    </style>
  </head>
  <body>
    <main class="document">
      <h1>${escapeHtml(title)}</h1>
      ${bodyHtml}
    </main>
  </body>
</html>`;
}

async function exportNotePdf(window: BrowserWindow, title: string, bodyHtml: string) {
  const notesInfo = await getNotesStorageInfo();
  const defaultPath = path.join(notesInfo.directoryPath, `${sanitizeExportFileName(title)}.pdf`);

  const result = await dialog.showSaveDialog(window, {
    title: "Export as PDF",
    defaultPath,
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  const pdfWindow = new BrowserWindow({
    show: false,
    width: 900,
    height: 1200,
    backgroundColor: "#ffffff"
  });

  try {
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(buildPdfDocument(title, bodyHtml))}`);
    await new Promise((resolve) => setTimeout(resolve, 80));

    const pdf = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      preferCSSPageSize: true
    });

    await fs.mkdir(path.dirname(result.filePath), { recursive: true });
    await fs.writeFile(result.filePath, pdf);
    return result.filePath;
  } finally {
    if (!pdfWindow.isDestroyed()) {
      pdfWindow.close();
    }
  }
}

async function loadNotes() {
  try {
    const raw = await fs.readFile(await getNotesFilePath(), "utf8");
    const parsed = JSON.parse(raw) as { notes?: StoredNote[] } | StoredNote[];
    return Array.isArray(parsed) ? parsed : parsed.notes ?? [];
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function saveNotes(notes: StoredNote[]) {
  const filePath = await getNotesFilePath();
  const tempPath = `${filePath}.tmp`;
  const payload = JSON.stringify(
    {
      version: 1,
      notes
    },
    null,
    2
  );

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(tempPath, payload, "utf8");
  await fs.rename(tempPath, filePath);
}

async function waitForFile(filePath: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  return false;
}

async function pickImageFile() {
  const result = await dialog.showOpenDialog({
    title: "Insert image",
    properties: ["openFile"],
    filters: [
      {
        name: "Images",
        extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"]
      }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return pathToFileURL(result.filePaths[0]).toString();
}

function syncWindowAppearance(window: BrowserWindow, appearance: AppearanceMode) {
  const isDark = appearance === "dark";
  window.setBackgroundColor(isDark ? "#101114" : "#ffffff");
  window.setTitleBarOverlay({
    color: isDark ? "#101114" : "#ffffff",
    symbolColor: isDark ? "#f3f4f6" : "#111111",
    height: 36
  });
}

function getWindowIconPath() {
  return path.join(__dirname, "../assets/windows/icon.ico");
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 818,
    minWidth: 1100,
    minHeight: 720,
    icon: process.platform === "win32" ? getWindowIconPath() : undefined,
    backgroundColor: "#ffffff",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#ffffff",
      symbolColor: "#111111",
      height: 36
    },
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  syncWindowAppearance(window, "light");

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      void shell.openExternal(url);
    }

    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (!isSafeExternalUrl(url)) {
      return;
    }

    event.preventDefault();
    void shell.openExternal(url);
  });


  if (isDev && rendererEntry) {
    const isReady = await waitForFile(rendererEntry);
    if (!isReady) {
      await window.loadURL("data:text/html,<html><body style='font-family:Segoe UI,sans-serif;padding:24px;background:#ffffff;color:#111111'>Renderer build still starting. Save a file or restart the dev command.</body></html>");
      return;
    }

    await window.loadFile(rendererEntry);
    return;
  }

  await window.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(async () => {
  try {
    await migrateLegacyUserData();
  } catch (error) {
    console.error("Failed to migrate legacy user data:", error);
  }

  ipcMain.handle("notes:load", loadNotes);
  ipcMain.handle("notes:save", (_event, notes: StoredNote[]) => saveNotes(notes));
  ipcMain.handle("notes:getStorageInfo", getNotesStorageInfo);
  ipcMain.handle("notes:openStorageDirectory", openNotesStorageDirectory);
  ipcMain.handle("notes:chooseStorageDirectory", chooseNotesStorageDirectory);
  ipcMain.handle("notes:exportData", (event, data: unknown) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return exportNotesData(window ?? null, data);
  });
  ipcMain.handle("notes:exportMarkdown", (event, title: string, markdown: string) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return exportNoteMarkdown(window ?? null, title, markdown);
  });
  ipcMain.handle("notes:exportPdf", (event, title: string, bodyHtml: string) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window ? exportNotePdf(window, title, bodyHtml) : null;
  });
  ipcMain.handle("window:setAppearance", (event, appearance: AppearanceMode) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      syncWindowAppearance(window, appearance);
    }
  });
  ipcMain.handle("system:openExternal", (_event, url: string) => {
    if (!isSafeExternalUrl(url)) {
      return false;
    }

    void shell.openExternal(url);
    return true;
  });
  ipcMain.handle("images:pick", pickImageFile);
  ipcMain.handle("app:getVersion", () => app.getVersion());

  void createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});









