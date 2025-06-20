import React, { useEffect, useState } from 'react';

interface UpdateContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContext: string) => void;
  initialContext: string;
  loading: boolean;
}

const UpdateContextModal: React.FC<UpdateContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContext,
  loading,
}) => {
  const [context, setContext] = useState(initialContext);

  useEffect(() => {
    setContext(initialContext);
  }, [initialContext]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(context);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Update Document Context</h2>
        <p className="text-sm text-gray-500 mb-4">
          Provide additional context for this document to improve AI suggestions. For example, you could describe the target audience, the purpose of the document, or any other relevant information.
        </p>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter document context..."
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateContextModal; 