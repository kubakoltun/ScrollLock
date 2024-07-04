function disableScroll() {
  window.addEventListener('scroll', function(event) {
      event.preventDefault();
      window.scrollTo(0, 0);
  }, { passive: false });
}

async function init() {
  const pages = await getPagesFromStorage();
  const currentHost = window.location.hostname;

  if (pages.includes(currentHost)) {
      disableScroll();
  }
}

function getPagesFromStorage() {
  return new Promise((resolve, reject) => {
      try {
          chrome.storage.local.get(['scrollLockPages'], function(result) {
              resolve(result.scrollLockPages || []);
          });
      } catch (error) {
          reject(error);
      }
  });
}

init();
