# SUMTEO 독서정원 (SUMTEO Reading Garden)

[English version](README.en.md)

읽고 남긴 한 줄이 나무가 되어 자라는 소셜 독서 정원.
개인 모드와 팀 모드를 동시에 사용할 수 있습니다.

## 개인 모드

- 30분 독서 타이머로 루틴 시작
- 구절 + 한 줄 이유 기록
- 나무 성장 연출과 개인 정원 축적

## 팀 모드

- 팀 숲 생성 및 주간 목표
- 팀 공동 나무 성장
- 팀원 활동 현황 공유
- 서로의 정원 방문, 물 주기, 구절 열람

## 모바일 UX 구조

- 홈/정원: 내 숲, 오늘 목표, 바로 시작 버튼
- 읽기 세션: 30분 타이머 + 포커스 감지
- 기록: 좋아한 구절 + 한 줄 이유 입력
- 성장 결과: 나무 성장 연출 + 오늘 기록 저장
- 팀 숲: 주간 목표, 공동 나무, 팀 활동 현황
- 방문/탐색: 다른 사람 정원 보기, 물 주기, 구절 열람

## 구현된 기능

- Next.js App Router
- Phaser 숲 씬
- 포커스 타이머 (visibility 기반)
- 캡처 모달 UI
- Solana 지갑 연결 (Phantom, Solflare)
- 기본 레이아웃/스타일

## Solana 설정

- 기본 네트워크: `devnet`
- 선택 환경변수:
  - `NEXT_PUBLIC_SOLANA_NETWORK=devnet|testnet|mainnet-beta`
  - `NEXT_PUBLIC_SOLANA_RPC=https://...`

필요하면 `.env.local`을 생성해 설정하세요.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000

## 확인 방법

1. 상단 **Select Wallet** 클릭
2. Phantom/Solflare 연결
3. 타이머 시작 → 완료 후 캡처 모달 표시

## 프로젝트 구조

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
