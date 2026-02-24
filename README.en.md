# SUMTEO

[Korean version](README.md)

Prototype UI for a reading habit app with a forest scene, focus timer, and Solana wallet connect.

## Implemented

- Next.js App Router
- Phaser forest scene
- Focus timer with visibility detection
- Capture modal UI
- Solana wallet connect (Phantom, Solflare, Backpack)
- Basic layout/styles

## Solana Setup

- Default network: `devnet`
- Optional env vars:
  - `NEXT_PUBLIC_SOLANA_NETWORK=devnet|testnet|mainnet-beta`
  - `NEXT_PUBLIC_SOLANA_RPC=https://...`

Create `.env.local` if you want to override the defaults.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Verify

1. Click **Select Wallet**
2. Connect Phantom/Solflare/Backpack
3. Start the timer -> capture modal appears on completion

## Project Structure

```
sumteo/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React Components
│   │   ├── Timer.tsx        # Focus Timer
│   │   ├── WalletButton.tsx # Solana Wallet Button
│   │   ├── CaptureModal.tsx # Photo Capture UI
│   │   └── GameCanvas.tsx   # Phaser Wrapper
│   ├── game/                # Phaser Scenes
│   │   └── ForestScene.ts   # Forest Scene
│   └── hooks/               # Custom Hooks
│       └── useTimer.ts      # Timer Logic
└── public/
    └── manifest.json        # PWA Manifest
```
