"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputClass } from "./input";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className={cn(inputClass, "pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden")}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded text-faint hover:bg-subtle hover:text-fg"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
