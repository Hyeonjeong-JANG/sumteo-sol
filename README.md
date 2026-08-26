# Sumteo · 숨터

![Sumteo 3D reading world](assets/sumteo-world.png)

**책을 읽는 시간이 나만의 공간과 기록으로 쌓이는 3D 소셜 독서 서비스입니다.**

[웹에서 숨터 체험하기](https://sumteo.xyz)

## 서비스 소개

숨터는 혼자 읽되 서로의 존재를 느낄 수 있는 온라인 독서 공간입니다. 사용자는 계절이 흐르는 3D 월드를 산책하고, 도서관·카페·정원에서 책을 읽으며, 독서 기록과 완독 경험을 쌓을 수 있습니다.

- 실시간으로 다른 독서자의 존재를 느끼는 3D 월드
- 독서 타이머, 페이지 기록, 감상 기록과 완독 흐름
- 도서 검색, 퀴즈, 서재와 책 타워
- 30일 이상 독서 기록으로 해제되는 비밀정원
- 완독 기록을 기반으로 한 Solana Proof-of-Reading cNFT
- 한국어·영어 지원 및 데스크톱·모바일 웹 대응

## 제가 맡은 일

- 제품 기획부터 3D 월드, 사용자 흐름, 백엔드와 배포까지 전 과정 설계·개발
- React Three Fiber 기반 저사양 모바일 대응 3D 렌더링과 충돌 시스템
- Privy 인증, Supabase 데이터 모델, Fastify API와 WebSocket 실시간 공간 구현
- 서버 검증형 독서·퀴즈·보상·민팅 흐름과 개인정보 공개 설정 설계
- 모바일 발열과 화면 끊김을 줄이기 위한 모델·드로콜·카메라·업데이트 주기 최적화

## 기술 구성

`Next.js` · `React` · `TypeScript` · `React Three Fiber` · `Three.js` · `Fastify` · `WebSocket` · `Supabase` · `Privy` · `Solana`

사용자 앱은 웹과 모바일에서 같은 기능을 제공하며, 운영자 대시보드와 서버 비밀값은 공개 서비스 및 공개 저장소에서 분리합니다.

## 보안 및 소스 공개 범위

이 저장소는 채용·포트폴리오용 공개 쇼케이스입니다. 실제 제품 소스 코드, API 구현, 데이터베이스 마이그레이션, 관리자 도구 및 배포 비밀값은 포함하지 않습니다.

---

## English

**Sumteo is a 3D social reading space where time spent reading grows into a personal place and a lasting record.**

Readers can walk through a seasonal world, read together in libraries, cafés and gardens, keep private reading records, unlock quiet rooms through consistent reading, and optionally create Solana Proof-of-Reading cNFTs.

This public repository is a portfolio showcase only. Production source code, API implementation, database migrations, administrative tools and deployment secrets are kept private.

© 2026 Hyeonjeong Jang. All rights reserved.
