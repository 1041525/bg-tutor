/**
 * Character Manager — Софи и Криси
 * Manages character states, messages, and game assignments
 */
const CharacterManager = (function() {

  const characters = {
    sofi: {
      name: 'Софи',
      emoji: '👸',
      imagePath: 'images/characters/sofi/',
      images: {
        default: null,  // sofi.png — set when user provides
        happy: null,     // sofi-happy.png
        wave: null       // sofi-wave.png
      },
      color: '#FF69B4',
      colorLight: '#FFB3D9',
      cssClass: 'sofi'
    },
    krisi: {
      name: 'Криси',
      emoji: '👦',
      imagePath: 'images/characters/krisi/',
      images: {
        default: null,
        happy: null,
        wave: null
      },
      color: '#4A90D9',
      colorLight: '#A8D1F0',
      cssClass: 'krisi'
    }
  };

  // Which character guides which game
  const gameAssignments = {
    phonics:    'sofi',
    vocab:      'sofi',
    bubble:     'krisi',
    dragdrop:   'sofi',
    train:      'krisi',
    buildWord:  'krisi',
    sorting:    'sofi',
    puzzle:     'krisi',
    // Lessons
    letterLesson:   'sofi',
    syllableLesson: 'krisi'
  };

  // Messages in Bulgarian
  const messages = {
    sofi: {
      welcome: 'Хайде да играем!',
      correct: [
        'Браво! Супер си!',
        'Страхотно! Ти си умница!',
        'Уау, вярно!',
        'Точно така!'
      ],
      incorrect: [
        'Опитай пак, можеш!',
        'Хайде, опитай пак!',
        'Почти! Опитай пак!'
      ],
      perfect: [
        'Перфектно! Ти си звезда!',
        'Ура! Три звезди!',
        'Принцеса на звуците!'
      ],
      good: [
        'Много добре!',
        'Браво! Продължавай!',
        'Супер се справяш!'
      ],
      encourage: [
        'Хайде, следващия път ще е по-добре!',
        'Опитай пак, ще се справиш!',
        'Не се отказвай!'
      ]
    },
    krisi: {
      welcome: 'Чу-чу! Да тръгваме!',
      correct: [
        'Ура! Супер!',
        'Браво! Вярно!',
        'Уау, браво!',
        'Точно!'
      ],
      incorrect: [
        'Пробвай пак!',
        'Хайде, пак!',
        'Опа, опитай пак!'
      ],
      perfect: [
        'Ура! Ти си шампион!',
        'Три звезди! Браво!',
        'Машинистът е доволен!'
      ],
      good: [
        'Браво! Добре!',
        'Много добре!',
        'Супер си!'
      ],
      encourage: [
        'Чу-чу! Опитай пак!',
        'Влакът вярва в теб!',
        'Хайде, опитай пак!'
      ]
    }
  };

  /**
   * Get the character assigned to a game
   */
  function getCharacterForGame(gameId) {
    return gameAssignments[gameId] || 'sofi';
  }

  /**
   * Get character data
   */
  function getCharacter(charId) {
    return characters[charId] || characters.sofi;
  }

  /**
   * Get display HTML for a character (image if available, emoji fallback)
   */
  function getAvatar(charId, state) {
    const char = characters[charId];
    if (!char) return '';

    state = state || 'default';
    const img = char.images[state];

    if (img) {
      return `<img src="${char.imagePath}${img}" alt="${char.name}">`;
    }
    return `<span class="char-emoji">${char.emoji}</span>`;
  }

  /**
   * Get a random message for a character and context
   */
  function getMessage(charId, type) {
    const charMessages = messages[charId] || messages.sofi;
    const pool = charMessages[type];

    if (!pool) return '';
    if (typeof pool === 'string') return pool;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Get a message based on star count
   */
  function getResultMessage(charId, stars) {
    if (stars >= 3) return getMessage(charId, 'perfect');
    if (stars >= 2) return getMessage(charId, 'good');
    return getMessage(charId, 'encourage');
  }

  /**
   * Set character images when user provides them
   */
  function setCharacterImages(charId, imageMap) {
    if (characters[charId]) {
      Object.assign(characters[charId].images, imageMap);
    }
  }

  /**
   * Check if real images are available for a character
   */
  function hasImages(charId) {
    const char = characters[charId];
    return char && char.images.default !== null;
  }

  return {
    getCharacterForGame,
    getCharacter,
    getAvatar,
    getMessage,
    getResultMessage,
    setCharacterImages,
    hasImages,
    characters
  };
})();
