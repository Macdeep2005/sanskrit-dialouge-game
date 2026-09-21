# One-page Zat.am layout

This version is designed as one embedded game page for the Zat.am portal.

## Layout

Top bar:
- Sanskrit Dialogue title
- User
- Points
- Stars
- Settings

Left sidebar:
- Vertical level cards
- Scrollable with `overflow-y: auto`
- Level preview image
- Level number/title
- Completed indicator
- Click a level to load it

Main area:
- Current dialogue game
- Characters
- Dialogue bubble
- Response choices

## Files to edit

`src/App.tsx`
Controls the one-page shell and level selection.

`src/styles/global.css`
Contains the top bar and vertical sidebar styles.

`src/components/GameScene.tsx`
Contains dialogue functionality.

`src/styles/game.css`
Contains gameplay layout/styles.
