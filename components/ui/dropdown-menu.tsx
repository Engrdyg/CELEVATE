"use client";

import { DropdownMenu as M } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;
export const DropdownMenuGroup = M.Group;
export const DropdownMenuRadioGroup = M.RadioGroup;

export const menuContentClass =
  "z-50 min-w-48 overflow-hidden rounded-xl border border-line bg-surface p-1 text-sm shadow-elev-3 outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out";
export const menuItemClass =
  "relative flex h-9 cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-fg outline-none transition-colors data-[highlighted]:bg-subtle data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted";

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content sideOffset={sideOffset} className={cn(menuContentClass, className)} {...props} />
    </M.Portal>
  );
}
export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof M.Item>) {
  return <M.Item className={cn(menuItemClass, className)} {...props} />;
}
export function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof M.RadioItem>) {
  return (
    <M.RadioItem className={cn(menuItemClass, "pr-8", className)} {...props}>
      {children}
      <M.ItemIndicator className="absolute right-2.5">
        <Check className="!text-primary-text" />
      </M.ItemIndicator>
    </M.RadioItem>
  );
}
export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof M.Label>) {
  return <M.Label className={cn("px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide text-faint uppercase", className)} {...props} />;
}
export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof M.Separator>) {
  return <M.Separator className={cn("-mx-1 my-1 h-px bg-line", className)} {...props} />;
}
