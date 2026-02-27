/**
 * PuzzleGame - "Syllable Puzzle" Game
 * Player combines syllable halves to form words
 */

class PuzzleGame extends BaseGame {
  constructor() {
    super({
      gameId: 'sricki-pazel',
      gameType: 'puzzle',
      totalRounds: 5,
      gameScreenId: 'puzzle-game-screen',
      resultsScreenId: 'puzzle-results-screen',
      roundIndicatorId: 'puzzle-round-indicator',
      starsDisplayId: 'puzzle-stars-display',
      starThresholds: { perfect: 0, good: 3 }
    });

    this.selectedFirst = null;
    this.selectedSecond = null;
    this.firstFilled = false;
    this.secondFilled = false;

    // Data will be loaded from gameData
    this.firstDistractors = null;
    this.secondDistractors = null;
    this.puzzleWords = null;
  }

  /**
   * Load game data on start
   */
  onStart(options) {
    // Load puzzle words from gameData (required)
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.gameWords) {
      this.puzzleWords = this.gameData.gameData.gameWords
        .filter(w => w.tags.includes('puzzle'))
        .map(w => ({
          ...w,
          firstHalf: w.syllables[0],
          secondHalf: w.syllables[1]
        }));
    } else {
      console.error('PuzzleGame: gameWords not found in gameData');
      this.puzzleWords = [];
    }

    // Load puzzle distractors from gameData (required)
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.puzzleDistractors) {
      this.firstDistractors = this.gameData.gameData.puzzleDistractors.first;
      this.secondDistractors = this.gameData.gameData.puzzleDistractors.second;
    } else {
      // Fallback to distractor syllables for both
      const distractors = this.gameData?.gameData?.distractorSyllables || [];
      this.firstDistractors = distractors;
      this.secondDistractors = distractors;
    }
  }

  /**
   * Load a round of the puzzle game
   */
  onLoadRound() {
    // Select random word
    this.currentWord = this.puzzleWords[Math.floor(Math.random() * this.puzzleWords.length)];
    this.selectedFirst = null;
    this.selectedSecond = null;
    this.firstFilled = false;
    this.secondFilled = false;

    // Display image
    const imageEl = document.getElementById('puzzle-target-image');
    if (imageEl) {
      imageEl.textContent = this.currentWord.emoji;
    }

    // Display word with slots
    const displayEl = document.getElementById('puzzle-word-display');
    if (displayEl) {
      displayEl.innerHTML = `
        <span class="puzzle-syllable-slot" id="puzzle-slot-1"></span>
        <span class="puzzle-syllable-slot" id="puzzle-slot-2"></span>
      `;
    }

    // Create first halves
    this.renderFirstHalves();

    // Create second halves
    this.renderSecondHalves();

    // Play the word
    setTimeout(() => this.speakWord(), 500);
  }

  /**
   * Render first half options
   */
  renderFirstHalves() {
    const firstHalvesEl = document.getElementById('puzzle-first-halves');
    if (!firstHalvesEl) return;

    firstHalvesEl.innerHTML = '';
    let firstOptions = [this.currentWord.firstHalf];

    while (firstOptions.length < 3) {
      const d = this.firstDistractors[Math.floor(Math.random() * this.firstDistractors.length)];
      if (!firstOptions.includes(d)) firstOptions.push(d);
    }

    this.ui.shuffle(firstOptions).forEach(syllable => {
      const btn = document.createElement('button');
      btn.className = 'puzzle-syllable first-half';
      btn.textContent = syllable;
      btn.onclick = () => this.handleFirstClick(btn, syllable);
      firstHalvesEl.appendChild(btn);
    });
  }

  /**
   * Render second half options
   */
  renderSecondHalves() {
    const secondHalvesEl = document.getElementById('puzzle-second-halves');
    if (!secondHalvesEl) return;

    secondHalvesEl.innerHTML = '';
    let secondOptions = [this.currentWord.secondHalf];

    while (secondOptions.length < 3) {
      const d = this.secondDistractors[Math.floor(Math.random() * this.secondDistractors.length)];
      if (!secondOptions.includes(d)) secondOptions.push(d);
    }

    this.ui.shuffle(secondOptions).forEach(syllable => {
      const btn = document.createElement('button');
      btn.className = 'puzzle-syllable second-half';
      btn.textContent = syllable;
      btn.onclick = () => this.handleSecondClick(btn, syllable);
      secondHalvesEl.appendChild(btn);
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
   * Handle first half click
   */
  handleFirstClick(btn, syllable) {
    if (btn.classList.contains('used') || this.firstFilled) return;

    // Play syllable audio
    this.audio.playGameSyllable(syllable, true);

    // Deselect previous
    if (this.selectedFirst) {
      this.selectedFirst.classList.remove('selected');
    }

    this.selectedFirst = btn;
    btn.classList.add('selected');

    // Check if correct
    if (syllable === this.currentWord.firstHalf) {
      btn.classList.add('used', 'correct');
      btn.classList.remove('selected');

      const slot = document.getElementById('puzzle-slot-1');
      if (slot) {
        slot.textContent = syllable;
        slot.classList.add('filled');
      }

      this.firstFilled = true;
      this.selectedFirst = null;
      this.checkComplete();
    } else {
      // Wrong selection - track mistake
      this.mistakes++;
      btn.classList.add('wrong');
      this.audio.playFeedback('incorrect');
      setTimeout(() => btn.classList.remove('wrong', 'selected'), 300);
    }
  }

  /**
   * Handle second half click
   */
  handleSecondClick(btn, syllable) {
    if (btn.classList.contains('used') || this.secondFilled) return;

    // Play syllable audio
    this.audio.playGameSyllable(syllable, true);

    // Deselect previous
    if (this.selectedSecond) {
      this.selectedSecond.classList.remove('selected');
    }

    this.selectedSecond = btn;
    btn.classList.add('selected');

    // Check if correct
    if (syllable === this.currentWord.secondHalf) {
      btn.classList.add('used', 'correct');
      btn.classList.remove('selected');

      const slot = document.getElementById('puzzle-slot-2');
      if (slot) {
        slot.textContent = syllable;
        slot.classList.add('filled');
      }

      this.secondFilled = true;
      this.selectedSecond = null;
      this.checkComplete();
    } else {
      // Wrong selection - track mistake
      this.mistakes++;
      btn.classList.add('wrong');
      this.audio.playFeedback('incorrect');
      setTimeout(() => btn.classList.remove('wrong', 'selected'), 300);
    }
  }

  /**
   * Check if puzzle is complete
   */
  checkComplete() {
    if (this.firstFilled && this.secondFilled) {
      this.ui.createConfetti(5);
      this.audio.playFeedback('correct');
      this.audio.playGameWord(this.currentWord.word);

      setTimeout(() => this.nextRound(), 2000);
    }
  }

  /**
   * Show results with random message
   */
  onShowResults(stars) {
    const messageEl = document.getElementById('puzzle-results-msg');
    if (messageEl) {
      messageEl.textContent = typeof CharacterManager !== 'undefined'
        ? CharacterManager.getResultMessage('krisi', stars)
        : 'Браво!';
    }
  }
}

// Create singleton instance
const puzzleGame = new PuzzleGame();

// Register with GameRegistry
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('puzzle', puzzleGame, { launcher: 'startPuzzleGame' });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PuzzleGame;
}
