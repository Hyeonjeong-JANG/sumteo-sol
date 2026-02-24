# SUMTEO - Onchain Reading Garden (Solana)

> "Time becomes ink, and reading becomes a forest."

SUMTEO is a social reading platform where reflections become onchain NFTs and completed books grow into unique trees. It is designed for high-frequency, low-cost minting on Solana.

---

## Problem

- People start books but rarely finish them.
- Reading is lonely, so consistency drops.
- Reading history disappears across apps.

---

## Solution

SUMTEO turns reading into visible, social growth.

### Core Loop

| Element | Description |
| --- | --- |
| **Focus Timer** | 30-minute reading session with background detection |
| **Reflection** | Save a favorite line + one sentence of why it mattered |
| **Reflection NFT** | Hash + metadata minted on Solana |
| **Tree DNA** | Reflections shape a unique tree per book |
| **Team Forest** | Weekly goals grow a shared tree |

---

## Why Solana

- Low mint cost for frequent reflections
- Fast confirmations for consumer UX
- Strong NFT ecosystem for personal identity

---

## Demo Features

### 1. Forest Metaverse UI

Phaser-based forest scene with ambient animations.

### 2. Focus Timer

30-minute focus timer with background detection.

### 3. Reflection Input

Favorite line + one sentence reflection.

### 4. Garden Sharing (planned)

Shareable garden view and tree inspection.

### 5. Team Forest (planned)

Weekly shared tree for groups.

---

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | **Next.js 16 (PWA)** | Mobile/desktop, installable app |
| Game Engine | **Phaser.js** | Forest UI and animations |
| Blockchain | **Solana (planned)** | Reflection NFT minting |
| Wallet | **Solana Wallet Adapter (planned)** | Phantom, Backpack |
| AI/OCR | **Google Vision (optional)** | Page number extraction |

---

## How It Works

```
Daily Routine
1. Start Timer (30 min)
2. Read
3. Save a favorite line + 1 sentence
4. Mint Reflection NFT (hash + metadata)
5. Complete a book -> tree grows
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
sumteo/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React Components
│   │   ├── Timer.tsx        # Focus Timer
│   │   ├── WalletButton.tsx # Wallet Connection (EVM stub)
│   │   ├── CaptureModal.tsx # Photo Capture (optional)
│   │   └── GameCanvas.tsx   # Phaser Wrapper
│   ├── game/                # Phaser Scenes
│   │   └── ForestScene.ts   # Forest Metaverse
│   ├── hooks/               # Custom Hooks
│   │   └── useTimer.ts      # Timer Logic
│   └── lib/                 # Utilities
│       └── wagmi.ts         # Chain config (to be replaced)
└── public/
    └── manifest.json        # PWA Manifest
```

---

## Roadmap

- [x] PWA + Responsive UI
- [x] Phaser forest scene
- [x] Focus timer with background detection
- [ ] Reflection input persistence
- [ ] Tree DNA generator
- [ ] Solana minting
- [ ] Team forest + sharing
- [ ] Discussion space

---

## Team

Built for Solana ecosystem submissions.
