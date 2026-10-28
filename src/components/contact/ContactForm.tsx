"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { CONTACT_PREFERENCES, LEGAL_TOPICS } from "@/lib/constants";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
  type: "PROPERTY" | "LEGAL" | "GENERAL";
  propertyId?: string;
  legalTopic?: string;
  contactPreference?: string;
  submitLabel?: string;
  title?: string;
  description?: string;
  buttonTone?: "primary" | "gold";
  className?: string;
};

type FieldErrors = Record<string, string[] | undefined>;

export function ContactForm({
  type,
  propertyId,
  legalTopic: initialTopic,
  contactPreference: initialPreference,
  submitLabel = "Enviar solicitud",
  title,
  description,
  buttonTone = "primary",
  className,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(initialTopic ?? "");
  const [preference, setPreference] = useState(initialPreference ?? "");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          email,
          phone,
          message,
          propertyId,
          legalTopic: type === "LEGAL" ? topic : undefined,
          contactPreference: type === "LEGAL" ? preference : undefined,
          company,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: { code: string; message: string; fields?: FieldErrors };
      };
      if (res.ok && json.ok) {
        setStatus("success");
        return;
      }
      if (json.error?.fields) setErrors(json.error.fields);
      const code = json.error?.code;
      setServerError(
        code === "RATE_LIMITED"
          ? "Has enviado varias solicitudes seguidas. Inténtalo nuevamente en unos minutos."
          : code === "CSAUTH"
            ? "No pudimos verificar la solicitud. Recarga la página e inténtalo de nuevo."
            : json.error?.message ?? "No pudimos enviar tu solicitud. Inténtalo de nuevo."
      );
      setStatus("error");
    } catch {
      setServerError(
        "Parece que no tienes conexión. Revisa tu red y vuelve a intentarlo."
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={cn("rounded-2xl border border-pine-200 bg-pine-50 p-8 text-center", className)}>
        <CheckCircle2 className="mx-auto mb-3 size-10 text-pine-600" aria-hidden />
        <h3 className="font-display text-xl font-semibold text-pine-900">
          ¡Solicitud enviada!
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-pine-800/80">
          {title ??
            "Recibimos tu información. Te contactaremos pronto para continuar."}
        </p>
      </div>
    );
  }

  const inputInvalid = (k: string) => Boolean(errors[k]?.length);

  return (
    <form onSubmit={submit} noValidate className={className}>
      {description && (
        <p className="mb-5 text-sm text-ink-500">{description}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-name">Nombre completo</Label>
          <Input
            id="cf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            invalid={inputInvalid("name")}
          />
          <FieldError message={errors.name?.[0]} />
        </div>

        <div>
          <Label htmlFor="cf-email">Correo electrónico</Label>
          <Input
            id="cf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            invalid={inputInvalid("email")}
          />
          <FieldError message={errors.email?.[0]} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="cf-phone">Teléfono</Label>
          <Input
            id="cf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="Opcional"
            invalid={inputInvalid("phone")}
          />
        </div>

        {type === "LEGAL" && (
          <>
            <div>
              <Label htmlFor="cf-topic">Tipo de consulta</Label>
              <Select
                id="cf-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                invalid={inputInvalid("legalTopic")}
              >
                <option value="">Selecciona una opción</option>
                {LEGAL_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.legalTopic?.[0]} />
            </div>
            <fieldset>
              <legend className="mb-1.5 block text-sm font-medium text-ink-700">
                Preferencia de contacto
              </legend>
              <div className="flex flex-wrap gap-2 pt-1">
                {CONTACT_PREFERENCES.map((p) => (
                  <label
                    key={p}
                    className={cn(
                      "inline-flex cursor-pointer items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      preference === p
                        ? "border-pine-800 bg-pine-950 text-bone-50"
                        : "border-ink-900/15 text-ink-600 hover:border-ink-900/35"
                    )}
                  >
                    <input
                      type="radio"
                      name="preference"
                      value={p}
                      checked={preference === p}
                      onChange={() => setPreference(p)}
                      className="sr-only"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <div className="sm:col-span-2">
          <Label htmlFor="cf-message">
            {type === "LEGAL" ? "Cuéntanos tu consulta" : "Mensaje"}
          </Label>
          <Textarea
            id="cf-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder={
              type === "LEGAL"
                ? "Describe brevemente el asunto jurídico que necesitas asesorar…"
                : "¿Qué te interesa saber sobre este inmueble?"
            }
            invalid={inputInvalid("message")}
          />
          <FieldError message={errors.message?.[0]} />
        </div>
      </div>

      {/* Honeypot anti-spam (oculto a humanos) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="cf-company">No llenar este campo</label>
        <input
          id="cf-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="mt-5">
        <label className="flex items-start gap-2.5 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-4 rounded border-ink-900/20 text-pine-800 focus:ring-pine-600"
            required
          />
          <span>
            Autorizo el tratamiento de mis datos personales conforme a la{" "}
            <Link
              href="/tratamiento-de-datos-personales"
              className="text-pine-800 underline underline-offset-2"
            >
              política de tratamiento de datos de Fyrama
            </Link>
            .
          </span>
        </label>
        {!consent && errors.consent && <FieldError message={errors.consent[0]} />}
      </div>

      {serverError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant={buttonTone}
        size="lg"
        className="mt-5 w-full"
        loading={status === "sending"}
        disabled={!consent}
      >
        {status === "sending" ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Enviando…
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Send className="size-4" aria-hidden />
            {submitLabel}
          </span>
        )}
      </Button>
    </form>
  );
}