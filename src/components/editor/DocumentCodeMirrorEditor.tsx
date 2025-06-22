import { EditorView } from '@codemirror/view';
import React, { useCallback, useEffect, useState } from 'react';
import { ADVISORY_MIN_CONTENT_LENGTH } from '../../constants/advisoryConstants';
import { useAdvisoryAutoRefresh } from '../../hooks/useAdvisoryAutoRefresh';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useAdvisoryStore } from '../../store/advisory';
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
    const { clearComments } = useAdvisoryStore();
    const suggestionStore = useSuggestionStore();
    
    // Track the current content state for advisory auto-refresh
    const [currentContent, setCurrentContent] = useState(currentDocument?.content || '');

    // Clear comments when document changes
    useEffect(() => {
        clearComments(); // Clear advisory comments from previous document
    }, [currentDocument?.id, clearComments]); // Only depend on document ID change
    
    const { debouncedSave } = useAutoSave(currentDocument?.id || '');
    
    // Advisory auto-refresh integration - now uses the actual current content
    useAdvisoryAutoRefresh(currentContent, currentDocument?.id || '', { 
      enabled: true,
      minContentLength: ADVISORY_MIN_CONTENT_LENGTH 
    });

    const handleChange = useCallback((content: string) => {
        setCurrentContent(content); // Update the content state for advisory auto-refresh
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