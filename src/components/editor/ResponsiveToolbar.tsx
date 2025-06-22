import { EditorView } from '@codemirror/view';
import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import { TONE_EMOJI_MAP } from '../../constants/editorConstants';
import { Tone } from '../../types';
import {
  insertCodeBlock,
  insertTable,
  toggleHeader,
  toggleInlineCode,
  toggleLink,
  toggleMark,
} from '../../utils/editorCommands';
import FormattingButtons from './FormattingButtons';

interface ResponsiveToolbarProps {
    editorView: EditorView | null;
    detectedTone?: Tone | null;
}

const ResponsiveToolbar: React.FC<ResponsiveToolbarProps> = ({ 
  editorView, 
  detectedTone 
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleBold = () => {
        toggleMark(editorView, '**');
        setIsMobileMenuOpen(false);
    };
    const handleItalic = () => {
        toggleMark(editorView, '*');
        setIsMobileMenuOpen(false);
    };
    const handleH1 = () => {
        toggleHeader(editorView, 1);
        setIsMobileMenuOpen(false);
    };
    const handleH2 = () => {
        toggleHeader(editorView, 2);
        setIsMobileMenuOpen(false);
    };
    const handleH3 = () => {
        toggleHeader(editorView, 3);
        setIsMobileMenuOpen(false);
    };

    const handleLink = () => {
        toggleLink(editorView);
        setIsMobileMenuOpen(false);
    };

    const handleTable = () => {
        insertTable(editorView);
        setIsMobileMenuOpen(false);
    };

    const handleInlineCode = () => {
        toggleInlineCode(editorView);
        setIsMobileMenuOpen(false);
    };

    const handleCodeBlock = () => {
        insertCodeBlock(editorView);
        setIsMobileMenuOpen(false);
    };

  return (
    <div className="bg-gray-100 p-2 rounded-t-md border-b flex justify-between items-center relative">
      <div>
        <div className="hidden md:flex">
          <FormattingButtons
              onBold={handleBold}
              onItalic={handleItalic}
              onH1={handleH1}
              onH2={handleH2}
              onH3={handleH3}
              onLink={handleLink}
              onTable={handleTable}
              onInlineCode={handleInlineCode}
              onCodeBlock={handleCodeBlock}
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
      </div>

      <div>
        <div className="flex items-center space-x-3">
          {detectedTone && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>{TONE_EMOJI_MAP[detectedTone]}</span>
              <span>{detectedTone}</span>
            </div>
          )}
          <span className="text-sm font-medium text-gray-500">Markdown</span>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-100 p-2 shadow-md z-10">
            <FormattingButtons
                onBold={handleBold}
                onItalic={handleItalic}
                onH1={handleH1}
                onH2={handleH2}
                onH3={handleH3}
                onLink={handleLink}
                onTable={handleTable}
                onInlineCode={handleInlineCode}
                onCodeBlock={handleCodeBlock}
            />
        </div>
      )}
    </div>
  );
};

export default ResponsiveToolbar; 