"use client";

import { Tabs as T } from "radix-ui";
import { motion } from "motion/react";
import { createContext, useContext, useId } from "react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

const TabsCtx = createContext<{ value?: string; id: string }>({ id: "" });

export function Tabs({ value, className, ...props }: React.ComponentProps<typeof T.Root>) {
  const id = useId();
  return (
    <TabsCtx.Provider value={{ value, id }}>
      <T.Root value={value} className={cn("min-w-0 max-w-full", className)} {...props} />
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<typeof T.List>) {
  return (
    <T.List
      className={cn("relative inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-line bg-subtle/70 p-0.5 scrollbar-none", className)}
      {...props}
    />
  );
}

/** Use with a controlled <Tabs value> to get the animated active indicator. */
export function TabsTrigger({ className, children, value, ...props }: React.ComponentProps<typeof T.Trigger>) {
  const ctx = useContext(TabsCtx);
  const active = ctx.value === value;
  return (
    <T.Trigger
      value={value}
      className={cn(
        "relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted transition-colors hover:text-fg data-[state=active]:text-fg [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId={`tab-${ctx.id}`}
          className="absolute inset-0 rounded-md border border-line bg-surface shadow-elev-1"
          transition={spring.snappy}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-1.5">{children}</span>
    </T.Trigger>
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof T.Content>) {
  return <T.Content className={cn("outline-none data-[state=active]:animate-pop-in", className)} {...props} />;
}
