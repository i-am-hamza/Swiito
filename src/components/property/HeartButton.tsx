"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/browser";
import { toggleShortlist } from "@/lib/actions/shortlist";

interface HeartButtonProps {
  propertyId: string;
  initialShortlisted: boolean;
  className?: string;
}

export function HeartButton({ propertyId, initialShortlisted, className }: HeartButtonProps) {
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setShortlisted((prev) => !prev);
    startTransition(async () => {
      const result = await toggleShortlist(propertyId);
      if (!result.ok) {
        setShortlisted((prev) => !prev);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-full transition-brand",
        "bg-black/40 hover:bg-black/60 backdrop-blur-sm",
        isPending && "opacity-60",
        className
      )}
    >
      <Heart
        size={16}
        className={cn(
          "transition-brand",
          shortlisted ? "fill-red-500 text-red-500" : "text-white"
        )}
      />
    </button>
  );
}
