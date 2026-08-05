"use client";

import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/shared/api/supabase-browser";
import Logo from "@/shared/ui/Logo";

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
            취향으로 북적이는 독서 취향 소셜
          </p>
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
            카카오로 시작하기
          </button>
        </div>
      </div>
    </main>
  );
}
