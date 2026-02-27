/**
 * Letter Lesson Module
 * Handles the interactive letter learning experience:
 * 1. Animated letter intro with sound
 * 2. Character/object reveal with word
 * 3. Tracing practice with feedback
 */

class LetterLesson {
  constructor() {
    this.currentLetter = null;
    this.currentPhase = 'intro'; // intro, character, trace, complete
    this.managers = null;
    this.traceCanvas = null;
    this.traceCtx = null;
    this.isDrawing = false;
    this.lastPoint = null;
    this.strokeCount = 0;
    this.traceProgress = 0;
  }

  setManagers(managers) {
    this.managers = managers;
  }

  /**
   * Start a lesson for a specific letter
   */
  start(letter) {
    this.currentLetter = letter;
    this.currentPhase = 'intro';
    this.strokeCount = 0;
    this.traceProgress = 0;

    // Get letter data
    const letterData = LessonData.letters[letter];
    if (!letterData) {
      console.error('Letter not found:', letter);
      return;
    }

    this.showIntroPhase(letter, letterData);
  }

  /**
   * Phase 1: Animated letter intro
   */
  showIntroPhase(letter, letterData) {
    this.currentPhase = 'intro';
    const screen = document.getElementById('lesson-screen');
    if (!screen) return;

    // Update screen content
    const letterDisplay = document.getElementById('lesson-letter-display');
    const phaseIndicator = document.getElementById('lesson-phase');
    const content = document.getElementById('lesson-content');

    if (letterDisplay) {
      letterDisplay.textContent = letter;
      letterDisplay.className = `lesson-letter-large animate-${letterData.animation || 'bounce'}`;
    }

    if (phaseIndicator) {
      phaseIndicator.innerHTML = '<span class="phase-dot active"></span><span class="phase-dot"></span><span class="phase-dot"></span>';
    }

    if (content) {
      content.innerHTML = `
        <div class="intro-hint">${letterData.hint}</div>
        <button class="lesson-sound-btn" onclick="letterLesson.playLetterSound()">
          <span class="sound-icon">🔊</span>
          <span>Чуй звука</span>
        </button>
        <button class="lesson-next-btn" onclick="letterLesson.nextPhase()">
          <span>Напред</span>
          <span class="arrow">→</span>
        </button>
      `;
    }

    // Show screen
    if (this.managers && this.managers.ui) {
      this.managers.ui.showScreen('lesson-screen');
    } else {
      UIManager.showScreen('lesson-screen');
    }

    // Auto-play sound after a short delay
    setTimeout(() => this.playLetterSound(), 500);
  }

  /**
   * Phase 2: Character reveal
   */
  showCharacterPhase() {
    this.currentPhase = 'character';
    const letterData = LessonData.letters[this.currentLetter];
    if (!letterData) return;

    const letterDisplay = document.getElementById('lesson-letter-display');
    const phaseIndicator = document.getElementById('lesson-phase');
    const content = document.getElementById('lesson-content');

    if (letterDisplay) {
      letterDisplay.innerHTML = `
        <span class="lesson-letter-small">${this.currentLetter}</span>
        <span class="lesson-character animate-pop">${letterData.character}</span>
      `;
      letterDisplay.className = 'lesson-letter-with-character';
    }

    if (phaseIndicator) {
      phaseIndicator.innerHTML = '<span class="phase-dot completed"></span><span class="phase-dot active"></span><span class="phase-dot"></span>';
    }

    if (content) {
      content.innerHTML = `
        <div class="character-word">
          <span class="word-text">${letterData.word}</span>
        </div>
        <div class="character-fact">${letterData.funFact}</div>
        <button class="lesson-sound-btn" onclick="letterLesson.playWordSound()">
          <span class="sound-icon">🔊</span>
          <span>Чуй думата</span>
        </button>
        <button class="lesson-next-btn" onclick="letterLesson.nextPhase()">
          <span>Опитай да напишеш</span>
          <span class="arrow">✏️</span>
        </button>
      `;
    }

    // Play word sound
    setTimeout(() => this.playWordSound(), 300);
  }

  /**
   * Phase 3: Tracing practice
   */
  showTracePhase() {
    this.currentPhase = 'trace';
    const letterData = LessonData.letters[this.currentLetter];
    if (!letterData) return;

    const letterDisplay = document.getElementById('lesson-letter-display');
    const phaseIndicator = document.getElementById('lesson-phase');
    const content = document.getElementById('lesson-content');

    if (letterDisplay) {
      letterDisplay.innerHTML = '';
      letterDisplay.className = 'lesson-letter-hidden';
    }

    if (phaseIndicator) {
      phaseIndicator.innerHTML = '<span class="phase-dot completed"></span><span class="phase-dot completed"></span><span class="phase-dot active"></span>';
    }

    if (content) {
      content.innerHTML = `
        <div class="trace-instruction">Начертай буквата ${this.currentLetter}</div>
        <div class="trace-container">
          <canvas id="trace-canvas" width="250" height="250"></canvas>
          <div class="trace-guide">${this.currentLetter}</div>
        </div>
        <div class="trace-controls">
          <button class="trace-clear-btn" onclick="letterLesson.clearTrace()">
            <span>🗑️</span> Изчисти
          </button>
          <button class="trace-done-btn" onclick="letterLesson.checkTrace()">
            <span>✓</span> Готово
          </button>
        </div>
        <div class="trace-progress">
          <div class="progress-bar">
            <div class="progress-fill" id="trace-progress-fill" style="width: 0%"></div>
          </div>
        </div>
      `;
    }

    // Initialize canvas
    setTimeout(() => this.initTraceCanvas(), 100);
  }

  /**
   * Initialize tracing canvas
   */
  initTraceCanvas() {
    this.traceCanvas = document.getElementById('trace-canvas');
    if (!this.traceCanvas) return;

    this.traceCtx = this.traceCanvas.getContext('2d');

    // Set up drawing style
    this.traceCtx.strokeStyle = '#4ECDC4';
    this.traceCtx.lineWidth = 12;
    this.traceCtx.lineCap = 'round';
    this.traceCtx.lineJoin = 'round';

    // Touch events
    this.traceCanvas.addEventListener('touchstart', (e) => this.startDraw(e), { passive: false });
    this.traceCanvas.addEventListener('touchmove', (e) => this.draw(e), { passive: false });
    this.traceCanvas.addEventListener('touchend', () => this.endDraw());

    // Mouse events (for testing)
    this.traceCanvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.traceCanvas.addEventListener('mousemove', (e) => this.draw(e));
    this.traceCanvas.addEventListener('mouseup', () => this.endDraw());
    this.traceCanvas.addEventListener('mouseleave', () => this.endDraw());
  }

  /**
   * Get coordinates from event
   */
  getCoords(e) {
    const rect = this.traceCanvas.getBoundingClientRect();
    const scaleX = this.traceCanvas.width / rect.width;
    const scaleY = this.traceCanvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  /**
   * Start drawing
   */
  startDraw(e) {
    e.preventDefault();
    this.isDrawing = true;
    this.lastPoint = this.getCoords(e);
    this.strokeCount++;
  }

  /**
   * Continue drawing
   */
  draw(e) {
    if (!this.isDrawing) return;
    e.preventDefault();

    const currentPoint = this.getCoords(e);

    this.traceCtx.beginPath();
    this.traceCtx.moveTo(this.lastPoint.x, this.lastPoint.y);
    this.traceCtx.lineTo(currentPoint.x, currentPoint.y);
    this.traceCtx.stroke();

    this.lastPoint = currentPoint;
    this.updateTraceProgress();
  }

  /**
   * End drawing
   */
  endDraw() {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  /**
   * Update trace progress indicator
   */
  updateTraceProgress() {
    // Simple progress based on strokes
    const minStrokes = 2;
    const maxStrokes = 8;
    this.traceProgress = Math.min(100, (this.strokeCount / maxStrokes) * 100);

    const fill = document.getElementById('trace-progress-fill');
    if (fill) {
      fill.style.width = `${this.traceProgress}%`;
    }
  }

  /**
   * Clear the trace canvas
   */
  clearTrace() {
    if (this.traceCtx) {
      this.traceCtx.clearRect(0, 0, this.traceCanvas.width, this.traceCanvas.height);
    }
    this.strokeCount = 0;
    this.traceProgress = 0;
    this.updateTraceProgress();
  }

  /**
   * Check trace and complete lesson
   */
  checkTrace() {
    // For toddlers, any attempt is good! Always positive feedback
    if (this.strokeCount > 0) {
      this.showCompletePhase(true);
    } else {
      // Encourage them to try
      this.playEncouragement();
    }
  }

  /**
   * Phase 4: Completion celebration
   */
  showCompletePhase(success) {
    this.currentPhase = 'complete';
    const letterData = LessonData.letters[this.currentLetter];

    const letterDisplay = document.getElementById('lesson-letter-display');
    const phaseIndicator = document.getElementById('lesson-phase');
    const content = document.getElementById('lesson-content');

    if (letterDisplay) {
      letterDisplay.innerHTML = `
        <span class="complete-letter animate-celebrate">${this.currentLetter}</span>
        <span class="complete-character">${letterData.character}</span>
      `;
      letterDisplay.className = 'lesson-letter-complete';
    }

    if (phaseIndicator) {
      phaseIndicator.innerHTML = '<span class="phase-dot completed"></span><span class="phase-dot completed"></span><span class="phase-dot completed"></span>';
    }

    if (content) {
      content.innerHTML = `
        <div class="complete-message">
          <div class="stars-row">⭐ ⭐ ⭐</div>
          <div class="complete-text">Браво!</div>
          <div class="complete-subtext">Научи буквата ${this.currentLetter}!</div>
        </div>
        <div class="complete-actions">
          <button class="lesson-action-btn primary" onclick="letterLesson.goToNextLetter()">
            <span>Следваща буква</span>
            <span class="arrow">→</span>
          </button>
          <button class="lesson-action-btn secondary" onclick="letterLesson.repeatLesson()">
            <span>🔄</span> Повтори
          </button>
          <button class="lesson-action-btn secondary" onclick="showLessonSelect()">
            <span>📚</span> Всички букви
          </button>
        </div>
      `;
    }

    // Save progress
    this.saveProgress();

    // Celebration effects
    if (this.managers && this.managers.ui) {
      this.managers.ui.createConfetti(20);
    } else if (typeof UIManager !== 'undefined') {
      UIManager.createConfetti(20);
    }

    // Play celebration sound
    this.playCelebration();
  }

  /**
   * Move to next phase
   */
  nextPhase() {
    switch (this.currentPhase) {
      case 'intro':
        this.showCharacterPhase();
        break;
      case 'character':
        this.showTracePhase();
        break;
      case 'trace':
        this.checkTrace();
        break;
      case 'complete':
        this.goToNextLetter();
        break;
    }
  }

  /**
   * Go to next letter in sequence
   */
  goToNextLetter() {
    const allLetters = LessonData.getAllLettersInOrder();
    const currentIndex = allLetters.indexOf(this.currentLetter);

    if (currentIndex < allLetters.length - 1) {
      this.start(allLetters[currentIndex + 1]);
    } else {
      // Completed all letters!
      showLessonSelect();
    }
  }

  /**
   * Repeat current lesson
   */
  repeatLesson() {
    this.start(this.currentLetter);
  }

  /**
   * Audio: Play letter sound
   */
  playLetterSound() {
    const letterData = LessonData.letters[this.currentLetter];
    if (this.managers && this.managers.audio) {
      // Try to play from audio files first
      this.managers.audio.playGameLetter(this.currentLetter);
    } else if (typeof AudioManager !== 'undefined') {
      AudioManager.playGameLetter(this.currentLetter);
    }
  }

  /**
   * Audio: Play word sound
   */
  playWordSound() {
    const letterData = LessonData.letters[this.currentLetter];
    if (letterData && letterData.word) {
      if (this.managers && this.managers.audio) {
        this.managers.audio.speak(letterData.word);
      } else if (typeof AudioManager !== 'undefined') {
        AudioManager.speak(letterData.word);
      }
    }
  }

  /**
   * Audio: Encouragement to try tracing
   */
  playEncouragement() {
    const phrases = ['Опитай!', 'Начертай буквата!', 'Можеш!'];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    if (this.managers && this.managers.audio) {
      this.managers.audio.speak(phrase);
    } else if (typeof AudioManager !== 'undefined') {
      AudioManager.speak(phrase);
    }
  }

  /**
   * Audio: Celebration
   */
  playCelebration() {
    if (this.managers && this.managers.audio) {
      this.managers.audio.playFeedback('correct');
    } else if (typeof AudioManager !== 'undefined') {
      AudioManager.playFeedback('correct');
    }
  }

  /**
   * Save lesson progress
   */
  saveProgress() {
    const progressKey = 'bgTutorLessonProgress';
    let progress = {};

    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        progress = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load lesson progress');
    }

    progress[this.currentLetter] = {
      completed: true,
      completedAt: Date.now(),
      attempts: (progress[this.currentLetter]?.attempts || 0) + 1
    };

    try {
      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (e) {
      console.warn('Could not save lesson progress');
    }
  }

  /**
   * Get lesson progress
   */
  static getProgress() {
    const progressKey = 'bgTutorLessonProgress';
    try {
      const saved = localStorage.getItem(progressKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }
}

// Create global instance
const letterLesson = new LetterLesson();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LetterLesson, letterLesson };
}
