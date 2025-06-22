import { Extension, Range } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';
import { editorStore } from '../store/editor/editor.store';
import { isNode, parseMarkdown } from '../utils/markdownParser';

const getDecorationForNode = (node: Node): Range<Decoration> | null => {
  if (node.position?.start?.offset === undefined || node.position?.end?.offset === undefined) {
    return null;
  }

  if (node.type === 'strong') {
    return Decoration.mark({ class: 'cm-strong' }).range(node.position.start.offset, node.position.end.offset);
  }
  if (node.type === 'emphasis') {
    return Decoration.mark({ class: 'cm-emphasis' }).range(node.position.start.offset, node.position.end.offset);
  }
  return null;
};

const wysiwygPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    view: EditorView;

    unsubscribe: () => void;

    constructor(view: EditorView) {
      this.view = view;
      this.decorations = this.buildDecorations(view);

      this.unsubscribe = editorStore.subscribe(() => {
        this.decorations = this.buildDecorations(this.view);
        this.view.dispatch({
          effects: [],
        });
      });
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    destroy() {
      this.unsubscribe();
    }

    // eslint-disable-next-line class-methods-use-this
    buildDecorations(view: EditorView): DecorationSet {
      const { mode } = editorStore.getState();
      if (mode !== 'wysiwyg') {
        return Decoration.none;
      }
      
      const text = view.state.doc.toString();
      const ast = parseMarkdown(text);
      const decorations: Range<Decoration>[] = [];
      
      if (isNode(ast)) {
          visit(ast, (node) => {
              const decoration = getDecorationForNode(node);
              if (decoration) {
                  decorations.push(decoration);
              }
          });
      }

      return Decoration.set(decorations, true);
    }
  },
  {
    decorations: v => v.decorations,
  }
);

export const WysiwygDecorations = (): Extension => [wysiwygPlugin]; 