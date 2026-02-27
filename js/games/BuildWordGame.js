/**
 * BuildWordGame - "Build the Word" Game
 * Player arranges letters in order to spell words
 */

class BuildWordGame extends BaseGame {
  constructor() {
    super({
      gameId: 'saberi-dumata',
      gameType: 'buildword',
      totalRounds: 5,
      gameScreenId: 'build-word-game-screen',
      resultsScreenId: 'build-word-results-screen',
      roundIndicatorId: 'build-word-round-indicator',
      starsDisplayId: 'build-word-stars-display',
      starThresholds: { perfect: 0, good: 3 }
    });

    this.filledLetters = [];

    // Data will be loaded from gameData
    this.bgAlphabet = null;
    this.buildWords = null;
  }

  /**
   * Load game data on start
   */
  onStart(options) {
    // Load build words from gameData (required)
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.gameWords) {
      this.buildWords = this.gameData.gameData.gameWords
        .filter(w => w.tags.includes('build'))
        .map(w => ({
          ...w,
          word: w.word.toUpperCase(),
          letters: w.word.toUpperCase().split('')
        }));
    } else {
      console.error('BuildWordGame: gameWords not found in gameData');
      this.buildWords = [];
    }

    // Load alphabet from gameData (required)
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.alphabet) {
      this.bgAlphabet = this.gameData.gameData.alphabet;
    } else {
      // Fallback to combined vowels + consonants
      const vowels = this.gameData?.gameData?.vowels || [];
      const consonants = this.gameData?.gameData?.consonants || [];
      this.bgAlphabet = [...vowels, ...consonants];
    }
  }

  /**
   * Load a round of the build word game
   */
  onLoadRound() {
    // Select random word
    this.currentWord = this.buildWords[Math.floor(Math.random() * this.buildWords.length)];
    this.filledLetters = [];

    // Display image
    const imageEl = document.getElementById('build-word-image');
    if (imageEl) {
      imageEl.textContent = this.currentWord.emoji;
    }

    // Create letter slots
    this.renderLetterSlots();

    // Create letter choices
    this.renderLetterChoices();

    // Play the word
    setTimeout(() => this.speakWord(), 500);
  }

  /**
   * Render letter slots
   */
  renderLetterSlots() {
    const slotsEl = document.getElementById('build-word-slots');
    if (!slotsEl) return;

    slotsEl.innerHTML = '';
    this.currentWord.letters.forEach((_, idx) => {
      const slot = document.createElement('div');
      slot.className = 'letter-slot';
      slot.dataset.index = idx;
      slotsEl.appendChild(slot);
    });
  }

  /**
   * Render letter choices with distractors
   */
  renderLetterChoices() {
    const choicesEl = document.getElementById('letter-choices');
    if (!choicesEl) return;

    choicesEl.innerHTML = '';

    // Add correct letters
    let allLetters = [...this.currentWord.letters];

    // Add distractors
    const numDistractors = Math.max(2, 4 - allLetters.length);
    while (allLetters.length < this.currentWord.letters.length + numDistractors) {
      const randomLetter = this.bgAlphabet[Math.floor(Math.random() * this.bgAlphabet.length)];
      if (!allLetters.includes(randomLetter) || allLetters.filter(l => l === randomLetter).length < 2) {
        allLetters.push(randomLetter);
      }
    }

    // Shuffle and render
    this.ui.shuffle(allLetters).forEach(letter => {
      const choice = document.createElement('button');
      choice.className = 'letter-choice';
      choice.textContent = letter;
      choice.onclick = () => this.handleLetterClick(choice, letter);
      choicesEl.appendChild(choice);
    });
  }

  /**
   * Play the current word
   */
  speakWord() {
    if (this.currentWord) {
      this.audio.playGameWord(this.currentWord.word.toLowerCase());
    }
  }

  /**
   * Handle letter choice click
   */
  handleLetterClick(choice, letter) {
    if (choice.classList.contains('used')) return;

    // Play letter audio immediately
    this.audio.playGameLetter(letter, true);

    const expectedIndex = this.filledLetters.length;
    const expectedLetter = this.currentWord.letters[expectedIndex];

    if (letter === expectedLetter) {
      // Correct
      choice.classList.add('used', 'correct');
      this.filledLetters.push(letter);

      // Fill the slot
      const slots = document.querySelectorAll('.letter-slot');
      if (slots[expectedIndex]) {
        slots[expectedIndex].textContent = letter;
        slots[expectedIndex].classList.add('filled');
      }

      // Check if complete
      if (this.filledLetters.length === this.currentWord.letters.length) {
        this.ui.createConfetti(5);
        this.audio.playFeedback('correct');
        this.audio.playGameWord(this.currentWord.word.toLowerCase());

        setTimeout(() => this.nextRound(), 2000);
      }
    } else {
      // Wrong - highlight the slot
      const slots = document.querySelectorAll('.letter-slot');
      if (slots[expectedIndex]) {
        slots[expectedIndex].classList.add('wrong');
        setTimeout(() => slots[expectedIndex].classList.remove('wrong'), 300);
      }
      this.mistakes++;
      this.audio.playFeedback('incorrect');
    }
  }

  /**
   * Show results with random message
   */
  onShowResults(stars) {
    const messageEl = document.getElementById('build-word-results-msg');
    if (messageEl) {
      messageEl.textContent = typeof CharacterManager !== 'undefined'
        ? CharacterManager.getResultMessage('krisi', stars)
        : 'Браво!';
    }
  }
}

// Create singleton instance
const buildWordGame = new BuildWordGame();

// Register with GameRegistry
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('buildword', buildWordGame, { launcher: 'startBuildWordGame' });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BuildWordGame;
}
