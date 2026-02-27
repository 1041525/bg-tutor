# Светът на Софи и Криси - UI Redesign Plan

## Concept
Transform the app from a flat grid menu into **"Замъкът на Софи и Криси"** (Sofi & Krisi's Castle) — an interactive illustrated world where two characters guide children through learning activities.

### Characters
- **Софи** (4 yo girl) — loves princesses, guides letter/word activities
- **Криси** (2 yo boy, her little brother) — loves trains, guides train/building activities
- User will provide anime-style character images

### Theme
A fairytale castle with rooms and grounds. Each area leads to games.

---

## Phase 1: Foundation — Theme & Character System

### 1a. Image asset structure
Create `images/` folder:
```
images/
├── characters/
│   ├── sofi.png          # Main pose (user provides)
│   ├── sofi-happy.png    # Celebration pose
│   ├── sofi-wave.png     # Welcome wave
│   ├── krisi.png         # Main pose (user provides)
│   ├── krisi-happy.png   # Celebration pose
│   └── krisi-wave.png    # Welcome wave
├── castle/
│   ├── castle-bg.svg     # Castle scene background (we generate via CSS/SVG)
│   ├── tower-lessons.svg # Tower for lessons area
│   ├── playground.svg    # Playground for games area
│   └── train-station.svg # Train station for Krisi's games
└── ui/
    ├── home-btn.svg      # Castle-shaped home button
    └── star.svg          # Custom star icon
```

**Action**: Create folder structure. Character images will use emoji placeholders until user provides real images. Castle scene built with CSS gradients + positioned elements (no image dependency).

### 1b. CSS Custom Properties & Theme
Add to top of `styles.css`:
```css
:root {
  /* Castle Theme Palette */
  --castle-sky: #87CEEB;
  --castle-pink: #FFB6C1;
  --castle-purple: #DDA0DD;
  --castle-gold: #FFD700;
  --castle-stone: #E8DCC8;
  --castle-wood: #8B6914;

  /* Character Colors */
  --sofi-pink: #FF69B4;
  --sofi-purple: #9B59B6;
  --krisi-blue: #4A90D9;
  --krisi-green: #2ECC71;

  /* Functional */
  --correct: #7DD87D;
  --incorrect: #FF7979;
  --text-warm: #4A3728;
  --text-light: #FFFFFF;

  /* Spacing */
  --tap-target-min: 80px;
}
```

### 1c. Font
Add "Baloo 2" (rounded, child-friendly, supports Cyrillic) via Google Fonts link in `index.html`.

---

## Phase 2: Castle Map — Welcome Screen Redesign

### What changes
Replace the current welcome screen (`#welcome-screen`) contents:
- Remove: tab system (games/lessons), flat grid of cards
- Add: An illustrated castle scene with tappable areas

### Castle Map Layout
```
┌─────────────────────────────┐
│  ☁    [Sticker Book]    ☁  │  ← sky with clouds
│         🏰                  │
│    Замъкът на               │
│    Софи и Криси             │  ← Title over castle
│                             │
│  ┌─────┐  ┌─────┐  ┌─────┐│
│  │🏫   │  │🎪   │  │🚂   ││  ← Three tappable areas
│  │Уроци│  │Игри │  │Влак- ││
│  │     │  │     │  │чета  ││
│  └─────┘  └─────┘  └─────┘│
│                             │
│   [Софи]         [Криси]   │  ← Characters flanking
│  ~~~~~~~~grass~~~~~~~~~     │
└─────────────────────────────┘
```

### Three main areas (replace tabs):
1. **Кулата на знанието** (Tower of Knowledge) — Lessons
   - Visual: A castle tower with a book
   - Links to: Letter lessons, Syllable lessons

2. **Площадката** (The Playground) — Games
   - Visual: Colorful playground area
   - Links to: Phonics, Vocab, Bubble, DragDrop, Sorting, Puzzle

3. **Гарата на Криси** (Krisi's Station) — Train-themed games
   - Visual: A little train station
   - Links to: Train Game, Build Word Game

### Implementation
- **HTML**: Replace `#welcome-screen` internals with castle scene divs
- **CSS**: Position areas absolutely within a relative container; castle background via CSS gradients and box-shadows; animated clouds and grass
- **JS**: Minimal changes — clicking an area opens a sub-menu (modal overlay or new screen) listing that area's games, then existing game launchers work as-is

### Sub-menu screens (new)
When tapping an area, show a game picker screen for that category:
- `#playground-menu-screen` — grid of playground games (6 games)
- `#station-menu-screen` — Train game + Build Word (2 games)
- Lessons: reuse existing `#lesson-select-screen` / `#syllable-select-screen`
  but add a chooser first (letters vs syllables) styled as castle theme

---

## Phase 3: Character Integration

### Welcome Screen
- Софи and Криси images flanking the castle (CSS positioned)
- Both have idle bounce animation
- Title: "Замъкът на Софи и Криси" (in handwritten-style font)

### Game Screens — Character Reactions
Replace the CSS-drawn Sofia character in results screens with actual character images:
- **Софи** appears in: Phonics, Vocab, Bubble, DragDrop, Sorting, Puzzle results
- **Криси** appears in: Train, Build Word results
- States: happy (3 stars), encouraging (1-2 stars)

### In-game Guide
Add a small character avatar in the corner of each game screen:
- Софи for her games, Криси for his
- Just a small circular avatar (40px), no interaction needed initially

---

## Phase 4: Themed Game Screens

### Global game screen changes
- Replace `back-btn` arrow with a castle home button
- Add character avatar top-right corner
- Themed borders/backgrounds per game area

### Per-game theming (CSS only, no logic changes):
1. **Phonics Game** — flower garden background accents
2. **Vocab Game** — treasure chest theme (find the treasure)
3. **Bubble Game** — balloon festival banner at top
4. **DragDrop Game** — castle window frame
5. **Train Game** — enhanced train station background (already brown track)
6. **Build Word** — kitchen/workshop theme
7. **Sorting Game** — two castle doors (red/blue)
8. **Puzzle Game** — bridge-building visual

*These are CSS background/border changes only — no game logic modifications.*

---

## Phase 5: Results Screens Redesign

### Current state
Results show CSS-drawn Sofia + stars + "Още!" button.

### New design
- Character image (Софи or Криси based on game)
- Speech bubble with encouraging message in Bulgarian
- Stars with animation
- Two buttons: "Още!" (Play again) and castle home icon
- Confetti on 3 stars (already exists)

---

## Phase 6: Polish & Micro-interactions

### Idle animations
- Characters bounce/wave on welcome screen
- Clouds drift across sky
- Castle flag waves (CSS animation)

### Tap feedback
- All tappable areas: scale(1.05) on :active
- Minimum tap target: 80px (CSS variable)

### Loading screen
- Replace "Зареждане..." with Софи and Криси waving
- Simple progress dots animation

---

## File Changes Summary

### Modified files:
1. **index.html** — Welcome screen HTML, add font link, add new sub-menu screens
2. **css/styles.css** — Theme variables, castle map styles, character styles, game theme overlays
3. **js/app.js** — New navigation functions for castle areas/sub-menus

### New files:
4. **images/** — Folder structure (initially with placeholder SVGs)

### NOT modified (game logic stays the same):
- js/games/*.js — All 8 game files untouched
- js/lessons/*.js — Lesson files untouched
- js/core/*.js — Core modules untouched
- words.json, config.json — Data files untouched

---

## Implementation Order

1. **Phase 1b**: Add CSS custom properties & font → 30 min
2. **Phase 2**: Castle map welcome screen → largest change, HTML + CSS + minimal JS
3. **Phase 3**: Character placeholders in welcome + results → HTML + CSS
4. **Phase 4**: Game screen theming → CSS only
5. **Phase 5**: Results redesign → HTML + CSS
6. **Phase 6**: Polish → CSS animations

Each phase is independently deployable — the app works after each step.
