import { ImageOff, SearchX, WifiOff, ServerCrash } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "empty" | "error" | "offline";

const icons = {
  empty: SearchX,
  error: ServerCrash,
  offline: WifiOff,
};

export function EmptyState({
  kind = "empty",
  title,
  description,
  action,
  className,
  compact = false,
}: {
  kind?: Kind;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const Icon = icons[kind];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-bone-300 bg-bone-50",
        compact ? "p-8" : "p-14",
        className
      )}
      role="status"
    >
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-bone-100 text-ink-400">
        <Icon className="size-7" aria-hidden />
      </span>
      <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-ink-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ImageFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-bone-100 text-ink-400",
        className
      )}
      role="presentation"
    >
      <ImageOff className="size-8" aria-hidden />
    </div>
  );
}