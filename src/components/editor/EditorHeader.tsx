import React from 'react';
import { TONE_EMOJI_MAP } from '../../constants/editorConstants';
import { Tone } from '../../types';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  loading: boolean;
  detectedTone: Tone | null;
  wordCount: number;
  characterCount: number;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  loading,
  detectedTone,
  wordCount,
  characterCount,
}) => (
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
        <span>{wordCount} words</span>
        <span>{characterCount} characters</span>
      </div>
    </div>
);

export default EditorHeader; 