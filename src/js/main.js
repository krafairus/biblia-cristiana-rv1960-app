import '../css/style.css';
import { BibleDB } from './db.js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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
    this.currentVodDesign = 1;
    this.dictionary = [];
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentVerseIndex = 0;
    this.currentChapterVerses = [];
    this.aboutClickCount = 0;
    this.appVersion = '1.3.0';
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
    this.editorLogoClickCount = 0;
    this.editorSearchQuery = '';
    this.editorSortOrder = 'desc';
    this.editorCurrentTab = 'devocional';
    this.editorCurrentView = 'list';

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
    // Cerrar dropdowns del editor al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.toolbar-dropdown')) {
        document.querySelectorAll('.toolbar-dropdown.active').forEach(d => d.classList.remove('active'));
      }
    });

    const loaded = await this.db.init();
    if (loaded) {
      this.migrateThemes();
      this.applyTheme();
      this.watchSystemTheme();
      this.renderHome();
      this.renderFloatingNav();
      this.updateFloatingNavState();
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

    if (s.theme_style === 'ink') {
      s.theme_mode = 'light';
    }

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

    // Restaurar estilos globales (por si venimos del editor con scroll bloqueado)
    this.appEl.style.height = '';
    this.appEl.style.overflow = '';
    document.body.style.overflow = '';

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
    const vod = this.db.getVerseOfDay();
    const seed = new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate();
    const bgNum = (seed % 11) + 1;

    const html = `
      <header>
        <div style="display:flex; flex-direction:column;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; line-height:1.1;">BIBLIA CRISTIANA</h1>
          <div style="font-size: 0.7rem; opacity: 0.6; color: var(--accent); font-weight: 800; letter-spacing: 2px; margin-top:2px;">REINA VALERA 1960</div>
        </div>
        <div style="margin-left:auto; display:flex; gap:0.5rem;">
          ${this.db.settings.theme_style !== 'ink' ? `
          <button class="btn-icon" onclick="window.app.toggleMode()" id="theme-toggle-btn">
            ${createIcon(this.db.settings.theme_mode === 'dark' ? 'sun' : 'moon')}
          </button>
          ` : ''}
          <button class="btn-icon" onclick="window.app.navigate('settings')">${createIcon('settings')}</button>
        </div>
      </header>

      <div class="view-container with-main-nav animate-entrance">
        ${vod ? `
          <div class="home-vod-card" onclick="window.pendingVerseScroll = '${vod.verse}'; window.app.renderReader('${vod.book}', '${vod.chapter}')"
               style="background-image: url('/img/bg-verse-${bgNum}.png'); border-radius: 28px; box-shadow: 0 12px 30px rgba(0,0,0,0.25);">
            <div class="vod-thematic" style="background:none; border:none; padding:0; font-size:0.75rem; color:white; opacity:0.85; font-weight:800; letter-spacing:2px; margin-bottom:0.25rem; text-transform:uppercase;">${vod.thematic}</div>
            <div class="vod-text">"${vod.text}"</div>
            <div class="vod-ref">${vod.book} ${vod.chapter}:${vod.verse}</div>
          </div>
        ` : ''}

        <h2 class="home-section-title">${createIcon('book')} Testamentos</h2>
        <div class="home-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="premium-card" onclick="window.app.navigate('old')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:42px; height:42px;">${createIcon('book')}</div>
            <div style="font-weight:700; font-size:0.95rem; text-align:center;">Antiguo T.</div>
          </div>
          <div class="premium-card" onclick="window.app.navigate('new')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:42px; height:42px;">${createIcon('book-open')}</div>
            <div style="font-weight:700; font-size:0.95rem; text-align:center;">Nuevo T.</div>
          </div>
        </div>

        <h2 class="home-section-title">${createIcon('bookmark')} Accesos Rápidos</h2>
        <div class="home-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="premium-card" onclick="window.app.navigate('last')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:38px; height:38px;">${createIcon('history')}</div>
            <span style="font-size:0.85rem; font-weight:700; text-align:center;">Última lectura</span>
          </div>
          <div class="premium-card" onclick="window.app.navigate('vod')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:38px; height:38px;">${createIcon('sun')}</div>
            <span style="font-size:0.85rem; font-weight:700; text-align:center;">Vr del día</span>
          </div>
          <div class="premium-card" onclick="window.app.navigate('crecimiento')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:38px; height:38px;">${createIcon('trending-up')}</div>
            <span style="font-size:0.85rem; font-weight:700; text-align:center;">Crecimiento</span>
          </div>
          <div class="premium-card" onclick="window.app.navigate('dict')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:38px; height:38px;">${createIcon('book-a')}</div>
            <span style="font-size:0.85rem; font-weight:700; text-align:center;">Diccionario</span>
          </div>
        </div>
      </div>
    `;
    this.render(html);
    this.updateFloatingNavState();
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
    else if (target === 'crecimiento') this.renderCrecimiento();
    else if (target === 'devocional') this.renderDevotionalHistory();
    else if (target === 'preguntas') this.renderPreguntasHistory();
    else if (target === 'devotional-favorites') this.renderDevotionalFavorites();
    else if (target === 'editor-admin') this.renderEditorAdmin();
    else if (target === 'note-editor') {
      // note-editor se maneja específicamente con parámetros
    }
    else if (target === 'last') {
      const { last_book, last_chapter } = this.db.settings;
      this.renderReader(last_book, last_chapter);
    }
    this.updateFloatingNavState();
  }

  updateFloatingNavState() {
    const nav = document.getElementById('main-floating-nav');
    if (!nav) return;

    // Pantallas donde NO debe salir el menú (Lectura, Selección, Edición y todas las secundarias)
    const hideViews = [
      'reader', 'note-editor',          // Lectura y edición
      'old', 'new', 'chapters', 'verses', // Selección de libro/capítulo/versículo
      'settings', 'about',               // Configuración e información
      'crecimiento', 'devocional', 'preguntas', 'devotional-favorites', 'devotional-history', 'devotional-detail',
      'vod', 'share-verse', 'dict', 'editor-admin'
    ];
    const shouldHide = hideViews.includes(this.currentView);

    nav.classList.toggle('hidden', shouldHide);

    // Marcar activo
    nav.querySelectorAll('.nav-item').forEach(item => {
      const target = item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      let isActive = (this.currentView === target);
      if (target === 'home' && this.currentView === 'home') isActive = true;

      item.classList.toggle('active', isActive);
    });
  }

  renderFloatingNav() {
    let nav = document.getElementById('main-floating-nav');
    const navContent = `
      <a class="nav-item" onclick="window.app.navigate('home')">
        ${createIcon('home')}
        <span style="font-size: 0.78rem;">Inicio</span>
      </a>
      <a class="nav-item" onclick="window.app.navigate('search')">
        ${createIcon('search')}
        <span style="font-size: 0.78rem;">Buscar</span>
      </a>
      <a class="nav-item" onclick="window.app.navigate('highlights')">
        ${createIcon('highlighter')}
        <span style="font-size: 0.78rem;">Resaltos</span>
      </a>
      <a class="nav-item" onclick="window.app.navigate('favorites')">
        ${createIcon('heart')}
        <span style="font-size: 0.78rem;">Favoritos</span>
      </a>
      <a class="nav-item" onclick="window.app.navigate('notes')">
        ${createIcon('sticky-note')}
        <span style="font-size: 0.78rem;">Notas</span>
      </a>
    `;

    if (!nav) {
      nav = document.createElement('div');
      nav.id = 'main-floating-nav';
      nav.className = 'floating-nav hidden';
      nav.innerHTML = navContent;
      this.appEl.after(nav);
    } else {
      nav.innerHTML = navContent;
    }
    this.refreshIcons();
  }

  renderBookList(testament) {
    this.currentView = testament === 'old' ? 'old' : 'new';
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
    this.updateFloatingNavState();
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
    this.updateFloatingNavState();
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
    this.updateFloatingNavState();
  }

  renderReader(book, chapter) {
    this.currentView = 'reader';
    this.db.setLastRead(book, chapter);
    const chapters = this.db.getChapters(book);
    const verses = this.db.getVerses(book, chapter);

    // Asegurar limpieza de barras residuales flotantes (buscador, favoritos, etc)
    const mainNav = document.getElementById('main-floating-nav');
    if (mainNav) mainNav.classList.add('hidden');
    const favBar = document.getElementById('fav-selection-bar');
    if (favBar) favBar.style.display = 'none';
    const highlightBar = document.getElementById('highlight-selection-bar');
    if (highlightBar) highlightBar.style.display = 'none';

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
      <div class="view-container with-selection-bar animate-entrance">
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
        ${['#fef3c7', '#dcfce7', '#dbeafe', '#fae8ff', '#fecaca', '#fed7aa', '#f9fafb', 'transparent'].map(c => `
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
    this.currentNoteIndex = index;
    this.currentView = 'note-editor';
    this.updateFloatingNavState();
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
      <header style="position: relative; top: auto; flex-shrink: 0;">
        <button class="btn-icon" onclick="window.app.cancelNoteEditor()">${createIcon('chevron-left')}</button>
        <div class="note-title-container">
          <input type="text" id="editor-note-title" class="note-title-input"
                 placeholder="${index !== null ? 'Título de la nota...' : 'Nueva nota...'}"
                 value="${(n.title || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="toolbar-dropdown">
          <button class="btn-icon dropdown-trigger" onclick="event.stopPropagation(); this.parentElement.classList.toggle('active')" title="Acciones">
            ${createIcon('more-vertical')}
          </button>
          <div class="dropdown-content right" style="min-width:160px;">
            <button onclick="window.app.confirmSaveNoteFromEditor()" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.6rem 0.8rem;text-align:left;background:none;border:none;color:var(--accent);font-size:0.9rem;font-weight:600;">
              ${createIcon('check')} Guardar Nota
            </button>
            ${index !== null ? `
            <button onclick="window.app.exportNoteToPDF(${index})" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.6rem 0.8rem;text-align:left;background:none;border:none;color:var(--text-main);font-size:0.9rem;font-weight:500;">
              ${createIcon('file-text')} Exportar a PDF
            </button>
            <button onclick="window.app.confirmDeleteNote(${index})" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.6rem 0.8rem;text-align:left;background:none;border:none;color:#ef4444;font-size:0.9rem;font-weight:500;">
              ${createIcon('trash-2')} Eliminar Nota
            </button>` : ''}
          </div>
        </div>
      </header>

      <!-- Layout del editor -->
      <div id="editor-wrapper" style="display:flex; flex-direction:column; flex:1; min-height:0; position:relative;">

        <!-- Área de texto -->
        <div style="flex:1; min-height:0; position:relative; margin-top:0.5rem; display:flex; flex-direction:column;">

          <!-- Paneles integrados (Rediseñados como Bottom Sheets Globales) -->
          <div id="editor-header-panel" class="editor-inline-panel">
            <div class="editor-inline-backdrop" onclick="window.app.closeEditorPanel('editor-header-panel')"></div>
            <div class="editor-inline-panel-content">
              <p class="editor-panel-label">Formato de Texto</p>
              <div class="editor-panel-grid">
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','H1')" class="panel-item"><span style="font-size:1.2rem;font-weight:900;">H1</span><small>Título</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','H2')" class="panel-item"><span style="font-size:1.05rem;font-weight:800;">H2</span><small>Subtítulo</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','H3')" class="panel-item"><span style="font-size:0.95rem;font-weight:700;">H3</span><small>Sección</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','p')" class="panel-item"><span>P</span><small>Párrafo</small></button>
              </div>
            </div>
          </div>

          <div id="editor-more-panel" class="editor-inline-panel">
            <div class="editor-inline-backdrop" onclick="window.app.closeEditorPanel('editor-more-panel')"></div>
            <div class="editor-inline-panel-content">
              <p class="editor-panel-label">Herramientas Avanzadas</p>
              <div class="editor-panel-grid">
                <button type="button" onclick="window.app.editorPanelAction('link')" class="panel-item">${createIcon('link')}<small>Enlace</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('insertHorizontalRule')" class="panel-item">${createIcon('minus')}<small>Divisor</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','blockquote')" class="panel-item">${createIcon('quote')}<small>Cita</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','pre')" class="panel-item">${createIcon('code')}<small>Código</small></button>
              </div>
            </div>
          </div>

          <div id="editor-link-panel" class="editor-inline-panel">
            <div class="editor-inline-backdrop" onclick="window.app.closeEditorPanel('editor-link-panel')"></div>
            <div class="editor-inline-panel-content">
              <div class="editor-link-panel-header">
                <p class="editor-panel-label" id="editor-link-title">Insertar Enlace</p>
                <button type="button" class="panel-close-btn" onclick="window.app.closeEditorPanel('editor-link-panel')">${createIcon('x')}</button>
              </div>
              <div class="editor-link-input-group">
                <input type="url" id="editor-link-input" class="editor-link-input-field" placeholder="https://ejemplo.com">
              </div>
              <div class="editor-link-actions" id="editor-link-actions-container">
                <!-- Botones inyectados dinámicamente -->
              </div>
            </div>
          </div>

          <div id="verse-card-editor" style="
            z-index: 50;
            margin: 0.5rem 0.75rem 0.75rem;
            background: var(--bg-color);
            border-radius: 16px;
            border: 1px solid var(--glass-border);
            border-left: 4px solid var(--accent);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            overflow: hidden;
            flex-shrink: 0;
          ">
            <div style="padding:0.65rem 0.85rem; display:flex; align-items:center; gap:0.5rem; background: var(--header-bg);">
              <div style="flex:1; min-width:0;">
                <div style="color:var(--accent); font-size:0.78rem; font-weight:700; letter-spacing:0.03em;">${n.book} ${n.chapter}:${n.verse}</div>
              </div>
              <button type="button" id="verse-toggle-btn" onclick="window.app.toggleVerseText()"
                style="flex-shrink:0; background:var(--accent-soft); border:none; color:var(--accent); padding:0.25rem 0.5rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:0.2rem; font-size:0.7rem; font-weight:600; transition:transform 0.25s ease;">
                ${createIcon('chevron-up')}
              </button>
            </div>
            <div id="verse-text-editor" style="
              font-size:0.88rem; opacity:0.75; font-style:italic; line-height:1.5;
              padding:0 0.85rem 0.65rem;
              overflow:hidden;
              max-height:300px;
              transition:all 0.4s ease;
            ">"${n.text}"</div>
          </div>
          <!-- Área de scroll dedicada -->
          <div id="editor-scroll-container" style="flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; position:relative; -webkit-overflow-scrolling:touch; padding-top:0.25rem;">
            <div id="editor-note-text" class="rich-editor" contenteditable="true"
                 placeholder="¿Qué te inspira Dios a escribir aquí?..."
                  oncontextmenu="return true"
                 style="min-height:200px; outline:none; padding:0 1.25rem;">${n.note || ''}</div>
            
            <div class="editor-bottom-spacer" style="height:80px; pointer-events:none;"></div>
          </div>
        </div>

        <!-- ═══ TOOLBAR PILL FLOTANTE PREMIUM ═══ -->
        <div id="editor-toolbar-wrap" class="editor-toolbar-pill-container" style="transition: bottom 0.2s ease-out;">
          
          <!-- Fila secundaria (Oculta por defecto) -->
          <div id="toolbar-secondary-row" class="editor-toolbar-floating editor-toolbar-secondary" style="display:none;">
            <button type="button" data-command="insertUnorderedList" onclick="window.app.execEditorCommand('insertUnorderedList')" class="tb-btn" title="Lista">${createIcon('list')}</button>
            <button type="button" data-command="insertOrderedList" onclick="window.app.execEditorCommand('insertOrderedList')" class="tb-btn" title="Lista Numerada">${createIcon('list-ordered')}</button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.execEditorCommand('removeFormat')" class="tb-btn" title="Limpiar Formato">${createIcon('eraser')}</button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.execEditorCommand('undo')" class="tb-btn" title="Deshacer">${createIcon('undo-2')}</button>
            <button type="button" onclick="window.app.execEditorCommand('redo')" class="tb-btn" title="Rehacer">${createIcon('redo-2')}</button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.toggleSubToolbar(null)" class="tb-btn" title="Cerrar" style="color:var(--accent);">${createIcon('x')}</button>
          </div>

          <!-- Fila de Encabezados (Sustituye a la principal) -->
          <div id="toolbar-header-row" class="editor-toolbar-floating" style="display:none;">
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','H1')" class="tb-btn"><b>H1</b></button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','H2')" class="tb-btn"><b>H2</b></button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','H3')" class="tb-btn"><b>H3</b></button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','p')" class="tb-btn"><b>P</b></button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.toggleSubToolbar(null)" class="tb-btn" title="Volver">${createIcon('chevron-left')}</button>
          </div>

          <!-- Fila de Herramientas Avanzadas -->
          <div id="toolbar-more-row" class="editor-toolbar-floating" style="display:none;">
            <button type="button" onclick="window.app.showLinkDialog()" class="tb-btn">${createIcon('link')}</button>
            <button type="button" onclick="window.app.execEditorCommand('insertHorizontalRule')" class="tb-btn">${createIcon('minus')}</button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','blockquote')" class="tb-btn">${createIcon('quote')}</button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','pre')" class="tb-btn">${createIcon('code')}</button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.toggleSubToolbar(null)" class="tb-btn" title="Volver">${createIcon('chevron-left')}</button>
          </div>

          <!-- Fila principal -->
          <div id="note-rich-toolbar" class="editor-toolbar-floating" style="display:flex;">
            <button type="button" data-command="bold" onclick="window.app.execEditorCommand('bold')" class="tb-btn" title="Negrita">${createIcon('bold')}</button>
            <button type="button" data-command="italic" onclick="window.app.execEditorCommand('italic')" class="tb-btn" title="Cursiva">${createIcon('italic')}</button>
            <button type="button" data-command="underline" onclick="window.app.execEditorCommand('underline')" class="tb-btn" title="Subrayado">${createIcon('underline')}</button>
            <button type="button" data-command="strikethrough" onclick="window.app.execEditorCommand('strikethrough')" class="tb-btn" title="Tachado">${createIcon('strikethrough')}</button>
            <div class="tb-sep"></div>
            <button type="button" id="align-toggle-btn" onclick="window.app.toggleAlignment(event)" class="tb-btn" title="Alineación">${createIcon('align-left')}</button>
            <button type="button" id="header-open-btn" onclick="window.app.toggleSubToolbar('toolbar-header-row')" class="tb-btn" title="Encabezados"><b>H</b></button>
            <button type="button" id="more-open-btn" onclick="window.app.toggleSubToolbar('toolbar-more-row')" class="tb-btn" title="Más herramientas">${createIcon('layout-grid')}</button>
            <div style="width: 8px;"></div>
            <button type="button" id="toolbar-expand-btn" onclick="window.app.toggleSubToolbar('toolbar-secondary-row')" class="tb-btn" title="Más" style="color:var(--accent); background: var(--accent-soft); border-radius: 50%;">${createIcon('plus')}</button>
          </div>
        </div>
      </div>
    `;

    this.render(html);

    // Bloquear scroll global para el editor
    this.appEl.style.height = '100vh';
    this.appEl.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    this.refreshIcons();

    document.execCommand('defaultParagraphSeparator', false, 'p');

    // Eventos de teclado y mouse se manejarán abajo con _updateToolbarState

    // ─── Toolbar fija al visualViewport con offset suave ───────
    const toolbarWrap = document.getElementById('editor-toolbar-wrap');
    const _updateToolbarPos = () => {
      const vp = window.visualViewport;
      if (!vp) return;

      const keyboardHeight = window.innerHeight - vp.height;
      const isKeyboardVisible = keyboardHeight > 60;

      // Ajustar barra de herramientas
      if (toolbarWrap) {
        if (isKeyboardVisible) {
          // Si el teclado está visible, ponemos el offset mínimo y quitamos el padding del contenedor
          toolbarWrap.style.bottom = keyboardHeight + 'px';
          toolbarWrap.style.paddingBottom = '0.5rem';
        } else {
          toolbarWrap.style.bottom = '0px';
          toolbarWrap.style.paddingBottom = '1.25rem'; // Restaurar padding original de style.css
        }
      }

      // Ajustar Paneles (Bottom Sheets) para que no los tape el teclado
      document.querySelectorAll('.editor-inline-panel-content').forEach(panel => {
        if (isKeyboardVisible) {
          panel.style.paddingBottom = '1rem';
          panel.style.marginBottom = keyboardHeight + 'px';
        } else {
          panel.style.paddingBottom = '';
          panel.style.marginBottom = '0';
        }
      });

      // Ajustar altura del wrapper para evitar bloqueos de scroll
      const wrapper = document.getElementById('editor-wrapper');
      if (wrapper) {
        wrapper.style.height = vp.height + 'px';
      }
    };
    if (window.visualViewport) {
      if (this._vpResizeHandler) {
        window.visualViewport.removeEventListener('resize', this._vpResizeHandler);
      }
      this._vpResizeHandler = _updateToolbarPos;
      window.visualViewport.addEventListener('resize', this._vpResizeHandler);
      window.visualViewport.addEventListener('scroll', this._vpResizeHandler);
      _updateToolbarPos();
    }

    // ─── Listeners para estados de botones ───────────────────────
    const _updateToolbarState = () => {
      const commands = ['bold', 'italic', 'underline', 'strikethrough'];
      commands.forEach(cmd => {
        const btn = document.querySelector(`.tb-btn[data-command="${cmd}"]`);
        if (btn) {
          const isActive = document.queryCommandState(cmd);
          btn.classList.toggle('active', isActive);
        }
      });

      // Estados para Cita y Código (basado en nodos)
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node = selection.anchorNode;
        if (node.nodeType === 3) node = node.parentNode;

        const isQuote = !!node.closest('blockquote');
        const isCode = !!node.closest('pre') || !!node.closest('code');
        const isH1 = !!node.closest('h1');
        const isH2 = !!node.closest('h2');
        const isH3 = !!node.closest('h3');

        const quoteBtn = document.getElementById('align-toggle-btn'); // Reutilizado o buscar el suyo
        const headerBtn = document.getElementById('header-panel-btn');
        const moreBtn = document.getElementById('more-panel-btn');

        if (headerBtn) headerBtn.classList.toggle('active', isH1 || isH2 || isH3);
        // Marcamos el botón de herramientas si hay algo "especial" activo que esté dentro del panel
        if (moreBtn) moreBtn.classList.toggle('active', isQuote || isCode);
      }
    };

    this._updateToolbarState = _updateToolbarState;
    const editor = document.getElementById('editor-note-text');
    if (editor) {
      editor.addEventListener('keyup', _updateToolbarState);
      editor.addEventListener('mouseup', _updateToolbarState);
      editor.addEventListener('touchend', _updateToolbarState);
      editor.addEventListener('input', _updateToolbarState);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Se eliminó el auto-enfoco setTimeout para evitar que el teclado se abra solo
    // y para prevenir saltos inesperados al final de la nota.
  }




  async copySelection() {
    const text = window.getSelection().toString();
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showToast('Copiado al portapapeles');
      } catch (err) {
        document.execCommand('copy');
        this.showToast('Copiado');
      }
    }
  }

  async pasteToEditor() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        document.execCommand('insertText', false, text);
      }
    } catch (err) {
      this.showToast('No se pudo acceder al portapapeles. Use el menú de Android si es necesario.');
      // Si falla, podríamos intentar execCommand('paste'), pero suele estar bloqueado
    }
  }

  execEditorCommand(cmd, val = null) {
    if (cmd === 'formatBlock') {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const currentBlock = document.queryCommandValue('formatBlock');
      const targetTag = val.toLowerCase();
      const currentTag = currentBlock.toLowerCase();

      // Alternar bloque (quitar si ya está puesto)
      if (currentTag === targetTag || (currentTag === 'address' && targetTag === 'blockquote')) {
        document.execCommand('formatBlock', false, 'p');
      } else {
        const isHeader = /^h[1-6]|blockquote|pre$/.test(targetTag);
        if (isHeader) {
          // --- ESTRATEGIA DE APLANAMIENTO PARA ENCABEZADOS ---
          const range = selection.getRangeAt(0);
          let block = range.commonAncestorContainer;
          if (block.nodeType === 3) block = block.parentNode;

          const editor = document.getElementById('editor-note-text');
          while (block && block.parentNode !== editor && block !== editor) {
            block = block.parentNode;
          }

          // Guardar alineación actual del bloque padre
          const textAlign = block && block !== editor ? block.style.textAlign : null;

          // Aplicar el formato
          document.execCommand('formatBlock', false, val);

          // Re-localizar el nuevo bloque generado para restaurar la alineación
          const newSel = window.getSelection();
          let newBlock = newSel.getRangeAt(0).commonAncestorContainer;
          if (newBlock.nodeType === 3) newBlock = newBlock.parentNode;
          while (newBlock && newBlock.parentNode !== editor && newBlock !== editor) {
            newBlock = newBlock.parentNode;
          }

          if (newBlock && newBlock !== editor && textAlign) {
            newBlock.style.textAlign = textAlign;
          }
        } else {
          document.execCommand('formatBlock', false, val);
        }
      }
    } else if (cmd === 'removeFormat') {
      document.execCommand('removeFormat', false, null);
      document.execCommand('formatBlock', false, 'p');
    } else {
      document.execCommand(cmd, false, val);
    }

    // Refrescar UI y devolver foco
    document.querySelectorAll('.toolbar-dropdown.active').forEach(d => d.classList.remove('active'));
    this.updateToolbarState();
    const editor = document.getElementById('editor-note-text');
    if (editor) editor.focus();
  }

  showLinkDialog() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || (selection.toString().trim() === '' && !selection.anchorNode.parentElement.closest('a'))) {
      this.showToast('Por favor, seleccione el texto que desea convertir en enlace');
      return;
    }

    const linkEl = selection.anchorNode.parentElement.closest('a');
    const panel = document.getElementById('editor-link-panel');
    const input = document.getElementById('editor-link-input');
    const title = document.getElementById('editor-link-title');
    const actionsCont = document.getElementById('editor-link-actions-container');

    this.savedRange = selection.getRangeAt(0);

    if (linkEl) {
      title.innerText = 'Editar Enlace';
      input.value = linkEl.href;
      actionsCont.innerHTML = `
        <button type="button" class="editor-link-btn editor-link-btn-delete" onclick="window.app.removeLink()">${createIcon('trash-2')} Eliminar</button>
        <button type="button" class="editor-link-btn editor-link-btn-save" onclick="window.app.applyLink()">Guardar</button>
      `;
    } else {
      title.innerText = 'Insertar Enlace';
      input.value = 'https://';
      actionsCont.innerHTML = `
        <button type="button" class="editor-link-btn editor-link-btn-cancel" onclick="window.app.closeEditorPanel('editor-link-panel')">Cancelar</button>
        <button type="button" class="editor-link-btn editor-link-btn-save" onclick="window.app.applyLink()">Insertar</button>
      `;
    }

    this.toggleEditorPanel('editor-link-panel');
    setTimeout(() => {
      input.focus();
      input.select();
    }, 350);
  }

  applyLink() {
    const input = document.getElementById('editor-link-input');
    const url = input ? input.value.trim() : '';

    if (!url || url === 'https://') {
      this.showToast('Por favor, ingrese una URL válida');
      return;
    }

    // Restaurar selección
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(this.savedRange);

    document.execCommand('createLink', false, url);
    this.closeEditorPanel('editor-link-panel');
    this._updateToolbarState();
  }

  removeLink() {
    // Restaurar selección
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(this.savedRange);

    document.execCommand('unlink', false, null);
    this.closeEditorPanel('editor-link-panel');
    this._updateToolbarState();
  }


  async exportNoteToPDF(index) {
    // Cerrar dropdown
    document.querySelectorAll('.toolbar-dropdown.active').forEach(d => d.classList.remove('active'));

    const title = document.getElementById('editor-note-title').value.trim() || 'Nota sin título';
    const currentContent = document.getElementById('editor-note-text').innerHTML;
    const savedNote = index !== null ? this.db.notes[index] : null;

    // Si hay una nota guardada, preguntar qué versión exportar
    if (savedNote) {
      this._tempExportData = {
        title: title,
        content: savedNote.note || '',
        current: currentContent
      };

      const choicesHtml = `
        <div class="modal-choice-list">
          <button class="modal-choice-btn primary" onclick="window.app.generatePDF(window.app._tempExportData.title, window.app._tempExportData.current); window.app.closeConfirmModal();">
            <i data-lucide="edit-3"></i> Cambios Actuales
          </button>
          <button class="modal-choice-btn" onclick="window.app.generatePDF(window.app._tempExportData.title, window.app._tempExportData.content); window.app.closeConfirmModal();">
            <i data-lucide="save"></i> Versión Guardada
          </button>
        </div>
      `;

      this.openConfirmModal(
        "Exportar PDF",
        "Selecciona qué versión deseas exportar:",
        () => { }, // No se usa el botón OK por defecto
        null, // Ocultar botón OK
        null,
        choicesHtml
      );
      this.refreshIcons(); // Para los iconos de Lucide en el modal
    } else {
      // Si es una nota nueva, exportar el contenido actual
      this.generatePDF(title, currentContent);
    }
  }

  async generatePDF(title, contentHtml) {
    try {
      this.showToast('Generando PDF...');

      // Obtener referencia bibliográfica y texto usando los nuevos IDs
      const refContainer = document.querySelector('#verse-card-editor div div div');
      const textContainer = document.getElementById('verse-text-editor');

      const reference = refContainer ? refContainer.innerText : '';
      const verseText = textContainer ? textContainer.innerText.replace(/^"|"$/g, '') : '';

      // 1. Construir el HTML para el PDF con diseño Premium
      const pdfHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { 
              font-family: 'Inter', 'Helvetica', 'Arial', sans-serif; 
              padding: 50px; 
              color: #1f2937; 
              line-height: 1.7;
              background: #ffffff;
            }
            .header { 
              margin-bottom: 40px; 
              padding-bottom: 20px;
              border-bottom: 1px solid #e5e7eb;
            }
            .title { 
              font-size: 32px; 
              font-weight: 700; 
              margin-bottom: 8px; 
              color: #111827;
              line-height: 1.2;
            }
            .date { 
              font-size: 14px; 
              color: #6b7280; 
              font-weight: 500;
            }
            .verse-card { 
              background: #f8fafc; 
              border-left: 5px solid #6366f1; 
              padding: 24px; 
              margin-bottom: 40px; 
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }
            .verse-ref { 
              font-weight: 700; 
              color: #6366f1; 
              font-size: 14px; 
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
            }
            .verse-content { 
              font-style: italic; 
              color: #475569; 
              font-size: 17px;
              line-height: 1.6;
            }
            .content { 
              font-size: 17px; 
              word-wrap: break-word; 
              color: #334155;
            }
            .footer { 
              margin-top: 60px; 
              font-size: 13px; 
              color: #94a3b8; 
              text-align: center; 
              border-top: 1px solid #f1f5f9; 
              padding-top: 25px;
              font-weight: 500;
            }
            /* Estilos para contenido enriquecido */
            h1, h2, h3 { color: #1e1b4b; margin-top: 30px; margin-bottom: 15px; }
            h1 { font-size: 26px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            h2 { font-size: 22px; }
            h3 { font-size: 20px; }
            blockquote { 
              border-left: 4px solid #6366f1; 
              background: #f5f7ff; 
              padding: 15px 25px; 
              font-style: italic; 
              margin: 25px 0;
              border-radius: 0 12px 12px 0;
              color: #4338ca;
            }
            pre { 
              background: #0f172a; 
              color: #f8fafc; 
              padding: 20px; 
              border-radius: 12px; 
              font-family: 'Courier New', monospace; 
              font-size: 15px;
              overflow-x: auto; 
              white-space: pre-wrap;
              margin: 25px 0;
            }
            hr { border: none; border-top: 2px solid #f1f5f9; margin: 30px 0; }
            a { color: #6366f1; text-decoration: none; font-weight: 600; }
            ul, ol { padding-left: 25px; margin: 20px 0; }
            li { margin-bottom: 8px; }
            .editor-bottom-spacer { display: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${title}</div>
            <div class="date">${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          
          <div class="verse-card">
            <div class="verse-ref">${reference}</div>
            <div class="verse-content">"${verseText}"</div>
          </div>
          
          <div class="content">
            ${contentHtml}
          </div>
          
          <div class="footer">
            Documento espiritual generado desde BIBLIA CRISTIANA RV1960
          </div>
        </body>
        </html>
      `;

      // 2. Importar plugins
      const { PdfGenerator } = await import('@capgo/capacitor-pdf-generator');

      // 3. Generar fecha formateada para el nombre de archivo
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES').replace(/\//g, '_');
      const timeStr = now.getHours().toString().padStart(2, '0') + '_' + now.getMinutes().toString().padStart(2, '0');
      const fullFileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${dateStr}_${timeStr}.pdf`;

      const result = await PdfGenerator.fromData({
        data: pdfHtml,
        documentSize: 'A4',
        orientation: 'portrait',
        type: 'base64',
        fileName: fullFileName
      });

      const pdfBase64 = result.data || result.pdf || result.base64;

      if (pdfBase64) {
        // Guardar temporalmente para compartir
        const path = `temp_${Date.now()}.pdf`;
        await Filesystem.writeFile({
          path,
          data: pdfBase64,
          directory: Directory.Cache
        });

        const fileResult = await Filesystem.getUri({
          path,
          directory: Directory.Cache
        });

        await Share.share({
          title: 'Exportar Nota',
          text: title,
          url: fileResult.uri,
          dialogTitle: 'Compartir Nota como PDF'
        });
      } else {
        throw new Error('El generador de PDF no devolvió datos válidos');
      }

    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.showToast('Error al generar PDF: ' + error.message);
    }
  }

  // Método auxiliar para guardar sin confirmar (útil para exportación)
  async saveNoteFromEditor() {
    const title = document.getElementById('editor-note-title').value.trim();
    let note = document.getElementById('editor-note-text').innerHTML;

    // Normalizar: si está "vacío" (solo el párrafo inicial del sistema), guardar como vacío
    if (note === '<p><br></p>' || note === '<p></p>') {
      note = '';
    }

    const index = this.currentNoteIndex;

    if (index !== null) {
      // Actualizar nota existente
      await this.db.updateNote(index, note, title);
    } else if (this.selectedVerse) {
      // Guardar nota nueva
      const { book, chapter, vNum, text } = this.selectedVerse;
      await this.db.addNote(book, chapter, vNum, text, note, title || 'Nueva Nota');

      // Actualizar el índice para el editor (recargar notas para obtener el nuevo índice)
      this.currentNoteIndex = this.db.notes.length - 1;
    }
  }

  updateToolbarState() {
    const container = document.getElementById('editor-toolbar-wrap');
    if (!container) return;

    // Botones simples (disponibles en varias filas)
    const commands = ['bold', 'italic', 'underline', 'strikethrough', 'insertUnorderedList', 'insertOrderedList'];
    commands.forEach(cmd => {
      const btns = container.querySelectorAll(`[data-command="${cmd}"]`);
      btns.forEach(btn => {
        if (document.queryCommandState(cmd)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });

    // Bloques (Headers, Quote, Code)
    const currentBlock = document.queryCommandValue('formatBlock').toLowerCase();

    // Actualizar botones de encabezado en el sub-menú
    container.querySelectorAll('#toolbar-header-row .tb-btn').forEach(btn => {
      const onclick = btn.getAttribute('onclick') || '';
      const match = onclick.match(/formatBlock','([^']+)'/i);
      if (match) {
        const tag = match[1].toLowerCase();
        // Mapear p como default
        const isMatch = (tag === currentBlock) || (tag === 'p' && (currentBlock === '' || currentBlock === 'div'));
        btn.classList.toggle('active', isMatch);
      }
    });

    // Actualizar botones de herramientas avanzadas (Quote, Code)
    const blockCmdMap = {
      'blockquote': ['blockquote', 'address'],
      'pre': ['pre']
    };
    container.querySelectorAll('#toolbar-more-row .tb-btn').forEach(btn => {
      const onclick = btn.getAttribute('onclick') || '';
      const match = onclick.match(/formatBlock','([^']+)'/i);
      if (match) {
        const tag = match[1].toLowerCase();
        const possibleBlocks = blockCmdMap[tag];
        if (possibleBlocks) {
          btn.classList.toggle('active', possibleBlocks.includes(currentBlock));
        }
      }
    });

    // Actualizar icono de alineación
    const alignBtn = document.getElementById('align-toggle-btn');
    if (alignBtn) {
      if (document.queryCommandState('justifyCenter')) {
        alignBtn.innerHTML = createIcon('align-center');
        this._currentAlignment = 'center';
      } else if (document.queryCommandState('justifyRight')) {
        alignBtn.innerHTML = createIcon('align-right');
        this._currentAlignment = 'right';
      } else if (document.queryCommandState('justifyFull')) {
        alignBtn.innerHTML = createIcon('align-justify');
        this._currentAlignment = 'justify';
      } else {
        alignBtn.innerHTML = createIcon('align-left');
        this._currentAlignment = 'left';
      }
    }
    this.refreshIcons();
  }

  // ─── Sub-toolbars del editor (reemplazan la principal) ───────────────
  toggleSubToolbar(id) {
    const rows = ['note-rich-toolbar', 'toolbar-secondary-row', 'toolbar-header-row', 'toolbar-more-row'];
    const container = document.getElementById('editor-toolbar-wrap');

    // Encontrar fila visible actual
    const currentRowId = rows.find(r => {
      const el = document.getElementById(r);
      if (!el) return false;
      return window.getComputedStyle(el).display !== 'none';
    });

    const targetId = id || 'note-rich-toolbar';
    if (currentRowId === targetId) return;

    const currentEl = document.getElementById(currentRowId);
    const targetEl = document.getElementById(targetId);

    if (currentEl) {
      // Animación de salida
      currentEl.classList.remove('tb-slide-in');
      currentEl.classList.add('tb-slide-out');

      setTimeout(() => {
        currentEl.style.display = 'none';
        currentEl.classList.remove('tb-slide-out');

        if (targetEl) {
          targetEl.style.display = 'flex';
          targetEl.classList.add('tb-slide-in');

          if (id) {
            container?.classList.add('sub-active');
          } else {
            container?.classList.remove('sub-active');
          }
        }
        this.updateToolbarState();
      }, 150);
    } else if (targetEl) {
      targetEl.style.display = 'flex';
      targetEl.classList.add('tb-slide-in');
    }

    // Devolver el foco al editor
    const editor = document.getElementById('editor-note-text');
    if (editor) editor.focus();
    this.refreshIcons();
  }

  // Métodos de compatibilidad redirigidos al nuevo sistema
  toggleEditorPanel(id) { this.toggleSubToolbar(id); }
  closeEditorPanel(id) { this.toggleSubToolbar(null); }
  toggleSecondaryToolbar() {
    const isVisible = document.getElementById('toolbar-secondary-row')?.style.display === 'flex';
    this.toggleSubToolbar(isVisible ? null : 'toolbar-secondary-row');
  }

  editorPanelCmd(cmd, val = null) {
    this.toggleSubToolbar(null);
    this.execEditorCommand(cmd, val);
  }

  editorPanelAction(action) {
    this.toggleSubToolbar(null);
    if (action === 'link') this.showLinkDialog();
  }

  toggleAlignment(e) {
    if (e) e.preventDefault();

    const cycle = ['left', 'center', 'right', 'justify'];
    let currentAlign = 'left';
    if (document.queryCommandState('justifyCenter')) currentAlign = 'center';
    else if (document.queryCommandState('justifyRight')) currentAlign = 'right';
    else if (document.queryCommandState('justifyFull')) currentAlign = 'justify';

    let nextIdx = (cycle.indexOf(currentAlign) + 1) % cycle.length;
    const nextAlign = cycle[nextIdx];

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let block = range.commonAncestorContainer;
    if (block.nodeType === 3) block = block.parentNode;

    const editor = document.getElementById('editor-note-text');

    // Buscar el bloque de nivel superior (P, H1-H6, BLOCKQUOTE, etc.)
    while (block && block.parentNode !== editor && block !== editor) {
      block = block.parentNode;
    }

    // Si el texto está suelto, envolver en P
    if (block === editor) {
      document.execCommand('formatBlock', false, 'p');
      const sel = window.getSelection();
      block = sel.getRangeAt(0).commonAncestorContainer;
      if (block.nodeType === 3) block = block.parentNode;
      while (block && block.parentNode !== editor && block !== editor) block = block.parentNode;
    }

    if (block && block !== editor) {
      // Limpiar alineaciones previas (tanto clases como estilos inline del navegador)
      block.style.textAlign = nextAlign === 'left' ? '' : nextAlign;

      // Eliminar posibles DIVs de alineación internos que el navegador haya creado
      // Esto es lo que causa el "descuadre" tras muchos clics
      const nestedDivs = block.querySelectorAll('div[style*="text-align"]');
      nestedDivs.forEach(div => {
        const parent = div.parentNode;
        while (div.firstChild) parent.insertBefore(div.firstChild, div);
        parent.removeChild(div);
      });
    } else {
      const cmdMap = { 'left': 'justifyLeft', 'center': 'justifyCenter', 'right': 'justifyRight', 'justify': 'justifyFull' };
      document.execCommand(cmdMap[nextAlign], false, null);
    }

    this._currentAlignment = nextAlign;
    this.updateToolbarState();
    editor.focus();
  }
  toggleVerseText() {
    const card = document.getElementById('verse-card-editor');
    const text = document.getElementById('verse-text-editor');
    const btn = document.getElementById('verse-toggle-btn');
    if (!text || !btn) return;

    text.classList.toggle('collapsed');
    btn.classList.toggle('rotated');

    // Si está colapsado, podemos darle un toque más minimalista al card
    if (text.classList.contains('collapsed')) {
      card.style.opacity = '0.9';
    } else {
      card.style.opacity = '1';
    }
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
    const btnCancel = document.querySelector('#confirm-modal .modal-btn.secondary');
    const extraEl = document.querySelector('#confirm-extra');
    const actionsEl = document.querySelector('#confirm-modal .modal-actions');

    titleEl.innerText = title;
    msgEl.innerText = msg;

    if (extraHtml && extraEl) {
      extraEl.innerHTML = extraHtml;
      extraEl.className = 'confirm-extra-panel active'; // Usar clase en vez de styles inline
      extraEl.style.display = 'block';
    } else if (extraEl) {
      extraEl.style.display = 'none';
      extraEl.className = 'confirm-extra-panel';
      extraEl.innerHTML = '';
    }

    if (okText === null) {
      if (btnOk) btnOk.style.display = 'none';
      // Si ocultamos el OK, tal vez queramos que el Cancelar diga "Cerrar" o se oculte si hay opciones
      if (btnCancel) btnCancel.innerText = "Cerrar";
    } else {
      if (btnOk) {
        btnOk.innerText = okText;
        btnOk.style.background = okColor;
        btnOk.style.display = 'block';
      }
      if (btnCancel) btnCancel.innerText = "Cancelar";
    }

    modal.classList.add('active');

    if (btnOk) {
      btnOk.onclick = () => {
        onConfirm();
        this.closeConfirmModal();
      };
    }
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
        
        <!-- SECCIÓN: LECTURA -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Lectura de texto a voz</h3>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="premium-card" onclick="window.app.openVoiceModal()" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${createIcon('user')}</div>
                <div style="display: flex; flex-direction: column; text-align:left;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Voz Seleccionada</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">${this.db.settings.tts_voice_name || 'Predeterminada'}</span>
                </div>
              </div>
              <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
            </div>

            <label class="premium-card" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; cursor: pointer; display: flex !important;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${createIcon('hash')}</div>
                <div style="display: flex; flex-direction: column; text-align:left;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Leer números de verso</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">Menciona "Verso X" en el audio</span>
                </div>
              </div>
              <div class="switch">
                <input type="checkbox" ${this.db.settings.skip_verse_numbers ? '' : 'checked'} onchange="window.app.toggleVerseNumbers(this.checked)">
                <span class="slider round"></span>
              </div>
            </label>
          </div>
        </div>

        <!-- SECCIÓN: APARIENCIA -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Apariencia</h3>
          
          <div style="margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              ${[
        { id: 'classic', name: 'Clásico', color: '#f4ece1' },
        { id: 'floral', name: 'Floral', color: '#fff5f7' },
        { id: 'pastel-blue', name: 'Pastel', color: '#ebf5ff' },
        { id: 'forest', name: 'Bosque', color: '#388e3c' },
        { id: 'gold', name: 'Oro', color: '#d4af37' },
        { id: 'ink', name: 'Tinta', color: '#ffffff' }
      ].map(t => `
                <div class="premium-card" onclick="window.app.applyTheme('${t.id}')" 
                     style="padding: 0.85rem; flex-direction: row; gap: 0.6rem; border: ${this.db.settings.theme_style === t.id ? '2px solid var(--accent)' : '1px solid var(--glass-border)'}; justify-content:flex-start;">
                  <div class="color-preview" style="background: ${t.color}; width:20px; height:20px; border-radius:6px;"></div>
                  <span style="font-size: 0.8rem; font-weight: 700;">${t.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <label class="premium-card" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; cursor: pointer; display: flex !important; margin-bottom:1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="color: var(--accent);">${createIcon('refresh-cw')}</div>
              <div style="display: flex; flex-direction: column; text-align: left;">
                <span style="font-size: 0.9rem; font-weight: 700;">Sincronizar sistema</span>
                <span style="font-size: 0.8rem; opacity: 0.6;">Sigue el modo de Android</span>
              </div>
            </div>
            <div class="switch">
              <input type="checkbox" ${this.db.settings.system_theme ? 'checked' : ''} onchange="window.app.toggleSystemTheme(this.checked)">
              <span class="slider round"></span>
            </div>
          </label>

          ${(!this.db.settings.system_theme && this.db.settings.theme_style !== 'ink') ? `
          <label class="premium-card" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; cursor: pointer; display: flex !important;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="color: var(--accent);">${createIcon(this.db.settings.theme_mode === 'dark' ? 'moon' : 'sun')}</div>
              <div style="display: flex; flex-direction: column; text-align: left;">
                <span style="font-size: 0.9rem; font-weight: 700;">Modo Oscuro</span>
                <span style="font-size: 0.8rem; opacity: 0.6;">Alternar claro/oscuro</span>
              </div>
            </div>
            <div class="switch">
              <input type="checkbox" ${this.db.settings.theme_mode === 'dark' ? 'checked' : ''} onchange="window.app.toggleMode()">
              <span class="slider round"></span>
            </div>
          </label>
          ` : ''}
        </div>

        <!-- SECCIÓN: ACTUALIZACIONES -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Actualizaciones</h3>
          <div class="premium-card" onclick="window.app.checkForUpdates()" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${createIcon('download-cloud')}</div>
                <div style="display: flex; flex-direction: column; text-align:left;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Buscar Actualizaciones</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">Versión actual: v${this.appVersion}</span>
                </div>
              </div>
              <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
          </div>
        </div>

        <!-- SECCIÓN: ACERCA DE -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Información</h3>
          <div class="premium-card" onclick="window.app.navigate('about')" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${createIcon('info')}</div>
                <div style="display: flex; flex-direction: column; text-align:left;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Acerca de la Aplicación</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">Créditos, Redes y Soporte</span>
                </div>
              </div>
              <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
          </div>
        </div>

        <!-- RESPALDO -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Respaldo de Datos</h3>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div class="premium-card" onclick="window.app.exportUserData()" style="padding: 1rem; flex-direction: column; gap:0.5rem;">
              <div style="color: var(--accent);">${createIcon('download')}</div>
              <span style="font-size: 0.8rem; font-weight: 700;">Exportar</span>
            </div>
            <div class="premium-card" onclick="window.app.importUserData()" style="padding: 1rem; flex-direction: column; gap:0.5rem;">
              <div style="color: var(--accent);">${createIcon('upload')}</div>
              <span style="font-size: 0.8rem; font-weight: 700;">Importar</span>
            </div>
          </div>
        </div>
      </div>
    `;
    this.render(html);
    this.updateFloatingNavState();
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
    const card = document.querySelector(`.fav-card[data-index="${index}"]`);

    if (this.selectedFavoriteIndex === index) {
      this.clearFavoriteSelection();
    } else {
      this.clearFavoriteSelection();
      this.selectedFavoriteIndex = index;
      if (card) card.classList.add('selected');

      const bar = document.querySelector('#fav-selection-bar');
      if (bar) {
        bar.style.display = 'flex';
        // Ocultar barra principal para que no estorbe
        const mainNav = document.getElementById('main-floating-nav');
        if (mainNav) mainNav.classList.add('hidden');

        // Actualizar icono de fijar según el estado actual
        const fav = this.db.favorites[index];
        const pinBtn = bar.querySelector('button[onclick*="togglePinFavorite"]');
        if (pinBtn) {
          pinBtn.innerHTML = fav && fav.pinned ? createIcon('pin-off') : createIcon('pin');
          this.refreshIcons();
        }
      }
    }
  }

  clearFavoriteSelection(skipNavRestore = false) {
    if (this.selectedFavoriteIndex !== null) {
      const oldCard = document.querySelector(`.fav-card[data-index="${this.selectedFavoriteIndex}"]`);
      if (oldCard) oldCard.classList.remove('selected');
    }
    this.selectedFavoriteIndex = null;
    const bar = document.querySelector('#fav-selection-bar');
    if (bar) {
      bar.style.display = 'none';
      // Restaurar barra principal si estamos en la vista de favoritos y no estamos navegando fuera
      if (!skipNavRestore && this.currentView === 'favorites') {
        const mainNav = document.getElementById('main-floating-nav');
        if (mainNav) mainNav.classList.remove('hidden');
      }
    }
  }

  navigateToSelectedFavorite() {
    if (this.selectedFavoriteIndex === null) return;
    const fav = this.db.favorites[this.selectedFavoriteIndex];
    if (fav) {
      this.clearFavoriteSelection(true); // Pasar true para evitar restaurar el nav principal
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



  toggleFavoritesSort() {
    this.favoritesSortOrder = this.favoritesSortOrder === 'asc' ? 'desc' : 'asc';
    this.renderFavorites();
  }

  renderFavorites() {
    this.currentView = 'favorites';
    this.selectedFavoriteIndex = null;

    // Create a mapped list with original indices to avoid selection bugs
    let favs = this.db.favorites.map((f, i) => ({ ...f, originalIndex: i }));

    favs.sort((a, b) => {
      // First sort by pinned status
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;

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
      <div class="view-container with-selection-bar animate-entrance">
        ${favs.length === 0 ? '<p style="text-align: center; opacity: 0.5;">No tienes favoritos aún.</p>' :
        favs.map((f) => `
              <div class="premium-card fav-card fav-card-item" 
                   data-index="${f.originalIndex}"
                   style="margin-bottom: 1.25rem; border-left: 4px solid ${f.pinned ? 'var(--accent)' : 'var(--glass-border)'}; align-items: flex-start; text-align: left;"
                   onclick="window.app.toggleFavoriteSelection(${f.originalIndex})"
                   ondblclick="window.pendingVerseScroll='${f.verse}'; window.app.renderReader('${f.book}', '${f.chapter}')">
                <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${f.pinned ? `<div style="color: var(--accent);">${createIcon('pin')}</div>` : ''}
                    <div style="color: var(--accent); font-size: 0.95rem; font-weight: 700; cursor: pointer; padding: 0.5rem 0;"
                         onclick="event.stopPropagation(); window.pendingVerseScroll='${f.verse}'; window.app.renderReader('${f.book}', '${f.chapter}')">
                      ${f.book} ${f.chapter}:${f.verse}
                    </div>
                  </div>
                </div>
                <div style="font-size: 1.05rem; line-height: 1.6; opacity: 0.9; text-align: left; width: 100%;">
                  ${f.text}
                </div>
              </div>
          `).join('')}
      </div>
      
      <!-- Specialized selection bar for favorites -->
      <div id="fav-selection-bar" class="floating-toolbar animate-entrance" style="display: none;">
          <button class="tool-btn" onclick="window.app.confirmDeleteFavoriteFromBar()" title="Eliminar Favorito" style="color: #ef4444;">
              ${createIcon('trash-2')}
          </button>
          <button class="tool-btn" onclick="window.app.togglePinFavorite()" title="Fijar/Desfijar">
              ${createIcon('pin')}
          </button>
          <button class="tool-btn" onclick="window.app.navigateToSelectedFavorite()" title="Ir al Versículo" style="color: var(--accent);">
              ${createIcon('external-link')}
          </button>
          <button class="tool-btn" onclick="window.app.clearFavoriteSelection()" title="Cerrar">
              ${createIcon('x')}
          </button>
      </div>
    `;
    this.render(html);
    this.refreshIcons();
  }

  togglePinFavorite(index) {
    const idx = index !== undefined ? index : this.selectedFavoriteIndex;
    if (idx === null) return;

    this.db.togglePinFavorite(idx);
    this.clearFavoriteSelection();
    this.renderFavorites();
    this.showToast("Estado de fijación actualizado");
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

    const colors = ['#fef3c7', '#dcfce7', '#dbeafe', '#fae8ff', '#fecaca', '#fed7aa', '#f9fafb'];

    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">Marcadores</h1>
        <button class="btn-icon" onclick="window.app.toggleHighlightsSort()" title="Ordenar">
          ${createIcon(this.highlightsSortOrder === 'asc' ? 'sort-asc' : 'sort-desc')}
        </button>
      </header>
      <div class="view-container with-selection-bar animate-entrance">
        <!-- Barra de filtros -->
        <div id="highlights-color-bar" style="display: flex; gap: 0.5rem; overflow-x: auto; padding: 0 0 1.5rem 0; margin-bottom: 0.5rem; scrollbar-width: none; scroll-behavior: smooth;">
          <button id="color-filter-all" onclick="window.app.applyHighlightFilter('all')" 
                  style="flex-shrink: 0; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid ${this.currentHighlightFilter === 'all' ? 'var(--accent)' : 'var(--glass-border)'}; 
                         background: ${this.currentHighlightFilter === 'all' ? 'var(--accent)' : 'var(--card-bg)'}; 
                         color: ${this.currentHighlightFilter === 'all' ? 'white' : 'var(--text-main)'}; font-size: 0.85rem; font-weight: 600;">
            Todos
          </button>
          ${colors.map((c, i) => `
            <button id="color-filter-${i}" onclick="window.app.applyHighlightFilter('${c}')" 
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

    // Scroll al color activo tras renderizar
    setTimeout(() => {
      let targetId = 'color-filter-all';
      if (this.currentHighlightFilter !== 'all') {
        const colorIndex = colors.indexOf(this.currentHighlightFilter);
        if (colorIndex !== -1) targetId = `color-filter-${colorIndex}`;
      }
      const targetBtn = document.getElementById(targetId);
      const container = document.getElementById('highlights-color-bar');
      if (targetBtn && container) {
        // Centrar elemento horizontalmente en el contenedor
        const scrollLeft = targetBtn.offsetLeft - (container.offsetWidth / 2) + (targetBtn.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }, 50);
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
      if (bar) {
        bar.style.display = 'flex';
        const mainNav = document.getElementById('main-floating-nav');
        if (mainNav) mainNav.classList.add('hidden');
      }
    }
  }

  clearHighlightSelection(skipNavRestore = false) {
    if (this.selectedHighlightIndex !== null) {
      const oldCard = document.querySelector(`.highlight-card[data-index="${this.selectedHighlightIndex}"]`);
      if (oldCard) oldCard.classList.remove('selected');
    }
    this.selectedHighlightIndex = null;
    const bar = document.querySelector('#highlight-selection-bar');
    if (bar) {
      bar.style.display = 'none';
      if (!skipNavRestore && this.currentView === 'highlights') {
        const mainNav = document.getElementById('main-floating-nav');
        if (mainNav) mainNav.classList.remove('hidden');
      }
    }
  }

  navigateToSelectedHighlight() {
    if (this.selectedHighlightIndex === null) return;
    const h = this.db.highlights[this.selectedHighlightIndex];
    if (h) {
      this.clearHighlightSelection(true); // Evitar restaurar la barra principal
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
      <div class="view-container with-main-nav animate-entrance">
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
                   style="text-align: left; align-items: center; justify-content: space-between; padding: 1.15rem; flex-direction: row; position: relative; cursor: pointer; gap: 1rem;">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; text-align: left; flex: 1; min-width: 0;">
                  <span style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; width: 100%;">
                    ${note.pinned ? `<span style="color: var(--accent); scale: 0.8; display: flex; flex-shrink: 0;">${createIcon('pin')}</span>` : ''}
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${note.title}</span>
                  </span>
                  <span style="font-size: 0.8rem; opacity: 0.5; font-weight: 600;">${new Date(note.dateCreated || note.date).toLocaleDateString()}</span>
                </div>
                <div style="color: var(--accent); opacity: 0.3; flex-shrink: 0; display: flex;">${createIcon('chevron-right')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.render(html);
    this.refreshIcons();
    this.updateFloatingNavState();
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
      <div class="view-container with-main-nav animate-entrance">
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
    this.updateFloatingNavState();
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
        <button class="btn-icon" onclick="window.app.navigate('settings')">${createIcon('chevron-left')}</button>
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

          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            <p style="opacity: 0.6; font-size: 0.85rem;">Dedicada a la congregación:</p>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;" onclick="window.app.handleEditorActivationClick()">
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
    this.updateFloatingNavState();
  }

  handleEditorActivationClick() {
    this.editorLogoClickCount++;
    if (this.editorLogoClickCount >= 5) {
      this.editorLogoClickCount = 0;
      this.db.settings.editor_mode_enabled = !this.db.settings.editor_mode_enabled;
      this.db.saveSettings();
      
      if (this.db.settings.editor_mode_enabled) {
        this.showToast("Se activaron las opciones del editor");
      } else {
        this.showToast("Opciones del editor desactivadas");
      }
    }
  }

  async renderEditorAdmin() {
    this.currentView = 'editor-admin';
    this.updateFloatingNavState();

    // Mostrar aviso de seguridad si es la primera vez
    if (!this.db.settings.editor_warning_shown) {
      const confirmed = await this.showEditorSecurityWarning();
      if (!confirmed) {
        this.navigate('crecimiento');
        return;
      }
      this.db.settings.editor_warning_shown = true;
      this.db.saveSettings();
    }

    const html = `
      <header>
        <button id="editor-header-back" class="btn-icon" onclick="window.app.navigate('crecimiento')">${createIcon('arrow-left')}</button>
        <h1 id="editor-header-title">Panel Editor</h1>
        <div id="editor-header-actions" style="margin-left:auto; display:flex; gap:0.5rem;">
          <button id="editor-btn-logout" class="btn-icon" style="display:none; color: #ef4444;">${createIcon('log-out')}</button>
        </div>
      </header>

      <div class="view-container animate-entrance" style="padding-bottom: 110px;">
        <div id="editor-status-msg" class="status-msg"></div>

        <!-- Capa de Autenticación -->
        <div id="editor-auth-container" style="display: none; padding: 2rem 0;">
          <div class="premium-container" style="text-align: center; flex-direction: column; padding: 2rem; border-radius: 28px; margin: 0 auto; max-width: 450px;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:64px; height:64px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center;">${createIcon('lock')}</div>
            <h2 style="margin-bottom: 0.5rem;">Acceso Restringido</h2>
            <p style="opacity: 0.6; margin-bottom: 2rem; font-size: 0.9rem;">Ingresa tus credenciales de administrador para continuar.</p>
            
            <form id="editor-login-form" style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
              <div class="form-group" style="text-align: left;">
                <label style="font-size: 0.8rem; font-weight: 700; opacity: 0.6; margin-bottom: 0.5rem; display: block; margin-left: 0.5rem;">EMAIL</label>
                <input type="email" id="editor-login-email" placeholder="admin@ejemplo.com" required 
                       style="width: 100%; padding: 1rem; border-radius: 16px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
              </div>
              <div class="form-group" style="text-align: left;">
                <label style="font-size: 0.8rem; font-weight: 700; opacity: 0.6; margin-bottom: 0.5rem; display: block; margin-left: 0.5rem;">CONTRASEÑA</label>
                <div style="position: relative; width: 100%;">
                  <input type="password" id="editor-login-password" placeholder="••••••••" required autocomplete="current-password"
                         style="width: 100%; padding: 1rem; padding-right: 3.5rem; border-radius: 16px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
                  <button type="button" id="toggle-editor-password" class="btn-icon" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); opacity: 0.5;">
                    ${createIcon('eye')}
                  </button>
                </div>
              </div>
              <button type="submit" class="btn-primary" style="margin-top: 1.5rem; padding: 1.1rem; border-radius: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: none; background: var(--accent); color: #fff; box-shadow: 0 8px 20px var(--accent-soft); width: 100%; cursor: pointer; transition: all 0.3s ease;">
                Entrar al Panel
              </button>
              <p id="editor-login-error" style="color: #ef4444; margin-top: 1rem; display: none; font-size: 0.85rem; font-weight: 600;"></p>
            </form>
          </div>
        </div>

        <!-- Capa de Aplicación -->
        <div id="editor-app-container" style="display: none;">
          
          <!-- Vista de Listado -->
          <div id="editor-view-list" class="animate-entrance">
            <div class="editor-action-bar">
              <div class="editor-search-wrapper">
                <input type="text" id="editor-search-input" class="editor-search-input" placeholder="Escribe para buscar..." oninput="window.app.handleEditorSearch(this.value)" value="${this.editorSearchQuery || ''}">
              </div>
              <button class="editor-header-btn ${this.editorSortOrder === 'asc' ? 'active' : ''}" onclick="window.app.toggleEditorSort()" title="Ordenar por fecha">
                ${createIcon('arrow-down-up', 20)}
              </button>
              <button class="editor-header-btn" style="background: var(--accent); color: white; border-color: var(--accent);" onclick="window.app.switchEditorSubTab('form')" title="Crear nuevo">
                ${createIcon('plus', 24)}
              </button>
            </div>
            
            <div id="editor-list-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <!-- Items inyectados aquí -->
            </div>
          </div>

          <!-- Vista de Formulario -->
          <div id="editor-view-form" style="display: none;" class="animate-entrance">
            <div class="premium-container" style="padding: 1.5rem; flex-direction: column; border-radius: 20px;">
              <form id="editor-entry-form" style="width: 100%; display: flex; flex-direction: column; gap: 1.25rem;">
                <input type="hidden" id="editor-input-tipo" value="${this.editorCurrentTab || 'devocional'}">
                <input type="hidden" id="editor-input-id" value="">
                <input type="hidden" id="editor-input-filename" value="">

                <div class="form-group">
                  <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">TÍTULO</label>
                  <input type="text" id="editor-input-titulo" placeholder="Ej: Dios es Amor" required 
                         style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
                </div>

                <div id="editor-group-versiculo" class="form-group" style="display: ${this.editorCurrentTab === 'devocional' ? 'block' : 'none'};">
                  <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">REFERENCIA BÍBLICA</label>
                  <textarea id="editor-input-versiculo" rows="2" placeholder="Ej: Mateo 5:1-12" 
                            style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main); font-family: inherit; resize: vertical;"></textarea>
                </div>

                <div class="form-group">
                  <label id="editor-label-texto" style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">CONTENIDO</label>
                  <div id="editor-quill-container" style="height: 300px; border-radius: 12px;"></div>
                </div>

                <div id="editor-group-oracion" class="form-group" style="display: ${this.editorCurrentTab === 'devocional' ? 'block' : 'none'};">
                  <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">ORACIÓN FINAL</label>
                  <textarea id="editor-input-oracion" rows="3" placeholder="Escribe la oración..." 
                            style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main); font-family: inherit; resize: none;"></textarea>
                </div>

                <div id="editor-group-autor" class="form-group" style="display: ${this.editorCurrentTab === 'devocional' ? 'block' : 'none'};">
                  <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">AUTOR</label>
                  <input type="text" id="editor-input-autor" placeholder="Nombre del autor" 
                         style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
                </div>
                <button type="submit" style="display:none;"></button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Nav (Fuera de view-container para estar siempre fija) -->
      <nav id="editor-bottom-nav" class="editor-floating-nav" style="display: none;">
        <button onclick="window.app.switchEditorMainTab('devocional')" class="editor-nav-item ${this.editorCurrentTab === 'devocional' ? 'active' : ''}" id="editor-nav-devocional">
          ${createIcon('book-open')}
          <span class="editor-nav-label">Devocional</span>
        </button>
        <button onclick="window.app.switchEditorMainTab('pregunta')" class="editor-nav-item ${this.editorCurrentTab === 'pregunta' ? 'active' : ''}" id="editor-nav-pregunta">
          ${createIcon('help-circle')}
          <span class="editor-nav-label">Preguntas</span>
        </button>
      </nav>

        <!-- Modales -->
        <div id="editor-config-modal" class="modal-overlay" style="display: none; align-items: center; justify-content: center;">
          <form id="editor-config-form" class="premium-container" style="width: 90%; max-width: 400px; flex-direction: column; padding: 2rem; border-radius: 28px;">
            <h3 style="color: var(--accent); margin-bottom: 1rem;">Configuración GitHub</h3>
            <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 1.5rem;">Configura el acceso al repositorio de datos para poder publicar.</p>
            <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
              <input type="password" id="editor-input-gh-token" placeholder="GitHub PAT (token)" autocomplete="new-password"
                     style="width: 100%; padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
              <input type="text" id="editor-input-gh-repo" placeholder="usuario/repo" 
                     style="width: 100%; padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
              <button type="submit" id="editor-btn-save-config" class="btn-primary" style="margin-top: 1rem; padding: 1rem; border-radius: 14px; font-weight: 800; text-transform: uppercase;">Guardar Configuración</button>
            </div>
          </form>
        </div>

        <div id="editor-url-modal" class="modal-overlay" style="display: none; align-items: center; justify-content: center; z-index: 1100;">
          <div class="premium-card" style="width: 85%; max-width: 350px; flex-direction: column; padding: 1.5rem; border-radius: 24px;">
            <h3 style="color: var(--accent); margin-bottom: 1rem;">Insertar Enlace</h3>
            <div style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
              <input type="url" id="editor-input-link-url" placeholder="https://ejemplo.com" required 
                     style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
              <div style="display: flex; gap: 0.75rem;">
                <button onclick="window.app.closeEditorUrlModal()" class="btn-primary secondary" style="flex: 1; padding: 0.85rem; border-radius: 14px; font-weight: 700; background: var(--bg-secondary); border: 1px solid var(--glass-border); color: var(--text-main);">Cancelar</button>
                <button onclick="window.app.confirmEditorLinkInsertion()" class="btn-primary" style="flex: 1; padding: 0.85rem; border-radius: 14px; font-weight: 800;">Insertar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.render(html);
    await this.initEditorPanel();
  }

  showEditorSecurityWarning() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.setAttribute('style', 'display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1.5rem;');
      modal.innerHTML = `
        <div class="animate-entrance" style="width: 100%; max-width: 400px; background: var(--bg-color); border: 1px solid var(--glass-border); flex-direction: column; padding: 2rem 1.5rem; border-radius: 28px; text-align: center; box-shadow: var(--shadow); position: relative; overflow: hidden; display: flex;">
          <div class="icon-wrapper" style="background: #fef2f2; color: #ef4444; width: 60px; height: 60px; margin: 0 auto 1.25rem; border-radius: 18px; display: flex; align-items: center; justify-content: center;">${createIcon('shield-alert', 32)}</div>
          <h2 style="font-size: 1.35rem; margin-bottom: 0.75rem; color: var(--text-main); font-family: 'Playfair Display', serif;">Aviso de Seguridad</h2>
          <p style="opacity: 0.8; line-height: 1.5; margin-bottom: 1.5rem; font-size: 0.95rem;">
            Este apartado es exclusivo para editores autorizados. Requiere credenciales de acceso especiales.
            <br><br>
            <b>¿Tienes las credenciales necesarias?</b> Si no las tienes, el acceso no tendrá sentido.
          </p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
            <button id="warning-btn-yes" class="btn-primary" style="padding: 1rem; border-radius: 14px; font-weight: 700;">Tengo credenciales, continuar</button>
            <button id="warning-btn-no" class="btn-primary secondary" style="padding: 1rem; border-radius: 14px; font-weight: 700; background: var(--bg-secondary); border: 1px solid var(--glass-border); color: var(--text-main);">Volver atrás</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      this.refreshIcons();

      const btnYes = modal.querySelector('#warning-btn-yes');
      const btnNo = modal.querySelector('#warning-btn-no');

      btnYes.onclick = (e) => {
        e.stopPropagation();
        modal.remove();
        resolve(true);
      };
      btnNo.onclick = (e) => {
        e.stopPropagation();
        modal.remove();
        resolve(false);
      };
    });
  }

  async initEditorPanel() {
    // Cargar librerías necesarias dinámicamente si no están
    await this.loadEditorLibraries();
    
    // Configuración de Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyBc8KBYmk7bt9s-9IpAbpZ2I3OdD_oYJWs",
      authDomain: "dataconnect-kohl.firebaseapp.com",
      projectId: "dataconnect-kohl",
      storageBucket: "dataconnect-kohl.firebasestorage.app",
      messagingSenderId: "933989214288",
      appId: "1:933989214288:web:e062be2463e238a3028955",
      measurementId: "G-SM4YCPEGKZ"
    };

    if (!window.firebase_admin_initialized) {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      this.editorAuth = firebase.auth();
      this.editorDb = firebase.firestore();
      window.firebase_admin_initialized = true;
    } else {
      this.editorAuth = firebase.auth();
      this.editorDb = firebase.firestore();
    }

    // Registrar iconos para Quill
    const icons = Quill.import('ui/icons');
    icons['undo'] = createIcon('undo-2');
    icons['redo'] = createIcon('redo-2');

    // Inicializar Quill
    this.editorQuill = new Quill('#editor-quill-container', {
      theme: 'snow',
      placeholder: 'Escribe el contenido aquí...',
      modules: {
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, false] }, 'bold', 'italic', 'underline', 'blockquote', { 'list': 'ordered' }, { 'list': 'bullet' }, 'clean', 'undo', 'redo']
          ],
          handlers: {
            'undo': () => { this.editorQuill.history.undo(); },
            'redo': () => { this.editorQuill.history.redo(); },
            'blockquote': function(value) {
              this.quill.format('blockquote', value);
            }
          }
        },
        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true
        },
        keyboard: {
          bindings: {
            'blockquote-backspace': {
              key: 'Backspace',
              format: ['blockquote'],
              handler: function(range, context) {
                if (context.offset === 0 && this.quill.getText(range.index, range.length).length === 0) {
                  this.quill.format('blockquote', false);
                  return false;
                }
                return true;
              }
            }
          }
        }
      }
    });

    setTimeout(() => this.refreshIcons(), 100);

    // Github config local
    this.githubConfig = { token: null, repo: null };

    // Setup events
    this.setupEditorEvents();

    // Monitorizar estado de autenticación
    this.editorAuth.onAuthStateChanged(async (user) => {
      const authContainer = document.getElementById('editor-auth-container');
      const appContainer = document.getElementById('editor-app-container');
      const logoutBtn = document.getElementById('editor-btn-logout');

      if (user) {
        if (authContainer) authContainer.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'flex';
        const bottomNav = document.getElementById('editor-bottom-nav');
        if (bottomNav) bottomNav.style.display = 'flex';
        await this.loadEditorGHConfig();
        this.switchEditorMainTab(this.editorCurrentTab || 'devocional');
      } else {
        if (authContainer) authContainer.style.display = 'block';
        if (appContainer) appContainer.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        const bottomNav = document.getElementById('editor-bottom-nav');
        if (bottomNav) bottomNav.style.display = 'none';
        document.getElementById('editor-config-modal').style.display = 'none';
      }
    });
  }

  async loadEditorLibraries() {
    const scripts = [
      'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
      'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
      'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
      'https://cdn.quilljs.com/1.3.6/quill.min.js'
    ];
    const styles = [
      'https://cdn.quilljs.com/1.3.6/quill.snow.css'
    ];

    for (const href of styles) {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    }

    const loadScript = (src) => new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      document.head.appendChild(script);
    });

    for (const src of scripts) {
      await loadScript(src);
    }
  }

  setupEditorEvents() {
    const loginForm = document.getElementById('editor-login-form');
    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('editor-login-email').value;
        const pass = document.getElementById('editor-login-password').value;
        this.editorAuth.signInWithEmailAndPassword(email, pass).catch(error => {
          const errEl = document.getElementById('editor-login-error');
          errEl.textContent = "Error: " + error.message;
          errEl.style.display = 'block';
        });
      };

      const passwordToggle = document.getElementById('toggle-editor-password');
      if (passwordToggle) {
        passwordToggle.onclick = () => {
          const passInput = document.getElementById('editor-login-password');
          const type = passInput.type === 'password' ? 'text' : 'password';
          passInput.type = type;
          passwordToggle.innerHTML = createIcon(type === 'password' ? 'eye' : 'eye-off');
          this.refreshIcons();
        };
      }
    }

    const logoutBtn = document.getElementById('editor-btn-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => this.editorAuth.signOut();
    }

    const entryForm = document.getElementById('editor-entry-form');
    if (entryForm) {
      entryForm.onsubmit = (e) => this.handleEditorEntrySubmit(e);
    }

    const configForm = document.getElementById('editor-config-form');
    if (configForm) {
      configForm.onsubmit = (e) => {
        e.preventDefault();
        this.saveEditorGHConfig();
      };
    }
    // Eventos ya manejados por la navegación de cabecera dinámica
  }

  closeEditorUrlModal() {
    document.getElementById('editor-url-modal').style.display = 'none';
    document.getElementById('editor-url-modal').classList.remove('active');
  }

  confirmEditorLinkInsertion() {
    const url = document.getElementById('editor-input-link-url').value.trim();
    if (url && this.editorLastRange) {
      this.editorQuill.formatText(this.editorLastRange.index, this.editorLastRange.length, 'link', url);
      this.closeEditorUrlModal();
    }
  }

  async loadEditorGHConfig() {
    try {
      const doc = await this.editorDb.collection('config').doc('github').get();
      if (doc.exists) {
        const data = doc.data();
        this.githubConfig.token = data.pat || data.token;
        this.githubConfig.repo = data.repo;
      } else {
        document.getElementById('editor-config-modal').style.display = 'flex';
      }
    } catch (e) {
      this.showEditorStatus('Error cargando config GH: ' + e.message, 'error');
    }
  }

  async saveEditorGHConfig() {
    const token = document.getElementById('editor-input-gh-token').value.trim();
    const repo = document.getElementById('editor-input-gh-repo').value.trim();
    if (!token || !repo) return alert("Completa ambos campos");
    try {
      await this.editorDb.collection('config').doc('github').set({ pat: token, repo });
      this.githubConfig.token = token;
      this.githubConfig.repo = repo;
      document.getElementById('editor-config-modal').style.display = 'none';
      this.showEditorStatus('Configuración guardada', 'success');
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  switchEditorMainTab(tipo) {
    this.editorCurrentTab = tipo;
    
    // Actualizar Items del Bottom Nav
    document.querySelectorAll('.editor-nav-item').forEach(b => {
      b.classList.toggle('active', b.id === `editor-nav-${tipo}`);
    });

    const isDevocional = (tipo === 'devocional');
    document.getElementById('editor-input-tipo').value = tipo;
    
    // Actualizar etiquetas de formulario
    document.getElementById('editor-group-versiculo').style.display = isDevocional ? 'block' : 'none';
    document.getElementById('editor-group-oracion').style.display = isDevocional ? 'block' : 'none';
    document.getElementById('editor-group-autor').style.display = isDevocional ? 'block' : 'none';
    const contentLabel = document.getElementById('editor-label-texto');
    if (contentLabel) contentLabel.innerText = isDevocional ? 'CONTENIDO DEL DEVOCIONAL' : 'RESPUESTA BÍBLICA';
    
    // Forzar siempre a Panel Editor como título principal
    const headerTitle = document.getElementById('editor-header-title');
    if (headerTitle) headerTitle.innerText = 'Panel Editor';

    this.resetEditorForm();
    this.switchEditorSubTab('list'); // Siempre volvemos a la lista al cambiar de pestaña principal
  }

  switchEditorSubTab(view) {
    const listEl = document.getElementById('editor-view-list');
    const formEl = document.getElementById('editor-view-form');
    const actionsEl = document.getElementById('editor-header-actions');
    const backBtn = document.getElementById('editor-header-back');
    const bottomNav = document.getElementById('editor-bottom-nav');
    
    if (view === 'list') {
      if (listEl) listEl.style.display = 'block';
      if (formEl) formEl.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'flex';
      if (backBtn) backBtn.onclick = () => window.app.navigate('crecimiento');
      
      // Restaurar Botón Logout en lista
      if (actionsEl) {
        actionsEl.innerHTML = `
          <button id="editor-btn-logout" class="btn-icon" style="color: #ef4444;" onclick="window.app.editorAuth.signOut()">${createIcon('log-out')}</button>
        `;
      }
      this.loadEditorEntryList();
    } else {
      if (listEl) listEl.style.display = 'none';
      if (formEl) formEl.style.display = 'block';
      if (bottomNav) bottomNav.style.display = 'none';
      if (backBtn) backBtn.onclick = () => window.app.confirmEditorCancel();
      
      // Mostrar Dropdown de acciones en formulario
      if (actionsEl) {
        actionsEl.innerHTML = `
          <div class="toolbar-dropdown">
            <button class="btn-icon dropdown-trigger" onclick="event.stopPropagation(); this.parentElement.classList.toggle('active')" title="Acciones">
              ${createIcon('more-vertical')}
            </button>
            <div class="dropdown-content right" style="min-width:180px;">
              <button onclick="window.app.confirmEditorPublish()" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.75rem 1rem;text-align:left;background:none;border:none;color:var(--accent);font-size:0.95rem;font-weight:700;">
                ${createIcon('check')} Publicar Ahora
              </button>
              <button onclick="window.app.confirmEditorCancel()" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.75rem 1rem;text-align:left;background:none;border:none;color:#ef4444;font-size:0.95rem;font-weight:600;">
                ${createIcon('x')} Cancelar Cambios
              </button>
            </div>
          </div>
        `;
      }
    }
    this.refreshIcons();
  }

  async confirmEditorPublish() {
    const titulo = document.getElementById('editor-input-titulo').value.trim();
    if (!titulo) return this.showToast("El título es obligatorio", "error");
    
    this.showConfirmDialog({
      title: "Publicar Contenido",
      text: "¿Estás seguro de que deseas publicar este contenido en el repositorio?",
      icon: "upload-cloud",
      confirmText: "Sí, publicar",
      onConfirm: () => {
        const form = document.getElementById('editor-entry-form');
        if (form) {
          const event = new Event('submit', { cancelable: true });
          form.dispatchEvent(event);
        }
      }
    });
  }

  confirmEditorCancel() {
    this.showConfirmDialog({
      title: "Cancelar Cambios",
      text: "¿Deseas salir del editor? Se perderán los cambios que no hayas publicado.",
      icon: "alert-circle",
      confirmText: "Sí, salir",
      confirmClass: "danger",
      onConfirm: () => {
        this.resetEditorForm();
        this.switchEditorSubTab('list');
      }
    });
  }

  showConfirmDialog({ title, text, icon = 'help-circle', confirmText = 'Aceptar', confirmClass = '', onConfirm }) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.style.zIndex = '3500';
    modal.innerHTML = `
      <div class="animate-entrance" style="width: 90%; max-width: 380px; background: var(--bg-color); border: 1px solid var(--glass-border); flex-direction: column; padding: 2.25rem 1.75rem; border-radius: 28px; text-align: center; box-shadow: var(--shadow-lg); display: flex; position: relative; overflow: hidden;">
        <div class="icon-wrapper" style="background: var(--accent-soft); color: var(--accent); width: 64px; height: 64px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; border-radius: 20px;">${createIcon(icon, 32)}</div>
        <h2 style="font-size: 1.35rem; margin-bottom: 0.75rem; color: var(--text-main); font-family: 'Playfair Display', serif;">${title}</h2>
        <p style="opacity: 0.8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; color: var(--text-main);">${text}</p>
        <div style="display: flex; gap: 0.85rem; width: 100%;">
          <button id="confirm-modal-cancel" class="btn-primary secondary" style="flex: 1; padding: 1rem; border-radius: 16px; font-weight: 700; background: var(--bg-secondary); border: 1px solid var(--glass-border); color: var(--text-main);">Volver</button>
          <button id="confirm-modal-ok" class="btn-primary ${confirmClass}" style="flex: 1; padding: 1rem; border-radius: 16px; font-weight: 800; ${confirmClass === 'danger' ? 'background:#ef4444; color:white; border:none;' : ''}">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.refreshIcons();

    modal.querySelector('#confirm-modal-cancel').onclick = (e) => {
      e.stopPropagation();
      modal.remove();
    };
    modal.querySelector('#confirm-modal-ok').onclick = (e) => {
      e.stopPropagation();
      modal.remove();
      if (onConfirm) onConfirm();
    };
    
    // Evitar que clics en el contenido del diálogo cierren el modal si hubiera un listener en el overlay
    modal.firstElementChild.onclick = (e) => e.stopPropagation();
  }

  handleEditorSearch(query) {
    this.editorSearchQuery = query.toLowerCase();
    this.loadEditorEntryList();
  }

  toggleEditorSort() {
    this.editorSortOrder = this.editorSortOrder === 'asc' ? 'desc' : 'asc';
    
    const btn = document.querySelector('.editor-header-btn[onclick*="toggleEditorSort"]');
    if (btn) btn.classList.toggle('active', this.editorSortOrder === 'asc');
    
    this.loadEditorEntryList();
  }

  async loadEditorEntryList() {
    if (!this.githubConfig.repo || !this.githubConfig.token) return;
    const container = document.getElementById('editor-list-container');
    const tipo = document.getElementById('editor-input-tipo').value;
    // Unificar a minúsculas y plural para evitar 404
    const indexFile = tipo === 'devocional' ? 'devocional-index.json' : 'preguntas-index.json';

    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="spinner"></div></div>';

    try {
      const url = `https://api.github.com/repos/${this.githubConfig.repo}/contents/biblia-cristiana-rv1960-app/${indexFile}?ts=${Date.now()}`;
      const resp = await fetch(url, { headers: { 'Authorization': `token ${this.githubConfig.token}` } });
      
      if (resp.status === 404) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.5; padding: 2rem;">No hay registros aún.</p>';
        return;
      }

      const data = await resp.json();
      const content = decodeURIComponent(escape(atob(data.content)));
      let list = JSON.parse(content);

      // Aplicar Filtro de Búsqueda
      if (this.editorSearchQuery) {
        list = list.filter(item => 
          item.titulo.toLowerCase().includes(this.editorSearchQuery)
        );
      }

      // Aplicar Orden
      if (this.editorSortOrder === 'asc') {
        list.sort((a, b) => a.id - b.id);
      } else {
        list.sort((a, b) => b.id - a.id);
      }

      if (list.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.5; padding: 2rem;">No se encontraron resultados.</p>';
        return;
      }

      container.innerHTML = list.map(item => `
        <div class="editor-entry-item animate-entrance">
          <div class="entry-info">
            <span class="entry-title">${item.titulo}</span>
            <div class="entry-meta">
              ${createIcon('calendar', 12)}
              <span>${item.fecha}</span>
            </div>
          </div>
          <div class="entry-actions">
            <button class="action-btn edit" onclick='event.stopPropagation(); window.app.prepareEditorEdit(${JSON.stringify(item).replace(/'/g, "&quot;")})'>
              ${createIcon('edit-2', 18)}
            </button>
            <button class="action-btn delete" onclick="event.stopPropagation(); window.app.deleteEditorEntry('${item.file}', ${item.id}, '${indexFile}')">
              ${createIcon('trash-2', 18)}
            </button>
          </div>
        </div>
      `).join('');
      this.refreshIcons();
    } catch (e) {
      container.innerHTML = `<p style="color:#ef4444; padding: 2rem; text-align: center;">Error: ${e.message}</p>`;
    }
  }

  async prepareEditorEdit(item) {
    this.switchEditorSubTab('form');
    this.showEditorStatus('Cargando datos...', 'normal');
    
    document.getElementById('editor-input-id').value = item.id;
    document.getElementById('editor-input-filename').value = item.file;
    const tipo = document.getElementById('editor-input-tipo').value;

    try {
      const url = `https://api.github.com/repos/${this.githubConfig.repo}/contents/${item.file}?ts=${Date.now()}`;
      const resp = await fetch(url, { headers: { 'Authorization': `token ${this.githubConfig.token}` } });
      const fileData = await resp.json();
      const data = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
      this.editorOriginalDate = data.fecha_hora || data.fecha;

      document.getElementById('editor-input-titulo').value = data.titulo || '';
      this.editorQuill.root.innerHTML = data.devocional || data.respuesta || data.contenido || '';
      
      if (tipo === 'devocional') {
        if (document.getElementById('editor-input-versiculo')) document.getElementById('editor-input-versiculo').value = data.versiculo || '';
        if (document.getElementById('editor-input-oracion')) document.getElementById('editor-input-oracion').value = data.oracion || '';
        if (document.getElementById('editor-input-autor')) document.getElementById('editor-input-autor').value = data.autor || '';
      }
      
      this.showEditorStatus('', 'normal'); // Limpiar cargando
    } catch (e) {
      this.showEditorStatus('Error: ' + e.message, 'error');
    }
  }

  async handleEditorEntrySubmit(e) {
    e.preventDefault();
    if (!this.githubConfig.token || !this.githubConfig.repo) return alert("Configura GitHub.");

    this.showEditorStatus('Procesando...', 'normal');
    // Deshabilitar botón en el dropdown
    const dropdownBtn = document.querySelector('button[onclick*="confirmEditorPublish"]');
    if (dropdownBtn) dropdownBtn.disabled = true;

    const tipo = document.getElementById('editor-input-tipo').value;
    const updateId = document.getElementById('editor-input-id').value;
    const existingFilename = document.getElementById('editor-input-filename').value;
    const titulo = document.getElementById('editor-input-titulo').value.trim();

    try {
      const fecha = (updateId && this.editorOriginalDate) ? this.editorOriginalDate : new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      let entryData = { titulo, fecha_hora: fecha };
      let folder = tipo === 'devocional' ? 'devocionales' : 'preguntas';
      const indexFile = tipo === 'devocional' ? 'devocional-index.json' : 'preguntas-index.json';

      if (tipo === 'devocional') {
        entryData.versiculo = document.getElementById('editor-input-versiculo').value.trim();
        entryData.devocional = this.editorQuill.root.innerHTML;
        entryData.oracion = document.getElementById('editor-input-oracion').value.trim();
        entryData.autor = document.getElementById('editor-input-autor').value.trim();
      } else {
        entryData.respuesta = this.editorQuill.root.innerHTML;
      }

      const jsonStr = JSON.stringify(entryData, null, 2);
      let filename = existingFilename;
      if (!updateId) {
        const dateStr = new Date().toISOString().split('T')[0];
        filename = `biblia-cristiana-rv1960-app/${folder}/${tipo}-${dateStr}-${Date.now()}.json`;
      }

      await this.uploadToGithubAdmin(filename, jsonStr, `Publicación ${tipo}: ${titulo}`, !!updateId);

      if (tipo === 'devocional') {
        await this.uploadToGithubAdmin('biblia-cristiana-rv1960-app/devocional-last.json', jsonStr, `Last devocional: ${titulo}`, true);
      }
      
      await this.updateEditorIndexAdmin(titulo, fecha, filename, updateId, indexFile);

      this.showEditorStatus('¡Publicado con éxito!', 'success');
      this.resetEditorForm();
      setTimeout(() => this.switchEditorSubTab('list'), 1500);

    } catch (err) {
      this.showEditorStatus('Error: ' + err.message, 'error');
    } finally {
      const dropdownBtn = document.querySelector('button[onclick*="confirmEditorPublish"]');
      if (dropdownBtn) dropdownBtn.disabled = false;
    }
  }

  async uploadToGithubAdmin(path, content, message, isUpdate) {
    const url = `https://api.github.com/repos/${this.githubConfig.repo}/contents/${path}`;
    let sha = null;
    if (isUpdate) {
      const res = await fetch(url, { headers: { 'Authorization': `token ${this.githubConfig.token}` } });
      if (res.ok) {
        const d = await res.json();
        sha = d.sha;
      }
    }
    const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch: 'main' };
    if (sha) body.sha = sha;
    const finalRes = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${this.githubConfig.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!finalRes.ok) throw new Error(`GH Error: ${finalRes.status}`);
  }

  async updateEditorIndexAdmin(titulo, fecha, filename, updateId, indexFileRel) {
    const indexPath = `biblia-cristiana-rv1960-app/${indexFileRel}`;
    const url = `https://api.github.com/repos/${this.githubConfig.repo}/contents/${indexPath}`;
    let list = [];
    let sha = null;
    try {
      const resp = await fetch(url, { headers: { 'Authorization': `token ${this.githubConfig.token}` } });
      if (resp.ok) {
        const d = await resp.json();
        sha = d.sha;
        list = JSON.parse(decodeURIComponent(escape(atob(d.content))));
      }
    } catch (e) {}

    const newItem = { titulo, fecha, file: filename, id: updateId ? parseInt(updateId) : Date.now() };
    if (updateId) {
      const idx = list.findIndex(i => i.id == updateId);
      if (idx >= 0) list[idx] = newItem; else list.push(newItem);
    } else {
      list.push(newItem);
    }
    await this.uploadToGithubAdmin(indexPath, JSON.stringify(list, null, 2), "Update index", true);
  }

  async deleteEditorEntry(filename, id, indexFile) {
    this.showConfirmDialog({
      title: "Eliminar Contenido",
      text: "¿Deseas eliminar este registro permanentemente? No se puede deshacer.",
      icon: "trash-2",
      confirmText: "Sí, eliminar",
      confirmClass: "danger",
      onConfirm: async () => {
        this.showEditorStatus('Eliminando...', 'normal');
        try {
          // Borrar archivo
          const url = `https://api.github.com/repos/${this.githubConfig.repo}/contents/${filename}`;
          const resp = await fetch(url, { headers: { 'Authorization': `token ${this.githubConfig.token}` } });
          if (resp.ok) {
            const d = await resp.json();
            await fetch(url, {
              method: 'DELETE',
              headers: { 'Authorization': `token ${this.githubConfig.token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: "Delete entry", sha: d.sha, branch: 'main' })
            });
          }
          
          // Actualizar índice
          const indexUrl = `https://api.github.com/repos/${this.githubConfig.repo}/contents/biblia-cristiana-rv1960-app/${indexFile}`;
          const iResp = await fetch(indexUrl, { headers: { 'Authorization': `token ${this.githubConfig.token}` } });
          if (iResp.ok) {
            const iData = await iResp.json();
            let list = JSON.parse(decodeURIComponent(escape(atob(iData.content))));
            list = list.filter(i => i.id != id);
            await this.uploadToGithubAdmin(`biblia-cristiana-rv1960-app/${indexFile}`, JSON.stringify(list, null, 2), "Remove from index", true);

            // Sincronizar último devocional si corresponde
            if (indexFile === 'devocional-index.json') {
              if (list.length > 0) {
                // Obtener el nuevo último (asumimos que el índice está ordenado por fecha desc or ID desc)
                // Realmente el índice suele estar ordenado por ID desc o fecha desc.
                // Tomamos el primero de la lista actualizada.
                const newLatest = list[0];
                const latestUrl = `https://api.github.com/repos/${this.githubConfig.repo}/contents/${newLatest.file}?ts=${Date.now()}`;
                const lResp = await fetch(latestUrl, { headers: { 'Authorization': `token ${this.githubConfig.token}` } });
                if (lResp.ok) {
                  const lData = await lResp.json();
                  const content = atob(lData.content); // No necesitamos decodeURIComponent aquí si es solo para re-subir
                  await this.uploadToGithubAdmin('biblia-cristiana-rv1960-app/devocional-last.json', decodeURIComponent(escape(content)), `Sync devocional-last after delete`, true);
                }
              }
            }
          }
          
          this.showEditorStatus('Eliminado con éxito', 'success');
          this.loadEditorEntryList();
        } catch (e) {
          this.showToast("Error al eliminar: " + e.message, "error");
        }
      }
    });
  }

  resetEditorForm() {
    const f = document.getElementById('editor-entry-form');
    if (f) f.reset();
    if (this.editorQuill) this.editorQuill.root.innerHTML = '';
    
    document.getElementById('editor-input-id').value = '';
    document.getElementById('editor-input-filename').value = '';
    this.editorOriginalDate = null;
  }

  showEditorStatus(msg, type) {
    const el = document.getElementById('editor-status-msg');
    if (!el) return;
    
    if (!msg) {
      el.style.display = 'none';
      el.textContent = '';
      return;
    }

    el.textContent = msg;
    el.className = 'status-msg status-' + type + ' active';
    el.style.display = 'block';
    
    if (type !== 'normal') {
      setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
    }
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
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => `
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
        
        <div style="width: 100%;">
          <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase;">Diseño y Acciones</p>
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--card-bg); padding: 0.75rem 1rem; border-radius: 20px; border: 1px solid var(--glass-border);">
            <div style="display: flex; gap: 0.5rem;">
              <button class="design-btn ${this.currentVodDesign === 1 ? 'active' : ''}" onclick="window.app.changeVodDesign(1)" title="Clásico" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign === 1 ? 'var(--accent)' : 'var(--accent-soft)'}; color:${this.currentVodDesign === 1 ? 'white' : 'var(--accent)'}; display:flex; align-items:center; justify-content:center;">${createIcon('align-center')}</button>
              <button class="design-btn ${this.currentVodDesign === 2 ? 'active' : ''}" onclick="window.app.changeVodDesign(2)" title="Moderno" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign === 2 ? 'var(--accent)' : 'var(--accent-soft)'}; color:${this.currentVodDesign === 2 ? 'white' : 'var(--accent)'}; display:flex; align-items:center; justify-content:center;">${createIcon('align-left')}</button>
              <button class="design-btn ${this.currentVodDesign === 3 ? 'active' : ''}" onclick="window.app.changeVodDesign(3)" title="Elegante" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign === 3 ? 'var(--accent)' : 'var(--accent-soft)'}; color:${this.currentVodDesign === 3 ? 'white' : 'var(--accent)'}; display:flex; align-items:center; justify-content:center;">${createIcon('square-dashed-bottom-code')}</button>
            </div>
            <div style="width:1px; height:24px; background:var(--glass-border); margin:0 0.5rem;"></div>
            <div style="display: flex; gap: 0.5rem;">
              <button onclick="window.app.handleCopyVod()" title="Copiar Texto" style="width:40px; height:40px; border-radius:50%; border:1px solid var(--accent); background:none; color:var(--accent); display:flex; align-items:center; justify-content:center;">${createIcon('copy')}</button>
              <button onclick="window.app.showShareOptions()" title="Compartir Imagen" style="width:40px; height:40px; border-radius:50%; border:none; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center;">${createIcon('share-2')}</button>
            </div>
          </div>
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
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => `
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
        
        <div style="width: 100%;">
          <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase;">Diseño y Compartir</p>
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--card-bg); padding: 0.75rem 1rem; border-radius: 20px; border: 1px solid var(--glass-border);">
            <div style="display: flex; gap: 0.5rem;">
              <button class="design-btn ${this.currentVodDesign === 1 ? 'active' : ''}" onclick="window.app.changeVodDesign(1)" title="Clásico" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign === 1 ? 'var(--accent)' : 'var(--accent-soft)'}; color:${this.currentVodDesign === 1 ? 'white' : 'var(--accent)'}; display:flex; align-items:center; justify-content:center;">${createIcon('align-center')}</button>
              <button class="design-btn ${this.currentVodDesign === 2 ? 'active' : ''}" onclick="window.app.changeVodDesign(2)" title="Moderno" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign === 2 ? 'var(--accent)' : 'var(--accent-soft)'}; color:${this.currentVodDesign === 2 ? 'white' : 'var(--accent)'}; display:flex; align-items:center; justify-content:center;">${createIcon('align-left')}</button>
              <button class="design-btn ${this.currentVodDesign === 3 ? 'active' : ''}" onclick="window.app.changeVodDesign(3)" title="Elegante" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign === 3 ? 'var(--accent)' : 'var(--accent-soft)'}; color:${this.currentVodDesign === 3 ? 'white' : 'var(--accent)'}; display:flex; align-items:center; justify-content:center;">${createIcon('square-dashed-bottom-code')}</button>
            </div>
            
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; align-items: center;">
              <button onclick="window.app.copyVodToClipboard()" title="Copiar Texto" style="width:40px; height:40px; border-radius:50%; border:1px solid var(--accent); background:none; color:var(--accent); display:flex; align-items:center; justify-content:center;">
                ${createIcon('copy')}
              </button>
              <button onclick="window.app.showShareOptions()" title="Compartir Imagen" style="width:40px; height:40px; border-radius:50%; border:none; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center;">
                ${createIcon('share-2')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    this.render(html);
    this.refreshIcons();
    this.updateVodUI(); // Previsualizar diseño inmediatamente
    this.changeVodBg(1); // Default bg
  }

  changeVodDesign(designIndex) {
    this.currentVodDesign = designIndex;
    this.updateVodUI();

    // Actualizar botones de diseño visualmente
    document.querySelectorAll('.design-btn').forEach((btn, idx) => {
      const isActive = idx + 1 === designIndex;
      btn.style.background = isActive ? 'var(--accent)' : 'var(--accent-soft)';
      btn.style.color = isActive ? 'white' : 'var(--accent)';
    });
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

  async copyVodToClipboard() {
    if (!this.currentVod) return;
    const textToCopy = `"${this.currentVod.text}" - ${this.currentVod.ref}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      this.showToast('Versículo copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
      this.showToast('No se pudo copiar el versículo');
    }
  }

  handleCopyVod() {
    if (!this.currentVod) return;
    const shareText = `"${this.currentVod.text}" - ${this.currentVod.ref}\n\nEnviado desde BIBLIA CRISTIANA RV1960`;
    navigator.clipboard.writeText(shareText).then(() => this.showToast("Copiado al portapapeles"));
  }

  showShareOptions() {
    const modal = document.querySelector('#share-modal');
    if (!modal) return;

    const imgText = document.querySelector('#share-modal-img-text');
    const txtText = document.querySelector('#share-modal-txt-text');
    const txtIcon = document.querySelector('#share-modal-txt-icon');

    // Estilo unificado claro para ambos casos (Reader y VOD/ShareVerse)
    if (imgText) imgText.innerText = 'Compartir Imagen';
    if (txtText) {
      txtText.innerText = (this.currentView === 'reader') ? 'Copiar Texto' : 'Compartir como Texto';
    }

    if (txtIcon) {
      txtIcon.setAttribute('data-lucide', (this.currentView === 'reader') ? 'copy' : 'share-2');
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
    if (!card || !this.currentVod) return;

    card.style.backgroundImage = `url('${this.currentVodBg}')`;

    // Reset estilos base del card (altura fija ya está en CSS pero aseguramos consistencia)
    card.style.display = 'flex';
    card.style.padding = '2rem';
    card.style.position = 'relative';
    card.style.height = '400px';

    let contentHtml = '';
    const design = this.currentVodDesign;
    const textLength = this.currentVod.text.length;

    // Escala de fuente para preview (base 1.35rem)
    let fontSize = 1.35;
    if (textLength > 180) fontSize = 1.05;
    else if (textLength > 120) fontSize = 1.2;

    if (design === 1) {
      // DISEÑO 1: CLÁSICO (Centrado)
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';

      contentHtml = `
        <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.45); z-index: 1; border-radius: 24px;"></div>
        <div id="vod-content" style="z-index: 2; position: relative; text-align: center; width: 100%;">
          <div style="font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 0.7rem; margin-bottom: 0.75rem; opacity: 0.8; color: white;">${this.currentVod.thematic || ''}</div>
          <p style="font-size: ${fontSize}rem; font-style: italic; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Playfair Display', serif; color: white;">"${this.currentVod.text}"</p>
          <div style="font-weight: 700; color: #fff; font-size: 1.05rem; margin-bottom: 0.2rem;">${this.currentVod.ref}</div>
          <div style="font-weight: 800; color: var(--accent); font-size: 0.8rem; letter-spacing: 1px;">REINA VALERA 1960</div>
        </div>
      `;
    } else if (design === 2) {
      // DISEÑO 2: MODERNO (Izquierda, Centrado verticalmente con Degradado lateral)
      card.style.alignItems = 'center';
      card.style.justifyContent = 'flex-start';

      contentHtml = `
        <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 70%, transparent 100%); z-index: 1; border-radius: 24px;"></div>
        <div id="vod-content" style="z-index: 2; position: relative; text-align: left; width: 90%;">
          <p style="font-size: ${fontSize - 0.15}rem; font-style: italic; line-height: 1.4; margin-bottom: 0.8rem; font-family: 'Playfair Display', serif; color: white;">"${this.currentVod.text}"</p>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 30px; height: 2px; background: var(--accent);"></div>
            <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${this.currentVod.ref}</div>
          </div>
          <div style="font-weight: 800; color: var(--accent); font-size: 0.7rem; letter-spacing: 1px; margin-top: 0.25rem;">REINA VALERA 1960</div>
        </div>
      `;
    } else if (design === 3) {
      // DISEÑO 3: ELEGANT BOX (Caja oscura resaltada)
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';

      contentHtml = `
        <div id="vod-content" style="z-index: 2; position: relative; background: rgba(0, 0, 0, 0.75); border: 1px solid rgba(255,255,255,0.1); padding: 1.75rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); width: 92%; margin: 0 auto; text-align: center;">
          <div style="font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 0.65rem; margin-bottom: 0.5rem; opacity: 0.7; color: white;">${this.currentVod.thematic || ''}</div>
          <p style="font-size: ${fontSize - 0.15}rem; font-style: italic; line-height: 1.5; margin-bottom: 1.25rem; font-family: 'Playfair Display', serif; color: white;">"${this.currentVod.text}"</p>
          <div style="font-weight: 700; color: var(--accent); font-size: 0.95rem; margin-bottom: 0.2rem;">${this.currentVod.ref}</div>
          <div style="font-weight: 400; color: rgba(255,255,255,0.5); font-size: 0.7rem; letter-spacing: 1px;">REINA VALERA 1960</div>
        </div>
      `;
    }

    card.innerHTML = contentHtml;
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
          const design = this.currentVodDesign;

          // 1. Dibujar el fondo
          ctx.drawImage(img, 0, 0, 1080, 1080);

          // 2. Dibujar superposiciones según el diseño
          if (design === 1) {
            ctx.fillStyle = 'rgba(0,0,0,0.48)';
            ctx.fillRect(0, 0, 1080, 1080);
          } else if (design === 2) {
            const grad = ctx.createLinearGradient(0, 0, 1080, 0); // Degradado de izquierda a derecha
            grad.addColorStop(0, 'rgba(0,0,0,0.95)');
            grad.addColorStop(0.6, 'rgba(0,0,0,0.4)');
            grad.addColorStop(1, 'rgba(0,0,0,0.1)');
            ctx.fillStyle = grad;

            ctx.fillRect(0, 0, 1080, 1080);
          } else if (design === 3) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(0, 0, 1080, 1080);

            // Caja oscura centrada
            const boxW = 940;
            const boxH = 680;
            const boxX = (1080 - boxW) / 2;
            const boxY = (1080 - boxH) / 2;

            ctx.fillStyle = 'rgba(0,0,0,0.78)';
            this.drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 40);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.fillStyle = 'white';
          ctx.textBaseline = 'middle';

          // Configurar fuente dinámica para exportación (Alta Calidad)
          let fontSize = 56;
          const textLength = this.currentVod.text.length;
          if (textLength > 200) fontSize = 44;
          else if (textLength > 150) fontSize = 48;
          else if (textLength > 100) fontSize = 52;

          let fontName = 'serif';
          if (document.fonts.check(`italic ${fontSize}px "Playfair Display"`)) {
            fontName = '"Playfair Display", serif';
          }
          ctx.font = `italic ${fontSize}px ${fontName}`;

          // Procesar texto
          const words = `"${this.currentVod.text}"`.split(' ');
          let line = '';
          let lines = [];
          const maxWidth = design === 3 ? 840 : 880;

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

          // Calcular posición Y inicial
          let startY;
          if (design === 2) {
            ctx.textAlign = 'left';
            startY = 540 - (lines.length * fontSize * 1.3) / 2;
          } else {
            ctx.textAlign = 'center';
            startY = 540 - (lines.length * fontSize * 1.3) / 2;
          }

          // Dibujar líneas de texto
          lines.forEach((l, i) => {
            const xPos = design === 2 ? 110 : 540;
            ctx.fillText(l.trim(), xPos, startY + (i * fontSize * 1.3));
          });

          // Referencia y Marca de Agua
          if (design === 2) {
            const refY = startY + (lines.length * fontSize * 1.3) + 40;
            ctx.fillStyle = '#c29958'; // Color accent aprox
            ctx.fillRect(110, refY - 24, 60, 4);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 48px sans-serif';
            ctx.fillText(this.currentVod.ref.toUpperCase(), 190, refY);

            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '30px sans-serif';
            ctx.fillText('BIBLIA CRISTIANA RV1960', 110, 1020);
          } else {
            const refY = startY + (lines.length * fontSize * 1.3) + 80;
            ctx.fillStyle = '#c29958';
            ctx.font = 'bold 48px sans-serif';
            ctx.fillText(this.currentVod.ref.toUpperCase(), 540, refY);

            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '30px sans-serif';
            ctx.fillText('BIBLIA CRISTIANA RV1960', 540, 1020);
          }

          resolve(canvas);
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error("Error al cargar el fondo"));
    });
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
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
    const shareText = `"${this.currentVod.text}" \n\n- ${this.currentVod.ref}\nEnviado desde BIBLIA CRISTIANA RV1960`;

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

  async renderCrecimiento() {
    this.currentView = 'crecimiento';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.renderHome()">${createIcon('arrow-left')}</button>
        <h1 style="flex-grow: 1;">Crecimiento</h1>
      </header>
      <div class="view-container animate-entrance">
        <div id="crecimiento-dashboard" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 800px; margin: 0 auto; padding: 1rem;">
          <!-- Card de Último Devocional (Summary) -->
          <div id="latest-crecimiento-card">
            <div style="text-align: center; padding: 2rem; opacity: 0.7;">
              <div class="spinner"></div>
              <p style="margin-top: 1rem;">Cargando...</p>
            </div>
          </div>

          <!-- Botones de Secciones -->
          <div id="crecimiento-categories-grid" class="home-grid" style="grid-template-columns: 1fr; gap: 1rem;">
            <button class="premium-card" onclick="window.app.navigate('devocional')" style="flex-direction: row; justify-content: flex-start; gap: 1.5rem; padding: 1.25rem 1.5rem; border-radius: 20px;">
              <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:45px; height:45px;">${createIcon('coffee')}</div>
              <div style="text-align: left;">
                <div style="font-weight:700; font-size:1.1rem;">Devocionales</div>
                <div style="font-size:0.85rem; opacity:0.6;">Reflexiones diarias para tu alma</div>
              </div>
            </button>

            <button class="premium-card" onclick="window.app.navigate('preguntas')" style="flex-direction: row; justify-content: flex-start; gap: 1.5rem; padding: 1.25rem 1.5rem; border-radius: 20px;">
              <div class="icon-wrapper" style="background:#e0f2fe; color:#0369a1; width:45px; height:45px;">${createIcon('help-circle')}</div>
              <div style="text-align: left;">
                <div style="font-weight:700; font-size:1.1rem;">Preguntas</div>
                <div style="font-size:0.85rem; opacity:0.6;">Respuestas a tus dudas bíblicas</div>
              </div>
            </button>
              </div>
            </button>

            ${this.db.settings.editor_mode_enabled ? `
            <button class="premium-card" onclick="window.app.navigate('editor-admin')" style="flex-direction: row; justify-content: flex-start; gap: 1.5rem; padding: 1.25rem 1.5rem; border-radius: 20px; border: 1px dashed var(--accent);">
              <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:45px; height:45px;">${createIcon('edit-3')}</div>
              <div style="text-align: left;">
                <div style="font-weight:700; font-size:1.1rem;">Acceso Editor</div>
                <div style="font-size:0.85rem; opacity:0.6;">Panel de administración de contenido</div>
              </div>
            </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    this.render(html);
    this.loadCrecimientoSummary();
  }

  async loadCrecimientoSummary() {
    const cardContainer = document.getElementById('latest-crecimiento-card');
    const categoriesGrid = document.getElementById('crecimiento-categories-grid');

    // Verificación proactiva de conexión
    if (!navigator.onLine) {
      if (categoriesGrid) categoriesGrid.style.display = 'none';
      cardContainer.innerHTML = `
        <div class="premium-card" style="flex-direction: column; gap: 0.8rem; padding: 1.5rem; border-radius: 20px; background: rgba(var(--accent-rgb), 0.05); border: 1px dashed var(--accent-soft); text-align: center;">
          <div style="font-size: 2rem; color: var(--accent); opacity: 0.8;">${createIcon('wifi-off')}</div>
          <p style="font-size: 0.9rem; opacity: 0.8; margin: 0; line-height: 1.4;">No hay conexión a internet para acceder a este apartado extra que requiere internet</p>
          <button class="btn-primary" onclick="window.app.loadCrecimientoSummary()" style="padding: 0.5rem 1.2rem; font-size: 0.85rem; border-radius: 100px; margin-top: 0.5rem;">Reintentar</button>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    if (categoriesGrid) categoriesGrid.style.display = 'grid';

    try {
      const resp = await fetch(`https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/devocional-last.json?${Date.now()}`);
      if (!resp.ok) throw new Error();
      const data = await resp.json();

      const summaryText = data.devocional.substring(0, 120) + '...';

      cardContainer.innerHTML = `
        <div class="premium-card" onclick="window.app.renderDevotionalView(${JSON.stringify(data).replace(/"/g, '&quot;')}, false)" 
             style="flex-direction: column; gap: 0.5rem; padding: 1.25rem; border-radius: 20px; background: var(--bg-secondary); border: 1px solid var(--accent-soft); text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -10px; right: -10px; opacity: 0.03; transform: rotate(15deg);">${createIcon('coffee', 80)}</div>
          <div class="icon-wrapper" style="background:var(--accent); color:white; width:42px; height:42px; margin: 0 auto; box-shadow: 0 4px 8px var(--accent-soft); scale: 0.9;">${createIcon('coffee')}</div>
          <div style="font-size: 0.75rem; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8;">Último Devocional</div>
          <h2 style="font-size: 1.25rem; color: var(--text-main); margin: 0; line-height: 1.2;">${data.titulo}</h2>
          <p style="font-size: 0.85rem; opacity: 0.7; line-height: 1.4; margin: 0.25rem 0;">"${summaryText}"</p>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent); padding: 0.4rem 1rem; border-radius: 100px; display: inline-block; margin: 0.25rem auto 0; border: 1px solid var(--accent-soft);">Leer completo</div>
        </div>
      `;
    } catch (e) {
      cardContainer.innerHTML = `
        <div class="premium-card" onclick="window.app.loadCrecimientoSummary()" style="padding: 2rem; text-align: center; opacity: 0.7; cursor: pointer;">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${createIcon('refresh-cw')}</div>
          <p>No se pudo cargar el resumen. Toca para reintentar.</p>
        </div>
      `;
    }
    this.refreshIcons();
  }

  async renderDevotional() {
    this.currentView = 'devotional';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.renderCrecimiento()">${createIcon('arrow-left')}</button>
        <h1>Devocional Semanal</h1>
        <button class="btn-icon" onclick="window.app.renderDevotionalHistory()">${createIcon('history')}</button>
      </header>
      <div class="view-container animate-entrance">
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

  async renderPreguntasHistory() {
    this.currentView = 'preguntas';
    this.renderGenericHistoryView('Preguntas', 'help-circle', 'preguntas-index.json', 'preguntas');
  }

  async renderGenericHistoryView(title, icon, indexFile, type) {
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('crecimiento')">${createIcon('chevron-left')}</button>
        <input type="text" class="search-header" placeholder="Buscar ${title.toLowerCase()}..." oninput="window.app.filterGenericList(this.value, '${type}')" style="flex: 1; min-width: 0;">
        <div style="display: flex; gap: 0.25rem; flex-shrink: 0;">
          <button class="btn-icon" onclick="window.app.toggleGenericSort('${type}')" title="Ordenar">
            ${createIcon(this[`${type}SortOrder`] === 'asc' ? 'sort-asc' : 'sort-desc')}
          </button>
        </div>
      </header>
      <div class="view-container animate-entrance">
         <div id="${type}-history-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; padding: 2rem; color: var(--text-main); opacity: 0.7;">
              <div class="spinner"></div>
              <p style="margin-top: 1rem;">Cargando ${title.toLowerCase()}...</p>
            </div>
         </div>
      </div>
    `;
    this.render(html);

    const container = document.getElementById(`${type}-history-content`);
    try {
      const response = await fetch(`https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/${indexFile}?${Date.now()}`);
      if (!response.ok) throw new Error();
      const items = await response.json();

      if (items.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; opacity: 0.6;">No hay ${title.toLowerCase()} aún.</div>`;
        return;
      }

      const sortOrder = this[`${type}SortOrder`] || 'desc';
      items.sort((a, b) => {
        const d1 = a.fecha || '';
        const d2 = b.fecha || '';
        return sortOrder === 'asc' ? d1.localeCompare(d2) : d2.localeCompare(d1);
      });

      container.innerHTML = items.map(item => `
          <div class="premium-card" onclick="window.app.loadGenericItem('${item.file}', '${type}')" 
               style="padding: 1rem; flex-direction: row; align-items: center; justify-content: space-between; text-align: left;"
               data-search="${item.titulo.toLowerCase()}">
              <div style="text-align: left;">
                  <h3 style="font-size: 1rem; margin-bottom: 0.25rem;">${item.titulo}</h3>
                  <span style="font-size: 0.8rem; opacity: 0.6;">${item.fecha || ''}</span>
              </div>
              <div style="opacity: 0.4;">${createIcon('chevron-right')}</div>
          </div>
        `).join('');
      this.refreshIcons();
    } catch (e) {
      container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;">${createIcon('alert-circle')}</div>
          <h3 style="margin-bottom: 0.5rem;">Error al cargar</h3>
          <button class="btn-primary" onclick="window.app.render${type.charAt(0).toUpperCase() + type.slice(1)}History()">Reintentar</button>
        </div>
      `;
      this.refreshIcons();
    }
  }

  filterGenericList(query, type) {
    const container = document.getElementById(`${type}-history-content`);
    const cards = container.querySelectorAll('.premium-card');
    const q = query.toLowerCase().trim();

    cards.forEach(card => {
      const title = (card.dataset.search || card.querySelector('h3').textContent).toLowerCase();
      if (title.includes(q)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    // Validar si no hay resultados
    const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none');
    let noResults = document.getElementById('no-search-results');

    if (visibleCards.length === 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'no-search-results';
        noResults.style.cssText = 'text-align: center; padding: 2rem; opacity: 0.6;';
        noResults.textContent = 'No se encontraron coincidencias.';
        container.appendChild(noResults);
      }
    } else if (noResults) {
      noResults.remove();
    }
  }

  toggleGenericSort(type) {
    this[`${type}SortOrder`] = this[`${type}SortOrder`] === 'asc' ? 'desc' : 'asc';
    if (type === 'preguntas') this.renderPreguntasHistory();
    else if (type === 'devocional') this.renderDevotionalHistory();
  }

  async loadGenericItem(filename, type) {
    this.showToast("Cargando...");
    try {
      // Evitar duplicación del prefijo si ya viene en el filename
      const path = filename.startsWith('biblia-cristiana-rv1960-app/') ? filename : `biblia-cristiana-rv1960-app/${filename}`;
      const response = await fetch(`https://dataconnect-kohl.vercel.app/${path}`);
      if (!response.ok) throw new Error();
      const data = await response.json();

      if (type === 'preguntas') this.renderPreguntaDetail(data);
      else this.renderDevotionalView(data, true);
    } catch (e) {
      this.showToast("No se pudo cargar el contenido.");
    }
  }

  renderPreguntaDetail(data) {
    this.currentView = 'devotional-detail';
    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.renderPreguntasHistory()">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">Pregunta</h1>
      </header>
      <div class="view-container animate-entrance">
        <div class="qa-container">
          <div class="question-box">
             <p class="question-text">${data.titulo}</p>
          </div>
          
          <div class="answer-bubble">
            <span class="answer-label">Respuesta</span>
            <div class="answer-content" style="white-space: pre-wrap; word-break: break-word; margin-top: 1rem;">${data.respuesta || data.contenido || 'No hay respuesta disponible en este momento.'}</div>
          </div>

          <div class="qa-metadata">
            Publicado el ${data.fecha_hora || data.fecha || ''}
          </div>
        </div>
      </div>
    `;
    this.render(html);
    this.refreshIcons();
  }

  async renderDevotionalHistory() {
    this.currentView = 'devotional-history';
    try {
      const html = `
      <header>
        <button class="btn-icon" onclick="window.app.navigate('crecimiento')">${createIcon('chevron-left')}</button>
        <input type="text" class="search-header" placeholder="Buscar devocionales..." oninput="window.app.filterGenericList(this.value, 'devotional')" style="flex: 1; min-width: 0;">
        <div style="display: flex; gap: 0.25rem; flex-shrink: 0;">
          <button class="btn-icon" onclick="window.app.renderDevotionalFavorites()" title="Ver Favoritos">${createIcon('heart')}</button>
          <button class="btn-icon" onclick="window.app.toggleDevotionalSort()" title="Ordenar">
            ${createIcon(this.devotionalSortOrder === 'asc' ? 'sort-asc' : 'sort-desc')}
          </button>
        </div>
      </header>
      <div class="view-container animate-entrance">
         <div id="devotional-history-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; padding: 2rem; color: var(--text-main); opacity: 0.7;">
              <div class="spinner"></div>
              <p style="margin-top: 1rem;">Cargando historial...</p>
            </div>
         </div>
      </div>
      `;
      this.render(html);

      const container = document.getElementById('devotional-history-content');
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
            <div class="premium-card" onclick="window.app.loadDevotionalFromHistory('${item.file}')" style="padding: 1rem; flex-direction: row; align-items: center; justify-content: space-between; text-align: left;" data-search="${item.titulo.toLowerCase()}">
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
      // Evitar duplicación del prefijo si ya viene en el filename
      const path = filename.startsWith('biblia-cristiana-rv1960-app/') ? filename : `biblia-cristiana-rv1960-app/${filename}`;
      const response = await fetch(`https://dataconnect-kohl.vercel.app/${path}`);
      if (!response.ok) throw new Error("No encontrado");
      const data = await response.json();
      this.renderDevotionalView(data, true);
    } catch (e) {
      this.showToast("No se pudo abrir este devocional.");
    }
  }

  // Refactor del renderizado para reutilizar en historial y último
  renderDevotionalView(data, fromHistory = false) {
    this.currentDevotionalData = data;
    /* Si venimos del home (fromHistory=false), el currentView es devotional, updateamos UI */
    /* Si venimos del historial, cambiamos la vista */
    if (fromHistory) this.currentView = 'devotional-detail';
    const isFav = this.db.isDevotionalFavorite(data.titulo);

    const html = `
      <header>
        <button class="btn-icon" onclick="${fromHistory ? 'window.app.renderDevotionalHistory()' : 'window.app.renderCrecimiento()'}\">${createIcon('arrow-left')}</button>
        <h1 style="flex-grow: 1;">${fromHistory ? 'Devocional' : 'Devocional Semanal'}</h1>
      </header>
      <div class="view-container animate-entrance" style="padding-bottom: calc(7rem + env(safe-area-inset-bottom));">
        <div style="width: 100%; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: var(--card-bg); border: 1px solid var(--glass-border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 0; overflow: hidden;">
                <div style="background: var(--accent); padding: 1.5rem; color: white; text-align: center;">
                    <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">${data.fecha_hora || 'Devocional'}</span>
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0.5rem 0;">${data.titulo}</h2>
                    <span style="font-size: 0.9rem; font-style: italic;">Por ${data.autor}</span>
                </div>
                <div style="padding: 2rem;">
                    <div style="background: rgba(var(--accent-rgb), 0.1); border-left: 4px solid var(--accent); padding: 1rem; margin-bottom: 2rem; font-style: italic; color: var(--text-main); text-align: center;">
                        "${data.versiculo}"
                    </div>
                    <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main); margin-bottom: 2rem; white-space: pre-wrap; text-align: center;">${data.devocional}</div>
                    <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; border: 1px dashed var(--glass-border); margin-bottom: 2rem; text-align: center;">
                        <h4 style="color: var(--accent); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; justify-content: center;">${createIcon('heart-handshake')} Oración</h4>
                        <p style="font-style: italic; opacity: 0.9;">${data.oracion}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <button class="premium-card" id="devotional-fav-btn" onclick="event.stopPropagation(); window.app.toggleDevotionalFavorite()" 
                                style="flex-direction: row; justify-content: center; gap: 0.5rem; padding: 1rem; border: 1px solid var(--accent); color: ${isFav ? 'white' : 'var(--text-main)'}; background: ${isFav ? 'var(--accent)' : 'transparent'};">
                            ${createIcon(isFav ? 'heart-off' : 'heart')} <span style="font-weight: 700;">Favorito</span>
                        </button>
                        <button class="premium-card" onclick="event.stopPropagation(); window.app.shareDevotionalFromCurrent()" 
                                style="flex-direction: row; justify-content: center; gap: 0.5rem; padding: 1rem; background: var(--accent); color: white; border: none;">
                            ${createIcon('share-2')} <span style="font-weight: 700;">Compartir</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
    this.render(html);
  }

  openDevotionalFromFavorite(index) {
    const fav = this.db.devotionalFavorites[index];
    if (fav) {
      this.renderDevotionalView(fav, true);
    }
  }

  renderDevotionalFavorites() {
    this.currentView = 'devotional-favorites';
    const favs = this.db.devotionalFavorites;

    const html = `
      <header>
        <button class="btn-icon" onclick="window.app.renderDevotionalHistory()">${createIcon('chevron-left')}</button>
        <h1 style="flex-grow: 1;">Favoritos</h1>
      </header>
      <div class="view-container animate-entrance">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${favs.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; opacity: 0.5;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">${createIcon('heart')}</div>
              <p>No tienes devocionales guardados como favoritos.</p>
            </div>
          ` : favs.map((f, index) => `
            <div class="premium-card" 
                 onclick="window.app.openDevotionalFromFavorite(${index})"
                 style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; text-align: left; cursor: pointer; gap: 1rem;">
              <div style="flex-grow: 1; min-width: 0; overflow: hidden;">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem; color: var(--text-main); line-height: 1.3;">${f.titulo}</h3>
                <div style="font-size: 0.85rem; opacity: 0.6; color: var(--text-main);">
                  <span>${f.fecha_hora || ''}</span>
                </div>
              </div>
              <button class="btn-icon" onclick="event.stopPropagation(); window.app.confirmDeleteDevotionalFavorite(event, ${index})" 
                      style="color: #ef4444; position: relative; z-index: 10; padding: 0.5rem; background: var(--verse-hover); border-radius: 50%; flex-shrink: 0;">
                ${createIcon('trash-2')}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.render(html);
  }

  confirmDeleteDevotionalFavorite(event, index) {
    if (event) event.stopPropagation();
    this.openConfirmModal(
      "Eliminar Favorito",
      "¿Deseas eliminar este devocional de tus favoritos?",
      () => {
        this.db.deleteDevotionalFavorite(index);
        this.renderDevotionalFavorites();
      }
    );
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

  toggleDevotionalFavorite() {
    if (!this.currentDevotionalData) return;
    const isNowFav = this.db.toggleDevotionalFavorite(this.currentDevotionalData);
    this.showToast(isNowFav ? "Añadido a favoritos" : "Eliminado de favoritos");

    // Actualizar botón si estamos en la vista
    const btn = document.getElementById('devotional-fav-btn');
    if (btn) {
      btn.style.background = isNowFav ? 'var(--accent)' : 'transparent';
      btn.style.color = isNowFav ? 'white' : 'var(--text-main)';
      btn.innerHTML = `${createIcon(isNowFav ? 'heart-off' : 'heart')} <span style="font-weight: 700;">Favorito</span>`;
      this.refreshIcons();
    }
  }

  shareDevotionalFromCurrent() {
    if (this.currentDevotionalData) {
      this.shareDevotional(this.currentDevotionalData);
    }
  }

  async shareDevotional(data) {
    const text = `*${data.titulo}*\n\n"${data.versiculo}"\n\n${data.devocional}\n\n_Oración:_\n${data.oracion}\n\nCompartido desde Biblia Cristiana RV 1960`;
    const Capacitor = window.Capacitor;

    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.Share) {
      try {
        await Capacitor.Plugins.Share.share({
          title: data.titulo,
          text: text
        });
        return;
      } catch (e) {
        console.error("Capacitor share error:", e);
      }
    }

    if (navigator.share) {
      try {
        const shareData = {
          title: data.titulo,
          text: text
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error("Navigator share error:", e);
        } else {
          return; // User cancelled
        }
      }
    }

    this.copyToClipboard(text);
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast("Contenido copiado al portapapeles");
    });
  }

  parseVerseReference(ref) {
    // Ejemplo: "Juan 3:16", "1 Juan 4:19", "Génesis 1:1"
    // Limpiar comillas si existen
    const cleanRef = ref.replace(/["']/g, '').trim();

    // Intentar regex para libro con número inicial opcional
    const match = cleanRef.match(/^(\d?\s?[A-Za-zÁéíóú\s]+)\s(\d+):(\d+)$/);
    if (match) {
      return {
        book: match[1].trim(),
        chapter: match[2],
        verse: match[3]
      };
    }

    // Fallback: buscar el último espacio para el capítulo:verso
    const lastSpace = cleanRef.lastIndexOf(' ');
    if (lastSpace === -1) return null;

    const book = cleanRef.substring(0, lastSpace).trim();
    const chapterVerse = cleanRef.substring(lastSpace + 1);
    const [chapter, verse] = chapterVerse.split(':');

    if (book && chapter && verse) {
      return { book, chapter, verse };
    }

    return null;
  }
}
window.app = new App();
