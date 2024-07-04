chrome.runtime.onInstalled.addListener(function(details) {
  const defaultSites = ['www.facebook.com', 'www.youtube.com', 'www.instagram.com', 'www.tiktok.com'];

  chrome.storage.local.get(['scrollLockPages'], function(result) {
    if (!result.scrollLockPages || result.scrollLockPages.length === 0 || details.reason === "install") {
      chrome.storage.local.set({ scrollLockPages: defaultSites }, function() {
        console.log('Default sites set:', defaultSites);
      });
    }
  });
});
