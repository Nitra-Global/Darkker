// newtab.js

document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.getElementById('search-bar');
  const searchEngineSelect = document.getElementById('search-engine');
  const openInNewTabCheckbox = document.getElementById('open-in-new-tab');
  const openSidebarBtn = document.getElementById('open-sidebar');
  const sidebar = document.getElementById('sidebar');
  const sidebarContent = document.getElementById('sidebar-content');
  const quickActionsContainer = document.getElementById('quick-actions');
  const timeElement = document.getElementById('time');
  const dateElement = document.getElementById('date');

  // Toolbar Buttons
  const openNotesBtn = document.getElementById('open-notes');
  const openBookmarksBtn = document.getElementById('open-bookmarks');

  // Modals
  const notesModal = document.getElementById('notes-modal');
  const closeNotesBtn = document.getElementById('close-notes');
  const notesText = document.getElementById('notes-text');

  const bookmarksModal = document.getElementById('bookmarks-modal');
  const closeBookmarksBtn = document.getElementById('close-bookmarks');
  const bookmarksList = document.getElementById('bookmarks-list');
  const addBookmarkBtn = document.getElementById('add-bookmark');

  // Initialize Settings
  let settings = {
    backgroundType: 'color', // 'color', 'image', or 'video'
    backgroundColor: '#121212',
    backgroundURL: '',
    backgroundVideoURL: '',
    searchEngine: 'google',
    openInNewTab: true,
    quickActions: [],
    notes: '',
    bookmarks: []
  };

  // Load settings from Local Storage
  chrome.storage.local.get(settings, (data) => {
    settings = { ...settings, ...data };
    applyBackground();
    searchEngineSelect.value = settings.searchEngine;
    openInNewTabCheckbox.checked = settings.openInNewTab;
    renderQuickActions();
    notesText.value = settings.notes;
    renderBookmarks();
  });

  // Apply Background Based on Settings
  function applyBackground() {
    const background = document.getElementById('background');
    background.innerHTML = ''; // Clear existing background elements

    if (settings.backgroundType === 'image' && settings.backgroundURL) {
      background.style.backgroundImage = `url(${settings.backgroundURL})`;
      background.style.backgroundColor = '';
    } else if (settings.backgroundType === 'video' && settings.backgroundVideoURL) {
      const video = document.createElement('video');
      video.src = settings.backgroundVideoURL;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      background.appendChild(video);
      background.style.backgroundColor = '';
    } else { // Default to color
      background.style.backgroundImage = '';
      background.style.backgroundColor = settings.backgroundColor;
    }
  }

  // Handle Search Submission
  searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchBar.value.trim();
      if (query) {
        performSearch(query);
      }
    }
  });

  function performSearch(query) {
    let searchURL = '';
    switch (settings.searchEngine) {
      case 'google':
        searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'bing':
        searchURL = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'duckduckgo':
        searchURL = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        break;
      case 'yahoo':
        searchURL = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
        break;
      case 'ecosia':
        searchURL = `https://www.ecosia.org/search?q=${encodeURIComponent(query)}`;
        break;
      case 'startpage':
        searchURL = `https://www.startpage.com/do/search?q=${encodeURIComponent(query)}`;
        break;
      default:
        searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    if (settings.openInNewTab) {
      chrome.tabs.create({ url: searchURL });
    } else {
      chrome.tabs.update({ url: searchURL });
    }

    searchBar.value = '';
  }

  // Update Search Engine Selection
  searchEngineSelect.addEventListener('change', (e) => {
    settings.searchEngine = e.target.value;
    chrome.storage.local.set({ searchEngine: settings.searchEngine });
  });

  // Update Open in New Tab Preference
  openInNewTabCheckbox.addEventListener('change', (e) => {
    settings.openInNewTab = e.target.checked;
    chrome.storage.local.set({ openInNewTab: settings.openInNewTab });
  });

  // Open Sidebar
  openSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    renderSidebarContent();
  });

  // Close Sidebar When Clicking Outside
  sidebar.addEventListener('click', (e) => {
    if (e.target.id === 'sidebar') {
      sidebar.classList.remove('active');
    }
  });

  // Render Sidebar Content
  function renderSidebarContent() {
    sidebarContent.innerHTML = `
      <div class="sidebar-section">
        <h3>Hintergrund</h3>
        <label for="bg-type">Videos können viele Ressourcen verbrauchen, was sich auf die Leistung auswirkt.</label>
        <label for="bg-type">Typ:</label>
        <select id="bg-type">
          <option value="color">Farbe</option>
          <option value="image">Bild</option>
          <option value="video">Video</option>
        </select>
        <div id="bg-options"></div>
      </div>

      <div class="sidebar-section">
        <h3>Suchmaschine</h3>
        <label for="sidebar-search-engine">Wähle deine Suchmaschine:</label>
        <select id="sidebar-search-engine">
          <option value="google">Google</option>
          <option value="bing">Bing</option>
          <option value="duckduckgo">DuckDuckGo</option>
          <option value="yahoo">Yahoo</option>
          <option value="ecosia">Ecosia</option>
          <option value="startpage">Startpage</option>
        </select>
      </div>

      <div class="sidebar-section">
        <h3>Schnellaktionen</h3>
        <label for="quick-actions-list">Stelle sicher, dass du https://google.com verwendest, nicht "google.com"</label>
        <div id="quick-actions-list" class="quick-actions-list"></div>
        <button id="add-action">Aktion hinzufügen</button>
      </div>
    `;

    // Set Background Type
    const bgTypeSelect = document.getElementById('bg-type');
    bgTypeSelect.value = settings.backgroundType;
    bgTypeSelect.addEventListener('change', (e) => {
      settings.backgroundType = e.target.value;
      chrome.storage.local.set({ backgroundType: settings.backgroundType });
      applyBackgroundOptions();
      applyBackground();
    });

    // Render Background Options
    applyBackgroundOptions();

    // Set Search Engine in Sidebar
    const sidebarSearchEngine = document.getElementById('sidebar-search-engine');
    sidebarSearchEngine.value = settings.searchEngine;
    sidebarSearchEngine.addEventListener('change', (e) => {
      settings.searchEngine = e.target.value;
      chrome.storage.local.set({ searchEngine: settings.searchEngine });
      searchEngineSelect.value = settings.searchEngine;
    });

    // Render Quick Actions
    renderQuickActionsInSidebar();

    // Add Action Button
    document.getElementById('add-action').addEventListener('click', () => {
      if (settings.quickActions.length >= 8) {
        alert('Maximale Anzahl von 8 Schnellaktionen erreicht.');
        return;
      }
      const newAction = { name: 'Neue Aktion', url: 'https://www.example.com' };
      settings.quickActions.push(newAction);
      chrome.storage.local.set({ quickActions: settings.quickActions }, () => {
        renderQuickActions();
        renderQuickActionsInSidebar();
      });
    });
  }

  // Apply Background Options Based on Type
  function applyBackgroundOptions() {
    const bgOptionsContainer = document.getElementById('bg-options');
    bgOptionsContainer.innerHTML = ''; // Bestehende Optionen löschen

    if (settings.backgroundType === 'color') {
      bgOptionsContainer.innerHTML = `
        <label for="bg-color">Farbe:</label>
        <input type="color" id="bg-color" value="${settings.backgroundColor}">
      `;
      document.getElementById('bg-color').addEventListener('input', (e) => {
        settings.backgroundColor = e.target.value;
        chrome.storage.local.set({ backgroundColor: settings.backgroundColor }, () => {
          applyBackground();
        });
      });
    } else if (settings.backgroundType === 'image') {
      bgOptionsContainer.innerHTML = `
        <label for="bg-upload">Bild hochladen:</label>
        <input type="file" id="bg-upload" accept="image/*">
      `;
      document.getElementById('bg-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
          const url = event.target.result;
          settings.backgroundURL = url;
          chrome.storage.local.set({ backgroundURL: settings.backgroundURL }, () => {
            applyBackground();
          });
        };
        reader.readAsDataURL(file);
      });
    } else if (settings.backgroundType === 'video') {
      bgOptionsContainer.innerHTML = `
        <label for="bg-video-upload">Video hochladen:</label>
        <input type="file" id="bg-video-upload" accept="video/*">
      `;
      document.getElementById('bg-video-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
          const url = event.target.result;
          settings.backgroundVideoURL = url;
          chrome.storage.local.set({ backgroundVideoURL: settings.backgroundVideoURL }, () => {
            applyBackground();
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  // Render Quick Actions on Main Page
  function renderQuickActions() {
    quickActionsContainer.innerHTML = '';
    settings.quickActions.forEach((action, index) => {
      const actionBtn = document.createElement('div');
      actionBtn.classList.add('quick-action');
      actionBtn.textContent = action.name;
      actionBtn.title = action.url;
      actionBtn.addEventListener('click', () => {
        if (settings.openInNewTab) {
          chrome.tabs.create({ url: action.url });
        } else {
          chrome.tabs.update({ url: action.url });
        }
      });
      quickActionsContainer.appendChild(actionBtn);
    });
  }

  // Render Quick Actions in Sidebar
  function renderQuickActionsInSidebar() {
    const quickActionsList = document.getElementById('quick-actions-list');
    quickActionsList.innerHTML = '';

    settings.quickActions.forEach((action, index) => {
      const actionItem = document.createElement('div');
      actionItem.classList.add('quick-action-item');
      actionItem.innerHTML = `
        <input type="text" class="action-name" value="${action.name}" placeholder="Name">
        <input type="url" class="action-url" value="${action.url}" placeholder="URL">
        <button class="remove-action material-icons">delete</button>
      `;

      // Handle Name Change
      actionItem.querySelector('.action-name').addEventListener('input', (e) => {
        settings.quickActions[index].name = e.target.value;
        chrome.storage.local.set({ quickActions: settings.quickActions }, () => {
          renderQuickActions();
        });
      });

      // Handle URL Change
      actionItem.querySelector('.action-url').addEventListener('input', (e) => {
        settings.quickActions[index].url = e.target.value;
        chrome.storage.local.set({ quickActions: settings.quickActions }, () => {
          renderQuickActions();
        });
      });

      // Handle Remove Action
      actionItem.querySelector('.remove-action').addEventListener('click', () => {
        if (confirm(`Schnellaktion "${action.name}" entfernen?`)) {
          settings.quickActions.splice(index, 1);
          chrome.storage.local.set({ quickActions: settings.quickActions }, () => {
            renderQuickActions();
            renderQuickActionsInSidebar();
          });
        }
      });

      quickActionsList.appendChild(actionItem);
    });
  }

  // Update Time and Date
  function updateTimeAndDate() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}`;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString(undefined, options);
  }

  updateTimeAndDate();
  setInterval(updateTimeAndDate, 60000); // Update jede Minute

  // Listen for storage changes to update UI in real-time
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.backgroundType || changes.backgroundColor || changes.backgroundURL || changes.backgroundVideoURL) {
        settings = { ...settings, ...changes };
        applyBackground();
      }
      if (changes.searchEngine) {
        settings.searchEngine = changes.searchEngine.newValue;
        searchEngineSelect.value = settings.searchEngine;
      }
      if (changes.openInNewTab) {
        settings.openInNewTab = changes.openInNewTab.newValue;
        openInNewTabCheckbox.checked = settings.openInNewTab;
      }
      if (changes.quickActions) {
        settings.quickActions = changes.quickActions.newValue;
        renderQuickActions();
      }
      if (changes.notes) {
        settings.notes = changes.notes.newValue;
        notesText.value = settings.notes;
      }
      if (changes.bookmarks) {
        settings.bookmarks = changes.bookmarks.newValue;
        renderBookmarks();
      }
    }
  });

  // Toolbar Functionality

  // Öffne Notizen Modal
  openNotesBtn.addEventListener('click', () => {
    notesModal.style.display = 'block';
  });

  // Schließe Notizen Modal
  closeNotesBtn.addEventListener('click', () => {
    notesModal.style.display = 'none';
    settings.notes = notesText.value;
    chrome.storage.local.set({ notes: settings.notes });
  });

  // Schließe Notizen Modal beim Klick außerhalb
  window.addEventListener('click', (e) => {
    if (e.target == notesModal) {
      notesModal.style.display = 'none';
      settings.notes = notesText.value;
      chrome.storage.local.set({ notes: settings.notes });
    }
    if (e.target == bookmarksModal) {
      bookmarksModal.style.display = 'none';
    }
  });

  // Öffne Lesezeichen Modal
  openBookmarksBtn.addEventListener('click', () => {
    bookmarksModal.style.display = 'block';
  });

  // Schließe Lesezeichen Modal
  closeBookmarksBtn.addEventListener('click', () => {
    bookmarksModal.style.display = 'none';
  });

  // Füge neues Lesezeichen hinzu
  addBookmarkBtn.addEventListener('click', () => {
    const name = prompt('Name des Lesezeichens:');
    const url = prompt('URL des Lesezeichens:');
    if (name && url) {
      settings.bookmarks.push({ name, url });
      chrome.storage.local.set({ bookmarks: settings.bookmarks }, () => {
        renderBookmarks();
      });
    }
  });

  // Render Lesezeichen Liste
  function renderBookmarks() {
    bookmarksList.innerHTML = '';
    settings.bookmarks.forEach((bookmark, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${bookmark.url}" target="_blank">${bookmark.name}</a>
        <button class="remove-bookmark material-icons" title="Entfernen">delete</button>
      `;
      // Entferne Lesezeichen
      li.querySelector('.remove-bookmark').addEventListener('click', () => {
        if (confirm(`Lesezeichen "${bookmark.name}" entfernen?`)) {
          settings.bookmarks.splice(index, 1);
          chrome.storage.local.set({ bookmarks: settings.bookmarks }, () => {
            renderBookmarks();
          });
        }
      });
      bookmarksList.appendChild(li);
    });
  }

  // Speichere Notizen in Echtzeit
  notesText.addEventListener('input', (e) => {
    settings.notes = e.target.value;
    chrome.storage.local.set({ notes: settings.notes });
  });
});
