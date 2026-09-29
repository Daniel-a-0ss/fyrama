"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api, errorMessage } from "@/lib/client/api";

export function DeleteButton({
  url,
  confirmText,
  label,
  onDeleted,
}: {
  url: string;
  confirmText: string;
  label: string;
  onDeleted?: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handle() {
    if (!confirm(confirmText)) return;
    setBusy(true);
    try {
      await api(url, { method: "DELETE" });
      onDeleted?.();
    } catch (err) {
      alert(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className="inline-flex size-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
      aria-label={label}
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}