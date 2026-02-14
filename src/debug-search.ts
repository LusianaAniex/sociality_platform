import axios from 'axios';
import fs from 'fs';

const BASE_URL =
  'https://social-media-be-400174736012.asia-southeast2.run.app/api';

async function testEndpoints() {
  try {
    console.log('Refining Saved Post Endpoint Probe 2...');
    let username = 'testuser';

    try {
      const feed = await axios.get(`${BASE_URL}/posts?limit=1`);
      if (feed.data?.data?.data?.[0]?.author?.username) {
        username = feed.data.data.data[0].author.username;
      }
      console.log('Using username:', username);
    } catch (e) {
      console.log('Failed to get username, using default:', username);
    }

    const endpoints = [
      { method: 'GET', url: `/posts?type=saved` },
      { method: 'GET', url: `/posts?isSaved=true` },
      { method: 'GET', url: `/users/${username}/bookmarks` },
      { method: 'GET', url: `/bookmarks` },
      { method: 'GET', url: `/saved` },
      { method: 'GET', url: `/me/saved` },
    ];

    let logOutput = '';

    for (const ep of endpoints) {
      logOutput += `\n\nTrying: ${ep.method} ${ep.url}\n`;
      try {
        const response = await axios({
          method: ep.method,
          url: `${BASE_URL}${ep.url}`,
          validateStatus: () => true,
        });
        logOutput += `Status: ${response.status}\n`;
        if (response.status !== 404) {
          logOutput += `Data Preview: ${JSON.stringify(response.data).substring(0, 200)}\n`;
        }
      } catch (error: any) {
        logOutput += `Error: ${error.message}\n`;
      }
    }

    fs.writeFileSync('saved-posts-debug-2.txt', logOutput);
    console.log('Log written to saved-posts-debug-2.txt');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testEndpoints();
