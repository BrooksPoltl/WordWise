import React from 'react';
import { Tone } from '../../types';

interface ToneModalProps {
  isOpen: boolean;
  selectedTone: Tone | null;
  refactoredContent: string;
  onApply: () => void;
  onClose: () => void;
}

const ToneModal: React.FC<ToneModalProps> = ({
  isOpen,
  selectedTone,
  refactoredContent,
  onApply,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <h2 className="text-lg font-semibold mb-4">
          Preview {selectedTone} Tone
        </h2>
        <div className="h-96 overflow-y-auto border border-gray-200 rounded p-4 mb-4 whitespace-pre-wrap">
          {refactoredContent}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={onApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToneModal; 