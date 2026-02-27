/**
 * Audio Manager Module
 * Handles all audio playback with queuing, speech synthesis fallback, and Bulgarian transliteration
 */

const AudioManager = (function() {
  // Configuration (will be set via init)
  let config = {
    basePath: 'audio/',
    wordsPath: 'audio/words/',
    gamesPath: 'audio/games/',
    phonicsPath: 'audio/phonics/',
    feedback: {
      correct: 'bravo.mp3',
      incorrect: 'try-again.mp3'
    }
  };

  // Transliteration map for Bulgarian to Latin
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
    'ю': 'yu', 'я': 'ya'
  };

  // Audio queue state
  let audioQueue = [];
  let currentAudio = null;
  let isPlayingAudio = false;

  // Speech synthesis
  let bulgarianVoice = null;
  let gameData = null; // Reference to game data for speech fallback

  /**
   * Initialize the audio manager
   * @param {Object} audioConfig - Configuration from config.json
   * @param {Object} data - Game data reference for speech fallback
   */
  function init(audioConfig, data) {
    if (audioConfig) {
      config = { ...config, ...audioConfig };
    }
    gameData = data;
    initVoices();
  }

  /**
   * Initialize speech synthesis voices
   */
  function initVoices() {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        bulgarianVoice = voices.find(v => v.lang.startsWith('bg')) ||
                         voices.find(v => v.lang.includes('BG')) ||
                         null;
      };
      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }

  /**
   * Transliterate Bulgarian text to Latin for audio filenames
   * @param {string} text - Bulgarian text
   * @returns {string} Latin transliteration
   */
  function bgToLatin(text) {
    return text.toLowerCase().split('').map(c => translitMap[c] || c).join('');
  }

  /**
   * Get speech text for fallback when audio fails
   * @param {string} audioFile - The audio filename
   * @returns {string|null} Text to speak or null
   */
  function getSpeechText(audioFile) {
    if (!gameData) return null;

    // Check letters for instruction audio
    if (gameData.letters) {
      for (const letter of Object.keys(gameData.letters)) {
        const letterData = gameData.letters[letter];
        if (letterData.audioFile === audioFile) {
          return letterData.instructionText;
        }
      }
    }

    // Check feedback
    if (gameData.feedback) {
      if (gameData.feedback.correct.file === audioFile) {
        return gameData.feedback.correct.text;
      }
      if (gameData.feedback.incorrect.file === audioFile) {
        return gameData.feedback.incorrect.text;
      }
    }

    // Check words
    if (gameData.words) {
      const word = gameData.words.find(w => w.audioFile === audioFile);
      if (word) return word.word;
    }

    return null;
  }

  /**
   * Speak text using speech synthesis
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options (rate, pitch)
   */
  function speak(text, options = {}) {
    if (!('speechSynthesis' in window)) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bg-BG';
    utterance.rate = options.rate || 0.85;
    utterance.pitch = options.pitch || 1.1;

    if (bulgarianVoice) {
      utterance.voice = bulgarianVoice;
    }

    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, 50);
  }

  /**
   * Speak a syllable (slower for learning)
   */
  function speakSyllable(syllable) {
    speak(syllable, { rate: 0.7, pitch: 1.2 });
  }

  /**
   * Speak a letter (very slow for learning)
   */
  function speakLetter(letter) {
    speak(letter, { rate: 0.6, pitch: 1.2 });
  }

  /**
   * Process the audio queue
   */
  function processQueue() {
    if (isPlayingAudio || audioQueue.length === 0) return;

    isPlayingAudio = true;
    const { file, basePath, resolve } = audioQueue.shift();

    currentAudio = new Audio(basePath + file);

    currentAudio.onended = () => {
      isPlayingAudio = false;
      currentAudio = null;
      if (resolve) resolve();
      processQueue();
    };

    currentAudio.onerror = () => {
      const text = getSpeechText(file);
      if (text) speak(text);
      isPlayingAudio = false;
      currentAudio = null;
      if (resolve) resolve();
      processQueue();
    };

    currentAudio.play().catch(e => {
      const text = getSpeechText(file);
      if (text) speak(text);
      isPlayingAudio = false;
      currentAudio = null;
      if (resolve) resolve();
      processQueue();
    });
  }

  /**
   * Play audio file (queued to prevent overlap)
   * @param {string} file - Audio filename
   * @param {string} basePath - Base path for audio
   * @returns {Promise} Resolves when audio finishes
   */
  function play(file, basePath) {
    basePath = basePath || config.basePath;
    return new Promise((resolve) => {
      audioQueue.push({ file, basePath, resolve });
      processQueue();
    });
  }

  /**
   * Play audio immediately, stopping current audio
   * @param {string} file - Audio filename
   * @param {string} basePath - Base path for audio
   * @returns {Audio} The audio element (for tracking)
   */
  function playNow(file, basePath) {
    basePath = basePath || config.basePath;

    // Stop current audio and clear queue
    stop();

    // Play immediately
    const audio = new Audio(basePath + file);
    currentAudio = audio;
    isPlayingAudio = true;

    audio.onended = () => {
      isPlayingAudio = false;
      currentAudio = null;
      processQueue();
    };

    audio.onerror = () => {
      console.error('Audio load error:', { file, path: basePath + file });
      isPlayingAudio = false;
      currentAudio = null;
      processQueue();
    };

    audio.play().catch(e => {
      console.error('Audio playback failed:', { file, error: e.message });
      const text = getSpeechText(file);
      if (text) speak(text);
      isPlayingAudio = false;
      currentAudio = null;
      processQueue();
    });

    return audio;
  }

  /**
   * Stop current audio and clear queue
   */
  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    audioQueue = [];
    isPlayingAudio = false;
  }

  /**
   * Play feedback sound (correct/incorrect)
   * @param {string} type - 'correct' or 'incorrect'
   */
  function playFeedback(type) {
    const file = config.feedback[type];
    if (file) {
      return play(file, config.basePath);
    }
  }

  /**
   * Play word audio from games folder
   * @param {string} word - Bulgarian word
   * @param {boolean} immediate - Play immediately (true) or queued (false)
   */
  function playGameWord(word, immediate = false) {
    const filename = 'word_' + bgToLatin(word) + '.mp3';
    return immediate ? playNow(filename, config.gamesPath) : play(filename, config.gamesPath);
  }

  /**
   * Play syllable audio from games folder
   * @param {string} syllable - Bulgarian syllable
   * @param {boolean} immediate - Play immediately or queued
   */
  function playGameSyllable(syllable, immediate = false) {
    const filename = 'syl_' + bgToLatin(syllable) + '.mp3';
    return immediate ? playNow(filename, config.gamesPath) : play(filename, config.gamesPath);
  }

  /**
   * Play letter audio from games folder
   * @param {string} letter - Bulgarian letter
   * @param {boolean} immediate - Play immediately or queued
   */
  function playGameLetter(letter, immediate = false) {
    const filename = 'letter_' + bgToLatin(letter.toLowerCase()) + '.mp3';

    // Pre-check audio viability; fall back to speech if file is too short
    const testAudio = new Audio(config.gamesPath + filename);
    testAudio.addEventListener('loadedmetadata', function() {
      if (testAudio.duration < 0.3) {
        stop();
        speakLetter(letter);
      }
    });
    testAudio.addEventListener('error', function() {
      speakLetter(letter);
    });

    return immediate ? playNow(filename, config.gamesPath) : play(filename, config.gamesPath);
  }

  /**
   * Play game title and instruction audio
   * @param {string} gameId - Game identifier
   */
  function playGameTitle(gameId) {
    const sanitizedId = gameId.replace(/-/g, '');
    const titleFile = 'game_game' + sanitizedId + '.mp3';
    const instrFile = 'game_game' + sanitizedId + 'instr.mp3';
    playNow(titleFile, config.gamesPath);

    // Check instruction file exists before queuing
    const test = new Audio(config.gamesPath + instrFile);
    test.oncanplaythrough = () => play(instrFile, config.gamesPath);
    test.onerror = () => {}; // Skip silently if missing
  }

  /**
   * Play letter sound from words.json data
   * @param {string} letter - Letter to play
   */
  function playLetterSound(letter) {
    if (!gameData || !gameData.letters) return;
    const upperLetter = letter.toUpperCase();
    const letterData = gameData.letters[upperLetter];
    if (letterData && letterData.audioFile) {
      play(letterData.audioFile, config.phonicsPath);
    } else {
      speak(letter);
    }
  }

  // Public API
  return {
    init,
    bgToLatin,
    play,
    playNow,
    stop,
    playFeedback,
    playGameWord,
    playGameSyllable,
    playGameLetter,
    playGameTitle,
    playLetterSound,
    speak,
    speakSyllable,
    speakLetter,
    // Expose config paths for compatibility
    get basePath() { return config.basePath; },
    get wordsPath() { return config.wordsPath; },
    get gamesPath() { return config.gamesPath; },
    get phonicsPath() { return config.phonicsPath; }
  };
})();

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
