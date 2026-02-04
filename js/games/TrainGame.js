/**
 * TrainGame - "Sound Train" Game
 * Player arranges syllables in order to build words
 */

class TrainGame extends BaseGame {
  constructor() {
    super({
      gameId: 'zvukov-vlak',
      gameType: 'train',
      totalRounds: 5,
      gameScreenId: 'train-game-screen',
      resultsScreenId: 'train-results-screen',
      roundIndicatorId: 'train-round-indicator',
      starsDisplayId: 'train-stars-display',
      starThresholds: { perfect: 0, good: 3 }
    });

    this.filledSlots = [];
    this.distractorSyllables = ['ма', 'ба', 'ла', 'ти', 'ко', 'во', 'ни', 'ре', 'са', 'до'];

    // Default word list (will be overridden by gameData)
    this.trainWords = [
      { word: 'мама', syllables: ['ма', 'ма'], emoji: '👩' },
      { word: 'баба', syllables: ['ба', 'ба'], emoji: '👵' },
      { word: 'тато', syllables: ['та', 'то'], emoji: '👨' },
      { word: 'кола', syllables: ['ко', 'ла'], emoji: '🚗' },
      { word: 'риба', syllables: ['ри', 'ба'], emoji: '🐟' },
      { word: 'коте', syllables: ['ко', 'те'], emoji: '🐱' },
      { word: 'куче', syllables: ['ку', 'че'], emoji: '🐕' },
      { word: 'слон', syllables: ['слон'], emoji: '🐘' },
      { word: 'мечка', syllables: ['меч', 'ка'], emoji: '🐻' }
    ];
  }

  /**
   * Load game data on start
   */
  onStart(options) {
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.trainWords) {
      this.trainWords = this.gameData.gameData.trainWords;
    }
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.distractorSyllables) {
      this.distractorSyllables = this.gameData.gameData.distractorSyllables;
    }
  }

  /**
   * Load a round of the train game
   */
  onLoadRound() {
    // Select random word
    this.currentWord = this.trainWords[Math.floor(Math.random() * this.trainWords.length)];
    this.filledSlots = [];

    // Display target word with emoji
    const targetEl = document.getElementById('train-target-word');
    if (targetEl) {
      targetEl.innerHTML = `${this.currentWord.emoji} ${this.currentWord.syllables.join('-')}`;
    }

    // Create train slots
    this.renderTrainSlots();

    // Create syllable cards
    this.renderSyllableCards();

    // Play the word
    setTimeout(() => this.speakWord(), 500);
  }

  /**
   * Render train slots
   */
  renderTrainSlots() {
    const trackEl = document.getElementById('train-track');
    if (!trackEl) return;

    trackEl.innerHTML = '';
    this.currentWord.syllables.forEach((_, idx) => {
      const slot = document.createElement('div');
      slot.className = 'train-slot';
      slot.dataset.index = idx;
      trackEl.appendChild(slot);
    });
  }

  /**
   * Render syllable cards with distractors
   */
  renderSyllableCards() {
    const cardsEl = document.getElementById('syllable-cards');
    if (!cardsEl) return;

    cardsEl.innerHTML = '';

    // Add correct syllables
    let allSyllables = [...this.currentWord.syllables];

    // Add distractors
    const numDistractors = Math.min(3, 6 - allSyllables.length);
    for (let i = 0; i < numDistractors; i++) {
      const d = this.distractorSyllables[Math.floor(Math.random() * this.distractorSyllables.length)];
      if (!allSyllables.includes(d)) {
        allSyllables.push(d);
      }
    }

    // Shuffle and render
    this.ui.shuffle(allSyllables).forEach(syllable => {
      const card = document.createElement('button');
      card.className = 'syllable-card';
      card.textContent = syllable;
      card.onclick = () => this.handleSyllableClick(card, syllable);
      cardsEl.appendChild(card);
    });
  }

  /**
   * Play the current word
   */
  speakWord() {
    if (this.currentWord) {
      this.audio.playGameWord(this.currentWord.word);
    }
  }

  /**
   * Handle syllable card click
   */
  handleSyllableClick(card, syllable) {
    if (card.classList.contains('used')) return;

    // Play syllable audio immediately
    this.audio.playGameSyllable(syllable, true);

    const expectedIndex = this.filledSlots.length;
    const expectedSyllable = this.currentWord.syllables[expectedIndex];

    if (syllable === expectedSyllable) {
      // Correct
      card.classList.add('used', 'correct');
      this.filledSlots.push(syllable);

      // Fill the slot
      const slots = document.querySelectorAll('.train-slot');
      if (slots[expectedIndex]) {
        slots[expectedIndex].textContent = syllable;
        slots[expectedIndex].classList.add('filled');
      }

      // Check if complete
      if (this.filledSlots.length === this.currentWord.syllables.length) {
        this.ui.createConfetti(5);
        this.audio.playFeedback('correct');
        this.audio.playGameWord(this.currentWord.word);

        setTimeout(() => this.nextRound(), 2000);
      }
    } else {
      // Wrong
      card.classList.add('wrong');
      this.mistakes++;
      this.audio.playFeedback('incorrect');
      setTimeout(() => card.classList.remove('wrong'), 300);
    }
  }

  /**
   * Show results with random message
   */
  onShowResults(stars) {
    const messages = ['Браво!', 'Много добре!', 'Супер!', 'Отлично!'];
    const messageEl = document.getElementById('train-sofia-message');
    if (messageEl) {
      messageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
    }
  }
}

// Create singleton instance
const trainGame = new TrainGame();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrainGame;
}
