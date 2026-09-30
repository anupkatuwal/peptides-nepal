import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalResults?: number;
  onClear?: () => void;
  className?: string;
  suggestions?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by peptide name (e.g. BPC-157, Retatrutide, HGH, GHRP-6)...',
  totalResults,
  onClear,
  className = '',
  suggestions = ['BPC-157', 'HGH', 'Retatrutide', 'GHRP-6', 'GHRP-2', 'Ipamorelin', 'Semaglutide', 'CJC-1295']
}) => {
  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={`space-y-2.5 w-full ${className}`}>
      {/* Input container */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707E46] pointer-events-none flex items-center">
          <Search className="w-4 h-4 text-[#56652C]" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-24 py-2.5 bg-[#F4F4EA] text-sm text-[#1E230E] placeholder:text-[#8E9B6A] rounded-xl border border-[#DCE3CE] focus:outline-none focus:ring-2 focus:ring-[#3E481D]/20 focus:border-[#3E481D] transition-all"
          aria-label="Search peptides by name"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-[#707E46] hover:text-[#1E230E] hover:bg-[#EAEBD9] transition-colors"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {typeof totalResults === 'number' && value.trim() && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#3E481D] text-white">
              {totalResults} {totalResults === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
      </div>

      {/* Quick peptide filter chips */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-[#707E46] flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-700" /> Quick Search:
          </span>
          {suggestions.map((name) => {
            const isActive = value.toLowerCase() === name.toLowerCase();
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(isActive ? '' : name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#3E481D] text-white shadow-xs'
                    : 'bg-[#F4F4EA] hover:bg-[#EAEBD9] text-[#3E481D] border border-[#DCE3CE]'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
