/**
 * Bulgarian Phonics Tutor - Main Application (MVP)
 * Only Phonics Game + Vocab Game
 */

const App = (function() {
  let config = null;
  let gameData = null;

  let settings = {
    showLabels: false,
    numChoices: 4,
    filteredLetters: null
  };

  let progress = {};
  let tutorData = null;

  const WORDS_BASE = 'audio/words/';

  async function init() {
    try {
      await loadConfig();
      await loadGameData();
      initModules();
      initGames();
      setupEventListeners();
      updateSettingsUI();
      showWelcome();
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

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
          gamesPath: 'audio/games/',
          phonicsPath: 'audio/phonics/'
        }
      };
    }
  }

  async function loadGameData() {
    try {
      const response = await fetch('words.json');
      gameData = await response.json();
      tutorData = StorageManager.load();
      progress = tutorData.phonics.letterStars || {};
      settings.filteredLetters = Object.keys(gameData.letters).slice(0, 6);
      console.log('Game data loaded:', gameData.words.length, 'words');
    } catch (error) {
      console.error('Failed to load game data:', error);
      throw error;
    }
  }

  function initModules() {
    if (config && config.audio) {
      AudioManager.init(config.audio, gameData);
    }
  }

  function initGames() {
    const managers = {
      audio: AudioManager,
      ui: UIManager,
      storage: StorageManager,
      gameData: gameData
    };

    if (typeof GameRegistry !== 'undefined') {
      GameRegistry.initAll(managers);
      GameRegistry.bindLaunchers();
      GameRegistry.configure('phonics', settings);
    } else {
      if (typeof phonicsGame !== 'undefined') {
        phonicsGame.setManagers(managers);
        phonicsGame.configure(settings);
      }
      if (typeof vocabGame !== 'undefined') vocabGame.setManagers(managers);
    }
  }

  function setupEventListeners() {
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
    updateStickerBadge();
    showScreen('welcome-screen');
  }

  function showLetterSelect() {
    renderLetterButtons();
    showScreen('letter-screen');
  }

  function showSettings() {
    showScreen('settings-screen');
  }

  function showStickers() {
    renderStickersDisplay();
    showScreen('sticker-book-screen');
  }

  function updateStickerBadge() {
    const badge = document.getElementById('sticker-count-badge');
    if (badge && typeof StorageManager !== 'undefined') {
      const unlocked = StorageManager.getUnlockedStickers();
      badge.textContent = unlocked ? unlocked.length : 0;
    }
  }

  // =====================
  // LETTER SELECT
  // =====================

  function renderLetterButtons() {
    const grid = document.getElementById('letter-grid');
    if (!grid || !gameData) return;

    grid.innerHTML = '';
    const allLetters = Object.keys(gameData.letters);
    const letters = settings.filteredLetters || allLetters;

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

  function startRandomPhonicsGame() {
    if (!gameData) return;
    const allLetters = Object.keys(gameData.letters);
    const pool = settings.filteredLetters || allLetters;
    const letter = pool[Math.floor(Math.random() * pool.length)];
    startPhonicsGame(letter);
  }

  function startVocabGame() {
    if (typeof vocabGame !== 'undefined') {
      vocabGame.start();
    } else {
      console.error('VocabGame not loaded');
    }
  }

  // =====================
  // SETTINGS
  // =====================

  function updateSettingsUI() {
    const labelsToggle = document.getElementById('toggle-labels');
    if (labelsToggle) {
      labelsToggle.classList.toggle('active', settings.showLabels);
    }

    document.querySelectorAll('.number-option').forEach(opt => {
      opt.classList.toggle('active', parseInt(opt.dataset.value) === settings.numChoices);
    });
  }

  function toggleShowLabels() {
    settings.showLabels = !settings.showLabels;
    const toggle = document.getElementById('toggle-labels');
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
        <span class="sticker-emoji">${isUnlocked ? sticker.emoji : '?'}</span>
        <span class="sticker-name">${isUnlocked ? sticker.name : '???'}</span>
      `;

      if (isUnlocked) {
        stickerEl.title = sticker.description;
      }

      grid.appendChild(stickerEl);
    });

    const countEl = document.getElementById('stickers-count');
    if (countEl) {
      countEl.textContent = `${unlocked.length} / ${Object.keys(definitions).length}`;
    }
  }

  function checkAndAwardStickers(gameType) {
    const definitions = StorageManager.STICKER_DEFINITIONS;
    const newStickers = [];

    if (!StorageManager.isStickerUnlocked('firstStar')) {
      const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
      if (totalStars >= 1) {
        StorageManager.unlockSticker('firstStar');
        newStickers.push(definitions.firstStar);
      }
    }

    if (!StorageManager.isStickerUnlocked('perfectRound') && gameType === 'phonics') {
      if (Object.values(progress).some(s => s >= 3)) {
        StorageManager.unlockSticker('perfectRound');
        newStickers.push(definitions.perfectRound);
      }
    }

    if (!StorageManager.isStickerUnlocked('threeStarLetter')) {
      if (Object.values(progress).some(s => s >= 3)) {
        StorageManager.unlockSticker('threeStarLetter');
        newStickers.push(definitions.threeStarLetter);
      }
    }

    if (!StorageManager.isStickerUnlocked('fiveLetters')) {
      if (Object.keys(progress).length >= 5) {
        StorageManager.unlockSticker('fiveLetters');
        newStickers.push(definitions.fiveLetters);
      }
    }

    if (!StorageManager.isStickerUnlocked('tenLetters')) {
      if (Object.keys(progress).length >= 10) {
        StorageManager.unlockSticker('tenLetters');
        newStickers.push(definitions.tenLetters);
      }
    }

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

    if (!StorageManager.isStickerUnlocked('explorer')) {
      const playedPhonics = Object.keys(progress).length > 0;
      const playedVocab = StorageManager.getVocabGamesPlayed() > 0;
      if (playedPhonics && playedVocab) {
        StorageManager.unlockSticker('explorer');
        newStickers.push(definitions.explorer);
      }
    }

    if (!StorageManager.isStickerUnlocked('dedicated')) {
      const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
      if (totalStars >= 10) {
        StorageManager.unlockSticker('dedicated');
        newStickers.push(definitions.dedicated);
      }
    }

    if (!StorageManager.isStickerUnlocked('superstar')) {
      const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
      if (totalStars >= 20) {
        StorageManager.unlockSticker('superstar');
        newStickers.push(definitions.superstar);
      }
    }

    if (!StorageManager.isStickerUnlocked('champion')) {
      const threeStarCount = Object.values(progress).filter(s => s >= 3).length;
      if (threeStarCount >= 5) {
        StorageManager.unlockSticker('champion');
        newStickers.push(definitions.champion);
      }
    }

    if (!StorageManager.isStickerUnlocked('master')) {
      const threeStarCount = Object.values(progress).filter(s => s >= 3).length;
      if (threeStarCount >= 10) {
        StorageManager.unlockSticker('master');
        newStickers.push(definitions.master);
      }
    }

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

    const sticker = stickers[0];
    emoji.textContent = sticker.emoji;
    name.textContent = sticker.name;
    desc.textContent = sticker.description;

    popup.classList.add('show');
    UIManager.createConfetti(15);

    setTimeout(() => {
      popup.classList.remove('show');
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
  // SETTINGS HELPERS
  // =====================

  function goBackFromSettings() {
    showScreen('welcome-screen');
  }

  function toggleSetting(setting) {
    if (setting === 'showLabels') {
      toggleShowLabels();
    }
  }

  function setDistractors(num) {
    setNumChoices(num);
  }

  function setDifficulty(level) {
    settings.difficulty = level;
    document.querySelectorAll('.difficulty-option').forEach(opt => {
      opt.classList.toggle('active', parseInt(opt.dataset.value) === level);
    });
    if (gameData && gameData.letters) {
      const allLetters = Object.keys(gameData.letters);
      if (level === 1) {
        settings.filteredLetters = allLetters.slice(0, 6);
      } else if (level === 2) {
        settings.filteredLetters = allLetters.slice(0, 12);
      } else if (level === 3) {
        settings.filteredLetters = allLetters.slice(0, 18);
      } else {
        settings.filteredLetters = null;
      }
    }
    if (typeof phonicsGame !== 'undefined') {
      phonicsGame.configure(settings);
    }
  }

  function resetSettings() {
    settings.showLabels = false;
    settings.numChoices = 4;
    settings.difficulty = 1;
    settings.filteredLetters = null;
    updateSettingsUI();
  }

  function playInstruction() {
    if (typeof phonicsGame !== 'undefined' && phonicsGame.currentLetter) {
      phonicsGame.playInstruction();
    }
  }

  function playVocabWord() {
    if (typeof vocabGame !== 'undefined') {
      vocabGame.playCurrentWord();
    }
  }

  // =====================
  // WINDOW BINDINGS
  // =====================

  window.showScreen = showScreen;
  window.showWelcome = showWelcome;
  window.showLetterSelect = showLetterSelect;
  window.showLetterSelection = showLetterSelect;
  window.showSettings = showSettings;
  window.showStickers = showStickers;
  window.showStickerBook = showStickers;
  window.goBackFromSettings = goBackFromSettings;

  window.startGame = startPhonicsGame;
  window.startRandomPhonicsGame = startRandomPhonicsGame;
  window.showVocabGame = startVocabGame;

  window.toggleShowLabels = toggleShowLabels;
  window.toggleSetting = toggleSetting;
  window.setNumChoices = setNumChoices;
  window.setDistractors = setDistractors;
  window.setDifficulty = setDifficulty;
  window.resetSettings = resetSettings;

  window.playInstruction = playInstruction;
  window.playVocabWord = playVocabWord;

  window.checkAndAwardStickers = checkAndAwardStickers;
  window.closeStickerPopup = closeStickerPopup;
  window.hideNewStickerNotification = closeStickerPopup;

  return {
    init,
    showScreen,
    showWelcome,
    showLetterSelect,
    showSettings,
    showStickers,
    startPhonicsGame,
    startRandomPhonicsGame,
    startVocabGame,
    toggleShowLabels,
    setNumChoices,
    checkAndAwardStickers,
    getConfig: () => config,
    getGameData: () => gameData,
    getSettings: () => settings,
    getProgress: () => progress
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
