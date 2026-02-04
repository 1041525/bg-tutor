/**
 * Bulgarian Phonics Tutor - Main Application
 * Entry point that initializes all modules and handles navigation
 */

const App = (function() {
  // Configuration
  let config = null;
  let gameData = null;

  // Settings
  let settings = {
    showLabels: false,
    numChoices: 4,
    filteredLetters: null
  };

  // Progress data
  let progress = {};
  let tutorData = null;

  // Audio paths
  const WORDS_BASE = 'audio/words/';
  const GAMES_BASE = 'audio/games/';

  /**
   * Initialize the application
   */
  async function init() {
    try {
      // Load configuration
      await loadConfig();

      // Load game data
      await loadGameData();

      // Initialize core modules
      initModules();

      // Initialize games
      initGames();

      // Set up event listeners
      setupEventListeners();

      // Initialize settings UI
      updateSettingsUI();

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  /**
   * Load configuration from config.json
   */
  async function loadConfig() {
    try {
      const response = await fetch('config.json');
      config = await response.json();
    } catch (e) {
      console.warn('Could not load config.json, using defaults');
      config = {
        audio: {
          basePath: 'audio/',
          wordsPath: 'audio/words/',
          gamesPath: 'audio/games/'
        }
      };
    }
  }

  /**
   * Load game data from words.json
   */
  async function loadGameData() {
    try {
      const response = await fetch('words.json');
      gameData = await response.json();

      // Load progress
      tutorData = StorageManager.load();
      progress = tutorData.phonics.letterStars || {};

      console.log('Game data loaded:', gameData.words.length, 'words');
    } catch (error) {
      console.error('Failed to load game data:', error);
      throw error;
    }
  }

  /**
   * Initialize core modules
   */
  function initModules() {
    // Initialize AudioManager
    if (config && config.audio) {
      AudioManager.init(config.audio, gameData);
    }

    // StorageManager is already initialized
  }

  /**
   * Initialize all games with shared managers
   */
  function initGames() {
    const managers = {
      audio: AudioManager,
      ui: UIManager,
      storage: StorageManager,
      gameData: gameData
    };

    // Set managers on all game instances
    if (typeof phonicsGame !== 'undefined') {
      phonicsGame.setManagers(managers);
      phonicsGame.configure(settings);
    }

    if (typeof vocabGame !== 'undefined') {
      vocabGame.setManagers(managers);
    }

    if (typeof bubbleGame !== 'undefined') {
      bubbleGame.setManagers(managers);
    }

    if (typeof dragDropGame !== 'undefined') {
      dragDropGame.setManagers(managers);
    }

    if (typeof trainGame !== 'undefined') {
      trainGame.setManagers(managers);
    }

    if (typeof buildWordGame !== 'undefined') {
      buildWordGame.setManagers(managers);
    }

    if (typeof sortingGame !== 'undefined') {
      sortingGame.setManagers(managers);
    }

    if (typeof puzzleGame !== 'undefined') {
      puzzleGame.setManagers(managers);
    }
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Touch support for word pronunciation (long press)
    document.addEventListener('touchstart', (e) => {
      const btn = e.target.closest('.picture-btn');
      if (btn) {
        btn.dataset.touchStart = Date.now();
      }
    });

    document.addEventListener('touchend', (e) => {
      const btn = e.target.closest('.picture-btn');
      if (btn && btn.dataset.touchStart) {
        const duration = Date.now() - parseInt(btn.dataset.touchStart);
        delete btn.dataset.touchStart;

        if (duration > 500) {
          e.preventDefault();
          const wordId = btn.dataset.wordId;
          const word = gameData.words.find(w => w.id === wordId);
          if (word) {
            AudioManager.play(word.audioFile, WORDS_BASE);
          }
        }
      }
    });
  }

  // =====================
  // NAVIGATION
  // =====================

  function showScreen(screenId) {
    UIManager.showScreen(screenId);
  }

  function showWelcome() {
    showScreen('welcome-screen');
  }

  function showGameSelect() {
    showScreen('game-select-screen');
  }

  function showLetterSelect() {
    renderLetterButtons();
    showScreen('letter-select-screen');
  }

  function showSettings() {
    showScreen('settings-screen');
  }

  function showStickers() {
    renderStickersDisplay();
    showScreen('stickers-screen');
  }

  // =====================
  // LETTER SELECT
  // =====================

  function renderLetterButtons() {
    const grid = document.getElementById('letter-grid');
    if (!grid || !gameData) return;

    grid.innerHTML = '';
    const letters = Object.keys(gameData.letters);

    letters.forEach(letter => {
      const btn = document.createElement('button');
      btn.className = 'letter-btn';
      btn.innerHTML = `${letter}<span class="letter-stars">${UIManager.getStarsDisplay(progress[letter] || 0)}</span>`;
      btn.onclick = () => startPhonicsGame(letter);
      grid.appendChild(btn);
    });
  }

  // =====================
  // GAME LAUNCHERS
  // =====================

  function startPhonicsGame(letter) {
    if (typeof phonicsGame !== 'undefined') {
      phonicsGame.configure(settings);
      phonicsGame.start({ letter });
    } else {
      console.error('PhonicsGame not loaded');
    }
  }

  function startVocabGame() {
    if (typeof vocabGame !== 'undefined') {
      vocabGame.start();
    } else {
      console.error('VocabGame not loaded');
    }
  }

  function startBubbleGame() {
    if (typeof bubbleGame !== 'undefined') {
      bubbleGame.start();
    } else {
      console.error('BubbleGame not loaded');
    }
  }

  function startDragDropGame() {
    if (typeof dragDropGame !== 'undefined') {
      dragDropGame.start();
    } else {
      console.error('DragDropGame not loaded');
    }
  }

  function startTrainGame() {
    if (typeof trainGame !== 'undefined') {
      trainGame.start();
    } else {
      console.error('TrainGame not loaded');
    }
  }

  function startBuildWordGame() {
    if (typeof buildWordGame !== 'undefined') {
      buildWordGame.start();
    } else {
      console.error('BuildWordGame not loaded');
    }
  }

  function startSortingGame() {
    if (typeof sortingGame !== 'undefined') {
      sortingGame.start();
    } else {
      console.error('SortingGame not loaded');
    }
  }

  function startPuzzleGame() {
    if (typeof puzzleGame !== 'undefined') {
      puzzleGame.start();
    } else {
      console.error('PuzzleGame not loaded');
    }
  }

  // =====================
  // SETTINGS
  // =====================

  function updateSettingsUI() {
    // Show labels toggle
    const labelsToggle = document.getElementById('show-labels-toggle');
    if (labelsToggle) {
      labelsToggle.classList.toggle('active', settings.showLabels);
    }

    // Number of choices
    document.querySelectorAll('.number-option').forEach(opt => {
      opt.classList.toggle('active', parseInt(opt.dataset.value) === settings.numChoices);
    });
  }

  function toggleShowLabels() {
    settings.showLabels = !settings.showLabels;
    const toggle = document.getElementById('show-labels-toggle');
    if (toggle) toggle.classList.toggle('active', settings.showLabels);

    if (typeof phonicsGame !== 'undefined') {
      phonicsGame.configure(settings);
    }
  }

  function setNumChoices(num) {
    settings.numChoices = num;
    document.querySelectorAll('.number-option').forEach(opt => {
      opt.classList.toggle('active', parseInt(opt.dataset.value) === num);
    });

    if (typeof phonicsGame !== 'undefined') {
      phonicsGame.configure(settings);
    }
  }

  // =====================
  // STICKERS
  // =====================

  function renderStickersDisplay() {
    const grid = document.getElementById('stickers-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const definitions = StorageManager.getStickerDefinitions();
    const unlocked = StorageManager.getUnlockedStickers();

    Object.values(definitions).forEach(sticker => {
      const stickerEl = document.createElement('div');
      const isUnlocked = unlocked.includes(sticker.id);

      stickerEl.className = 'sticker-item' + (isUnlocked ? '' : ' locked');
      stickerEl.innerHTML = `
        <span class="sticker-emoji">${isUnlocked ? sticker.emoji : '❓'}</span>
        <span class="sticker-name">${isUnlocked ? sticker.name : '???'}</span>
      `;

      if (isUnlocked) {
        stickerEl.title = sticker.description;
      }

      grid.appendChild(stickerEl);
    });

    // Update count
    const countEl = document.getElementById('stickers-count');
    if (countEl) {
      countEl.textContent = `${unlocked.length} / ${Object.keys(definitions).length}`;
    }
  }

  function checkAndAwardStickers(gameType) {
    const definitions = StorageManager.STICKER_DEFINITIONS;
    const newStickers = [];

    // First star
    if (!StorageManager.isStickerUnlocked('firstStar')) {
      const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
      if (totalStars >= 1) {
        StorageManager.unlockSticker('firstStar');
        newStickers.push(definitions.firstStar);
      }
    }

    // Perfect round (3 stars on a letter)
    if (!StorageManager.isStickerUnlocked('perfectRound') && gameType === 'phonics') {
      if (Object.values(progress).some(s => s >= 3)) {
        StorageManager.unlockSticker('perfectRound');
        newStickers.push(definitions.perfectRound);
      }
    }

    // Three star letter
    if (!StorageManager.isStickerUnlocked('threeStarLetter')) {
      if (Object.values(progress).some(s => s >= 3)) {
        StorageManager.unlockSticker('threeStarLetter');
        newStickers.push(definitions.threeStarLetter);
      }
    }

    // Five letters played
    if (!StorageManager.isStickerUnlocked('fiveLetters')) {
      if (Object.keys(progress).length >= 5) {
        StorageManager.unlockSticker('fiveLetters');
        newStickers.push(definitions.fiveLetters);
      }
    }

    // Ten letters played
    if (!StorageManager.isStickerUnlocked('tenLetters')) {
      if (Object.keys(progress).length >= 10) {
        StorageManager.unlockSticker('tenLetters');
        newStickers.push(definitions.tenLetters);
      }
    }

    // Vocab stickers
    if (gameType === 'vocab') {
      const gamesPlayed = StorageManager.getVocabGamesPlayed();

      if (!StorageManager.isStickerUnlocked('vocabFirst') && gamesPlayed >= 1) {
        StorageManager.unlockSticker('vocabFirst');
        newStickers.push(definitions.vocabFirst);
      }

      if (!StorageManager.isStickerUnlocked('vocabFive') && gamesPlayed >= 5) {
        StorageManager.unlockSticker('vocabFive');
        newStickers.push(definitions.vocabFive);
      }
    }

    // Explorer (tried both games)
    if (!StorageManager.isStickerUnlocked('explorer')) {
      const playedPhonics = Object.keys(progress).length > 0;
      const playedVocab = StorageManager.getVocabGamesPlayed() > 0;
      if (playedPhonics && playedVocab) {
        StorageManager.unlockSticker('explorer');
        newStickers.push(definitions.explorer);
      }
    }

    // Dedicated (10 stars total)
    if (!StorageManager.isStickerUnlocked('dedicated')) {
      const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
      if (totalStars >= 10) {
        StorageManager.unlockSticker('dedicated');
        newStickers.push(definitions.dedicated);
      }
    }

    // Superstar (20 stars total)
    if (!StorageManager.isStickerUnlocked('superstar')) {
      const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
      if (totalStars >= 20) {
        StorageManager.unlockSticker('superstar');
        newStickers.push(definitions.superstar);
      }
    }

    // Champion (3 stars on 5 letters)
    if (!StorageManager.isStickerUnlocked('champion')) {
      const threeStarCount = Object.values(progress).filter(s => s >= 3).length;
      if (threeStarCount >= 5) {
        StorageManager.unlockSticker('champion');
        newStickers.push(definitions.champion);
      }
    }

    // Master (3 stars on 10 letters)
    if (!StorageManager.isStickerUnlocked('master')) {
      const threeStarCount = Object.values(progress).filter(s => s >= 3).length;
      if (threeStarCount >= 10) {
        StorageManager.unlockSticker('master');
        newStickers.push(definitions.master);
      }
    }

    // Show newly unlocked stickers
    if (newStickers.length > 0) {
      showNewStickerPopup(newStickers);
    }
  }

  function showNewStickerPopup(stickers) {
    const popup = document.getElementById('sticker-popup');
    const emoji = document.getElementById('new-sticker-emoji');
    const name = document.getElementById('new-sticker-name');
    const desc = document.getElementById('new-sticker-desc');

    if (!popup || !emoji || !name || !desc) return;

    // Show first sticker (queue others if multiple)
    const sticker = stickers[0];
    emoji.textContent = sticker.emoji;
    name.textContent = sticker.name;
    desc.textContent = sticker.description;

    popup.classList.add('show');
    UIManager.createConfetti(15);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      popup.classList.remove('show');
      // Show next sticker if there are more
      if (stickers.length > 1) {
        setTimeout(() => showNewStickerPopup(stickers.slice(1)), 500);
      }
    }, 3000);
  }

  function closeStickerPopup() {
    const popup = document.getElementById('sticker-popup');
    if (popup) popup.classList.remove('show');
  }

  // =====================
  // LEGACY COMPATIBILITY
  // =====================

  // These functions maintain compatibility with existing onclick handlers in HTML

  // Make functions globally available
  window.showScreen = showScreen;
  window.showWelcome = showWelcome;
  window.showGameSelect = showGameSelect;
  window.showLetterSelect = showLetterSelect;
  window.showSettings = showSettings;
  window.showStickers = showStickers;

  // Game launchers
  window.startGame = startPhonicsGame;
  window.showVocabGame = startVocabGame;
  window.showBubbleGame = startBubbleGame;
  window.showDragDropGame = startDragDropGame;
  window.showTrainGame = startTrainGame;
  window.showBuildWordGame = startBuildWordGame;
  window.showSortingGame = startSortingGame;
  window.showPuzzleGame = startPuzzleGame;

  // Settings
  window.toggleShowLabels = toggleShowLabels;
  window.setNumChoices = setNumChoices;

  // Stickers
  window.checkAndAwardStickers = checkAndAwardStickers;
  window.closeStickerPopup = closeStickerPopup;

  // Sorting game answer (special case - needs global)
  window.answerSorting = (answer) => {
    if (typeof sortingGame !== 'undefined') {
      sortingGame.answerSorting(answer);
    }
  };

  // Public API
  return {
    init,
    showScreen,
    showWelcome,
    showGameSelect,
    showLetterSelect,
    showSettings,
    showStickers,
    startPhonicsGame,
    startVocabGame,
    startBubbleGame,
    startDragDropGame,
    startTrainGame,
    startBuildWordGame,
    startSortingGame,
    startPuzzleGame,
    toggleShowLabels,
    setNumChoices,
    checkAndAwardStickers,
    getConfig: () => config,
    getGameData: () => gameData,
    getSettings: () => settings,
    getProgress: () => progress
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
