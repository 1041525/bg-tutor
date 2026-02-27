/**
 * VocabGame - "Find the Picture" Game
 * Player hears a word and must select the matching picture
 * Extends BaseGame for common functionality
 */

class VocabGame extends BaseGame {
  constructor() {
    super({
      gameId: 'nameri-kartinkata',
      gameType: 'vocab',
      totalRounds: 5,
      gameScreenId: 'vocab-game-screen',
      resultsScreenId: 'vocab-results-screen',
      roundIndicatorId: 'vocab-round-indicator',
      starsDisplayId: 'vocab-stars-display',
      starThresholds: { perfect: 0, good: 2 }
    });

    this.numChoices = 4;
  }

  /**
   * Hook called when game starts
   */
  onStart(options) {
    // Game-specific initialization if needed
  }

  /**
   * Load a round of the vocab game
   */
  onLoadRound() {
    // Select word using weighted selection (prioritizes struggled/unseen words)
    this.currentWord = this.selectWordWeighted();

    // If all words used, reset and pick again
    if (!this.currentWord) {
      this.usedWords = [];
      this.currentWord = this.selectWordWeighted();
    }

    // Display the word text
    const wordDisplay = document.getElementById('vocab-word-display');
    if (wordDisplay && this.currentWord) {
      wordDisplay.textContent = this.currentWord.word;
    }

    // Create answer options
    const options = this.createOptions(this.gameData.words, this.numChoices);

    // Render picture grid
    this.renderPictureGrid(options);

    // Play the word audio after short delay
    setTimeout(() => this.playCurrentWord(), 500);
  }

  /**
   * Select a word with weighted priority (struggling/unseen words first)
   */
  selectWordWeighted() {
    if (!this.gameData || !this.gameData.words) return null;

    const available = this.gameData.words.filter(w => !this.usedWords.includes(w.id));
    if (available.length === 0) return null;

    // Calculate weights based on word stats
    const weighted = available.map(word => {
      const stats = this.storage ? this.storage.getWordStats('vocab', word.id) : null;
      let weight = 10; // Base weight

      if (stats) {
        // Boost never-seen words
        if (stats.shown === 0) {
          weight += 20;
        }
        // Boost words with mistakes
        if (stats.mistakes > stats.correct) {
          weight += 15;
        }
        // Slight boost for words not seen recently
        const hoursSinceShown = stats.lastShown ? (Date.now() - stats.lastShown) / (1000 * 60 * 60) : 100;
        if (hoursSinceShown > 24) {
          weight += 5;
        }
      } else {
        // Never tracked = never seen, high priority
        weight += 25;
      }

      return { word, weight };
    });

    // Weighted random selection
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const { word, weight } of weighted) {
      random -= weight;
      if (random <= 0) {
        this.usedWords.push(word.id);
        if (this.storage) {
          this.storage.recordWordShown('vocab', word.id);
        }
        return word;
      }
    }

    // Fallback to last word
    const last = weighted[weighted.length - 1].word;
    this.usedWords.push(last.id);
    return last;
  }

  /**
   * Render the picture grid with answer options
   */
  renderPictureGrid(options) {
    const grid = document.getElementById('vocab-pictures-grid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.className = 'pictures-grid grid-' + this.numChoices;

    options.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'picture-btn';
      btn.dataset.wordId = item.id;
      btn.onclick = () => this.handleAnswer(item, btn);

      const emojiSpan = document.createElement('span');
      emojiSpan.textContent = item.emoji;
      btn.appendChild(emojiSpan);

      grid.appendChild(btn);
    });
  }

  /**
   * Play the current word's audio
   */
  playCurrentWord() {
    if (this.currentWord && this.audio) {
      this.audio.play(this.currentWord.audioFile, this.audio.wordsPath);
    }
  }

  /**
   * Handle answer selection
   */
  handleAnswer(item, btn) {
    if (item.id === this.currentWord.id) {
      // Correct answer
      this.handleCorrect(item, btn, {
        playWordAudio: true,
        delay: 1800
      });
    } else {
      // Incorrect answer
      this.handleIncorrect(item, btn, {
        playWordAudio: true
      });
    }
  }

  /**
   * Custom correct answer handling
   */
  onCorrect(item, btn) {
    // Note: Word audio is already played by handleCorrect() when playWordAudio=true
    // No additional audio needed here
  }

  /**
   * Save results and track games played
   */
  onShowResults(stars) {
    // Increment games played counter
    if (this.storage) {
      this.storage.incrementVocabGamesPlayed();
    }

    // Character message
    const messageEl = document.getElementById('vocab-results-msg');
    if (messageEl) {
      messageEl.textContent = typeof CharacterManager !== 'undefined'
        ? CharacterManager.getResultMessage('sofi', stars)
        : 'Браво!';
    }
  }
}

// Create singleton instance
const vocabGame = new VocabGame();

// Register with GameRegistry
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('vocab', vocabGame, { launcher: 'startVocabGame' });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VocabGame;
}
