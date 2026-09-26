"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/actions/account";
import type { UserProfile } from "@/types";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [name, setName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProfile({ fullName: name, phone });
      if (result.ok) setSuccess(true);
      else setError(result.error ?? "Failed to update profile");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Full name"
        id="profile-name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSuccess(false);
        }}
        autoComplete="name"
      />
      <Input
        label="Phone"
        id="profile-phone"
        type="tel"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setSuccess(false);
        }}
        placeholder="10-digit Indian mobile number"
        autoComplete="tel"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Profile updated successfully.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
