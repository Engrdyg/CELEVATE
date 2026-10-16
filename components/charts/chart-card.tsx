"use client";

import { useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface LegendItem {
  label: string;
  color: string;
  dashed?: boolean;
}

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted", className)}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-3 rounded-full"
            style={i.dashed ? { backgroundImage: `linear-gradient(90deg, ${i.color} 60%, transparent 0)`, backgroundSize: "4px 2px" } : { background: i.color, height: 8, width: 8, borderRadius: 2 }}
          />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Chart container with title, optional legend & actions, and an accessible
 * table alternative toggle.
 */
export function ChartCard({
  title,
  description,
  actions,
  legend,
  table,
  children,
  className,
  footer,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  legend?: LegendItem[];
  table?: { columns: string[]; rows: (string | number)[][] };
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-0">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold tracking-tight">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {table && (
            <button
              type="button"
              onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))}
              className="grid size-8 place-items-center rounded-md border border-line text-muted transition-colors hover:bg-subtle hover:text-fg"
              aria-label={view === "chart" ? `Show ${title} as a table` : `Show ${title} as a chart`}
              aria-pressed={view === "table"}
            >
              {view === "chart" ? <Table2 className="size-4" /> : <BarChart3 className="size-4" />}
            </button>
          )}
        </div>
      </div>
      {legend && view === "chart" && <Legend items={legend} className="px-5 pt-3" />}
      <div className="min-h-0 flex-1 p-5 pt-4">
        {view === "chart" || !table ? (
          children
        ) : (
          <div className="max-h-72 overflow-auto rounded-lg border border-line">
            <table className="w-full text-left text-[13px]">
              <caption className="sr-only">{title}</caption>
              <thead className="sticky top-0 bg-subtle text-xs text-muted">
                <tr>
                  {table.columns.map((c) => (
                    <th key={c} scope="col" className="px-3 py-2 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    {r.map((c, j) => (
                      <td key={j} className={cn("px-3 py-2 tabular", j > 0 && "font-mono text-xs")}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {footer && <div className="border-t border-line px-5 py-3 text-xs text-muted">{footer}</div>}
    </Card>
  );
}

export function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string | null; color?: string; dataKey?: string | number }[];
  label?: string | number;
  format?: (v: number | string | null | undefined, key?: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-32 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-elev-3">
      <p className="mb-1 font-medium text-fg">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center justify-between gap-4 text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm" style={{ background: p.color }} aria-hidden />
            {p.name}
          </span>
          <span className="font-mono font-medium text-fg">{format ? format(p.value, String(p.dataKey)) : (p.value ?? "—")}</span>
        </p>
      ))}
    </div>
  );
}

export const axisProps = {
  stroke: "var(--fg-subtle)",
  tick: { fill: "var(--fg-subtle)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;
