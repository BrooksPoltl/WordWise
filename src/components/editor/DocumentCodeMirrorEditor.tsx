import { EditorView } from '@codemirror/view';
import React, { useCallback } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useDocumentStore } from '../../store/document/document.store';
import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import CodeMirrorEditor from './CodeMirrorEditor';

interface DocumentCodeMirrorEditorProps {
  onViewReady?: (view: EditorView) => void;
  onContentChange?: (content: string) => void;
}

export const DocumentCodeMirrorEditor: React.FC<DocumentCodeMirrorEditorProps> = ({ 
  onViewReady, 
  onContentChange 
}) => {
    const { currentDocument } = useDocumentStore();
    const suggestionStore = useSuggestionStore();
    
    const { debouncedSave } = useAutoSave(currentDocument?.id || '');

    const handleChange = useCallback((content: string) => {
        debouncedSave(content);
        onContentChange?.(content);
    }, [debouncedSave, onContentChange]);

    if (!currentDocument) {
        return <div>Loading document...</div>;
    }

    return (
        <CodeMirrorEditor
            initialContent={currentDocument.content}
            suggestionStore={suggestionStore}
            onChange={handleChange}
            onViewReady={onViewReady}
        />
    );
};

DocumentCodeMirrorEditor.displayName = 'DocumentCodeMirrorEditor'; 