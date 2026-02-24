# SUMTEO

Prototype UI for a reading habit app with a forest scene and focus timer.

## Implemented

- Next.js App Router (PWA)
- Phaser forest scene
- Focus timer with visibility detection
- Capture modal UI
- Wallet button component (EVM stub)
- Basic layout and styles

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
sumteo/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React Components
│   │   ├── Timer.tsx        # Focus Timer
│   │   ├── WalletButton.tsx # Wallet Button (EVM stub)
│   │   ├── CaptureModal.tsx # Photo Capture UI
│   │   └── GameCanvas.tsx   # Phaser Wrapper
│   ├── game/                # Phaser Scenes
│   │   └── ForestScene.ts   # Forest Scene
│   ├── hooks/               # Custom Hooks
│   │   └── useTimer.ts      # Timer Logic
│   └── lib/                 # Utilities
│       └── wagmi.ts         # Chain config (EVM stub)
└── public/
    └── manifest.json        # PWA Manifest
```
