/**
 * BaseGame Class
 * Provides common functionality for all games:
 * - Round management
 * - Feedback handling (correct/incorrect)
 * - Star calculation
 * - Results display
 */

class BaseGame {
  /**
   * Create a new game instance
   * @param {Object} options - Game configuration
   * @param {string} options.gameId - Unique identifier for this game
   * @param {string} options.gameType - Type for storage ('phonics', 'vocab', etc.)
   * @param {number} options.totalRounds - Total rounds per game session
   * @param {string} options.gameScreenId - ID of the game screen element
   * @param {string} options.resultsScreenId - ID of the results screen element
   * @param {string} options.roundIndicatorId - ID of the round indicator element
   * @param {string} options.starsDisplayId - ID of the stars display element
   * @param {Object} options.starThresholds - Thresholds for star calculation
   */
  constructor(options) {
    this.gameId = options.gameId;
    this.gameType = options.gameType || options.gameId;
    this.totalRounds = options.totalRounds || 5;
    this.gameScreenId = options.gameScreenId;
    this.resultsScreenId = options.resultsScreenId;
    this.roundIndicatorId = options.roundIndicatorId;
    this.starsDisplayId = options.starsDisplayId;
    this.starThresholds = options.starThresholds || { perfect: 0, good: 2 };

    // Game state
    this.currentRound = 0;
    this.mistakes = 0;
    this.usedWords = [];
    this.currentWord = null;
    this.isActive = false;

    // References to core managers (set via setManagers)
    this.audio = null;
    this.ui = null;
    this.storage = null;
    this.gameData = null;
  }

  /**
   * Set references to core managers
   * @param {Object} managers - { audio, ui, storage, gameData }
   */
  setManagers(managers) {
    this.audio = managers.audio || AudioManager;
    this.ui = managers.ui || UIManager;
    this.storage = managers.storage || StorageManager;
    this.gameData = managers.gameData;
  }

  /**
   * Start a new game session
   * @param {Object} options - Optional start options (e.g., { letter: 'А' })
   */
  start(options = {}) {
    this.currentRound = 0;
    this.mistakes = 0;
    this.usedWords = [];
    this.currentWord = null;
    this.isActive = true;

    // Play game title audio if gameId is set
    if (this.gameId && this.audio) {
      this.audio.playGameTitle(this.gameId);
    }

    // Show game screen
    if (this.ui) {
      this.ui.showScreen(this.gameScreenId);
    }

    // Call subclass hook
    this.onStart(options);

    // Load first round
    this.loadRound();
  }

  /**
   * Hook for subclasses to perform custom start logic
   * @param {Object} options - Start options
   */
  onStart(options) {
    // Override in subclass
  }

  /**
   * Load the current round
   */
  loadRound() {
    // Update round indicator
    if (this.ui && this.roundIndicatorId) {
      this.ui.renderRoundIndicator(this.roundIndicatorId, this.currentRound, this.totalRounds);
    }

    // Call subclass hook to load round content
    this.onLoadRound();
  }

  /**
   * Hook for subclasses to load round-specific content
   */
  onLoadRound() {
    // Override in subclass
  }

  /**
   * Handle a correct answer
   * @param {Object} item - The selected item
   * @param {HTMLElement} btn - The clicked button
   * @param {Object} options - { playWordAudio: true, delay: 2300 }
   */
  handleCorrect(item, btn, options = {}) {
    const playWordAudio = options.playWordAudio !== false;
    const delay = options.delay || 2300;

    // Visual feedback
    btn.classList.add('correct');

    // Record correct answer if tracking
    if (this.storage && item && item.id) {
      this.storage.recordWordCorrect(this.gameType, item.id);
    }

    // Audio feedback
    if (this.audio) {
      if (playWordAudio && item && item.audioFile) {
        this.audio.play(item.audioFile, this.audio.wordsPath);
      }
      setTimeout(() => {
        this.audio.playFeedback('correct');
        if (this.ui) {
          this.ui.createConfetti();
        }
      }, playWordAudio ? 600 : 0);
    }

    // Call subclass hook
    this.onCorrect(item, btn);

    // Advance to next round after delay
    setTimeout(() => {
      this.nextRound();
    }, delay);
  }

  /**
   * Hook for subclasses after correct answer
   */
  onCorrect(item, btn) {
    // Override in subclass
  }

  /**
   * Handle an incorrect answer
   * @param {Object} item - The selected (wrong) item
   * @param {HTMLElement} btn - The clicked button
   * @param {Object} options - { playWordAudio: true }
   */
  handleIncorrect(item, btn, options = {}) {
    const playWordAudio = options.playWordAudio !== false;

    // Visual feedback
    btn.classList.add('dimmed');
    const wrapper = btn.closest('.picture-btn-wrapper');
    if (wrapper) {
      wrapper.classList.add('dimmed');
    }

    // Increment mistakes
    this.mistakes++;

    // Record mistake on the target word (the one they should have picked)
    if (this.storage && this.currentWord && this.currentWord.id) {
      this.storage.recordWordMistake(this.gameType, this.currentWord.id);
    }

    // Audio feedback
    if (this.audio) {
      this.audio.playFeedback('incorrect');
      if (playWordAudio && item && item.audioFile) {
        setTimeout(() => {
          this.audio.play(item.audioFile, this.audio.wordsPath);
        }, 800);
      }
    }

    // Call subclass hook
    this.onIncorrect(item, btn);
  }

  /**
   * Hook for subclasses after incorrect answer
   */
  onIncorrect(item, btn) {
    // Override in subclass
  }

  /**
   * Advance to next round or show results
   */
  nextRound() {
    this.currentRound++;

    if (this.currentRound >= this.totalRounds) {
      this.showResults();
    } else {
      this.loadRound();
    }
  }

  /**
   * Calculate stars based on mistakes
   * @returns {number} Stars earned (1-3)
   */
  calculateStars() {
    if (this.mistakes === this.starThresholds.perfect) {
      return 3;
    }
    if (this.mistakes <= this.starThresholds.good) {
      return 2;
    }
    return 1;
  }

  /**
   * Show results screen
   */
  showResults() {
    this.isActive = false;
    const stars = this.calculateStars();

    // Update stars display
    if (this.ui && this.starsDisplayId) {
      this.ui.displayStars(this.starsDisplayId, stars);
    }

    // Show results screen
    if (this.ui) {
      this.ui.showScreen(this.resultsScreenId);
    }

    // Confetti for perfect score
    if (stars === 3 && this.ui) {
      this.ui.createConfetti(20);
    }

    // Call subclass hook with stars
    this.onShowResults(stars);

    // Check stickers after a delay
    setTimeout(() => {
      this.checkStickers(stars);
    }, 1000);
  }

  /**
   * Hook for subclasses when showing results
   * @param {number} stars - Stars earned
   */
  onShowResults(stars) {
    // Override in subclass for custom save logic
  }

  /**
   * Check and award stickers
   * @param {number} stars - Stars earned this session
   */
  checkStickers(stars) {
    // This will be called by the main app's sticker system
    // Subclasses can override or the app can listen for events
    if (typeof checkAndAwardStickers === 'function') {
      checkAndAwardStickers(this.gameType);
    }
  }

  /**
   * Select a word, avoiding recently used ones
   * @param {Array} words - Pool of words to select from
   * @param {Function} filterFn - Optional filter function
   * @returns {Object} Selected word
   */
  selectWord(words, filterFn = null) {
    let pool = filterFn ? words.filter(filterFn) : words;
    let available = pool.filter(w => !this.usedWords.includes(w.id));

    // If all words used, reset
    if (available.length === 0) {
      this.usedWords = [];
      available = pool;
    }

    // Shuffle and select
    const selected = this.ui ? this.ui.randomItem(available) : available[Math.floor(Math.random() * available.length)];

    if (selected) {
      this.usedWords.push(selected.id);
      this.currentWord = selected;

      // Record that word was shown
      if (this.storage) {
        this.storage.recordWordShown(this.gameType, selected.id);
      }
    }

    return selected;
  }

  /**
   * Get distractor words (excluding current word)
   * @param {Array} words - Pool of words
   * @param {number} count - Number of distractors needed
   * @param {Function} filterFn - Optional filter function
   * @returns {Array} Distractor words
   */
  getDistractors(words, count, filterFn = null) {
    let pool = words.filter(w => w.id !== this.currentWord?.id);
    if (filterFn) {
      pool = pool.filter(filterFn);
    }

    if (this.ui) {
      return this.ui.randomItems(pool, count);
    }

    // Fallback shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Create answer options (correct word + distractors, shuffled)
   * @param {Array} words - Pool of words for distractors
   * @param {number} totalChoices - Total number of choices
   * @param {Function} filterFn - Optional filter for distractors
   * @returns {Array} Shuffled options
   */
  createOptions(words, totalChoices, filterFn = null) {
    const distractors = this.getDistractors(words, totalChoices - 1, filterFn);
    const options = [this.currentWord, ...distractors];

    if (this.ui) {
      return this.ui.shuffle(options);
    }

    return options.sort(() => Math.random() - 0.5);
  }

  /**
   * Reset game state (for replaying)
   */
  reset() {
    this.currentRound = 0;
    this.mistakes = 0;
    this.usedWords = [];
    this.currentWord = null;
    this.isActive = false;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseGame;
}
