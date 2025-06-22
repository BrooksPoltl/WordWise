export type EditorMode = 'wysiwyg' | 'markdown';

export interface EditorState {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  toggleMode: () => void;
} 