import { Extension, Range } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { visit } from 'unist-util-visit';
import { useEditorStore } from '../store/editor/editor.store';
import { isNode, parseMarkdown } from '../utils/markdownParser';
import { getDecorationForNode } from './BasicFormattingDecorations';

// This will be the main plugin that orchestrates the WYSIWYG view.
const wysiwygViewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    view: EditorView;

    unsubscribe: () => void;

    constructor(view: EditorView) {
      this.view = view;
      this.decorations = Decoration.none;
      this.unsubscribe = useEditorStore.subscribe(this.onStoreChange);
      this.updateDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.updateDecorations(update.view);
      }
    }
    
    onStoreChange = () => {
        this.updateDecorations(this.view);
        this.view.dispatch({
            effects: [], 
        })
    }

    updateDecorations(view: EditorView) {
        const { mode } = useEditorStore.getState();
        if (mode !== 'wysiwyg') {
            if (this.decorations.size > 0) {
                this.decorations = Decoration.none;
            }
            return;
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

        this.decorations = Decoration.set(decorations, true);
        if (view.viewport.from > 0 || view.viewport.to < view.state.doc.length || decorations.length > 0) {
            view.dispatch({
                effects: [],
            });
        }
    }
    
    destroy() {
        this.unsubscribe();
    }
  },
  {
    decorations: v => v.decorations,
  },
);

export const wysiwygExtension = (): Extension => [wysiwygViewPlugin]; 