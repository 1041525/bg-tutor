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
    this.bgAlphabet = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ'.split('');

    // Default word list (will be overridden by gameData)
    this.buildWords = [
      { word: 'СОК', letters: ['С', 'О', 'К'], emoji: '🧃' },
      { word: 'НОС', letters: ['Н', 'О', 'С'], emoji: '👃' },
      { word: 'КОН', letters: ['К', 'О', 'Н'], emoji: '🐴' },
      { word: 'ДОМ', letters: ['Д', 'О', 'М'], emoji: '🏠' },
      { word: 'РАК', letters: ['Р', 'А', 'К'], emoji: '🦀' },
      { word: 'КОТ', letters: ['К', 'О', 'Т'], emoji: '🐱' },
      { word: 'МАК', letters: ['М', 'А', 'К'], emoji: '🌺' },
      { word: 'КОЛА', letters: ['К', 'О', 'Л', 'А'], emoji: '🚗' },
      { word: 'РИБА', letters: ['Р', 'И', 'Б', 'А'], emoji: '🐟' }
    ];
  }

  /**
   * Load game data on start
   */
  onStart(options) {
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.buildWords) {
      this.buildWords = this.gameData.gameData.buildWords;
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
    const numDistractors = Math.max(2, 6 - allLetters.length);
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
    const messages = ['Браво!', 'Много добре!', 'Супер!', 'Отлично!'];
    const messageEl = document.getElementById('build-word-sofia-message');
    if (messageEl) {
      messageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
    }
  }
}

// Create singleton instance
const buildWordGame = new BuildWordGame();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BuildWordGame;
}
