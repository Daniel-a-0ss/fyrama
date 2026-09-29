import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-8", className)}
      aria-hidden
      focusable="false"
    >
      <rect width="100" height="100" rx="24" fill="currentColor" />
      <path
        d="M26 70 L50 34 L74 70 Z"
        fill="none"
        stroke="var(--color-gold-500)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="50"
        y1="34"
        x2="50"
        y2="72"
        stroke="var(--color-bone-50)"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark
        className={cn(
          "size-8",
          tone === "dark" ? "text-pine-950" : "text-bone-50"
        )}
      />
      <span
        className={cn(
          "font-display text-[1.35rem] font-semibold leading-none tracking-tight",
          tone === "dark" ? "text-pine-950" : "text-bone-50"
        )}
      >
        fyrama
        <span className="text-gold-500">.</span>
      </span>
    </span>
  );
}