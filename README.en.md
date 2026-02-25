# SUMTEO — A Social Reading Platform Where Books Grow Into Forests

[Korean version](README.md)

Your own garden and reading space. Set a goal when you start a new book — a sapling is planted. After each reading session, submit your progress. The tree grows in proportion to how far you've read. Finish the book and the tree blooms, minted as a Solana cNFT.

## Core Concept

### Set Goals → Read → Grow Trees

- Set your own reading goal when starting a book ("finish in 2 weeks", "read 30 min daily")
- Submit reading progress after each session
- Progress directly maps to tree growth — halfway through the book, tree is half grown
- Finish a book → tree blooms → cNFT minted
- Start next book → new sapling planted

### Reading Together

- Sit in the reading space and see others reading right now
- Read in your own garden or visit a friend's garden to read together
- Read together anywhere — no boundaries between gardens
- Water a friend's tree to send encouragement
- Share favorite passages and one-line reflections

### Solo & Team Goals

- **Solo**: "Grow 3 trees this month"
- **Team**: Create a team garden and achieve goals together

## Why Solana

- cNFT (Compressed NFT) minted on each book completion — state compression keeps cost under $0.001
- Real-time social interactions (garden visits, watering, passage recording) — 400ms finality
- Users never think about gas fees — seamless on-chain experience

## Revenue Model

1. Premium subscription (team garden expansion, rare tree cNFTs)
2. Tree NFT IP-based merchandise (stickers, collectible cards, postcards)
3. Publisher/author partnerships (reading challenge sponsors)
4. Reading data-driven recommendation service

## Implemented

- Next.js App Router + TypeScript mobile-first UI
- Phaser 3 garden visualization (trees, cabin, firefly animations)
- Focus timer with visibility-based pause detection
- Camera capture for reading verification
- Solana wallet connect (Phantom, Solflare)

## Next Steps

- On-chain cNFT minting (tree NFT on book completion)
- Real-time co-reading (see other users in your garden)
- Garden visiting and tree watering
- Team gardens and shared goals

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
2. Connect Phantom/Solflare
3. Start the timer → capture modal appears on completion

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
│   │   └── ForestScene.ts   # Garden Scene
│   └── hooks/               # Custom Hooks
│       └── useTimer.ts      # Timer Logic
└── public/
    └── manifest.json        # PWA Manifest
```
