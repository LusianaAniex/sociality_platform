/**
 * Feed-related TypeScript type definitions
 * Centralized types for the feed feature
 */

import { Post } from '@/features/post/types';

/**
 * Pagination metadata returned by API
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  lastPage?: number; // Alias for totalPages, used in some components
}

/**
 * Feed API response structure
 */
export interface FeedResponse {
  items: Post[];
  pagination: Pagination;
  posts?: Post[];
  data?: Post[];
}

/**
 * Explore feed API response structure
 * Uses the same structure as FeedResponse
 */
export interface ExploreResponse {
  items: Post[];
  pagination: Pagination;
}
