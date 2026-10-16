"use client";

import { Select as S } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({
  value,
  onChange,
  options,
  label,
  className,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <S.Root value={value} onValueChange={onChange}>
      <S.Trigger
        aria-label={label}
        className={cn(
          "inline-flex h-9 min-w-36 items-center justify-between gap-2 rounded-lg border border-line-strong bg-surface px-3 text-left text-[13px] font-medium text-fg shadow-elev-1 outline-none [&>span:first-child]:truncate hover:bg-subtle focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-soft)]",
          className,
        )}
      >
        <S.Value placeholder={placeholder} />
        <S.Icon>
          <ChevronDown className="size-4 text-muted" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-elev-3 data-[state=open]:animate-pop-in"
        >
          <S.Viewport>
            {options.map((o) => (
              <S.Item
                key={o.value}
                value={o.value}
                className="relative flex h-9 cursor-pointer items-center rounded-lg pr-8 pl-2.5 text-[13px] text-fg outline-none select-none data-[highlighted]:bg-subtle"
              >
                <S.ItemText>{o.label}</S.ItemText>
                <S.ItemIndicator className="absolute right-2.5">
                  <Check className="size-4 text-primary-text" />
                </S.ItemIndicator>
              </S.Item>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  );
}
