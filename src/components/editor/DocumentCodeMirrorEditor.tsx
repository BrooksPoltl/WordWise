import { EditorView } from '@codemirror/view';
import React from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useDocumentStore } from '../../store/document/document.store';
import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import CodeMirrorEditor from './CodeMirrorEditor';

interface DocumentCodeMirrorEditorProps {
  onViewReady?: (view: EditorView) => void;
}

export const DocumentCodeMirrorEditor: React.FC<DocumentCodeMirrorEditorProps> = ({ onViewReady }) => {
    const { currentDocument } = useDocumentStore();
    const suggestionStore = useSuggestionStore();
    
    const { debouncedSave } = useAutoSave(currentDocument?.id || '');

    if (!currentDocument) {
        return <div>Loading document...</div>;
    }

    return (
        <CodeMirrorEditor
            initialContent={currentDocument.content}
            suggestionStore={suggestionStore}
            onChange={debouncedSave}
            onViewReady={onViewReady}
        />
    );
};

DocumentCodeMirrorEditor.displayName = 'DocumentCodeMirrorEditor'; 