import '../css/style.css';
import { BibleDB } from './db.js';

const createIcon = (name) => `<i data-lucide="${name}"></i>`;

class App {
  constructor() {
    this.db = new BibleDB();
    this.appEl = document.querySelector('#app');
    this.currentView = 'home';
    this.selectedVerse = null;
    this.selectedFavoriteIndex = null;
    this.selectedNoteIndex = null;
    this.editingNoteIndex = undefined;
    this.currentVod = null;
    this.currentVodBg = '/img/bg-verse-1.png';
    this.dictionary = [];
    this.isSpeaking = false;
    this.aboutClickCount = 0;

    this.init();
  }

  async canShareData(data) {
    if (!navigator.share || !navigator.canShare) return false;

    // Si pasamos el objeto completo, algunos navegadores fallan si hay miembros desconocidos.
    // Validamos campos individualmente como sugiere la wiki.
    const supportedData = {};
    let hasSomethingToShare = false;

    for (const [key, value] of Object.entries(data)) {
      if (navigator.canShare({ [key]: value })) {
        supportedData[key] = value;
        hasSomethingToShare = true;
      }
    }

    return hasSomethingToShare ? supportedData : false;
  }

  async init() {
    const loaded = await this.db.init();
    if (loaded) {
      this.applyTheme(this.db.settings.theme || 'classic');
      this.renderHome();
    } else {
      this.appEl.innerHTML = '<div class="error" style="height: 100vh; display: flex; align-items: center; justify-content: center; color: white;">Error al cargar la Biblia. Por favor recarga.</div>';
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.db.setTheme(theme);
    if (this.currentView === 'settings') {
      this.renderSettings();
    }
  }

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    } else {
      const script = document.createElement('script');
      script.src = '/libs/lucide.min.js';
      script.onload = () => {
        if (window.lucide) window.lucide.createIcons();
      };
      document.head.appendChild(script);
    }
  }

  render(html) {
    if (this.isSpeaking) this.stopTTS();
    document.getElementById('app').innerHTML = html;
    this.refreshIcons();
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.appEl.scrollTo(0, 0);
  }

  showToast(message, duration = 3000) {
    const container = document.querySelector('#toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  renderHome() {
    this.currentView = 'home';
    const menuItems = [
      { text: "Antiguo T.", icon: "book", target: "old" },
      { text: "Nuevo T.", icon: "book-open", target: "new" },
      { text: "Última L.", icon: "history", target: "last" },
      { text: "Vr. de hoy", icon: "sun", target: "vod" },
      { text: "Favoritos", icon: "heart", target: "favorites" },
      { text: "Notas", icon: "sticky-note", target: "notes" },
      { text: "Marcadores", icon: "highlighter", target: "highlights" },
      { text: "Diccionario", icon: "book-a", target: "dict" },
      { text: "Ajustes", icon: "settings", target: "settings" }
    ];

    const html = `
      <header>
        <h1 style="font-family: 'Playfair Display', serif;">Biblia Cristiana</h1>
        <div style="font-size: 0.8rem; opacity: 0.5; color: var(--accent); margin-right: auto; padding-left: 0.5rem;">RV 1960</div>
        <button class="btn-icon" onclick="window.app.navigate('settings')">${createIcon('settings')}</button>
      </header>
      <div class="view-container animate-entrance">
        <div class="home-grid">
          ${menuItems.map(item => `
            <div class="premium-card" onclick="window.app.navigate('${item.target}')">
              <div class="icon-wrapper">${createIcon(item.icon)}</div>
              <span>${item.text}</span>
            </div>
          `).join('')}
          <div class="premium-card" style="grid-column: span 2; flex-direction: row; justify-content: center; padding: 1rem;" onclick="window.app.navigate('about')">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="color: var(--accent);">${createIcon('info')}</div>
                <span>Acerca de la Aplicación</span>
              </div>
          </div>
        </div>
      </div>
    `;
    this.render(html);
  }

  navigate(target) {
    // Limpiar cualquier selección activa y ocultar barras flotantes al cambiar de vista
    this.clearSelection();
    this.clearFavoriteSelection();
    this.clearNoteSelection();
    this.clearHighlightSelection(); // Limpiar selección de highlights al navegar
    this.closeShareModal(); // Asegurar que modales también se cierren

    if (target === 'home') this.renderHome();
    else if (target === 'old') this.renderBookList('old');
    else if (target === 'new') this.renderBookList('new');
    else if (target === 'favorites') this.renderFavorites();
    else if (target === 'notes') this.renderNotes();
    else if (target === 'highlights') this.renderHighlights();
    else if (target === 'search') this.renderSearch();
    else if (target === 'dict') this.renderDictionary();
    else if (target === 'about') this.renderAbout();
    else if (target === 'settings') this.renderSettings();
    else if (target === 'vod') this.renderVerseOfDay();
    else if (target === 'last') {
      const { last_book, last_chapter } = this.db.settings;
      this.renderReader(last_book, last_chapter);
    }
  }

  renderBookList(testament) {
    const books = this.db.getBooks(testament);
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>${testament === 'old' ? 'Antiguo Testamento' : 'Nuevo Testamento'}</h1>
      </header>
      <div class="view-container animate-entrance">
        <div style="display: grid; grid-template-columns: 1fr; gap: 0.75rem;">
          ${books.map(book => `
            <div class="premium-card" onclick="window.app.renderChapterList('${book}')" 
                 style="flex-direction: row; justify-content: space-between; padding: 1.25rem;">
              <span style="font-size: 1.1rem;">${book}</span>
              <div style="color: var(--accent); opacity: 0.5;">${createIcon('chevron-right')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.render(html);
  }

  renderChapterList(book) {
    this.currentView = 'chapters';
    const chapters = this.db.getChapters(book);
    const oldBooks = this.db.getBooks('old');
    const isOld = oldBooks.includes(book);

    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.renderBookList('${isOld ? 'old' : 'new'}')">${createIcon('chevron-left')}</button>
        <h1>${book}</h1>
      </header>
      <div class="view-container animate-entrance">
        <p style="opacity: 0.6; font-size: 0.9rem; margin-bottom: 1.5rem; font-weight: 600; text-transform: uppercase; text-align: center;">Seleccionar Capítulo</p>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem;">
          ${chapters.map(ch => `
            <div class="premium-card" onclick="window.app.renderReader('${book}', '${ch}')" 
                 style="aspect-ratio: 1/1; justify-content: center; align-items: center; padding: 0; font-size: 1.1rem; font-weight: 700; border-radius: 12px;">
              ${ch}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.render(html);
  }

  renderReader(book, chapter) {
    this.currentView = 'reader';
    this.db.setLastRead(book, chapter);
    const chapters = this.db.getChapters(book);
    const verses = this.db.getVerses(book, chapter);

    const html = `
      <header style="flex-direction: column; align-items: flex-start; gap: 0.5rem; padding-bottom: 0;">
        <div style="display: flex; align-items: center; gap: 1rem; width: 100%;">
          <button class="btn-icon" onclick="window.app.renderChapterList('${book}')">${createIcon('chevron-left')}</button>
          <h1 style="flex-grow: 1; font-size: 1.4rem;">${book}</h1>
          <button class="btn-icon ${this.isSpeaking ? 'active' : ''}" id="tts-btn" 
                  style="${this.isSpeaking ? 'background: var(--accent); color: white;' : ''}"
                  onclick="window.app.toggleTTS('${book.replace(/'/g, "\\'")}', '${chapter}')" title="Leer capítulo">
            ${createIcon(this.isSpeaking ? 'volume-x' : 'volume-2')}
          </button>
        </div>
        <div id="chapter-tabs" style="display: flex; overflow-x: auto; gap: 0.5rem; width: 100%; padding: 0.5rem 0 1rem 0; scrollbar-width: none;">
          ${chapters.map(ch => `
            <button class="${ch === chapter ? 'premium-card' : ''}" 
                    style="padding: 0.4rem 1rem; border: ${ch === chapter ? 'none' : '1px solid var(--glass-border)'}; 
                           background: ${ch === chapter ? 'var(--accent)' : 'var(--card-bg)'}; 
                           color: ${ch === chapter ? 'white' : 'var(--text-main)'};
                           border-radius: 20px; white-space: nowrap; font-size: 0.9rem; font-weight: 600;"
                    onclick="window.app.renderReader('${book}', '${ch}')">
              ${ch}
            </button>
          `).join('')}
        </div>
      </header>
      <div class="view-container animate-entrance">
        ${verses.map(([vNum, text]) => {
      const isFav = this.db.isFavorite(book, chapter, vNum);
      const isHighlighted = this.db.isHighlighted(book, chapter, vNum);
      const pericope = this.db.getPericope(book, chapter, vNum);
      const highlightStyle = isHighlighted ? `background-color: ${isHighlighted.color}; color: #333; border-radius: 4px; padding: 2px 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone;` : '';

      return `
              ${pericope ? `<div class="pericope">${pericope}</div>` : ''}
              <div class="verse-item ${isFav ? 'favorite' : ''}" 
                   id="v-${vNum}" onclick="window.app.toggleVerseSelection('${book}', '${chapter}', '${vNum}', '${text.replace(/'/g, "\\'")}')">
                <span class="verse-num">${vNum}</span>
                <span class="verse-text" style="${highlightStyle}">${text}</span>
              </div>
            `;
    }).join('')}
      </div>
      <div id="selection-bar" class="floating-toolbar animate-entrance" style="display: none;">
        <button class="tool-btn" onclick="window.app.handleFavorite()" title="Favorito">${createIcon('heart')}</button>
        <button class="tool-btn" onclick="window.app.handleNote()" title="Nota">${createIcon('edit-3')}</button>
        <button class="tool-btn" onclick="window.app.handleHighlight()" title="Marcador">${createIcon('highlighter')}</button>
        <button class="tool-btn" onclick="window.app.handleVerseMenu()" title="Menú">${createIcon('menu')}</button>
        <button class="tool-btn" onclick="window.app.clearSelection()" title="Cerrar">${createIcon('x')}</button>
      </div>

      <div id="highlight-bar" class="floating-toolbar animate-entrance" style="display: none; top: auto; bottom: 80px; justify-content: center; gap: 10px; flex-wrap: wrap; padding: 10px;">
        ${['#fef3c7', '#dcfce7', '#dbeafe', '#fae8ff', '#fee2e2', '#ffedd5', '#f3f4f6', 'transparent'].map(c => `
            <div data-color="${c}" onclick="window.app.applyHighlight('${c}')" style="width: 30px; height: 30px; border-radius: 50%; background: ${c === 'transparent' ? 'white' : c}; border: 1px solid #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                ${c === 'transparent' ? createIcon('ban') : ''}
            </div>
        `).join('')}
      </div>
    `;
    this.render(html);
    const activeTab = document.querySelector('#chapter-tabs .premium-card');
    if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    // Scroll to specific verse if requested (from favorites)
    if (window.pendingVerseScroll) {
      setTimeout(() => {
        const el = document.getElementById(`v-${window.pendingVerseScroll}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.pendingVerseScroll = null;
      }, 500);
    }

    this.setupSwipeNavigation(book, chapter);
  }

  setupSwipeNavigation(book, chapter) {
    let startX = 0;
    let startY = 0;
    const container = document.querySelector('.view-container');
    if (!container) return;

    container.ontouchstart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    container.ontouchend = (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;
      const thresholdX = 80; // Un poco más sensible pero seguro

      // Solo disparamos si el movimiento horizontal es predominante y supera el umbral
      // abs(diffX) > abs(diffY) * 2 asegura que sea un gesto mayormente horizontal
      if (Math.abs(diffX) > thresholdX && Math.abs(diffX) > Math.abs(diffY) * 1.8) {
        if (diffX > 0) {
          // Swipe Izquierda -> Siguiente Capítulo
          const nextCh = parseInt(chapter) + 1;
          if (nextCh <= this.db.getChapters(book).length) {
            container.classList.add('swipe-left');
            setTimeout(() => this.renderReader(book, nextCh.toString()), 200);
          }
        } else {
          // Swipe Derecha -> Capítulo Anterior
          const prevCh = parseInt(chapter) - 1;
          if (prevCh >= 1) {
            container.classList.add('swipe-right');
            setTimeout(() => this.renderReader(book, prevCh.toString()), 200);
          }
        }
      }
    };
  }

  toggleVerseSelection(book, chapter, vNum, text) {
    const el = document.getElementById(`v-${vNum}`);
    if (this.selectedVerse && this.selectedVerse.vNum === vNum) {
      this.clearSelection();
    } else {
      this.clearSelection();
      this.selectedVerse = { book, chapter, vNum, text };
      el.classList.add('selected');
      document.querySelector('#selection-bar').style.display = 'flex';

      const isFav = this.db.isFavorite(book, chapter, vNum);
      const favBtn = document.querySelector('#selection-bar .tool-btn:first-child');
      favBtn.style.color = isFav ? 'var(--accent)' : 'var(--text-main)';
      if (isFav) favBtn.innerHTML = createIcon('heart-off');
      else favBtn.innerHTML = createIcon('heart');
      this.refreshIcons();
    }
  }

  clearSelection() {
    if (this.selectedVerse) {
      const oldEl = document.getElementById(`v-${this.selectedVerse.vNum}`);
      if (oldEl) oldEl.classList.remove('selected');
    }
    this.selectedVerse = null;

    const bar = document.querySelector('#selection-bar');
    if (bar) bar.style.display = 'none';
    const hlBar = document.querySelector('#highlight-bar');
    if (hlBar) hlBar.style.display = 'none';
  }

  handleFavorite() {
    if (!this.selectedVerse) return;
    const { book, chapter, vNum, text } = this.selectedVerse;
    const isNowFav = this.db.toggleFavorite(book, chapter, vNum, text);
    const el = document.getElementById(`v-${vNum}`);
    if (isNowFav) el.classList.add('favorite');
    else el.classList.remove('favorite');
    this.clearSelection();
  }

  handleNote() {
    if (!this.selectedVerse) return;
    const { book, chapter, vNum } = this.selectedVerse;
    const modal = document.querySelector('#note-modal');
    const refEl = document.querySelector('#note-verse-ref');
    const textEl = document.querySelector('#note-text');

    refEl.innerText = `${book} ${chapter}:${vNum}`;
    textEl.value = '';
    modal.classList.add('active');
    textEl.focus();
  }

  closeNoteModal() {
    const modal = document.querySelector('#note-modal');
    modal.classList.remove('active');
    this.clearSelection();
  }

  saveNoteFromModal() {
    if (!this.selectedVerse && this.editingNoteIndex === undefined) return;
    const textEl = document.querySelector('#note-text');
    const note = textEl.value.trim();

    if (note) {
      if (this.editingNoteIndex !== undefined) {
        this.db.updateNote(this.editingNoteIndex, note);
        this.editingNoteIndex = undefined;
      } else {
        const { book, chapter, vNum, text } = this.selectedVerse;
        this.db.addNote(book, chapter, vNum, text, note);
      }
      this.renderNotes(); // Refresh view if in notes
    }
    this.closeNoteModal();
  }

  confirmDeleteNote(index) {
    this.openConfirmModal(
      "Eliminar Nota",
      "¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.",
      () => {
        this.db.deleteNote(index);
        this.renderNotes();
      }
    );
  }

  confirmDeleteFavorite(index) {
    this.openConfirmModal(
      "Eliminar Favorito",
      "¿Estás seguro de que quieres eliminar este versículo de tus favoritos?",
      () => {
        this.db.deleteFavorite(index);
        this.renderFavorites();
      }
    );
  }

  openConfirmModal(title, msg, onConfirm) {
    const modal = document.querySelector('#confirm-modal');
    const titleEl = document.querySelector('#confirm-title');
    const msgEl = document.querySelector('#confirm-msg');
    const btnOk = document.querySelector('#confirm-btn-ok');

    titleEl.innerText = title;
    msgEl.innerText = msg;
    modal.classList.add('active');

    btnOk.onclick = () => {
      onConfirm();
      this.closeConfirmModal();
    };
  }

  closeConfirmModal() {
    const modal = document.querySelector('#confirm-modal');
    if (modal) modal.classList.remove('active');
  }

  openEditNote(index) {
    const note = this.db.notes[index];
    if (!note) return;
    this.editingNoteIndex = index;
    const modal = document.querySelector('#note-modal');
    const refEl = document.querySelector('#note-verse-ref');
    const textEl = document.querySelector('#note-text');

    refEl.innerText = `${note.book} ${note.chapter}:${note.verse}`;
    textEl.value = note.note;
    modal.classList.add('active');
    textEl.focus();
  }

  handleCopy() {
    if (!this.selectedVerse) return;
    const { book, chapter, vNum, text } = this.selectedVerse;
    const fullText = `${book} ${chapter}:${vNum}\n${text}`;
    navigator.clipboard.writeText(fullText).then(() => {
      this.showToast("Texto copiado al portapapeles.");
    });
    this.clearSelection();
  }

  handleVerseMenu() {
    if (!this.selectedVerse) return;
    this.showShareOptions();
  }

  async renderSettings() {
    this.currentView = 'settings';

    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Configuración</h1>
      </header>
      <div class="view-container animate-entrance">
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Paleta de Colores</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            ${[
        { id: 'classic', name: 'Biblia Clásica', color: '#f4ece1' },
        { id: 'light', name: 'Modo Claro', color: '#ffffff' },
        { id: 'dark', name: 'Modo Oscuro', color: '#0f172a' },
        { id: 'floral', name: 'Estilo Floral', color: '#fff5f7' },
        { id: 'pastel-blue', name: 'Azul Pastel', color: '#ebf5ff' },
        { id: 'ink', name: 'Modo Tinta', color: '#000000' }
      ].map(t => `
              <div class="premium-card" onclick="window.app.applyTheme('${t.id}')" 
                   style="padding: 1rem; flex-direction: row; gap: 0.75rem; border: ${this.db.settings.theme === t.id ? '2px solid var(--accent)' : '1px solid var(--glass-border)'}">
                <div class="color-preview" style="background: ${t.color}; border: 1px solid rgba(0,0,0,0.1)"></div>
                <span style="font-size: 0.9rem; font-weight: 600;">${t.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Lectura en Voz (Audio)</h3>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <!-- Selector de Voz -->
            <div class="premium-card" onclick="window.app.openVoiceModal()" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${createIcon('user')}</div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Voz Seleccionada</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">${this.db.settings.tts_voice_name || 'Predeterminada'}</span>
                </div>
              </div>
              <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
            </div>

            <!-- Toggle Números de Verso -->
            <label class="premium-card" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; cursor: pointer; display: flex !important;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${createIcon('hash')}</div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Leer números de verso</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">Menciona "Verso X" antes del texto</span>
                </div>
              </div>
              <div class="switch">
                <input type="checkbox" ${this.db.settings.skip_verse_numbers ? '' : 'checked'} onchange="window.app.toggleVerseNumbers(this.checked)">
                <span class="slider round"></span>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;
    this.render(html);
  }

  applyVoice(index, name) {
    this.db.settings.tts_voice = index;
    this.db.settings.tts_voice_name = name; // Guardamos el nombre para el check visual
    this.db.saveSettings();
    this.closeVoiceModal();
    this.renderSettings();
  }

  toggleFavoriteSelection(index) {
    const cards = document.querySelectorAll('.fav-card');
    const card = cards[index];

    if (this.selectedFavoriteIndex === index) {
      this.clearFavoriteSelection();
    } else {
      this.clearFavoriteSelection();
      this.selectedFavoriteIndex = index;
      if (card) card.classList.add('selected');
      const bar = document.querySelector('#fav-selection-bar');
      if (bar) bar.style.display = 'flex';
    }
  }

  clearFavoriteSelection() {
    if (this.selectedFavoriteIndex !== null) {
      const cards = document.querySelectorAll('.fav-card');
      const oldCard = cards[this.selectedFavoriteIndex];
      if (oldCard) oldCard.classList.remove('selected');
    }
    this.selectedFavoriteIndex = null;
    const bar = document.querySelector('#fav-selection-bar');
    if (bar) bar.style.display = 'none';
  }

  navigateToSelectedFavorite() {
    if (this.selectedFavoriteIndex === null) return;
    const fav = this.db.favorites[this.selectedFavoriteIndex];
    if (fav) {
      this.clearFavoriteSelection(); // Fix: Clear selection and hide bar before navigating
      window.pendingVerseScroll = fav.verse;
      this.renderReader(fav.book, fav.chapter);
    }
  }

  confirmDeleteFavoriteFromBar() {
    if (this.selectedFavoriteIndex === null) return;
    const index = this.selectedFavoriteIndex;
    this.openConfirmModal(
      "Eliminar Favorito",
      "¿Estás seguro de que quieres eliminar este versículo de tus favoritos?",
      () => {
        this.db.deleteFavorite(index);
        this.clearFavoriteSelection();
        this.renderFavorites();
      }
    );
  }

  setupFavoriteSwipeEvents() {
    const cards = document.querySelectorAll('.fav-card');
    cards.forEach((card, index) => {
      let startX = 0;
      let currentX = 0;
      let isSwiping = false;
      const container = card.closest('.fav-swipe-container');
      const actionBg = container ? container.querySelector('.swipe-action-bg') : null;

      card.ontouchstart = (e) => {
        startX = e.touches[0].clientX;
        card.style.transition = 'none';
        isSwiping = false; // Diferimos la activación hasta detectar movimiento
      };

      card.ontouchmove = (e) => {
        const deltaX = e.touches[0].clientX - startX;

        // Solo activamos el swipe si el movimiento es hacia la izquierda y supera un umbral de 5px
        if (!isSwiping && deltaX < -5) {
          isSwiping = true;
          if (container) container.classList.add('is-swiping');
        }

        if (!isSwiping) return;
        currentX = deltaX;
        if (currentX > 0) currentX = 0;
        // Límite de deslizamiento visual
        if (currentX < -200) {
          // Un poco de resistencia
          const extra = currentX + 200;
          currentX = -200 + (extra * 0.2);
        }
        card.style.transform = `translateX(${currentX}px)`;

        // Opacidad y escala dinámica del icono
        if (actionBg) {
          const pullRatio = Math.min(Math.abs(currentX) / 100, 1);
          actionBg.style.opacity = pullRatio;
          actionBg.style.transform = `scale(${0.8 + (pullRatio * 0.2)})`;
        }
      };

      card.ontouchend = (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        card.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';

        if (actionBg) {
          actionBg.style.transition = 'opacity 0.3s, transform 0.3s';
          actionBg.style.opacity = '0';
          actionBg.style.transform = 'scale(0.8)';
        }

        // Si superó el umbral (ej. 150px), disparamos el borrado
        if (currentX < -150) {
          this.selectedFavoriteIndex = index;
          this.confirmDeleteFavoriteFromBar();
          // Reseteamos visualmente mientras sale el modal
          card.style.transform = 'translateX(0)';
          setTimeout(() => {
            if (container) container.classList.remove('is-swiping');
          }, 300);
        } else {
          card.style.transform = 'translateX(0)';
          setTimeout(() => {
            if (container) container.classList.remove('is-swiping');
          }, 300);
        }
        currentX = 0;
      };
    });
  }

  renderFavorites() {
    this.currentView = 'favorites';
    this.selectedFavoriteIndex = null;
    const favs = this.db.favorites;
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Favoritos</h1>
      </header>
      <div class="view-container animate-entrance">
        ${favs.length === 0 ? '<p style="text-align: center; opacity: 0.5;">No tienes favoritos aún.</p>' :
        favs.map((f, index) => `
            <div class="premium-card fav-card" 
                 style="margin-bottom: 1.25rem; border-left: 4px solid var(--accent); align-items: flex-start; text-align: left;"
                 onclick="window.app.toggleFavoriteSelection(${index})"
                 ondblclick="window.pendingVerseScroll='${f.verse}'; window.app.renderReader('${f.book}', '${f.chapter}')">
              <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="color: var(--accent); font-size: 0.95rem; font-weight: 700; cursor: pointer; padding: 0.5rem 0;"
                     onclick="event.stopPropagation(); window.pendingVerseScroll='${f.verse}'; window.app.renderReader('${f.book}', '${f.chapter}')">
                  ${f.book} ${f.chapter}:${f.verse}
                </div>
              </div>
              <div style="font-size: 1.05rem; line-height: 1.6; opacity: 0.9; text-align: left; width: 100%;">
                ${f.text}
              </div>
            </div>
          `).join('')}
      </div>
    `;
    this.render(html);
  }

  toggleNoteSelection(index) {
    const cards = document.querySelectorAll('.note-card');
    const card = cards[index];

    if (this.selectedNoteIndex === index) {
      this.clearNoteSelection();
    } else {
      this.clearNoteSelection();
      this.selectedNoteIndex = index;
      if (card) card.classList.add('selected');
      const bar = document.querySelector('#note-selection-bar');
      if (bar) bar.style.display = 'flex';
    }
  }

  clearNoteSelection() {
    if (this.selectedNoteIndex !== null) {
      const cards = document.querySelectorAll('.note-card');
      const oldCard = cards[this.selectedNoteIndex];
      if (oldCard) oldCard.classList.remove('selected');
    }
    this.selectedNoteIndex = null;
    const bar = document.querySelector('#note-selection-bar');
    if (bar) bar.style.display = 'none';
  }

  handleEditNoteFromBar() {
    if (this.selectedNoteIndex === null) return;
    const index = this.selectedNoteIndex;
    this.openEditNote(index);
    this.clearNoteSelection();
  }

  handleHighlight() {
    const bar = document.querySelector('#highlight-bar');
    if (bar) {
      bar.style.display = bar.style.display === 'flex' ? 'none' : 'flex';
      // Add borders to active color
      if (bar.style.display === 'flex' && this.selectedVerse) {
        const { book, chapter, vNum } = this.selectedVerse;
        const currentH = this.db.isHighlighted(book, chapter, vNum);
        const parent = bar;
        // Reset borders
        Array.from(parent.children).forEach(child => child.style.border = '1px solid #ccc');

        if (currentH) {
          const color = currentH.color;
          Array.from(parent.children).forEach(child => {
            if (child.dataset.color === color) {
              child.style.border = '3px solid var(--accent)';
            }
          });
        }
      }
    }
  }

  applyHighlight(color) {
    if (!this.selectedVerse) return;
    const { book, chapter, vNum, text } = this.selectedVerse;

    // Update DB
    if (color === 'transparent') {
      this.db.removeHighlight(book, chapter, vNum);
    } else {
      this.db.addHighlight(book, chapter, vNum, text, color);
    }

    // Direct DOM update to avoid scroll jump
    const verseEl = document.getElementById(`v-${vNum}`);
    if (verseEl) {
      const textEl = verseEl.querySelector('.verse-text');
      if (textEl) {
        if (color === 'transparent') {
          textEl.style.backgroundColor = 'transparent';
          textEl.style.color = 'inherit';
          textEl.style.padding = '0';
          textEl.style.borderRadius = '0';
        } else {
          textEl.style.backgroundColor = color;
          textEl.style.color = '#333';
          textEl.style.padding = '2px 4px';
          textEl.style.borderRadius = '4px';
          textEl.style.boxDecorationBreak = 'clone';
          textEl.style.webkitBoxDecorationBreak = 'clone';
        }
      }
    }

    // Close selection
    this.clearSelection();
  }

  renderHighlights() {
    this.currentView = 'highlights';
    const list = this.db.highlights;
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Marcadores</h1>
      </header>
      <div class="view-container animate-entrance">
        ${list.length === 0 ? '<p style="text-align: center; opacity: 0.5;">No tienes marcadores aún.</p>' :
        list.map((h, index) => `
            <div class="premium-card highlight-card" style="margin-bottom: 1rem; border-left: 4px solid ${h.color};" onclick="window.app.toggleHighlightSelection(${index})">
                <div style="flex: 1;">
                     <div style="color: var(--accent); font-size: 0.9rem; font-weight: 700; margin-bottom: 0.25rem;">
                        ${h.book} ${h.chapter}:${h.verse}
                     </div>
                     <div style="font-size: 1rem; opacity: 0.9;">${h.text}</div>
                </div>
            </div>
        `).join('')}
      </div>
      <!-- Barra flotante para marcadores -->
      <div id="highlight-selection-bar" class="floating-toolbar animate-entrance" style="display: none;">
          <button class="tool-btn" onclick="window.app.confirmDeleteHighlightFromBar()" title="Eliminar Marcador"
              style="color: #ef4444;">
              ${createIcon('trash-2')}
          </button>
          <button class="tool-btn" onclick="window.app.navigateToSelectedHighlight()" title="Ir al Versículo"
              style="color: var(--accent);">
              ${createIcon('external-link')}
          </button>
          <button class="tool-btn" onclick="window.app.clearHighlightSelection()" title="Cerrar">
              ${createIcon('x')}
          </button>
      </div>
    `;
    this.render(html);
  }

  toggleHighlightSelection(index) {
    const cards = document.querySelectorAll('.highlight-card');
    const card = cards[index];

    if (this.selectedHighlightIndex === index) {
      this.clearHighlightSelection();
    } else {
      this.clearHighlightSelection();
      this.selectedHighlightIndex = index;
      if (card) card.classList.add('selected');
      const bar = document.querySelector('#highlight-selection-bar');
      if (bar) bar.style.display = 'flex';
    }
  }

  clearHighlightSelection() {
    if (this.selectedHighlightIndex !== null) {
      const cards = document.querySelectorAll('.highlight-card');
      const oldCard = cards[this.selectedHighlightIndex];
      if (oldCard) oldCard.classList.remove('selected');
    }
    this.selectedHighlightIndex = null;
    const bar = document.querySelector('#highlight-selection-bar');
    if (bar) bar.style.display = 'none';
  }

  navigateToSelectedHighlight() {
    if (this.selectedHighlightIndex === null) return;
    const h = this.db.highlights[this.selectedHighlightIndex];
    if (h) {
      this.clearHighlightSelection();
      window.pendingVerseScroll = h.verse;
      this.renderReader(h.book, h.chapter);
    }
  }

  confirmDeleteHighlightFromBar() {
    if (this.selectedHighlightIndex === null) return;
    const index = this.selectedHighlightIndex;
    this.openConfirmModal(
      "Eliminar Marcador",
      "¿Quieres eliminar este marcador?",
      () => {
        this.db.deleteHighlight(index);
        this.clearHighlightSelection();
        this.renderHighlights();
      }
    );
  }

  confirmDeleteHighlight(index) {
    this.openConfirmModal(
      "Eliminar Marcador",
      "¿Quieres eliminar este marcador?",
      () => {
        this.db.deleteHighlight(index);
        this.renderHighlights();
      }
    );
  }

  confirmDeleteNoteFromBar() {
    if (this.selectedNoteIndex === null) return;
    const index = this.selectedNoteIndex;
    this.openConfirmModal(
      "Eliminar Nota",
      "¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.",
      () => {
        this.db.deleteNote(index);
        this.clearNoteSelection();
        this.renderNotes();
      }
    );
  }

  renderNotes() {
    this.currentView = 'notes';
    this.selectedNoteIndex = null;
    const notes = this.db.notes;
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Mis Notas</h1>
      </header>
      <div class="view-container animate-entrance">
        ${notes.length === 0 ? '<p style="text-align: center; opacity: 0.5;">No tienes notas aún.</p>' :
        notes.map((n, index) => `
            <div class="premium-card note-card" style="margin-bottom: 1.25rem; align-items: flex-start; text-align: left; padding-bottom: 1rem;"
                 onclick="window.app.toggleNoteSelection(${index})">
              <div style="color: var(--accent); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 700; width: 100%;">
                <span>${n.book} ${n.chapter}:${n.verse}</span>
              </div>
              <div style="font-size: 0.9rem; opacity: 0.5; margin-bottom: 0.5rem; border-left: 2px solid var(--accent); padding-left: 0.75rem;">"${n.text}"</div>
              <div style="background: var(--accent-soft); width: 100%; padding: 1rem; border-radius: 12px; font-size: 1.05rem; line-height: 1.5; margin-bottom: 0.5rem;">${n.note}</div>
              <div style="width: 100%; text-align: right; opacity: 0.3; font-size: 0.7rem;">${new Date(n.date).toLocaleString()}</div>
            </div>
          `).join('')}
      </div>
    `;
    this.render(html);
  }

  renderSearch() {
    this.currentView = 'search';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Buscador</h1>
      </header>
      <div class="view-container animate-entrance">
        <input type="text" id="search-input" placeholder="¿Qué estás buscando?..." class="search-box">
        <div id="search-results">
        </div>
      </div>
    `;
    this.render(html);
    document.querySelector('#search-input').addEventListener('input', (e) => {
      const query = e.target.value;
      if (query.length > 2) this.performSearch(query);
    });
  }

  performSearch(query) {
    const results = this.db.search(query);
    const resultsEl = document.querySelector('#search-results');
    resultsEl.innerHTML = `
      <p style="margin-bottom: 1.25rem; opacity: 0.5; font-size: 0.9rem;">${results.length} coincidencias encontradas</p>
      ${results.map(r => `
        <div class="premium-card" style="margin-bottom: 1rem; align-items: flex-start; text-align: left;" onclick="window.app.renderReader('${r.book}', '${r.chapter}')">
          <div style="color: var(--accent); font-size: 0.85rem; margin-bottom: 0.4rem; font-weight: 700;">${r.book} ${r.chapter}:${r.vNum}</div>
          <div style="font-size: 1rem; line-height: 1.5;">${r.text}</div>
        </div>
      `).join('')}
    `;
  }

  renderDictionary() {
    this.currentView = 'dict';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Diccionario</h1>
      </header>
      <div class="view-container animate-entrance">
        <div style="position: relative; margin-bottom: 1.5rem;">
          <input type="text" id="dict-input" placeholder="¿Qué término buscas?..." class="search-box" style="margin-bottom: 0;">
          <button id="clear-dict" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--accent); cursor: pointer; display: none;">
            ${createIcon('x-circle')}
          </button>
        </div>
        <div id="dict-results">
            <div style="text-align: center; opacity: 0.5; margin-top: 3rem;">
                ${createIcon('book-a')}
                <p style="margin-top: 1rem;">Busca palabras bíblicas y significados</p>
            </div>
        </div>
      </div>
    `;
    this.render(html);
    const input = document.querySelector('#dict-input');
    const clearBtn = document.querySelector('#clear-dict');

    input.addEventListener('input', (e) => {
      this.performDictSearch(e.target.value);
      clearBtn.style.display = e.target.value ? 'block' : 'none';
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      this.performDictSearch('');
    });
  }

  performDictSearch(query) {
    const resultsEl = document.querySelector('#dict-results');
    if (!query) {
      resultsEl.innerHTML = `
            <div style="text-align: center; opacity: 0.5; margin-top: 3rem;">
                ${createIcon('book-a')}
                <p style="margin-top: 1rem;">Busca palabras bíblicas y significados</p>
            </div>
        `;
      return;
    }
    const results = this.db.searchDictionary(query);
    resultsEl.innerHTML = `
      <p style="margin-bottom: 1rem; opacity: 0.5; font-size: 0.85rem;">${results.length} definiciones encontradas</p>
      ${results.map(r => `
        <div class="premium-card animate-entrance" style="margin-bottom: 1.25rem; align-items: flex-start; text-align: left; padding: 1.5rem; background: var(--bg-color); border-color: var(--accent-soft);">
          <h3 style="color: var(--accent); margin-bottom: 0.75rem; font-size: 1.2rem; font-family: 'Playfair Display', serif;">${r.term}</h3>
          <p style="font-size: 1rem; line-height: 1.7; color: var(--text-main); font-weight: 400;">${r.definition}</p>
        </div>
      `).join('')}
    `;
  }

  renderAbout() {
    this.currentView = 'about';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Acerca de</h1>
      </header>
      <div class="view-container animate-entrance" style="text-align: center; display: flex; flex-direction: column; gap: 1.5rem; padding-top: 2rem;">
        <div style="margin: 0 auto; width: 100px; height: 100px; position: relative;">
          <img src="/icon.png" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 3px solid var(--accent-soft);">
        </div>
        
        <div>
          <h2 style="font-size: 1.8rem; margin-bottom: 0.25rem; color: var(--text-main);">Biblia Cristiana</h2>
          <p style="opacity: 0.5; font-weight: 600; letter-spacing: 1px; font-size: 0.8rem;">REINA VALERA 1960</p>
        </div>

        <div class="premium-card" style="background: var(--accent-soft); border-color: var(--accent); padding: 1.25rem;">
          <p style="font-style: italic; font-size: 1.1rem; line-height: 1.6; font-family: 'Playfair Display', serif;">
            "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."
          </p>
          <p style="margin-top: 0.75rem; color: var(--accent); font-weight: 800; font-size: 0.85rem;">SALMOS 119:105</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center;">
            <p style="font-size: 0.9rem; opacity: 0.7;">Desarrollado por <b onclick="window.app.handleAboutClick()" style="cursor: pointer; color: var(--accent);">krafairus</b></p>
            <a href="https://github.com/krafairus/biblia-cristiana-rv1960-app" target="_blank" class="about-action-btn">
              ${createIcon('github')} Ver Código en GitHub
            </a>
          </div>

          <div style="height: 1px; background: var(--glass-border); width: 40%; margin: 0.5rem auto;"></div>

          <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <p style="opacity: 0.6; font-size: 0.85rem;">Dedicada a la congregación:</p>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
                <img src="/img/logo-congregacion.png" alt="" onerror="this.style.display='none'" style="max-height: 80px; width: auto; border-radius: 12px;">
                <h3 style="color: var(--accent); font-size: 1.2rem;">"Sembradores de luz y esperanza"</h3>
            </div>
            <a href="https://www.facebook.com/p/Sembradores-de-luz-y-esperanza-100079821227480/" target="_blank" class="about-action-btn" style="background: #1877F2; color: white;">
              ${createIcon('facebook')} Ir a Facebook
            </a>
          </div>
          
          <p style="font-size: 0.95rem; opacity: 0.8; padding: 0.5rem 1.5rem; line-height: 1.6; font-style: italic;">
            Y para todo aquel que busque en las Escrituras el camino hacia la verdad y la vida eterna.
          </p>

          <div style="margin-top: 2rem; padding: 1.5rem; background: var(--card-bg); border-radius: 16px; font-size: 0.85rem; text-align: left; border: 1px solid var(--glass-border);">
            <h4 style="color: var(--accent); margin-bottom: 0.5rem;">Licencia y Garantía</h4>
            <p style="opacity: 0.7; margin-bottom: 0.75rem;">Esta aplicación se distribuye bajo la <b>Licencia Pública General de GNU v3.0 (GPLv3)</b>.</p>
            <p style="opacity: 0.7; margin-bottom: 0.75rem;">Esto garantiza que el software sea siempre libre y de código abierto, incluso en sus versiones derivadas.</p>
            <p style="opacity: 0.6; font-size: 0.8rem; line-height: 1.4;">
                EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO. 
                Creado sin fines de lucro para apoyar a la comunidad cristiana y facilitar el acceso a la Palabra de Dios. 
            </p>
          </div>
        </div>

        <p style="font-size: 0.8rem; opacity: 0.3; margin-top: 1rem;">VERSIÓN 1.1.5</p>
      </div>
    `;
    this.render(html);
  }

  async renderVerseOfDay() {
    this.currentView = 'vod';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Versículo del Día</h1>
      </header>
      <div class="view-container animate-entrance" style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
        <div id="vod-card" class="premium-card" style="width: 100%; min-height: 300px; justify-content: center; background-size: cover; background-position: center; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.5); padding: 2.5rem; position: relative; border: none;">
            <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.3); z-index: 1; border-radius: var(--radius);"></div>
            <div id="vod-content" style="z-index: 2; position: relative;">
                <p style="font-size: 1.25rem; font-style: italic; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Playfair Display', serif;">Cargando versículo...</p>
                <div style="font-weight: 700; color: var(--accent); font-size: 0.9rem;">REINA VALERA 1960</div>
            </div>
        </div>

        <div style="width: 100%;">
          <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase;">Seleccionar Fondo</p>
          <div id="bg-selector" style="display: flex; overflow-x: auto; gap: 0.75rem; padding-bottom: 0.5rem; scrollbar-width: none;">
            ${[1, 2, 3, 4, 5].map(i => `
              <div class="bg-thumb" onclick="window.app.changeVodBg(${i})" 
                   style="min-width: 60px; height: 60px; border-radius: 12px; background-image: url('/img/bg-verse-${i}.png'); background-size: cover; border: 2px solid var(--glass-border); flex-shrink: 0;">
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%;">
            <button class="premium-card" onclick="window.app.handleCopyVod()" style="flex-direction: row; gap: 0.5rem; padding: 1rem; border: 1px solid var(--accent); color: var(--text-main);">
                ${createIcon('copy')} Copiar
            </button>
            <button class="premium-card" onclick="window.app.showShareOptions()" style="flex-direction: row; gap: 0.5rem; padding: 1rem; background: var(--accent); color: white; border: none;">
                ${createIcon('share-2')} Compartir
            </button>
        </div>
      </div>
    `;
    this.render(html);
    this.loadDailyVerse();
  }

  renderShareVerse(verseData) {
    this.currentView = 'share-verse';
    this.currentVod = verseData; // Reutilizamos para no duplicar lógica de canvas

    const html = `
      <header>
        <button class="btn-icon" onclick="window.pendingVerseScroll='${verseData.vNum}'; window.app.renderReader('${verseData.book}', '${verseData.chapter}')">${createIcon('chevron-left')}</button>
        <h1>Compartir</h1>
      </header>
      <div class="view-container animate-entrance" style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
        <div id="vod-card" class="premium-card" style="width: 100%; min-height: 300px; justify-content: center; background-size: cover; background-position: center; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.5); padding: 2.5rem; position: relative; border: none;">
            <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.3); z-index: 1; border-radius: var(--radius);"></div>
            <div id="vod-content" style="z-index: 2; position: relative;">
                 <p style="font-size: 1.4rem; font-style: italic; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Playfair Display', serif;">
                    "${verseData.text}"
                </p>
                <div style="font-weight: 700; color: #fff; font-size: 1.1rem; margin-bottom: 0.25rem;">${verseData.ref}</div>
                <div style="font-weight: 700; color: var(--accent); font-size: 0.8rem; letter-spacing: 1px;">REINA VALERA 1960</div>
            </div>
        </div>

        <div style="width: 100%;">
          <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase;">Seleccionar Fondo</p>
          <div id="bg-selector" style="display: flex; overflow-x: auto; gap: 0.75rem; padding-bottom: 0.5rem; scrollbar-width: none;">
            ${[1, 2, 3, 4, 5].map(i => `
              <div class="bg-thumb" onclick="window.app.changeVodBg(${i})" 
                   style="min-width: 60px; height: 60px; border-radius: 12px; background-image: url('/img/bg-verse-${i}.png'); background-size: cover; border: 2px solid var(--glass-border); flex-shrink: 0;">
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; width: 100%;">
            <button class="premium-card" onclick="window.app.showShareOptions()" style="flex-direction: row; gap: 0.5rem; padding: 1.25rem; background: var(--accent); color: white; border: none;">
                ${createIcon('share-2')} Compartir Imagen
            </button>
        </div>
      </div>
    `;
    this.render(html);
    this.changeVodBg(1); // Default bg
  }

  changeVodBg(index) {
    this.currentVodBg = `/img/bg-verse-${index}.png`;
    const card = document.querySelector('#vod-card');
    if (card) card.style.backgroundImage = `url('${this.currentVodBg}')`;
    document.querySelectorAll('.bg-thumb').forEach((el, i) => {
      el.style.borderColor = (i + 1 === index) ? 'var(--accent)' : 'var(--glass-border)';
    });
  }

  handleCopyVod() {
    if (!this.currentVod) return;
    const shareText = `"${this.currentVod.text}" - ${this.currentVod.ref}\n\nEnviado desde Biblia Cristiana RV 1960`;
    navigator.clipboard.writeText(shareText).then(() => this.showToast("Copiado al portapapeles"));
  }

  showShareOptions() {
    const modal = document.querySelector('#share-modal');
    if (!modal) return;

    const imgText = document.querySelector('#share-modal-img-text');
    const txtText = document.querySelector('#share-modal-txt-text');
    const txtIcon = document.querySelector('#share-modal-txt-icon');

    if (this.currentView === 'reader') {
      if (imgText) imgText.innerText = 'Compartir Imagen';
      if (txtText) txtText.innerText = 'Copiar Texto';
      if (txtIcon) {
        txtIcon.setAttribute('data-lucide', 'copy');
      }
    } else {
      // VOD o ShareVerse view
      if (imgText) imgText.innerText = 'Compartir Imagen';
      if (txtText) txtText.innerText = 'Compartir como Texto';
      if (txtIcon) {
        txtIcon.setAttribute('data-lucide', 'share-2');
      }
    }

    this.refreshIcons();
    modal.classList.add('active');
  }

  closeShareModal() {
    const modal = document.querySelector('#share-modal');
    if (modal) modal.classList.remove('active');
  }

  async loadDailyVerse() {
    try {
      const v = this.db.getRandomVerse();
      if (!v) throw new Error('No Bible data');
      this.currentVod = { text: v.text, ref: `${v.book} ${v.chapter}:${v.verse}` };
      this.updateVodUI();
    } catch (e) {
      console.error("Error loading VOD:", e);
      const contentEl = document.querySelector('#vod-content p');
      if (contentEl) contentEl.innerText = "No se pudo cargar el versículo.";
    }
  }

  updateVodUI() {
    const card = document.querySelector('#vod-card');
    const contentEl = document.querySelector('#vod-content');
    if (!card || !contentEl) return;
    card.style.backgroundImage = `url('${this.currentVodBg}')`;
    contentEl.innerHTML = `
      <p style="font-size: 1.4rem; font-style: italic; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Playfair Display', serif;">
        "${this.currentVod.text}"
      </p>
      <div style="font-weight: 700; color: #fff; font-size: 1.1rem; margin-bottom: 0.25rem;">${this.currentVod.ref}</div>
      <div style="font-weight: 700; color: var(--accent); font-size: 0.8rem; letter-spacing: 1px;">REINA VALERA 1960</div>
    `;
  }
  async generateVerseCanvas() {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = window.location.origin + this.currentVodBg;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, 1080, 1080);
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(0, 0, 1080, 1080);
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const fontSize = 54;
          ctx.font = `italic ${fontSize}px serif`;
          if (document.fonts.check(`italic ${fontSize}px "Playfair Display"`)) {
            ctx.font = `italic ${fontSize}px "Playfair Display", serif`;
          }

          const words = `"${this.currentVod.text}"`.split(' ');
          let line = '';
          let lines = [];
          const maxWidth = 860;
          for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              lines.push(line);
              line = words[n] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          let startY = 540 - (lines.length * fontSize * 1.3) / 2;
          lines.forEach((l, i) => {
            ctx.fillText(l.trim(), 540, startY + (i * fontSize * 1.3));
          });

          ctx.fillStyle = '#c29958';
          ctx.font = 'bold 48px sans-serif';
          ctx.fillText(this.currentVod.ref.toUpperCase(), 540, startY + (lines.length * fontSize * 1.3) + 80);

          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.font = '30px sans-serif';
          ctx.fillText('BIBLIA CRISTIANA RV1960', 540, 1020);
          resolve(canvas);
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error("Error al cargar el fondo"));
    });
  }

  async shareVerse(type) {
    this.closeShareModal();

    // Si estamos en el lector e iniciamos el proceso de compartir
    if (this.currentView === 'reader' && this.selectedVerse) {
      if (type === 'image') {
        const v = this.selectedVerse;
        this.renderShareVerse({ text: v.text, ref: `${v.book} ${v.chapter}:${v.vNum}`, book: v.book, chapter: v.chapter, vNum: v.vNum });
        return;
      } else if (type === 'text') {
        this.handleCopy();
        return;
      }
    }

    // Comportamiento para Versículo del Día o cuando ya estamos en la vista de compartir
    if (!this.currentVod) return;
    const shareText = `"${this.currentVod.text}" \n\n- ${this.currentVod.ref}\nEnviado desde Biblia Cristiana RV 1960`;

    if (type === 'text') {
      const data = { title: 'Compartir Versículo', text: shareText };
      const Capacitor = window.Capacitor;

      if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.Share) {
        try {
          await Capacitor.Plugins.Share.share({
            title: 'Compartir Versículo',
            text: shareText
          });
          return;
        } catch (e) {
          console.error("Capacitor share error:", e);
        }
      }

      const shareable = await this.canShareData(data);
      if (shareable) {
        try { await navigator.share(shareable); }
        catch (e) { if (e.name !== 'AbortError') this.handleCopyVod(); }
      } else { this.handleCopyVod(); }
    } else if (type === 'image') {
      this.showToast("Preparando imagen...");
      try {
        const canvas = await this.generateVerseCanvas();
        const base64Data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        const Capacitor = window.Capacitor;

        if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.Filesystem && Capacitor.Plugins.Share) {
          const Filesystem = Capacitor.Plugins.Filesystem;
          const Share = Capacitor.Plugins.Share;

          const writeResult = await Filesystem.writeFile({
            path: 'temp_share.jpg',
            data: base64Data,
            directory: 'CACHE'
          });

          await Share.share({
            title: 'Compartir Versículo',
            text: shareText,
            url: writeResult.uri,
            dialogTitle: 'Compartir Imagen'
          });
        } else {
          this.fallbackDownload(canvas);
        }
      } catch (e) {
        console.error("Share error:", e);
        this.showToast("Error al compartir imagen.");
      }
    }
  }

  async saveImageDirectly() {
    this.closeShareModal();
    if (!this.currentVod) return;
    this.showToast("Preparando guardado...");

    try {
      const canvas = await this.generateVerseCanvas();
      const base64Data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      const Capacitor = window.Capacitor;

      if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.Filesystem) {
        const Filesystem = Capacitor.Plugins.Filesystem;
        const perm = await Filesystem.checkPermissions();
        if (perm.publicStorage !== 'granted') await Filesystem.requestPermissions();

        const writeResult = await Filesystem.writeFile({
          path: 'temp_save.jpg',
          data: base64Data,
          directory: 'CACHE'
        });

        if (Capacitor.Plugins.Share) {
          await Capacitor.Plugins.Share.share({
            title: 'Guardar Versículo',
            url: writeResult.uri,
            dialogTitle: 'Guardar Versículo como...'
          });
          this.showToast("Cargando opciones de guardado...");
        } else {
          this.fallbackDownload(canvas);
        }
      } else {
        this.fallbackDownload(canvas);
      }
    } catch (e) {
      console.error("Save error:", e);
      this.showToast("Error al procesar la imagen.");
    }
  }

  fallbackDownload(canvas) {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().getTime();
      link.download = `bendicion_${timestamp}.jpg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast("Intento de descarga iniciado...");
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/jpeg', 0.9);
  }

  handleAboutClick() {
    this.aboutClickCount++;
    if (this.aboutClickCount >= 3) {
      this.aboutClickCount = 0;
      this.openLoveModal();
    }
    // Reset counter after 2 seconds of inactivity
    clearTimeout(this.aboutClickTimeout);
    this.aboutClickTimeout = setTimeout(() => { this.aboutClickCount = 0; }, 2000);
  }

  openLoveModal() {
    const modal = document.querySelector('#love-modal');
    if (modal) modal.classList.add('active');
  }

  closeLoveModal() {
    const modal = document.querySelector('#love-modal');
    if (modal) modal.classList.remove('active');
  }
  async toggleTTS(book, chapter) {
    if (this.isSpeaking) {
      this.stopTTS();
      return;
    }

    const verses = this.db.getVerses(book, chapter);
    if (!verses || verses.length === 0) return;

    // Construir texto detallado: Título, Perícopes y Versículos
    let parts = [`${book}, capítulo ${chapter}. `];

    verses.forEach(([vNum, text]) => {
      // Intentar obtener perícopa para este versículo
      const pericope = this.db.getPericope(book, chapter, vNum);
      if (pericope) {
        parts.push(`${pericope}. `); // Lectura directa del título con pausa
      }

      // Respetar ajuste de omitir números de verso
      if (this.db.settings.skip_verse_numbers) {
        parts.push(`${text} `);
      } else {
        parts.push(`Verso ${vNum}. ${text} `);
      }
    });

    const fullText = parts.join('');

    const Capacitor = window.Capacitor;
    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech) {
      try {
        this.isSpeaking = true;
        this.updateTTSButton(true);

        // Intentar obtener el idioma de la voz seleccionada o forzar es-ES
        let speakLang = 'es-ES';
        let voiceIndex = this.db.settings.tts_voice;

        try {
          const result = await Capacitor.Plugins.TextToSpeech.getSupportedVoices();
          const allVoices = result.voices;

          // Lógica de autodetect para español si estamos en "Predeterminada" o voz no válida
          if ((voiceIndex === 0 && !this.db.settings.tts_voice_name) || !allVoices[voiceIndex]) {
            const firstEsp = allVoices.findIndex(v => v.lang.toLowerCase().startsWith('es'));
            if (firstEsp !== -1) {
              voiceIndex = firstEsp;
              speakLang = allVoices[voiceIndex].lang;
            }
          } else {
            speakLang = allVoices[voiceIndex].lang;
          }
        } catch (e) {
          console.warn("Could not detect specific voice lang, using default es-ES");
        }

        await Capacitor.Plugins.TextToSpeech.speak({
          text: fullText,
          lang: speakLang,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          voice: voiceIndex,
          category: 'playback'
        });

        // Cuando termina de hablar naturalmente
        this.isSpeaking = false;
        this.updateTTSButton(false);
      } catch (e) {
        console.error("TTS Error, attempting fallback:", e);
        await this.handleTTSFallback(fullText);
      }
    } else {
      this.showToast("TTS no disponible en este dispositivo");
    }
  }

  async handleTTSFallback(text) {
    const Capacitor = window.Capacitor;
    if (!Capacitor || !Capacitor.Plugins.TextToSpeech) return;

    try {
      this.showToast("Cambiando a voz de respaldo...");
      const result = await Capacitor.Plugins.TextToSpeech.getSupportedVoices();
      const spanishVoiceIndex = result.voices.findIndex(v => v.lang.toLowerCase().startsWith('es'));

      if (spanishVoiceIndex !== -1) {
        await Capacitor.Plugins.TextToSpeech.speak({
          text: text,
          lang: result.voices[spanishVoiceIndex].lang,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          voice: spanishVoiceIndex,
          category: 'playback'
        });
      }
    } catch (fallbackError) {
      console.error("Critical TTS Failure:", fallbackError);
      this.stopTTS();
      this.showToast("No se pudo iniciar el audio");
    } finally {
      this.isSpeaking = false;
      this.updateTTSButton(false);
    }
  }

  async stopTTS() {
    const Capacitor = window.Capacitor;
    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech) {
      await Capacitor.Plugins.TextToSpeech.stop();
    }
    this.isSpeaking = false;
    this.updateTTSButton(false);
  }

  updateTTSButton(isSpeaking) {
    const btn = document.getElementById('tts-btn');
    if (btn) {
      btn.innerHTML = createIcon(isSpeaking ? 'volume-x' : 'volume-2');
      if (isSpeaking) {
        btn.classList.add('active');
        btn.style.background = 'var(--accent)';
        btn.style.color = 'white';
      } else {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.color = '';
      }
      this.refreshIcons();
    }
  }

  toggleVerseNumbers(checked) {
    this.db.settings.skip_verse_numbers = !checked;
    this.db.saveSettings();
    this.showToast(!this.db.settings.skip_verse_numbers ? "Los versos se leerán con números" : "Lectura fluida activada");
  }

  async openVoiceModal() {
    const Capacitor = window.Capacitor;
    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech) {
      try {
        const result = await Capacitor.Plugins.TextToSpeech.getSupportedVoices();
        const allVoices = result.voices.map((v, i) => ({ ...v, originalIndex: i }));
        let voices = allVoices.filter(v => v.lang.toLowerCase().startsWith('es'));
        if (voices.length === 0) voices = allVoices;

        // Si no hay voz seleccionada o la seleccionada no es española, sugerir la primera de la lista
        if ((this.db.settings.tts_voice === 0 && !this.db.settings.tts_voice_name) ||
          !voices.find(v => v.originalIndex === this.db.settings.tts_voice)) {
          if (voices.length > 0) {
            const firstEsp = voices[0];
            this.db.settings.tts_voice = firstEsp.originalIndex;
            this.db.settings.tts_voice_name = firstEsp.name;
            this.db.saveSettings();
          }
        }

        this.renderVoiceModal(voices);
      } catch (e) {
        console.error("Error fetching voices:", e);
        this.showToast("No se pudieron cargar las voces");
      }
    } else {
      this.showToast("TTS no disponible");
    }
  }

  renderVoiceModal(voices) {
    const modal = document.createElement('div');
    modal.id = 'voice-modal';
    modal.className = 'modal-overlay animate-entrance';
    modal.style.zIndex = '2000';

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 95%; width: 440px; border-radius: 24px; padding: 1.5rem; background: var(--bg-color); box-shadow: var(--shadow); border: 1px solid var(--glass-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--text-main); margin: 0;">Elegir Voz</h2>
          <button class="btn-icon" onclick="window.app.closeVoiceModal()" style="background: var(--verse-hover); width: 32px; height: 32px;">${createIcon('x')}</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 55vh; overflow-y: auto; padding-right: 0.5rem;">
          ${voices.map(v => {
      const isSelected = this.db.settings.tts_voice === v.originalIndex;
      let displayName = v.name.replace(/español/gi, '').replace(/\(.*\)/g, '').trim();
      if (!displayName) displayName = v.name;

      return `
              <div class="premium-card" onclick="window.app.applyVoice(${v.originalIndex}, '${v.name.replace(/'/g, "\\'")}')" 
                   style="padding: 1.15rem 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; text-align: left; border: ${isSelected ? '2px solid var(--accent)' : '1px solid var(--glass-border)'}; background: ${isSelected ? 'var(--accent-soft)' : 'var(--card-bg)'}; cursor: pointer; display: flex !important;">
                <div style="display: flex; flex-direction: column; gap: 0.25rem; flex-grow: 1; align-items: flex-start; min-width: 0;">
                    <span style="font-size: 1rem; font-weight: 700; color: var(--text-main); width: 100%;">${displayName}</span>
                    <span style="font-size: 0.75rem; opacity: 0.6; color: var(--text-muted); font-weight: 600;">${v.lang.toUpperCase()}</span>
                </div>
                ${isSelected ? `<div style="color: var(--accent); flex-shrink: 0; margin-left: 1rem;">${createIcon('check-circle')}</div>` : ''}
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    this.refreshIcons();
  }

  closeVoiceModal() {
    const modal = document.getElementById('voice-modal');
    if (modal) modal.remove();
  }

  cleanText(text) {
    return text.replace(/<[^>]*>?/gm, ''); // Elimina tags HTML si los hubiera
  }
}
window.app = new App();
