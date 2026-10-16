"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog as D } from "radix-ui";
import { BookOpen, CornerDownLeft, History, Monitor, Moon, Search, Sigma, Sun, Timer } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { useTheme } from "@/components/theme/theme-provider";
import { plainText } from "@/components/math/rich-text";
import { allFormulas, lessonOutline, subjects } from "@/lib/content";
import { useProgress } from "@/lib/store/progress";
import { useUI } from "@/lib/store/ui";
import { NAV_ITEMS } from "./nav";

const itemClass =
  "flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-[13px] text-fg outline-none data-[selected=true]:bg-subtle [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted";
const groupClass =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-faint [&_[cmdk-group-heading]]:uppercase";

export function CommandMenu() {
  const open = useUI((s) => s.commandOpen);
  const setOpen = useUI((s) => s.setCommandOpen);
  const router = useRouter();
  const { setTheme } = useTheme();
  const last = useProgress((s) => s.lastLocation);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!useUI.getState().commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <D.Root open={open} onOpenChange={setOpen}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />
        <D.Content
          className="fixed top-[12dvh] left-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-elev-4 outline-none data-[state=open]:animate-pop-in"
          aria-describedby={undefined}
        >
          <D.Title className="sr-only">Command menu</D.Title>
          <Command label="Command menu" loop className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-faint" aria-hidden />
              <Command.Input
                autoFocus
                placeholder="Search lessons, formulas, pages and actions…"
                className="h-13 flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-faint"
              />
              <Kbd>Esc</Kbd>
            </div>
            <Command.List className="max-h-[min(60dvh,26rem)] overflow-y-auto p-1.5">
              <Command.Empty className="px-4 py-10 text-center text-sm text-muted">No matches. Try a topic like “curve” or “Bernoulli”.</Command.Empty>
              {last && (
                <Command.Group heading="Resume" className={groupClass}>
                  <Command.Item value={`resume ${last.title}`} onSelect={() => go(last.href)} className={itemClass}>
                    <History /> <span className="flex-1 truncate">{last.title}</span>
                    <span className="text-xs text-faint">{last.subtitle}</span>
                  </Command.Item>
                </Command.Group>
              )}
              <Command.Group heading="Navigate" className={groupClass}>
                {NAV_ITEMS.map((n) => (
                  <Command.Item key={n.href} value={`page ${n.label} ${n.description}`} onSelect={() => go(n.href)} className={itemClass}>
                    <n.icon /> <span className="flex-1">{n.label}</span>
                    <span className="hidden text-xs text-faint sm:inline">{n.description}</span>
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Lessons" className={groupClass}>
                {lessonOutline
                  .filter((l) => l.status === "available")
                  .map((l) => (
                    <Command.Item key={l.id} value={`lesson ${l.title} ${l.topics.join(" ")} ${l.subjectId}`} onSelect={() => go(`/subjects/${l.subjectId}/${l.id}`)} className={itemClass}>
                      <BookOpen /> <span className="flex-1 truncate">{l.title}</span>
                      <span className="font-mono text-[10px] text-faint uppercase">{subjects.find((s) => s.id === l.subjectId)?.code}</span>
                    </Command.Item>
                  ))}
              </Command.Group>
              <Command.Group heading="Formulas" className={groupClass}>
                {allFormulas.map((f) => (
                  <Command.Item key={f.id} value={`formula ${f.name} ${f.category} ${plainText(f.description)}`} onSelect={() => go(`/formulas?f=${f.id}`)} className={itemClass}>
                    <Sigma /> <span className="flex-1 truncate">{f.name}</span>
                    <span className="truncate text-xs text-faint">{f.category}</span>
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Actions" className={groupClass}>
                <Command.Item value="action start mock exam" onSelect={() => go("/exams")} className={itemClass}>
                  <Timer /> Start a mock board exam
                </Command.Item>
                <Command.Item value="action theme light" onSelect={() => (setTheme("light"), setOpen(false))} className={itemClass}>
                  <Sun /> Switch to light theme
                </Command.Item>
                <Command.Item value="action theme dark" onSelect={() => (setTheme("dark"), setOpen(false))} className={itemClass}>
                  <Moon /> Switch to dark theme
                </Command.Item>
                <Command.Item value="action theme system" onSelect={() => (setTheme("system"), setOpen(false))} className={itemClass}>
                  <Monitor /> Use system theme
                </Command.Item>
              </Command.Group>
            </Command.List>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-faint">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>
                  <CornerDownLeft className="size-3" />
                </Kbd>
                open
              </span>
            </div>
          </Command>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
