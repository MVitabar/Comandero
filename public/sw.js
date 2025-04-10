// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  console.log('Service Worker fetching.');
});

self.addEventListener('message', (event) => {
  console.log('Service Worker message received.');
});

self.addEventListener('push', (event) => {
  console.log('Service Worker push received.');
});
