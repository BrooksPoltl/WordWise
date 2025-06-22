import { EditorView } from '@codemirror/view';

export const toggleMark = (view: EditorView | null, mark: string) => {
    if (!view) return;

    const { state, dispatch } = view;
    const { from, to } = state.selection.main;
    const selection = state.doc.sliceString(from, to);
    
    // Check if the selection is already wrapped with the mark
    const isMarked = selection.startsWith(mark) && selection.endsWith(mark);
    
    let change;
    if (isMarked) {
        // Unwrap the mark
        const newSelection = selection.slice(mark.length, selection.length - mark.length);
        change = { from, to, insert: newSelection };
    } else {
        // Wrap with the mark
        change = { from, to, insert: `${mark}${selection}${mark}` };
    }
    
    dispatch({ changes: change });
};

export const toggleHeader = (view: EditorView | null, level: number) => {
    if (!view) return;

    const { state, dispatch } = view;
    const { from } = state.selection.main;
    const line = state.doc.lineAt(from);
    const prefix = `${'#'.repeat(level)} `;
    
    if (line.text.startsWith(prefix)) {
        // Remove the prefix
        const change = { from: line.from, to: line.from + prefix.length, insert: '' };
        dispatch({ changes: change });
    } else {
        // Add the prefix
        const change = { from: line.from, to: line.from, insert: prefix };
        dispatch({ changes: change });
    }
}; 