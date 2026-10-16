import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-line bg-subtle text-muted",
        primary: "border-transparent bg-primary-soft text-primary-text",
        iris: "border-transparent bg-iris-soft text-iris-text",
        success: "border-transparent bg-success-soft text-success",
        warning: "border-transparent bg-warning-soft text-warning",
        danger: "border-transparent bg-danger-soft text-danger",
        info: "border-transparent bg-info-soft text-info",
        outline: "border-line-strong bg-transparent text-muted",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
