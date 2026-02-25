# SUMTEO 숨터 — 독서가 숲이 되는 소셜 리딩 플랫폼

[English version](README.en.md)

> "마지막으로 책을 끝까지 읽은 게 언제인가요?"

성인 10명 중 6명이 1년에 책 한 권도 완독하지 못합니다 (문화체육관광부, 2023 국민독서실태조사). 문제는 의지가 아니라 혼자라서입니다. 카페에 가면 신기하게 책이 잘 읽히는 것처럼, 숨터는 '함께 읽는 경험'을 디지털로 재현합니다.

## 핵심 컨셉

### 목표 설정 → 독서 → 나무 성장 → cNFT 발행

- 책을 시작할 때 나만의 목표를 설정 ('2주 안에 완독', '매일 30분')
- 독서 세션을 마칠 때마다 카메라로 진행도 인증
- 진행도가 나무 성장과 직접 연결 — 절반 읽으면 나무도 절반 성장
- 완독 → 나무 만개 → **Solana cNFT 발행** (Metaplex Bubblegum)
- 모든 독서 기록이 **Proof of Reading**으로 온체인 저장 (SPL Memo)

### 함께 읽는 경험 (Social Presence)

Read-to-Earn(Read2N 등)과의 핵심 차별점: 숨터는 **보상이 아닌 사회적 존재감**이 동기입니다.

- 독서 공간에 앉으면 지금 같이 읽고 있는 사람들이 보임
- 실시간 리더 현황: 누가, 어떤 책을, 얼마나 읽고 있는지 표시
- 로파이 스터디 영상에 수백만 명이 몰리는 이유 — "혼자지만 함께"의 경험
- 정원을 오가며 친구의 나무에 물을 주고 응원

### 개인 & 팀 목표

- **개인**: "이번 달 3그루 키우기"
- **팀**: 팀 정원을 만들어 함께 목표 달성

## 왜 솔라나인가

| | 일반 NFT | Solana cNFT |
|---|---|---|
| 발행 비용 | ~$2.00 | **< $0.001** |
| 파이널리티 | 수십 초~분 | **0.4초** |
| 사용자 경험 | 가스비 부담 | **의식하지 않는 수준** |

Compressed NFT(cNFT)는 상태 압축을 통해 일반 NFT 대비 **1000배 저렴**합니다. 책 한 권 완독할 때마다 나무를 발행해도 비용 부담이 없습니다.

## 시장 규모

- **TAM**: 글로벌 디지털 독서 시장 $23B (Statista, 2024)
- **SAM**: 소셜/게이미피케이션 독서 앱 $2.3B (10%, Goodreads·독서 챌린지 포함)
- **SOM**: Web3 소셜 리딩 (cNFT 수집 + 소셜 프레즌스) $230M — 초기 타겟: 한국·일본 MZ세대 독서 커뮤니티

## 수익 모델

1. 프리미엄 구독 (팀 정원 확장, 희귀 나무 cNFT)
2. 나무 NFT IP 기반 굿즈 판매 (띠부띠부씰, 스티커, 엽서)
3. 출판사/작가 파트너십 (독서 챌린지 스폰서)
4. 독서 데이터 기반 추천 서비스

## 구현된 기능

### 프론트엔드
- Next.js App Router + TypeScript 모바일 퍼스트 UI
- Phaser 3 기반 정원 시각화 (나무, 오두막, 반딧불이, 캐릭터 호흡 애니메이션)
- 집중 타이머 (탭 이탈 감지 기반 일시정지)
- 카메라 촬영 독서 인증

### 온체인 (Solana Devnet)
- **cNFT 발행**: Metaplex Bubblegum으로 완독 시 나무 cNFT 발행
- **Proof of Reading**: SPL Memo 프로그램으로 독서 기록 온체인 저장
- **Reading Garden**: Merkle tree 기반 정원 (최대 8 cNFT)
- Solana 지갑 연결 (Phantom, Solflare)

### 소셜
- 실시간 리더 현황 표시 (이름, 책, 독서 시간)
- 활동 피드 (입장, 챕터 완료 알림)
- 함께 읽는 인원 수 실시간 카운트

## 다음 단계

- 정원 방문 및 물주기
- 팀 정원 및 공동 목표
- 독서 진행도 기반 나무 성장 시각화 (단계별 애니메이션)
- 구절 공유 및 한 줄 감상

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

1. 상단 **Select Wallet** 클릭 → Phantom/Solflare 연결 (Devnet)
2. 타이머 시작 → 완료 후 카메라 인증
3. **Mint & Record On-chain** 클릭 → Proof of Reading 기록 + cNFT 발행
4. Solana Explorer 링크로 온체인 트랜잭션 확인

## 프로젝트 구조

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
