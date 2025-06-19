import { Editor } from '@tiptap/react';
import React from 'react';
import { TONE_OPTIONS } from '../../constants/editorConstants';
import { Tone } from '../../types';
import { SuggestionToggles } from './SuggestionToggles';

interface EditorToolbarProps {
  editor: Editor;
  detectedTone: Tone | null;
  selectedTone: Tone | null;
  onToneSelection: (tone: Tone) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  detectedTone,
  selectedTone,
  onToneSelection,
}) => (
    <div>
      {/* Formatting Toolbar */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm font-medium italic transition-colors ${
            editor.isActive('italic')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded text-sm font-medium line-through transition-colors ${
            editor.isActive('strike')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          S
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('paragraph')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          P
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          1. List
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <SuggestionToggles />
      </div>

      {/* Tone selection dropdown */}
      <div className="mt-2">
        <label htmlFor="tone-select" className="mr-2 text-sm text-gray-600">
          Tone:
          <select
            id="tone-select"
            className="ml-2 border border-gray-300 rounded p-1 text-sm"
            value={(selectedTone || detectedTone || '') as string}
            onChange={e => onToneSelection(e.target.value as Tone)}
          >
            <option value="" disabled>
              Select tone
            </option>
            {TONE_OPTIONS.map(tone => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
);

export default EditorToolbar; 