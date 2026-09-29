"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, CircleAlert, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<{
  push: (kind: ToastKind, message: string) => void;
}>({ push: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

const colors = {
  success: "text-pine-600",
  error: "text-red-600",
  info: "text-sky-600",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[90] flex w-[min(92vw,22rem)] flex-col gap-2"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => {
          const Icon = icons[t.kind];
          return (
            <div
              key={t.id}
              className="animate-fade-up flex items-start gap-3 rounded-xl border border-bone-200 bg-white px-4 py-3 shadow-fyrama-lg"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${colors[t.kind]}`} aria-hidden />
              <p className="text-sm text-ink-700">{t.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}