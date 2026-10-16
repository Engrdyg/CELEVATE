import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out-quart",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary-strong text-primary-fg shadow-elev-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:brightness-110 dark:hover:brightness-105 dark:hover:shadow-[0_0_0_4px_var(--glow-primary)]",
        secondary: "bg-subtle text-fg hover:bg-muted-bg",
        outline: "border border-line-strong bg-surface/60 text-fg shadow-elev-1 hover:bg-subtle",
        ghost: "text-muted hover:bg-subtle hover:text-fg",
        iris: "bg-iris-strong text-white shadow-elev-1 hover:brightness-110",
        danger: "bg-danger text-white shadow-elev-1 hover:brightness-110",
        link: "h-auto px-0 text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 rounded-md px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-8 rounded-md px-3 text-[13px] [&_svg]:size-4",
        md: "h-10 rounded-lg px-4 text-sm [&_svg]:size-4",
        lg: "h-12 rounded-lg px-6 text-[15px] [&_svg]:size-[18px]",
        icon: "size-10 rounded-lg [&_svg]:size-[18px]",
        "icon-sm": "size-8 rounded-md [&_svg]:size-4",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({ className, variant, size, asChild, loading, children, disabled, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  );
}
