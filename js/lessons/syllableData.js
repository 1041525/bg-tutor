/**
 * Bulgarian Syllable Lessons - Curriculum Data
 * Based on Bulgarian child pedagogy for reading acquisition
 *
 * Learning progression:
 * 1. Open syllables (CV) - consonant + vowel: ма, на, ра
 * 2. Reversed syllables (VC) - vowel + consonant: ам, ан, ар
 * 3. Simple two-syllable combinations: ма-ма, та-та
 * 4. Mixed syllable patterns
 */

const SyllableData = {
  // Learning stages for syllables
  stages: [
    {
      id: 1,
      name: "Отворени срички",
      description: "Съгласна + гласна",
      color: "#4ECDC4",
      syllables: [
        { syllable: "МА", sounds: ["М", "А"], word: "мама", wordEmoji: "👩", hint: "М-А казва МА!" },
        { syllable: "НА", sounds: ["Н", "А"], word: "нана", wordEmoji: "👵", hint: "Н-А казва НА!" },
        { syllable: "РА", sounds: ["Р", "А"], word: "рак", wordEmoji: "🦀", hint: "Р-А казва РА!" },
        { syllable: "ЛА", sounds: ["Л", "А"], word: "лале", wordEmoji: "🌷", hint: "Л-А казва ЛА!" },
        { syllable: "СА", sounds: ["С", "А"], word: "сапун", wordEmoji: "🧼", hint: "С-А казва СА!" },
        { syllable: "ПА", sounds: ["П", "А"], word: "папа", wordEmoji: "👨", hint: "П-А казва ПА!" },
        { syllable: "ТА", sounds: ["Т", "А"], word: "тата", wordEmoji: "👨", hint: "Т-А казва ТА!" },
        { syllable: "КА", sounds: ["К", "А"], word: "кака", wordEmoji: "👧", hint: "К-А казва КА!" }
      ]
    },
    {
      id: 2,
      name: "Още отворени срички",
      description: "С други гласни",
      color: "#FF6B6B",
      syllables: [
        { syllable: "МО", sounds: ["М", "О"], word: "море", wordEmoji: "🌊", hint: "М-О казва МО!" },
        { syllable: "НО", sounds: ["Н", "О"], word: "нос", wordEmoji: "👃", hint: "Н-О казва НО!" },
        { syllable: "РО", sounds: ["Р", "О"], word: "роза", wordEmoji: "🌹", hint: "Р-О казва РО!" },
        { syllable: "ЛО", sounds: ["Л", "О"], word: "лодка", wordEmoji: "🚤", hint: "Л-О казва ЛО!" },
        { syllable: "МУ", sounds: ["М", "У"], word: "муха", wordEmoji: "🪰", hint: "М-У казва МУ!" },
        { syllable: "НУ", sounds: ["Н", "У"], word: "нула", wordEmoji: "0️⃣", hint: "Н-У казва НУ!" },
        { syllable: "РУ", sounds: ["Р", "У"], word: "ръка", wordEmoji: "✋", hint: "Р-У казва РУ!" },
        { syllable: "ЛУ", sounds: ["Л", "У"], word: "луна", wordEmoji: "🌙", hint: "Л-У казва ЛУ!" }
      ]
    },
    {
      id: 3,
      name: "Обърнати срички",
      description: "Гласна + съгласна",
      color: "#FFE66D",
      syllables: [
        { syllable: "АМ", sounds: ["А", "М"], word: "ам-ам", wordEmoji: "🍽️", hint: "А-М казва АМ!" },
        { syllable: "АН", sounds: ["А", "Н"], word: "ананас", wordEmoji: "🍍", hint: "А-Н казва АН!" },
        { syllable: "АР", sounds: ["А", "Р"], word: "ар", wordEmoji: "🌾", hint: "А-Р казва АР!" },
        { syllable: "АС", sounds: ["А", "С"], word: "астра", wordEmoji: "🌸", hint: "А-С казва АС!" },
        { syllable: "ОМ", sounds: ["О", "М"], word: "ом", wordEmoji: "🧘", hint: "О-М казва ОМ!" },
        { syllable: "ОН", sounds: ["О", "Н"], word: "он", wordEmoji: "👤", hint: "О-Н казва ОН!" },
        { syllable: "УМ", sounds: ["У", "М"], word: "ум", wordEmoji: "🧠", hint: "У-М казва УМ!" },
        { syllable: "УС", sounds: ["У", "С"], word: "ус", wordEmoji: "🥸", hint: "У-С казва УС!" }
      ]
    },
    {
      id: 4,
      name: "Първи думи",
      description: "Две срички заедно",
      color: "#95E1D3",
      syllables: [
        { syllable: "МА-МА", sounds: ["МА", "МА"], word: "мама", wordEmoji: "👩", hint: "МА и МА правят МАМА!", isWord: true },
        { syllable: "ТА-ТА", sounds: ["ТА", "ТА"], word: "тата", wordEmoji: "👨", hint: "ТА и ТА правят ТАТА!", isWord: true },
        { syllable: "НА-НА", sounds: ["НА", "НА"], word: "нана", wordEmoji: "👵", hint: "НА и НА правят НАНА!", isWord: true },
        { syllable: "КА-КА", sounds: ["КА", "КА"], word: "кака", wordEmoji: "👧", hint: "КА и КА правят КАКА!", isWord: true },
        { syllable: "ЛА-ЛЕ", sounds: ["ЛА", "ЛЕ"], word: "лале", wordEmoji: "🌷", hint: "ЛА и ЛЕ правят ЛАЛЕ!", isWord: true },
        { syllable: "РО-ЗА", sounds: ["РО", "ЗА"], word: "роза", wordEmoji: "🌹", hint: "РО и ЗА правят РОЗА!", isWord: true },
        { syllable: "РИ-БА", sounds: ["РИ", "БА"], word: "риба", wordEmoji: "🐟", hint: "РИ и БА правят РИБА!", isWord: true },
        { syllable: "КО-ЛА", sounds: ["КО", "ЛА"], word: "кола", wordEmoji: "🚗", hint: "КО и ЛА правят КОЛА!", isWord: true }
      ]
    },
    {
      id: 5,
      name: "Още думи",
      description: "Различни срички",
      color: "#AA96DA",
      syllables: [
        { syllable: "КУ-ЧЕ", sounds: ["КУ", "ЧЕ"], word: "куче", wordEmoji: "🐕", hint: "КУ и ЧЕ правят КУЧЕ!", isWord: true },
        { syllable: "КОТ-КА", sounds: ["КОТ", "КА"], word: "котка", wordEmoji: "🐈", hint: "КОТ и КА правят КОТКА!", isWord: true },
        { syllable: "ПИ-ЛЕ", sounds: ["ПИ", "ЛЕ"], word: "пиле", wordEmoji: "🐥", hint: "ПИ и ЛЕ правят ПИЛЕ!", isWord: true },
        { syllable: "ЗА-ЕК", sounds: ["ЗА", "ЕК"], word: "заек", wordEmoji: "🐰", hint: "ЗА и ЕК правят ЗАЕК!", isWord: true },
        { syllable: "МЕЧ-КА", sounds: ["МЕЧ", "КА"], word: "мечка", wordEmoji: "🐻", hint: "МЕЧ и КА правят МЕЧКА!", isWord: true },
        { syllable: "ПТИ-ЦА", sounds: ["ПТИ", "ЦА"], word: "птица", wordEmoji: "🐦", hint: "ПТИ и ЦА правят ПТИЦА!", isWord: true },
        { syllable: "СЛЪ-НЦЕ", sounds: ["СЛЪ", "НЦЕ"], word: "слънце", wordEmoji: "☀️", hint: "СЛЪ и НЦЕ правят СЛЪНЦЕ!", isWord: true },
        { syllable: "КЪ-ЩА", sounds: ["КЪ", "ЩА"], word: "къща", wordEmoji: "🏠", hint: "КЪ и ЩА правят КЪЩА!", isWord: true }
      ]
    }
  ],

  // Get all syllables in order
  getAllSyllablesInOrder() {
    const order = [];
    this.stages.forEach(stage => {
      stage.syllables.forEach(syl => {
        order.push(syl.syllable);
      });
    });
    return order;
  },

  // Get stage for a syllable
  getStageForSyllable(syllable) {
    for (const stage of this.stages) {
      if (stage.syllables.some(s => s.syllable === syllable)) {
        return stage;
      }
    }
    return null;
  },

  // Get syllable data
  getSyllableData(syllable) {
    for (const stage of this.stages) {
      const found = stage.syllables.find(s => s.syllable === syllable);
      if (found) return found;
    }
    return null;
  },

  // Get syllable index
  getSyllableIndex(syllable) {
    return this.getAllSyllablesInOrder().indexOf(syllable);
  },

  // Check if syllable is unlocked
  isSyllableUnlocked(syllable, progress) {
    const index = this.getSyllableIndex(syllable);
    if (index === 0) return true;

    const allSyllables = this.getAllSyllablesInOrder();
    if (index > 0) {
      const prevSyllable = allSyllables[index - 1];
      return progress[prevSyllable] && progress[prevSyllable].completed;
    }
    return false;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SyllableData;
}
