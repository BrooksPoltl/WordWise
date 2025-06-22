import React from 'react';

interface EditorHeaderProps {
  onSave?: () => void;
  onExport?: () => void;
  title?: string;
  onTitleChange?: (title: string) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onSave,
  onExport,
  title,
  onTitleChange,
}) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
    <div className="flex items-center space-x-4">
      {onTitleChange ? (
        <input
          type="text"
          value={title || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          placeholder="Document title..."
        />
      ) : (
        <h1 className="text-xl font-semibold text-gray-900">
          {title || 'Untitled Document'}
        </h1>
      )}
    </div>

    <div className="flex items-center space-x-3">
      {/* Save Button */}
      {onSave && (
        <button
          type="button"
          onClick={onSave}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save
        </button>
      )}

      {/* Export Button */}
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Export
        </button>
      )}
    </div>
  </div>
); 