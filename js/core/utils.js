/**
 * Shared Utilities Module
 * Common utility functions used across the application
 */

const Utils = (function() {
  /**
   * Bulgarian to Latin transliteration map
   */
  const TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
    'ю': 'yu', 'я': 'ya',
    // Uppercase variants
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'ZH',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
    'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
    'Х': 'H', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHT', 'Ъ': 'A', 'Ь': 'Y',
    'Ю': 'YU', 'Я': 'YA'
  };

  /**
   * Bulgarian vowels set
   */
  const BG_VOWELS = new Set(['А', 'Е', 'И', 'О', 'У', 'Ъ', 'Ю', 'Я', 'а', 'е', 'и', 'о', 'у', 'ъ', 'ю', 'я']);

  /**
   * Transliterate Bulgarian text to Latin
   * @param {string} text - Bulgarian text
   * @returns {string} Latin transliteration
   */
  function bgToLatin(text) {
    return text.split('').map(c => TRANSLIT_MAP[c] || c).join('');
  }

  /**
   * Transliterate Bulgarian text to Latin (lowercase)
   * @param {string} text - Bulgarian text
   * @returns {string} Lowercase Latin transliteration
   */
  function bgToLatinLower(text) {
    return text.toLowerCase().split('').map(c => TRANSLIT_MAP[c] || c).join('');
  }

  /**
   * Sanitize text to create safe filename
   * @param {string} text - Text to sanitize
   * @returns {string} Safe filename string
   */
  function sanitizeFilename(text) {
    return bgToLatinLower(text)
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/_+/g, '_');
  }

  /**
   * Check if a letter is a vowel
   * @param {string} letter - Single Bulgarian letter
   * @returns {boolean}
   */
  function isVowel(letter) {
    return BG_VOWELS.has(letter);
  }

  /**
   * Check if a letter is a consonant
   * @param {string} letter - Single Bulgarian letter
   * @returns {boolean}
   */
  function isConsonant(letter) {
    const upper = letter.toUpperCase();
    return !BG_VOWELS.has(upper) && TRANSLIT_MAP[letter.toLowerCase()];
  }

  /**
   * Shuffle an array (Fisher-Yates algorithm)
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled copy of the array
   */
  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Pick random items from an array
   * @param {Array} array - Source array
   * @param {number} count - Number of items to pick
   * @returns {Array} Array of random items
   */
  function pickRandom(array, count) {
    return shuffle(array).slice(0, count);
  }

  /**
   * Pick a single random item from an array
   * @param {Array} array - Source array
   * @returns {*} Random item from the array
   */
  function pickOne(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Adjust a hex color by a given amount
   * @param {string} hex - Hex color string (e.g., '#FF6B6B')
   * @param {number} amount - Amount to adjust (-255 to 255)
   * @returns {string} Adjusted hex color
   */
  function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }

  // Public API
  return {
    TRANSLIT_MAP,
    BG_VOWELS,
    bgToLatin,
    bgToLatinLower,
    sanitizeFilename,
    isVowel,
    isConsonant,
    shuffle,
    pickRandom,
    pickOne,
    adjustColor
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
