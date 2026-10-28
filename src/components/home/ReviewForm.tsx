"use client";

import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { FieldError, Input, Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { MAX_REVIEW_CONTENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FieldErrors = Record<string, string[] | undefined>;

const RATINGS = [5, 4, 3, 2, 1];

export function ReviewForm() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
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
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, content, rating, company }),
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
      setServerError(
        json.error?.code === "RATE_LIMITED"
          ? "Ya enviaste varias opiniones. Inténtalo de nuevo en unas horas."
          : (json.error?.message ?? "No pudimos registrar tu opinión. Inténtalo de nuevo.")
      );
      setStatus("error");
    } catch {
      setServerError("Parece que no tienes conexión. Revisa tu red y vuelve a intentarlo.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-pine-200 bg-pine-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-pine-600" aria-hidden />
        <h3 className="font-display text-xl font-semibold text-pine-900">
          ¡Gracias por tu opinión!
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-pine-800/80">
          Ya la estamos revisando. En cuanto la aprobemos aparecerá junto a las
          demás en esta sección.
        </p>
        <button
          type="button"
          onClick={() => {
            setName("");
            setTitle("");
            setContent("");
            setRating(5);
            setStatus("idle");
          }}
          className="mt-5 text-sm font-medium text-pine-800 underline underline-offset-4"
        >
          Escribir otra opinión
        </button>
      </div>
    );
  }

  const invalid = (k: string) => Boolean(errors[k]?.length);
  const shown = hover || rating;

  return (
    <form onSubmit={submit} noValidate>
      <fieldset className="mb-4">
        <legend className="mb-1.5 block text-sm font-medium text-ink-700">
          Tu puntuación
        </legend>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {RATINGS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
              aria-pressed={rating === value}
              className="rounded p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  value <= shown
                    ? "fill-gold-500 text-gold-500"
                    : "fill-transparent text-gold-500/40"
                )}
                aria-hidden
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-ink-500">{shown}.0</span>
        </div>
        <FieldError message={errors.rating?.[0]} />
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rf-name">Tu nombre</Label>
          <Input
            id="rf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            invalid={invalid("name")}
            placeholder="Laura G."
          />
          <FieldError message={errors.name?.[0]} />
        </div>

        <div>
          <Label htmlFor="rf-title">Servicio (opcional)</Label>
          <Input
            id="rf-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Compra de inmueble"
            invalid={invalid("title")}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="rf-content">Tu opinión</Label>
          <Textarea
            id="rf-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            maxLength={MAX_REVIEW_CONTENT}
            placeholder="¿Cómo fue tu experiencia con Fyrama?"
            invalid={invalid("content")}
          />
          <FieldError message={errors.content?.[0]} />
          <p className="mt-1 text-right text-xs text-ink-400">
            {content.length}/{MAX_REVIEW_CONTENT}
          </p>
        </div>
      </div>

      {/* Honeypot anti-spam (oculto a humanos) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="rf-company">No llenar este campo</label>
        <input
          id="rf-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {serverError && (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {serverError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" loading={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Enviar opinión"}
        </Button>
        <p className="text-xs text-ink-500">
          Se publica después de ser revisada por nuestro equipo.
        </p>
      </div>
    </form>
  );
}
