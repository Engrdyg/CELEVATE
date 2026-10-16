import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  tone = "primary",
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  trend?: { value: string; direction: "up" | "down" | "flat"; good?: boolean } | null;
  tone?: "primary" | "iris" | "warning" | "success";
  children?: React.ReactNode;
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary-text",
    iris: "bg-iris-soft text-iris-text",
    warning: "bg-warning-soft text-warning",
    success: "bg-success-soft text-success",
  }[tone];
  return (
    <Card className="group p-4 transition-colors hover:border-line-strong sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className={cn("grid size-7 place-items-center rounded-lg", toneClass)}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <div className="mt-3 font-display text-[26px] leading-none font-semibold tracking-tight tabular sm:text-[28px]">{value}</div>
      <div className="mt-2 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend.direction === "flat" ? "text-muted" : trend.good === false ? "text-danger" : "text-success",
            )}
          >
            {trend.direction === "up" ? <TrendingUp className="size-3.5" aria-hidden /> : trend.direction === "down" ? <TrendingDown className="size-3.5" aria-hidden /> : null}
            {trend.value}
          </span>
        )}
        {sub}
      </div>
      {children}
    </Card>
  );
}
