/**
 * Bulgarian Letter Lessons - Curriculum Data
 * Based on Bulgarian child pedagogy (Буквар tradition)
 *
 * Learning order designed for toddlers:
 * 1. Simple vowels (easy to pronounce in isolation)
 * 2. Sonorant consonants (can be sustained, combined with vowels)
 * 3. Voiceless stops (clear, distinct sounds)
 * 4. Voiced consonants (paired with voiceless for contrast)
 * 5. Fricatives and complex sounds
 * 6. Special letters (abstract concepts)
 */

const LessonData = {
  // Learning stages with pedagogical progression
  stages: [
    {
      id: 1,
      name: "Гласни звуци",
      description: "Научи гласните букви",
      letters: ["А", "О", "У", "Е", "И"],
      color: "#FF6B6B"
    },
    {
      id: 2,
      name: "Първи съгласни",
      description: "Лесни съгласни букви",
      letters: ["М", "Н", "Р", "Л"],
      color: "#4ECDC4"
    },
    {
      id: 3,
      name: "Тихи съгласни",
      description: "Беззвучни съгласни",
      letters: ["П", "Т", "К", "С", "Ф"],
      color: "#FFE66D"
    },
    {
      id: 4,
      name: "Звучни съгласни",
      description: "Звучни партньори",
      letters: ["Б", "Д", "Г", "В", "З"],
      color: "#95E1D3"
    },
    {
      id: 5,
      name: "Шушкави звуци",
      description: "Сложни съгласни",
      letters: ["Ж", "Ш", "Ч", "Ц", "Щ", "Х"],
      color: "#AA96DA"
    },
    {
      id: 6,
      name: "Специални букви",
      description: "Йотувани и особени",
      letters: ["Й", "Ю", "Я", "Ъ", "Ь"],
      color: "#F38181"
    }
  ],

  // Letter data with character, object, tracing hints
  letters: {
    // Stage 1: Vowels
    "А": {
      character: "🐑",
      word: "Агне",
      wordLower: "агне",
      sound: "а",
      hint: "Отвори широко уста!",
      tracePath: "M 50 180 L 100 20 L 150 180 M 70 120 L 130 120",
      funFact: "А е първата буква!",
      animation: "bounce"
    },
    "О": {
      character: "☁️",
      word: "Облак",
      wordLower: "облак",
      sound: "о",
      hint: "Устата ти става кръгла!",
      tracePath: "M 100 20 A 80 80 0 1 1 100 180 A 80 80 0 1 1 100 20",
      funFact: "О е кръгло като слънце!",
      animation: "float"
    },
    "У": {
      character: "🦆",
      word: "Утка",
      wordLower: "утка",
      sound: "у",
      hint: "Устните се свиват напред!",
      tracePath: "M 50 20 L 50 120 Q 100 200 150 120 L 150 20",
      funFact: "У прави устата като тръбичка!",
      animation: "waddle"
    },
    "Е": {
      character: "🦌",
      word: "Елен",
      wordLower: "елен",
      sound: "е",
      hint: "Усмихни се и кажи е!",
      tracePath: "M 150 20 L 50 20 L 50 180 L 150 180 M 50 100 L 120 100",
      funFact: "Е има три чертички!",
      animation: "prance"
    },
    "И": {
      character: "🧵",
      word: "Игла",
      wordLower: "игла",
      sound: "и",
      hint: "Усмихни се широко!",
      tracePath: "M 50 20 L 50 180 M 150 20 L 150 180 M 50 100 L 150 100",
      funFact: "И е като мост между две кули!",
      animation: "shine"
    },

    // Stage 2: Sonorant consonants
    "М": {
      character: "🐻",
      word: "Мечка",
      wordLower: "мечка",
      sound: "м",
      hint: "Затвори устните и кажи ммм!",
      tracePath: "M 30 180 L 30 20 L 100 120 L 170 20 L 170 180",
      funFact: "М е звукът, когато ядеш вкусно!",
      animation: "munch"
    },
    "Н": {
      character: "🌙",
      word: "Нощ",
      wordLower: "нощ",
      sound: "н",
      hint: "Езикът докосва зъбите!",
      tracePath: "M 50 180 L 50 20 L 150 180 L 150 20",
      funFact: "Н е като мостче за езика!",
      animation: "twinkle"
    },
    "Р": {
      character: "🐟",
      word: "Риба",
      wordLower: "риба",
      sound: "р",
      hint: "Езикът трепери - рррр!",
      tracePath: "M 50 180 L 50 20 L 130 20 Q 170 20 170 60 Q 170 100 130 100 L 50 100 L 150 180",
      funFact: "Р е буквата, която трепери!",
      animation: "swim"
    },
    "Л": {
      character: "🦁",
      word: "Лъв",
      wordLower: "лъв",
      sound: "л",
      hint: "Езикът се качва нагоре!",
      tracePath: "M 50 20 L 50 180 L 150 180",
      funFact: "Л е като крак на маса!",
      animation: "roar"
    },

    // Stage 3: Voiceless stops
    "П": {
      character: "🦋",
      word: "Пеперуда",
      wordLower: "пеперуда",
      sound: "п",
      hint: "Устните пукат - п!",
      tracePath: "M 50 180 L 50 20 L 130 20 Q 170 20 170 60 Q 170 100 130 100 L 50 100",
      funFact: "П е като балонче, което се пука!",
      animation: "flutter"
    },
    "Т": {
      character: "🐢",
      word: "Костенурка",
      wordLower: "костенурка",
      sound: "т",
      hint: "Езикът чука - т!",
      tracePath: "M 20 20 L 180 20 M 100 20 L 100 180",
      funFact: "Т е като чадър!",
      animation: "slow"
    },
    "К": {
      character: "🐈",
      word: "Котка",
      wordLower: "котка",
      sound: "к",
      hint: "Гърлото казва к!",
      tracePath: "M 50 20 L 50 180 M 150 20 L 50 100 L 150 180",
      funFact: "К е като котешка стъпка!",
      animation: "pounce"
    },
    "С": {
      character: "🐘",
      word: "Слон",
      wordLower: "слон",
      sound: "с",
      hint: "Зъбите близо - ссс!",
      tracePath: "M 150 40 Q 150 20 100 20 Q 50 20 50 60 Q 50 100 100 100 Q 150 100 150 140 Q 150 180 100 180 Q 50 180 50 160",
      funFact: "С съска като змия!",
      animation: "trumpet"
    },
    "Ф": {
      character: "📷",
      word: "Фотоапарат",
      wordLower: "фотоапарат",
      sound: "ф",
      hint: "Духни леко - ф!",
      tracePath: "M 50 20 L 150 20 M 50 20 L 50 180 M 50 100 L 120 100",
      funFact: "Ф е като да духаш свещичка!",
      animation: "flash"
    },

    // Stage 4: Voiced consonants
    "Б": {
      character: "🍌",
      word: "Банан",
      wordLower: "банан",
      sound: "б",
      hint: "Устните пукат силно - б!",
      tracePath: "M 50 20 L 50 180 M 50 20 L 120 20 Q 160 20 160 60 Q 160 100 120 100 L 50 100 M 50 100 L 130 100 Q 170 100 170 140 Q 170 180 130 180 L 50 180",
      funFact: "Б е голямото братче на П!",
      animation: "bounce"
    },
    "Д": {
      character: "🏠",
      word: "Дом",
      wordLower: "дом",
      sound: "д",
      hint: "Езикът чука силно - д!",
      tracePath: "M 50 20 L 50 180 L 120 180 Q 170 180 170 100 Q 170 20 120 20 L 50 20",
      funFact: "Д е голямото братче на Т!",
      animation: "build"
    },
    "Г": {
      character: "🍄",
      word: "Гъба",
      wordLower: "гъба",
      sound: "г",
      hint: "Гърлото казва силно г!",
      tracePath: "M 150 40 Q 150 20 100 20 Q 50 20 50 100 Q 50 180 100 180 Q 150 180 150 140 L 150 100 L 100 100",
      funFact: "Г е голямото братче на К!",
      animation: "grow"
    },
    "В": {
      character: "🐺",
      word: "Вълк",
      wordLower: "вълк",
      sound: "в",
      hint: "Зъбите докосват устната - в!",
      tracePath: "M 30 20 L 70 180 L 100 80 L 130 180 L 170 20",
      funFact: "В вие като вълк!",
      animation: "howl"
    },
    "З": {
      character: "🐰",
      word: "Заек",
      wordLower: "заек",
      sound: "з",
      hint: "Зъбите близо - ззз!",
      tracePath: "M 50 20 L 150 20 L 50 180 L 150 180",
      funFact: "З бръмчи като пчела!",
      animation: "hop"
    },

    // Stage 5: Fricatives and complex sounds
    "Ж": {
      character: "🐸",
      word: "Жаба",
      wordLower: "жаба",
      sound: "ж",
      hint: "Устата жужи - жжж!",
      tracePath: "M 50 20 L 150 20 L 100 100 L 150 180 L 50 180 M 100 100 L 100 180",
      funFact: "Ж жужи като бръмбар!",
      animation: "ribbit"
    },
    "Ш": {
      character: "🎈",
      word: "Балон",
      wordLower: "балон",
      sound: "ш",
      hint: "Устата шепне - шшш!",
      tracePath: "M 150 40 Q 150 20 100 20 Q 50 20 50 60 Q 50 100 100 100 Q 150 100 150 140 Q 150 180 100 180 Q 50 180 50 160",
      funFact: "Ш шепне тихо!",
      animation: "inflate"
    },
    "Ч": {
      character: "🕐",
      word: "Часовник",
      wordLower: "часовник",
      sound: "ч",
      hint: "Бързо - ч!",
      tracePath: "M 150 40 Q 150 20 100 20 Q 50 20 50 100 Q 50 180 100 180 Q 150 180 150 160",
      funFact: "Ч чука като влак - чух-чух!",
      animation: "tick"
    },
    "Ц": {
      character: "🌸",
      word: "Цвете",
      wordLower: "цвете",
      sound: "ц",
      hint: "Зъби заедно - ц!",
      tracePath: "M 150 40 Q 150 20 100 20 Q 50 20 50 100 Q 50 180 100 180 Q 150 180 150 160 M 150 140 L 150 200",
      funFact: "Ц е като малко пиленце - цип-цип!",
      animation: "bloom"
    },
    "Щ": {
      character: "🦔",
      word: "Щурец",
      wordLower: "щурец",
      sound: "щ",
      hint: "Шепни с т - щ!",
      tracePath: "M 150 40 Q 150 20 100 20 Q 50 20 50 60 Q 50 100 100 100 Q 150 100 150 140 Q 150 180 100 180 Q 50 180 50 160 M 100 180 L 100 200 M 130 180 L 130 200",
      funFact: "Щ е специална българска буква!",
      animation: "chirp"
    },
    "Х": {
      character: "🍞",
      word: "Хляб",
      wordLower: "хляб",
      sound: "х",
      hint: "Дишай силно - х!",
      tracePath: "M 50 20 L 150 180 M 150 20 L 50 180",
      funFact: "Х е като да се смееш!",
      animation: "breathe"
    },

    // Stage 6: Special letters
    "Й": {
      character: "🥛",
      word: "Йогурт",
      wordLower: "йогурт",
      sound: "й",
      hint: "Бързо и - й!",
      tracePath: "M 50 20 L 50 120 Q 100 200 150 120 L 150 20 M 100 0 L 100 -20",
      funFact: "Й е бързото И!",
      animation: "pour"
    },
    "Ю": {
      character: "🎠",
      word: "Юла",
      wordLower: "юла",
      sound: "ю",
      hint: "Й плюс У - ю!",
      tracePath: "M 30 20 L 30 180 M 30 100 L 60 100 M 100 20 A 50 50 0 1 1 100 180 A 50 50 0 1 1 100 20",
      funFact: "Ю се върти като юла!",
      animation: "spin"
    },
    "Я": {
      character: "🍎",
      word: "Ябълка",
      wordLower: "ябълка",
      sound: "я",
      hint: "Й плюс А - я!",
      tracePath: "M 150 20 L 150 180 M 150 100 L 50 100 Q 30 100 30 70 Q 30 20 70 20 L 150 20",
      funFact: "Я е огледалното Р!",
      animation: "fall"
    },
    "Ъ": {
      character: "🪨",
      word: "Камък",
      wordLower: "камък",
      sound: "ъ",
      hint: "Дълбоко в гърлото - ъ!",
      tracePath: "M 50 20 L 50 180 L 120 180 Q 160 180 160 140 Q 160 100 120 100 L 50 100",
      funFact: "Ъ е само в български!",
      animation: "solid"
    },
    "Ь": {
      character: "🧸",
      word: "Мечка",
      wordLower: "мек знак",
      sound: "ь",
      hint: "Прави буквите меки!",
      tracePath: "M 50 20 L 50 180 M 50 100 L 120 100 Q 160 100 160 140 Q 160 180 120 180 L 50 180",
      funFact: "Ь е мекият знак!",
      animation: "soft"
    }
  },

  // Get all letters in pedagogical order
  getAllLettersInOrder() {
    const order = [];
    this.stages.forEach(stage => {
      stage.letters.forEach(letter => {
        order.push(letter);
      });
    });
    return order;
  },

  // Get stage for a letter
  getStageForLetter(letter) {
    for (const stage of this.stages) {
      if (stage.letters.includes(letter)) {
        return stage;
      }
    }
    return null;
  },

  // Get letter index in learning sequence
  getLetterIndex(letter) {
    return this.getAllLettersInOrder().indexOf(letter);
  },

  // Check if letter is unlocked based on progress
  isLetterUnlocked(letter, progress) {
    const index = this.getLetterIndex(letter);
    if (index === 0) return true; // First letter always unlocked

    // Check if previous letter is completed
    const allLetters = this.getAllLettersInOrder();
    if (index > 0) {
      const prevLetter = allLetters[index - 1];
      return progress[prevLetter] && progress[prevLetter].completed;
    }
    return false;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonData;
}
