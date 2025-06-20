import TextEditor from './TextEditor';

interface EditorContainerProps {
  documentId: string;
  onTitleChange: (newTitle: string) => void;
}

export const EditorContainer = ({
  documentId,
  onTitleChange,
}: EditorContainerProps) => (
  <TextEditor
    documentId={documentId}
    onTitleChange={onTitleChange}
  />
); 