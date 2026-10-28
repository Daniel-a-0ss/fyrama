import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "gold" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-pine-900 text-bone-50 hover:bg-pine-800 active:bg-pine-950 shadow-sm focus-visible:outline-offset-2",
  gold: "bg-gold-500 text-pine-950 hover:bg-gold-400 active:bg-gold-600 shadow-sm",
  outline:
    "border border-ink-900/15 bg-transparent text-ink-900 hover:border-ink-900/40 hover:bg-bone-50",
  ghost: "text-ink-700 hover:bg-ink-900/5 hover:text-ink-900",
  danger: "bg-red-700 text-white hover:bg-red-800 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-13 px-7 text-base rounded-xl gap-2",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(
    "inline-flex items-center justify-center font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150",
    "active:scale-[0.98] touch-manipulation select-none",
    "disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer",
    variants[variant],
    sizes[size]
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(buttonClasses(variant, size), className)}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
}) {
  const classes = cn(buttonClasses(variant, size), className);

  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as Omit<React.ComponentProps<typeof Link>, "href">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}
