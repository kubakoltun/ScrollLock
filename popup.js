document.addEventListener('DOMContentLoaded', function () {
  const pageInput = document.getElementById('page');
  const addButton = document.getElementById('add');
  const pageList = document.getElementById('pageList');
  let deleteInProgress = false;

  // Load existing pages
  chrome.storage.local.get(['scrollLockPages'], function (result) {
    const pages = result.scrollLockPages || [];
    pages.forEach(page => addPageToList(page));
  });

  addButton.addEventListener('click', function () {
    const page = pageInput.value.trim();
    if (page) {
      chrome.storage.local.get(['scrollLockPages'], function (result) {
        const pages = result.scrollLockPages || [];
        if (!pages.includes(page)) {
          pages.push(page);
          chrome.storage.local.set({ scrollLockPages: pages }, function () {
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

    const editButton = document.createElement('span');
    editButton.className = 'edit';
    editButton.innerHTML = '<i class="fas fa-pen-alt"></i>';

    const removeButton = document.createElement('span');
    removeButton.className = 'remove';
    removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';

    // Edit page
    editButton.addEventListener('click', function () {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = page;

      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';

      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';

      // Store the original state for cancel functionality
      const originalContent = li.textContent;

      // Replace text with input field, save, and cancel buttons
      li.textContent = '';
      li.appendChild(input);
      li.appendChild(saveButton);
      li.appendChild(cancelButton);

      // Save the new page on button click
      saveButton.addEventListener('click', function () {
        const newPage = input.value.trim();
        if (newPage) {
          chrome.storage.local.get(['scrollLockPages'], function (result) {
            let pages = result.scrollLockPages || [];

            // Remove the old page and add the updated page
            pages = pages.filter(p => p !== page);
            pages.push(newPage);

            chrome.storage.local.set({ scrollLockPages: pages }, function () {
              // Update the list with the new page
              li.textContent = newPage;
              li.appendChild(editButton);
              li.appendChild(removeButton);
            });
          });
        }
      });

      // Cancel edit and restore original content
      cancelButton.addEventListener('click', function () {
        li.textContent = page;
        li.appendChild(editButton);
        li.appendChild(removeButton);
      });
    });

    // Remove page
    removeButton.addEventListener('click', function () {
      if (deleteInProgress) {
        return;
      }

      deleteInProgress = true; 

      const para = document.createElement('p');
      para.innerText = `Do you really want to delete the page "${page}"? Please retype the exact page name.`;

      const inputField = document.createElement('input');
      inputField.type = 'text';
      inputField.placeholder = `${li.textContent}`;

      const confirmButton = document.createElement('button');
      confirmButton.textContent = 'Confirm';

      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';

      li.appendChild(para);
      li.appendChild(inputField);
      li.appendChild(confirmButton);
      li.appendChild(cancelButton);

      // Cancel removal
      cancelButton.addEventListener('click', function () {
        // Remove the confirmation elements and reset the flag
        li.removeChild(para);
        li.removeChild(inputField);
        li.removeChild(confirmButton);
        li.removeChild(cancelButton);
        deleteInProgress = false;
      });

      // Confirm removal
      confirmButton.addEventListener('click', function () {
        const inputText = inputField.value.trim();
        if (inputText === page) {
          chrome.storage.local.get(['scrollLockPages'], function (result) {
            let pages = result.scrollLockPages || [];
            pages = pages.filter(p => p !== page);

            // Update storage and remove the element from the list
            chrome.storage.local.set({ scrollLockPages: pages }, function () {
              li.remove();
              deleteInProgress = false;
            });
          });
        } else {
          // Display error message if names don't match
          para.innerText = `Error: The entered name does not match "${page}". Please try again.`;
        }
      });
    });

    li.appendChild(editButton);
    li.appendChild(removeButton);
    pageList.appendChild(li);
  }
});
