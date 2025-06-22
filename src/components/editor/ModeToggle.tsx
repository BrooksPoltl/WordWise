import React from 'react';
import { useEditorStore } from '../../store/editor/editor.store';

const ModeToggle: React.FC = () => {
  const { mode, toggleMode } = useEditorStore();

  return (
    <div className="flex items-center space-x-2">
      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          mode === 'markdown' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Markdown
      </span>
      <button
        type="button"
        onClick={toggleMode}
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          mode === 'wysiwyg' ? 'bg-blue-600' : 'bg-gray-400'
        }`}
        aria-pressed={mode === 'wysiwyg'}
      >
        <span className="sr-only">Use WYSIWYG mode</span>
        <span
          aria-hidden="true"
          className={`${
            mode === 'wysiwyg' ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
        />
      </button>
      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          mode === 'wysiwyg' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        WYSIWYG
      </span>
    </div>
  );
};

export default ModeToggle; 