"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { submitContactAction, type ContactState } from "@/lib/actions/contact";

const initial: ContactState = { ok: false };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactAction, initial);

  if (state.ok) {
    return (
      <div className="bg-surface rounded-xl border border-[var(--border)] p-8 text-center">
        <p className="text-lg font-medium text-fg mb-2">Message received</p>
        <p className="text-sm text-fg-muted">
          We&apos;ll reach out to you shortly. You can also call or WhatsApp us
          directly using the details on this page.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="bg-surface rounded-xl border border-[var(--border)] p-6 space-y-4">
      <h2 className="font-display font-semibold text-fg text-lg">Send us a message</h2>

      <Input
        label="Your name"
        name="name"
        autoComplete="name"
        placeholder="Ramesh Kumar"
        error={state.errors?.name}
        required
      />

      <Input
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+91 98765 43210"
        error={state.errors?.phone}
        required
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-fg">
          Message <span className="text-fg-muted font-normal">(optional)</span>
        </label>
        <textarea
          name="message"
          rows={4}
          maxLength={1000}
          placeholder="Looking for a 2 BHK near Kanke for rent under ₹15,000…"
          className="w-full rounded-lg border border-[var(--border)] bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 transition-brand resize-none"
        />
        {state.errors?.message && (
          <p className="text-xs text-danger">{state.errors.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
