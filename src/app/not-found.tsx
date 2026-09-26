import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-accent opacity-30 leading-none mb-6">
          404
        </p>
        <h1 className="font-display font-bold text-2xl text-fg mb-3">
          Page not found
        </h1>
        <p className="text-fg-muted text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try browsing verified properties in Ranchi instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/properties">
            <Button variant="solid">Browse properties</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
