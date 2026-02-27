/**
 * Bulgarian Phonetic App - Unified Audio Generator
 * Generates ALL audio files from words.json using Google Cloud Text-to-Speech API
 *
 * This script consolidates the previous generate-audio.js and generate-games-audio.js
 * All word data is now centralized in words.json
 *
 * Usage:
 *   GOOGLE_TTS_API_KEY=your_key node tools/generate-audio.js [--force] [--type=TYPE]
 *
 * Options:
 *   --force       Regenerate all files even if they exist
 *   --type=TYPE   Generate only specific type (words, letters, syllables, phrases, games)
 *
 * Environment Variables:
 *   GOOGLE_TTS_API_KEY - Your Google Cloud Text-to-Speech API key (required)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'audio');
const WORDS_DIR = path.join(AUDIO_DIR, 'words');
const GAMES_DIR = path.join(AUDIO_DIR, 'games');
const WORDS_JSON = path.join(PROJECT_ROOT, 'words.json');

// Google Cloud TTS API Key - from environment variable
const API_KEY = process.env.GOOGLE_TTS_API_KEY || '';

// Google Cloud TTS API configuration (Chirp 3 HD Bulgarian voice)
const ttsConfig = {
  voice: {
    languageCode: 'bg-BG',
    name: 'bg-BG-Chirp3-HD-Achernar'
  },
  audioConfig: {
    audioEncoding: 'MP3'
  }
};

// Bulgarian alphabet for reference
const BG_LETTERS = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ'.split('');
const BG_VOWELS = new Set(['А', 'Е', 'И', 'О', 'У', 'Ъ', 'Ю', 'Я']);

// Transliteration map for filenames
const TRANSLIT_MAP = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
  'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
  'ю': 'yu', 'я': 'ya'
};

// Parse command line arguments
const args = process.argv.slice(2);
const forceRegenerate = args.includes('--force');
const typeFilter = args.find(a => a.startsWith('--type='))?.split('=')[1];

/**
 * Transliterate Bulgarian text to Latin for filenames
 */
function bgToLatin(text) {
  return text.toLowerCase().split('').map(c => TRANSLIT_MAP[c] || c).join('');
}

/**
 * Sanitize text to create safe filename
 */
function sanitizeFilename(text) {
  return bgToLatin(text)
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/_+/g, '_');
}

/**
 * Wrap a syllable in SSML for clear, crisp pronunciation.
 * Short syllables like "ма" sound odd as plain text because TTS adds
 * unwanted prosody. SSML with a controlled rate keeps them sharp.
 */
function syllableSSML(syl) {
  return `<speak><prosody rate="85%" pitch="+0st">${syl}</prosody></speak>`;
}

/**
 * Load game data from words.json
 */
function loadGameData() {
  if (!fs.existsSync(WORDS_JSON)) {
    console.error('ERROR: words.json not found!');
    console.error(`Expected at: ${WORDS_JSON}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(WORDS_JSON, 'utf8'));
}

/**
 * Generate audio using Google Cloud TTS API
 * @param {string} text - Plain text or SSML markup to synthesize
 * @param {string} outputPath - Path to write the MP3 file
 * @param {object} [opts] - Options
 * @param {boolean} [opts.ssml] - If true, treat text as SSML input
 */
async function generateAudio(text, outputPath, opts = {}) {
  const input = opts.ssml ? { ssml: text } : { text };
  const requestBody = JSON.stringify({
    input,
    voice: ttsConfig.voice,
    audioConfig: ttsConfig.audioConfig
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'texttospeech.googleapis.com',
      path: `/v1/text:synthesize?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
          return;
        }
        try {
          const response = JSON.parse(data);
          const audioContent = Buffer.from(response.audioContent, 'base64');
          fs.writeFileSync(outputPath, audioContent);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

/**
 * Generate a single audio file with skip/force logic
 */
async function generateFile(text, outputPath, label, opts = {}) {
  if (fs.existsSync(outputPath) && !forceRegenerate) {
    console.log(`  - ${path.basename(outputPath)}: exists, skipping`);
    return { generated: 0, skipped: 1 };
  }

  try {
    await generateAudio(text, outputPath, opts);
    console.log(`  ✓ ${path.basename(outputPath)}: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`);
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
    return { generated: 1, skipped: 0 };
  } catch (e) {
    console.error(`  ✗ ${path.basename(outputPath)}: ${e.message}`);
    return { generated: 0, skipped: 0, error: 1 };
  }
}

/**
 * Generate letter instruction audio (from words.json letters section)
 */
async function generateLetterInstructions(gameData) {
  console.log('\n📝 Letter Instructions (audio/)');
  let generated = 0, skipped = 0;

  for (const [letter, data] of Object.entries(gameData.letters)) {
    const outputPath = path.join(AUDIO_DIR, data.audioFile);
    const result = await generateFile(data.instructionText, outputPath, letter);
    generated += result.generated;
    skipped += result.skipped;
  }

  return { generated, skipped };
}

/**
 * Generate feedback audio (bravo, try-again)
 */
async function generateFeedback(gameData) {
  console.log('\n📣 Feedback Phrases (audio/)');
  let generated = 0, skipped = 0;

  const items = [
    { file: gameData.feedback.correct.file, text: gameData.feedback.correct.text },
    { file: gameData.feedback.incorrect.file, text: gameData.feedback.incorrect.text }
  ];

  for (const item of items) {
    const outputPath = path.join(AUDIO_DIR, item.file);
    const result = await generateFile(item.text, outputPath, item.file);
    generated += result.generated;
    skipped += result.skipped;
  }

  return { generated, skipped };
}

/**
 * Generate incorrect answer phrases
 */
async function generateIncorrectPhrases(gameData) {
  if (!gameData.incorrectPhrases) return { generated: 0, skipped: 0 };

  console.log('\n🔇 Incorrect Answer Phrases (audio/)');
  let generated = 0, skipped = 0;

  for (const [letter, data] of Object.entries(gameData.incorrectPhrases)) {
    // "не започва със:" phrase
    let outputPath = path.join(AUDIO_DIR, data.neZapochva);
    let result = await generateFile(data.neZapochvaText, outputPath, `neZapochva-${letter}`);
    generated += result.generated;
    skipped += result.skipped;

    // "започва със:" phrase
    outputPath = path.join(AUDIO_DIR, data.zapochva);
    result = await generateFile(data.zapochvaText, outputPath, `zapochva-${letter}`);
    generated += result.generated;
    skipped += result.skipped;
  }

  return { generated, skipped };
}

/**
 * Generate word pronunciations (audio/words/)
 */
async function generateWords(gameData) {
  console.log(`\n🗣️ Word Pronunciations (audio/words/) - ${gameData.words.length} words`);
  let generated = 0, skipped = 0;

  for (const word of gameData.words) {
    const outputPath = path.join(WORDS_DIR, word.audioFile);
    const result = await generateFile(word.word, outputPath, word.word);
    generated += result.generated;
    skipped += result.skipped;
  }

  return { generated, skipped };
}

/**
 * Generate game words and syllables (audio/games/)
 */
async function generateGameAudio(gameData) {
  if (!gameData.gameData) {
    console.log('\n⚠️ No gameData section in words.json, skipping game audio');
    return { generated: 0, skipped: 0 };
  }

  console.log('\n🎮 Game Audio (audio/games/)');
  let generated = 0, skipped = 0;
  const processedItems = new Set();

  // Game words and syllables
  if (gameData.gameData.gameWords) {
    console.log('\n  📦 Game words and syllables:');
    for (const item of gameData.gameData.gameWords) {
      // Word
      if (!processedItems.has(item.word)) {
        const filename = bgToLatin(item.word) + '.mp3';
        const result = await generateFile(item.word, path.join(GAMES_DIR, filename), item.word);
        generated += result.generated;
        skipped += result.skipped;
        processedItems.add(item.word);
      }

      // Syllables
      for (const syl of item.syllables) {
        const key = `syl_${syl}`;
        if (!processedItems.has(key)) {
          const filename = 'syl_' + bgToLatin(syl) + '.mp3';
          const result = await generateFile(syllableSSML(syl), path.join(GAMES_DIR, filename), syl, { ssml: true });
          generated += result.generated;
          skipped += result.skipped;
          processedItems.add(key);
        }
      }
    }
  }

  // Individual letters for games (with pronunciation)
  console.log('\n  📦 Letter pronunciations:');
  for (const letter of BG_LETTERS) {
    const key = `letter_${letter}`;
    if (!processedItems.has(key)) {
      let pronunciation;
      if (BG_VOWELS.has(letter)) {
        // Vowels: short, sharp pronunciation via SSML (avoids drawn-out "aaah")
        const v = letter.toLowerCase();
        pronunciation = `<speak><prosody rate="130%" pitch="+1st">${v}</prosody></speak>`;
      } else if (letter === 'Й') {
        pronunciation = 'й, кратко и';
      } else if (letter === 'Ь') {
        pronunciation = 'ер малък';
      } else {
        // Consonants: repeat with schwa for clarity (single "фъ" can be too short/quiet)
        const sound = letter.toLowerCase() + 'ъ';
        pronunciation = `${sound}, ${sound}, ${sound}`;
      }

      const filename = 'letter_' + bgToLatin(letter.toLowerCase()) + '.mp3';
      const isSSML = pronunciation.startsWith('<speak>');
      const result = await generateFile(pronunciation, path.join(GAMES_DIR, filename), letter, isSSML ? { ssml: true } : {});
      generated += result.generated;
      skipped += result.skipped;
      processedItems.add(key);
    }
  }

  // Distractor syllables
  if (gameData.gameData.distractorSyllables) {
    console.log('\n  📦 Distractor syllables:');
    for (const syl of gameData.gameData.distractorSyllables) {
      const key = `syl_${syl}`;
      if (!processedItems.has(key)) {
        const filename = 'syl_' + bgToLatin(syl) + '.mp3';
        const result = await generateFile(syllableSSML(syl), path.join(GAMES_DIR, filename), syl, { ssml: true });
        generated += result.generated;
        skipped += result.skipped;
        processedItems.add(key);
      }
    }
  }

  // Game-specific phrases
  console.log('\n  📦 Game phrases:');
  const phrases = [
    { id: 'glasna', text: 'гласна' },
    { id: 'saglasna', text: 'съгласна' }
  ];
  for (const phrase of phrases) {
    const filename = `phrase_${phrase.id}.mp3`;
    const result = await generateFile(phrase.text, path.join(GAMES_DIR, filename), phrase.id);
    generated += result.generated;
    skipped += result.skipped;
  }

  // Game titles and instructions
  console.log('\n  📦 Game titles and instructions:');
  const gameTitles = [
    { id: 'zvukovmach', text: 'Звуков мач' },
    { id: 'namerikartinkatainstr', text: 'Свържи думата с картинката!' },
    { id: 'spukaybalona', text: 'Спукай балона' },
    { id: 'svarzhibukvite', text: 'Свържи буквите' },
    { id: 'svarzhibukviteinstr', text: 'Свържи голяма към малка буква!' },
    { id: 'zvukovvlak', text: 'Звуков влак' },
    { id: 'zvukovvlakinstr', text: 'Построй думата от срички!' },
    { id: 'saberidumata', text: 'Събери думата' },
    { id: 'saberidumataainstr', text: 'Подреди буквите правилно!' },
    { id: 'glasnisaglasni', text: 'Гласни и съгласни' },
    { id: 'glasnisaglasniinstr', text: 'Сортирай буквите!' },
    { id: 'srickipazel', text: 'Срички пъзел' },
    { id: 'srickipazelinstr', text: 'Свържи половинките!' }
  ];
  for (const game of gameTitles) {
    const filename = `game_game${game.id}.mp3`;
    const result = await generateFile(game.text, path.join(GAMES_DIR, filename), game.id, game.ssml ? { ssml: true } : {});
    generated += result.generated;
    skipped += result.skipped;
  }

  return { generated, skipped };
}

/**
 * Main entry point
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Bulgarian Phonics App - Unified Audio Generator');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\nReading data from: ${WORDS_JSON}`);

  if (forceRegenerate) {
    console.log('⚠️  Force mode: regenerating all files');
  }
  if (typeFilter) {
    console.log(`🔍 Filter: only generating ${typeFilter}`);
  }

  // Check API key
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('\n❌ ERROR: Please set your Google Cloud TTS API key');
    process.exit(1);
  }

  // Load game data
  const gameData = loadGameData();
  console.log(`\n✓ Loaded ${gameData.words.length} words from words.json`);

  // Ensure directories exist
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
  if (!fs.existsSync(WORDS_DIR)) fs.mkdirSync(WORDS_DIR, { recursive: true });
  if (!fs.existsSync(GAMES_DIR)) fs.mkdirSync(GAMES_DIR, { recursive: true });

  let totalGenerated = 0;
  let totalSkipped = 0;

  // Generate each type based on filter
  const shouldGenerate = (type) => !typeFilter || typeFilter === type || typeFilter === 'all';

  if (shouldGenerate('letters')) {
    const result = await generateLetterInstructions(gameData);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
  }

  if (shouldGenerate('feedback')) {
    const result = await generateFeedback(gameData);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
  }

  if (shouldGenerate('phrases')) {
    const result = await generateIncorrectPhrases(gameData);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
  }

  if (shouldGenerate('words')) {
    const result = await generateWords(gameData);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
  }

  if (shouldGenerate('games')) {
    const result = await generateGameAudio(gameData);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ✓ Generated: ${totalGenerated} new files`);
  console.log(`  - Skipped:   ${totalSkipped} existing files`);
  console.log(`\n  Files saved to: ${AUDIO_DIR}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
