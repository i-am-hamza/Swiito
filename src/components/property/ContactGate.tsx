"use client";

import { useState, useTransition, useEffect, useSyncExternalStore, useMemo } from "react";
import { Phone, PhoneCall, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { submitPropertyContact } from "@/lib/actions/leads";

const LS_NAME = "swiito_cn";
const LS_PHONE = "swiito_cp";
const rvKey = (id: string) => `swiito_rv_${id}`;

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

interface BrokerInfo {
  phone: string;
  display: string;
  whatsapp: string;
}

interface Props {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  variant?: "card" | "bar";
}

export function ContactGate({
  propertyId,
  propertyTitle,
  propertySlug,
  variant = "card",
}: Props) {
  const cachedJson = useSyncExternalStore(
    subscribeStorage,
    () => { try { return localStorage.getItem(rvKey(propertyId)); } catch { return null; } },
    () => null
  );
  const brokerInfo = useMemo((): BrokerInfo | undefined => {
    if (!cachedJson) return undefined;
    try { return JSON.parse(cachedJson) as BrokerInfo; } catch { return undefined; }
  }, [cachedJson]);

  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(LS_NAME) ?? ""; } catch { return ""; }
  });
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(LS_PHONE) ?? ""; } catch { return ""; }
  });
  const [message, setMessage] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!/^[6-9]\d{9}$/.test(phone.trim()))
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError("");

    startTransition(async () => {
      const result = await submitPropertyContact({
        propertyId,
        propertySlug,
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim() || undefined,
        moveInDate: moveIn || undefined,
        website,
      });

      if (result.ok && result.brokerPhone) {
        const info: BrokerInfo = {
          phone: result.brokerPhone,
          display: result.brokerDisplay ?? result.brokerPhone,
          whatsapp: result.brokerWhatsapp ?? result.brokerPhone,
        };
        try {
          localStorage.setItem(LS_NAME, name.trim());
          localStorage.setItem(LS_PHONE, phone.trim());
          localStorage.setItem(rvKey(propertyId), JSON.stringify(info));
          window.dispatchEvent(new StorageEvent("storage", { key: rvKey(propertyId) }));
        } catch {}
        setSheetOpen(false);
      } else if (result.error === "rate_limited") {
        setServerError("Too many enquiries from this number. Please call us directly.");
      } else if (result.fieldErrors) {
        const e: Record<string, string> = {};
        if (result.fieldErrors.name) e.name = result.fieldErrors.name;
        if (result.fieldErrors.phone) e.phone = result.fieldErrors.phone;
        setErrors(e);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    });
  }

  const waMsg = encodeURIComponent(
    `Hi Swiito, I'm interested in: ${propertyTitle} (Ref: ${propertySlug}). Please share more details.`
  );
  const revealed = !!brokerInfo;

  /* ── Shared form JSX ─────────────────────────────────────────────────────── */
  const formContent = (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {/* Honeypot — visually hidden, bot-detectable server-side */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />

      <p className="text-xs text-fg-muted leading-relaxed">
        Leave your details and we&apos;ll share Swiito&apos;s broker number. One
        call, real answers — your number stays private.
      </p>

      <div>
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          suppressHydrationWarning
          onChange={(e) => {
            setName(e.target.value);
            setErrors((p) => ({ ...p, name: "" }));
          }}
          aria-label="Your name"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name}</p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-fg-muted shrink-0">+91</span>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="Mobile number"
            value={phone}
            suppressHydrationWarning
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ""));
              setErrors((p) => ({ ...p, phone: "" }));
            }}
            aria-label="Mobile number"
            aria-invalid={!!errors.phone}
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-xs text-danger">{errors.phone}</p>
        )}
      </div>

      <Input
        type="text"
        placeholder="Message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        aria-label="Message"
      />

      <Input
        type="date"
        value={moveIn}
        onChange={(e) => setMoveIn(e.target.value)}
        aria-label="Move-in date"
      />

      {serverError && <p className="text-xs text-danger">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="w-full justify-center">
        <Send size={14} className="mr-2" aria-hidden="true" />
        {isPending ? "Submitting…" : "Get broker contact"}
      </Button>
      <p className="text-[10px] text-fg-muted text-center">
        Free. No spam. Your number stays private.
      </p>
    </form>
  );

  /* ── Shared broker buttons JSX ───────────────────────────────────────────── */
  const brokerButtons = (compact?: boolean) => (
    <div className="flex gap-3">
      <a
        href={`tel:${brokerInfo!.phone}`}
        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full border border-[var(--border)] bg-surface-2 text-fg text-sm font-medium min-h-[44px] transition-brand hover:bg-surface"
      >
        <PhoneCall size={15} aria-hidden="true" />
        {compact ? brokerInfo!.display : "Call"}
      </a>
      <a
        href={`https://wa.me/${brokerInfo!.whatsapp}?text=${waMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-green-600 text-white text-sm font-medium min-h-[44px] transition-brand hover:bg-green-700"
      >
        <MessageCircle size={15} aria-hidden="true" />
        WhatsApp
      </a>
    </div>
  );

  /* ── Bar variant (mobile bottom) ─────────────────────────────────────────── */
  if (variant === "bar") {
    return (
      <>
        {revealed ? (
          brokerButtons(true)
        ) : (
          <Button
            onClick={() => setSheetOpen(true)}
            className="w-full justify-center"
          >
            <PhoneCall size={14} className="mr-2" aria-hidden="true" />
            Get contact details
          </Button>
        )}

        {/* Bottom sheet — renders on mobile only since bar is lg:hidden */}
        {sheetOpen && (
          <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Contact Swiito"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSheetOpen(false)}
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 inset-x-0 bg-surface rounded-t-2xl px-5 pt-5 flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
              style={{
                paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
              }}
            >
              {/* Drag handle */}
              <div
                className="w-10 h-1 rounded-full mx-auto shrink-0"
                style={{ backgroundColor: "var(--border)" }}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-accent shrink-0" aria-hidden="true" />
                  <span className="font-display font-semibold text-fg text-sm">
                    Contact via Swiito
                  </span>
                </div>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-fg-muted hover:text-fg rounded-md transition-brand"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {formContent}
            </div>
          </div>
        )}
      </>
    );
  }

  /* ── Card variant (desktop sidebar) ─────────────────────────────────────── */
  return (
    <div className="bg-surface rounded-xl border border-[var(--border)] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Phone size={18} className="text-accent shrink-0" aria-hidden="true" />
        <span className="font-display font-semibold text-fg text-sm">
          Contact via Swiito
        </span>
      </div>

      {revealed ? (
        <>
          <div className="text-center">
            <p className="text-xs text-fg-muted mb-1">Swiito broker</p>
            <p className="font-bold text-xl text-fg tabular-nums">
              {brokerInfo!.display}
            </p>
          </div>
          {brokerButtons()}
          <p className="text-[10px] text-fg-muted text-center">
            Our broker will help you arrange a visit.
          </p>
        </>
      ) : (
        formContent
      )}
    </div>
  );
}
