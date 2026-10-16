"use client";

import { Accordion as A } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = A.Root;

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof A.Item>) {
  return <A.Item className={cn("border-b border-line last:border-b-0", className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof A.Trigger>) {
  return (
    <A.Header className="flex">
      <A.Trigger
        className={cn(
          "group flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium text-fg transition-colors hover:text-primary-text",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden />
      </A.Trigger>
    </A.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof A.Content>) {
  return (
    <A.Content className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down" {...props}>
      <div className={cn("pb-4 text-sm leading-6 text-muted", className)}>{children}</div>
    </A.Content>
  );
}
