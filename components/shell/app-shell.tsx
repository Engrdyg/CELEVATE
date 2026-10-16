"use client";

import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { useProgress } from "@/lib/store/progress";
import { useUI } from "@/lib/store/ui";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { cn } from "@/lib/utils";
import { CommandMenu } from "./command-menu";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

function DemoBanner() {
  const mode = useProgress((s) => s.dataMode);
  if (mode !== "demo") return null;
  return (
    <div className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-xs text-fg sm:px-6" role="status">
      <FlaskConical className="mr-1.5 inline size-3.5 text-warning" aria-hidden />
      You&apos;re viewing <strong className="font-semibold">generated sample data</strong> to preview CELEVATE. It does not reflect real activity.{" "}
      <Link href="/settings#data" className="font-medium text-primary-text underline-offset-2 hover:underline">
        Clear sample data
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const focus = useUI((s) => s.focusMode);
  useStudyTimer();
  return (
    <div className="flex min-h-dvh">
      {!focus && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        {!focus && <Topbar />}
        {!focus && <DemoBanner />}
        <main id="main" className={cn("flex-1", !focus && "pb-24 lg:pb-0")}>
          {children}
        </main>
      </div>
      {!focus && <MobileNav />}
      <CommandMenu />
    </div>
  );
}

/** Standard page container used by app screens. */
export function PageContainer({ className, children, wide }: { className?: string; children: React.ReactNode; wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8", wide ? "max-w-[96rem]" : "max-w-page", className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="font-display text-display-lg font-semibold text-fg">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
