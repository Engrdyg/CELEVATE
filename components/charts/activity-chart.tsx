"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Segmented } from "@/components/ui/segmented";
import type { DayPoint } from "@/lib/analytics";
import { ChartCard, ChartTooltip, axisProps } from "./chart-card";

/** Daily study activity; one measure at a time (no dual axes). */
export function ActivityChart({ data, title = "Weekly activity", description, className, height = 220 }: { data: DayPoint[]; title?: string; description?: string; className?: string; height?: number }) {
  const [metric, setMetric] = useState<"minutes" | "questions">("minutes");
  const label = metric === "minutes" ? "Minutes studied" : "Questions answered";
  const total = data.reduce((a, d) => a + d[metric], 0);
  return (
    <ChartCard
      title={title}
      description={description ?? `${total} ${metric === "minutes" ? "minutes" : "questions"} in this period`}
      className={className}
      actions={
        <Segmented
          size="sm"
          label="Activity metric"
          value={metric}
          onChange={setMetric}
          options={[
            { value: "minutes", label: "Minutes" },
            { value: "questions", label: "Questions" },
          ]}
        />
      }
      table={{ columns: ["Day", "Minutes", "Questions", "Accuracy"], rows: data.map((d) => [d.label, d.minutes, d.questions, d.accuracy == null ? "—" : `${d.accuracy}%`]) }}
    >
      <div style={{ height }} role="img" aria-label={`${label} per day`} className="relative">
        {total === 0 && (
          <p className="absolute inset-0 z-10 grid place-items-center text-[13px] text-muted">No activity logged in this period yet.</p>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -18 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={8} />
            <YAxis {...axisProps} allowDecimals={false} width={44} />
            <Tooltip cursor={{ fill: "var(--subtle)", opacity: 0.6 }} content={<ChartTooltip format={(v) => `${v ?? 0}${metric === "minutes" ? " min" : ""}`} />} />
            <Bar dataKey={metric} name={label} fill={metric === "minutes" ? "var(--chart-1)" : "var(--chart-2)"} radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
