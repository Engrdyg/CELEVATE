"use client";

import { Switch as S } from "radix-ui";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        "peer relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-muted-bg transition-colors duration-200 data-[state=checked]:bg-primary-strong disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <S.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-elev-1 transition-transform duration-200 ease-out-expo data-[state=checked]:translate-x-[18px]" />
    </S.Root>
  );
}
