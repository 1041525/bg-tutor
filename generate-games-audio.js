/**
 * Bulgarian Phonetic App - New Games Audio Generator
 * Generates audio files for the new syllable/word games
 *
 * Usage: node generate-games-audio.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Google Cloud TTS API Key (same as main script)
const API_KEY = 'AIzaSyCxosxWgWun2SZnqT9taIRxxcIkTwGOoPI';

const AUDIO_DIR = path.join(__dirname, 'audio');
const GAMES_DIR = path.join(AUDIO_DIR, 'games');

// Google Cloud TTS API configuration
const ttsConfig = {
  voice: {
    languageCode: 'bg-BG',
    name: 'bg-BG-Chirp3-HD-Achernar'
  },
  audioConfig: {
    audioEncoding: 'MP3'
  }
};

// =====================
// WORD DATA FOR NEW GAMES
// =====================

// Sound Train words (syllables)
const TRAIN_WORDS = [
  { word: 'мама', syllables: ['ма', 'ма'] },
  { word: 'баба', syllables: ['ба', 'ба'] },
  { word: 'тато', syllables: ['та', 'то'] },
  { word: 'дядо', syllables: ['дя', 'до'] },
  { word: 'кола', syllables: ['ко', 'ла'] },
  { word: 'вода', syllables: ['во', 'да'] },
  { word: 'риба', syllables: ['ри', 'ба'] },
  { word: 'коте', syllables: ['ко', 'те'] },
  { word: 'куче', syllables: ['ку', 'че'] },
  { word: 'пиле', syllables: ['пи', 'ле'] },
  { word: 'слон', syllables: ['слон'] },
  { word: 'мечка', syllables: ['меч', 'ка'] },
  { word: 'лъв', syllables: ['лъв'] },
  { word: 'заек', syllables: ['за', 'ек'] },
  { word: 'небе', syllables: ['не', 'бе'] },
  { word: 'слънце', syllables: ['слън', 'це'] },
  { word: 'луна', syllables: ['лу', 'на'] },
  { word: 'цвете', syllables: ['цве', 'те'] },
  { word: 'ябълка', syllables: ['ябъл', 'ка'] },
  { word: 'круша', syllables: ['кру', 'ша'] },
  { word: 'банан', syllables: ['ба', 'нан'] },
  { word: 'диня', syllables: ['ди', 'ня'] },
  { word: 'торта', syllables: ['тор', 'та'] },
  { word: 'сладолед', syllables: ['сла', 'до', 'лед'] }
];

// Build the Word - simple words
const BUILD_WORDS = [
  'сок', 'нос', 'кон', 'сол', 'мед', 'дом', 'сир', 'рак', 'лъв',
  'кот', 'пес', 'мак', 'зъб', 'нож', 'миш', 'дар', 'чай',
  'кола', 'риба', 'коте', 'вода', 'слон', 'заек', 'мама'
];

// Puzzle words
const PUZZLE_WORDS = [
  { word: 'мама', firstHalf: 'ма', secondHalf: 'ма' },
  { word: 'баба', firstHalf: 'ба', secondHalf: 'ба' },
  { word: 'тато', firstHalf: 'та', secondHalf: 'то' },
  { word: 'кола', firstHalf: 'ко', secondHalf: 'ла' },
  { word: 'риба', firstHalf: 'ри', secondHalf: 'ба' },
  { word: 'вода', firstHalf: 'во', secondHalf: 'да' },
  { word: 'небе', firstHalf: 'не', secondHalf: 'бе' },
  { word: 'луна', firstHalf: 'лу', secondHalf: 'на' },
  { word: 'коте', firstHalf: 'ко', secondHalf: 'те' },
  { word: 'куче', firstHalf: 'ку', secondHalf: 'че' },
  { word: 'пиле', firstHalf: 'пи', secondHalf: 'ле' },
  { word: 'маса', firstHalf: 'ма', secondHalf: 'са' },
  { word: 'торта', firstHalf: 'тор', secondHalf: 'та' },
  { word: 'круша', firstHalf: 'кру', secondHalf: 'ша' },
  { word: 'диня', firstHalf: 'ди', secondHalf: 'ня' },
  { word: 'гъба', firstHalf: 'гъ', secondHalf: 'ба' },
  { word: 'цвете', firstHalf: 'цве', secondHalf: 'те' },
  { word: 'къща', firstHalf: 'къ', secondHalf: 'ща' },
  { word: 'ягода', firstHalf: 'яго', secondHalf: 'да' },
  { word: 'пчела', firstHalf: 'пче', secondHalf: 'ла' }
];

// Bulgarian alphabet letters for sorting game
const BG_LETTERS = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ'.split('');

// Instructions and feedback
const PHRASES = [
  { id: 'glasna', text: 'гласна' },
  { id: 'saglasna', text: 'съгласна' },
  { id: 'postroy-dumata', text: 'Построй думата от срички!' },
  { id: 'saberi-dumata', text: 'Събери думата!' },
  { id: 'sortiray', text: 'Сортирай буквите!' },
  { id: 'svarzhi', text: 'Свържи половинките!' }
];

// Game titles and instructions (for kids who can't read)
const GAME_TITLES = [
  // Звуков мач - Sound Match
  { id: 'game-zvukov-mach', text: 'Звуков мач' },
  { id: 'game-zvukov-mach-instr', text: 'Намери думата по звук!' },

  // Намери картинката - Find Picture
  { id: 'game-nameri-kartinkata', text: 'Намери картинката' },
  { id: 'game-nameri-kartinkata-instr', text: 'Свържи думата с картинката!' },

  // Спукай балона - Bubble Pop
  { id: 'game-spukay-balona', text: 'Спукай балона' },
  { id: 'game-spukay-balona-instr', text: 'Намери правилната буква!' },

  // Свържи буквите - Match Letters
  { id: 'game-svarzhi-bukvite', text: 'Свържи буквите' },
  { id: 'game-svarzhi-bukvite-instr', text: 'Свържи голяма към малка буква!' },

  // Звуков влак - Sound Train
  { id: 'game-zvukov-vlak', text: 'Звуков влак' },
  { id: 'game-zvukov-vlak-instr', text: 'Построй думата от срички!' },

  // Събери думата - Build Word
  { id: 'game-saberi-dumata', text: 'Събери думата' },
  { id: 'game-saberi-dumata-instr', text: 'Подреди буквите правилно!' },

  // Гласни и съгласни - Vowels & Consonants
  { id: 'game-glasni-saglasni', text: 'Гласни и съгласни' },
  { id: 'game-glasni-saglasni-instr', text: 'Сортирай буквите!' },

  // Срички пъзел - Syllable Puzzle
  { id: 'game-sricki-pazel', text: 'Срички пъзел' },
  { id: 'game-sricki-pazel-instr', text: 'Свържи половинките!' }
];

async function generateAudio(text, outputPath) {
  const requestBody = JSON.stringify({
    input: { text },
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

function sanitizeFilename(text) {
  // Full Bulgarian to Latin transliteration
  const translit = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
    'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'ZH',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
    'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
    'Х': 'H', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHT', 'Ъ': 'A', 'Ь': 'Y',
    'Ю': 'YU', 'Я': 'YA'
  };

  let result = '';
  for (const char of text) {
    result += translit[char] || char;
  }

  return result.toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
}

async function main() {
  console.log('New Games Audio Generator\n');

  // Ensure directories exist
  if (!fs.existsSync(GAMES_DIR)) fs.mkdirSync(GAMES_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;

  // Collect all unique words and syllables
  const allItems = new Map();

  // Add train words and their syllables
  console.log('Collecting words from Sound Train...');
  for (const item of TRAIN_WORDS) {
    allItems.set(item.word, item.word);
    for (const syl of item.syllables) {
      allItems.set(`syl_${syl}`, syl);
    }
  }

  // Add build words
  console.log('Collecting words from Build the Word...');
  for (const word of BUILD_WORDS) {
    allItems.set(word, word);
  }

  // Add puzzle words and syllables
  console.log('Collecting words from Syllable Puzzle...');
  for (const item of PUZZLE_WORDS) {
    allItems.set(item.word, item.word);
    allItems.set(`syl_${item.firstHalf}`, item.firstHalf);
    allItems.set(`syl_${item.secondHalf}`, item.secondHalf);
  }

  // Add letters - use extended pronunciation for clearer Bulgarian sound
  // For vowels, repeat the sound; for consonants, add schwa "ъ"
  console.log('Collecting letters...');
  const BG_VOWELS_SET = new Set(['А', 'Е', 'И', 'О', 'У', 'Ъ', 'Ю', 'Я']);
  for (const letter of BG_LETTERS) {
    let pronunciation;
    if (BG_VOWELS_SET.has(letter)) {
      // For vowels, repeat 3 times for clear sound
      pronunciation = letter.toLowerCase() + ', ' + letter.toLowerCase() + ', ' + letter.toLowerCase();
    } else if (letter === 'Й') {
      pronunciation = 'й, кратко и';
    } else if (letter === 'Ь') {
      pronunciation = 'ер малък';
    } else {
      // For consonants, add schwa for natural Bulgarian pronunciation
      pronunciation = letter.toLowerCase() + 'ъ';
    }
    allItems.set(`letter_${letter}`, pronunciation);
  }

  // Add phrases
  console.log('Collecting phrases...');
  for (const phrase of PHRASES) {
    allItems.set(`phrase_${phrase.id}`, phrase.text);
  }

  // Add game titles and instructions
  console.log('Collecting game titles and instructions...');
  for (const game of GAME_TITLES) {
    allItems.set(`game_${game.id}`, game.text);
  }

  console.log(`\nTotal unique items to generate: ${allItems.size}\n`);

  // Generate audio for each item
  for (const [key, text] of allItems) {
    const filename = sanitizeFilename(key) + '.mp3';
    const outputPath = path.join(GAMES_DIR, filename);

    if (fs.existsSync(outputPath)) {
      console.log(`  - ${filename}: exists, skipping`);
      skipped++;
      continue;
    }

    try {
      await generateAudio(text, outputPath);
      console.log(`  ✓ ${filename}: "${text}"`);
      generated++;
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.error(`  ✗ ${filename}: ${e.message}`);
    }
  }

  console.log(`\nDone! Generated ${generated} new files, skipped ${skipped} existing.`);
  console.log(`Files saved to: ${GAMES_DIR}`);

  // Generate manifest
  const manifest = {};
  for (const [key, text] of allItems) {
    manifest[key] = {
      text: text,
      file: sanitizeFilename(key) + '.mp3'
    };
  }
  fs.writeFileSync(
    path.join(GAMES_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('\nManifest saved to: games/manifest.json');
}

main().catch(console.error);
