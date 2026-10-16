import { cn } from "@/lib/utils";

export function Card({ className, interactive, ...props }: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "surface-card relative rounded-xl",
        interactive &&
          "transition-[border-color,box-shadow,transform] duration-200 ease-out-quart hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elev-2",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-3 p-5 pb-0", className)} {...props} />;
}

export function CardTitle({ className, as: Tag = "h3", ...props }: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }) {
  return <Tag className={cn("font-display text-[15px] font-semibold tracking-tight text-fg", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-[13px] leading-5 text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2 border-t border-line px-5 py-3", className)} {...props} />;
}
