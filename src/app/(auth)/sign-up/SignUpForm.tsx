"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setServerError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = signUpSchema.safeParse(values);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.fullName,
          phone: result.data.phone,
        },
        emailRedirectTo: `${location.origin}/auth/callback?next=/`,
      },
    });

    setLoading(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push("/verify-email");
  }

  const roleHint = searchParams.get("role");

  return (
    <div className="bg-surface rounded-xl border border-[var(--border)] p-8 shadow-card">
      <h1 className="font-display font-bold text-2xl text-fg mb-1">
        {roleHint === "owner" ? "List your property" : "Create an account"}
      </h1>
      <p className="text-sm text-fg-muted mb-6">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-fg mb-1.5">
            Full name
          </label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-fg mb-1.5">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-fg mb-1.5">
            Mobile number
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-fg-muted shrink-0">+91</span>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
              aria-invalid={!!errors.phone}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-fg mb-1.5">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          <p className="mt-1 text-xs text-fg-muted">
            Min. 8 characters, one uppercase letter, one number.
          </p>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-500/10 rounded-md px-3 py-2">
            {serverError}
          </p>
        )}

        <Button type="submit" variant="solid" className="w-full justify-center mt-1" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
