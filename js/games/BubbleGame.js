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

    // Bulgarian letters
    this.letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ю', 'Я'];
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

    // Shuffle and position bubbles
    const shuffled = this.ui.shuffle(bubbleLetters);
    const placedBubbles = [];
    const balloonSize = 85;
    const containerRect = container.getBoundingClientRect();
    const minDistance = balloonSize + 15;

    shuffled.forEach((letter, index) => {
      const bubble = document.createElement('div');
      bubble.className = `bubble color-${(index % 6) + 1} floating`;
      bubble.textContent = letter;
      bubble.dataset.letter = letter;

      // Find non-overlapping position
      let left, top, attempts = 0;
      const maxAttempts = 50;

      do {
        left = 8 + Math.random() * 65;
        top = 5 + Math.random() * 55;
        attempts++;
      } while (
        attempts < maxAttempts &&
        placedBubbles.some(pos => {
          const dx = (left - pos.left) * containerRect.width / 100;
          const dy = (top - pos.top) * containerRect.height / 100;
          return Math.sqrt(dx * dx + dy * dy) < minDistance;
        })
      );

      placedBubbles.push({ left, top });
      bubble.style.left = left + '%';
      bubble.style.top = top + '%';

      const floatDelay = (Math.random() * 3).toFixed(2);
      const driftDelay = (Math.random() * 5).toFixed(2);
      bubble.style.animationDelay = `${floatDelay}s, ${driftDelay}s`;

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
      bubble.classList.remove('floating');
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
}

// Create singleton instance
const bubbleGame = new BubbleGame();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BubbleGame;
}
