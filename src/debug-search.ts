import axios from 'axios';
import fs from 'fs';

const BASE_URL =
  'https://social-media-be-400174736012.asia-southeast2.run.app/api';

async function testEndpoints() {
  try {
    console.log('Probing Likes and Follow Endpoints...');

    // 1. Get a valid post ID and User ID first
    let postId = '';
    let targetUsername = '';

    try {
      const feed = await axios.get(`${BASE_URL}/posts?limit=1`);
      if (feed.data?.data?.data?.[0]) {
        postId = feed.data.data.data[0].id;
        targetUsername = feed.data.data.data[0].author.username;
        console.log('Using Post ID:', postId);
        console.log('Using Target Username:', targetUsername);
      }
    } catch (e) {
      console.log('Failed to fetch feed for setup.');
    }

    if (!postId) {
      console.log('No post ID found, cannot probe likes.');
      return;
    }

    const endpoints = [
      // Likes
      { method: 'GET', url: `/posts/${postId}/likes` },
      { method: 'GET', url: `/posts/${postId}/liked_by` },
      { method: 'GET', url: `/likes?postId=${postId}` },

      // Follow
      { method: 'POST', url: `/users/${targetUsername}/follow` },
      { method: 'DELETE', url: `/users/${targetUsername}/unfollow` }, // Guessing
      { method: 'DELETE', url: `/users/${targetUsername}/follow` }, // Guessing
    ];

    let logOutput = '';

    for (const ep of endpoints) {
      logOutput += `\n\nTrying: ${ep.method} ${ep.url}\n`;
      console.log(`Trying: ${ep.method} ${ep.url}`);
      try {
        const response = await axios({
          method: ep.method,
          url: `${BASE_URL}${ep.url}`,
          validateStatus: () => true,
        });
        logOutput += `Status: ${response.status}\n`;
        console.log(`Status: ${response.status}`);
        if (response.status !== 404) {
          const dataPreview = JSON.stringify(response.data).substring(0, 500);
          logOutput += `Data: ${dataPreview}\n`;
          console.log(`Data: ${dataPreview}`);
        }
      } catch (error: any) {
        logOutput += `Error: ${error.message}\n`;
        console.log(`Error: ${error.message}`);
      }
    }

    fs.writeFileSync('likes-debug.txt', logOutput);
    console.log('Log written to likes-debug.txt');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testEndpoints();
