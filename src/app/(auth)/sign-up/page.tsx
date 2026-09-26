import { Suspense } from "react";
import type { Metadata } from "next";
import { SignUpForm } from "./SignUpForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Account — Swiito",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="bg-surface rounded-xl border border-[var(--border)] p-8 shadow-card min-h-[420px]" />}>
      <SignUpForm />
    </Suspense>
  );
}
