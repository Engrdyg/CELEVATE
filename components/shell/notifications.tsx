"use client";

import Link from "next/link";
import { Popover } from "radix-ui";
import { Award, Bell, CalendarClock, ClipboardCheck, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/states";
import { useProgress } from "@/lib/store/progress";
import { deriveNotifications } from "@/lib/notifications";
import { cn, formatRelative } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useStoreReady } from "@/hooks/use-hydrated";

const ICONS = { achievement: Award, exam: ClipboardCheck, streak: Flame, welcome: Sparkles, schedule: CalendarClock };
const TONES = {
  achievement: "bg-warning-soft text-warning",
  exam: "bg-iris-soft text-iris-text",
  streak: "bg-warning-soft text-warning",
  welcome: "bg-primary-soft text-primary-text",
  schedule: "bg-info-soft text-info",
};

export function NotificationCenter() {
  const state = useProgress();
  const markRead = useProgress((s) => s.markNotificationsRead);
  const [open, setOpen] = useState(false);
  const ready = useStoreReady();
  const items = useMemo(() => (ready ? deriveNotifications(state) : []), [state, ready]);
  const unread = items.filter((n) => !state.readNotificationIds.includes(n.id));

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tooltip content="Notifications">
        <Popover.Trigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`} className="relative">
            <Bell />
            {unread.length > 0 && (
              <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-canvas" aria-hidden />
            )}
          </Button>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-line bg-surface shadow-elev-4 outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-semibold">Notifications</p>
            {unread.length > 0 && (
              <button className="text-xs font-medium text-primary-text hover:underline" onClick={() => markRead(items.map((i) => i.id))}>
                Mark all as read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <EmptyState compact icon={Bell} title="You're all caught up" description="Activity updates such as earned achievements and unfinished exams will appear here." />
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto p-1.5">
              {items.map((n) => {
                const Icon = ICONS[n.kind];
                const isUnread = !state.readNotificationIds.includes(n.id);
                return (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => {
                        markRead([n.id]);
                        setOpen(false);
                      }}
                      className="flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-subtle"
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", TONES[n.kind])}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-medium text-fg">{n.title}</span>
                          {isUnread && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted">{n.body}</span>
                        <span className="mt-0.5 block text-[11px] text-faint">{formatRelative(n.at)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
