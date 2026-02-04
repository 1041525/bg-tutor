/**
 * UI Manager Module
 * Handles screen navigation, common UI elements, and visual effects
 */

const UIManager = (function() {
  // Confetti colors
  const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];

  /**
   * Show a screen by ID, hiding all others
   * @param {string} screenId - The ID of the screen to show
   */
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add('active');
    } else {
      console.error('Screen not found:', screenId);
    }
  }

  /**
   * Render round indicator dots
   * @param {string} elementId - ID of the indicator container
   * @param {number} currentRound - Current round (0-indexed)
   * @param {number} totalRounds - Total number of rounds
   */
  function renderRoundIndicator(elementId, currentRound, totalRounds) {
    const indicator = document.getElementById(elementId);
    if (!indicator) {
      console.error('Round indicator not found:', elementId);
      return;
    }

    indicator.innerHTML = '';
    for (let i = 0; i < totalRounds; i++) {
      const dot = document.createElement('div');
      dot.className = 'round-dot';
      if (i < currentRound) dot.classList.add('completed');
      if (i === currentRound) dot.classList.add('current');
      indicator.appendChild(dot);
    }
  }

  /**
   * Create confetti effect
   * @param {number} count - Number of confetti pieces (default 10)
   */
  function createConfetti(count = 10) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.width = (Math.random() * 10 + 5) + 'px';
        confetti.style.height = confetti.style.width;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
      }, i * 100);
    }
  }

  /**
   * Calculate stars based on mistakes
   * @param {number} mistakes - Number of mistakes made
   * @param {Object} thresholds - Custom thresholds { perfect: 0, good: 3 }
   * @returns {number} Number of stars (1-3)
   */
  function calculateStars(mistakes, thresholds = { perfect: 0, good: 3 }) {
    if (mistakes === thresholds.perfect) return 3;
    if (mistakes <= thresholds.good) return 2;
    return 1;
  }

  /**
   * Get star emoji display
   * @param {number} stars - Number of stars
   * @returns {string} Star emoji string
   */
  function getStarsDisplay(stars) {
    if (stars <= 0) return '';
    return '\u2B50'.repeat(stars); // Unicode star
  }

  /**
   * Display stars in an element
   * @param {string} elementId - ID of the element
   * @param {number} stars - Number of stars
   */
  function displayStars(elementId, stars) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = getStarsDisplay(stars);
    }
  }

  /**
   * Shuffle an array (Fisher-Yates)
   * @param {Array} array - Array to shuffle
   * @returns {Array} New shuffled array
   */
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Select random item from array
   * @param {Array} array - Array to select from
   * @returns {*} Random item
   */
  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Select random items from array (without replacement)
   * @param {Array} array - Array to select from
   * @param {number} count - Number of items to select
   * @returns {Array} Selected items
   */
  function randomItems(array, count) {
    const shuffled = shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Add temporary class to element (for animations)
   * @param {HTMLElement|string} element - Element or ID
   * @param {string} className - Class to add
   * @param {number} duration - Duration in ms before removing
   */
  function addTempClass(element, className, duration = 300) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
      el.classList.add(className);
      setTimeout(() => el.classList.remove(className), duration);
    }
  }

  /**
   * Set text content of element by ID
   * @param {string} elementId - Element ID
   * @param {string} text - Text content
   */
  function setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
  }

  /**
   * Set HTML content of element by ID
   * @param {string} elementId - Element ID
   * @param {string} html - HTML content
   */
  function setHtml(elementId, html) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = html;
  }

  /**
   * Clear element content
   * @param {string} elementId - Element ID
   */
  function clear(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = '';
  }

  // Public API
  return {
    showScreen,
    renderRoundIndicator,
    createConfetti,
    calculateStars,
    getStarsDisplay,
    displayStars,
    shuffle,
    randomItem,
    randomItems,
    addTempClass,
    setText,
    setHtml,
    clear
  };
})();

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}
