/**
 * Syllable Lesson Module
 * Handles the interactive syllable learning experience:
 * 1. Sound blending intro (see sounds combine)
 * 2. Practice blending (interactive)
 * 3. Word example (see syllable in context)
 * 4. Celebration
 */

class SyllableLesson {
  constructor() {
    this.currentSyllable = null;
    this.currentSyllableData = null;
    this.currentPhase = 'intro'; // intro, blend, word, complete
    this.managers = null;
  }

  setManagers(managers) {
    this.managers = managers;
  }

  /**
   * Start a lesson for a specific syllable
   */
  start(syllable) {
    this.currentSyllable = syllable;
    this.currentSyllableData = SyllableData.getSyllableData(syllable);
    this.currentPhase = 'intro';

    if (!this.currentSyllableData) {
      console.error('Syllable not found:', syllable);
      return;
    }

    this.showIntroPhase();
  }

  /**
   * Phase 1: Sound blending intro
   */
  showIntroPhase() {
    this.currentPhase = 'intro';
    const data = this.currentSyllableData;

    const letterDisplay = document.getElementById('syllable-lesson-display');
    const phaseIndicator = document.getElementById('syllable-lesson-phase');
    const content = document.getElementById('syllable-lesson-content');

    if (letterDisplay) {
      // Show sounds that will blend
      const soundsHtml = data.sounds.map((s, i) =>
        `<span class="blend-sound" style="animation-delay: ${i * 0.3}s">${s}</span>`
      ).join('<span class="blend-plus">+</span>');

      letterDisplay.innerHTML = `
        <div class="blend-equation">
          ${soundsHtml}
          <span class="blend-equals">=</span>
          <span class="blend-result">${data.syllable.replace('-', '')}</span>
        </div>
      `;
      letterDisplay.className = 'syllable-display-blend';
    }

    if (phaseIndicator) {
      phaseIndicator.innerHTML = '<span class="phase-dot active"></span><span class="phase-dot"></span><span class="phase-dot"></span>';
    }

    if (content) {
      content.innerHTML = `
        <div class="syllable-hint">${data.hint}</div>
        <button class="lesson-sound-btn" onclick="syllableLesson.playSyllableSound()">
          <span class="sound-icon">🔊</span>
          <span>Чуй сричката</span>
        </button>
        <button class="lesson-next-btn" onclick="syllableLesson.nextPhase()">
          <span>Напред</span>
          <span class="arrow">→</span>
        </button>
      `;
    }

    // Show screen
    if (this.managers && this.managers.ui) {
      this.managers.ui.showScreen('syllable-lesson-screen');
    } else if (typeof UIManager !== 'undefined') {
      UIManager.showScreen('syllable-lesson-screen');
    }

    // Auto-play after delay
    setTimeout(() => this.playSyllableSound(), 600);
  }

  /**
   * Phase 2: Interactive blending practice
   */
  showBlendPhase() {
    this.currentPhase = 'blend';
    const data = this.currentSyllableData;

    const letterDisplay = document.getElementById('syllable-lesson-display');
    const phaseIndicator = document.getElementById('syllable-lesson-phase');
    const content = document.getElementById('syllable-lesson-content');

    if (letterDisplay) {
      // Interactive blend buttons
      const soundsHtml = data.sounds.map((s, i) =>
        `<button class="blend-tap-btn" onclick="syllableLesson.playSound(${i})" data-index="${i}">${s}</button>`
      ).join('');

      letterDisplay.innerHTML = `
        <div class="blend-interactive">
          <div class="blend-instruction">Натисни звуците!</div>
          <div class="blend-buttons">${soundsHtml}</div>
          <div class="blend-target">
            <span class="target-arrow">→</span>
            <button class="blend-result-btn" onclick="syllableLesson.playFullSyllable()">${data.syllable.replace('-', '')}</button>
          </div>
        </div>
      `;
      letterDisplay.className = 'syllable-display-interactive';
    }

    if (phaseIndicator) {
      phaseIndicator.innerHTML = '<span class="phase-dot completed"></span><span class="phase-dot active"></span><span class="phase-dot"></span>';
    }

    if (content) {
      content.innerHTML = `
        <div class="blend-progress">
          <div class="progress-text">Натисни всеки звук, после цялата сричка!</div>
        </div>
        <button class="lesson-next-btn" onclick="syllableLesson.nextPhase()">
          <span>Виж в дума</span>
          <span class="arrow">→</span>
        </button>
      `;
    }
  }

  /**
   * Phase 3: Word example
   */
  showWordPhase() {
    this.currentPhase = 'word';
    const data = this.currentSyllableData;

    const letterDisplay = document.getElementById('syllable-lesson-display');
    const phaseIndicator = document.getElementById('syllable-lesson-phase');
    const content = document.getElementById('syllable-lesson-content');

    if (letterDisplay) {
      letterDisplay.innerHTML = `
        <div class="syllable-word-display">
          <div class="word-emoji animate-pop">${data.wordEmoji}</div>
          <div class="word-text">${data.word}</div>
          <div class="word-syllable-highlight">${data.syllable.replace('-', '')}</div>
        </div>
      `;
      letterDisplay.className = 'syllable-display-word';
    }

    if (phaseIndicator) {
      phaseIndicator.innerHTML = '<span class="phase-dot completed"></span><span class="phase-dot completed"></span><span class="phase-dot active"></span>';
    }

    if (content) {
      content.innerHTML = `
        <div class="word-explanation">
          Сричката <strong>${data.syllable.replace('-', '')}</strong> е в думата <strong>${data.word}</strong>!
        </div>
        <button class="lesson-sound-btn" onclick="syllableLesson.playWordSound()">
          <span class="sound-icon">🔊</span>
          <span>Чуй думата</span>
        </button>
        <button class="lesson-next-btn" onclick="syllableLesson.nextPhase()">
          <span>Готово!</span>
          <span class="arrow">⭐</span>
        </button>
      `;
    }

    // Play word sound
    setTimeout(() => this.playWordSound(), 400);
  }

  /**
   * Phase 4: Completion
   */
  showCompletePhase() {
    this.currentPhase = 'complete';
    const data = this.currentSyllableData;

    const letterDisplay = document.getElementById('syllable-lesson-display');
    const phaseIndicator = document.getElementById('syllable-lesson-phase');
    const content = document.getElementById('syllable-lesson-content');

    if (letterDisplay) {
      letterDisplay.innerHTML = `
        <div class="syllable-complete-display">
          <div class="complete-syllable animate-celebrate">${data.syllable.replace('-', '')}</div>
          <div class="complete-emoji">${data.wordEmoji}</div>
        </div>
      `;
      letterDisplay.className = 'syllable-display-complete';
    }

    if (phaseIndicator) {
      phaseIndicator.innerHTML = '<span class="phase-dot completed"></span><span class="phase-dot completed"></span><span class="phase-dot completed"></span>';
    }

    if (content) {
      content.innerHTML = `
        <div class="complete-message">
          <div class="stars-row">⭐ ⭐ ⭐</div>
          <div class="complete-text">Браво!</div>
          <div class="complete-subtext">Научи сричката ${data.syllable.replace('-', '')}!</div>
        </div>
        <div class="complete-actions">
          <button class="lesson-action-btn primary" onclick="syllableLesson.goToNextSyllable()">
            <span>Следваща сричка</span>
            <span class="arrow">→</span>
          </button>
          <button class="lesson-action-btn secondary" onclick="syllableLesson.repeatLesson()">
            <span>🔄</span> Повтори
          </button>
          <button class="lesson-action-btn secondary" onclick="showSyllableLessonSelect()">
            <span>📚</span> Всички срички
          </button>
        </div>
      `;
    }

    // Save progress
    this.saveProgress();

    // Celebration
    if (this.managers && this.managers.ui) {
      this.managers.ui.createConfetti(20);
    } else if (typeof UIManager !== 'undefined') {
      UIManager.createConfetti(20);
    }

    this.playCelebration();
  }

  /**
   * Move to next phase
   */
  nextPhase() {
    switch (this.currentPhase) {
      case 'intro':
        this.showBlendPhase();
        break;
      case 'blend':
        this.showWordPhase();
        break;
      case 'word':
        this.showCompletePhase();
        break;
      case 'complete':
        this.goToNextSyllable();
        break;
    }
  }

  /**
   * Go to next syllable
   */
  goToNextSyllable() {
    const allSyllables = SyllableData.getAllSyllablesInOrder();
    const currentIndex = allSyllables.indexOf(this.currentSyllable);

    if (currentIndex < allSyllables.length - 1) {
      this.start(allSyllables[currentIndex + 1]);
    } else {
      // Completed all syllables
      showSyllableLessonSelect();
    }
  }

  /**
   * Repeat current lesson
   */
  repeatLesson() {
    this.start(this.currentSyllable);
  }

  /**
   * Play individual sound
   */
  playSound(index) {
    const data = this.currentSyllableData;
    const sound = data.sounds[index];

    // Highlight the button
    const btn = document.querySelector(`.blend-tap-btn[data-index="${index}"]`);
    if (btn) {
      btn.classList.add('playing');
      setTimeout(() => btn.classList.remove('playing'), 300);
    }

    // Speak the sound
    if (this.managers && this.managers.audio) {
      this.managers.audio.speak(sound, { rate: 0.7 });
    } else if (typeof AudioManager !== 'undefined') {
      AudioManager.speak(sound, { rate: 0.7 });
    }
  }

  /**
   * Play full syllable
   */
  playFullSyllable() {
    const data = this.currentSyllableData;
    const syllable = data.syllable.replace('-', '');

    // Highlight result button
    const btn = document.querySelector('.blend-result-btn');
    if (btn) {
      btn.classList.add('playing');
      setTimeout(() => btn.classList.remove('playing'), 500);
    }

    if (this.managers && this.managers.audio) {
      this.managers.audio.speak(syllable, { rate: 0.8 });
    } else if (typeof AudioManager !== 'undefined') {
      AudioManager.speak(syllable, { rate: 0.8 });
    }
  }

  /**
   * Play syllable sound (intro)
   */
  playSyllableSound() {
    const data = this.currentSyllableData;
    const syllable = data.syllable.replace('-', '');

    if (this.managers && this.managers.audio) {
      this.managers.audio.speak(syllable, { rate: 0.7 });
    } else if (typeof AudioManager !== 'undefined') {
      AudioManager.speak(syllable, { rate: 0.7 });
    }
  }

  /**
   * Play word sound
   */
  playWordSound() {
    const data = this.currentSyllableData;

    if (this.managers && this.managers.audio) {
      this.managers.audio.speak(data.word);
    } else if (typeof AudioManager !== 'undefined') {
      AudioManager.speak(data.word);
    }
  }

  /**
   * Play celebration
   */
  playCelebration() {
    if (this.managers && this.managers.audio) {
      this.managers.audio.playFeedback('correct');
    } else if (typeof AudioManager !== 'undefined') {
      AudioManager.playFeedback('correct');
    }
  }

  /**
   * Save progress
   */
  saveProgress() {
    const progressKey = 'bgTutorSyllableProgress';
    let progress = {};

    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        progress = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load syllable progress');
    }

    progress[this.currentSyllable] = {
      completed: true,
      completedAt: Date.now(),
      attempts: (progress[this.currentSyllable]?.attempts || 0) + 1
    };

    try {
      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (e) {
      console.warn('Could not save syllable progress');
    }
  }

  /**
   * Get syllable progress
   */
  static getProgress() {
    const progressKey = 'bgTutorSyllableProgress';
    try {
      const saved = localStorage.getItem(progressKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }
}

// Create global instance
const syllableLesson = new SyllableLesson();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SyllableLesson, syllableLesson };
}
