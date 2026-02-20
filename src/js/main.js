import '../css/style.css';
import { BibleDB } from './db.js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Zip } from 'capa-zip';
import { FilePicker } from '@capawesome/capacitor-file-picker';

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
    this.isPaused = false;
    this.currentVerseIndex = 0;
    this.currentChapterVerses = [];
    this.aboutClickCount = 0;
    this.appVersion = '1.2.6';
    this.repo = 'krafairus/biblia-cristiana-rv1960-app';
    this.currentHighlightFilter = 'all';
    this.searchFilter = 'all';
    this.searchBook = null;
    this.notesSortOrder = 'desc'; // 'asc' or 'desc'
    this.favoritesSortOrder = 'desc';
    this.highlightsSortOrder = 'desc';
    this.devotionalSortOrder = 'desc';
    this.selectedNoteIndex = null;
    this.isNoteSearching = false;

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
      this.migrateThemes();
      this.applyTheme();
      this.watchSystemTheme();
      this.renderHome();
      this.checkForUpdates(true);
    } else {
      this.appEl.innerHTML = '<div class="error" style="height: 100vh; display: flex; align-items: center; justify-content: center; color: white;">Error al cargar la Biblia. Por favor recarga.</div>';
    }
  }

  migrateThemes() {
    const s = this.db.settings;
    if (!s.theme_style) {
      // Migración de versión anterior
      const oldTheme = s.theme || 'classic';
      if (oldTheme === 'dark') {
        s.theme_style = 'classic';
        s.theme_mode = 'dark';
      } else if (oldTheme === 'light') {
        s.theme_style = 'classic';
        s.theme_mode = 'light';
      } else if (oldTheme === 'floral') {
        s.theme_style = 'floral';
        s.theme_mode = 'light';
      } else if (oldTheme === 'pastel-blue') {
        s.theme_style = 'pastel-blue';
        s.theme_mode = 'light';
      } else if (oldTheme === 'ink') {
        s.theme_style = 'ink';
        s.theme_mode = 'light';
      } else {
        s.theme_style = 'classic';
        s.theme_mode = 'light';
      }
      if (s.system_theme === undefined) s.system_theme = false;
      this.db.saveSettings();
    }
  }

  applyTheme(style, mode) {
    const s = this.db.settings;
    if (style) s.theme_style = style;
    if (mode) s.theme_mode = mode;

    // Si la sincronización con el sistema está activa, sobreescribimos el modo temporalmente
    let finalMode = s.theme_mode || 'light';
    if (s.system_theme) {
      finalMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-style', s.theme_style);
    document.documentElement.setAttribute('data-mode', finalMode);

    this.db.saveSettings();
    if (this.currentView === 'settings') {
      this.renderSettings();
    }
  }

  toggleMode() {
    const s = this.db.settings;
    if (s.system_theme) {
      this.showToast("La sincronización con el sistema está activa");
      return;
    }
    const newMode = s.theme_mode === 'light' ? 'dark' : 'light';
    this.applyTheme(null, newMode);
  }

  watchSystemTheme() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.db.settings.system_theme) {
        this.applyTheme();
      }
    });
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
      { text: "Buscar", icon: "search", target: "search" },
      { text: "Última lectura", icon: "history", target: "last" },
      { text: "Vr del dia", icon: "sun", target: "vod" },
      { text: "Devocional", icon: "coffee", target: "devotional" },
      { text: "Favoritos", icon: "heart", target: "favorites" },
      { text: "Notas", icon: "sticky-note", target: "notes" },
      { text: "Marcadores", icon: "highlighter", target: "highlights" },
      { text: "Diccionario", icon: "book-a", target: "dict" },
      { text: "Ajustes", icon: "settings", target: "settings" }
    ];

    const vod = this.db.getVerseOfDay();
    // Usar la semilla del día para el fondo aleatorio (para que sea el mismo todo el día)
    const seed = new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate();
    const bgNum = (seed % 11) + 1;

    const html = `
      <header>
        <h1 style="font-family: 'Playfair Display', serif;">Biblia Cristiana</h1>
        <div style="font-size: 0.8rem; opacity: 0.5; color: var(--accent); margin-right: auto; padding-left: 0.5rem;">RV 1960</div>
        ${this.db.settings.theme_style !== 'ink' ? `
        <button class="btn-icon" onclick="window.app.toggleMode()" id="theme-toggle-btn">
          ${createIcon(this.db.settings.theme_mode === 'dark' ? 'sun' : 'moon')}
        </button>
        ` : ''}
      </header>
      <div class="view-container animate-entrance">
        ${vod ? `
          <div class="home-vod-card" onclick="window.pendingVerseScroll = '${vod.verse}'; window.app.renderReader('${vod.book}', '${vod.chapter}')"
               style="background-image: url('/img/bg-verse-${bgNum}.png')">
            <div class="vod-thematic">${vod.thematic}</div>
            <div class="vod-text">"${vod.text}"</div>
            <div class="vod-ref">${vod.book} ${vod.chapter}:${vod.verse}</div>
            <div style="position: absolute; bottom: 1rem; right: 1rem; opacity: 0.5; font-size: 0.7rem; font-weight: 700;">VERSÍCULO DEL DÍA</div>
          </div>
        ` : ''}
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
    this.clearHighlightSelection(); // Limpiar selección de highlights al navegar
    this.clearNoteSelection();
    this.closeShareModal();

    // Resetear filtros de búsqueda al salir de la vista de búsqueda
    if (target !== 'search') {
      this.searchFilter = 'all';
      this.searchBook = null;
    }

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
    else if (target === 'devotional') this.renderDevotional();
    else if (target === 'note-editor') {
      // note-editor se maneja específicamente con parámetros, pero navigate lo limpia todo
    }
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
            <div class="premium-card" onclick="window.app.renderVerseList('${book.replace(/'/g, "\\'")}', '${ch}')" 
                 style="aspect-ratio: 1/1; justify-content: center; align-items: center; padding: 0; font-size: 1.1rem; font-weight: 700; border-radius: 12px;">
              ${ch}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.render(html);
  }

  renderVerseList(book, chapter) {
    this.currentView = 'verses';
    const verses = this.db.getVerses(book, chapter);
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.renderChapterList('${book.replace(/'/g, "\\'")}')">${createIcon('chevron-left')}</button>
        <h1 style="font-size: 1.2rem;">${book} ${chapter}</h1>
      </header>
      <div class="view-container animate-entrance">
        <p style="opacity: 0.6; font-size: 0.9rem; margin-bottom: 1.5rem; font-weight: 600; text-transform: uppercase; text-align: center;">Seleccionar Versículo</p>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem;">
          ${verses.map(([vNum]) => `
            <div class="premium-card" onclick="window.pendingVerseScroll='${vNum}'; window.app.renderReader('${book.replace(/'/g, "\\'")}', '${chapter}')" 
                 style="aspect-ratio: 1/1; justify-content: center; align-items: center; padding: 0; font-size: 1.1rem; font-weight: 700; border-radius: 12px;">
              ${vNum}
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
            ${createIcon(this.isSpeaking ? (this.isPaused ? 'play' : 'pause') : 'volume-2')}
          </button>
          <button class="btn-icon" id="tts-controls-btn" 
                  style="display: ${this.isSpeaking ? 'flex' : 'none'}; background: var(--card-bg); border: 1px solid var(--glass-border); width: 40px; height: 40px; margin-left: -0.5rem;"
                  onclick="window.app.openTTSDialog()" title="Controles de Audio">
             ${createIcon('sliders-horizontal')}
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
            <div data-color="${c}" onclick="window.app.applyHighlight('${c}')" style="width: 30px; height: 30px; border-radius: 50%; background: ${c === 'transparent' ? 'white' : c}; border: 1px solid #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; color: ${c === 'transparent' ? '#333' : 'inherit'};">
                ${c === 'transparent' ? createIcon('ban') : ''}
            </div>
        `).join('')}
      </div>

      <!-- TTS Controls Dialog -->
      <div id="tts-dialog" class="floating-toolbar animate-entrance" 
           style="display: none; flex-direction: column; align-items: center; padding: 1rem; width: 85%; max-width: 350px; bottom: 100px; border-radius: 24px; gap: 1rem; background: var(--bg-color); border: 1px solid var(--glass-border);">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.9rem; color: var(--accent);">Control de Lectura</span>
            <button class="btn-icon" onclick="window.app.closeTTSDialog()" style="width: 30px; height: 30px; background: transparent; color: var(--text-main);">${createIcon('x')}</button>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 1rem; background: var(--card-bg); padding: 0.5rem; border-radius: 16px;">
             <button class="btn-icon" onclick="window.app.prevVerseTTS()" style="width: 40px; height: 40px;">${createIcon('chevron-left')}</button>
             <div style="text-align: center; flex: 1;">
                <span id="tts-current-verse" style="font-weight: 700; font-size: 1.1rem; display: block;">Verso -</span>
             </div>
             <button class="btn-icon" onclick="window.app.nextVerseTTS()" style="width: 40px; height: 40px;">${createIcon('chevron-right')}</button>
          </div>
          
          <button onclick="window.app.stopTTS()" style="width: 100%; padding: 0.8rem; border-radius: 12px; background: #ef4444; color: white; border: none; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            ${createIcon('square')} Detener Reproducción
          </button>
      </div>
    `;
    this.render(html);
    const activeTab = document.querySelector('#chapter-tabs .premium-card');
    if (activeTab) activeTab.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });

    // Scroll to specific verse if requested (from favorites)
    if (window.pendingVerseScroll) {
      setTimeout(() => {
        const el = document.getElementById(`v-${window.pendingVerseScroll}`);
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'center' });
        window.pendingVerseScroll = null;
      }, 100);
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
    this.renderNoteEditor(null, 'reader');
  }

  createNewNote() {
    this.renderNoteEditor(null, 'notes');
  }

  renderNoteEditor(index = null, source = 'notes') {
    this.currentView = 'note-editor';
    this.editingNoteIndex = index !== null ? index : undefined;
    this.noteSource = source;

    let n = { title: '', note: '', book: '', chapter: '', verse: '', text: '' };
    if (index !== null) {
      n = this.db.notes[index];
    } else if (this.selectedVerse) {
      n = {
        ...this.selectedVerse,
        verse: this.selectedVerse.vNum, // Normalizar para el editor
        title: '',
        note: ''
      };
    } else {
      n = {
        book: "Proverbios",
        chapter: "2",
        verse: "6",
        text: "Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia.",
        title: '',
        note: ''
      };
    }

    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.cancelNoteEditor()">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">${index !== null ? 'Editar Nota' : 'Nueva Nota'}</h1>
        <div style="display: flex; gap: 0.25rem;">
          ${index !== null ? `
            <button class="btn-icon" onclick="window.app.confirmDeleteNote(${index})" title="Eliminar" style="color: #ef4444;">
              ${createIcon('trash-2')}
            </button>
          ` : ''}
          <button class="btn-icon" onclick="window.app.confirmSaveNoteFromEditor()" title="Guardar" style="color: var(--accent);">
            ${createIcon('check')}
          </button>
        </div>
      </header>
      <div class="view-container animate-entrance" style="display: flex; flex-direction: column; height: calc(100vh - 70px); padding: 1rem; box-sizing: border-box;">
        <div class="premium-card" style="margin-bottom: 1rem; align-items: flex-start; text-align: left; background: var(--card-bg); border-left: 4px solid var(--accent); padding: 0.85rem;">
          <div style="color: var(--accent); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">
            ${n.book} ${n.chapter}:${n.verse}
          </div>
          <div style="font-size: 0.95rem; opacity: 0.7; font-style: italic; line-height: 1.4;">"${n.text}"</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; flex: 1; min-height: 0;">
          <input type="text" id="editor-note-title" class="search-box" 
                 style="width: 100%; border-radius: 12px; height: 50px; font-weight: 700; margin-bottom: 0;" 
                 placeholder="Título de la nota..." value="${n.title || ''}">
          
          <div class="rich-editor-container" style="flex: 1; display: flex; flex-direction: column; min-height: 0; margin-top: 0;">
            <div class="rich-toolbar" style="flex-shrink: 0;">
              <button type="button" onclick="document.execCommand('bold', false, null)" title="Negrita">${createIcon('bold')}</button>
              <button type="button" onclick="document.execCommand('italic', false, null)" title="Cursiva">${createIcon('italic')}</button>
              <button type="button" onclick="document.execCommand('underline', false, null)" title="Subrayado">${createIcon('underline')}</button>
              <div class="separator"></div>
              <button type="button" onclick="document.execCommand('insertUnorderedList', false, null)" title="Lista">${createIcon('list')}</button>
              <button type="button" onclick="document.execCommand('insertOrderedList', false, null)" title="Lista Numerada">${createIcon('list-ordered')}</button>
              <div class="separator"></div>
              <button type="button" onclick="document.execCommand('justifyLeft', false, null)" title="Izquierda">${createIcon('align-left')}</button>
              <button type="button" onclick="document.execCommand('justifyCenter', false, null)" title="Centro">${createIcon('align-center')}</button>
              <button type="button" onclick="document.execCommand('justifyRight', false, null)" title="Derecha">${createIcon('align-right')}</button>
              <div class="separator"></div>
              <button type="button" onclick="document.execCommand('undo', false, null)" title="Deshacer">${createIcon('undo-2')}</button>
              <button type="button" onclick="document.execCommand('redo', false, null)" title="Rehacer">${createIcon('redo-2')}</button>
            </div>
            <div id="editor-note-text" class="rich-editor" contenteditable="true" 
                 placeholder="¿Qué te dice Dios en este versículo?..." 
                 style="flex: 1; overflow-y: auto;">${n.note || ''}</div>
          </div>
          
          ${index !== null ? `
            <div style="font-size: 0.75rem; opacity: 0.5; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.2rem; align-items: center; border-top: 1px solid var(--glass-border); padding-top: 1rem; flex-shrink: 0;">
              <div>Creado: ${new Date(n.dateCreated || n.date).toLocaleDateString()} a las ${new Date(n.dateCreated || n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              ${n.dateUpdated && n.dateUpdated !== n.dateCreated ? `
                <div style="font-weight: 700;">Editado por última vez: ${new Date(n.dateUpdated).toLocaleDateString()} a las ${new Date(n.dateUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    this.render(html);
    this.refreshIcons();
    setTimeout(() => {
      const titleInput = document.getElementById('editor-note-title');
      if (titleInput) titleInput.focus();
    }, 300);
  }

  cancelNoteEditor() {
    if (this.noteSource === 'reader' && this.selectedVerse) {
      window.pendingVerseScroll = this.selectedVerse.vNum;
      this.renderReader(this.selectedVerse.book, this.selectedVerse.chapter);
    } else {
      this.renderNotes();
    }
    this.clearSelection();
  }

  confirmSaveNoteFromEditor() {
    const title = document.querySelector('#editor-note-title').value.trim();
    const note = document.querySelector('#editor-note-text').innerHTML.trim();

    if (!title || !note || note === '<br>') {
      this.showToast("Ambos campos son obligatorios");
      return;
    }

    this.openConfirmModal(
      "Guardar Nota",
      "¿Deseas guardar los cambios?",
      () => {
        if (this.editingNoteIndex !== undefined) {
          this.db.updateNote(this.editingNoteIndex, note, title);
        } else {
          const verseData = this.selectedVerse || {
            book: "Proverbios", chapter: "2", vNum: "6",
            text: "Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia."
          };
          this.db.addNote(verseData.book, verseData.chapter, verseData.vNum, verseData.text, note, title);
        }
        this.showToast("Nota guardada con éxito");

        if (this.noteSource === 'reader' && this.selectedVerse) {
          const { book, chapter, vNum } = this.selectedVerse;
          this.clearSelection();
          window.pendingVerseScroll = vNum;
          this.renderReader(book, chapter);
        } else {
          this.clearSelection();
          this.renderNotes();
        }
      },
      "Guardar",
      "var(--accent)"
    );
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

  openConfirmModal(title, msg, onConfirm, okText = 'Eliminar', okColor = '#ef4444', extraHtml = null) {
    const modal = document.querySelector('#confirm-modal');
    const titleEl = document.querySelector('#confirm-title');
    const msgEl = document.querySelector('#confirm-msg');
    const btnOk = document.querySelector('#confirm-btn-ok');
    const extraEl = document.querySelector('#confirm-extra');

    titleEl.innerText = title;
    msgEl.innerText = msg;

    if (extraHtml && extraEl) {
      extraEl.innerHTML = extraHtml;
      extraEl.style.display = 'block';
    } else if (extraEl) {
      extraEl.style.display = 'none';
      extraEl.innerHTML = '';
    }

    btnOk.innerText = okText;
    btnOk.style.background = okColor;
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
    const titleEl = document.querySelector('#note-title');
    const textEl = document.querySelector('#note-text');

    refEl.innerText = `${note.book} ${note.chapter}:${note.verse}`;
    if (titleEl) titleEl.value = note.title || '';
    textEl.innerHTML = note.note; // Usar innerHTML para cargar el texto enriquecido
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
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Paleta de Colores (Estilo)</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            ${[
        { id: 'classic', name: 'Estilo Clásico', color: '#f4ece1' },
        { id: 'floral', name: 'Estilo Floral', color: '#fff5f7' },
        { id: 'pastel-blue', name: 'Estilo Pastel', color: '#ebf5ff' },
        { id: 'forest', name: 'Estilo Bosque', color: '#388e3c' },
        { id: 'gold', name: 'Estilo Oro', color: '#d4af37' },
        { id: 'ink', name: 'Modo Tinta', color: '#ffffff' }
      ].map(t => `
              <div class="premium-card" onclick="window.app.applyTheme('${t.id}')" 
                   style="padding: 1rem; flex-direction: row; gap: 0.75rem; border: ${this.db.settings.theme_style === t.id ? '2px solid var(--accent)' : '1px solid var(--glass-border)'}">
                <div class="color-preview" style="background: ${t.color}; border: 1px solid rgba(0,0,0,0.1)"></div>
                <span style="font-size: 0.85rem; font-weight: 600;">${t.name}</span>
              </div>
            `).join('')}
          </div>
          
          ${this.db.settings.theme_style !== 'ink' ? `
          <!-- Sincronización con el sistema -->
          <label class="premium-card" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; cursor: pointer; display: flex !important;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="color: var(--accent);">${createIcon('refresh-cw')}</div>
              <div style="display: flex; flex-direction: column; text-align: left;">
                <span style="font-size: 0.9rem; font-weight: 700;">Sincronizar con el sistema</span>
                <span style="font-size: 0.8rem; opacity: 0.6;">Sigue el modo claro/oscuro de Android</span>
              </div>
            </div>
            <div class="switch">
              <input type="checkbox" ${this.db.settings.system_theme ? 'checked' : ''} onchange="window.app.toggleSystemTheme(this.checked)">
              <span class="slider round"></span>
            </div>
          </label>
          ` : ''}
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

        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Actualizaciones</h3>
          <div class="premium-card" onclick="window.app.checkForUpdates()" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${createIcon('download-cloud')}</div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Buscar Actualizaciones</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">Versión actual: v${this.appVersion}</span>
                </div>
              </div>
              <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Respaldo de Datos</h3>
          
          <div class="premium-card" onclick="window.app.exportUserData()" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="color: var(--accent);">${createIcon('download')}</div>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 0.9rem; font-weight: 700;">Exportar Datos</span>
                <span style="font-size: 0.8rem; opacity: 0.6;">Guardar copia de seguridad (JSON)</span>
              </div>
            </div>
            <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
          </div>
          
          <div class="premium-card" onclick="window.app.importUserData()" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="color: var(--accent);">${createIcon('upload')}</div>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 0.9rem; font-weight: 700;">Importar Datos</span>
                <span style="font-size: 0.8rem; opacity: 0.6;">Restaurar desde archivo (JSON)</span>
              </div>
            </div>
            <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
          </div>
        </div>
      </div>
    `;
    this.render(html);
  }

  toggleSystemTheme(active) {
    this.db.settings.system_theme = active;
    this.db.saveSettings();
    this.applyTheme();
  }

  toggleVerseNumbers(active) {
    this.db.settings.skip_verse_numbers = !active;
    this.db.saveSettings();
    this.renderSettings();
  }

  async checkForUpdates(silent = false) {
    if (!silent) this.showToast("Buscando actualizaciones...");
    try {
      const resp = await fetch(`https://api.github.com/repos/${this.repo}/releases/latest`);
      if (!resp.ok) throw new Error('Error buscando versión');
      const data = await resp.json();
      const latestVersion = data.tag_name.replace('v', '');
      const currentVersion = this.appVersion;

      if (this.compareVersions(latestVersion, currentVersion) > 0) {
        // Encontrar APK
        const asset = data.assets.find(a => a.name.endsWith('.apk'));
        if (asset) {
          this.confirmUpdate(latestVersion, asset.browser_download_url, data.body);
        } else {
          if (!silent) this.showToast("Nueva versión detectada pero sin APK disponible.");
        }
      } else {
        if (!silent) this.showToast("Ya tienes la última versión.");
      }
    } catch (e) {
      console.error(e);
      if (!silent) this.showToast("Error al buscar actualizaciones.");
    }
  }

  compareVersions(v1, v2) {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }

  confirmUpdate(version, url, releaseNotes = "") {
    let extra = "";
    if (releaseNotes) {
      const formattedNotes = releaseNotes.replace(/\n/g, '<br>');
      extra = `
        <div style="font-weight: 700; color: var(--accent); margin-bottom: 0.5rem; font-size: 0.8rem; text-transform: uppercase;">Novedades de v${version}:</div>
        <div style="color: var(--text-main); opacity:0.9;">${formattedNotes}</div>
      `;
    }

    this.openConfirmModal(
      "Actualización Disponible",
      `La versión v${version} está lista. ¿Deseas descargarla e instalarla?`,
      () => this.downloadAndInstall(url),
      "Instalar",
      "var(--accent)",
      extra
    );
  }

  async downloadAndInstall(url) {
    this.showToast("Iniciando descarga en segundo plano...");

    if (window.ApkUpdater) {
      window.ApkUpdater.download(url, {
        onDownloadProgress: (e) => {
          console.log(`Progreso: ${e.progress}%`);
        }
      }, () => {
        this.showToast("Descarga lista. Instalando...");
        window.ApkUpdater.install();
      }, (err) => {
        console.error(err);
        this.showToast("Error: " + (err.message || "Fallo en descarga"));
      });
    } else {
      alert("Plugin de actualización no activo. Abriendo navegador...");
      window.open(url, '_blank');
    }
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
      };
    });
  }

  toggleFavoritesSort() {
    this.favoritesSortOrder = this.favoritesSortOrder === 'asc' ? 'desc' : 'asc';
    this.renderFavorites();
  }

  renderFavorites() {
    this.currentView = 'favorites';
    this.selectedFavoriteIndex = null;
    let favs = [...this.db.favorites];
    favs.sort((a, b) => {
      const d1 = new Date(a.dateCreated || a.date);
      const d2 = new Date(b.dateCreated || b.date);
      return this.favoritesSortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">Favoritos</h1>
        <button class="btn-icon" onclick="window.app.toggleFavoritesSort()" title="Ordenar">
          ${createIcon(this.favoritesSortOrder === 'asc' ? 'sort-asc' : 'sort-desc')}
        </button>
      </header>
      <div class="view-container animate-entrance">
        ${favs.length === 0 ? '<p style="text-align: center; opacity: 0.5;">No tienes favoritos aún.</p>' :
        favs.map((f, index) => `
            <div class="premium-card fav-card fav-card-item" 
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
    this.refreshIcons();
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

  toggleHighlightsSort() {
    this.highlightsSortOrder = this.highlightsSortOrder === 'asc' ? 'desc' : 'asc';
    this.renderHighlights();
  }

  renderHighlights() {
    this.currentView = 'highlights';
    let list = [...this.db.highlights];

    // Ordenar por fecha
    list.sort((a, b) => {
      const d1 = new Date(a.dateCreated || a.date);
      const d2 = new Date(b.dateCreated || b.date);
      return this.highlightsSortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });

    // Aplicar filtro si no es 'all'
    if (this.currentHighlightFilter !== 'all') {
      list = list.filter(h => h.color === this.currentHighlightFilter);
    }

    const colors = ['#fef3c7', '#dcfce7', '#dbeafe', '#fae8ff', '#fee2e2', '#ffedd5', '#f3f4f6'];

    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">Marcadores</h1>
        <button class="btn-icon" onclick="window.app.toggleHighlightsSort()" title="Ordenar">
          ${createIcon(this.highlightsSortOrder === 'asc' ? 'sort-asc' : 'sort-desc')}
        </button>
      </header>
      <div class="view-container animate-entrance">
        <!-- Barra de filtros -->
        <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding: 0 0 1.5rem 0; margin-bottom: 0.5rem; scrollbar-width: none;">
          <button onclick="window.app.applyHighlightFilter('all')" 
                  style="flex-shrink: 0; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid ${this.currentHighlightFilter === 'all' ? 'var(--accent)' : 'var(--glass-border)'}; 
                         background: ${this.currentHighlightFilter === 'all' ? 'var(--accent)' : 'var(--card-bg)'}; 
                         color: ${this.currentHighlightFilter === 'all' ? 'white' : 'var(--text-main)'}; font-size: 0.85rem; font-weight: 600;">
            Todos
          </button>
          ${colors.map(c => `
            <button onclick="window.app.applyHighlightFilter('${c}')" 
                    style="flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%; background: ${c}; 
                           border: ${this.currentHighlightFilter === c ? '3px solid var(--accent)' : '1px solid #ccc'}; padding: 0;">
            </button>
          `).join('')}
        </div>

        ${list.length === 0 ? `
          <div style="text-align: center; padding: 3rem 1rem; opacity: 0.5;">
            ${createIcon('highlighter')}
            <p style="margin-top: 1rem;">No hay marcadores ${this.currentHighlightFilter === 'all' ? '' : 'de este color'}.</p>
          </div>
        ` :
        list.map((h, index) => {
          // Encontrar el índice original en this.db.highlights para que las acciones (borrar, ir) funcionen correctamente
          const originalIndex = this.db.highlights.findIndex(orig => orig === h);
          return `
            <div class="premium-card highlight-card" data-index="${originalIndex}" style="margin-bottom: 1rem; border-left: 8px solid ${h.color};" onclick="window.app.toggleHighlightSelection(${originalIndex})">
                <div style="flex: 1;">
                     <div style="color: var(--accent); font-size: 0.9rem; font-weight: 700; margin-bottom: 0.25rem;">
                        ${h.book} ${h.chapter}:${h.verse}
                     </div>
                     <div style="font-size: 1rem; opacity: 0.9;">${h.text}</div>
                </div>
            </div>
          `;
        }).join('')}
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
    this.refreshIcons();
  }

  applyHighlightFilter(color) {
    this.currentHighlightFilter = color;
    this.clearHighlightSelection();
    this.renderHighlights();
  }

  toggleHighlightSelection(index) {
    const card = document.querySelector(`.highlight-card[data-index="${index}"]`);

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
      const oldCard = document.querySelector(`.highlight-card[data-index="${this.selectedHighlightIndex}"]`);
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

  toggleNotesSort() {
    this.notesSortOrder = this.notesSortOrder === 'desc' ? 'asc' : 'desc';
    this.renderNotes();
  }

  renderNotes() {
    this.currentView = 'notes';
    let notes = this.db.notes.map((n, i) => ({ ...n, originalIndex: i }));

    // Ordenar: Pinned primero, luego por fecha según el orden seleccionado
    notes.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const d1 = new Date(a.dateCreated || a.date);
      const d2 = new Date(b.dateCreated || b.date);
      return this.notesSortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });

    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">Mis Notas</h1>
        <div style="display: flex; gap: 0.25rem;">
          <button class="btn-icon search-trigger" onclick="window.app.openNoteSearch()" title="Buscar Notas">
            ${createIcon('search')}
          </button>
          <button class="btn-icon" onclick="window.app.toggleNotesSort()" title="Ordenar">
            ${createIcon(this.notesSortOrder === 'asc' ? 'sort-asc' : 'sort-desc')}
          </button>
          <button class="btn-icon" onclick="window.app.createNewNote()" title="Nueva Nota" style="color: var(--accent);">
            ${createIcon('plus-circle')}
          </button>
        </div>
      </header>
      <div class="view-container animate-entrance">
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${notes.length === 0 ? '<p style="text-align: center; opacity: 0.5; margin-top: 2rem;">No tienes notas guardadas.</p>' : ''}
          ${notes.map(note => `
            <div class="note-swipe-wrapper" id="swipe-wrapper-${note.originalIndex}">
              <!-- Fondo izquierda: Eliminar -->
              <div class="note-swipe-action-bg note-swipe-delete-bg" id="swipe-delete-bg-${note.originalIndex}" style="left: 0; right: auto; background: #ef4444; justify-content: flex-start; padding-left: 1.2rem;">
                ${createIcon('trash-2')}
              </div>
              <!-- Fondo derecha: Fijar/Desfijar -->
              <div class="note-swipe-action-bg" id="swipe-bg-${note.originalIndex}">
                ${note.pinned ? createIcon('pin-off') : createIcon('pin')}
              </div>
              <div class="premium-card note-card" 
                   id="note-card-${note.originalIndex}"
                   onclick="window.app.renderNoteEditor(${note.originalIndex}, 'notes')"
                   ontouchstart="window.app.handleNoteSwipeStart(event, ${note.originalIndex})"
                   ontouchmove="window.app.handleNoteSwipeMove(event, ${note.originalIndex})"
                   ontouchend="window.app.handleNoteSwipeEnd(event, ${note.originalIndex})"
                   style="text-align: left; align-items: center; justify-content: space-between; padding: 1.15rem; flex-direction: row; position: relative; cursor: pointer;">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; text-align: left; flex: 1;">
                  <span style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                    ${note.pinned ? `<span style="color: var(--accent); scale: 0.8; display: flex;">${createIcon('pin')}</span>` : ''}
                    ${note.title}
                  </span>
                  <span style="font-size: 0.8rem; opacity: 0.5; font-weight: 600;">${new Date(note.dateCreated || note.date).toLocaleDateString()}</span>
                </div>
                <div style="color: var(--accent); opacity: 0.3;">${createIcon('chevron-right')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.render(html);
    this.refreshIcons();
  }

  stripHtml(html) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  handleNoteClick(index) {
    this.renderNoteDetail(index);
  }

  handleNoteSwipeStart(e, index) {
    const touch = e.touches[0];
    this.swipeStartX = touch.clientX;
    this.swipeStartY = touch.clientY;
    this.swipeCurrentIndex = index;
    this.swipeDirectionLocked = null; // Reiniciar bloqueo

    const card = document.querySelector(`#note-card-${index}`);
    if (card) card.classList.add('swiping');
    this.isSwiping = true;
  }

  handleNoteSwipeMove(e, index) {
    if (!this.isSwiping || this.swipeCurrentIndex !== index) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - this.swipeStartX;
    const diffY = touch.clientY - this.swipeStartY;

    // Detectar y bloquear dirección inicial
    if (!this.swipeDirectionLocked) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        if (Math.abs(diffY) > Math.abs(diffX)) {
          this.swipeDirectionLocked = 'vertical';
          this.isSwiping = false;
          const card = document.querySelector(`#note-card-${index}`);
          if (card) card.classList.remove('swiping');
          return;
        } else {
          this.swipeDirectionLocked = 'horizontal';
        }
      } else {
        return;
      }
    }

    if (this.swipeDirectionLocked === 'vertical') return;

    const card = document.querySelector(`#note-card-${index}`);
    const pinBg = document.querySelector(`#swipe-bg-${index}`);
    const deleteBg = document.querySelector(`#swipe-delete-bg-${index}`);

    if (diffX < 0) {
      // Deslizar a la IZQUIERDA → Fijar/Desfijar
      const limitedDiffX = Math.max(diffX, -120);
      if (card) card.style.transform = `translateX(${limitedDiffX}px)`;
      deleteBg?.classList.remove('active');
      if (Math.abs(diffX) > 70) {
        pinBg?.classList.add('active');
        if (window.vibrate && !this.swipeVibrated) { window.vibrate(20); this.swipeVibrated = true; }
      } else {
        pinBg?.classList.remove('active');
        this.swipeVibrated = false;
      }
    } else {
      // Deslizar a la DERECHA → Eliminar
      const limitedDiffX = Math.min(diffX, 120);
      if (card) card.style.transform = `translateX(${limitedDiffX}px)`;
      pinBg?.classList.remove('active');
      if (Math.abs(diffX) > 70) {
        deleteBg?.classList.add('active');
        if (window.vibrate && !this.swipeVibrated) { window.vibrate(20); this.swipeVibrated = true; }
      } else {
        deleteBg?.classList.remove('active');
        this.swipeVibrated = false;
      }
    }
  }

  handleNoteSwipeEnd(e, index) {
    if (!this.isSwiping || this.swipeCurrentIndex !== index) return;
    this.isSwiping = false;
    this.swipeVibrated = false;

    const card = document.querySelector(`#note-card-${index}`);
    const pinBg = document.querySelector(`#swipe-bg-${index}`);
    const deleteBg = document.querySelector(`#swipe-delete-bg-${index}`);
    if (!card) return;

    const transform = card.style.transform;
    const finalDiffX = transform ? parseInt(transform.replace('translateX(', '').replace('px)', '')) : 0;

    card.classList.remove('swiping');
    card.classList.add('snap-back');
    card.style.transform = '';
    pinBg?.classList.remove('active');
    deleteBg?.classList.remove('active');

    if (finalDiffX < -70) {
      // Swipe izquierda → Fijar/Desfijar
      const isPinned = this.db.togglePinNote(index);
      if (window.vibrate) window.vibrate(40);
      this.showToast(isPinned ? 'Nota fijada' : 'Nota desfijada');
      this.renderNotes();
    } else if (finalDiffX > 70) {
      // Swipe derecha → Eliminar con confirmación
      if (window.vibrate) window.vibrate(40);
      this.confirmDeleteNote(index);
    }

    setTimeout(() => { if (card) card.classList.remove('snap-back'); }, 400);
  }

  clearNoteSelection() {
    this.selectedNoteIndex = null;
  }

  confirmDeleteNote(index) {
    this.openConfirmModal(
      "Eliminar Nota",
      "¿Estás seguro de que deseas eliminar esta nota?",
      () => {
        this.db.deleteNote(index);
        this.renderNotes();
      }
    );
  }

  openNoteSearch() {
    // Eliminar cualquier instancia previa
    const old = document.getElementById('note-search-dialog');
    if (old) old.remove();

    const dialogHtml = `
      <div id="note-search-dialog" class="modal-overlay active" style="display: flex; z-index: 1000000; align-items: flex-start; padding-top: 5vh;">
        <div class="modal-box animate-entrance" style="padding: 1.25rem; max-width: 92vw; width: 500px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; align-items: stretch;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; width: 100%;">
            <h2 class="modal-title" style="margin: 0; font-size: 1.25rem;">Buscar Notas</h2>
            <button class="btn-icon" onclick="window.app.closeNoteSearch()" style="background: var(--accent-soft); border-radius: 50%; width: 32px; height: 32px;">
              ${createIcon('x')}
            </button>
          </div>
          
          <div style="position: relative; margin-bottom: 1rem; width: 100%;">
            <input type="text" id="note-search-input-field" class="search-box" 
                   placeholder="Título, contenido o versículo..." 
                   oninput="window.app.performNoteSearch(this.value)"
                   style="width: 100%; border-radius: 12px; height: 48px; padding-left: 2.75rem; margin-bottom: 0; font-size: 1rem; border: 1px solid var(--glass-border); box-sizing: border-box;">
            <div style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); opacity: 0.5; pointer-events: none;">
              ${createIcon('search')}
            </div>
          </div>

          <div id="note-search-dialog-results" class="search-results-list" 
               style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding: 0.25rem; min-height: 150px; width: 100%; align-items: stretch; box-sizing: border-box;">
            <div style="text-align: center; padding: 2rem 1rem; opacity: 0.4; width: 100%;">
              ${createIcon('edit-3')}
              <p style="margin-top: 1rem; font-size: 0.85rem;">Busca por título o contenido...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dialogHtml);
    this.refreshIcons();

    setTimeout(() => {
      const input = document.getElementById('note-search-input-field');
      if (input) input.focus();
    }, 150);
  }

  closeNoteSearch() {
    const modal = document.getElementById('note-search-dialog');
    if (modal) modal.remove();
  }

  performNoteSearch(query) {
    const resultsContainer = document.getElementById('note-search-dialog-results');
    if (!resultsContainer) return;

    if (!query.trim() || query.length < 2) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; opacity: 0.4;">
          ${createIcon('edit-3')}
          <p style="margin-top: 1rem; font-size: 0.9rem;">Escribe al menos 2 letras...</p>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    const q = query.toLowerCase();
    const results = this.db.notes
      .map((n, i) => ({ ...n, originalIndex: i }))
      .filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.note.toLowerCase().includes(q) ||
        n.book.toLowerCase().includes(q) ||
        n.text.toLowerCase().includes(q)
      );

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; opacity: 0.5;">
          <p>No encontramos notas con "${query}"</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = results.map(n => `
      <div onclick="window.app.closeNoteSearch(); window.app.renderNoteEditor(${n.originalIndex}, 'notes')" 
           style="background: var(--card-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.15rem; gap: 0.4rem; cursor: pointer; display: flex; flex-direction: column; width: 100%; align-items: stretch; text-align: left; box-sizing: border-box; box-shadow: var(--shadow);">
        <div style="color: var(--accent); font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">
          ${n.book} ${n.chapter}:${n.verse}
        </div>
        <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); line-height: 1.3;">
          ${n.title || 'Sin título'}
        </div>
        <div style="font-size: 0.9rem; opacity: 0.6; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4;">
          ${this.stripHtml(n.note) || 'Sin contenido adicional'}
        </div>
      </div>
    `).join('');
    this.refreshIcons();
  }

  // renderNoteDetail eliminado en favor de renderNoteEditor

  // confirmSaveNoteFromDetail eliminado



  renderSearch(initialQuery = '') {
    this.currentView = 'search';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1>Buscador</h1>
      </header>
      <div class="view-container animate-entrance">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
          <input type="text" id="search-input" placeholder="¿Qué estás buscando?..." class="search-box" style="flex: 1; margin-bottom: 0;" value="${initialQuery}">
          <button class="btn-icon" onclick="window.app.openSearchBookModal()" 
                  style="background: var(--card-bg); border: 1px solid var(--glass-border); border-radius: 14px; width: 50px; height: 50px; flex-shrink: 0; position: relative; display: flex; align-items: center; justify-content: center; color: var(--text-main);">
            ${createIcon('filter')}
            ${this.searchBook ? `<div style="position: absolute; top: 8px; right: 8px; background: var(--accent); width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--bg-color);"></div>` : ''}
          </button>
        </div>
        ${this.searchBook ? `
          <div style="margin-top: -1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; opacity: 0.8;">
            <span style="color: var(--accent); font-weight: 700;">Filtrado por:</span> ${this.searchBook}
            <button onclick="window.app.setSearchFilter('all')" style="background: none; border: none; color: #ef4444; font-size: 0.75rem; text-decoration: underline; padding: 0; cursor: pointer;">Limpiar</button>
          </div>
        ` : ''}
        <div id="search-results">
        </div>
      </div>

      <!-- Modal de Selección de Libro para Búsqueda -->
      <div id="search-book-modal" class="modal-overlay">
        <div class="modal-box" style="padding: 1.5rem; display: flex; flex-direction: column; max-height: 85vh;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 class="modal-title" style="font-size: 1.2rem; margin-bottom: 0;">Filtrar por Libro</h3>
            <button class="btn-icon" onclick="window.app.closeSearchBookModal()" style="color: var(--text-main); opacity: 0.6;">${createIcon('x')}</button>
          </div>
          <p class="modal-subtitle" style="margin-bottom: 1rem;">Selecciona el libro para filtrar la búsqueda</p>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; flex: 1; padding-right: 0.5rem;">
            <!-- Opción para buscar en todo -->
            <div class="premium-card" onclick="window.app.setSearchFilter('all')" 
                 style="padding: 1rem; flex-direction: row; justify-content: center; background: var(--accent-soft); border: 1px dashed var(--accent); min-height: auto; flex-shrink: 0;">
              <span style="font-weight: 700; color: var(--accent);">Buscar en Todo</span>
            </div>

            ${this.db.getBooks().map(book => `
              <div class="premium-card" onclick="window.app.selectSearchBook('${book.replace(/'/g, "\\'")}')" 
                   style="padding: 1rem; flex-direction: row; justify-content: space-between; min-height: auto; flex-shrink: 0;">
                <span style="font-weight: 600; text-align: left;">${book}</span>
                <div style="color: var(--accent); opacity: 0.5;">${createIcon('chevron-right')}</div>
              </div>
            `).join('')}
          </div>
          <button class="modal-btn secondary" style="width: 100%; margin-top: 1.25rem;" onclick="window.app.closeSearchBookModal()">Cancelar</button>
        </div>
      </div>
    `;
    this.render(html);
    const input = document.querySelector('#search-input');
    input.addEventListener('input', (e) => {
      const query = e.target.value;
      if (query.length > 2) this.performSearch(query);
      else if (query.length === 0) document.querySelector('#search-results').innerHTML = '';
    });
    if (initialQuery) {
      this.performSearch(initialQuery);
      input.setSelectionRange(initialQuery.length, initialQuery.length);
    }
    input.focus();
  }

  setSearchFilter(filter) {
    const query = document.querySelector('#search-input')?.value || '';
    this.searchFilter = filter;
    if (filter === 'book') {
      this.openSearchBookModal();
    } else {
      this.searchBook = null;
      this.renderSearch(query);
    }
  }

  openSearchBookModal() {
    const modal = document.querySelector('#search-book-modal');
    if (modal) modal.classList.add('active');
  }

  closeSearchBookModal() {
    const modal = document.querySelector('#search-book-modal');
    if (modal) modal.classList.remove('active');
  }

  selectSearchBook(book) {
    const query = document.querySelector('#search-input')?.value || '';
    this.searchBook = book;
    this.searchFilter = 'book';
    this.closeSearchBookModal();
    this.renderSearch(query);
  }

  performSearch(query) {
    let results = this.db.search(query);
    if (this.searchFilter === 'book' && this.searchBook) {
      results = results.filter(r => r.book === this.searchBook);
    }

    const resultsEl = document.querySelector('#search-results');
    resultsEl.innerHTML = `
      <p style="margin-bottom: 1.25rem; opacity: 0.5; font-size: 0.9rem;">${results.length} coincidencias encontradas</p>
      ${results.map(r => `
        <div class="premium-card" style="margin-bottom: 1rem; align-items: flex-start; text-align: left;" 
             onclick="window.pendingVerseScroll = '${r.vNum}'; window.app.renderReader('${r.book}', '${r.chapter}')">
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
            <p style="font-size: 0.95rem; opacity: 0.8;">Desarrollado por <b style="color: var(--text-main);">Life Code Studios</b></p>
            <p style="font-size: 0.85rem; opacity: 0.6; margin-top: -0.5rem;">Developer: <span onclick="window.app.handleAboutClick()" style="cursor: pointer; color: var(--accent); font-weight: 700;">krafairus</span></p>
            
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem;">
              <a href="https://www.facebook.com/profile.php?id=61587882503975" target="_blank" class="about-action-btn" style="background: #1877F2; color: white; border: none;">
                ${createIcon('facebook')} Facebook
              </a>
              <a href="https://github.com/krafairus/biblia-cristiana-rv1960-app" target="_blank" class="about-action-btn">
                ${createIcon('github')} GitHub
              </a>
            </div>
          </div>

          <div style="height: 1px; background: var(--glass-border); width: 40%; margin: 0.5rem auto;"></div>

          <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <p style="opacity: 0.6; font-size: 0.85rem;">Dedicada a la congregación:</p>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
                <img src="/img/logo-congregacion.png" alt="" onerror="this.style.display='none'" style="max-height: 80px; width: auto; border-radius: 12px;">
                <h3 style="color: var(--accent); font-size: 1.2rem;">Sembradores de luz y esperanza</h3>
            </div>
            <a href="https://www.facebook.com/p/Sembradores-de-luz-y-esperanza-100079821227480/" target="_blank" class="about-action-btn" style="background: #1877F2; color: white;">
              ${createIcon('facebook')} Ir a Facebook
            </a>
          </div>
          
          <p style="font-size: 0.95rem; opacity: 0.8; padding: 0.5rem 1.5rem; line-height: 1.6; font-style: italic;">
            Y para todo aquel que busque en las Escrituras el camino hacia la verdad y la vida eterna.
          </p>

          <!-- Donaciones -->
          <div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, rgba(41, 171, 224, 0.1), rgba(255, 94, 94, 0.1)); border-radius: 16px; border: 1px solid var(--glass-border); text-align: center;">
              <h4 style="color: var(--accent); margin-bottom: 0.5rem;">Apoya este proyecto</h4>
              <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1rem;">Tu donación nos ayuda a seguir mejorando y creando más herramientas gratuitas.</p>
              <a href="https://ko-fi.com/lifecodestudios/goal?g=0" target="_blank" class="btn-primary" style="background: #29abe0; color: white; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; justify-content: center; width: auto; padding: 0.75rem 1.5rem; border-radius: 12px;">
                  ${createIcon('coffee')} Donar en Ko-fi
              </a>
          </div>

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

        <p style="font-size: 0.8rem; opacity: 0.3; margin-top: 1rem;">VERSIÓN ${this.appVersion}</p>
      </div>
    `;
    this.render(html);
  }

  async renderVerseOfDay() {
    this.currentView = 'vod';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">Versículo del Día</h1>
        <button class="btn-icon" onclick="window.app.navigateToCurrentVod()" title="Ir a la ubicación del versículo" style="color: var(--accent);">
          ${createIcon('map-pin')}
        </button>
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
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `
              <div class="bg-thumb" onclick="window.app.changeVodBg(${i})" 
                   style="min-width: 60px; height: 60px; border-radius: 12px; background-image: url('/img/bg-verse-${i}.png'); background-size: cover; border: 2px solid var(--glass-border); flex-shrink: 0;">
              </div>
            `).join('')}
            <div class="bg-thumb premium-card" onclick="window.app.openCustomBgDisclaimer()" 
                 style="min-width: 60px; height: 60px; border-radius: 12px; border: 2px dashed var(--accent); flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--card-bg); color: var(--accent); padding:0;">
              ${createIcon('plus')}
            </div>
            <input type="file" id="custom-bg-input" accept="image/*" style="display:none" onchange="window.app.handleCustomBgChange(event)">
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
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `
              <div class="bg-thumb" onclick="window.app.changeVodBg(${i})" 
                   style="min-width: 60px; height: 60px; border-radius: 12px; background-image: url('/img/bg-verse-${i}.png'); background-size: cover; border: 2px solid var(--glass-border); flex-shrink: 0;">
              </div>
            `).join('')}
            <div class="bg-thumb premium-card" onclick="window.app.openCustomBgDisclaimer()" 
                 style="min-width: 60px; height: 60px; border-radius: 12px; border: 2px dashed var(--accent); flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--card-bg); color: var(--accent); padding:0;">
              ${createIcon('plus')}
            </div>
            <input type="file" id="custom-bg-input" accept="image/*" style="display:none" onchange="window.app.handleCustomBgChange(event)">
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

  changeVodBg(index, customUrl = null) {
    if (customUrl) {
      this.currentVodBg = customUrl;
    } else {
      this.currentVodBg = `/img/bg-verse-${index}.png`;
    }
    const card = document.querySelector('#vod-card');
    if (card) card.style.backgroundImage = `url('${this.currentVodBg}')`;
    document.querySelectorAll('.bg-thumb').forEach((el, i) => {
      if (customUrl) {
        el.style.borderColor = el.onclick?.toString().includes('openCustomBgDisclaimer') ? 'var(--accent)' : 'var(--glass-border)';
      } else {
        el.style.borderColor = (i + 1 === index) ? 'var(--accent)' : 'var(--glass-border)';
      }
    });
  }

  openCustomBgDisclaimer() {
    this.openConfirmModal(
      "Imagen Personalizada",
      "Para una mejor calidad al compartir, te recomendamos usar una imagen con una resolución mínima de 1080x1080 píxeles.",
      () => {
        document.getElementById('custom-bg-input').click();
      },
      "Seleccionar",
      "var(--accent)"
    );
  }

  handleCustomBgChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.changeVodBg(null, e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
      const v = this.db.getVerseOfDay();
      if (!v) throw new Error('No Bible data');
      this.currentVod = {
        text: v.text,
        ref: `${v.book} ${v.chapter}:${v.verse}`,
        thematic: v.thematic,
        book: v.book,
        chapter: v.chapter,
        verse: v.verse
      };
      this.updateVodUI();
    } catch (e) {
      console.error("Error loading VOD:", e);
      const contentEl = document.querySelector('#vod-content p');
      if (contentEl) contentEl.innerText = "No se pudo cargar el versículo.";
    }
  }

  navigateToCurrentVod() {
    if (!this.currentVod || !this.currentVod.book) return;
    const { book, chapter, verse } = this.currentVod;
    this.openConfirmModal(
      "Ir al Versículo",
      `¿Deseas ir a la ubicación de este versículo en ${book} ${chapter}:${verse}?`,
      () => {
        window.pendingVerseScroll = verse;
        this.renderReader(book, chapter);
      },
      "Ir",
      "var(--accent)"
    );
  }

  updateVodUI() {
    const card = document.querySelector('#vod-card');
    const contentEl = document.querySelector('#vod-content');
    if (!card || !contentEl) return;
    card.style.backgroundImage = `url('${this.currentVodBg}')`;
    contentEl.innerHTML = `
      <div style="font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 0.5rem; opacity: 0.9;">${this.currentVod.thematic || ''}</div>
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
      // Si empieza con 'data:' o ya es una URL absoluta, usarla como está; sino, añadir origin.
      img.src = this.currentVodBg.startsWith('data:') ? this.currentVodBg : (window.location.origin + this.currentVodBg);
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
    if (this.aboutClickCount >= 5) {
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
      if (this.isPaused) {
        this.resumeTTS();
      } else {
        this.pauseTTS();
      }
      return;
    }

    this.stopTTS();

    const verses = this.db.getVerses(book, chapter);
    if (!verses || verses.length === 0) return;

    this.currentChapterVerses = [];

    // Structure: { text: string, vNum: string|null, type: 'title'|'pericope'|'verse' }

    this.currentChapterVerses.push({
      text: `${book}, capítulo ${chapter}.`,
      vNum: null,
      type: 'title'
    });

    verses.forEach(([vNum, text]) => {
      const pericope = this.db.getPericope(book, chapter, vNum);
      if (pericope) {
        this.currentChapterVerses.push({
          text: pericope + ".",
          vNum: null,
          type: 'pericope'
        });
      }

      let verseText = text;
      if (!this.db.settings.skip_verse_numbers) {
        verseText = `Verso ${vNum}. ${text}`;
      }

      this.currentChapterVerses.push({
        text: verseText,
        vNum: vNum,
        type: 'verse'
      });
    });

    this.currentVerseIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;
    this.updateTTSButton();
    this.playNextChunk();
  }

  async playNextChunk() {
    if (!this.isSpeaking || this.isPaused) return;

    if (this.currentVerseIndex >= this.currentChapterVerses.length) {
      this.stopTTS();
      return;
    }

    const chunk = this.currentChapterVerses[this.currentVerseIndex];
    this.updateTTSDialogUI();

    // Highlight logic
    if (chunk.type === 'verse' && chunk.vNum) {
      this.highlightReadingVerse(chunk.vNum);
    } else {
      // If title or pericope, maybe clear highlight or keep previous?
      // Better to clear or subtle highlight. Let's clear for now.
      this.clearReadingHighlight();
    }

    const Capacitor = window.Capacitor;

    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech) {
      try {
        let speakLang = 'es-ES';
        let voiceIndex = this.db.settings.tts_voice;

        await Capacitor.Plugins.TextToSpeech.speak({
          text: chunk.text,
          lang: speakLang,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          voice: voiceIndex,
          category: 'playback'
        });

        this.currentVerseIndex++;
        this.playNextChunk();

      } catch (e) {
        console.error("TTS Error in chunk:", e);
        this.stopTTS();
        this.showToast("Error al reproducir audio");
      }
    } else {
      console.warn("TTS Plugin not available");
      this.stopTTS();
    }
  }

  highlightReadingVerse(vNum) {
    this.clearReadingHighlight();
    const el = document.getElementById(`v-${vNum}`);
    if (el) {
      el.classList.add('reading-active');
      // Optional: Auto-scroll to active verse?
      // el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  clearReadingHighlight() {
    const active = document.querySelector('.verse-item.reading-active');
    if (active) active.classList.remove('reading-active');
  }

  async nextVerseTTS() {
    if (this.currentVerseIndex + 1 < this.currentChapterVerses.length) {
      await this.stopTTSUtils();
      this.currentVerseIndex++;
      // Adjust index to point to next 'verse' type if currently on pericope? 
      // For simplicity, just next chunk.
      this.isPaused = false;
      this.updateTTSButton();
      this.playNextChunk();
    } else {
      this.showToast("Último versículo");
    }
  }

  async prevVerseTTS() {
    if (this.currentVerseIndex > 0) {
      await this.stopTTSUtils();
      this.currentVerseIndex--;
      // Simple prev chunk logic.
      if (this.currentVerseIndex < 0) this.currentVerseIndex = 0;

      this.isPaused = false;
      this.updateTTSButton();
      this.playNextChunk();
    } else {
      this.showToast("Inicio del capítulo");
    }
  }

  async stopTTSUtils() {
    const Capacitor = window.Capacitor;
    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech) {
      await Capacitor.Plugins.TextToSpeech.stop();
    }
  }

  openTTSDialog() {
    const dialog = document.getElementById('tts-dialog');
    if (dialog) dialog.style.display = 'flex';
    this.updateTTSDialogUI();
  }

  closeTTSDialog() {
    const dialog = document.getElementById('tts-dialog');
    if (dialog) dialog.style.display = 'none';
  }

  updateTTSDialogUI() {
    const el = document.getElementById('tts-current-verse');
    if (!el) return;

    const chunk = this.currentChapterVerses[this.currentVerseIndex];
    if (!chunk) return;

    if (chunk.type === 'title') {
      el.innerText = "Título";
    } else if (chunk.type === 'pericope') {
      el.innerText = "Lectura";
    } else if (chunk.type === 'verse') {
      el.innerText = `Verso ${chunk.vNum}`;
    } else {
      el.innerText = "Lectura";
    }
  }

  async pauseTTS() {
    this.isPaused = true;
    const Capacitor = window.Capacitor;
    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech) {
      await Capacitor.Plugins.TextToSpeech.stop();
    }
    this.updateTTSButton();
  }

  async resumeTTS() {
    this.isPaused = false;
    this.updateTTSButton();
    this.playNextChunk();
  }

  async stopTTS() {
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentVerseIndex = 0;
    this.currentChapterVerses = [];
    this.clearReadingHighlight();

    const Capacitor = window.Capacitor;
    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech) {
      await Capacitor.Plugins.TextToSpeech.stop();
    }
    this.updateTTSButton();
    this.closeTTSDialog();
  }

  updateTTSButton() {
    const btn = document.getElementById('tts-btn');
    const controlsBtn = document.getElementById('tts-controls-btn');

    if (btn) {
      let iconName = 'volume-2';
      if (this.isSpeaking) {
        if (this.isPaused) {
          iconName = 'play';
        } else {
          iconName = 'pause';
        }
      }

      btn.innerHTML = createIcon(iconName);

      if (this.isSpeaking) {
        btn.classList.add('active');
        btn.style.background = 'var(--accent)';
        btn.style.color = 'white';
        if (this.isPaused) {
          btn.style.opacity = '0.7';
        } else {
          btn.style.opacity = '1';
        }

        if (controlsBtn) controlsBtn.style.display = 'flex';

      } else {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.color = '';
        btn.style.opacity = '1';

        if (controlsBtn) controlsBtn.style.display = 'none';
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

  async renderDevotional() {
    this.currentView = 'devotional';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.renderHome()">${createIcon('arrow-left')}</button>
        <h1>Devocional Semanal</h1>
        <button class="btn-icon" onclick="window.app.renderDevotionalHistory()">${createIcon('history')}</button>
      </header>
      <div class="view-container animate-entrance" style="padding-bottom: 2rem;">
        <div id="devotional-content" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; padding: 2rem; color: var(--text-main); opacity: 0.7;">
            <div class="spinner"></div>
            <p style="margin-top: 1rem;">Cargando devocional...</p>
          </div>
        </div>
      </div>
    `;
    this.render(html);
    this.loadDevotionalData();
  }

  async loadDevotionalData() {
    const container = document.getElementById('devotional-content');
    if (!navigator.onLine) {
      container.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 3rem; color: var(--accent); margin-bottom: 1rem;">${createIcon('wifi-off')}</div>
                <h3 style="margin-bottom: 0.5rem;">Sin Conexión</h3>
                <p style="opacity: 0.7; margin-bottom: 1.5rem;">Revise su conexión a internet y pruebe nuevamente.</p>
                <button class="btn-primary" onclick="window.app.loadDevotionalData()">Reintentar</button>
            </div>
        `;
      this.refreshIcons();
      return;
    }

    try {
      const response = await fetch('https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/devocional-last.json?' + new Date().getTime());
      if (!response.ok) throw new Error("No se pudo cargar el devocional");

      const data = await response.json();
      this.renderDevotionalView(data, false);

    } catch (e) {
      console.error(e);
      container.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;">${createIcon('alert-circle')}</div>
                <h3 style="margin-bottom: 0.5rem;">Error al Cargar</h3>
                <p style="opacity: 0.7; margin-bottom: 1.5rem;">Revise su conexión a internet y pruebe nuevamente.<br>Si el error persiste, puede reportarlo en GitHub.</p>
                <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center;">
                  <button class="btn-primary" onclick="window.app.loadDevotionalData()">Reintentar</button>
                  <button class="btn-secondary" onclick="window.open('https://github.com/${this.repo}/issues', '_blank')" style="background: var(--card-bg); color: var(--text-main); border: 1px solid var(--glass-border); padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer;">
                    ${createIcon('github')} Reportar en GitHub
                  </button>
                </div>
            </div>
        `;
      this.refreshIcons();
    }
  }

  toggleDevotionalSort() {
    this.devotionalSortOrder = this.devotionalSortOrder === 'asc' ? 'desc' : 'asc';
    this.renderDevotionalHistory();
  }

  async renderDevotionalHistory() {
    this.currentView = 'devotional-history';
    try {
      const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('devotional')">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">Historial</h1>
        <button class="btn-icon" onclick="window.app.toggleDevotionalSort()" title="Ordenar">
          ${createIcon(this.devotionalSortOrder === 'asc' ? 'sort-asc' : 'sort-desc')}
        </button>
      </header>
      <div class="view-container animate-entrance">
         <div id="history-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; padding: 2rem; color: var(--text-main); opacity: 0.7;">
              <div class="spinner"></div>
              <p style="margin-top: 1rem;">Cargando historial...</p>
            </div>
         </div>
      </div>
      `;
      this.render(html);

      const container = document.getElementById('history-content');
      try {
        const response = await fetch('https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/devocional-index.json?' + new Date().getTime());

        let items = [];
        if (response.ok) {
          items = await response.json();
        } else {
          throw new Error("No se pudo cargar el historial.");
        }

        if (items.length === 0) {
          container.innerHTML = '<div style="text-align: center; padding: 2rem; opacity: 0.6;">No hay devocionales anteriores.</div>';
          return;
        }

        // Ordenar items del índice según el orden seleccionado
        items.sort((a, b) => {
          const d1 = a.fecha || '';
          const d2 = b.fecha || '';
          return this.devotionalSortOrder === 'asc' ? d1.localeCompare(d2) : d2.localeCompare(d1);
        });

        container.innerHTML = items.map(item => `
            <div class="premium-card" onclick="window.app.loadDevotionalFromHistory('${item.file}')" style="padding: 1rem; flex-direction: row; align-items: center; justify-content: space-between; text-align: left;">
                <div style="text-align: left;">
                    <h3 style="font-size: 1rem; margin-bottom: 0.25rem;">${item.titulo}</h3>
                    <span style="font-size: 0.8rem; opacity: 0.6;">${item.fecha || ''}</span>
                </div>
                <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
            </div>
          `).join('');
        this.refreshIcons();

      } catch (e) {
        console.error(e);
        container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;">${createIcon('alert-circle')}</div>
          <h3 style="margin-bottom: 0.5rem;">No se pudo cargar el historial</h3>
          <p style="opacity: 0.7; margin-bottom: 1.5rem;">Revise su conexión a internet y pruebe nuevamente.</p>
          <button class="btn-primary" onclick="window.app.renderDevotionalHistory()">Reintentar</button>
        </div>
      `;
        this.refreshIcons();
      }
    } catch (err) {
      console.error("Error reading devotionals directory:", err);
      // Fallback if readdir fails or something else in the outer try
    }
  }

  /* Método auxiliar para cargar un devocional específico del historial */
  async loadDevotionalFromHistory(filename) {
    this.showToast("Cargando devocional...");
    try {
      const response = await fetch(`https://dataconnect-kohl.vercel.app/${filename}`);
      if (!response.ok) throw new Error("No encontrado");
      const data = await response.json();
      this.renderDevotionalView(data, true);
    } catch (e) {
      this.showToast("No se pudo abrir este devocional.");
    }
  }

  // Refactor del renderizado para reutilizar en historial y último
  renderDevotionalView(data, fromHistory = false) {
    /* Si venimos del home (fromHistory=false), el currentView es devotional, updateamos UI */
    /* Si venimos del historial, cambiamos la vista */
    if (fromHistory) this.currentView = 'devotional-detail';

    const html = `
      <header>
        <button class="btn-icon" onclick="${fromHistory ? 'window.app.renderDevotionalHistory()' : 'window.app.renderHome()'}\">${createIcon('arrow-left')}</button>
        <h1>${fromHistory ? 'Devocional' : 'Devocional Semanal'}</h1>
        ${!fromHistory ? `<button class="btn-icon" onclick="window.app.renderDevotionalHistory()">${createIcon('history')}</button>` : ''}
      </header>
      <div class="view-container animate-entrance" style="padding-bottom: 2rem;">
        <div style="width: 100%; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="premium-card" style="padding: 0; overflow: hidden; border: none;">
                <div style="background: var(--accent); padding: 1.5rem; color: white; text-align: center;">
                    <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">${data.fecha_hora || 'Devocional'}</span>
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0.5rem 0;">${data.titulo}</h2>
                    <span style="font-size: 0.9rem; font-style: italic;">Por ${data.autor}</span>
                </div>
                <div style="padding: 2rem;">
                    <div style="background: rgba(var(--accent-rgb), 0.1); border-left: 4px solid var(--accent); padding: 1rem; margin-bottom: 2rem; font-style: italic; color: var(--text-main);">
                        "${data.versiculo}"
                    </div>
                    <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main); margin-bottom: 2rem; white-space: pre-wrap;">${data.devocional}</div>
                    <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; border: 1px dashed var(--glass-border);">
                        <h4 style="color: var(--accent); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">${createIcon('heart-handshake')} Oración</h4>
                        <p style="font-style: italic; opacity: 0.9;">${data.oracion}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
    this.render(html);
  }

  // --- Funcionalidad de Respaldo y Restauración ---

  async exportUserData() {
    this.showToast("Preparando exportación...");

    try {
      // 1. Crear JSON con datos del usuario
      const backupData = this.db.exportUserData();
      const jsonString = JSON.stringify(backupData, null, 2);

      // 2. Definir nombre de archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5).replace('T', '_');
      const jsonFileName = `biblia_backup_${timestamp}.json`;

      // 3. Guardar directamente en Documentos
      await Filesystem.writeFile({
        path: jsonFileName,
        data: jsonString,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      this.showToast(`Respaldo guardado en Documentos: ${jsonFileName}`);

    } catch (error) {
      console.error("Error exportando datos:", error);

      let errorMessage = "Error al exportar datos";
      if (error.message) {
        if (error.message.includes("permission")) {
          errorMessage = "Permisos insuficientes para guardar el archivo";
        } else {
          errorMessage = error.message;
        }
      }

      this.showToast(errorMessage);
    }
  }


  async importUserData() {
    this.openConfirmModal(
      "Importar Datos",
      "Seleccione un archivo JSON de respaldo. Sus datos actuales (favoritos, notas, marcadores) serán reemplazados. ¿Desea continuar?",
      () => {
        this.selectBackupFile();
      },
      "Importar",
      "var(--accent)"
    );
  }

  async selectBackupFile() {
    try {
      const result = await FilePicker.pickFiles({
        types: ['application/json'],
        readData: false
      });

      if (result.files.length > 0) {
        const file = result.files[0];
        // Verificar extensión
        if (!file.name.toLowerCase().endsWith('.json')) {
          this.showToast("Por favor seleccione un archivo .json");
          return;
        }

        // En Android, file.path suele estar disponible o file.uri
        const path = file.path || file.uri;
        if (path) {
          await this.performImport(path);
        } else {
          this.showToast("No se pudo acceder al archivo seleccionado");
        }
      }
    } catch (error) {
      if (error && error.message !== 'User cancelled') {
        console.error("Error seleccionando archivo:", error);
        this.showToast("Error al seleccionar archivo");
      }
    }
  }

  async performImport(filePath) {
    this.showToast("Restaurando datos...");

    try {
      // 1. Leer el archivo directamente
      // Nota: Filesystem.readFile puede leer desde rutas absolutas si se pasan correctamente
      // En Capacitor, a veces es mejor usar la URI directamente si viene del FilePicker
      const content = await Filesystem.readFile({
        path: filePath,
        encoding: Encoding.UTF8
      });

      if (!content || !content.data) {
        throw new Error("El archivo está vacío o no se pudo leer");
      }

      const backupData = JSON.parse(content.data);

      // 2. Importar a la base de datos
      this.db.importUserData(backupData);

      this.showToast("Restauración exitosa. Reiniciando aplicación...");

      // 3. Reiniciar
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      console.error("Error en importación:", error);
      this.showToast("Error al importar: " + (error.message || error));
    }
  }
}
window.app = new App();
