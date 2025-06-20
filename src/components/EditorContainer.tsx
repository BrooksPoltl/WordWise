import { Editor } from '@tiptap/react';
import { useSuggestions } from '../hooks/useSuggestions';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import TextEditor from './TextEditor';

interface EditorContainerProps {
  documentId: string;
  onTitleChange: (newTitle: string) => void;
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

export const EditorContainer = ({
  documentId,
  onTitleChange,
  editor,
  setEditor,
}: EditorContainerProps) => {
  const { visibility } = useSuggestionStore(state => ({
    visibility: state.visibility,
  }));

  useSuggestions({ editor });

  return (
    <TextEditor
      documentId={documentId}
      onTitleChange={onTitleChange}
      setEditor={setEditor}
      suggestionVisibility={visibility}
    />
  );
}; 