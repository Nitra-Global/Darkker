// context-menu.js

// Styles für das Kontextmenü hinzufügen
const style = document.createElement('style');
style.innerHTML = `
  #custom-context-menu {
    display: none;
    position: absolute;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px) saturate(180%);
    border-radius: 18px;
    padding: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    font-family: 'Inter', sans-serif;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 0;
    transform: scale(0.95);
    min-width: 200px;
    z-index: 10000;
  }

  #custom-context-menu.show {
    display: block;
    opacity: 1;
    transform: scale(1);
  }

  #custom-context-menu ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  #custom-context-menu li {
    padding: 10px 16px;
    cursor: pointer;
    color: #333;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 12px;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  #custom-context-menu li:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #007bff;
  }

  #custom-context-menu li:active {
    background-color: rgba(0, 0, 0, 0.1);
    color: #0056b3;
  }

  #custom-context-menu .shortcut {
    color: #888;
    font-size: 14px;
  }

  #copy-feedback {
    display: none;
    text-align: center;
    font-size: 14px;
    color: #28a745;
    margin-top: 5px;
  }
`;
document.head.appendChild(style);

// Kontextmenü erstellen
const contextMenu = document.createElement('div');
contextMenu.id = 'custom-context-menu';
contextMenu.innerHTML = `
  <ul>
    <li id="refresh-page">
      Seite neu laden
      <span class="shortcut">F5</span>
    </li>
    <li id="copy-link">
      Link kopieren
      <span class="shortcut">Strg+C</span>
    </li>
    <li id="close-menu">
      Menü schließen
      <span class="shortcut">Esc</span>
    </li>
  </ul>
  <div id="copy-feedback">Link kopiert!</div>
`;
document.body.appendChild(contextMenu);

// Funktion zum Anzeigen des Menüs mit Animation
function showContextMenu(e) {
  e.preventDefault();

  const { clientX: mouseX, clientY: mouseY } = e;
  contextMenu.style.top = `${mouseY}px`;
  contextMenu.style.left = `${mouseX}px`;
  
  contextMenu.classList.add('show');
  setTimeout(() => contextMenu.style.display = 'block', 0); // Sorgt für Animation bei Öffnung
}

// Menü bei Rechtsklick anzeigen und Standardmenü verhindern
document.addEventListener('contextmenu', (e) => {
  // Blockiert das Standardmenü nur, wenn der Bereich klickbar ist
  if (e.target.closest('#custom-context-menu') === null) {
    showContextMenu(e);
  }
});

// Funktion zum Schließen des Menüs mit Animation
function hideContextMenu() {
  contextMenu.classList.remove('show');
  setTimeout(() => contextMenu.style.display = 'none', 300); // Verzögerung für Animation
  document.getElementById('copy-feedback').style.display = 'none';
}

// Menü bei Klick außerhalb oder ESC schließen
document.addEventListener('click', (e) => {
  if (!contextMenu.contains(e.target)) hideContextMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideContextMenu();
});

// Funktionen für Menüoptionen
document.getElementById('refresh-page').addEventListener('click', () => {
  hideContextMenu();
  setTimeout(() => location.reload(), 150); // Verzögerung für visuelles Feedback
});

document.getElementById('copy-link').addEventListener('click', () => {
  hideContextMenu();
  navigator.clipboard.writeText(window.location.href).then(() => {
    const feedback = document.getElementById('copy-feedback');
    feedback.style.display = 'block';
    setTimeout(() => feedback.style.display = 'none', 1500); // Nachricht verschwindet nach 1,5s
  });
});

document.getElementById('close-menu').addEventListener('click', hideContextMenu);
