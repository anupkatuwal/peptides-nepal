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
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B635A] pointer-events-none flex items-center">
          <Search className="w-4 h-4 text-[#3F574D]" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-24 py-2.5 bg-[#F2F5F3] text-sm text-[#0A1F19] placeholder:text-[#6F877C] rounded-xl border border-[#CBD5CF] focus:outline-none focus:ring-2 focus:ring-[#0E2A23]/20 focus:border-[#0E2A23] transition-all"
          aria-label="Search peptides by name"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-[#4B635A] hover:text-[#0A1F19] hover:bg-[#E4EBE7] transition-colors"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {typeof totalResults === 'number' && value.trim() && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0E2A23] text-white">
              {totalResults} {totalResults === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
      </div>

      {/* Quick peptide filter chips */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-[#4B635A] flex items-center gap-1 shrink-0">
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
                    ? 'bg-[#0E2A23] text-white shadow-xs'
                    : 'bg-[#F2F5F3] hover:bg-[#E4EBE7] text-[#0E2A23] border border-[#CBD5CF]'
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
