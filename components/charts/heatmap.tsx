"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface HeatCell {
  key: string;
  label: string;
  value: number | null; // 0–100, null = no data
  detail?: string;
}

/** Sequential single-hue heatmap; empty cells are hatched (no data ≠ zero). */
export function Heatmap({ rows, className }: { rows: { label: string; cells: HeatCell[] }[]; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[3.5rem_1fr] items-center gap-3">
          <span className="font-mono text-[11px] text-muted">{r.label}</span>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.max(r.cells.length, 1)}, minmax(0, 1fr))` }}>
            {r.cells.map((c) => (
              <Tooltip
                key={c.key}
                content={
                  <span>
                    {c.label}: {c.value == null ? "no attempts yet" : `${c.value}%`}
                    {c.detail ? ` · ${c.detail}` : ""}
                  </span>
                }
              >
                <button
                  type="button"
                  aria-label={`${c.label}: ${c.value == null ? "no attempts yet" : `${c.value}% accuracy`}`}
                  className="h-8 rounded-md border border-line transition-transform hover:scale-[1.06] focus-visible:scale-[1.06]"
                  style={
                    c.value == null
                      ? { backgroundImage: "repeating-linear-gradient(135deg, var(--subtle) 0 4px, transparent 4px 8px)" }
                      : { background: `color-mix(in srgb, var(--primary) ${Math.round(12 + (c.value / 100) * 80)}%, var(--subtle))` }
                  }
                />
              </Tooltip>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-end gap-2 pt-1 text-[11px] text-faint">
        <span>0%</span>
        <span className="h-2 w-24 rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 12%, var(--subtle)), var(--primary))" }} aria-hidden />
        <span>100%</span>
        <span className="ml-2 inline-block h-2 w-3 rounded-sm" style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--line-strong) 0 2px, transparent 2px 4px)" }} aria-hidden />
        <span>No data</span>
      </div>
    </div>
  );
}
