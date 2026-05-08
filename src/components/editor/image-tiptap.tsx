import Image from "@tiptap/extension-image";
import { type Editor, useCurrentEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import Moveable from "react-moveable";
import { type ButtonHTMLAttributes, type ComponentProps, type HTMLAttributes, type ReactNode, createContext, forwardRef, useContext, useEffect, useState } from "react";

const DATA_ALIGNMENT_KEY = "data-alignment";
const IMAGE_NODE = "image";
const PROSEMIRROR_SELECTED_NODE = ".ProseMirror-selectednode";
const MIN_IMAGE_WIDTH = 120;

const alignmentStyles: Record<"left" | "center" | "right", string> = {
  center: "margin: 0 auto;",
  left: "margin-right: auto; margin-top: 0;",
  right: "margin-left: auto; margin-top: 0;"
};

type Alignment = keyof typeof alignmentStyles;

const ImageAlignerContext = createContext<Editor | null>(null);

function getSelectedImage(editor: Editor | null) {
  if (!editor || !editor.isActive(IMAGE_NODE) || typeof document === "undefined") {
    return null;
  }

  const node = document.querySelector(PROSEMIRROR_SELECTED_NODE);

  return node instanceof HTMLImageElement ? node : null;
}

function commitImageDimensions(editor: Editor, imageNode: HTMLImageElement) {
  const selection = editor.state.selection;
  const width = Number.parseFloat(imageNode.style.width || imageNode.getAttribute("width") || `${imageNode.width}`);
  const height = Number.parseFloat(imageNode.style.height || imageNode.getAttribute("height") || `${imageNode.height}`);

  editor.commands.setImage({
    src: imageNode.src,
    ...(imageNode.alt ? { alt: imageNode.alt } : {}),
    ...(imageNode.title ? { title: imageNode.title } : {}),
    ...(Number.isFinite(width) && width > 0 ? { width } : {}),
    ...(Number.isFinite(height) && height > 0 ? { height } : {}),
    [DATA_ALIGNMENT_KEY]: (imageNode.getAttribute(DATA_ALIGNMENT_KEY) as Alignment | null) ?? "center"
  });
  editor.commands.setNodeSelection(selection.from);
}

function getImageResizeBounds(imageNode: HTMLImageElement) {
  const parentWidth = imageNode.parentElement?.clientWidth ?? imageNode.closest(".tiptap-editor")?.clientWidth ?? imageNode.clientWidth;

  return {
    minWidth: MIN_IMAGE_WIDTH,
    maxWidth: Math.max(MIN_IMAGE_WIDTH, parentWidth)
  };
}

export const ImageExtension = Image.extend({
  name: IMAGE_NODE,
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null
      },
      width: {
        default: null
      },
      [DATA_ALIGNMENT_KEY]: {
        default: "center",
        renderHTML: (attributes) => ({
          [DATA_ALIGNMENT_KEY]: attributes[DATA_ALIGNMENT_KEY],
          style: alignmentStyles[attributes[DATA_ALIGNMENT_KEY] as Alignment] ?? alignmentStyles.center
        })
      }
    };
  }
});

type ImageAlignerRootProps = {
  children: ReactNode;
  editor?: Editor | null;
};

type ImageAlignerMenuProps = ComponentProps<typeof BubbleMenu>;

type ImageAlignerItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  alignment: Alignment;
};

const ImageResizer = ({ editor }: { editor: Editor | null }) => {
  const imageNode = getSelectedImage(editor);

  if (!editor || !imageNode) {
    return null;
  }

  return (
    <Moveable
      target={imageNode}
      container={null}
      origin={false}
      edge={false}
      throttleDrag={0}
      keepRatio
      resizable
      throttleResize={0}
      scalable={false}
      renderDirections={["w", "e", "s", "n"]}
      onResize={({ target, width, height, delta }) => {
        if (!(target instanceof HTMLImageElement)) {
          return;
        }

        const { minWidth, maxWidth } = getImageResizeBounds(target);
        const clampedWidth = Math.min(Math.max(width, minWidth), maxWidth);
        const aspectRatio = target.naturalWidth > 0 && target.naturalHeight > 0
          ? target.naturalWidth / target.naturalHeight
          : width > 0 && height > 0
            ? width / height
            : 1;
        const clampedHeight = clampedWidth / aspectRatio;

        if (delta[0]) {
          target.style.width = `${clampedWidth}px`;
        }

        if (delta[0] || delta[1]) {
          target.style.height = `${clampedHeight}px`;
        }
      }}
      onResizeEnd={() => {
        const currentImage = getSelectedImage(editor);

        if (currentImage) {
          commitImageDimensions(editor, currentImage);
        }
      }}
    />
  );
};

const ImageAlignerRoot = ({ children, editor: propEditor }: ImageAlignerRootProps) => {
  const { editor: contextEditor } = useCurrentEditor();
  const editor = propEditor ?? contextEditor ?? null;
  const [, setRevision] = useState(0);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const bumpRevision = () => {
      setRevision((revision) => revision + 1);
    };

    editor.on("selectionUpdate", bumpRevision);
    editor.on("transaction", bumpRevision);
    editor.on("focus", bumpRevision);
    editor.on("blur", bumpRevision);

    return () => {
      editor.off("selectionUpdate", bumpRevision);
      editor.off("transaction", bumpRevision);
      editor.off("focus", bumpRevision);
      editor.off("blur", bumpRevision);
    };
  }, [editor]);

  return (
    <ImageAlignerContext.Provider value={editor}>
      {children}
      <ImageResizer editor={editor} />
    </ImageAlignerContext.Provider>
  );
};

const ImageAlignerMenu = ({ shouldShow, children, ...props }: ImageAlignerMenuProps) => {
  const editor = useContext(ImageAlignerContext);

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={(args) => args.editor.isActive(IMAGE_NODE) && (shouldShow?.(args) ?? true)}
      {...props}
    >
      {children}
    </BubbleMenu>
  );
};

const ImageAlignerItems = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  return <div ref={ref} {...props} />;
});

ImageAlignerItems.displayName = "ImageAligner.Items";

const ImageAlignerItem = forwardRef<HTMLButtonElement, ImageAlignerItemProps>(({ alignment, onClick, ...props }, ref) => {
  const editor = useContext(ImageAlignerContext);

  if (!editor) {
    return null;
  }

  const imageNode = getSelectedImage(editor);
  const isActive = imageNode?.getAttribute(DATA_ALIGNMENT_KEY) === alignment;

  return (
    <button
      ref={ref}
      type="button"
      data-active={isActive ? "true" : undefined}
      data-alignment={alignment}
      onClick={(event) => {
        const currentImage = getSelectedImage(editor);

        if (!currentImage) {
          onClick?.(event);
          return;
        }

        currentImage.setAttribute(DATA_ALIGNMENT_KEY, alignment);
        commitImageDimensions(editor, currentImage);
        onClick?.(event);
      }}
      {...props}
    />
  );
});

ImageAlignerItem.displayName = "ImageAligner.Item";

export const ImageAligner = {
  Root: ImageAlignerRoot,
  AlignMenu: ImageAlignerMenu,
  Items: ImageAlignerItems,
  Item: ImageAlignerItem
};
