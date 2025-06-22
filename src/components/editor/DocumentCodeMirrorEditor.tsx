import React from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useDocumentStore } from '../../store/document/document.store';
import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import CodeMirrorEditor from './CodeMirrorEditor';

export const DocumentCodeMirrorEditor: React.FC = () => {
  const { currentDocument } = useDocumentStore();
  const suggestionStore = useSuggestionStore();
  
  // This hook will handle debounced saving
  const { debouncedSave } = useAutoSave(currentDocument?.id || '');

  if (!currentDocument) {
    return <div>Loading document...</div>;
  }

  return (
    <CodeMirrorEditor
      initialContent={currentDocument.content}
      suggestionStore={suggestionStore}
      onChange={debouncedSave}
    />
  );
}; 