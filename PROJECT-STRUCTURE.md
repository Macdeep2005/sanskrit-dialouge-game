# Sanskrit Dialogue Game structure

## Pages
- `src/pages/LevelSelectPage.tsx` — interactive level selection page.
- `src/pages/Level1Page.tsx` — Classroom level.
- `src/pages/Level2Page.tsx` — Playground level.
- `src/pages/Level3Page.tsx` — Fruit Market level.

## Components
- `src/components/GameScene.tsx` — dialogue state, branching, audio playback, user top bar and settings.
- `src/components/LevelComplete.tsx` — Play Again / Next Level / Level Select.
- `src/components/CharacterSprite.tsx` — character image mapping.
- `src/components/Icon.tsx` — SVG icons used instead of emoji.

## Data
- `src/data/gameData.ts` — Sanskrit, English, audio paths and branching.

## Styles
All styling is in `src/styles/`:
- `global.css`
- `auth.css`
- `forms.css`
- `levels.css`
- `game.css`

The palette uses:
`#1E293B`, `#E2E8F0`, `#FFFFFF`, `#64748B`, `#B45309`, `#D97706`,
`#115E59`, white at 60%, white at 53%, `#2DD4BF`, and `#EFE9DC`.

## Audio
Put MP3 files in:
- `public/audio/level1/`
- `public/audio/level2/`
- `public/audio/level3/`

The filenames are already referenced inside `src/data/gameData.ts`.

## Points and stars
Each level awards 50 points and 3 stars the first time it is completed during the current session.
The player name, points, and stars appear in the level menu and the in-game top bar.
