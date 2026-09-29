"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCheck, SendHorizontal, X } from "lucide-react";
import { SITE_NAME, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import "./whatsapp-widget.css";

const ASSISTANT_IMG = "/media/brand/assistant.png";

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [time, setTime] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTime(
      new Date().toLocaleTimeString("es-CO", {
        hour: "numeric",
        minute: "2-digit",
      })
    );
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else buttonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    setMessage("");
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {open && (
        <div
          role="dialog"
          aria-labelledby="fyrama-wa-title"
          className="fyrama-wa-panel-in pointer-events-auto absolute bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-2.5 flex h-[400px] max-h-[calc(100dvh-6.5rem)] w-[calc(100vw-1.25rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:left-auto sm:right-[calc(1.25rem+env(safe-area-inset-right))] sm:w-[340px]"
        >
          <header className="flex h-[60px] shrink-0 items-center gap-3 bg-pine-950 px-4">
            <span className="fyrama-wa-avatar-ring grid size-10 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-white/30">
              <img
                src={ASSISTANT_IMG}
                alt=""
                className="size-full rounded-full object-cover object-center"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p
                id="fyrama-wa-title"
                className="truncate text-[15px] font-semibold leading-tight text-white"
              >
                {SITE_NAME}
              </p>
              <p className="truncate text-xs leading-tight text-white/75">
                Asesoría inmobiliaria y jurídica
              </p>
            </div>
            <button
              type="button"
              aria-label="Cerrar chat"
              onClick={() => setOpen(false)}
              className="grid size-9 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:bg-white/15"
            >
              <X className="size-5" aria-hidden />
            </button>
          </header>

          <div className="fyrama-wa-texture min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
            <p className="mx-auto mb-4 w-max rounded-full bg-black/10 px-3 py-1 text-[11px] font-semibold text-[#54656f]">
              Hoy
            </p>
            <div className="max-w-[85%] rounded-[10px] rounded-tl-sm bg-white p-2.5 shadow-sm">
              <p className="text-[13.5px] leading-snug text-[#111b21]">
                {WHATSAPP_DEFAULT_MESSAGE}
              </p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#8696a0]">
                <span>{time}</span>
                <CheckCheck className="size-3.5 text-[#53bdeb]" aria-hidden />
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSend}
            className="flex shrink-0 items-center gap-2 border-t border-[#e9edef] bg-white px-3 py-2.5 sm:px-4"
          >
            <label htmlFor="fyrama-wa-message" className="visually-hidden">
              Escribe tu mensaje para abrirlo en WhatsApp
            </label>
            <input
              id="fyrama-wa-message"
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enviar mensaje"
              autoComplete="off"
              className="h-10 min-w-0 flex-1 rounded-[20px] border-0 bg-[#f0f2f5] px-4 text-sm text-[#111b21] outline-none placeholder:text-[#8696a0]"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-500 text-pine-950 shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <SendHorizontal className="size-5" aria-hidden />
            </button>
          </form>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-label="Abrir chat con la asesora de Fyrama"
        aria-expanded={open}
        aria-controls="fyrama-wa-chat"
        onClick={() => setOpen((v) => !v)}
        className="fyrama-wa-pop pointer-events-auto absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] grid size-16 place-items-center sm:size-[72px]"
      >
        <span
          aria-hidden
          className="fyrama-wa-halo pointer-events-none absolute -inset-1.5 rounded-full bg-gold-400/40 blur-lg"
        />
        <img
          src={ASSISTANT_IMG}
          alt="Asesora de Fyrama"
          className="fyrama-wa-avatar relative size-full rounded-full object-cover object-center shadow-[0_8px_24px_rgba(10,46,36,0.35)]"
        />
      </button>
    </div>
  );
}