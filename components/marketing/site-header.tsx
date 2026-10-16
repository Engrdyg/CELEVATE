"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeMenu } from "@/components/theme/theme-selector";
import { Dialog, DialogTrigger, SheetContent, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#subjects", label: "Subjects" },
  { href: "#analytics", label: "Analytics" },
  { href: "#mock-exams", label: "Mock exams" },
  { href: "#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        className={cn(
          "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled ? "border-line bg-canvas/75 backdrop-blur-xl backdrop-saturate-150" : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-md" aria-label="CELEVATE home">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded-md px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:text-fg">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeMenu />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard">Open app</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/onboarding">
                Start Reviewing <ArrowRight />
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </DialogTrigger>
              <SheetContent side="right" title="Menu">
                <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
                  {NAV.map((n) => (
                    <DialogClose asChild key={n.href}>
                      <a href={n.href} className="rounded-lg px-3 py-3 text-[15px] font-medium text-fg hover:bg-subtle">
                        {n.label}
                      </a>
                    </DialogClose>
                  ))}
                </nav>
                <div className="flex flex-col gap-2 border-t border-line p-4">
                  <Button asChild size="lg">
                    <Link href="/onboarding">
                      Start Reviewing <ArrowRight />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/dashboard">Open app</Link>
                  </Button>
                </div>
              </SheetContent>
            </Dialog>
          </div>
        </div>
      </div>
      <motion.div aria-hidden className="h-px origin-left bg-gradient-to-r from-primary to-iris" style={{ scaleX: scrollYProgress }} />
    </header>
  );
}
