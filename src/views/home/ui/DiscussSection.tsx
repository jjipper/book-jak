"use client";

import Link from "next/link";
import type { DiscussionQuestion } from "@/entities/discussion/model/discussionActions";
import { BLIND_BOOKS } from "@/entities/blind-book/model/blindBooks";
import IllustPlaceholder from "@/shared/ui/IllustPlaceholder";
import SectionHead from "./SectionHead";
import { BubbleIcon, HeartIcon } from "./icons";

/* 의견 나누기 — 지금 뜨는 토론 3개.
   HOT은 likeCount 임계값 파생(질문이 늘어도 기준이 유지되도록 상위 N 대신 임계값). */

const HOT_THRESHOLD = 10;

interface DiscussSectionProps {
  questions: DiscussionQuestion[];
  answerCounts: Record<string, number>;
}

export default function DiscussSection({
  questions,
  answerCounts,
}: DiscussSectionProps) {
  return (
    <section className="bj-section">
      <SectionHead
        title="의견 나누기"
        icon={
          <img
            src="/assets/icons/bubble-1.png"
            alt=""
            className="bj-icon-img bj-icon-img--md"
          />
        }
        cap="지금 뜨는 독서 토론"
        moreHref="/social/discuss"
      />
      <div className="bj-list bj-list--lg-grid-2">
        {questions.map((q) => {
          const book =
            q.bookId !== null
              ? BLIND_BOOKS.find((b) => b.id === q.bookId)
              : undefined;
          const hot = (q.likeCount ?? 0) >= HOT_THRESHOLD;
          return (
            <Link
              key={q.id}
              href={`/social/discuss/${q.id}`}
              className="bj-discuss-card"
            >
              <div className="bj-flex-1">
                <p className="bj-discuss-card__q">
                  {hot && <span className="bj-hot bj-hot--inline">HOT</span>}
                  {q.text}
                </p>
                <div className="bj-discuss-card__meta">
                  <span>
                    <BubbleIcon />
                    {answerCounts[q.id] ?? 0}
                  </span>
                  <span>
                    <span className="bj-heart bj-heart--inline">
                      <HeartIcon size={14} />
                    </span>
                    {q.likeCount ?? 0}
                  </span>
                </div>
              </div>
              {book && (
                <div className="bj-discuss-card__thumb">
                  <IllustPlaceholder
                    code={book.illustCode}
                    alt={book.title}
                    aspectRatio="1 / 1"
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
