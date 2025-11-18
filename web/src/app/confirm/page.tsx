"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { VerifyOtpParams } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabaseClient";

type StatusState = "loading" | "success" | "error";

const VALID_VERIFY_TYPES: VerifyOtpParams["type"][] = [
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email_change",
  "sms",
];

const getHashParams = () => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return null;
  return new URLSearchParams(hash.substring(1));
};

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsKey = useMemo(
    () => searchParams?.toString() ?? "",
    [searchParams]
  );

  const [status, setStatus] = useState<{
    state: StatusState;
    message: string;
  }>({
    state: "loading",
    message: "Verifying your email…",
  });

  useEffect(() => {
    const confirmEmail = async () => {
      if (!searchParams) return;
      setStatus({ state: "loading", message: "Verifying your email…" });

      const hashParams = getHashParams();
      const code =
        searchParams.get("code") ??
        searchParams.get("token") ??
        hashParams?.get("code");
      const tokenHash =
        searchParams.get("token_hash") ?? hashParams?.get("token_hash");
      const email = searchParams.get("email") ?? hashParams?.get("email");
      const typeParam = (searchParams.get("type") ??
        hashParams?.get("type") ??
        "signup") as VerifyOtpParams["type"];

      const accessToken = hashParams?.get("access_token");
      const refreshToken = hashParams?.get("refresh_token");

      try {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && email) {
          const verifyType = VALID_VERIFY_TYPES.includes(typeParam)
            ? typeParam
            : "signup";

          const { error } = await supabase.auth.verifyOtp({
            email,
            token_hash: tokenHash,
            type: verifyType,
          });
          if (error) throw error;
        } else {
          throw new Error(
            "This confirmation link is missing the required parameters."
          );
        }

        setStatus({
          state: "success",
          message:
            "Email confirmed! You can return to the app or continue on the site.",
        });
      } catch (error) {
        console.error("Email confirmation failed", error);
        setStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "We couldn't verify this link. It might be expired or already used.",
        });
      }
    };

    confirmEmail();
  }, [paramsKey, searchParams]);

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-text">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-black/50 p-8 text-center shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-semibold">Confirming your account</h1>
        <p className="mt-2 text-sm text-white/70">
          We&apos;re finalizing your signup with Supabase. This can take a few
          seconds.
        </p>

        <div className="mt-8">
          {status.state === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-primary" />
              <p className="text-base font-medium">{status.message}</p>
            </div>
          )}

          {status.state === "success" && (
            <div className="space-y-4">
              <p className="text-base font-medium text-emerald-400">
                {status.message}
              </p>
              <button
                onClick={handleBackToHome}
                className="w-full rounded-xl bg-primary px-4 py-3 text-base font-semibold text-black transition hover:opacity-90"
              >
                Back to home
              </button>
            </div>
          )}

          {status.state === "error" && (
            <div className="space-y-4">
              <p className="text-base font-medium text-rose-400">
                {status.message}
              </p>
              <p className="text-sm text-white/70">
                If you think this is a mistake, return to the app and request a
                new confirmation email.
              </p>
              <button
                onClick={handleBackToHome}
                className="w-full rounded-xl border border-white/20 px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Back to home
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

