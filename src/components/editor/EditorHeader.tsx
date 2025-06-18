import React from 'react';
import { TONE_EMOJI_MAP } from '../../constants/editorConstants';
import { Tone } from '../../types';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  loading: boolean;
  suggestionsCount: number;
  detectedTone: Tone | null;
  wordCount: number;
  characterCount: number;
  onToneClick?: (tone: Tone) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  loading,
  suggestionsCount,
  detectedTone,
  wordCount,
  characterCount,
  onToneClick,
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
        {suggestionsCount > 0 && (
          <div className="flex items-center space-x-1 text-red-600">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span>
              {suggestionsCount} suggestion{suggestionsCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {detectedTone && (
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer"
            title="Click to change tone"
            onClick={() => onToneClick?.(detectedTone)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToneClick?.(detectedTone);
              }
            }}
          >
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