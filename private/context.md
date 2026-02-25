# SUMTEO context (private)

Purpose
- This file is a handoff summary to resume work quickly in a new session.

Project
- Name: SUMTEO Reading Garden
- Goal: a social reading garden where a saved line grows into a tree.
- Modes: personal + team can be used at the same time.

Repos
- Solana repo: git@github.com:Hyeonjeong-JANG/sumteo-sol.git
- Avalanche repo: git@github.com:Hyeonjeong-JANG/sumteo-aval.git

Current state (Solana repo)
- Solana wallet adapter integrated (Phantom, Solflare).
- Wallet UI styles are imported in src/app/layout.tsx (not globals.css).
- Backpack adapter removed because it is not exported by wallet-adapter-wallets.
- README.md / README.en.md updated for personal + team modes.
- Reading space demo added to ForestScene (benches, 3 characters, breathing animation, sapling).
- "함께 읽는 중 3명" social badge added to page.tsx next to INK balance.

Key files
- src/components/Providers.tsx (Solana wallet providers)
- src/components/WalletButton.tsx (WalletMultiButton)
- src/app/layout.tsx (imports wallet-adapter styles)
- src/app/page.tsx (UI overlay — INK balance, social badge, timer)
- src/game/ForestScene.ts (Phaser scene — forest, cabin, reading space, characters)
- README.md / README.en.md (product description)

How to run
- npm install
- npm run dev
- Open http://localhost:3000

Build check
- npm run build (last run succeeded)

Notes
- CSS build error fixed by moving wallet-adapter styles import to layout.tsx.
- If you add Google Fonts via @import, it must be at the top of the CSS file.

Reading space details
- 3 benches (left, center, right of cabin), drawn with Graphics rectangles.
- 3 characters: 친구1 (gold), 나 (emerald), 친구2 (amber).
- Each character: circle head + rect body + book rect + name label text.
- Breathing tween animation (Sine.easeInOut, yoyo, 1.8–2.6s).
- Sapling next to "나" for reading progress visualization.
- Social badge: green pulsing dot + "함께 읽는 중 3명" in page.tsx.

Next ideas
- Keep README aligned with personal + team mode copy.
- Add slide deck if needed (not committed).
- Avalanche chain integration (separate repo).
