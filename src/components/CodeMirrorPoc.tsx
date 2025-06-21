import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import React, { useState } from 'react';
import { HarperSuggestion } from '../types/harper';
import CodeMirrorEditor from './editor/CodeMirrorEditor';
import HarperSuggestionPopover from './editor/HarperSuggestionPopover';

interface PopoverState {
  isOpen: boolean;
  suggestion: HarperSuggestion | null;
  from: number;
  to: number;
}

const CodeMirrorPoc: React.FC = () => {
  const [content, setContent] = useState('This is an test of the CodeMirror editor with Harper integration. It should detect grammar errors and provide suggestions.');
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isOpen: false,
    suggestion: null,
    from: 0,
    to: 0,
  });

  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift()],
    open: popoverState.isOpen,
    onOpenChange: open => setPopoverState(prev => ({ ...prev, isOpen: open })),
  });

  const handleSuggestionClick = (suggestion: HarperSuggestion, from: number, to: number) => {
    // Create a virtual reference element at the suggestion position
    const virtualElement = {
      getBoundingClientRect: () => {
        // This is a simplified implementation - in a real scenario,
        // you'd get the actual DOM coordinates of the suggestion
        const rect = document.querySelector('.cm-content')?.getBoundingClientRect();
        if (rect) {
          return {
            width: 0,
            height: 0,
            x: rect.left + from * 8, // Rough character width estimation
            y: rect.top + Math.floor(from / 80) * 20, // Rough line height estimation
            top: rect.top + Math.floor(from / 80) * 20,
            left: rect.left + from * 8,
            right: rect.left + to * 8,
            bottom: rect.top + Math.floor(from / 80) * 20 + 20,
          };
        }
        return { width: 0, height: 0, x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0 };
      },
    };

    refs.setPositionReference(virtualElement);
    setPopoverState({
      isOpen: true,
      suggestion,
      from,
      to,
    });
  };

  const handleAcceptSuggestion = (replacementText: string) => {
    if (!popoverState.suggestion) return;

    // Replace the text in the content
    const before = content.substring(0, popoverState.from);
    const after = content.substring(popoverState.to);
    const newContent = before + replacementText + after;
    
    setContent(newContent);
    setPopoverState({
      isOpen: false,
      suggestion: null,
      from: 0,
      to: 0,
    });
  };

  const handleDismissSuggestion = () => {
    setPopoverState({
      isOpen: false,
      suggestion: null,
      from: 0,
      to: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          CodeMirror + Harper Integration POC
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <p className="text-gray-600 mb-6">
            This is a proof of concept demonstrating the integration of CodeMirror 6 with Harper grammar checking.
            The editor provides real-time grammar suggestions with clickable underlined text and floating popovers.
          </p>
          
          <div className="mb-4">
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Document Content
            </div>
            <div>
              <CodeMirrorEditor
                initialContent={content}
                onChange={setContent}
                onSuggestionClick={handleSuggestionClick}
                placeholder="Start typing to see grammar suggestions..."
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <strong>Features:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Real-time grammar checking with Harper</li>
              <li>Clickable suggestion underlines</li>
              <li>Floating suggestion popovers</li>
              <li>Markdown syntax highlighting</li>
              <li>Custom WordWise theme</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Technical Implementation
          </h3>
          <p className="text-sm text-blue-700">
            This implementation uses CodeMirror 6&apos;s state management system to track Harper suggestions
            and render them as decorations. The floating popovers are positioned using Floating UI and
            integrate with our existing WordWise suggestion system.
          </p>
        </div>

        {/* Floating Suggestion Popover */}
        {popoverState.isOpen && popoverState.suggestion && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-50"
          >
            <HarperSuggestionPopover
              suggestion={popoverState.suggestion}
              onAccept={handleAcceptSuggestion}
              onDismiss={handleDismissSuggestion}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeMirrorPoc; 