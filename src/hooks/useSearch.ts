import { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { axiosInstance } from '@/lib/axios';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const debouncedSearch = debounce(async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/users/search', {
          params: { q: query, limit: 10 },
        });

        // Extract users from the nested response structure
        const users = response.data?.data?.users || [];
        setResults(users);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [query]);

  return { query, setQuery, results, isLoading };
};
