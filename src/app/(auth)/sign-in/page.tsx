import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In — Swiito",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="bg-surface rounded-xl border border-[var(--border)] p-8 shadow-card min-h-[320px]" />}>
      <SignInForm />
    </Suspense>
  );
}
