"use client";

import { useEffect, useRef, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  ClipboardCheck,
  Flame,
  LayoutDashboard,
  Library,
  ListChecks,
  Search,
  Sigma,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/* Illustrative values only — the preview is labelled "Sample data" wherever it appears. */

export function sparkPath(values: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [pad + (i / (values.length - 1)) * (w - pad * 2), pad + (1 - (v - min) / span) * (h - pad * 2)]);
  // Smooth with Catmull-Rom → cubic Bézier
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function Spark({ values, color, w = 96, h = 30 }: { values: number[]; color: string; w?: number; h?: number }) {
  const d = sparkPath(values, w, h);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={`${d} L${w - 2} ${h} L2 ${h} Z`} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV = [
  [LayoutDashboard, "Overview"],
  [ListChecks, "My Review"],
  [BookOpen, "Subjects"],
  [Target, "Practice"],
  [ClipboardCheck, "Mock Exams"],
  [Bot, "AI Tutor"],
  [Sigma, "Formulas"],
  [BarChart3, "Progress"],
  [Award, "Achievements"],
] as const;

const KPIS = [
  { label: "Review progress", value: "62%", delta: "+8%", color: "var(--primary)", data: [20, 24, 28, 31, 38, 44, 49, 55, 62] },
  { label: "Questions answered", value: "1,284", delta: "+146", color: "var(--iris)", data: [40, 52, 48, 70, 66, 84, 90, 104, 118] },
  { label: "Average accuracy", value: "78%", delta: "+4%", color: "var(--primary)", data: [61, 64, 63, 68, 70, 72, 71, 75, 78] },
  { label: "Study streak", value: "12 days", delta: "Best 15", color: "var(--chart-3)", data: [2, 3, 5, 4, 6, 8, 9, 11, 12] },
];

const WEEK = [42, 68, 55, 90, 74, 110, 96];
const WEEK2 = [30, 45, 50, 62, 58, 80, 85];

/** The full product mock, designed on a fixed 1120×700 canvas and scaled to fit. */
export function ProductPreview({ className }: { className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 1120));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className={cn("relative w-full", className)} style={{ aspectRatio: "1120 / 700" }}>
      <div
        className="absolute top-0 left-0 origin-top-left transition-opacity duration-500"
        style={{ width: 1120, height: 700, transform: `scale(${scale ?? 0.0001})`, opacity: scale ? 1 : 0 }}
        aria-hidden
        inert
      >
        <MiniApp />
      </div>
    </div>
  );
}

function MiniApp() {
  const chartW = 420;
  const chartH = 150;
  const linePath = sparkPath(WEEK, chartW, chartH, 6);
  const linePath2 = sparkPath(WEEK2, chartW, chartH, 6);
  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-line-strong bg-canvas text-fg shadow-elev-4">
      {/* Sidebar */}
      <div className="flex w-[196px] shrink-0 flex-col border-r border-line bg-surface/70 px-3 py-4">
        <div className="flex items-center gap-2 px-2">
          <LogoMark className="size-6" />
          <span className="font-display text-[12px] font-bold tracking-[0.14em]">CELEVATE</span>
        </div>
        <div className="mt-6 space-y-0.5">
          {NAV.map(([Icon, label], i) => (
            <div
              key={label}
              className={cn(
                "relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[12px] font-medium",
                i === 0 ? "bg-primary-soft text-primary-text" : "text-muted",
              )}
            >
              {i === 0 && <span className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-primary" />}
              <Icon className="size-[15px]" />
              {label}
            </div>
          ))}
        </div>
        <div className="mt-auto rounded-xl border border-line bg-card p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <Flame className="size-3.5 text-warning" /> Study streak
          </div>
          <div className="mt-1 font-display text-[18px] font-semibold">12 days</div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < 6 ? "bg-primary" : "bg-subtle")} />
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center justify-between border-b border-line px-5">
          <div className="text-[12px] text-muted">
            Overview <span className="mx-1 text-faint">/</span> <span className="text-fg">Dashboard</span>
          </div>
          <div className="flex h-7 w-56 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[11px] text-faint">
            <Search className="size-3.5" /> Search lessons, formulas…
            <span className="ml-auto rounded border border-line px-1 font-mono text-[9px]">⌘K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-gradient-to-br from-primary to-iris" />
          </div>
        </div>

        <div className="flex-1 space-y-3.5 p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-[20px] font-semibold tracking-tight">Good morning, Future Engineer.</div>
              <div className="mt-0.5 text-[12px] text-muted">Hydraulics &amp; Geotechnical · Chapter 2 · Bernoulli&apos;s energy equation</div>
            </div>
            <div className="flex h-8 items-center gap-1.5 rounded-lg bg-primary-strong px-3 text-[12px] font-medium text-primary-fg">
              <TrendingUp className="size-3.5" /> Resume learning
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {KPIS.map((k) => (
              <div key={k.label} className="surface-card rounded-xl p-3.5">
                <div className="text-[11px] font-medium text-muted">{k.label}</div>
                <div className="mt-1.5 flex items-end justify-between">
                  <div>
                    <div className="font-display text-[22px] leading-none font-semibold tracking-tight">{k.value}</div>
                    <div className="mt-1.5 text-[10px] font-medium text-success">{k.delta}</div>
                  </div>
                  <Spark values={k.data} color={k.color} w={84} h={32} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1.55fr_1fr] gap-3">
            <div className="surface-card relative rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-[13px] font-semibold">Weekly activity</div>
                  <div className="text-[10px] text-muted">Minutes studied · questions answered</div>
                </div>
                <div className="flex gap-3 text-[10px] text-muted">
                  <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-primary" />Minutes</span>
                  <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-iris" />Questions</span>
                </div>
              </div>
              <svg width={chartW + 40} height={chartH + 26} className="mt-2" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <line key={i} x1="28" x2={chartW + 36} y1={6 + i * (chartH / 3.2)} y2={6 + i * (chartH / 3.2)} stroke="var(--chart-grid)" />
                ))}
                <g transform="translate(30 0)">
                  <path d={`${linePath} L${chartW - 6} ${chartH} L6 ${chartH} Z`} fill="var(--primary)" opacity="0.1" />
                  <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2" />
                  <path d={linePath2} fill="none" stroke="var(--iris)" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx={6 + (5 / 6) * (chartW - 12)} cy={10} r="4" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
                </g>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                  <text key={d} x={36 + (i / 6) * (chartW - 12)} y={chartH + 20} textAnchor="middle" className="fill-[var(--fg-subtle)] text-[9px]">
                    {d}
                  </text>
                ))}
              </svg>
              <div className="absolute top-[54px] left-[66%] rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[10px] shadow-elev-2">
                <div className="text-muted">Saturday</div>
                <div className="font-mono font-medium">110 min · 42 items</div>
              </div>
            </div>

            <div className="surface-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-display text-[13px] font-semibold">CELE readiness</div>
                <span className="rounded bg-iris-soft px-1.5 py-0.5 text-[9px] font-medium text-iris-text">Learning estimate</span>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90" aria-hidden>
                  <circle cx="46" cy="46" r="38" fill="none" stroke="var(--subtle)" strokeWidth="8" />
                  <circle cx="46" cy="46" r="38" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * 0.29} />
                </svg>
                <div>
                  <div className="font-display text-[26px] leading-none font-semibold">71</div>
                  <div className="mt-1 text-[10px] text-muted">of 100 · trending up</div>
                </div>
              </div>
              <div className="mt-3 space-y-2.5">
                {[
                  ["MSTE", 74, "var(--primary)"],
                  ["HGE", 63, "var(--iris)"],
                  ["PSAD", 69, "var(--chart-3)"],
                ].map(([l, v, c]) => (
                  <div key={l as string}>
                    <div className="flex justify-between text-[10px]">
                      <span className="font-medium text-muted">{l}</span>
                      <span className="font-mono">{v}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-subtle">
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: c as string }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: BookOpen, t: "Continue: Horizontal simple curves", s: "MSTE · 14 min left", c: "text-primary-text bg-primary-soft" },
              { icon: Timer, t: "Mock board · Diagnostic set B", s: "Scheduled · Saturday 8:00 AM", c: "text-iris-text bg-iris-soft" },
              { icon: Library, t: "Weak area: Effective stress", s: "Recommended practice · 8 items", c: "text-warning bg-warning-soft" },
            ].map(({ icon: Icon, t, s, c }) => (
              <div key={t} className="surface-card flex items-center gap-3 rounded-xl p-3">
                <div className={cn("grid size-8 place-items-center rounded-lg", c)}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-medium">{t}</div>
                  <div className="truncate text-[10px] text-muted">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
