document.addEventListener('DOMContentLoaded', function() {
  const pageInput = document.getElementById('page');
  const addButton = document.getElementById('add');
  const pageList = document.getElementById('pageList');

  // Load existing pages
  chrome.storage.local.get(['scrollLockPages'], function(result) {
    const pages = result.scrollLockPages || [];
    pages.forEach(page => addPageToList(page));
  });

  addButton.addEventListener('click', function() {
    const page = pageInput.value.trim();
    // if (page not in format of site.com throw error
    if (page) {
      chrome.storage.local.get(['scrollLockPages'], function(result) {
        const pages = result.scrollLockPages || [];
        if (!pages.includes(page)) {
          pages.push(page);
          chrome.storage.local.set({ scrollLockPages: pages }, function() {
            addPageToList(page);
            pageInput.value = '';
          });
        }
      });
    }
  });

  function addPageToList(page) {
    const li = document.createElement('li');
    li.textContent = page;

    const removeButton = document.createElement('span');
    removeButton.className = 'remove';
    removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    removeButton.addEventListener('click', function() {
      chrome.storage.local.get(['scrollLockPages'], function(result) {
        let pages = result.scrollLockPages || [];
        pages = pages.filter(p => p !== page);
        chrome.storage.local.set({ scrollLockPages: pages }, function() {
          li.remove();
        });
      });
    });

    li.appendChild(removeButton);
    pageList.appendChild(li);
  }
});
