/**
 * BubbleGame - "Pop the Bubble" Game
 * Player must pop bubbles containing the target letter
 * Uses Web Audio API for pop sounds
 */

class BubbleGame extends BaseGame {
  constructor() {
    super({
      gameId: 'spukay-balona',
      gameType: 'bubble',
      totalRounds: 5,
      gameScreenId: 'bubble-game-screen',
      resultsScreenId: 'bubble-results-screen',
      roundIndicatorId: 'bubble-round-indicator',
      starsDisplayId: 'bubble-stars-display',
      starThresholds: { perfect: 0, good: 3 }
    });

    this.bubblesPerRound = 8;
    this.correctBubblesNeeded = 3;
    this.targetLetter = null;
    this.bubbleCorrect = 0;
    this.totalMistakes = 0;
    this.audioCtx = null;

    // Letters will be loaded from gameData
    this.letters = null;
  }

  /**
   * Get or create audio context for sound effects
   */
  getAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  }

  /**
   * Play bubble pop sound effect
   */
  playPopSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.type = 'sine';
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  /**
   * Play wrong bubble sound effect
   */
  playWrongSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.type = 'triangle';
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  /**
   * Reset game state on start
   */
  onStart(options) {
    this.totalMistakes = 0;
    this.isActive = true;

    // Load letters from gameData
    if (this.gameData && this.gameData.gameData && this.gameData.gameData.alphabet) {
      this.letters = this.gameData.gameData.alphabet;
    } else {
      // Fallback to combined vowels + consonants if alphabet not defined
      const vowels = this.gameData?.gameData?.vowels || [];
      const consonants = this.gameData?.gameData?.consonants || [];
      this.letters = [...vowels, ...consonants];
    }
  }

  /**
   * Load a round of the bubble game
   */
  onLoadRound() {
    this.bubbleCorrect = 0;
    this.mistakes = 0;

    // Update UI counters
    const correctEl = document.getElementById('bubble-correct');
    const wrongEl = document.getElementById('bubble-wrong');
    if (correctEl) correctEl.textContent = '0';
    if (wrongEl) wrongEl.textContent = this.totalMistakes;

    // Select random target letter
    this.targetLetter = this.letters[Math.floor(Math.random() * this.letters.length)];
    const targetEl = document.getElementById('bubble-target-letter');
    if (targetEl) targetEl.textContent = this.targetLetter;

    // Read out the target letter after a short delay
    setTimeout(() => this.audio.playGameLetter(this.targetLetter), 500);

    // Create bubbles
    this.createBubbles();
    this.isActive = true;
  }

  /**
   * Create bubbles with target and distractor letters
   */
  createBubbles() {
    const container = document.getElementById('bubble-container');
    if (!container) return;

    container.innerHTML = '';

    // Create letter array with correct count of target letters
    const bubbleLetters = [];
    for (let i = 0; i < this.correctBubblesNeeded; i++) {
      bubbleLetters.push(this.targetLetter);
    }

    // Add wrong letters
    const wrongLetters = this.letters.filter(l => l !== this.targetLetter);
    for (let i = 0; i < this.bubblesPerRound - this.correctBubblesNeeded; i++) {
      bubbleLetters.push(wrongLetters[Math.floor(Math.random() * wrongLetters.length)]);
    }

    // Shuffle and assign to horizontal lanes to prevent overlap
    const shuffled = this.ui.shuffle(bubbleLetters);
    const totalBubbles = shuffled.length;
    const laneWidth = 85 / totalBubbles;

    shuffled.forEach((letter, index) => {
      const bubble = document.createElement('div');
      bubble.className = `bubble color-${(index % 6) + 1} falling`;
      bubble.textContent = letter;
      bubble.dataset.letter = letter;

      // Each balloon gets its own horizontal lane
      const left = 5 + laneWidth * index + Math.random() * laneWidth * 0.4;
      bubble.style.left = left + '%';

      // Stagger fall timing for a stream effect
      const fallDelay = (index * 0.9 + Math.random() * 0.4).toFixed(2);
      bubble.style.animationDelay = `${fallDelay}s`;

      bubble.onclick = () => this.handleBubblePop(bubble, letter);
      container.appendChild(bubble);
    });
  }

  /**
   * Handle bubble pop
   */
  handleBubblePop(bubble, letter) {
    if (!this.isActive || bubble.classList.contains('popping')) return;

    if (letter === this.targetLetter) {
      // Correct bubble
      bubble.classList.remove('falling');
      bubble.classList.add('popping');
      this.bubbleCorrect++;

      const correctEl = document.getElementById('bubble-correct');
      if (correctEl) correctEl.textContent = this.bubbleCorrect;

      this.playPopSound();
      setTimeout(() => this.audio.playGameLetter(letter, true), 250);
      this.ui.createConfetti(3);
      setTimeout(() => bubble.remove(), 300);

      // Check if round complete
      if (this.bubbleCorrect >= this.correctBubblesNeeded) {
        this.isActive = false;
        setTimeout(() => this.nextRound(), 500);
      }
    } else {
      // Wrong bubble
      bubble.classList.add('wrong');
      this.mistakes++;
      this.totalMistakes++;

      const wrongEl = document.getElementById('bubble-wrong');
      if (wrongEl) wrongEl.textContent = this.totalMistakes;

      this.playWrongSound();
      setTimeout(() => this.audio.playGameLetter(letter, true), 300);
      setTimeout(() => bubble.classList.remove('wrong'), 400);
    }
  }

  /**
   * Calculate stars based on total mistakes across all rounds
   */
  calculateStars() {
    if (this.totalMistakes === 0) return 3;
    if (this.totalMistakes <= 3) return 2;
    return 1;
  }

  onShowResults(stars) {
    const messageEl = document.getElementById('bubble-results-msg');
    if (messageEl) {
      messageEl.textContent = typeof CharacterManager !== 'undefined'
        ? CharacterManager.getResultMessage('krisi', stars)
        : 'Браво!';
    }
  }
}

// Create singleton instance
const bubbleGame = new BubbleGame();

// Register with GameRegistry
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('bubble', bubbleGame, { launcher: 'startBubbleGame' });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BubbleGame;
}
