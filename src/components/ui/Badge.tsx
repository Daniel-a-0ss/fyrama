import { cn } from "@/lib/utils";
import { CircleCheck, CircleDot, FileQuestion } from "lucide-react";

type Tone = "brand" | "gold" | "neutral" | "success" | "info" | "danger";

const tones: Record<Tone, string> = {
  brand: "bg-pine-900 text-bone-50",
  gold: "bg-gold-200 text-gold-700 border border-gold-300",
  neutral: "bg-bone-100 text-ink-700 border border-bone-200",
  success: "bg-pine-100 text-pine-800 border border-pine-200",
  info: "bg-sky-100 text-sky-800 border border-sky-200",
  danger: "bg-red-100 text-red-700 border border-red-200",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function OperationBadge({ operation }: { operation: "VENTA" | "ARRIENDO" }) {
  return (
    <Badge tone={operation === "VENTA" ? "brand" : "gold"}>
      {operation === "VENTA" ? "Venta" : "Arrendamiento"}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: Tone }> = {
    DRAFT: { label: "Borrador", tone: "neutral" },
    PUBLISHED: { label: "Publicado", tone: "success" },
    HIDDEN: { label: "Oculto", tone: "info" },
    NEW: { label: "Nueva", tone: "info" },
    CONTACTED: { label: "En contacto", tone: "gold" },
    CLOSED: { label: "Cerrada", tone: "neutral" },
    ADMIN: { label: "Admin", tone: "brand" },
    EDITOR: { label: "Editor", tone: "gold" },
  };
  const item = map[status] ?? { label: status, tone: "neutral" as Tone };
  return (
    <Badge tone={item.tone}>
      {status === "PUBLISHED" && <CircleCheck className="size-3" aria-hidden />}
      {status === "NEW" && <CircleDot className="size-3" aria-hidden />}
      {item.label}
    </Badge>
  );
}

export function IconBadge({ icon: _icon }: { icon: string }) {
  return (
    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-pine-100 text-pine-800">
      <FileQuestion className="size-5" aria-hidden />
    </span>
  );
}