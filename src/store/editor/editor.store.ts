import { create, createStore } from 'zustand';
import { EditorState } from './editor.types';

export const editorStore = createStore<EditorState>((set) => ({
  mode: 'wysiwyg',
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({
      mode: state.mode === 'wysiwyg' ? 'markdown' : 'wysiwyg',
    })),
}));

export const useEditorStore = create(editorStore); 