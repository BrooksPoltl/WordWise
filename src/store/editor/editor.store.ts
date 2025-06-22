import { create } from 'zustand';
import { EditorState } from './editor.types';

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'wysiwyg',
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({
      mode: state.mode === 'wysiwyg' ? 'markdown' : 'wysiwyg',
    })),
})); 