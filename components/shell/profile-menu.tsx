"use client";

import Link from "next/link";
import { Award, ExternalLink, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProgress } from "@/lib/store/progress";

export function initials(name?: string) {
  if (!name) return "FE";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function Avatar({ name, className = "size-8 text-[11px]" }: { name?: string; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-iris font-semibold text-white ${className}`} aria-hidden>
      {initials(name)}
    </span>
  );
}

export function ProfileMenu() {
  const profile = useProgress((s) => s.profile);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="rounded-full outline-offset-2" aria-label="Open profile menu">
        <Avatar name={profile?.name} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center gap-3 px-2.5 py-2.5">
          <Avatar name={profile?.name} className="size-9 text-xs" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{profile?.name ?? "Guest reviewee"}</p>
            <p className="truncate text-xs text-muted">{profile?.targetExam ?? "No review plan yet"}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {!profile && (
          <DropdownMenuItem asChild>
            <Link href="/onboarding">
              <UserRound /> Set up your review plan
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> Profile &amp; settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/achievements">
            <Award /> Achievements
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <ExternalLink /> CELEVATE home
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
