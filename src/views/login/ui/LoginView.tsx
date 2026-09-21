"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/shared/api/supabase-browser";
import Logo from "@/shared/ui/Logo";
import Icon from "@/shared/ui/Icon";

export default function LoginView() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get("error") === "auth";

  async function handleKakaoLogin() {
    const sb = createSupabaseBrowser();
    const next = searchParams.get("next") ?? "/home";
    await sb.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        scopes: "profile_nickname profile_image",
        queryParams: {
          scope: "profile_nickname profile_image",
        },
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <main className="bj-shell bj-login-shell">
      <div className="bj-login-body">
        <div className="bj-login-hero">
          <Logo riso />
          <p className="bj-caption bj-login-tagline">
            읽는 취향이, 나를 만든다
          </p>
        </div>

        <div className="bj-login-illust">
          <Icon name="book" size={48} />
        </div>

        <div className="bj-login-action">
          {hasError && (
            <p className="bj-caption bj-login-error">
              로그인에 실패했어요. 다시 시도해보세요
            </p>
          )}
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
          >
            카카오로 3초 만에 시작하기
          </button>
          <Link href="/home" className="bj-btn bj-btn--ghost bj-btn--block">
            로그인 없이 둘러보기
          </Link>
          <p className="bj-caption bj-login-tagline">
            로그인하면 평가 기록과 뱃지가 저장돼요
          </p>
        </div>
      </div>
    </main>
  );
}
