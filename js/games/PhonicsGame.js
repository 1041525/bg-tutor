/**
 * PhonicsGame - "Sound Match" Game
 * Player sees a letter and must select the picture that starts with that letter
 * Extends BaseGame for common functionality
 */

class PhonicsGame extends BaseGame {
  constructor() {
    super({
      gameId: 'zvukov-mach',
      gameType: 'phonics',
      totalRounds: 3,
      gameScreenId: 'game-screen',
      resultsScreenId: 'results-screen',
      roundIndicatorId: 'round-indicator',
      starsDisplayId: 'stars-display',
      starThresholds: { perfect: 0, good: 1 }
    });

    this.currentLetter = null;
    this.numChoices = 4;
    this.showLabels = false;
    this.filteredLetters = null;
  }

  /**
   * Configure game settings
   */
  configure(settings) {
    if (settings.numChoices) this.numChoices = settings.numChoices;
    if (settings.showLabels !== undefined) this.showLabels = settings.showLabels;
    if (settings.filteredLetters) this.filteredLetters = settings.filteredLetters;
  }

  /**
   * Start game for a specific letter
   */
  start(options = {}) {
    this.currentLetter = options.letter;
    super.start(options);
  }

  /**
   * Hook called when game starts
   */
  onStart(options) {
    // Don't play game title for phonics - it's letter-specific
  }

  /**
   * Load a round of the phonics game
   */
  onLoadRound() {
    if (!this.currentLetter || !this.gameData) return;

    const letterData = this.gameData.letters[this.currentLetter];

    // Update letter display
    const letterDisplay = document.getElementById('current-letter');
    if (letterDisplay) {
      letterDisplay.textContent = this.currentLetter;
    }

    // Select correct word for this letter
    this.currentWord = this.selectCorrectWord();

    // Get distractors (words starting with different letters)
    const distractors = this.getDistractorWords(this.numChoices - 1);
    const options = this.ui.shuffle([this.currentWord, ...distractors]);

    // Render picture grid
    this.renderPictureGrid(options);

    // Play instruction
    setTimeout(() => this.playInstruction(), 500);
  }

  /**
   * Select a correct word that starts with the current letter
   */
  selectCorrectWord() {
    const correctWords = this.gameData.words.filter(w => w.startsWith === this.currentLetter);
    const available = correctWords.filter(w => !this.usedWords.includes(w.id));

    // If all words used, reset
    if (available.length === 0) {
      this.usedWords = [];
      return this.ui.randomItem(correctWords);
    }

    const selected = this.ui.randomItem(available);
    this.usedWords.push(selected.id);
    return selected;
  }

  /**
   * Get distractor words that don't start with the current letter
   */
  getDistractorWords(count) {
    const allowedLetters = this.filteredLetters || Object.keys(this.gameData.letters);
    const distractorPool = this.gameData.words.filter(w =>
      w.startsWith !== this.currentLetter && allowedLetters.includes(w.startsWith)
    );
    return this.ui.randomItems(distractorPool, count);
  }

  /**
   * Render the picture grid
   */
  renderPictureGrid(options) {
    const grid = document.getElementById('pictures-grid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.className = 'pictures-grid grid-' + this.numChoices;

    options.forEach(item => {
      if (this.showLabels) {
        const wrapper = document.createElement('div');
        wrapper.className = 'picture-btn-wrapper';

        const btn = this.createPictureButton(item);
        const label = document.createElement('div');
        label.className = 'picture-label';
        label.textContent = item.word;

        wrapper.appendChild(btn);
        wrapper.appendChild(label);
        grid.appendChild(wrapper);
      } else {
        grid.appendChild(this.createPictureButton(item));
      }
    });
  }

  /**
   * Create a picture button for an item
   */
  createPictureButton(item) {
    const btn = document.createElement('button');
    btn.className = 'picture-btn';
    btn.dataset.wordId = item.id;
    btn.onclick = () => this.handleAnswer(item, btn);

    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = item.emoji;
    btn.appendChild(emojiSpan);

    // Add audio preview button
    const audioBtn = this.createAudioPreviewButton(item);
    btn.appendChild(audioBtn);

    return btn;
  }

  /**
   * Create audio preview button for word pronunciation
   */
  createAudioPreviewButton(item) {
    const audioBtn = document.createElement('button');
    audioBtn.className = 'audio-preview-btn';
    audioBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
    audioBtn.title = 'Чуй думата';
    audioBtn.onclick = (e) => {
      e.stopPropagation();
      audioBtn.classList.add('playing');
      this.audio.playNow(item.audioFile, this.audio.wordsPath);
      setTimeout(() => audioBtn.classList.remove('playing'), 2000);
    };
    return audioBtn;
  }

  /**
   * Play instruction audio for current letter
   */
  playInstruction() {
    if (!this.gameData || !this.currentLetter) return;
    const letterData = this.gameData.letters[this.currentLetter];
    if (letterData && letterData.audioFile) {
      this.audio.play(letterData.audioFile, this.audio.basePath);
    }
  }

  /**
   * Handle answer selection
   */
  handleAnswer(item, btn) {
    if (item.id === this.currentWord.id) {
      // Correct answer
      btn.classList.add('correct');

      // Play word audio, then bravo
      this.audio.play(item.audioFile, this.audio.wordsPath);
      setTimeout(() => {
        this.audio.playFeedback('correct');
        this.ui.createConfetti();
      }, 800);

      setTimeout(() => {
        this.nextRound();
      }, 2300);
    } else {
      // Incorrect answer - complex audio feedback
      this.handleIncorrectPhonics(item, btn);
    }
  }

  /**
   * Handle incorrect answer with detailed audio feedback
   */
  handleIncorrectPhonics(item, btn) {
    const wrapper = btn.closest('.picture-btn-wrapper');
    btn.classList.add('dimmed');
    if (wrapper) wrapper.classList.add('dimmed');
    this.mistakes++;

    // Play feedback sequence
    const phrases = this.gameData.incorrectPhrases;
    if (phrases) {
      const targetPhrase = phrases[this.currentLetter];
      const actualPhrase = phrases[item.startsWith];

      this.audio.playFeedback('incorrect');
      setTimeout(() => this.audio.play(item.audioFile, this.audio.wordsPath), 800);
      if (targetPhrase) {
        setTimeout(() => this.audio.play(targetPhrase.neZapochva, this.audio.basePath), 1600);
      }
      setTimeout(() => this.audio.play(item.audioFile, this.audio.wordsPath), 2800);
      if (actualPhrase) {
        setTimeout(() => this.audio.play(actualPhrase.zapochva, this.audio.basePath), 3600);
      }
    } else {
      this.audio.playFeedback('incorrect');
      setTimeout(() => this.audio.play(item.audioFile, this.audio.wordsPath), 800);
    }
  }

  /**
   * Save results - track letter progress
   */
  onShowResults(stars) {
    if (!this.currentLetter || !this.storage) return;

    // Save letter stars (only if better)
    this.storage.setLetterStars(this.currentLetter, stars);

    // Update results display with letter
    const letterDisplay = document.getElementById('results-letter');
    if (letterDisplay) {
      letterDisplay.textContent = this.currentLetter;
    }
  }
}

// Create singleton instance
const phonicsGame = new PhonicsGame();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhonicsGame;
}
