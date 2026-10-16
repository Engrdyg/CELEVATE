"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Grid2x2 } from "lucide-react";
import { Dialog, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { MOBILE_PRIMARY, NAV_ITEMS, navFor } from "./nav";

const SHORT: Record<string, string> = {
  "/dashboard": "Overview",
  "/subjects": "Subjects",
  "/practice": "Practice",
  "/exams": "Exams",
};

export function MobileNav() {
  const pathname = usePathname();
  const active = navFor(pathname);
  const [open, setOpen] = useState(false);
  const primary = NAV_ITEMS.filter((n) => MOBILE_PRIMARY.includes(n.href));
  const overflow = NAV_ITEMS.filter((n) => !MOBILE_PRIMARY.includes(n.href));
  const overflowActive = !!active && !MOBILE_PRIMARY.includes(active.href);

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-safe backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {primary.map((item) => {
          const isActive = active?.href === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn("relative flex h-full flex-col items-center justify-center gap-1 text-[10px] font-medium", isActive ? "text-primary-text" : "text-muted")}
              >
                {isActive && <motion.span layoutId="mobile-active" className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary" transition={spring.snappy} />}
                <Icon className="size-5" aria-hidden />
                {SHORT[item.href]}
              </Link>
            </li>
          );
        })}
        <li>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              className={cn("relative flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-medium", overflowActive ? "text-primary-text" : "text-muted")}
            >
              {overflowActive && <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary" />}
              <Grid2x2 className="size-5" aria-hidden />
              More
            </DialogTrigger>
            <SheetContent side="bottom" title="More destinations">
              <ul className="grid grid-cols-3 gap-2 p-4 pt-1">
                {overflow.map((item) => {
                  const Icon = item.icon;
                  const isActive = active?.href === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex aspect-[1.15] flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center text-[12px] font-medium transition-colors",
                          isActive ? "border-primary/40 bg-primary-soft text-primary-text" : "border-line bg-card text-fg hover:bg-subtle",
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </SheetContent>
          </Dialog>
        </li>
      </ul>
    </nav>
  );
}
