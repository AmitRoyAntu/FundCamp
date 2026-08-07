import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search campaigns by title, description, or department...',
  onClear,
  id = 'search-bar'
}) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
        <Search className="w-5 h-5" />
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] shadow-xs hover:border-gray-300 transition-all duration-200"
      />
      {value && (
        <button
          onClick={onClear || (() => onChange(''))}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
