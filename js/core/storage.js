/**
 * Storage Manager Module
 * Handles localStorage operations for game progress, word stats, and stickers
 */

const StorageManager = (function() {
  const TUTOR_DATA_KEY = 'bgTutorData';
  const TUTOR_DATA_VERSION = 1;

  // Sticker definitions
  const STICKER_DEFINITIONS = {
    // Letter mastery stickers
    firstStar: { id: 'firstStar', name: 'Първа звезда', emoji: '\uD83C\uDF1F', description: 'Спечели първата си звезда', category: 'progress' },
    perfectRound: { id: 'perfectRound', name: 'Перфектен рунд', emoji: '\uD83D\uDCAB', description: 'Завърши рунд без грешки', category: 'progress' },
    threeStarLetter: { id: 'threeStarLetter', name: 'Майстор на буквата', emoji: '\uD83C\uDFC6', description: 'Получи 3 звезди на буква', category: 'mastery' },
    fiveLetters: { id: 'fiveLetters', name: 'Пет букви', emoji: '\u270B', description: 'Изиграй 5 различни букви', category: 'progress' },
    tenLetters: { id: 'tenLetters', name: 'Десет букви', emoji: '\uD83D\uDD1F', description: 'Изиграй 10 различни букви', category: 'progress' },
    allLettersPlayed: { id: 'allLettersPlayed', name: 'Всички букви', emoji: '\uD83C\uDF93', description: 'Изиграй всички букви', category: 'mastery' },

    // Vocabulary stickers
    vocabFirst: { id: 'vocabFirst', name: 'Картинен старт', emoji: '\uD83D\uDDBC\uFE0F', description: 'Завърши първата си игра "Намери картинката"', category: 'vocab' },
    vocabPerfect: { id: 'vocabPerfect', name: 'Перфектен речник', emoji: '\uD83D\uDCDA', description: 'Завърши "Намери картинката" без грешки', category: 'vocab' },
    vocabFive: { id: 'vocabFive', name: 'Пет игри', emoji: '\uD83C\uDFAF', description: 'Изиграй 5 игри "Намери картинката"', category: 'vocab' },

    // Special achievement stickers
    explorer: { id: 'explorer', name: 'Изследовател', emoji: '\uD83D\uDD0D', description: 'Опитай и двете игри', category: 'special' },
    dedicated: { id: 'dedicated', name: 'Отдаден ученик', emoji: '\uD83D\uDCD6', description: 'Събери 10 звезди общо', category: 'special' },
    superstar: { id: 'superstar', name: 'Суперзвезда', emoji: '\u2B50', description: 'Събери 20 звезди общо', category: 'special' },
    champion: { id: 'champion', name: 'Шампион', emoji: '\uD83E\uDD47', description: 'Получи 3 звезди на 5 букви', category: 'mastery' },
    master: { id: 'master', name: 'Магистър', emoji: '\uD83D\uDC51', description: 'Получи 3 звезди на 10 букви', category: 'mastery' },

    // Animal stickers (bonus rewards)
    cat: { id: 'cat', name: 'Котенце', emoji: '\uD83D\uDC31', description: 'Специален бонус стикер', category: 'bonus' },
    dog: { id: 'dog', name: 'Кученце', emoji: '\uD83D\uDC36', description: 'Специален бонус стикер', category: 'bonus' },
    rabbit: { id: 'rabbit', name: 'Зайче', emoji: '\uD83D\uDC30', description: 'Специален бонус стикер', category: 'bonus' },
    bear: { id: 'bear', name: 'Мече', emoji: '\uD83D\uDC3B', description: 'Специален бонус стикер', category: 'bonus' },
    unicorn: { id: 'unicorn', name: 'Еднорог', emoji: '\uD83E\uDD84', description: 'Специален бонус стикер', category: 'bonus' },
    rainbow: { id: 'rainbow', name: 'Дъга', emoji: '\uD83C\uDF08', description: 'Специален бонус стикер', category: 'bonus' }
  };

  // In-memory data (loaded on init)
  let tutorData = null;

  /**
   * Get default data structure
   */
  function getDefaultTutorData() {
    return {
      version: TUTOR_DATA_VERSION,
      phonics: {
        letterStars: {},
        wordStats: {}
      },
      vocab: {
        wordStats: {},
        gamesPlayed: 0
      },
      stickers: {
        unlocked: [],
        newlyUnlocked: []
      }
    };
  }

  /**
   * Load data from localStorage with migration support
   */
  function load() {
    let data = null;

    // Try to load new format
    const stored = localStorage.getItem(TUTOR_DATA_KEY);
    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse tutor data:', e);
      }
    }

    // If no new data, migrate from old format
    if (!data) {
      data = getDefaultTutorData();

      // Migrate old phonics progress (letterStars)
      const oldProgress = localStorage.getItem('bgPhonicsProgress');
      if (oldProgress) {
        try {
          data.phonics.letterStars = JSON.parse(oldProgress);
        } catch (e) {
          console.error('Failed to migrate old progress:', e);
        }
      }

      // Save migrated data
      save(data);
    }

    // Ensure stickers object exists
    if (!data.stickers) {
      data.stickers = { unlocked: [], newlyUnlocked: [] };
    }
    if (!data.vocab.gamesPlayed) {
      data.vocab.gamesPlayed = 0;
    }

    tutorData = data;
    return data;
  }

  /**
   * Save data to localStorage
   */
  function save(data) {
    data = data || tutorData;
    localStorage.setItem(TUTOR_DATA_KEY, JSON.stringify(data));
  }

  /**
   * Get the current tutor data (or load if not loaded)
   */
  function getData() {
    if (!tutorData) {
      load();
    }
    return tutorData;
  }

  // =====================
  // PHONICS PROGRESS
  // =====================

  /**
   * Get letter stars object
   */
  function getLetterStars() {
    return getData().phonics.letterStars;
  }

  /**
   * Get stars for a specific letter
   */
  function getLetterStar(letter) {
    return getData().phonics.letterStars[letter] || 0;
  }

  /**
   * Set stars for a letter (only if better)
   */
  function setLetterStars(letter, stars) {
    const data = getData();
    if (!data.phonics.letterStars[letter] || data.phonics.letterStars[letter] < stars) {
      data.phonics.letterStars[letter] = stars;
      save();
    }
  }

  // =====================
  // WORD STATS
  // =====================

  /**
   * Get stats for a word in a specific game
   */
  function getWordStats(gameType, wordId) {
    const data = getData();
    const stats = data[gameType]?.wordStats?.[wordId];
    return stats || { shown: 0, correct: 0, mistakes: 0, lastShown: 0 };
  }

  /**
   * Record a word being shown
   */
  function recordWordShown(gameType, wordId) {
    const data = getData();
    if (!data[gameType].wordStats) {
      data[gameType].wordStats = {};
    }
    if (!data[gameType].wordStats[wordId]) {
      data[gameType].wordStats[wordId] = { shown: 0, correct: 0, mistakes: 0, lastShown: 0 };
    }
    data[gameType].wordStats[wordId].shown++;
    data[gameType].wordStats[wordId].lastShown = Date.now();
    save();
  }

  /**
   * Record correct answer
   */
  function recordWordCorrect(gameType, wordId) {
    const data = getData();
    if (!data[gameType].wordStats) {
      data[gameType].wordStats = {};
    }
    if (!data[gameType].wordStats[wordId]) {
      data[gameType].wordStats[wordId] = { shown: 0, correct: 0, mistakes: 0, lastShown: 0 };
    }
    data[gameType].wordStats[wordId].correct++;
    save();
  }

  /**
   * Record mistake
   */
  function recordWordMistake(gameType, wordId) {
    const data = getData();
    if (!data[gameType].wordStats) {
      data[gameType].wordStats = {};
    }
    if (!data[gameType].wordStats[wordId]) {
      data[gameType].wordStats[wordId] = { shown: 0, correct: 0, mistakes: 0, lastShown: 0 };
    }
    data[gameType].wordStats[wordId].mistakes++;
    save();
  }

  // =====================
  // VOCAB GAMES
  // =====================

  /**
   * Get vocab games played count
   */
  function getVocabGamesPlayed() {
    return getData().vocab.gamesPlayed || 0;
  }

  /**
   * Increment vocab games played
   */
  function incrementVocabGamesPlayed() {
    const data = getData();
    data.vocab.gamesPlayed = (data.vocab.gamesPlayed || 0) + 1;
    save();
  }

  // =====================
  // STICKERS
  // =====================

  /**
   * Get sticker definitions
   */
  function getStickerDefinitions() {
    return STICKER_DEFINITIONS;
  }

  /**
   * Get unlocked stickers
   */
  function getUnlockedStickers() {
    return getData().stickers.unlocked || [];
  }

  /**
   * Get newly unlocked stickers
   */
  function getNewlyUnlockedStickers() {
    return getData().stickers.newlyUnlocked || [];
  }

  /**
   * Check if a sticker is unlocked
   */
  function isStickerUnlocked(stickerId) {
    return getUnlockedStickers().includes(stickerId);
  }

  /**
   * Unlock a sticker
   */
  function unlockSticker(stickerId) {
    const data = getData();
    if (!data.stickers.unlocked.includes(stickerId)) {
      data.stickers.unlocked.push(stickerId);
      data.stickers.newlyUnlocked.push(stickerId);
      save();
      return true;
    }
    return false;
  }

  /**
   * Clear newly unlocked stickers
   */
  function clearNewlyUnlocked() {
    const data = getData();
    data.stickers.newlyUnlocked = [];
    save();
  }

  /**
   * Get unlocked sticker count
   */
  function getUnlockedStickerCount() {
    return getUnlockedStickers().length;
  }

  // Public API
  return {
    load,
    save,
    getData,
    getDefaultTutorData,
    // Phonics
    getLetterStars,
    getLetterStar,
    setLetterStars,
    // Word stats
    getWordStats,
    recordWordShown,
    recordWordCorrect,
    recordWordMistake,
    // Vocab
    getVocabGamesPlayed,
    incrementVocabGamesPlayed,
    // Stickers
    getStickerDefinitions,
    getUnlockedStickers,
    getNewlyUnlockedStickers,
    isStickerUnlocked,
    unlockSticker,
    clearNewlyUnlocked,
    getUnlockedStickerCount,
    // Constants
    STICKER_DEFINITIONS
  };
})();

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
