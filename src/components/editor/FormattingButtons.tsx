import { Bold, Heading1, Heading2, Heading3, Italic } from 'lucide-react';
import React from 'react';

interface FormattingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  'aria-label': string;
}

const FormattingButton: React.FC<FormattingButtonProps> = ({ onClick, children, 'aria-label': ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-md hover:bg-gray-200"
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

interface FormattingButtonsProps {
    onBold: () => void;
    onItalic: () => void;
    onH1: () => void;
    onH2: () => void;
    onH3: () => void;
}

const FormattingButtons: React.FC<FormattingButtonsProps> = ({ onBold, onItalic, onH1, onH2, onH3 }) => (
  <div className="flex items-center space-x-1">
    <FormattingButton onClick={onBold} aria-label="Bold">
      <Bold className="w-5 h-5" />
    </FormattingButton>
    <FormattingButton onClick={onItalic} aria-label="Italic">
      <Italic className="w-5 h-5" />
    </FormattingButton>
    <FormattingButton onClick={onH1} aria-label="Heading 1">
      <Heading1 className="w-5 h-5" />
    </FormattingButton>
    <FormattingButton onClick={onH2} aria-label="Heading 2">
        <Heading2 className="w-5 h-5" />
    </FormattingButton>
    <FormattingButton onClick={onH3} aria-label="Heading 3">
        <Heading3 className="w-5 h-5" />
    </FormattingButton>
  </div>
);

export default FormattingButtons; 