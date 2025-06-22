import { EditorView } from '@codemirror/view';
import React, { useCallback, useState } from 'react';
import { useAdvisoryAutoRefresh } from '../../hooks/useAdvisoryAutoRefresh';
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
    
    // Track the current content state for advisory auto-refresh
    const [currentContent, setCurrentContent] = useState(currentDocument?.content || '');
    
    const { debouncedSave } = useAutoSave(currentDocument?.id || '');
    
    // Advisory auto-refresh integration - now uses the actual current content
    useAdvisoryAutoRefresh(currentContent, { 
      enabled: true,
      minContentLength: 50 
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