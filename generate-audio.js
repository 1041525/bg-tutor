/**
 * Bulgarian Phonetic App - Audio Generator
 * Generates all Bulgarian TTS audio files using Google Cloud Text-to-Speech API
 *
 * Reads word data from words.json - add new words there and run this script.
 *
 * Usage: node generate-audio.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Google Cloud TTS API Key
const API_KEY = 'AIzaSyCxosxWgWun2SZnqT9taIRxxcIkTwGOoPI';

const AUDIO_DIR = path.join(__dirname, 'audio');
const WORDS_DIR = path.join(AUDIO_DIR, 'words');
const WORDS_JSON = path.join(__dirname, 'words.json');

// Google Cloud TTS API configuration (Chirp 3 HD)
const ttsConfig = {
  voice: {
    languageCode: 'bg-BG',
    name: 'bg-BG-Chirp3-HD-Achernar' // Chirp 3 HD Female Bulgarian voice
  },
  audioConfig: {
    audioEncoding: 'MP3'
    // Note: Chirp 3 HD doesn't support speakingRate or pitch parameters
  }
};

// Load game data from words.json
function loadGameData() {
  if (!fs.existsSync(WORDS_JSON)) {
    console.error('ERROR: words.json not found!');
    console.error('Please create words.json with your word data.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(WORDS_JSON, 'utf8'));
}

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

async function main() {
  console.log('Bulgarian Phonetic App - Audio Generator\n');
  console.log('Reading data from words.json...\n');

  // Check API key
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('ERROR: Please set your Google Cloud TTS API key in the script.');
    console.error('Replace YOUR_API_KEY_HERE with your actual API key.');
    process.exit(1);
  }

  // Load game data
  const gameData = loadGameData();

  // Ensure directories exist
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
  if (!fs.existsSync(WORDS_DIR)) fs.mkdirSync(WORDS_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;

  // Generate instruction audio from letters
  console.log('Generating letter instructions...');
  for (const [_letter, data] of Object.entries(gameData.letters)) {
    const outputPath = path.join(AUDIO_DIR, data.audioFile);
    if (fs.existsSync(outputPath)) {
      console.log(`  - ${data.audioFile}: already exists, skipping`);
      skipped++;
      continue;
    }
    try {
      await generateAudio(data.instructionText, outputPath);
      console.log(`  ✓ ${data.audioFile}: "${data.instructionText}"`);
      generated++;
    } catch (e) {
      console.error(`  ✗ ${data.audioFile}: ${e.message}`);
    }
  }

  // Generate feedback audio
  console.log('\nGenerating feedback phrases...');
  const feedbackItems = [
    { file: gameData.feedback.correct.file, text: gameData.feedback.correct.text },
    { file: gameData.feedback.incorrect.file, text: gameData.feedback.incorrect.text }
  ];
  for (const item of feedbackItems) {
    const outputPath = path.join(AUDIO_DIR, item.file);
    if (fs.existsSync(outputPath)) {
      console.log(`  - ${item.file}: already exists, skipping`);
      skipped++;
      continue;
    }
    try {
      await generateAudio(item.text, outputPath);
      console.log(`  ✓ ${item.file}: "${item.text}"`);
      generated++;
    } catch (e) {
      console.error(`  ✗ ${item.file}: ${e.message}`);
    }
  }

  // Generate incorrect answer phrases (ne-zapochva and zapochva for each letter)
  if (gameData.incorrectPhrases) {
    console.log('\nGenerating incorrect answer phrases...');
    for (const [_letter, data] of Object.entries(gameData.incorrectPhrases)) {
      // Generate "не започва със:" phrase
      const neZapochvaPath = path.join(AUDIO_DIR, data.neZapochva);
      if (fs.existsSync(neZapochvaPath)) {
        console.log(`  - ${data.neZapochva}: already exists, skipping`);
        skipped++;
      } else {
        try {
          await generateAudio(data.neZapochvaText, neZapochvaPath);
          console.log(`  ✓ ${data.neZapochva}: "${data.neZapochvaText}"`);
          generated++;
        } catch (e) {
          console.error(`  ✗ ${data.neZapochva}: ${e.message}`);
        }
      }

      // Generate "започва със:" phrase
      const zapochvaPath = path.join(AUDIO_DIR, data.zapochva);
      if (fs.existsSync(zapochvaPath)) {
        console.log(`  - ${data.zapochva}: already exists, skipping`);
        skipped++;
      } else {
        try {
          await generateAudio(data.zapochvaText, zapochvaPath);
          console.log(`  ✓ ${data.zapochva}: "${data.zapochvaText}"`);
          generated++;
        } catch (e) {
          console.error(`  ✗ ${data.zapochva}: ${e.message}`);
        }
      }
    }
  }

  // Generate word pronunciations
  console.log(`\nGenerating word pronunciations (${gameData.words.length} words)...`);
  for (const word of gameData.words) {
    const outputPath = path.join(WORDS_DIR, word.audioFile);
    if (fs.existsSync(outputPath)) {
      console.log(`  - ${word.audioFile}: already exists, skipping`);
      skipped++;
      continue;
    }
    try {
      await generateAudio(word.word, outputPath);
      console.log(`  ✓ ${word.audioFile}: "${word.word}" ${word.emoji}`);
      generated++;
    } catch (e) {
      console.error(`  ✗ ${word.audioFile}: ${e.message}`);
    }
  }

  console.log(`\nDone! Generated ${generated} new files, skipped ${skipped} existing files.`);
  console.log(`Files saved to: ${AUDIO_DIR}`);
  console.log(`\nTotal words in database: ${gameData.words.length}`);
}

main().catch(console.error);
