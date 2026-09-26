"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { changePassword } from "@/lib/actions/account";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSuccess(false);
    startTransition(async () => {
      const result = await changePassword(newPassword);
      if (result.ok) {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(result.error ?? "Failed to change password.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="New password"
        id="new-password"
        type="password"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setSuccess(false);
          setError("");
        }}
        autoComplete="new-password"
      />
      <Input
        label="Confirm new password"
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setSuccess(false);
          setError("");
        }}
        autoComplete="new-password"
      />
      <p className="text-xs text-fg-muted">
        Min. 8 characters, one uppercase letter, one number.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Password changed successfully.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
