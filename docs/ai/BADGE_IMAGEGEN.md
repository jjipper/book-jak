# 배지 이미지 생성 (AI)

배지 44종(흔함 27 / 희귀 12 / 최희귀 5)은 이미지 생성 AI로 만들었다. 결과물은 `public/assets/badge/{key}.webp`.

## 흐름

1. **스타일 고정** — 유형 일러스트(FIEW·TCGR·TIGR·FCER)를 스타일 레퍼런스로, 등급별 샘플 3장을 먼저 생성해 승인.
2. **프롬프트 조립** — `공통(리소그래프 스타일·배지 포맷) + 등급 블록(테두리·잉크 수) + 배지별 Subject` 세 조각을 합친다.
   승인된 샘플 3장을 다음 생성의 레퍼런스로 넣어 44종의 화풍을 맞춘다.
3. **자동 검증** — 저장 전에 스크립트로 확인하고, 하나라도 어긋나면 다시 생성한다.
   - 정사각형, RGBA, 알파가 0~255를 모두 가짐(진짜 투명 배경 — 체커보드를 그려 넣는 실패를 거른다)
   - 네 모서리가 투명(배지가 잘리지 않음)
   - 파일 해시 중복 없음(같은 그림 재사용 방지)
   - 카탈로그 키 집합이 `src/entities/reading-type/model/badges.ts`의 키와 정확히 일치
4. **배포용 변환** — 원본 1254px PNG(총 98MB)를 표시 크기 56px의 3배인 192px WebP로(총 0.8MB).

배지 그래픽이 없거나 로드에 실패하면 `BadgeMedal`이 등급별 도형 + 이니셜로 대체한다.

## 프롬프트 예 — 희귀 · `rare-type`

```
Badge illustration in authentic RISOGRAPH PRINT style. Match the EXACT art
style of the attached reference illustrations — same artist, same inks,
same texture.
Input images 1–4 are STYLE REFERENCES ONLY: FIEW, TCGR, TIGR, FCER.
Create a NEW badge subject, not a collage of these references.
Use case: illustration-story. Asset type: BookJak reading achievement badge.

STYLE: NO black outlines — forms built purely from flat color shapes with
crisp, solid edges. Visible halftone dot grain and speckle inside every color
area, bold white "ink-break" lines running across the shapes, slight
registration offset (colors printed a little off-register), rough
hand-printed imperfect texture.
Limited riso palette ONLY: vermilion orange-red #F0562E, mustard/fluorescent
yellow, cobalt blue, deep navy, plus warm peach skin tone with rosy cheeks.
Where inks overlap they overprint into a blended third tone.
No gradients, no 3D, no glossy render, no clean vector look, no misty haze,
no blurry edges.

BADGE FORMAT: a vintage merit-badge / die-cut sticker emblem. The
illustration sits inside a solid badge shape printed with the same riso
inks and grain. Chunky, rounded, friendly proportions. If a person appears,
the head and face are LARGE (about half of the figure) with a clear,
exaggerated expression. Simple and bold enough to read at small icon size.
Centered, square canvas, generous margin, transparent background outside
the badge. Genuine alpha transparency, not a drawn checkerboard.
NO text, letters or numbers anywhere — any ribbon or banner stays blank.
ONE badge only.

RARITY: RARE — a step up in flair. Scalloped, wavy stamp-edge circle badge
with a blank ribbon banner across the bottom. 3 inks: vermilion orange-red,
mustard/fluorescent yellow, deep navy.
A few small stars and sparkles around the subject. Livelier composition.

Subject: a row of identical books in the same color with exactly one book in a different, standout color in the middle. No person.
```

## 배지별 Subject

| # | key | 이름 | 등급 | Subject |
|---|---|---|---|---|
| 1 | `bookmark-prisoner` | 책갈피 수감자 | common | a giant bookmark wedged between book pages looks like prison bars; a character peeks only their head out from behind it, eyes wide and sheepish. |
| 2 | `daydream-reader` | 몽상 독서가 | common | side profile of a character holding an open book while puffy clouds bloom up from the pages; their gaze drifts off elsewhere, dreamy half-smile. |
| 3 | `interrupted-thinker` | 방해 환영러 | common | a blank speech bubble suddenly pops in from the side and the character's face lights up with sparkling eyes, delighted rather than annoyed. |
| 4 | `reluctant-reader` | 휴식 반가움러 | common | upper body of a character who has just shut a book and is stretching both arms up with a relieved grin; wavy lines float behind them. |
| 5 | `selective-reader` | 취사선택 리더 | common | a character holding up an open book where only a few pages glow bright yellow and the rest are faded; satisfied, knowing look. |
| 6 | `slow-deep-diver` | 슬로우 다이버 | common | a character diving head-first down beneath a floating open book, as if into water, calm focused face, a few bubbles rising. |
| 7 | `mood-reader` | 무드 리더 | common | a cozy still life — a lit candle, a folded knit blanket and a stack of books arranged as one snug cluster. No person. |
| 8 | `reluctant-grower` | 얼결에 성장러 | common | a small sprout growing out of an open book; the character holding it stares at it, startled and puzzled. |
| 9 | `knowledge-hunter` | 지식 수집가 | common | a character in a hunter's pose, crouched and aiming a big magnifying glass at a book like a target, one eye squinting. |
| 10 | `genre-nomad` | 장르 유목민 | common | book covers lined up like rolling desert dunes; a small wanderer with a scarf walks across them, seen from behind. |
| 11 | `worldbuilder-fan` | 세계관 팬 | common | an open book with a tiny castle, a map scroll and a star constellation rising out of the pages; a character's awed face peeks over the top. |
| 12 | `character-first` | 캐릭터 퍼스트 | common | a hand reaching out of an open book clasps the reader's hand; the reader's face beams with excitement. |
| 13 | `bookbti-done` | 나를 알았다 | common | a character standing in front of a round mirror; the reflection is the same character holding a book, both smiling at each other. |
| 14 | `rare-type` | 희귀 유형 | rare | a row of identical books in the same color with exactly one book in a different, standout color in the middle. No person. |
| 15 | `first-rating` | 첫 별점 | common | a hand carefully placing one single star on top of a closed book. |
| 16 | `rating-10` | 열 권의 서재 | common | one small shelf compartment with exactly ten books fitting snugly side by side. No person. |
| 17 | `rating-50` | 오십 권의 서재 | rare | a tall bookshelf filling the whole wall; a small character stands in front of it looking up, mouth open in awe. |
| 18 | `rating-100` | 백 권 클럽 | legendary | a tall tower of stacked books filling the badge vertically; a tiny character at the very top planting a flag, cheering. |
| 19 | `generous-reader` | 별점 요정 | common | a winged fairy-like character hugging an armful of stars and happily scattering them, cheeks rosy. |
| 20 | `harsh-critic` | 깐깐한 심사위원 | rare | a stern character wearing a monocle, carefully weighing a single star on a small balance scale, one eyebrow raised. |
| 21 | `first-review` | 첫 후기 | common | a small single sheet of memo paper with a pencil resting on it, a fresh wet ink smudge on the paper. No person. |
| 22 | `review-20` | 후기 장인 | rare | a character standing with arms crossed and a proud smirk in front of a wall densely covered with sticky memo notes. |
| 23 | `genre-explorer` | 장르 탐험가 | common | an explorer character holding up a compass, five book spines in five different colors standing behind them. |
| 24 | `genre-monogamist` | 편식 독서가 | common | a character holding a fork and knife, eagerly facing a plate piled only with books of the same single color. |
| 25 | `genre-omnivore` | 잡식 독서가 | legendary | a character joyfully hugging a huge armful of books in many different colors, more books piled around their feet. |
| 26 | `blind-first` | 첫 개봉 | common | a gift-wrapped book with the wrapping paper just slightly torn open, bright light rays spilling out of the tear. No person. |
| 27 | `blind-10` | 개봉 전문가 | rare | a character standing triumphantly on top of a big heap of torn-off wrapping paper. |
| 28 | `blind-adventurer` | 모험가 | rare | a character wearing a blindfold leaping head-first into a pile of books, dynamic mid-air pose, big grin. |
| 29 | `blind-skeptic` | 신중파 | rare | side profile of a character resting their chin on one hand, studying a single book long and hard, eyes narrowed. |
| 30 | `shelf-10` | 서재 수집가 | common | two hands neatly stacking books into a small shopping basket. |
| 31 | `shelf-50` | 적독 장인 | legendary | a towering stack of unread books reaching the top of the badge; a character beside it calmly placing one more new book on top, unbothered smile. |
| 32 | `life-books` | 인생책 확정 | common | three books hanging side by side in picture frames on a wall; a character stands in front of them like a museum visitor, hands behind back. |
| 33 | `rec-first` | 첫 추천 | common | close-up of two hands offering a single book forward, as if handing it to the viewer. |
| 34 | `rec-10` | 추천 요정 | rare | a character running with both arms full of books, dotted motion lines trailing behind their path. |
| 35 | `post-first` | 첫 글 | common | a character writing the very first stroke inside a big empty speech bubble with an oversized pencil. |
| 36 | `post-20` | 수다쟁이 | rare | a chatty character with many blank speech bubbles stacked and overlapping above their head, mouth wide open mid-talk. |
| 37 | `comment-30` | 댓글 요정 | rare | a chain of small blank speech bubbles linked one after another like a winding tail. No person. |
| 38 | `club-join` | 모임 입문 | common | simple silhouettes seated around a round table with one empty seat; the main character happily sits down into it. |
| 39 | `club-3` | 모임 러버 | rare | three overlapping circles (a Venn diagram); a cheerful character stands in the center where all three overlap. |
| 40 | `follow-10` | 취향 탐색가 | common | several small round faces connected by thin lines like a star constellation, small stars at the joints. |
| 41 | `follower-10` | 인기 독서가 | rare | a character on a small stage reading aloud from an open book, a ring of small smiling faces gathered around them. |
| 42 | `follower-50` | 북작 셀럽 | legendary | a character holding up a book under a bright spotlight beam, a crowd of many small faces below looking up. |
| 43 | `streak-7` | 일주일 개근 | common | a calendar strip of seven boxes, each one stamped with a round stamp mark. No person. |
| 44 | `streak-30` | 한 달 개근 | legendary | a full calendar page completely covered in stamp marks, with flowers blooming out of it. No person. |
