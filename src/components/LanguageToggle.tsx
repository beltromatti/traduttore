import React from 'react';

interface LanguageToggleProps {
  isItalianToSpanish: boolean;
  onToggle: () => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  isItalianToSpanish,
  onToggle,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-400">Italiano</span>
      <button
        onClick={onToggle}
        className={
          `relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out
          ${isItalianToSpanish ? 'bg-blue-600' : 'bg-gray-700'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`
        }
      >
        <span className="sr-only">Toggle language direction</span>
        <span
          className={
            `inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${isItalianToSpanish ? 'translate-x-6' : 'translate-x-1'}`
          }
        />
      </button>
      <span className="text-sm font-medium text-gray-400">Spagnolo</span>
    </div>
  );
};

export default LanguageToggle;
