chrome.runtime.onInstalled.addListener(function(details) {
  // Default sites to block
  const defaultSites = ['facebook.com', 'youtube.com', 'instagram.com', 'tiktok.com'];

  // Set default sites into storage if not already set or on installation/update
  chrome.storage.local.get(['scrollLockPages'], function(result) {
    if (!result.scrollLockPages || result.scrollLockPages.length === 0 || details.reason === "install") {
      chrome.storage.local.set({ scrollLockPages: defaultSites }, function() {
        console.log('Default sites set:', defaultSites);
      });
    }
  });
});

chrome.webNavigation.onCompleted.addListener(function(details) {
  chrome.storage.local.get(['scrollLockPages'], function(result) {
    const pages = result.scrollLockPages || [];
    const url = new URL(details.url);
    if (pages.some(page => url.hostname.includes(page))) {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content.js']
      });
    }
  });
});
