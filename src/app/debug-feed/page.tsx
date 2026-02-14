'use client';

import { useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/useRedux';

export default function DebugFeedPage() {
  const [results, setResults] = useState<any[]>([]);
  const [followResult, setFollowResult] = useState<any>(null);
  const [targetUserId, setTargetUserId] = useState('1'); // Default to ID 1 or change as needed

  // Use Redux to get the current user
  const { user } = useAppSelector((state) => state.auth);
  const [customUserId, setCustomUserId] = useState('');

  const testEndpoints = async () => {
    // Prefer input ID, then Redux ID, then default '1'
    const userId = customUserId || user?.id || '1';
    console.log('Testing with User ID:', userId);

    const scenarios = [
      // Common patterns
      { name: '/feed (Expected Correct Endpoint)', url: '/feed', params: {} },
      {
        name: '/feed type=following',
        url: '/feed',
        params: { type: 'following' },
      },
      { name: '/feed type=user', url: '/feed', params: { type: 'user' } },
      {
        name: '/feed type=followed',
        url: '/feed',
        params: { type: 'followed' },
      },
      { name: '/posts (No params - Explore?)', url: '/posts', params: {} },

      // User specific feed patterns
      {
        name: `/users/${userId}/feed`,
        url: `/users/${userId}/feed`,
        params: {},
      },
      {
        name: `/users/${userId}/posts`,
        url: `/users/${userId}/posts`,
        params: {},
      },
      {
        name: `/users/${userId}/following`,
        url: `/users/${userId}/following`,
        params: {},
      }, // Might be list of users

      // Query Param patterns
      {
        name: '/posts?type=following',
        url: '/posts',
        params: { type: 'following' },
      },
      {
        name: '/posts?type=followed',
        url: '/posts',
        params: { type: 'followed' },
      },
      {
        name: '/posts?filter=following',
        url: '/posts',
        params: { filter: 'following' },
      },
      {
        name: `/posts?userId=${userId}&type=following`,
        url: '/posts',
        params: { userId, type: 'following' },
      },

      // Follower specific
      {
        name: `/users/${userId}/following-posts`,
        url: `/users/${userId}/following-posts`,
        params: {},
      },
    ];

    const newResults = [];

    for (const scenario of scenarios) {
      try {
        const res = await axiosInstance.get(scenario.url, {
          params: scenario.params,
        });

        // Analyze response to guess if it's a feed or list of users
        // Analyze response
        const data = res.data?.data || res.data;
        const items = Array.isArray(data)
          ? data
          : data?.items || data?.posts || data?.users || [];
        const firstItem = items[0];
        const itemType = firstItem?.username
          ? 'user'
          : firstItem?.caption
            ? 'post'
            : 'unknown';

        newResults.push({
          scenario: scenario.name,
          status: res.status,
          itemCount: items.length,
          itemType,
          data: res.data,
        });
      } catch (err: any) {
        newResults.push({
          scenario: scenario.name,
          error: err.message,
          status: err.response?.status,
        });
      }
    }
    setResults(newResults);
  };

  const testFollow = async () => {
    try {
      const res = await axiosInstance.post(`/users/${targetUserId}/follow`);
      setFollowResult({ action: 'follow', status: res.status, data: res.data });
    } catch (err: any) {
      setFollowResult({
        action: 'follow',
        error: err.message,
        response: err.response?.data,
      });
    }
  };

  // Check Following Logic
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [currentUserIdForFollowing, setCurrentUserIdForFollowing] = useState<
    string | null
  >(null);

  const checkFollowing = async () => {
    // Prefer input ID, then Redux ID, then default '1'
    let userId = customUserId || user?.id;
    console.log('checkFollowing - Initial userId:', userId);

    if (!userId) {
      // Fallback to fetching me
      try {
        const meRes = await axiosInstance.get('/users/me');
        userId = meRes.data?.id;
        console.log('Fetched ME id:', userId);
      } catch (e) {
        console.error('Failed to fetch ME', e);
      }
    }

    if (!userId) {
      setFollowingList([
        { error: 'Could not determine User ID', status: 'N/A' },
      ]);
      setCurrentUserIdForFollowing(null);
      return;
    }
    setCurrentUserIdForFollowing(userId);

    const endpointsToTry = [
      `/me/following`, // Confirmed working
      `/users/${userId}/following`,
      `/users/${userId}/followings`,
      `/users/${userId}/followed`,
      `/following`,
    ];

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const res = await axiosInstance.get(endpoint);
        console.log(`Success with ${endpoint}`);
        const users = res.data?.data || res.data || [];

        // If we get an object that looks like { users: [...] }
        const list = Array.isArray(users)
          ? users
          : users.users || users.data || [];

        setFollowingList(
          list.map((u: any) => ({ ...u, source_endpoint: endpoint }))
        );
        return; // Stop after first success
      } catch (e: any) {
        console.log(`Failed ${endpoint}: ${e.response?.status}`);
      }
    }

    // If all failed
    setFollowingList([
      { error: 'All endpoints failed. Check console.', status: 404 },
    ]);
  };

  const testUnfollow = async () => {
    const endpoints = [
      { method: 'DELETE', url: `/users/${targetUserId}/unfollow` },
      { method: 'POST', url: `/users/${targetUserId}/unfollow` },
      { method: 'DELETE', url: `/users/${targetUserId}/follow` },
      {
        method: 'POST',
        url: `/users/${targetUserId}/follow`,
        params: { action: 'unfollow' },
      },
    ];

    for (const ep of endpoints) {
      try {
        console.log(`Testing Unfollow: ${ep.method} ${ep.url}`);
        let res;
        if (ep.method === 'DELETE') {
          res = await axiosInstance.delete(ep.url);
        } else {
          res = await axiosInstance.post(ep.url, ep.params);
        }

        setFollowResult({
          action: `unfollow (${ep.method} ${ep.url})`,
          status: res.status,
          data: res.data,
          success: true,
        });
        return; // Stop on first success
      } catch (err: any) {
        console.log(`Failed ${ep.method} ${ep.url}: ${err.response?.status}`);
      }
    }

    setFollowResult({
      action: 'unfollow (ALL FAILED)',
      error: 'All methods failed',
      status: 404,
    });
  };

  return (
    <div className='p-8 text-black dark:text-white bg-white dark:bg-black min-h-screen'>
      <h1 className='text-2xl font-bold mb-4'>Feed API & Follow Debugger</h1>

      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-2'>1. Test Feed Filtering</h2>
        <Button onClick={testEndpoints}>Run Feed Scenarios</Button>
        <div className='mt-4 grid gap-4'>
          {results.map((res, i) => (
            <div
              key={i}
              className='border p-4 rounded text-sm bg-gray-100 dark:bg-gray-800'
            >
              <div className='font-bold'>{res.scenario}</div>
              {res.error ? (
                <div className='text-red-500'>
                  Error: {res.error} (Status: {res.status})
                </div>
              ) : (
                <>
                  <div>Status: {res.status}</div>
                  <div className='font-bold text-blue-600'>{res.note}</div>
                  <div>Items Received: {res.itemCount}</div>
                  <pre className='mt-2 p-2 bg-black text-green-400 text-xs overflow-auto max-h-40'>
                    {JSON.stringify(res.data, null, 2)}
                  </pre>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='mb-8 border-t pt-8'>
        <h2 className='text-xl font-semibold mb-2'>2. Test Follow/Unfollow</h2>
        <div className='flex gap-4 items-center mb-4'>
          <label>Target User ID:</label>
          <input
            type='text'
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className='border p-1 rounded text-black'
          />
        </div>
        <div className='flex gap-4'>
          <Button onClick={testFollow}>Test Follow</Button>
          <Button onClick={testUnfollow} variant='destructive'>
            Test Unfollow
          </Button>
        </div>
        {followResult && (
          <div className='mt-4 border p-4 rounded text-sm bg-gray-100 dark:bg-gray-800'>
            <div className='font-bold'>Last Action: {followResult.action}</div>
            <pre className='mt-2 p-2 bg-black text-green-400 text-xs overflow-auto'>
              {JSON.stringify(followResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className='mb-8 border-t pt-8'>
        <h2 className='text-xl font-semibold mb-2'>3. Check Who I Follow</h2>
        <div className='mb-2 text-sm text-gray-500'>
          Using User ID:{' '}
          <strong>{currentUserIdForFollowing || 'Not detected yet'}</strong>
        </div>
        <Button onClick={checkFollowing}>Load Following List</Button>
        <div className='mt-4 grid gap-2'>
          {followingList.map((f, i) => (
            <div
              key={i}
              className='border p-2 rounded bg-gray-100 dark:bg-gray-800 flex flex-col gap-2'
            >
              <div className='flex justify-between items-center'>
                <span>
                  {f.username || 'Unknown User'} (ID: {f.id})
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={async () => {
                    try {
                      const res = await axiosInstance.get(
                        `/users/${f.id}/posts`
                      );
                      const posts =
                        res.data?.data?.posts ||
                        res.data?.data ||
                        res.data ||
                        [];
                      alert(
                        `User ${f.username} has ${Array.isArray(posts) ? posts.length : 0} posts.`
                      );
                    } catch (e: any) {
                      alert(`Failed to fetch posts: ${e.message}`);
                    }
                  }}
                >
                  Check Posts
                </Button>
              </div>
              <pre className='text-xs'>{JSON.stringify(f, null, 0)}</pre>
            </div>
          ))}
          {followingList.length === 0 && <p>List empty or not loaded.</p>}
        </div>
      </div>
    </div>
  );
}
