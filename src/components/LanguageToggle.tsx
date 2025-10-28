import React from 'react';

interface LanguageToggleProps {
  isItalianToSpanish: boolean;
  onToggle: () => void;
}

const options = [
  { label: 'Italian → Spanish', value: true },
  { label: 'Spanish → Italian', value: false },
] as const;

const LanguageToggle: React.FC<LanguageToggleProps> = ({ isItalianToSpanish, onToggle }) => {
  return (
    <div className="flex flex-col items-center gap-2 text-[11px] sm:flex-row sm:gap-3 sm:text-sm">
      <div className="relative inline-flex rounded-full bg-white/5 p-1 text-neutral-200 ring-1 ring-white/10">
        {options.map((option) => {
          const isActive = isItalianToSpanish === option.value;
          const handleClick = () => {
            if (!isActive) {
              onToggle();
            }
          };

          return (
            <button
              key={option.label}
              type="button"
              onClick={handleClick}
              className={`relative whitespace-nowrap rounded-full px-4 py-1 font-medium transition
              ${isActive ? 'bg-white text-neutral-900 shadow-lg shadow-black/30' : 'text-neutral-300/80 hover:text-white'}`}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <span className="text-neutral-400">Direction</span>
    </div>
  );
};

export default LanguageToggle;
