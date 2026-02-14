import axios from 'axios';
import fs from 'fs';

const BASE_URL =
  'https://social-media-be-400174736012.asia-southeast2.run.app/api';

async function testSearch() {
  try {
    console.log('Testing search API...');
    const endpoints = ['/users?search=jon', '/users/search?q=jon'];

    let logOutput = '';

    for (const endpoint of endpoints) {
      logOutput += `\n\nTrying: ${endpoint}\n`;
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        logOutput += `Status: ${response.status}\n`;
        logOutput += `Data: ${JSON.stringify(response.data, null, 2)}\n`;
      } catch (error: any) {
        logOutput += `Error: ${error.message}\n`;
        if (error.response) {
          logOutput += `Response Status: ${error.response.status}\n`;
          logOutput += `Response Data: ${JSON.stringify(error.response.data)}\n`;
        }
      }
    }

    fs.writeFileSync('search-debug-log.txt', logOutput);
    console.log('Log written to search-debug-log.txt');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testSearch();
