import { Editor } from '@tiptap/react';
import React from 'react';
import { Tone } from '../../types';
import { SuggestionToggles } from './SuggestionToggles';

interface EditorToolbarProps {
  editor: Editor;
  detectedTone: Tone | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  detectedTone,
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

    </div>
);

export default EditorToolbar; 