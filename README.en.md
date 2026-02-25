# SUMTEO — A Social Reading Platform Where Books Grow Into Forests

[Korean version](README.md)

> "When was the last time you actually finished a book?"

6 out of 10 adults fail to finish even one book per year (Korea Ministry of Culture, 2023 National Reading Survey). The problem isn't willpower — it's reading alone. Just as studying in a cafe somehow makes you focus better, Sumteo recreates "reading together" digitally.

## Core Concept

### Set Goals → Read → Grow Trees → Mint cNFT

- Set your own reading goal when starting a book ("finish in 2 weeks", "read 30 min daily")
- Verify reading progress with camera capture after each session
- Progress directly maps to tree growth — halfway through the book, tree is half grown
- Finish a book → tree blooms → **Solana cNFT minted** (Metaplex Bubblegum)
- Every reading session stored on-chain as **Proof of Reading** (SPL Memo)

### Social Presence (Key Differentiator)

Unlike Read-to-Earn platforms (Read2N etc.), Sumteo's core motivation is **social presence, not token rewards**.

- Sit in the reading space and see others reading right now
- Live reader dashboard: who's reading what, and for how long
- Inspired by millions watching lo-fi study streams — "alone, but together"
- Visit friends' gardens and water their trees to encourage them

### Solo & Team Goals

- **Solo**: "Grow 3 trees this month"
- **Team**: Create a team garden and achieve goals together

## Why Solana

| | Regular NFT | Solana cNFT |
|---|---|---|
| Mint cost | ~$2.00 | **< $0.001** |
| Finality | 10s~minutes | **0.4s** |
| User experience | Gas fee friction | **Invisible cost** |

Compressed NFTs (cNFTs) use state compression to achieve **1000x cost reduction** vs regular NFTs. Mint a tree for every book you finish with zero cost concern.

## Market Size

- **TAM**: Global digital reading market $23B (Statista, 2024)
- **SAM**: Social/gamified reading apps $2.3B (10%, includes Goodreads, reading challenges)
- **SOM**: Web3 social reading (cNFT collection + social presence) $230M — initial target: Korean & Japanese Gen MZ reading communities

## Revenue Model

1. Premium subscription (team garden expansion, rare tree cNFTs)
2. Tree NFT IP-based merchandise (stickers, collectible cards, postcards)
3. Publisher/author partnerships (reading challenge sponsors)
4. Reading data-driven recommendation service

## Implemented

### Frontend
- Next.js App Router + TypeScript mobile-first UI
- Phaser 3 garden visualization (trees, cabin, fireflies, character breathing animations)
- Focus timer with visibility-based pause detection
- Camera capture for reading verification

### On-chain (Solana Devnet)
- **cNFT Minting**: Metaplex Bubblegum compressed NFT trees on book completion
- **Proof of Reading**: SPL Memo program for on-chain reading records
- **Reading Garden**: Merkle tree-based garden (up to 8 cNFTs)
- Solana wallet connect (Phantom, Solflare)

### Social
- Live reader presence (names, books, reading time)
- Activity feed (join notifications, chapter completion)
- Real-time reader count

## Next Steps

- Garden visiting and tree watering
- Team gardens and shared goals
- Reading progress-based tree growth visualization (staged animations)
- Passage sharing and one-line reflections

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

## Demo Flow

1. Click **Select Wallet** → Connect Phantom/Solflare (Devnet)
2. Start focus timer → complete → camera verification
3. Click **Mint & Record On-chain** → Proof of Reading record + cNFT mint
4. Check on-chain transactions via Solana Explorer links

## Project Structure

```
sumteo/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React Components
│   │   ├── Timer.tsx           # Focus Timer
│   │   ├── WalletButton.tsx    # Solana Wallet Button
│   │   ├── CaptureModal.tsx    # Photo Capture UI
│   │   ├── MintTreeButton.tsx  # cNFT Minting UI
│   │   └── GameCanvas.tsx      # Phaser Wrapper
│   ├── game/                   # Phaser Scenes
│   │   └── ForestScene.ts      # Garden Scene
│   ├── hooks/                  # Custom Hooks
│   │   ├── useTimer.ts         # Timer Logic
│   │   └── useReadingRoom.ts   # Social Presence
│   └── lib/solana/             # Solana Integration
│       ├── cnft.ts             # cNFT Minting (Bubblegum)
│       └── proof.ts            # Proof of Reading (Memo)
└── public/
    └── manifest.json           # PWA Manifest
```
