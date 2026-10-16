"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/** Compact icon trigger + menu for headers. */
export function ThemeMenu() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <DropdownMenu modal={false}>
      <Tooltip content="Theme">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Theme: ${theme}. Change theme`}>
            <Sun className="hidden [.light_&]:block" aria-hidden />
            <Moon className="hidden [.dark_&]:block" aria-hidden />
            <span className="sr-only">Current theme {resolvedTheme}</span>
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as ThemePreference)}>
          {OPTIONS.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Full segmented control for settings pages. */
export function ThemeSegmented() {
  const { theme, setTheme } = useTheme();
  return (
    <Segmented
      label="Color theme"
      value={theme}
      onChange={setTheme}
      options={OPTIONS.map(({ value, label, Icon }) => ({ value, label, icon: <Icon aria-hidden /> }))}
    />
  );
}
