/**
 * DragDropGame - "Match Letters" Game
 * Player matches uppercase letters with their lowercase counterparts
 */

class DragDropGame extends BaseGame {
  constructor() {
    super({
      gameId: 'svarzhi-bukvite',
      gameType: 'dragdrop',
      totalRounds: 5,
      gameScreenId: 'dragdrop-game-screen',
      resultsScreenId: 'dragdrop-results-screen',
      roundIndicatorId: 'dragdrop-round-indicator',
      starsDisplayId: 'dragdrop-stars-display',
      starThresholds: { perfect: 0, good: 3 }
    });

    this.lettersPerRound = 4;
    this.matchedCount = 0;
    this.selectedUppercase = null;
    this.roundLetters = [];

    // Letter pairs (uppercase/lowercase)
    this.letterPairs = [
      { upper: 'А', lower: 'а' }, { upper: 'Б', lower: 'б' }, { upper: 'В', lower: 'в' },
      { upper: 'Г', lower: 'г' }, { upper: 'Д', lower: 'д' }, { upper: 'Е', lower: 'е' },
      { upper: 'Ж', lower: 'ж' }, { upper: 'З', lower: 'з' }, { upper: 'И', lower: 'и' },
      { upper: 'Й', lower: 'й' }, { upper: 'К', lower: 'к' }, { upper: 'Л', lower: 'л' },
      { upper: 'М', lower: 'м' }, { upper: 'Н', lower: 'н' }, { upper: 'О', lower: 'о' },
      { upper: 'П', lower: 'п' }, { upper: 'Р', lower: 'р' }, { upper: 'С', lower: 'с' },
      { upper: 'Т', lower: 'т' }, { upper: 'У', lower: 'у' }, { upper: 'Ф', lower: 'ф' },
      { upper: 'Х', lower: 'х' }, { upper: 'Ц', lower: 'ц' }, { upper: 'Ч', lower: 'ч' },
      { upper: 'Ш', lower: 'ш' }, { upper: 'Щ', lower: 'щ' }, { upper: 'Ю', lower: 'ю' },
      { upper: 'Я', lower: 'я' }
    ];
  }

  /**
   * Load game data if available
   */
  onStart(options) {
    // Use letter pairs from gameData if available
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.letterPairs) {
      this.letterPairs = this.gameData.gameData.letterPairs;
    }
  }

  /**
   * Load a round of the drag-drop game
   */
  onLoadRound() {
    this.matchedCount = 0;
    this.selectedUppercase = null;

    // Select random letters for this round
    this.roundLetters = this.ui.shuffle([...this.letterPairs]).slice(0, this.lettersPerRound);

    // Render uppercase letters
    this.renderUppercaseRow();

    // Render lowercase letters
    this.renderLowercaseRow();
  }

  /**
   * Render the uppercase letters row
   */
  renderUppercaseRow() {
    const upperRow = document.getElementById('uppercase-row');
    if (!upperRow) return;

    upperRow.innerHTML = '';
    this.ui.shuffle([...this.roundLetters]).forEach(pair => {
      const letter = document.createElement('div');
      letter.className = 'draggable-letter uppercase';
      letter.textContent = pair.upper;
      letter.dataset.upper = pair.upper;
      letter.dataset.lower = pair.lower;
      letter.onclick = () => this.handleUppercaseClick(letter);
      upperRow.appendChild(letter);
    });
  }

  /**
   * Render the lowercase letters row
   */
  renderLowercaseRow() {
    const lowerRow = document.getElementById('lowercase-row');
    if (!lowerRow) return;

    lowerRow.innerHTML = '';
    this.ui.shuffle([...this.roundLetters]).forEach(pair => {
      const dropZone = document.createElement('div');
      dropZone.className = 'drop-zone';
      dropZone.textContent = pair.lower;
      dropZone.dataset.lower = pair.lower;
      dropZone.dataset.upper = pair.upper;
      dropZone.onclick = () => this.handleLowercaseClick(dropZone);
      lowerRow.appendChild(dropZone);
    });
  }

  /**
   * Handle uppercase letter click
   */
  handleUppercaseClick(letter) {
    if (letter.classList.contains('matched')) return;

    // Deselect previous selection
    if (this.selectedUppercase) {
      this.selectedUppercase.classList.remove('selected');
    }

    // Select this letter
    this.selectedUppercase = letter;
    letter.classList.add('selected');

    // Play letter sound
    this.audio.playGameLetter(letter.dataset.upper, true);
  }

  /**
   * Handle lowercase letter click
   */
  handleLowercaseClick(dropZone) {
    if (dropZone.classList.contains('matched')) return;
    if (!this.selectedUppercase) return;

    const clickedLetter = dropZone.dataset.lower;

    if (this.selectedUppercase.dataset.lower === clickedLetter) {
      // Correct match
      this.selectedUppercase.classList.remove('selected');
      this.selectedUppercase.classList.add('matched');
      dropZone.classList.add('matched');
      this.matchedCount++;

      this.audio.playFeedback('correct');
      setTimeout(() => this.audio.playGameLetter(clickedLetter, true), 500);
      this.ui.createConfetti(3);
      this.selectedUppercase = null;

      // Check if round complete
      if (this.matchedCount >= this.lettersPerRound) {
        setTimeout(() => this.nextRound(), 800);
      }
    } else {
      // Wrong match
      dropZone.classList.add('wrong');
      this.mistakes++;
      this.audio.playFeedback('incorrect');
      setTimeout(() => this.audio.playGameLetter(clickedLetter, true), 500);
      setTimeout(() => dropZone.classList.remove('wrong'), 300);
    }
  }
}

// Create singleton instance
const dragDropGame = new DragDropGame();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DragDropGame;
}
