/**
 * SortingGame - "Vowels vs Consonants" Game
 * Player classifies letters as vowels or consonants
 */

class SortingGame extends BaseGame {
  constructor() {
    super({
      gameId: 'glasni-saglasni',
      gameType: 'sorting',
      totalRounds: 1, // This game doesn't use traditional rounds
      gameScreenId: 'sorting-game-screen',
      resultsScreenId: 'sorting-results-screen',
      roundIndicatorId: null, // No round indicator
      starsDisplayId: 'sorting-stars-display',
      starThresholds: { perfect: 0, good: 3 }
    });

    this.totalLetters = 10;
    this.currentIndex = 0;
    this.sortingCorrect = 0;
    this.sortingWrong = 0;
    this.letters = [];
    this.answering = false;

    // Bulgarian vowels and consonants
    this.vowels = ['А', 'Е', 'И', 'О', 'У', 'Ъ', 'Ю', 'Я'];
    this.consonants = ['Б', 'В', 'Г', 'Д', 'Ж', 'З', 'Й', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ'];
  }

  /**
   * Load game data on start
   */
  onStart(options) {
    if (this.gameData && this.gameData.gameData) {
      if (this.gameData.gameData.vowels) this.vowels = this.gameData.gameData.vowels;
      if (this.gameData.gameData.consonants) this.consonants = this.gameData.gameData.consonants;
    }

    // Reset state
    this.sortingCorrect = 0;
    this.sortingWrong = 0;
    this.currentIndex = 0;
    this.answering = false;

    // Generate mixed letters
    const numVowels = 5;
    const numConsonants = 5;
    this.letters = [];
    this.letters = this.letters.concat(this.ui.shuffle([...this.vowels]).slice(0, numVowels));
    this.letters = this.letters.concat(this.ui.shuffle([...this.consonants]).slice(0, numConsonants));
    this.letters = this.ui.shuffle(this.letters);
  }

  /**
   * Load round - just update display
   */
  onLoadRound() {
    this.updateDisplay();
  }

  /**
   * Update the sorting display
   */
  updateDisplay() {
    const letterEl = document.getElementById('sorting-current-letter');
    const progressEl = document.getElementById('sorting-progress-text');

    if (letterEl) {
      letterEl.textContent = this.letters[this.currentIndex];
      letterEl.className = 'sorting-current-letter';
    }

    if (progressEl) {
      progressEl.textContent = `${this.currentIndex + 1} / ${this.totalLetters}`;
    }

    const correctEl = document.getElementById('sorting-correct');
    const wrongEl = document.getElementById('sorting-wrong');
    if (correctEl) correctEl.textContent = this.sortingCorrect;
    if (wrongEl) wrongEl.textContent = this.sortingWrong;

    // Play the letter audio
    this.audio.playGameLetter(this.letters[this.currentIndex], true);
  }

  /**
   * Handle sorting answer
   */
  answerSorting(answer) {
    if (this.answering) return;
    this.answering = true;

    const currentLetter = this.letters[this.currentIndex];
    const isVowel = this.vowels.includes(currentLetter);
    const correctAnswer = isVowel ? 'vowel' : 'consonant';
    const letterEl = document.getElementById('sorting-current-letter');

    if (answer === correctAnswer) {
      // Correct
      this.sortingCorrect++;
      if (letterEl) letterEl.classList.add('correct');

      setTimeout(() => {
        this.currentIndex++;
        this.answering = false;

        if (this.currentIndex >= this.totalLetters) {
          this.audio.playFeedback('correct');
          this.ui.createConfetti(5);
          setTimeout(() => this.showResults(), 800);
        } else {
          this.updateDisplay();
        }
      }, 600);
    } else {
      // Wrong
      this.sortingWrong++;
      const wrongEl = document.getElementById('sorting-wrong');
      if (wrongEl) wrongEl.textContent = this.sortingWrong;
      if (letterEl) letterEl.classList.add('wrong');

      this.audio.playFeedback('incorrect');

      // Tell the correct answer
      setTimeout(() => {
        const phraseFile = isVowel ? 'phrase_glasna.mp3' : 'phrase_saglasna.mp3';
        this.audio.play(phraseFile, this.audio.gamesPath);
      }, 400);

      // Let them try again with same letter
      setTimeout(() => {
        if (letterEl) letterEl.classList.remove('wrong');
        this.answering = false;
      }, 1200);
    }
  }

  /**
   * Calculate stars based on wrong answers
   */
  calculateStars() {
    if (this.sortingWrong === 0) return 3;
    if (this.sortingWrong <= 3) return 2;
    return 1;
  }

  /**
   * Show results with random message
   */
  onShowResults(stars) {
    const messages = ['Браво!', 'Много добре!', 'Супер!', 'Отлично!'];
    const messageEl = document.getElementById('sorting-sofia-message');
    if (messageEl) {
      messageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
    }
  }
}

// Create singleton instance
const sortingGame = new SortingGame();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SortingGame;
}
