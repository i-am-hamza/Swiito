"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-danger opacity-20 leading-none mb-6">
          500
        </p>
        <h1 className="font-display font-bold text-2xl text-fg mb-3">
          Something went wrong
        </h1>
        <p className="text-fg-muted text-sm mb-8 leading-relaxed">
          An unexpected error occurred. You can try again or return to the home page.
          {error.digest && (
            <span className="block mt-2 text-xs opacity-50">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="solid" onClick={reset}>
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
