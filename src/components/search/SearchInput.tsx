'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
// useClickOutside is implemented internally below
import { SearchResultsList } from './SearchResultsList';

// Helper hook for click outside since it wasn't in src/hooks
function useClickOutsideRef(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}

export const SearchInput = () => {
  const { query, setQuery, results, isLoading } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutsideRef(() => setIsOpen(false));

  const handleFocus = () => {
    if (query) setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  const handleSelect = () => {
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className='relative w-full max-w-md hidden md:block'
    >
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Search className='h-4 w-4 text-neutral-400' />
        </div>
        <input
          id='search-desktop'
          name='search'
          type='text'
          className='block w-full pl-10 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all'
          placeholder='Search...'
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
        />
        {query && (
          <button
            onClick={handleClear}
            className='absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query && (
        <div className='absolute mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[400px] overflow-y-auto'>
          <SearchResultsList
            results={results}
            isLoading={isLoading}
            query={query}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
};
