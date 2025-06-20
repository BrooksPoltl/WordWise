import React, { useEffect, useRef, useState } from 'react';
import { DOCUMENT_TYPES_BY_ROLE } from '../../constants/documentConstants';

interface DocumentSettingsBarProps {
  onOpenContextModal: () => void;
  currentDocumentType?: string;
  userRole?: string;
  onDocumentTypeChange: (newType: string) => void;
}

const DocumentSettingsBar: React.FC<DocumentSettingsBarProps> = ({
  onOpenContextModal,
  currentDocumentType,
  userRole,
  onDocumentTypeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getAvailableTypes = () => {
    let allTypes: string[] = [];
    
    if (userRole === 'Product Manager') {
      allTypes = DOCUMENT_TYPES_BY_ROLE['Product Manager'].map(type => type.name);
    } else if (userRole === 'Software Engineer') {
      allTypes = DOCUMENT_TYPES_BY_ROLE['Software Engineer'].map(type => type.name);
    }
    
    // Filter out the current document type
    return allTypes.filter(type => type !== currentDocumentType);
  };

  const availableTypes = getAvailableTypes();

  const handleSelect = async (type: string) => {
    setIsOpen(false);
    
    try {
      await onDocumentTypeChange(type);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center space-x-4 py-2">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          {currentDocumentType || 'Select Type'}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {isOpen && availableTypes.length > 0 && (
          <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            {availableTypes.map((type: string) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSelect(type)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
              >
                {type}
              </button>
            ))}
          </div>
        )}
        {isOpen && availableTypes.length === 0 && (
          <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="px-4 py-2 text-sm text-gray-500">
              No other types available
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenContextModal}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Context
      </button>
    </div>
  );
};

export default DocumentSettingsBar; 