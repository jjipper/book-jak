"use client";

import { useState, useEffect, useRef } from "react";

// ── 랜덤 닉네임 풀
const ADJECTIVES = [
  "꾸벅꾸벅",
  "몽글몽글",
  "뽀글뽀글",
  "차곡차곡",
  "도란도란",
  "소복소복",
  "말랑말랑",
  "오물오물",
  "자유로운",
  "냉철한",
  "날카로운",
  "다정한",
  "느긋한",
  "수줍은",
  "엉뚱한",
  "포근한",
  "밑줄 긋는",
  "반쯤 읽은",
  "다 읽은",
  "읽고 있는",
  "졸고 있는",
  "책 쌓는",
  "밤새는",
  "완독 못한",
  "길 잃은",
  "헤엄치는",
  "도망가는",
  "빠져있는",
];
const NOUNS = [
  "독자",
  "작가",
  "작가 지망생",
  "팬",
  "매니저",
  "소설가",
  "시인",
  "평론가",
  "분석가",
  "번역가",
  "서점 직원",
  "마니아",
  "책갈피",
  "라면 받침",
  "책꽂이",
  "붕어빵",
  "물고기",
  "강아지",
  "고양이",
  "곰돌이",
  "토끼",
  "감자",
  "고구마",
  "사이다",
  "몽상가",
  "잠꾸러기",
  "수집가",
  "애독가",
  "다독가",
];

// 금칙어 목록 — 추후 확장 가능한 상수 배열
const BLOCKED_WORDS = [
  // 운영·사칭 방지
  "운영자",
  "관리자",
  "북작",
  "admin",
  "official",
  "스태프",
  "staff",
  // 광고성
  "http",
  "https",
  "www.",
  ".com",
  "카톡",
  "kakao",
  // 욕설·비하·성적·폭력 (최소 목록 — 운영 시 확장)
  "씨발",
  "시발",
  "존나",
  "개새",
  "병신",
  "지랄",
  "섹스",
  "야동",
  "포르노",
];

function pickRandom() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

function hasEmoji(s: string) {
  return /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(s);
}

function hasStandaloneJamo(s: string) {
  return /[ㄱ-ㅎㅏ-ㅣ]/.test(s);
}

function hasInvalidChar(s: string) {
  // 허용: 한글 완성형, 영문, 숫자, 공백, 일반 특수문자(!?._\-~'"@#%&*+=)
  return /[^가-힣ᄀ-ᇿ㄰-㆏ꥠ-꥿ힰ-퟿ -~a-zA-Z0-9\s]/u.test(s);
}

function containsBlocked(s: string) {
  const lower = s.toLowerCase();
  return BLOCKED_WORDS.some((w) => lower.includes(w.toLowerCase()));
}

// Mock 중복 체크 — 실제 연동 시 아래 주석 참고
async function isDuplicate(nickname: string): Promise<boolean> {
  // TODO: 실제 연동 시 아래로 교체
  // const sb = createSupabaseBrowser()
  // const { data } = await sb.from('profiles').select('id').eq('nickname', nickname).single()
  // return !!data
  const TAKEN = ["북작독자", "다 읽은 고양이"];
  return TAKEN.includes(nickname);
}

async function runValidation(raw: string): Promise<string> {
  const trimmed = raw.trim();
  const stripped = trimmed.replace(/\s/g, "");

  if (!trimmed) return "";
  if (hasEmoji(raw)) return "이모지는 사용할 수 없어요";
  if (hasInvalidChar(raw)) return "사용할 수 없는 문자가 포함돼 있어요";
  if (hasStandaloneJamo(trimmed))
    return "완성되지 않은 자음·모음은 쓸 수 없어요";
  if (/\s{2,}/.test(raw)) return "공백을 연속으로 쓸 수 없어요";
  if (stripped.length < 2) return "공백 제외 2자 이상이어야 해요";
  if (stripped.length > 12) return "공백 제외 12자 이하여야 해요";
  if (containsBlocked(trimmed)) return "사용할 수 없는 단어가 포함돼 있어요";
  if (await isDuplicate(trimmed)) return "이미 누군가 쓰고 있는 닉네임이에요";
  return "";
}

interface NicknameSheetProps {
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
  initialValue?: string;
}

export default function NicknameSheet({
  onSubmit,
  onClose,
  initialValue = "",
}: NicknameSheetProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value.trim()) {
      setError("");
      setIsValid(false);
      setIsChecking(false);
      return;
    }
    setIsChecking(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const msg = await runValidation(value);
      setError(msg);
      setIsValid(!msg);
      setIsChecking(false);
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  function handleGenerate() {
    setValue(pickRandom());
    setHasGenerated(true);
  }

  async function handleSubmit() {
    if (!isValid || isSubmitting || isChecking) return;
    setIsSubmitting(true);
    try {
      await onSubmit(value.trim());
    } catch {
      setError("저장 중 오류가 발생했어요. 다시 시도해주세요");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bj-sheet__overlay" onClick={onClose}>
      <div className="bj-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="bj-h2 bj-mb-20">닉네임을 정해주세요</p>

        {/* 인풋 + 무작위 짓기 버튼 */}
        <div className={`bj-input bj-mb-6${error ? " bj-input--error" : ""}`}>
          <input
            className="bj-input__field"
            type="text"
            placeholder="닉네임을 최소 2자, 최대 12자로 입력해주세요"
            maxLength={16}
            value={value}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <button type="button" className="bj-input__action" onClick={handleGenerate}>
            {hasGenerated ? "다시 짓기" : "무작위 짓기"}
          </button>
        </div>

        {/* 실시간 상태 메시지 (위반 시에만 노출) */}
        <div className="bj-mb-14" style={{ minHeight: 18 }}>
          {error && <p className="bj-caption bj-caption--error">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting || isChecking}
          className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
        >
          {isSubmitting ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
