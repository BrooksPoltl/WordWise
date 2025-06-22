import { EditorView } from '@codemirror/view';
import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import { toggleHeader, toggleMark } from '../../utils/editorCommands';
import FormattingButtons from './FormattingButtons';

interface ResponsiveToolbarProps {
    editorView: EditorView | null;
}

const ResponsiveToolbar: React.FC<ResponsiveToolbarProps> = ({ editorView }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleBold = () => {
        console.log('[ResponsiveToolbar] handleBold: editorView:', editorView);
        console.log('[ResponsiveToolbar] handleBold: editorView.state exists:', !!editorView?.state);
        toggleMark(editorView, '**');
        setIsMobileMenuOpen(false);
    };
    const handleItalic = () => {
        console.log('[ResponsiveToolbar] handleItalic: editorView:', editorView);
        console.log('[ResponsiveToolbar] handleItalic: editorView.state exists:', !!editorView?.state);
        toggleMark(editorView, '*');
        setIsMobileMenuOpen(false);
    };
    const handleH1 = () => {
        console.log('[ResponsiveToolbar] handleH1: editorView:', editorView);
        console.log('[ResponsiveToolbar] handleH1: editorView.state exists:', !!editorView?.state);
        toggleHeader(editorView, 1);
        setIsMobileMenuOpen(false);
    };
    const handleH2 = () => {
        console.log('[ResponsiveToolbar] handleH2: editorView:', editorView);
        console.log('[ResponsiveToolbar] handleH2: editorView.state exists:', !!editorView?.state);
        toggleHeader(editorView, 2);
        setIsMobileMenuOpen(false);
    };
    const handleH3 = () => {
        console.log('[ResponsiveToolbar] handleH3: editorView:', editorView);
        console.log('[ResponsiveToolbar] handleH3: editorView.state exists:', !!editorView?.state);
        toggleHeader(editorView, 3);
        setIsMobileMenuOpen(false);
    };

  return (
    <div className="bg-gray-100 p-2 rounded-t-md border-b flex justify-between items-center relative">
      <div className="hidden md:flex">
        <FormattingButtons
            onBold={handleBold}
            onItalic={handleItalic}
            onH1={handleH1}
            onH2={handleH2}
            onH3={handleH3}
        />
      </div>
      
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-200"
          aria-label="Toggle formatting menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-100 p-2 shadow-md z-10">
            <FormattingButtons
                onBold={handleBold}
                onItalic={handleItalic}
                onH1={handleH1}
                onH2={handleH2}
                onH3={handleH3}
            />
        </div>
      )}
    </div>
  );
};

export default ResponsiveToolbar; 