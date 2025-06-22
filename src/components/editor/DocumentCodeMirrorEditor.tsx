import React from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useDocumentStore } from '../../store/document/document.store';
import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import CodeMirrorEditor, { CodeMirrorEditorRef } from './CodeMirrorEditor';

interface DocumentCodeMirrorEditorProps {
  onViewReady?: () => void;
}

export const DocumentCodeMirrorEditor = React.forwardRef<CodeMirrorEditorRef, DocumentCodeMirrorEditorProps>(({ onViewReady }, ref) => {
    const { currentDocument } = useDocumentStore();
    const suggestionStore = useSuggestionStore();
    
    const { debouncedSave } = useAutoSave(currentDocument?.id || '');

    if (!currentDocument) {
        return <div>Loading document...</div>;
    }

    return (
        <CodeMirrorEditor
            ref={ref}
            initialContent={currentDocument.content}
            suggestionStore={suggestionStore}
            onChange={debouncedSave}
            onViewReady={onViewReady}
        />
    );
});

DocumentCodeMirrorEditor.displayName = 'DocumentCodeMirrorEditor'; 