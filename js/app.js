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

      // Show welcome screen (hide loading screen)
      showWelcome();

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
          gamesPath: 'audio/games/',
          phonicsPath: 'audio/phonics/'
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

      // Default to first 6 letters (difficulty 1)
      settings.filteredLetters = Object.keys(gameData.letters).slice(0, 6);

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

    // Use GameRegistry if available (new scalable approach)
    if (typeof GameRegistry !== 'undefined') {
      GameRegistry.initAll(managers);
      GameRegistry.bindLaunchers();

      // Configure phonics game with settings
      GameRegistry.configure('phonics', settings);
    } else {
      // Fallback to manual initialization for backwards compatibility
      if (typeof phonicsGame !== 'undefined') {
        phonicsGame.setManagers(managers);
        phonicsGame.configure(settings);
      }
      if (typeof vocabGame !== 'undefined') vocabGame.setManagers(managers);
      if (typeof bubbleGame !== 'undefined') bubbleGame.setManagers(managers);
      if (typeof dragDropGame !== 'undefined') dragDropGame.setManagers(managers);
      if (typeof trainGame !== 'undefined') trainGame.setManagers(managers);
      if (typeof buildWordGame !== 'undefined') buildWordGame.setManagers(managers);
      if (typeof sortingGame !== 'undefined') sortingGame.setManagers(managers);
      if (typeof puzzleGame !== 'undefined') puzzleGame.setManagers(managers);
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
    updateLessonProgress();
    updateStickerBadge();
    showScreen('welcome-screen');
  }

  function showGameSelect() {
    showScreen('game-select-screen');
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
  // LESSON NAVIGATION
  // =====================

  function switchMenuTab(tab) {
    const gamesMenu = document.getElementById('games-menu');
    const lessonsMenu = document.getElementById('lessons-menu');
    const tabGames = document.getElementById('tab-games');
    const tabLessons = document.getElementById('tab-lessons');

    if (!gamesMenu || !lessonsMenu) return;

    if (tab === 'games') {
      gamesMenu.classList.remove('hidden');
      lessonsMenu.classList.add('hidden');
      if (tabGames) tabGames.classList.add('active');
      if (tabLessons) tabLessons.classList.remove('active');
    } else {
      gamesMenu.classList.add('hidden');
      lessonsMenu.classList.remove('hidden');
      if (tabGames) tabGames.classList.remove('active');
      if (tabLessons) tabLessons.classList.add('active');
    }
  }

  function showLessonSelect() {
    renderStagesGrid();
    showScreen('lesson-select-screen');
  }

  function renderStagesGrid() {
    const container = document.getElementById('stages-container');
    if (!container || typeof LessonData === 'undefined') return;

    const progress = LetterLesson.getProgress();
    container.innerHTML = '';

    LessonData.stages.forEach(stage => {
      const stageCard = document.createElement('div');
      stageCard.className = 'stage-card';

      const completedCount = stage.letters.filter(l => progress[l]?.completed).length;

      stageCard.innerHTML = `
        <div class="stage-header">
          <div class="stage-number" style="background: ${stage.color}">${stage.id}</div>
          <div class="stage-info">
            <div class="stage-name">${stage.name}</div>
            <div class="stage-desc">${stage.description} (${completedCount}/${stage.letters.length})</div>
          </div>
        </div>
        <div class="stage-letters" id="stage-${stage.id}-letters"></div>
      `;

      container.appendChild(stageCard);

      // Render letter buttons for this stage
      const lettersGrid = document.getElementById(`stage-${stage.id}-letters`);
      stage.letters.forEach((letter, index) => {
        const letterData = LessonData.letters[letter];
        const isCompleted = progress[letter]?.completed;
        const isUnlocked = isLetterUnlockedForLessons(letter, progress);

        const btn = document.createElement('button');
        btn.className = 'stage-letter-btn';
        if (isCompleted) btn.classList.add('completed');
        if (!isUnlocked) btn.classList.add('locked');

        // Assign colors based on position
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#AA96DA'];
        btn.style.background = `linear-gradient(145deg, ${colors[index % colors.length]}, ${adjustColor(colors[index % colors.length], -20)})`;
        btn.style.color = ['#FFE66D', '#95E1D3'].includes(colors[index % colors.length]) ? '#333' : '#fff';

        btn.textContent = letter;

        if (isUnlocked) {
          btn.onclick = () => startLetterLesson(letter);
        }

        lettersGrid.appendChild(btn);
      });
    });
  }

  function isLetterUnlockedForLessons(letter, progress) {
    const allLetters = LessonData.getAllLettersInOrder();
    const index = allLetters.indexOf(letter);

    // First letter is always unlocked
    if (index === 0) return true;

    // Unlock if previous letter is completed
    const prevLetter = allLetters[index - 1];
    return progress[prevLetter]?.completed === true;
  }

  function adjustColor(hex, amount) {
    // Simple color adjustment for gradients
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }

  function startLetterLesson(letter) {
    if (typeof letterLesson !== 'undefined') {
      const managers = {
        audio: AudioManager,
        ui: UIManager,
        storage: StorageManager,
        gameData: gameData
      };
      letterLesson.setManagers(managers);
      letterLesson.start(letter);
    } else {
      console.error('LetterLesson not loaded');
    }
  }

  function updateLessonProgress() {
    // Update letter progress
    const letterProgressFill = document.getElementById('letters-progress');
    if (letterProgressFill && typeof LessonData !== 'undefined') {
      const letterProgress = LetterLesson.getProgress();
      const totalLetters = LessonData.getAllLettersInOrder().length;
      const completedLetters = Object.keys(letterProgress).filter(l => letterProgress[l]?.completed).length;
      const letterPercent = (completedLetters / totalLetters) * 100;
      letterProgressFill.style.width = `${letterPercent}%`;
    }

    // Update syllable progress
    const syllableProgressFill = document.getElementById('syllables-progress');
    if (syllableProgressFill && typeof SyllableData !== 'undefined') {
      const syllableProgress = SyllableLesson.getProgress();
      const totalSyllables = SyllableData.getAllSyllablesInOrder().length;
      const completedSyllables = Object.keys(syllableProgress).filter(s => syllableProgress[s]?.completed).length;
      const syllablePercent = (completedSyllables / totalSyllables) * 100;
      syllableProgressFill.style.width = `${syllablePercent}%`;
    }
  }

  // =====================
  // SYLLABLE LESSON NAVIGATION
  // =====================

  function showSyllableLessonSelect() {
    renderSyllableStagesGrid();
    showScreen('syllable-select-screen');
  }

  function renderSyllableStagesGrid() {
    const container = document.getElementById('syllable-stages-container');
    if (!container || typeof SyllableData === 'undefined') return;

    const progress = SyllableLesson.getProgress();
    container.innerHTML = '';

    SyllableData.stages.forEach(stage => {
      const stageCard = document.createElement('div');
      stageCard.className = 'stage-card';

      const completedCount = stage.syllables.filter(s => progress[s.syllable]?.completed).length;

      stageCard.innerHTML = `
        <div class="stage-header">
          <div class="stage-number" style="background: ${stage.color}">${stage.id}</div>
          <div class="stage-info">
            <div class="stage-name">${stage.name}</div>
            <div class="stage-desc">${stage.description} (${completedCount}/${stage.syllables.length})</div>
          </div>
        </div>
        <div class="stage-letters" id="syllable-stage-${stage.id}"></div>
      `;

      container.appendChild(stageCard);

      // Render syllable buttons
      const syllablesGrid = document.getElementById(`syllable-stage-${stage.id}`);
      stage.syllables.forEach((sylData, index) => {
        const isCompleted = progress[sylData.syllable]?.completed;
        const isUnlocked = isSyllableUnlockedForLessons(sylData.syllable, progress);

        const btn = document.createElement('button');
        btn.className = 'stage-letter-btn';
        if (isCompleted) btn.classList.add('completed');
        if (!isUnlocked) btn.classList.add('locked');

        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#AA96DA'];
        btn.style.background = `linear-gradient(145deg, ${colors[index % colors.length]}, ${adjustColor(colors[index % colors.length], -20)})`;
        btn.style.color = ['#FFE66D', '#95E1D3'].includes(colors[index % colors.length]) ? '#333' : '#fff';
        btn.style.fontSize = '0.9rem';

        btn.textContent = sylData.syllable.replace('-', '');

        if (isUnlocked) {
          btn.onclick = () => startSyllableLesson(sylData.syllable);
        }

        syllablesGrid.appendChild(btn);
      });
    });
  }

  function isSyllableUnlockedForLessons(syllable, progress) {
    const allSyllables = SyllableData.getAllSyllablesInOrder();
    const index = allSyllables.indexOf(syllable);

    if (index === 0) return true;

    const prevSyllable = allSyllables[index - 1];
    return progress[prevSyllable]?.completed === true;
  }

  function startSyllableLesson(syllable) {
    if (typeof syllableLesson !== 'undefined') {
      const managers = {
        audio: AudioManager,
        ui: UIManager,
        storage: StorageManager,
        gameData: gameData
      };
      syllableLesson.setManagers(managers);
      syllableLesson.start(syllable);
    } else {
      console.error('SyllableLesson not loaded');
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
    const labelsToggle = document.getElementById('toggle-labels');
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
  // ADDITIONAL FUNCTIONS FOR HTML COMPATIBILITY
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
    // Update filtered letters based on difficulty
    if (gameData && gameData.letters) {
      const allLetters = Object.keys(gameData.letters);
      if (level === 1) {
        settings.filteredLetters = allLetters.slice(0, 6);
      } else if (level === 2) {
        settings.filteredLetters = allLetters.slice(0, 12);
      } else if (level === 3) {
        settings.filteredLetters = allLetters.slice(0, 18);
      } else {
        settings.filteredLetters = null; // All letters
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

  function speakTrainWord() {
    if (typeof trainGame !== 'undefined') {
      trainGame.speakWord();
    }
  }

  function speakBuildWord() {
    if (typeof buildWordGame !== 'undefined') {
      buildWordGame.speakWord();
    }
  }

  function speakPuzzleWord() {
    if (typeof puzzleGame !== 'undefined') {
      puzzleGame.speakWord();
    }
  }

  // =====================
  // LEGACY COMPATIBILITY
  // =====================

  // These functions maintain compatibility with existing onclick handlers in HTML

  // Navigation
  window.showScreen = showScreen;
  window.showWelcome = showWelcome;
  window.showGameSelect = showGameSelect;
  window.showLetterSelect = showLetterSelect;
  window.showLetterSelection = showLetterSelect; // Alias
  window.showSettings = showSettings;
  window.showStickers = showStickers;
  window.showStickerBook = showStickers; // Alias
  window.goBackFromSettings = goBackFromSettings;

  // Lesson Navigation
  window.switchMenuTab = switchMenuTab;
  window.showLessonSelect = showLessonSelect;
  window.startLetterLesson = startLetterLesson;
  window.showSyllableLessonSelect = showSyllableLessonSelect;
  window.startSyllableLesson = startSyllableLesson;

  // Game launchers
  window.startGame = startPhonicsGame;
  window.startRandomPhonicsGame = startRandomPhonicsGame;
  window.showVocabGame = startVocabGame;
  window.showBubbleGame = startBubbleGame;
  window.showDragDropGame = startDragDropGame;
  window.showTrainGame = startTrainGame;
  window.showBuildWordGame = startBuildWordGame;
  window.showSortingGame = startSortingGame;
  window.showPuzzleGame = startPuzzleGame;

  // Settings
  window.toggleShowLabels = toggleShowLabels;
  window.toggleSetting = toggleSetting;
  window.setNumChoices = setNumChoices;
  window.setDistractors = setDistractors;
  window.setDifficulty = setDifficulty;
  window.resetSettings = resetSettings;

  // Audio playback
  window.playInstruction = playInstruction;
  window.playVocabWord = playVocabWord;
  window.speakTrainWord = speakTrainWord;
  window.speakBuildWord = speakBuildWord;
  window.speakPuzzleWord = speakPuzzleWord;

  // Stickers
  window.checkAndAwardStickers = checkAndAwardStickers;
  window.closeStickerPopup = closeStickerPopup;
  window.hideNewStickerNotification = closeStickerPopup; // Alias

  // Sorting game answer
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
    startRandomPhonicsGame,
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
    // Lesson functions
    switchMenuTab,
    showLessonSelect,
    startLetterLesson,
    showSyllableLessonSelect,
    startSyllableLesson,
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
