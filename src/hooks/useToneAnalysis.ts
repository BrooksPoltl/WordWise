import { Editor } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { Tone } from '../types';
import { toneAnalyzer } from '../utils/toneAnalyzer';

interface UseToneAnalysisProps {
  editor: Editor | null;
}

export const useToneAnalysis = ({ editor }: UseToneAnalysisProps) => {
  const [detectedTone, setDetectedTone] = useState<Tone | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [isToneModalOpen, setIsToneModalOpen] = useState(false);
  const [refactoredContent, setRefactoredContent] = useState<string>('');

  // Detect tone from text
  const detectTone = useCallback((text: string) => {
    toneAnalyzer.detectTone(text, tone => {
      if (tone) {
        setDetectedTone(tone);
      }
    });
  }, []);

  // Handle tone selection and rewriting
  const handleToneSelection = useCallback(async (tone: Tone) => {
    if (!editor) return;
    
    setSelectedTone(tone);
    try {
      const rewritten = await toneAnalyzer.rewriteText(editor.getText(), tone);
      setRefactoredContent(rewritten);
      setIsToneModalOpen(true);
    } catch (error) {
      console.error('Tone rewrite failed:', error);
    }
  }, [editor]);

  // Apply the refactored content to the editor
  const applyRefactoredContent = useCallback(() => {
    if (editor && refactoredContent && selectedTone) {
      // Convert plain text with newlines to HTML preserving paragraphs and line breaks
      const htmlContent = refactoredContent
        .split(/\n{2,}/) // paragraphs separated by blank lines
        .map(paragraph => {
          // within paragraph replace single newlines with <br/>
          const withBreaks = paragraph.replace(/\n/g, '<br />');
          return `<p>${withBreaks}</p>`;
        })
        .join('');

      editor.commands.setContent(htmlContent, false);
      // Update detected tone to reflect new selection immediately
      setDetectedTone(selectedTone);
      setIsToneModalOpen(false);
      setSelectedTone(null);
    }
  }, [editor, refactoredContent, selectedTone]);

  // Close the tone modal
  const closeToneModal = useCallback(() => {
    setIsToneModalOpen(false);
    setSelectedTone(null);
  }, []);

  return {
    detectedTone,
    selectedTone,
    isToneModalOpen,
    refactoredContent,
    detectTone,
    handleToneSelection,
    applyRefactoredContent,
    closeToneModal,
  };
}; 