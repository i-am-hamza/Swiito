"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setEmailError(result.error.flatten().fieldErrors.email?.[0] ?? "");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="bg-surface rounded-xl border border-[var(--border)] p-8 shadow-card text-center">
        <h1 className="font-display font-bold text-2xl text-fg mb-2">Check your email</h1>
        <p className="text-sm text-fg-muted leading-relaxed">
          If an account with that address exists, we&apos;ve sent a reset link. Check your inbox.
        </p>
        <Link href="/sign-in" className="mt-6 inline-block text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-[var(--border)] p-8 shadow-card">
      <h1 className="font-display font-bold text-2xl text-fg mb-1">Reset password</h1>
      <p className="text-sm text-fg-muted mb-6">
        Enter your email and we&apos;ll send a reset link.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-fg mb-1.5">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            aria-invalid={!!emailError}
          />
          {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
        </div>

        <Button type="submit" variant="solid" className="w-full justify-center" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>

        <Link href="/sign-in" className="text-sm text-center text-fg-muted hover:text-fg">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
