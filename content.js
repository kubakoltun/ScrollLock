function preventDefault(e) {
    e.preventDefault();
}

function disableScroll() {
    // Retrying if body is not available yet
    if (!document.body) {
        setTimeout(disableScroll, 100);
        return;
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('wheel', preventDefault, { passive: false });
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
