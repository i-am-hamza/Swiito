"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";

const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleResend() {
    if (cooldown > 0) return;
    setMessage("");
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setError("Session expired. Please sign up again.");
      return;
    }

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/` },
    });

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setMessage("Email sent! Check your inbox.");
    let secs = RESEND_COOLDOWN;
    setCooldown(secs);
    const timer = setInterval(() => {
      secs -= 1;
      setCooldown(secs);
      if (secs <= 0) clearInterval(timer);
    }, 1000);
  }

  return (
    <div className="bg-surface rounded-xl border border-[var(--border)] p-8 shadow-card text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
      >
        <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h1 className="font-display font-bold text-2xl text-fg mb-2">Check your inbox</h1>
      <p className="text-sm text-fg-muted mb-6 leading-relaxed">
        We&apos;ve sent you a verification link. Click it to activate your account.
      </p>

      {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <Button
        variant="outline"
        className="w-full justify-center"
        onClick={handleResend}
        disabled={cooldown > 0}
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
      </Button>

      <p className="mt-4 text-xs text-fg-muted">
        Wrong address?{" "}
        <Link href="/sign-up" className="text-accent hover:underline">
          Sign up again
        </Link>
      </p>
    </div>
  );
}
