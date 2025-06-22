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

export const toggleLink = (view: EditorView | null) => {
  if (!view) return;

  const { state, dispatch } = view;
  const { from, to } = state.selection.main;
  const selection = state.doc.sliceString(from, to);

  const url = prompt('Enter the URL:');
  if (url) {
    const change = {
      from,
      to,
      insert: `[${selection}](${url})`,
    };
    dispatch({ changes: change });
  }
};

export const insertTable = (view: EditorView | null) => {
  if (!view) return;

  const rowsStr = prompt('Enter number of rows:', '2');
  const colsStr = prompt('Enter number of columns:', '2');

  const rows = parseInt(rowsStr || '2', 10);
  const cols = parseInt(colsStr || '2', 10);

  if (Number.isNaN(rows) || Number.isNaN(cols) || rows <= 0 || cols <= 0) {
    alert('Please enter valid numbers for rows and columns.');
    return;
  }

  let table = '';

  // Header
  table += `| ${Array(cols).fill('Header').join(' | ')} |\n`;
  
  // Separator
  table += `| ${Array(cols).fill('---').join(' | ')} |\n`;

  // Body
  for (let i = 0; i < rows; i += 1) {
    table += `| ${Array(cols).fill('Cell').join(' | ')} |\n`;
  }

  const { state, dispatch } = view;
  dispatch(state.replaceSelection(table));
}; 