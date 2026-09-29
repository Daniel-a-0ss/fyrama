"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onClick);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "m-auto max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border border-bone-200 bg-white p-0 shadow-fyrama-lg backdrop:bg-pine-950/40 backdrop:backdrop-blur-sm",
        size === "sm" && "max-w-sm",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl"
      )}
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between border-b border-bone-100 px-6 py-4">
        <h2 id="modal-title" className="font-display text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-bone-100"
          aria-label="Cerrar"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="flex justify-end gap-3 border-t border-bone-100 px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}