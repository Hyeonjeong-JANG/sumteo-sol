"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import type { ForestScene } from "@/game/ForestScene";

const GameCanvas = dynamic(
  () => import("@/components/GameCanvas").then((m) => m.GameCanvas),
  { ssr: false }
);

type DemoState =
  | "idle"
  | "reading"
  | "recording"
  | "quiz"
  | "minting"
  | "complete"
  | "discovery";

// Dummy data
const BOOK = { title: "아토믹 해빗", author: "제임스 클리어", totalPages: 256 };
const QUIZ = {
  question: "이 책에서 '습관의 4단계 법칙'에 해당하지 않는 것은?",
  options: ["신호 (Cue)", "갈망 (Craving)", "목표 설정 (Goal Setting)", "보상 (Reward)"],
  answerIndex: 2,
};

const REVIEWS = [
  { id: "bbang", name: "빵돌이", avatar: "빵", avatarBg: "bg-amber-700/60", quote: "작은 습관이 모여 정체성을 바꾼다는 말이 인상 깊었어요" },
  { id: "linus", name: "리누스", avatar: "리", avatarBg: "bg-blue-700/60", quote: "매일 1%만 나아져도 1년 뒤엔 37배. 이 숫자가 계속 머릿속에 맴돌아요" },
  { id: "gu", name: "구씨네슈퍼마켓", avatar: "구", avatarBg: "bg-rose-700/60", quote: "습관은 자기 자신에게 던지는 한 표다. 매번 행동할 때마다 나는 이런 사람이라고 증명하는 거죠" },
];

const GALLERY_BOOKS: Record<string, { title: string; status: "완독" | "읽는 중"; quote?: string }[]> = {
  bbang: [
    { title: "아토믹 해빗", status: "완독", quote: "작은 습관이 모여 정체성을 바꾼다" },
    { title: "몰입의 즐거움", status: "완독", quote: "몰입은 최고의 행복이다" },
    { title: "타이탄의 도구들", status: "완독", quote: "성공은 루틴에서 온다" },
    { title: "사피엔스", status: "완독", quote: "허구를 믿는 능력이 인류를 지배자로" },
    { title: "이기적 유전자", status: "완독", quote: "우리는 유전자의 생존 기계" },
    { title: "총균쇠", status: "읽는 중" },
    { title: "넛지", status: "읽는 중" },
    { title: "생각에 관한 생각", status: "완독", quote: "시스템1은 빠르고 직관적" },
    { title: "레버리지", status: "완독", quote: "적게 일하고 많이 성취하라" },
  ],
  linus: [
    { title: "아토믹 해빗", status: "완독", quote: "1%의 차이가 37배를 만든다" },
    { title: "딥 워크", status: "완독", quote: "깊은 집중이 가치를 만든다" },
    { title: "제로 투 원", status: "완독", quote: "경쟁하지 말고 독점하라" },
    { title: "린 스타트업", status: "읽는 중" },
    { title: "팩트풀니스", status: "완독", quote: "세상은 생각보다 나아지고 있다" },
    { title: "클린 코드", status: "완독", quote: "좋은 코드는 읽기 쉬운 코드" },
    { title: "마스터 알고리즘", status: "읽는 중" },
    { title: "호모 데우스", status: "완독", quote: "데이터가 새로운 종교" },
    { title: "스틱!", status: "완독", quote: "단순할수록 기억에 남는다" },
  ],
  gu: [
    { title: "아토믹 해빗", status: "완독", quote: "습관은 자기 자신에게 던지는 한 표" },
    { title: "부의 추월차선", status: "완독", quote: "시간을 팔지 말고 시스템을 만들어라" },
    { title: "역행자", status: "완독", quote: "운명을 거슬러 올라가는 사람" },
    { title: "돈의 심리학", status: "완독", quote: "부는 보이지 않는 곳에 있다" },
    { title: "나는 4시간만 일한다", status: "읽는 중" },
    { title: "블리츠스케일링", status: "완독", quote: "속도가 전략이다" },
    { title: "프로덕트", status: "읽는 중" },
    { title: "그릿", status: "완독", quote: "재능보다 노력이 두 배 중요하다" },
    { title: "소크라테스 익스프레스", status: "완독", quote: "철학은 삶의 기술이다" },
  ],
};

export default function DemoPage() {
  const [state, setState] = useState<DemoState>("idle");
  const [pageInput, setPageInput] = useState(156);
  const [impression, setImpression] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [galleryUser, setGalleryUser] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getScene = (): ForestScene | null => {
    return (window as any).__forestScene ?? null;
  };

  const isComplete = pageInput >= BOOK.totalPages;
  const readerCount = state === "reading" ? 3 : 2;

  useEffect(() => {
    if (state === "reading") {
      setReadingMinutes(0);
      timerRef.current = setInterval(() => {
        setReadingMinutes((m) => m + 1);
      }, 3000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const startReading = () => {
    getScene()?.addMyCharacter();
    setState("reading");
  };

  const stopReading = () => {
    setState("recording");
  };

  const submitRecording = () => {
    getScene()?.removeMyCharacter();
    if (isComplete) {
      setState("quiz");
    } else {
      setState("idle");
    }
  };

  const submitQuiz = () => {
    if (selectedQuiz === null) return;
    if (selectedQuiz === QUIZ.answerIndex) {
      setQuizResult("correct");
      setTimeout(() => {
        setState("minting");
        setQuizResult(null);
        setSelectedQuiz(null);
        setTimeout(() => setState("complete"), 2000);
      }, 1200);
    } else {
      setQuizResult("wrong");
      setTimeout(() => setQuizResult(null), 1000);
    }
  };

  const closeComplete = () => {
    setState("discovery");
  };

  const closeDiscovery = () => {
    setState("idle");
    setSelectedQuiz(null);
    setQuizResult(null);
    setPageInput(156);
    setImpression("");
    setGalleryUser(null);
    setLikes({});
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0 z-0 pointer-events-none [&>div]:!z-auto">
        <GameCanvas />
      </div>

      {/* Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="text-3xl font-bold text-white/90 tracking-wide">SUMTEO</h1>
        <p className="text-base text-emerald-400/80 mt-1">독서 공간</p>
      </div>

      {/* Reader count badge */}
      <div className="absolute top-6 right-6 z-10 bg-gray-900/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-sm text-gray-200">
          함께 읽는 중 <strong className="text-emerald-400">{readerCount}명</strong>
        </span>
      </div>

      {/* Bottom action bar */}
      {state === "idle" && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={startReading}
            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold rounded-full shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
          >
            독서 시작
          </button>
        </div>
      )}

      {state === "reading" && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-full px-5 py-2 text-base text-emerald-400 font-mono">
            {readingMinutes}분 독서 중...
          </div>
          <button
            onClick={stopReading}
            className="px-10 py-4 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white text-lg font-semibold rounded-full shadow-lg transition-all active:scale-95"
          >
            독서 종료
          </button>
        </div>
      )}

      {/* Modal overlay */}
      {(state === "recording" || state === "quiz" || state === "minting" || state === "complete" || state === "discovery") && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">

          {/* Combined recording modal: page + impression */}
          {state === "recording" && (
            <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-1">오늘의 독서 기록</h2>
              <p className="text-base text-gray-400 mb-6">{BOOK.title} · {BOOK.author}</p>

              {/* Page slider + number input */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">어디까지 읽었나요?</label>
                <input
                  type="range"
                  min={1}
                  max={BOOK.totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2"
                />
                <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                  <span>1p</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={BOOK.totalPages}
                      value={pageInput}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(BOOK.totalPages, Number(e.target.value) || 1));
                        setPageInput(v);
                      }}
                      className="w-20 bg-gray-800/80 border border-gray-600/50 rounded-lg px-2 py-1.5 text-center text-emerald-400 font-bold text-xl focus:outline-none focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-emerald-400 font-bold text-xl">p</span>
                  </div>
                  <span>{BOOK.totalPages}p</span>
                </div>
              </div>

              {/* Auto-detected completion badge */}
              {isComplete && (
                <div className="flex items-center gap-2 mb-5 bg-emerald-900/30 border border-emerald-700/40 rounded-xl px-5 py-3">
                  <span className="text-xl">🌳</span>
                  <span className="text-base text-emerald-400 font-medium">완독이에요!</span>
                </div>
              )}

              {/* Impression */}
              <textarea
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                rows={3}
                className="w-full bg-gray-800/80 border border-gray-600/50 rounded-xl p-4 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none mb-6"
                placeholder="마음에 든 구절이나 감상을 남겨보세요..."
              />

              <button
                onClick={submitRecording}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                기록 완료
              </button>
            </div>
          )}

          {/* Quiz modal — 완독 인증 */}
          {state === "quiz" && (
            <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-1">완독 인증</h2>
              <p className="text-base text-gray-400 mb-5">{BOOK.title} · 다른 독자가 남긴 퀴즈</p>

              <p className="text-white text-base font-medium mb-5">{QUIZ.question}</p>

              <div className="flex flex-col gap-2.5 mb-5">
                {QUIZ.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedQuiz(idx); setQuizResult(null); }}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-base transition-all border ${
                      selectedQuiz === idx
                        ? quizResult === "correct"
                          ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
                          : quizResult === "wrong"
                          ? "bg-red-600/30 border-red-500 text-red-300"
                          : "bg-emerald-600/20 border-emerald-500/50 text-white"
                        : "bg-gray-800/60 border-gray-600/30 text-gray-300 hover:bg-gray-700/60"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {quizResult === "correct" && (
                <div className="text-center text-emerald-400 font-bold text-2xl mb-3 animate-bounce">
                  정답!
                </div>
              )}
              {quizResult === "wrong" && (
                <div className="text-center text-red-400 text-base mb-3">
                  다시 생각해보세요!
                </div>
              )}

              {quizResult !== "correct" && (
                <button
                  onClick={submitQuiz}
                  disabled={selectedQuiz === null}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-xl transition-all active:scale-[0.98]"
                >
                  정답 확인
                </button>
              )}
            </div>
          )}

          {/* Minting modal */}
          {state === "minting" && (
            <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-10 w-full max-w-md border border-gray-700/50 shadow-2xl text-center">
              <div className="mb-5">
                <div className="w-20 h-20 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">cNFT로 박제하는 중...</h2>
              <p className="text-base text-gray-400">자랑스러운 완독 기록을 블록체인에 영구 저장합니다</p>
            </div>
          )}

          {/* Complete modal — NFT card from pitch deck */}
          {state === "complete" && (
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-xl font-bold text-white text-center">자랑스러운 기록이 영구적으로 박제되었습니다!</h2>
              <p className="text-base text-gray-400 -mt-3">Proof of Reading · cNFT</p>

              {/* NFT Card — matching pitch-deck-v4 design */}
              <div
                className="relative flex flex-col overflow-hidden"
                style={{
                  width: 300, height: 500, borderRadius: 24,
                  background: "linear-gradient(180deg, #0c1814 0%, #122418 50%, #1a3420 100%)",
                  border: "1.5px solid rgba(74,222,128,0.1)",
                  boxShadow: "0 16px 56px rgba(0,0,0,0.65), 0 0 48px rgba(74,222,128,0.04)",
                }}
              >
                {/* Scene background */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* SUMTEO label */}
                  <span className="absolute top-3 left-4 text-[8px] tracking-[2px] font-semibold" style={{ color: "rgba(238,232,213,0.18)" }}>SUMTEO</span>
                  {/* Moon */}
                  <div className="absolute top-4 right-5 w-6 h-6 rounded-full" style={{ background: "#F0EAC8", boxShadow: "0 0 12px rgba(240,234,200,0.45), 0 0 36px rgba(240,234,200,0.12)" }} />
                  {/* Fireflies */}
                  <div className="absolute w-[3px] h-[3px] rounded-full animate-pulse" style={{ top: 24, left: 20, background: "#F59E0B", boxShadow: "0 0 5px #F59E0B" }} />
                  <div className="absolute w-[2px] h-[2px] rounded-full animate-pulse" style={{ top: 60, left: 50, background: "#F59E0B", boxShadow: "0 0 5px #F59E0B", animationDelay: "-2s" }} />
                  {/* Ground */}
                  <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: "linear-gradient(180deg, transparent, rgba(20,36,18,0.8) 50%, #162a12)" }} />
                  {/* Trees */}
                  <div className="absolute bottom-16 left-0 right-0 flex items-end justify-between px-4">
                    <div className="flex flex-col items-center opacity-80">
                      <div className="rounded-full" style={{ width: 44, height: 34, background: "#327832" }} />
                      <div style={{ width: 7, height: 15, background: "#3a2414", borderRadius: "0 0 2px 2px" }} />
                    </div>
                    <div className="flex flex-col items-center opacity-80">
                      <div className="rounded-full" style={{ width: 32, height: 26, background: "#327832" }} />
                      <div style={{ width: 6, height: 12, background: "#3a2414", borderRadius: "0 0 2px 2px" }} />
                    </div>
                    <div className="flex flex-col items-center opacity-80">
                      <div className="rounded-full" style={{ width: 40, height: 30, background: "#327832" }} />
                      <div style={{ width: 6, height: 14, background: "#3a2414", borderRadius: "0 0 2px 2px" }} />
                    </div>
                  </div>
                </div>

                {/* Book card */}
                <div
                  className="relative z-[2] flex flex-col"
                  style={{
                    width: 190, height: 280, margin: "76px auto 0",
                    background: "linear-gradient(170deg, #305830 0%, #244a24 30%, #1c3e1c 60%, #183618 100%)",
                    borderRadius: "3px 14px 14px 3px",
                    boxShadow: "-5px 6px 18px rgba(0,0,0,0.55), 0 0 28px rgba(74,222,128,0.05), inset 0 0 30px rgba(0,0,0,0.15)",
                    padding: "22px 20px 18px 26px",
                  }}
                >
                  {/* Spine */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: "linear-gradient(180deg, #1a3a1a, #0e2a0e)", borderRadius: "3px 0 0 3px" }} />
                  {/* Header */}
                  <div className="flex items-center justify-between mb-0.5 relative z-[1]">
                    <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: 0.5 }}>{BOOK.title}</span>
                    <span className="inline-flex items-center shrink-0 text-[9px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ADE80" }}>✓ 완독</span>
                  </div>
                  <span className="text-[10px] relative z-[1]" style={{ color: "rgba(255,255,255,0.3)" }}>{BOOK.author}</span>
                  {/* Divider */}
                  <div className="relative z-[1] my-3 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(245,158,11,0.1), rgba(255,255,255,0.06))" }} />
                  {/* Quote */}
                  <p className="relative z-[1] text-base italic leading-[1.8]" style={{ color: "rgba(238,232,213,0.85)", wordBreak: "keep-all" }}>
                    &ldquo;{impression || "..."}&rdquo;
                  </p>
                  <p className="relative z-[1] text-[11px] text-center mt-2" style={{ color: "rgba(245,158,11,0.45)" }}>— @sooondae —</p>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 z-[2] flex items-center justify-between px-4 py-2.5">
                  <div className="flex gap-2.5">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[13px] font-extrabold" style={{ color: "#F59E0B" }}>{readingMinutes > 0 ? readingMinutes : 4}h</span>
                      <span className="text-[8px]" style={{ color: "#5C5347" }}>독서</span>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[13px] font-extrabold" style={{ color: "#F59E0B" }}>{BOOK.totalPages}</span>
                      <span className="text-[8px]" style={{ color: "#5C5347" }}>p</span>
                    </div>
                  </div>
                  <span className="text-[9px]" style={{ color: "#5C5347" }}>{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "")}</span>
                </div>
              </div>

              <button
                onClick={closeComplete}
                className="w-full max-w-[300px] py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                닫기
              </button>
            </div>
          )}
          {/* Discovery modal — 서평 & NFT 서재 */}
          {state === "discovery" && (
            <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl max-h-[85vh] overflow-y-auto">

              {/* Gallery view */}
              {galleryUser ? (() => {
                const user = REVIEWS.find(r => r.id === galleryUser)!;
                const books = GALLERY_BOOKS[galleryUser] || [];
                return (
                  <>
                    <button onClick={() => setGalleryUser(null)} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">
                      ← 서평으로 돌아가기
                    </button>
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-9 h-9 rounded-full ${user.avatarBg} flex items-center justify-center text-sm text-white font-bold shrink-0`}>{user.avatar}</div>
                      <p className="text-lg text-white font-bold">{user.name}</p>
                      <button
                        onClick={(e) => { const t = e.currentTarget; t.textContent = "✓ 이웃"; t.classList.remove("border-emerald-500/50", "text-emerald-400", "hover:bg-emerald-500/10"); t.classList.add("border-gray-600/50", "text-gray-400"); }}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        + 이웃 추가
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {books.map((book, i) => (
                        <div key={i} className="rounded-lg overflow-hidden" style={{ background: "linear-gradient(180deg, #0c1814, #1a3420)", border: `1px solid ${book.status === "완독" ? "rgba(74,222,128,0.15)" : "rgba(245,158,11,0.15)"}` }}>
                          <div className="relative pt-6 pb-2 px-2 text-center">
                            <div className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full" style={{ background: "#F0EAC8", boxShadow: "0 0 4px rgba(240,234,200,0.4)" }} />
                            <p className="text-[11px] text-white/80 font-medium leading-tight">{book.title}</p>
                            {book.quote && <p className="text-[8px] text-gray-400 mt-1 leading-tight italic line-clamp-2">&ldquo;{book.quote}&rdquo;</p>}
                            <p className={`text-[9px] mt-1.5 ${book.status === "완독" ? "text-emerald-400" : "text-amber-400"}`}>
                              {book.status === "완독" ? "✓ 완독" : "읽는 중"}
                            </p>
                          </div>
                          <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${book.status === "완독" ? "rgba(74,222,128,0.2)" : "rgba(245,158,11,0.2)"}, transparent)` }} />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={closeDiscovery}
                      className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold rounded-xl transition-all active:scale-[0.98]"
                    >
                      독서 공간으로 돌아가기
                    </button>
                  </>
                );
              })() : (
                <>
                  <h2 className="text-xl font-bold text-white mb-6">아토믹 해빗에 대한 이웃들의 서평</h2>

                  {/* Review cards */}
                  <div className="flex flex-col gap-3 mb-6">
                    {REVIEWS.map((r) => (
                      <div key={r.id} className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/30">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className={`w-9 h-9 rounded-full ${r.avatarBg} flex items-center justify-center text-sm text-white font-bold shrink-0`}>{r.avatar}</div>
                          <p className="text-sm text-white font-medium">{r.name}</p>
                        </div>
                        <p className="text-base text-gray-200 leading-relaxed mb-3">&ldquo;{r.quote}&rdquo;</p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setLikes(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                            className={`flex items-center gap-1.5 text-sm transition-all ${likes[r.id] ? "text-red-400" : "text-gray-500 hover:text-gray-300"}`}
                          >
                            <span className="text-base">{likes[r.id] ? "♥" : "♡"}</span>
                            <span>좋아요</span>
                          </button>
                          <button onClick={() => setGalleryUser(r.id)} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
                            서재 보기 →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={closeDiscovery}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold rounded-xl transition-all active:scale-[0.98]"
                  >
                    독서 공간으로 돌아가기
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
