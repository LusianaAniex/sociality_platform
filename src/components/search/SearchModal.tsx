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
  DialogDescription,
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
  console.log('SearchModal state:', { query, results, isLoading });
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          className='md:hidden hover:text-white transition-colors'
        >
          <Search className='w-5 h-5 text-neutral-400' />
        </Button>
      </DialogTrigger>

      <DialogContent
        className='fixed inset-0 top-0 left-0 w-screen h-screen max-w-none rounded-none border-none bg-black p-0 gap-0 z-100 flex flex-col translate-x-0 translate-y-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0'
        showCloseButton={false}
      >
        <DialogHeader className='sr-only'>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search for users by name or username
          </DialogDescription>
        </DialogHeader>

        {/* Header */}
        <div className='flex shrink-0 items-center gap-3 p-4 border-b border-neutral-800 bg-black'>
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='h-4 w-4 text-neutral-400' />
            </div>
            <input
              id='search-mobile'
              name='search'
              type='text'
              className='block w-full pl-10 pr-10 py-2.5 bg-neutral-900 border-none rounded-full text-base text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-800 transition-all'
              placeholder='Search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              autoComplete='off'
            />
            {query && (
              <button
                onClick={handleClear}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white'
              >
                <div className='bg-neutral-800 rounded-full p-0.5'>
                  <X className='h-3 w-3' />
                </div>
              </button>
            )}
          </div>

          <DialogClose asChild>
            <button className='text-white p-2 hover:bg-neutral-900 rounded-full transition-colors'>
              <X className='w-6 h-6' />
            </button>
          </DialogClose>
        </div>

        {/* Results Area */}
        <div className='flex-1 overflow-y-auto bg-black min-h-0'>
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
