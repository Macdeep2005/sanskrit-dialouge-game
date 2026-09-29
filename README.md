# Sanskrit Dialogue Game

An interactive, browser-based conversation game for practising Sanskrit through short, illustrated dialogues. Players listen to dialogue, choose a Sanskrit response, use optional learning hints, review mistakes, and unlock the next scenario.

The game is built as a single-page React application for the Zat.am portal. It currently contains **seven scenarios**, **67 referenced MP3 clips**, illustrated scene backgrounds, character art, Google sign-in, and optional daily leaderboard submission.

> The repository directory is named `sanskrit-dialouge-game` for historical reasons. The product name throughout the application is **Sanskrit Dialogue Game**.

## Contents

- [What players can do](#what-players-can-do)
- [Scenarios](#scenarios)
- [Run the project](#run-the-project)
- [Available commands](#available-commands)
- [Configuration and external services](#configuration-and-external-services)
- [How scoring and progress work](#how-scoring-and-progress-work)
- [Project map](#project-map)
- [Author or change dialogue content](#author-or-change-dialogue-content)
- [Add a new level](#add-a-new-level)
- [Manage audio and artwork](#manage-audio-and-artwork)
- [Build and deployment](#build-and-deployment)
- [Troubleshooting](#troubleshooting)
- [Repository notes](#repository-notes)

## What players can do

- Select an unlocked conversation from the persistent left-hand level rail.
- Enter an English name in Level 1 and have it transliterated to Devanagari for the introduction dialogue.
- Read the NPC prompt in Sanskrit, then listen to it with the speaker button.
- Choose a response from answers that are shuffled each time a dialogue node is shown.
- Listen to each available response before choosing it.
- Spend points to reveal the English translation or the correct response.
- Receive feedback after an incorrect answer, retry with a new answer order, or continue along the recovery path where one exists.
- Review every node answered incorrectly before the level can be completed.
- Adjust master volume from the settings button in the top bar.
- Sign in with Google/Zat.am and automatically submit the final score after the last level.

The interface includes keyboard-focus styles and responsive layouts for desktop, tablet, and mobile widths. Audio playback is initiated by player interaction, which keeps it compatible with normal browser autoplay rules.

## Scenarios

| # | Scenario | NPC | Conversation nodes | Referenced clips | Scene artwork |
| --- | --- | --- | ---: | ---: | --- |
| 1 | Introductions | Guide | 2 | 3 | Classroom |
| 2 | The Classroom | Teacher | 3 | 9 | Classroom |
| 3 | The Playground | Friend | 3 | 9 | Playground |
| 4 | The Fruit Market | Vendor | 4 | 10 | Fruit market |
| 5 | At the Restaurant | Waiter | 3 | 12 | Restaurant |
| 6 | Asking for Directions | Local | 3 | 12 | Directions street |
| 7 | The Bus Station | Ticket Clerk | 3 | 12 | Bus station |

Levels unlock in order: completing a level makes the next one available for the current browser session. The sidebar shows the active level, its completion state, and its number of dialogue nodes.

## Run the project

### Requirements

- Node.js **22**
- npm, or pnpm **10.34.3** (the pinned project toolchain)
- A modern browser with JavaScript and audio enabled

### Local development

With npm:

```bash
npm install
npm run dev
```

Or with pnpm:

```bash
pnpm install
pnpm dev
```

Vite serves the app on `http://localhost:8443` by default. In Figma Make, the development server is already started and the preview panel is the normal way to open it. The server respects the `PORT` and `FIGMA_DEV_SERVER_HOST` environment variables when supplied by the host.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Create the production bundle in `dist/`. |
| `npm run preview` | Serve the already-built production bundle locally. |
| `npm run format` | Format supported project files with `oxfmt`. |
| `npm run audio:all` | Generate every missing static dialogue clip through YourVoic. |
| `npm run audio:level2` | Alias for `audio:all`; it currently generates clips for every level, not only Level 2. |

There is no automated test or lint command defined in `package.json` at present. Use `npm run build` as the baseline verification step after changes.

## Configuration and external services

### Firebase: sign-in and leaderboard

`src/firebase-config.ts` initializes the Firebase project used by the application. The app uses:

- **Firebase Authentication** with `GoogleAuthProvider` and a popup sign-in flow.
- **Cloud Firestore** for final-score records.
- The collection **`leaderboard-zatamgame`** for scores.

At the end of Level 7, a signed-in player’s score is submitted under a document ID shaped like:

```text
<Firebase user ID>_sanskritDialogueGame_<YYYY-MM-DD>
```

Only the highest score for that player and UTC calendar day is retained. Each record contains `userId`, `playerName`, `email`, `photoURL`, `gameId`, `gameName`, `score`, `scoreDate`, and a server-generated `updatedAt` timestamp.

For a new Firebase project, update the configuration in `src/firebase-config.ts`, enable Google sign-in, add the deployed site’s domain to Firebase Authentication’s authorized domains, create Firestore, and deploy Firestore security rules appropriate for the leaderboard. Firebase web configuration is intentionally sent to browsers; the security of the data must come from Authentication and Firestore rules, not from hiding the client configuration.

### Name transliteration

Level 1 sends the player’s entered name to the Google Input Tools transliteration endpoint and requests a Devanagari suggestion. This needs internet access at play time. If the request fails, the game keeps the player on the name form and displays an error instead of advancing.

### YourVoic audio generation

The browser app does **not** require environment variables to play the MP3 files already committed in `public/audio/`. Audio generation does require a local `.env.local` file:

```dotenv
YOURVOIC_API_KEY=your_key_here
# Optional values; these are the script defaults.
YOURVOIC_VOICE=Deepti
YOURVOIC_ENGLISH_VOICE=Kylie
YOURVOIC_MODEL=aura-lite
```

`.env.local` is git-ignored. Never commit an API key.

`scripts/download-level2-audio.mjs` reads `src/data/levels.json`, collects NPC and answer audio paths, skips existing non-empty files, and asks YourVoic to generate the missing clips. It chooses Sanskrit or English voice/language from the clip text, retries rate-limited requests, writes to a temporary `.part` file first, and renames it only after a successful download. Dynamic name lines use an authored static template because an individual player name cannot have a pre-generated MP3.

#### Audio API used

The generation script uses the **YourVoic text-to-speech REST API**:

```text
POST https://yourvoic.com/api/v1/tts/generate
```

It sends an `X-API-Key` header and JSON body containing `text`, `voice`, `language`, `model`, `speed`, `pitch`, and `format: "mp3"`. The script selects `sa-IN` and the configured Sanskrit voice when the text includes Devanagari characters; otherwise it sends `en-US` and the configured English voice. Do not call this endpoint from the browser or place its API key in client-side code—the included Node.js script keeps the key in local environment configuration.

## How scoring and progress work

| Event | Effect |
| --- | --- |
| Complete a level for the first time in this app session | +50 points |
| Choose an incorrect response | −10 points, never below 0 |
| Reveal the English translation at a node | −5 points, once per node |
| Reveal the correct response at a node | −10 points, once per node |
| Replay an already-awarded level | No additional completion points |
| Reach the end after any mistakes | Review each mistaken node before the completion panel appears |
| Complete Level 7 while signed in | Attempt to submit the final score to Firestore |

Completion, unlocks, player name, and points are held in React state. They reset when the page is refreshed; the current code does not save local progress or scores between browser sessions. A replay resets the level’s conversation state and errors, but not the session’s awarded-level record or point total.

## Project map

```text
.
├── public/
│   ├── audio/                 # MP3 clips grouped by scenario
│   ├── backgrounds/           # Full-scene illustrations
│   └── characters/            # Player and NPC sprite artwork
├── scripts/
│   └── download-level2-audio.mjs
├── src/
│   ├── components/
│   │   ├── GameScene.tsx      # Dialogue engine, audio, hints, review, settings
│   │   ├── LevelComplete.tsx  # Completion overlay and actions
│   │   ├── CharacterSprite.tsx
│   │   └── Icon.tsx
│   ├── data/
│   │   ├── levels.json        # All scenario, node, choice, copy, and asset data
│   │   └── gameData.ts        # Typed export of levels.json
│   ├── hooks/
│   │   ├── useAuth.ts         # Firebase authentication state and popup sign-in
│   │   └── useLeaderboard.ts  # Score submission UI state
│   ├── services/
│   │   └── leaderboardService.ts
│   ├── styles/
│   │   ├── global.css         # Portal shell, level rail, shared controls
│   │   └── game.css           # Scene, dialogue, choice, hint, and overlay styling
│   ├── types/gameTypes.ts     # TypeScript contracts for level data
│   ├── utils/transliterateName.ts
│   ├── firebase-config.ts
│   ├── App.tsx                # App shell, points, unlocking, auth coordination
│   └── main.tsx               # React entry point
├── index.html                 # Vite document shell
├── vite.config.ts             # Vite, React, Tailwind, Figma Make configuration
├── .mise.toml                 # Node and pnpm versions
└── package.json
```

### Runtime architecture

`src/main.tsx` mounts `<App />` in React Strict Mode. `App.tsx` owns the active level, session points, completed level IDs, player name, top-bar settings state, authentication, and leaderboard submission. It passes the selected level to `GameScene.tsx`, which owns the per-level dialogue state.

The app reads the JSON once through `src/data/gameData.ts` and treats it as the `Level[]` type defined in `src/types/gameTypes.ts`. Artwork and audio use paths relative to the public root, such as `./backgrounds/classroom.png` and `/audio/level2/c1_npc.mp3`.

Tailwind CSS v4 is installed and configured through the Vite plugin, but the current game UI is styled primarily through the two CSS files in `src/styles/`. The `@` alias resolves to `src/`.

## Author or change dialogue content

All playable content lives in [`src/data/levels.json`](src/data/levels.json). Do not hard-code a new scenario in a React component; add or modify its data instead.

### Data model

Each level has this shape:

```ts
interface Level {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  thumbnailImage: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

interface DialogueNode {
  id: string;
  speaker: string;
  npcText: string;
  npcTranslation: string;
  npcAudioPath: string;
  backgroundImage: string;
  npcSprite: string;
  playerSprite: string;
  requiresNameInput?: boolean;
  hint?: { enabled: boolean; type: string; text: string; cost: number };
  choices: Choice[];
}

interface Choice {
  id: string;
  choiceText: string;
  choiceTranslation: string;
  choiceAudioPath: string;
  isCorrect: boolean;
  feedback?: string;
  nextNodeId: string | 'END';
}
```

### Rules for dialogue nodes

1. Add a unique level `id`, append the level to the JSON array, and point `startNodeId` to a node in its `nodes` object. Level ordering in the file is the unlock order.
2. Give every node a matching `id` and object key, valid image paths, NPC text/translation, and an audio path (or an empty string if no NPC audio should be offered).
3. Give every answer a unique node-local `id`, a Sanskrit answer, English translation, `isCorrect` value, and `nextNodeId`.
4. Set `nextNodeId` to another node key or exactly `END`. A node with no choices renders a **Finish Level** button.
5. Set `requiresNameInput: true` only for the name-entry node. The tokens `{name}` and `{sanskritName}` in node/choice text are replaced at runtime with the player’s entered name and transliterated name.
6. Supply helpful `feedback` for incorrect answers. The game falls back to a generic message when it is omitted.
7. Use the same background and sprite paths for a coherent scene, or deliberately switch them between nodes to change the scene.
8. Run `npm run build` after editing JSON so invalid JSON and bundling problems are caught before release.

The game shows English text only when the player uses the English hint. It ignores the optional per-node `hint` object at runtime today; the interface currently uses the fixed costs described in [How scoring and progress work](#how-scoring-and-progress-work).

## Add a new level

Follow this sequence to add another playable scenario without changing the dialogue engine:

1. Choose the next numeric `id`. The array order in `levels.json` determines unlock order, so append the level after the current last level unless you intentionally want to change that order.
2. Add a scene image to `public/backgrounds/` and player/NPC art to `public/characters/`, or reuse an existing asset. Keep the existing `./backgrounds/...` and `./characters/...` path style.
3. Create a new audio folder, such as `public/audio/level7/`, and choose stable filenames for the NPC and each answer—for example, `m1_npc.mp3`, `m1a.mp3`, and `m1b.mp3`.
4. Append a level object to `src/data/levels.json`. Give it a valid `startNodeId`, and add all reachable nodes to its `nodes` object.
5. Define at least one correct choice at every answer node, mark alternatives with `isCorrect: false`, and point every `nextNodeId` to an existing node or `END`.
6. Add the audio paths to the node and choice data. Run `npm run audio:all` to create missing static clips, or place recorded MP3 files at those exact paths.
7. Open the game, complete the immediately preceding level to unlock the new one, exercise correct and incorrect branches, test the final review loop and audio buttons, then run `npm run build`.

Use this minimal JSON pattern as a starting point. Replace the copy, paths, and identifiers with your scenario’s content:

```json
{
  "id": 8,
  "title": "Level 8",
  "subtitle": "My New Scenario",
  "icon": "market",
  "accentColor": "#0ea5e9",
  "thumbnailImage": "./backgrounds/my-scene.png",
  "startNodeId": "m1",
  "nodes": {
    "m1": {
      "id": "m1",
      "speaker": "Guide",
      "npcText": "संवादस्य आरम्भः।",
      "npcTranslation": "The conversation begins.",
      "npcAudioPath": "./audio/level7/m1_npc.mp3",
      "backgroundImage": "./backgrounds/my-scene.png",
      "npcSprite": "./characters/guide.png",
      "playerSprite": "./characters/player.png",
      "choices": [
        {
          "id": "m1a",
          "choiceText": "आम्।",
          "choiceTranslation": "Yes.",
          "choiceAudioPath": "./audio/level7/m1a.mp3",
          "isCorrect": true,
          "nextNodeId": "END"
        },
        {
          "id": "m1b",
          "choiceText": "न।",
          "choiceTranslation": "No.",
          "choiceAudioPath": "./audio/level7/m1b.mp3",
          "isCorrect": false,
          "feedback": "Try the affirmative response.",
          "nextNodeId": "END"
        }
      ]
    }
  }
}
```

The level’s `icon` and `accentColor` fields are retained in the content model but are not currently rendered by the sidebar. `thumbnailImage`, `title`, `subtitle`, dialogue nodes, and asset paths are used in the active UI.

### Conversation flow in the current content

| Level | Node flow |
| --- | --- |
| 1 | `i1` (name input) → `i2` → `END` |
| 2 | `c1` → `c2a` or `c2b` → `END` |
| 3 | `p1` → `p2a` or `p2b` → `END` |
| 4 | `f1` → `f2a` or `f2b`; `f2b` → `f3`; then `END` or the Finish Level button |
| 5 | `r1` → `r2` → `r3` → `END` |
| 6 | `d1` → `d2` → `d3` → `END` |
| 7 | `b1` → `b2` → `b3` → `END` |

For an incorrect response, the game stores the current node as a mistake. **Try Again** stays at that node and reshuffles its answers; **Continue with help** follows the incorrect answer’s configured `nextNodeId` when that target is not `END`. At an ending node, mistakes trigger the review loop before completion.

## Manage audio and artwork

### Audio locations

The audio filenames are referenced directly in `levels.json`:

| Scenario | Directory | Prefix |
| --- | --- | --- |
| Introductions | `public/audio/intro/` | `i` |
| The Classroom | `public/audio/level1/` | `c` |
| The Playground | `public/audio/level2/` | `p` |
| The Fruit Market | `public/audio/level3/` | `f` |
| At the Restaurant | `public/audio/level4/` | `r` |
| Asking for Directions | `public/audio/level5/` | `d` |
| The Bus Station | `public/audio/level6/` | `b` |

Put a clip at the exact path named by `npcAudioPath` or `choiceAudioPath`. The browser renders a play button only when that field has a value. MP3 files are tracked through Git LFS according to `.gitattributes`; make sure Git LFS is installed before adding or cloning large media assets.

### Artwork locations

Scene backgrounds live in `public/backgrounds/` and character images live in `public/characters/`. Current background files are:

```text
bus-station.png       classroom.png        directions-street.png
fruit-market.png      playground.png       restaurant.png
```

The repository also contains `classroom.webp`, `fruit-market.webp`, and `playground.webp`; the current level data references the PNG versions. Character files are mapped directly in the content data: `customer`, `friend`, `local-person`, `passenger`, `player`, `restaurant-customer`, `student`, `teacher`, `ticket-clerk`, `traveler`, `vendor`, and `waiter`.

When replacing an asset, preserve the aspect ratio and test the scene at both desktop and mobile widths. To add an asset, place it under `public/`, reference it with the existing relative-path convention, and verify it in the running game.

## Build and deployment

Create a production bundle with:

```bash
npm run build
```

The build output is `dist/` and is intentionally ignored by Git. Vite is configured with `base: './'`, so generated asset URLs are relative and the game can be hosted from a subdirectory. Figma Make-specific Vite plugins add site metadata, an optional robots response, preview tooling, and development error-overlay support.

Before deploying outside Figma Make:

1. Build the project successfully.
2. Upload the contents of `dist/` to a static host that serves the app’s entry page for the intended route.
3. Configure the deployment hostname in Firebase Authentication’s authorized domains.
4. Confirm that Firestore security rules permit only the intended leaderboard writes.
5. Test Google sign-in, transliteration, audio controls, responsive layout, the final-level score submission, and an anonymous-player flow on the deployed URL.

The current Figma Make site configuration has `robots.index` set to `false`; production builds therefore emit a `robots.txt` that disallows indexing. Change `.figma/make/site.json` deliberately if a public, indexable release is intended.

## Troubleshooting

| Symptom | Likely cause and resolution |
| --- | --- |
| `npm run dev` cannot use port 8443 | Another process is using the configured port. Stop that process or set `PORT` to an available port. |
| Google sign-in popup fails | Verify Firebase configuration, enabled Google provider, the deployed domain in authorized domains, and browser popup permissions. |
| “Could not submit score.” | Check sign-in status, network access, Firestore availability, and Firestore security rules for `leaderboard-zatamgame`. |
| A name cannot be converted | The Google Input Tools request needs network access. Retry later or check that the browser can reach the endpoint. |
| A speaker button has no sound | Confirm the referenced path in `levels.json`, the MP3’s existence under `public/`, browser volume, and that the file is not an unresolved Git LFS pointer. |
| Audio generation reports a missing key | Add `YOURVOIC_API_KEY` to `.env.local`, then rerun `npm run audio:all`. |
| Audio generation skips a clip you wanted to regenerate | The script intentionally preserves non-empty output files. Replace or remove that specific clip manually, then rerun the command. |
| Progress disappeared after refresh | This is expected: unlocks, points, and completion state are session-only React state. |
| A level cannot be selected | Finish the immediately preceding level in the current session to unlock it. |

## Repository notes

- The project is private (`"private": true` in `package.json`).
- Source code uses TypeScript in strict mode and React 19.
- Static binaries such as PNG, WebP, and MP3 files are configured for Git LFS.
- `dist/`, dependencies, `.env*` files, caches, logs, and Figma design context are ignored by Git.
- No license file is present in the repository. Add an explicit license before publishing or accepting external contributions.

## Contributing checklist

1. Keep dialogue content, asset paths, and audio paths consistent.
2. Do not commit secrets or `.env.local`.
3. Use Git LFS for new binary media.
4. Check the game in the preview at desktop and mobile widths.
5. Run `npm run format` when formatting source files.
6. Run `npm run build` before opening a pull request or deploying.
