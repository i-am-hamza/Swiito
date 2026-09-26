"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
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
    const result = resetPasswordSchema.safeParse(values);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const formErrors = result.error.flatten().formErrors;
      const errs: Record<string, string> = {};
      for (const [k, v] of Object.entries(flat)) errs[k] = v?.[0] ?? "";
      if (formErrors.length) errs.confirmPassword = formErrors[0];
      setErrors(errs);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: result.data.password });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }
    router.push("/sign-in");
  }

  return (
    <div className="bg-surface rounded-xl border border-[var(--border)] p-8 shadow-card">
      <h1 className="font-display font-bold text-2xl text-fg mb-1">Set new password</h1>
      <p className="text-sm text-fg-muted mb-6">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-fg mb-1.5">
            New password
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-fg mb-1.5">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-500/10 rounded-md px-3 py-2">
            {serverError}
          </p>
        )}

        <Button type="submit" variant="solid" className="w-full justify-center" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
