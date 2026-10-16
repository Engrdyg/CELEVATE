"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ChevronsLeft, Flame } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Tooltip } from "@/components/ui/tooltip";
import { usePrefs } from "@/lib/store/prefs";
import { useProgress } from "@/lib/store/progress";
import { studyStreak } from "@/lib/analytics";
import { useStoreReady } from "@/hooks/use-hydrated";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, navFor } from "./nav";

/**
 * Desktop sidebar. Collapsed state is mirrored to <html data-sidebar> (set
 * pre-paint by the theme script) so the width never flashes on load.
 */
export function Sidebar() {
  const pathname = usePathname();
  const active = navFor(pathname);
  const collapsed = usePrefs((s) => s.sidebarCollapsed);
  const toggle = usePrefs((s) => s.toggleSidebar);
  const state = useProgress();
  const ready = useStoreReady();
  const streak = ready ? studyStreak(state) : { current: 0, best: 0, activeToday: false };

  return (
    <aside
      aria-label="Main navigation"
      className="group/sidebar sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line bg-surface/60 backdrop-blur-xl transition-[width] duration-300 ease-out-expo in-data-[sidebar=collapsed]:w-[68px] lg:flex"
    >
      <div className="flex h-16 items-center px-4 in-data-[sidebar=collapsed]:justify-center in-data-[sidebar=collapsed]:px-0">
        <Link href="/" className="rounded-md" aria-label="CELEVATE home">
          <Logo className="in-data-[sidebar=collapsed]:hidden" />
          <LogoMark className="hidden in-data-[sidebar=collapsed]:block" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-none in-data-[sidebar=collapsed]:px-2.5">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item, i) => {
            const isActive = active?.href === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                {i === 8 && <div className="mx-2 my-3 h-px bg-line" aria-hidden />}
                <Tooltip content={item.label} side="right" disabled={!collapsed}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px] font-medium transition-colors duration-150",
                      "in-data-[sidebar=collapsed]:justify-center in-data-[sidebar=collapsed]:px-0",
                      isActive ? "text-fg" : "text-muted hover:bg-subtle/70 hover:text-fg",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg border border-line bg-card shadow-elev-1"
                        transition={spring.snappy}
                      >
                        <span className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-primary in-data-[sidebar=collapsed]:-left-2.5" />
                      </motion.span>
                    )}
                    <Icon className={cn("relative size-[18px] shrink-0", isActive && "text-primary-text")} aria-hidden />
                    <span className="relative truncate in-data-[sidebar=collapsed]:sr-only">{item.label}</span>
                  </Link>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 p-3 in-data-[sidebar=collapsed]:px-2.5">
        <Link
          href="/progress"
          className="block rounded-xl border border-line bg-card p-3 transition-colors hover:border-line-strong in-data-[sidebar=collapsed]:hidden"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-muted">
            <span className="flex items-center gap-1.5">
              <Flame className={cn("size-3.5", streak.current ? "text-warning" : "text-faint")} aria-hidden /> Study streak
            </span>
            {streak.activeToday && <span className="text-success">Today ✓</span>}
          </div>
          <p className="mt-1 font-display text-lg font-semibold tabular">
            {streak.current} {streak.current === 1 ? "day" : "days"}
          </p>
          <p className="text-[11px] text-faint">Best: {streak.best} days</p>
        </Link>
        <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-[13px] text-muted transition-colors hover:bg-subtle hover:text-fg in-data-[sidebar=collapsed]:justify-center in-data-[sidebar=collapsed]:px-0"
          >
            <ChevronsLeft className="size-[18px] transition-transform duration-300 in-data-[sidebar=collapsed]:rotate-180" aria-hidden />
            <span className="in-data-[sidebar=collapsed]:sr-only">Collapse</span>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
