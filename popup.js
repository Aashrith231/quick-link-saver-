document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn');
  const tagInput = document.getElementById('tagInput');
  const noteInput = document.getElementById('noteInput');
  const linksContainer = document.getElementById('linksContainer');

  // Load and display saved links when popup opens
  displayLinks();

  // Save Link logic
  saveBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab) return;

      const newLink = {
        id: Date.now(),
        url: activeTab.url,
        title: activeTab.title || 'Untitled Page',
        tag: tagInput.value.trim() || 'General',
        note: noteInput.value.trim()
      };

      chrome.storage.local.get({ savedLinks: [] }, (data) => {
        const updatedLinks = [newLink, ...data.savedLinks];
        chrome.storage.local.set({ savedLinks: updatedLinks }, () => {
          // Clear inputs and refresh view
          tagInput.value = '';
          noteInput.value = '';
          displayLinks();
        });
      });
    });
  });

  // Display Links logic
  function displayLinks() {
    chrome.storage.local.get({ savedLinks: [] }, (data) => {
      linksContainer.innerHTML = '';
      
      if (data.savedLinks.length === 0) {
        linksContainer.innerHTML = '<p style="font-size:12px; color:#999; text-align:center;">No saved links yet.</p>';
        return;
      }

      data.savedLinks.forEach(item => {
        const div = document.createElement('div');
        div.className = 'link-item';
        
        div.innerHTML = `
          <a href="${item.url}" target="_blank" title="${item.url}">${item.title}</a>
          ${item.note ? `<p>${item.note}</p>` : ''}
          <span class="tag">${item.tag}</span>
          <button class="delete-btn" data-id="${item.id}">×</button>
        `;

        // Delete button listener
        div.querySelector('.delete-btn').addEventListener('click', (e) => {
          const idToDelete = Number(e.target.getAttribute('data-id'));
          deleteLink(idToDelete);
        });

        linksContainer.appendChild(div);
      });
    });
  }

  // deleting logicc
  function deleteLink(id) {
    chrome.storage.local.get({ savedLinks: [] }, (data) => {
      const filteredLinks = data.savedLinks.filter(item => item.id !== id);
      chrome.storage.local.set({ savedLinks: filteredLinks }, () => {
        displayLinks();
      });
    });
  }
});
