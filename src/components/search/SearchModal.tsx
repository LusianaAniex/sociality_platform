'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { SearchResultsList } from './SearchResultsList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const SearchModal = () => {
  const { query, setQuery, results, isLoading } = useSearch();
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    setQuery('');
  };

  const handleSelect = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className='md:hidden hover:text-white transition-colors'>
          <Search className='w-5 h-5 text-neutral-400' />
        </button>
      </DialogTrigger>
      {/* 
        Full screen modal customization: 
        inset-0, w-screen, h-screen, max-w-none, bg-black, border-none
      */}
      <DialogContent
        className='fixed inset-0 w-screen h-screen max-w-none rounded-none border-none bg-black p-0 gap-0 z-100'
        showCloseButton={false} // We'll add our own close button in the header
      >
        <DialogHeader className='sr-only'>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        {/* Custom Header with Search Bar and Close Button */}
        <div className='flex items-center gap-3 p-4 border-b border-neutral-900'>
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='h-4 w-4 text-neutral-400' />
            </div>
            <input
              id='search-mobile'
              name='search'
              type='text'
              className='block w-full pl-10 pr-10 py-3 bg-neutral-900 border border-neutral-800 rounded-full text-base text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-700 transition-all'
              placeholder='Search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
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

          <DialogClose asChild>
            <button className='text-white p-2'>
              <X className='w-6 h-6' />
            </button>
          </DialogClose>
        </div>

        {/* Results Area */}
        <div className='flex-1 overflow-y-auto p-2'>
          <SearchResultsList
            results={results}
            isLoading={isLoading}
            query={query}
            onSelect={handleSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
