import { DAILY_VERSES } from './dailyVerses.js';

export class BibleDB {
  constructor() {
    this.bibleData = null;
    this.dictionaryData = null;
    this.pericopesData = null;
    this.favorites = JSON.parse(localStorage.getItem('bible_favorites') || '[]');
    this.notes = JSON.parse(localStorage.getItem('bible_notes') || '[]');
    this.highlights = JSON.parse(localStorage.getItem('bible_highlights') || '[]');
    const defaults = { last_book: "Génesis", last_chapter: "1", theme: "classic", tts_voice: 0, tts_voice_name: "", skip_verse_numbers: false };
    const stored = JSON.parse(localStorage.getItem('bible_settings') || '{}');
    this.settings = { ...defaults, ...stored };

    // Migración de datos: añadir título, pinned y fechas duales
    let dataChanged = false;

    // Migrar Notas
    this.notes.forEach(n => {
      if (n.title === undefined) { n.title = "Nota sin nombre"; dataChanged = true; }
      if (n.pinned === undefined) { n.pinned = false; dataChanged = true; }
      if (!n.dateCreated) { n.dateCreated = n.date || new Date().toISOString(); dataChanged = true; }
      if (!n.dateUpdated) { n.dateUpdated = n.dateCreated; dataChanged = true; }
    });

    // Migrar Favoritos
    this.favorites.forEach(f => {
      if (!f.dateCreated) { f.dateCreated = f.date || new Date().toISOString(); dataChanged = true; }
      if (!f.dateUpdated) { f.dateUpdated = f.dateCreated; dataChanged = true; }
    });

    // Migrar Marcadores
    this.highlights.forEach(h => {
      if (!h.dateCreated) { h.dateCreated = h.date || new Date().toISOString(); dataChanged = true; }
      if (!h.dateUpdated) { h.dateUpdated = h.dateCreated; dataChanged = true; }
    });

    if (dataChanged) {
      localStorage.setItem('bible_notes', JSON.stringify(this.notes));
      localStorage.setItem('bible_favorites', JSON.stringify(this.favorites));
      localStorage.setItem('bible_highlights', JSON.stringify(this.highlights));
    }
  }

  async init() {
    try {
      const bResp = await fetch('./bibles_rv1960.json');
      this.bibleData = await bResp.json();
      const dResp = await fetch('./dictionary.json');
      this.dictionaryData = await dResp.json();
      try {
        const pResp = await fetch('./pericopes.json');
        if (pResp.ok) this.pericopesData = await pResp.json();
      } catch (e) { console.warn("Pericopes not found, ignoring."); }
      return true;
    } catch (e) {
      console.error("Error loading bible data:", e);
      return false;
    }
  }

  getBooks(testament = null) {
    if (!this.bibleData) return [];
    // Order based on common biblical order
    const BOOKS_ORDER = [
      "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio", "Josué", "Jueces", "Rut",
      "1 Samuel", "2 Samuel", "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras", "Nehemías",
      "Ester", "Job", "Salmos", "Proverbios", "Eclesiastés", "Cantares", "Isaías", "Jeremías",
      "Lamentaciones", "Ezequiel", "Daniel", "Oseas", "Joel", "Amós", "Abdías", "Jonás",
      "Miqueas", "Nahúm", "Habacuc", "Sofonías", "Hageo", "Zacarías", "Malaquías",
      "San Mateo", "San Marcos", "San Lucas", "San Juan", "Hechos", "Romanos", "1 Corintios", "2 Corintios",
      "Gálatas", "Efesios", "Filipenses", "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses",
      "1 Timoteo", "2 Timoteo", "Tito", "Filemón", "Hebreos", "Santiago", "1 Pedro", "2 Pedro",
      "1 Juan", "2 Juan", "3 Juan", "Judas", "Apocalipsis"
    ];
    const availableBooks = Object.keys(this.bibleData);
    const ordered = BOOKS_ORDER.filter(b => availableBooks.includes(b));

    if (testament === 'old') return ordered.slice(0, 39);
    if (testament === 'new') return ordered.slice(39);
    return ordered;
  }

  getChapters(bookName) {
    if (!this.bibleData || !this.bibleData[bookName]) return [];
    return Object.keys(this.bibleData[bookName]).sort((a, b) => parseInt(a) - parseInt(b));
  }

  getVerses(bookName, chapterNum) {
    if (!this.bibleData || !this.bibleData[bookName] || !this.bibleData[bookName][chapterNum]) return [];
    const verses = this.bibleData[bookName][chapterNum];
    return Object.entries(verses)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([num, text]) => [num, this.sanitizeVerseText(text)]);
  }

  getPericope(book, chapter, verse) {
    if (!this.pericopesData) return null;

    // 1. Try exact match
    if (this.pericopesData[book] && this.pericopesData[book][chapter]) {
      return this.pericopesData[book][chapter][verse] || null;
    }

    // 2. Normalization for common variations
    let variants = [
      book.replace('San ', 'S. '),
      book.replace('San ', ''),
      book.replace('S. ', ''),
      book.replace('1 ', '1'),
      book.replace('2 ', '2'),
      book.replace('3 ', '3')
    ];

    for (let variant of variants) {
      if (this.pericopesData[variant] && this.pericopesData[variant][chapter]) {
        return this.pericopesData[variant][chapter][verse] || null;
      }
    }

    // 3. Last resort: Case-insensitive match from the keys
    const bookKeys = Object.keys(this.pericopesData);
    const normalizedBook = book.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundKey = bookKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedBook);

    if (foundKey && this.pericopesData[foundKey][chapter]) {
      return this.pericopesData[foundKey][chapter][verse] || null;
    }

    return null;
  }

  search(query) {
    if (!this.bibleData) return [];
    const q = query.toLowerCase();
    const results = [];
    for (const [book, chapters] of Object.entries(this.bibleData)) {
      for (const [chapter, verses] of Object.entries(chapters)) {
        for (const [vNum, text] of Object.entries(verses)) {
          if (text.toLowerCase().includes(q)) {
            results.push({ book, chapter, vNum, text: this.sanitizeVerseText(text) });
          }
        }
      }
    }
    return results;
  }

  isFavorite(book, chapter, verse) {
    const id = `${book} ${chapter}:${verse}`;
    return this.favorites.some(f => f.id === id);
  }

  toggleFavorite(book, chapter, verse, text) {
    const id = `${book} ${chapter}:${verse}`;
    const index = this.favorites.findIndex(f => f.id === id);
    if (index > -1) {
      this.favorites.splice(index, 1);
    } else {
      const now = new Date().toISOString();
      this.favorites.push({ id, book, chapter, verse, text, dateCreated: now, dateUpdated: now });
    }
    localStorage.setItem('bible_favorites', JSON.stringify(this.favorites));
    return index === -1; // returns true if added
  }

  deleteFavorite(index) {
    this.favorites.splice(index, 1);
    localStorage.setItem('bible_favorites', JSON.stringify(this.favorites));
  }

  addNote(book, chapter, verse, text, noteContent, title) {
    const now = new Date().toISOString();
    this.notes.push({
      book, chapter, verse, text,
      note: noteContent,
      title: title || "Nota sin nombre",
      dateCreated: now,
      dateUpdated: now,
      pinned: false
    });
    localStorage.setItem('bible_notes', JSON.stringify(this.notes));
  }

  deleteNote(index) {
    this.notes.splice(index, 1);
    localStorage.setItem('bible_notes', JSON.stringify(this.notes));
  }

  updateNote(index, noteContent, title) {
    if (this.notes[index]) {
      this.notes[index].note = noteContent;
      if (title !== undefined) this.notes[index].title = title;
      this.notes[index].dateUpdated = new Date().toISOString();
      localStorage.setItem('bible_notes', JSON.stringify(this.notes));
    }
  }

  togglePinNote(index) {
    if (this.notes[index]) {
      this.notes[index].pinned = !this.notes[index].pinned;
      localStorage.setItem('bible_notes', JSON.stringify(this.notes));
      return this.notes[index].pinned;
    }
    return false;
  }

  isHighlighted(book, chapter, verse) {
    const id = `${book} ${chapter}:${verse}`;
    return this.highlights.find(h => h.id === id);
  }

  addHighlight(book, chapter, verse, text, color) {
    const id = `${book} ${chapter}:${verse}`;
    // Remove if exists to update color
    let hDateCreated = null;
    const existingIdx = this.highlights.findIndex(h => h.id === id);
    if (existingIdx > -1) {
      hDateCreated = this.highlights[existingIdx].dateCreated;
      this.highlights.splice(existingIdx, 1);
    }

    const now = new Date().toISOString();
    this.highlights.push({ id, book, chapter, verse, text, color, dateCreated: hDateCreated || now, dateUpdated: now });
    localStorage.setItem('bible_highlights', JSON.stringify(this.highlights));
  }

  removeHighlight(book, chapter, verse) {
    const id = `${book} ${chapter}:${verse}`;
    const index = this.highlights.findIndex(h => h.id === id);
    if (index > -1) {
      this.highlights.splice(index, 1);
      localStorage.setItem('bible_highlights', JSON.stringify(this.highlights));
    }
  }

  deleteHighlight(index) {
    this.highlights.splice(index, 1);
    localStorage.setItem('bible_highlights', JSON.stringify(this.highlights));
  }

  setLastRead(book, chapter) {
    this.settings.last_book = book;
    this.settings.last_chapter = chapter;
    this.saveSettings();
  }

  setTheme(themeName) {
    this.settings.theme = themeName;
    this.saveSettings();
  }

  saveSettings() {
    localStorage.setItem('bible_settings', JSON.stringify(this.settings));
  }

  searchDictionary(query) {
    if (!this.dictionaryData) return [];
    const q = query.toLowerCase();
    return Object.entries(this.dictionaryData)
      .filter(([term, def]) => term.toLowerCase().includes(q) || def.toLowerCase().includes(q))
      .map(([term, definition]) => ({ term, definition }));
  }

  getRandomVerse() {
    if (!this.bibleData) return null;
    const books = Object.keys(this.bibleData);
    const book = books[Math.floor(Math.random() * books.length)];
    const chapters = Object.keys(this.bibleData[book]);
    const chapter = chapters[Math.floor(Math.random() * chapters.length)];
    const verses = Object.keys(this.bibleData[book][chapter]);
    const verse = verses[Math.floor(Math.random() * verses.length)];
    const text = this.sanitizeVerseText(this.bibleData[book][chapter][verse]);
    return { book, chapter, verse, text };
  }

  sanitizeVerseText(text) {
    if (!text) return "";
    return text
      .replace(/,([^\s])/g, ', $1')
      .replace(/\.([^\s])/g, '. $1')
      .replace(/;([^\s])/g, '; $1')
      .replace(/:([^\s])/g, ': $1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getVerseOfDay() {
    if (!this.bibleData) return null;

    const dailyVerses = DAILY_VERSES;
    if (!dailyVerses) return this.getRandomVerse(); // Fallback por si acaso

    const now = new Date();
    const day = now.getDate(); // 1-31
    const year = now.getFullYear();
    const data = dailyVerses[day];

    if (!data) return this.getRandomVerse();

    // Seleccionar una de las 5 opciones basada en el año
    const optionIndex = year % 5;
    const ref = data.options[optionIndex];

    // Parsear la referencia (ej: "Salmos 23:1", "1 Juan 4:19", "Judas 1:1")
    // El formato esperado es "Nombre de Libro Capitulo:Versiculo"
    const parts = ref.split(' ');
    let bookName, chapterVerse;

    if (parts.length === 3) { // Ej: "1 Juan 4:19"
      bookName = `${parts[0]} ${parts[1]}`;
      chapterVerse = parts[2];
    } else { // Ej: "Salmos 23:1"
      bookName = parts[0];
      chapterVerse = parts[1];
    }

    const [chapter, verse] = chapterVerse.split(':');

    // Normalizar nombre de libro para coincidir con la DB si es necesario
    // La lista del usuario usa "Is." (Isaías), "Sant." (Santiago), etc.
    // Vamos a intentar buscar el libro que más se parezca o usar una tabla de mapeo básica.
    const normalizedBook = this.normalizeBookName(bookName);

    if (this.bibleData[normalizedBook] && this.bibleData[normalizedBook][chapter]) {
      const rawText = this.bibleData[normalizedBook][chapter][verse];
      if (rawText) {
        const text = this.sanitizeVerseText(rawText);
        return {
          book: normalizedBook,
          chapter,
          verse,
          text,
          thematic: data.thematic,
          ref: `${normalizedBook} ${chapter}:${verse}`
        };
      }
    }

    return this.getRandomVerse(); // Fallback si falla el parseo
  }

  normalizeBookName(name) {
    const map = {
      "Josué": "Josué", "Salmo": "Salmos", "Salmos": "Salmos", "Is.": "Isaías", "Isaías": "Isaías",
      "2 Tim.": "2 Timoteo", "2 Timoteo": "2 Timoteo", "Fil.": "Filipenses", "Filipenses": "Filipenses",
      "Mateo": "San Mateo", "San Mateo": "San Mateo", "San Marcos": "San Marcos", "San Lucas": "San Lucas", "San Juan": "San Juan",
      "Hab.": "Habacuc", "Habacuc": "Habacuc", "Jer.": "Jeremías", "Jeremías": "Jeremías",
      "Sof.": "Sofonías", "Sofonías": "Sofonías", "Luc.": "San Lucas", "Lucas": "San Lucas",
      "Marcos": "San Marcos", "Heb.": "Hebreos", "Hebreos": "Hebreos", "Santiago": "Santiago", "Sant.": "Santiago",
      "1 Pedro": "1 Pedro", "2 Pedro": "2 Pedro", "Prov.": "Proverbios", "Proverbios": "Proverbios",
      "2 Cor.": "2 Corintios", "2 Corintios": "2 Corintios", "1 Cor.": "1 Corintios", "1 Corintios": "1 Corintios",
      "Lam.": "Lamentaciones", "Lamentaciones": "Lamentaciones", "2 Tes.": "2 Tesalonicenses", "2 Tesalonicenses": "2 Tesalonicenses",
      "1 Tes.": "1 Tesalonicenses", "1 Tesalonicenses": "1 Tesalonicenses", "Deut.": "Deuteronomio", "Deuteronomio": "Deuteronomio",
      "1 Juan": "1 Juan", "2 Juan": "2 Juan", "3 Juan": "3 Juan", "Ezeq.": "Ezequiel", "Ezequiel": "Ezequiel",
      "Gál.": "Gálatas", "Gálatas": "Gálatas", "Gal.": "Gálatas", "Miq.": "Miqueas", "Miqueas": "Miqueas",
      "Job": "Job", "Núm.": "Números", "Números": "Números", "Éxodo": "Éxodo", "Col.": "Colosenses", "Colosenses": "Colosenses"
    };

    if (map[name]) return map[name];

    const clean = name.replace('.', '').replace('San ', '').replace('S. ', '').trim();
    if (map[clean]) return map[clean];

    const books = this.getBooks();
    return books.find(b => b.toLowerCase().startsWith(clean.toLowerCase())) || name;
  }

  // Exportar todos los datos del usuario
  exportUserData() {
    return {
      version: "1.0",
      export_date: new Date().toISOString(),
      app_version: "1.2.3",
      data: {
        favorites: this.favorites,
        notes: this.notes,
        highlights: this.highlights,
        settings: this.settings
      }
    };
  }

  // Importar datos del usuario
  importUserData(backupData) {
    if (!backupData.version || !backupData.data) {
      throw new Error("Formato de backup inválido");
    }

    this.favorites = backupData.data.favorites || [];
    this.notes = backupData.data.notes || [];
    this.highlights = backupData.data.highlights || [];
    this.settings = { ...this.settings, ...backupData.data.settings };

    // Guardar en localStorage
    localStorage.setItem('bible_favorites', JSON.stringify(this.favorites));
    localStorage.setItem('bible_notes', JSON.stringify(this.notes));
    localStorage.setItem('bible_highlights', JSON.stringify(this.highlights));
    localStorage.setItem('bible_settings', JSON.stringify(this.settings));
  }
}
