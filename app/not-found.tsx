import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden className="absolute inset-0 blueprint-grid mask-fade-edges" />
      <div className="relative text-center">
        <Link href="/" className="inline-block rounded-md">
          <Logo />
        </Link>
        <p className="mt-10 font-mono text-[11px] tracking-[0.2em] text-primary-text uppercase">Error 404 · Station not found</p>
        <h1 className="mt-3 font-display text-display-xl font-semibold">This alignment doesn&apos;t close.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard">
              <Compass /> Go to Overview
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">CELEVATE home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
