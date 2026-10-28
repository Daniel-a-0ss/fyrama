import { after } from "next/server";
import { getSiteSettings, mergeSettings } from "@/lib/services/settings";

type AdminNotification = {
  subject: string;
  lines: string[];
  replyTo?: string | null;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function sendResend(
  apiKey: string,
  to: string,
  subject: string,
  text: string,
  replyTo?: string | null
) {
  const from =
    process.env.NOTIFY_FROM?.trim() || "Fyrama <no-reply@fyrama.com>";
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[fyrama-notify] Resend respondió", res.status, detail);
  }
}

async function sendWebhook(url: string, subject: string, text: string) {
  const body = `*${subject}*\n${text}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: body, content: body, subject }),
  });
  if (!res.ok) {
    console.error("[fyrama-notify] webhook respondió", res.status);
  }
}

/**
 * Aviso al equipo cuando entra una solicitud o una opinión.
 *
 * Proveedores (opcionales, configurables por entorno):
 * - RESEND_API_KEY + NOTIFY_EMAIL (+ NOTIFY_FROM) → correo.
 * - NOTIFY_WEBHOOK_URL → Slack/Discord/Zapier/Google Chat.
 *
 * Nunca lanza: un fallo de notificación no debe tumbar el formulario.
 */
export function scheduleAdminNotification(payload: AdminNotification) {
  try {
    after(() => notifyAdmin(payload));
  } catch {
    // Fuera de una request de Next (por ejemplo en tests): se omite el aviso.
  }
}

export async function notifyAdmin({
  subject,
  lines,
  replyTo,
}: AdminNotification): Promise<void> {
  try {
    const settings = mergeSettings(await getSiteSettings());
    const to = process.env.NOTIFY_EMAIL?.trim() || settings.contact_email;
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const webhook = process.env.NOTIFY_WEBHOOK_URL?.trim();
    const text = lines.filter(Boolean).join("\n");

    const tasks: Promise<void>[] = [];
    if (webhook) tasks.push(sendWebhook(webhook, subject, text));
    if (resendKey && to) {
      tasks.push(sendResend(resendKey, to, subject, text, replyTo));
    }

    if (tasks.length === 0) {
      console.info(`[fyrama-notify] ${subject}\n${text}`);
      return;
    }

    const results = await Promise.allSettled(tasks);
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("[fyrama-notify] error:", result.reason);
      }
    }
  } catch (err) {
    console.error("[fyrama-notify] no se pudo notificar:", err);
  }
}
