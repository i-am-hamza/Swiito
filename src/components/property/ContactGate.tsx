"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Lock, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { revealContact } from "@/lib/actions/leads";

interface BrokerInfo {
  phone: string;
  display: string;
  whatsapp: string;
}

interface ContactGateProps {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  isSignedIn: boolean;
  initialBrokerInfo?: BrokerInfo;
  variant?: "card" | "bar";
}

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "You've reached the daily reveal limit. Try again tomorrow.",
  server_error: "Something went wrong. Please try again.",
};

export function ContactGate({
  propertyId,
  propertyTitle,
  propertySlug,
  isSignedIn,
  initialBrokerInfo,
  variant = "card",
}: ContactGateProps) {
  const [brokerInfo, setBrokerInfo] = useState<BrokerInfo | undefined>(initialBrokerInfo);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const revealed = !!brokerInfo;

  function handleReveal() {
    setError("");
    startTransition(async () => {
      const result = await revealContact(propertyId, propertySlug);
      if (result.ok && result.brokerPhone) {
        setBrokerInfo({
          phone: result.brokerPhone,
          display: result.brokerDisplay ?? result.brokerPhone,
          whatsapp: result.brokerWhatsapp ?? result.brokerPhone,
        });
      } else {
        setError(ERROR_MESSAGES[result.error ?? ""] ?? "Something went wrong.");
      }
    });
  }

  const waMessage = encodeURIComponent(
    `Hi Swiito, I'm interested in: ${propertyTitle} (Ref: ${propertySlug}). Please share more details.`
  );

  if (variant === "bar") {
    return (
      <div className="flex items-center gap-3">
        {!isSignedIn ? (
          <Link
            href={`/sign-in?next=${encodeURIComponent(`/properties/${propertySlug}`)}`}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-accent text-on-accent text-sm font-medium min-h-[44px] transition-brand hover:bg-[var(--accent-hover)]"
          >
            <Lock size={14} />
            Sign in to get contact
          </Link>
        ) : revealed ? (
          <>
            <a
              href={`tel:${brokerInfo!.phone}`}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-surface-2 text-fg text-sm font-medium border border-[var(--border)] min-h-[44px] transition-brand hover:bg-surface"
            >
              <PhoneCall size={14} />
              {brokerInfo!.display}
            </a>
            <a
              href={`https://wa.me/${brokerInfo!.whatsapp}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-11 h-11 flex items-center justify-center rounded-full bg-green-600 text-white min-h-[44px] transition-brand hover:bg-green-700"
            >
              <MessageCircle size={18} />
            </a>
          </>
        ) : (
          <Button
            onClick={handleReveal}
            disabled={isPending}
            className="flex-1 justify-center"
          >
            <PhoneCall size={14} className="mr-2" />
            {isPending ? "Loading…" : "Get contact details"}
          </Button>
        )}
      </div>
    );
  }

  // Card variant
  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-[var(--border)] p-5 flex flex-col gap-4"
      )}
    >
      <div className="flex items-center gap-2">
        <Phone size={18} className="text-accent shrink-0" />
        <span className="font-display font-semibold text-fg text-sm">Contact via Swiito</span>
      </div>

      {!isSignedIn ? (
        <>
          <p className="text-xs text-fg-muted leading-relaxed">
            Sign in to get our broker&apos;s number. One call, real answers — your details stay private.
          </p>
          <Link
            href={`/sign-in?next=${encodeURIComponent(`/properties/${propertySlug}`)}`}
            className="flex items-center justify-center gap-2 h-11 rounded-full bg-accent text-on-accent text-sm font-medium min-h-[44px] transition-brand hover:bg-[var(--accent-hover)]"
          >
            <Lock size={14} />
            Sign in to get contact
          </Link>
          <p className="text-[10px] text-fg-muted text-center">
            No spam. Your number stays private.
          </p>
        </>
      ) : revealed ? (
        <>
          <div className="text-center">
            <p className="text-xs text-fg-muted mb-1">Swiito broker</p>
            <p className="font-bold text-xl text-fg tabular-nums">{brokerInfo!.display}</p>
          </div>
          <div className="flex gap-3">
            <a
              href={`tel:${brokerInfo!.phone}`}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full border border-[var(--border)] bg-surface-2 text-fg text-sm font-medium min-h-[44px] transition-brand hover:bg-surface"
            >
              <PhoneCall size={15} />
              Call
            </a>
            <a
              href={`https://wa.me/${brokerInfo!.whatsapp}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-green-600 text-white text-sm font-medium min-h-[44px] transition-brand hover:bg-green-700"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-fg-muted leading-relaxed">
            Get our broker&apos;s direct number. They&apos;ll arrange a viewing and answer your questions.
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button onClick={handleReveal} disabled={isPending} className="w-full justify-center">
            <PhoneCall size={14} className="mr-2" />
            {isPending ? "Loading…" : "Get contact details"}
          </Button>
          <p className="text-[10px] text-fg-muted text-center">
            Free. No spam. Your info stays private.
          </p>
        </>
      )}
    </div>
  );
}
