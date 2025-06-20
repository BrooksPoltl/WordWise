import React from 'react';
import { TONE_EMOJI_MAP } from '../../constants/editorConstants';
import { useAdvisoryStore } from '../../store/advisory';
import { Tone } from '../../types';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  loading: boolean;
  detectedTone: Tone | null;
  documentContent: string;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  loading,
  detectedTone,
  documentContent,
}) => {
  const { requestSuggestions, isLoading: advisoryLoading } = useAdvisoryStore();

  const handleGetAdvice = async () => {
    if (!documentContent.trim()) {
      return;
    }
    await requestSuggestions(documentContent);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <input
        type="text"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder="Document title..."
        className="text-2xl font-bold border-none outline-none bg-transparent flex-1 mr-4"
        disabled={loading}
      />
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        {loading && (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
            <span>Saving...</span>
          </div>
        )}
        {detectedTone && (
          <div className="flex items-center space-x-1">
            <span>{TONE_EMOJI_MAP[detectedTone]}</span>
            <span>{detectedTone}</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleGetAdvice}
          disabled={advisoryLoading || !documentContent.trim()}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {advisoryLoading ? 'Analyzing...' : 'Get Advice'}
        </button>
      </div>
    </div>
  );
};

export default EditorHeader; 