import { cn } from "@/lib/utils";
import { CircleAlert } from "lucide-react";

export function Label({
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="block text-sm font-medium text-ink-700 mb-1.5"
      {...props}
    >
      {children}
    </label>
  );
}

const fieldClasses =
  "w-full rounded-xl border border-ink-900/12 bg-white px-3.5 py-2.5 text-base text-ink-900 shadow-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-pine-600/25 focus:border-pine-700 transition disabled:bg-bone-100 disabled:text-ink-400";

export function Input({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(fieldClasses, invalid && "border-red-500 focus:ring-red-400/25", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(fieldClasses, "appearance-none pr-9 cursor-pointer", invalid && "border-red-500", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(fieldClasses, "min-h-28 resize-y", invalid && "border-red-500", className)}
      {...props}
    />
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-sm text-red-600 flex items-start gap-1" role="alert">
      <CircleAlert className="size-4 mt-0.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}