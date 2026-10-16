import { cn } from "@/lib/utils";

export const inputClass =
  "h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-fg shadow-elev-1 placeholder:text-faint transition-[border-color,box-shadow] duration-150 outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-soft)] focus-visible:outline-none disabled:opacity-50 aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "h-auto min-h-24 py-2.5 leading-6", className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-fg", className)} {...props} />;
}

export function FieldHint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-muted", className)} {...props} />;
}
