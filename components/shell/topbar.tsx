"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ThemeMenu } from "@/components/theme/theme-selector";
import { useUI } from "@/lib/store/ui";
import { NotificationCenter } from "./notifications";
import { ProfileMenu } from "./profile-menu";
import { navFor } from "./nav";

export function Topbar() {
  const pathname = usePathname();
  const nav = navFor(pathname);
  const openCommand = useUI((s) => s.setCommandOpen);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:h-16 lg:px-8">
        <Link href="/dashboard" className="rounded-md lg:hidden" aria-label="Overview">
          <LogoMark className="size-7" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold tracking-tight lg:text-base">{nav?.label ?? "CELEVATE"}</p>
          <p className="hidden truncate text-xs text-muted sm:block">{nav?.description}</p>
        </div>

        <button
          type="button"
          onClick={() => openCommand(true)}
          className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] text-faint shadow-elev-1 transition-colors hover:border-line-strong hover:text-muted md:flex xl:w-80"
          aria-label="Search lessons, formulas and pages"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1 text-left">Search lessons, formulas…</span>
          <Kbd>⌘K</Kbd>
        </button>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => openCommand(true)}>
            <Search />
          </Button>
          <ThemeMenu />
          <NotificationCenter />
          <div className="ml-1.5">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
