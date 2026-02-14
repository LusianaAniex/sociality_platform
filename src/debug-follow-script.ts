import axios from 'axios';

const BASE_URL =
  'https://social-media-be-400174736012.asia-southeast2.run.app/api';
const TOKEN = localStorage.getItem('token'); // Will need to be run in context where localstorage works or I need to manually get a token?
// Actually since I can't easily run this in browser context from here without a complicated setup,
// I will just make it a component I can 'render' or I will use the browser tool if I had it.
// Since I don't have a browser tool, I will make this a temporary component file I can swap into the main page
// OR I can use the node script if I can get a token.
// I'll try to use the patterns I've seen.

// But wait, I can just use the existing debugging pattern:
// 1. Create a component that runs on mount.
// 2. Add it to a page I can visit.

console.log('Use key for manual testing if needed');
