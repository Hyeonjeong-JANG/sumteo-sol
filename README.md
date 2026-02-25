# SUMTEO 숨터 — 독서가 숲이 되는 소셜 리딩 플랫폼

[English version](README.en.md)

나만의 정원과 독서 공간이 있습니다. 새 책을 시작할 때 목표를 정하면 묘목이 심어지고, 독서 세션마다 어디까지 읽었는지 인증하면 진행도에 따라 나무가 자랍니다. 완독하면 나무가 만개하며 솔라나 cNFT로 발행됩니다.

## 핵심 컨셉

### 목표 설정 → 독서 → 나무 성장

- 책을 시작할 때 나만의 목표를 설정 ('2주 안에 완독', '매일 30분')
- 독서 세션을 마칠 때마다 어디까지 읽었는지 진행도 인증
- 진행도가 나무 성장과 직접 연결 — 절반 읽으면 나무도 절반 성장
- 완독 → 나무 만개 → cNFT 발행
- 다음 책 시작 → 새 묘목

### 함께 읽는 경험

- 독서 공간에 앉으면 지금 같이 읽고 있는 사람들이 보임
- 내 정원에서 읽어도, 친구 정원에 놀러 가서 읽어도 됨
- 어디에 있든 함께 책을 읽을 수 있음
- 정원을 오가며 친구의 나무에 물을 주고 응원
- 인상 깊은 구절과 한 줄 감상 공유

### 개인 & 팀 목표

- **개인**: "이번 달 3그루 키우기"
- **팀**: 팀 정원을 만들어 함께 목표 달성

## 왜 솔라나인가

- 완독 시 cNFT(Compressed NFT) 발행 — 상태 압축으로 비용 $0.001 미만
- 구절 기록, 정원 방문, 물주기 등 실시간 인터랙션 — 400ms 파이널리티
- 사용자가 가스비를 의식하지 않는 자연스러운 온체인 경험

## 수익 모델

1. 프리미엄 구독 (팀 정원 확장, 희귀 나무 cNFT)
2. 나무 NFT IP 기반 굿즈 판매 (띠부띠부씰, 스티커, 엽서)
3. 출판사/작가 파트너십 (독서 챌린지 스폰서)
4. 독서 데이터 기반 추천 서비스

## 구현된 기능

- Next.js App Router + TypeScript 모바일 퍼스트 UI
- Phaser 3 기반 정원 시각화 (나무, 오두막, 반딧불이 애니메이션)
- 집중 타이머 (탭 이탈 감지 기반 일시정지)
- 카메라 촬영 독서 인증
- Solana 지갑 연결 (Phantom, Solflare)

## 다음 단계

- 온체인 cNFT 발행 (완독 시 나무 NFT)
- 실시간 함께 읽기 (정원 내 다른 사용자 표시)
- 정원 방문 및 물주기
- 팀 정원 및 공동 목표

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
│   │   └── ForestScene.ts   # Garden Scene
│   └── hooks/               # Custom Hooks
│       └── useTimer.ts      # Timer Logic
└── public/
    └── manifest.json        # PWA Manifest
```
