import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: () => ReturnType;
      toggleCallout: () => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-callout="true"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-callout": "true" }), 0];
  },

  addCommands() {
    return {
      setCallout: () => ({ commands }) => commands.wrapIn(this.name),
      toggleCallout: () => ({ commands }) => commands.toggleWrap(this.name),
      unsetCallout: () => ({ commands }) => commands.lift(this.name)
    };
  }
});

export default Callout;
