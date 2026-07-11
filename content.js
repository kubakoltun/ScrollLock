function preventDefault(e) {
    e.preventDefault();
}

// Inject a style tag to ignore scrollbars globally, including in iframes/shadow roots
function injectScrollLockStyles() {
    const id = '__scroll_lock_style__';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
        html, body, * {
            overflow: hidden !important;
            scrollbar-width: none !important;  /* Firefox */
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
        }
    `;
    document.documentElement.appendChild(style);
}

// Continuously reset scroll position on ANY scrollable element in the DOM
function lockAllScrollPositions() {
    // Reset window
    if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
    }

    // Reset every scrollable element
    document.querySelectorAll('*').forEach(el => {
        if (el.scrollTop !== 0 || el.scrollLeft !== 0) {
            el.scrollTop = 0;
            el.scrollLeft = 0;
        }
    });
}

function disableScroll() {
    if (!document.body) {
        setTimeout(disableScroll, 100);
        return;
    }

    injectScrollLockStyles();

    // Block wheel, touch, keyboard
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('wheel', preventDefault, { passive: false });
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
            preventDefault(e);
        }
    }, { passive: false });

    // Block scroll on window and all other elements
    window.addEventListener('scroll', () => window.scrollTo(0, 0), { passive: true });
    document.addEventListener('scroll', (e) => {
        const t = e.target;
        if (t && t !== document) {
            t.scrollTop = 0;
            t.scrollLeft = 0;
        }
    }, { passive: true, capture: true });

    // Polling fallback: catches anything that slips through (drag, programmatic scroll, etc.)
    setInterval(lockAllScrollPositions, 100);

    // Re-inject styles if the page dynamically removes them (SPAs)
    const observer = new MutationObserver(() => injectScrollLockStyles());
    observer.observe(document.documentElement, { childList: true, subtree: false });
}

async function init() {
    const pages = await getPagesFromStorage();
    const currentHost = window.location.hostname;

    if (pages.includes(currentHost)) {
        disableScroll();
    }
}

async function getPagesFromStorage() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(['scrollLockPages'], function(result) {
                // Hostname is in a format of www.page.com therefore some parsing is needed
                const pages = result.scrollLockPages || [];
                const normalizedHostnames = pages.map(p => extractHostname(p));
                resolve(normalizedHostnames);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// From https://www.hostname.com/example to www.hostname.com
function extractHostname(input) {
    try {
        const url = new URL(input);
        return url.hostname;
    } catch (e) {
        // Fallback if user enters something like "hostname.com"
        return input.replace(/^https?:\/\//, '').split('/')[0];
    }
}

init();
