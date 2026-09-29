import { randomUUID } from "crypto";
import { rm } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { clamp } from "./utils";

/**
 * Procesamiento de imágenes de Fyrama.
 *
 * - Valida MIME por MAGIC BYTES (nunca por extensión o content-type declarado).
 * - Rechaza archivos ejecutables/HTML/SVG y "bombas de descompresión".
 * - Genera variantes WebP (320/480/800/1200/1600) + AVIF best-effort.
 * - Almacena con nombre aleatorio (uuid) — nunca nombres de usuario.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_DIMENSION = 6000;
export const MAX_PIXELS = 50_000_000; // 50 MP

export type VerifiedImage = {
  buffer: Buffer;
  mime: string;
  ext: string;
  width: number;
  height: number;
  size: number;
};

const MAGIC: Array<[string, (b: Buffer) => boolean]> = [
  [
    "image/jpeg",
    (b) =>
      b.length > 3 &&
      b[0] === 0xff &&
      b[1] === 0xd8 &&
      b[2] === 0xff &&
      b[3] !== 0x47, // no GIF
  ],
  [
    "image/png",
    (b) =>
      b.length > 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  ],
  [
    "image/webp",
    (b) =>
      b.length > 12 &&
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP",
  ],
  [
    "image/gif",
    (b) => b.length > 6 && (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a"),
  ],
];

export function detectMime(buffer: Buffer): string | null {
  for (const [mime, test] of MAGIC) {
    if (test(buffer)) return mime;
  }
  return null;
}

export async function verifyImageFile(file: File): Promise<VerifiedImage> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageError("IMAGE_TOO_LARGE", "La imagen supera los 10 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectMime(buffer);
  if (!mime) {
    throw new ImageError(
      "INVALID_IMAGE",
      "Formato no permitido. Usa JPG, PNG, WebP o GIF."
    );
  }
  let width = 0;
  let height = 0;
  try {
    const meta = await sharp(buffer, { failOn: "error" }).metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;
  } catch {
    throw new ImageError("INVALID_IMAGE", "El archivo no es una imagen válida.");
  }
  if (width <= 0 || height <= 0) {
    throw new ImageError("INVALID_IMAGE", "No se pudo leer la imagen.");
  }
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new ImageError("IMAGE_TOO_BIG", "La imagen supera 6000px de lado.");
  }
  if (width * height > MAX_PIXELS) {
    throw new ImageError(
      "IMAGE_DECOMPRESSION",
      "La imagen es demasiado grande (bombas de descompresión no permitidas)."
    );
  }
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : mime === "image/gif" ? "gif" : "webp";
  return { buffer, mime, ext, width, height, size: file.size };
}

export class ImageError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

type VariantMap = Record<string, string>;

export type ProcessedImage = {
  url: string; // principal (1600)
  thumbUrl: string;
  cardUrl: string;
  variants: VariantMap;
  width: number;
  height: number;
};

const MEDIA_ROOT = path.join(process.cwd(), "public", "media");

function webPathOf(fsPath: string): string {
  return "/" + path.relative(process.cwd(), fsPath).replace(/\\/g, "/");
}

async function ensureDir(p: string) {
  const { mkdir } = await import("fs/promises");
  await mkdir(p, { recursive: true });
}

const VARIANT_WIDTHS = [320, 480, 800, 1200, 1600] as const;

export async function processAndSaveImage(
  buffer: Buffer,
  meta: { width: number; height: number }
): Promise<ProcessedImage> {
  const now = new Date();
  const dir = path.join(
    MEDIA_ROOT,
    "images",
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0")
  );
  await ensureDir(dir);
  const uuid = randomUUID();

  const originalW = meta.width;
  const base = sharp(buffer, { failOn: "error", animated: false }).rotate();
  const basePipeline = originalW > VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1]
    ? base.resize({ width: VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1], withoutEnlargement: true })
    : base;

  const variants: VariantMap = {};
  const out: string[] = [];

  for (const w of VARIANT_WIDTHS) {
    if (originalW < 400 && w > 1200) break;
    const name = `${uuid}-${w}.webp`;
    const fsPath = path.join(dir, name);
    await basePipeline
      .clone()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 76, effort: 4 })
      .toFile(fsPath);
    variants[String(w)] = webPathOf(fsPath);
    out.push(webPathOf(fsPath));
  }

  const mainName = `${uuid}.webp`;
  const mainFs = path.join(dir, mainName);
  await basePipeline.clone().webp({ quality: 80, effort: 4 }).toFile(mainFs);
  const mainUrl = webPathOf(mainFs);

  const avifName = `${uuid}-1600.avif`;
  const avifFs = path.join(dir, avifName);
  try {
    await basePipeline
      .clone()
      .avif({ quality: 55, effort: 4 })
      .toFile(avifFs);
    variants["avif"] = webPathOf(avifFs);
  } catch {
    // AVIF es best-effort; no bloquea la subida.
  }

  const resolution = {
    width: Math.min(originalW, VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1]),
    height: Math.round(
      (meta.height * Math.min(originalW, VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1])) / originalW
    ),
  };

  // Reemplaza el objeto de la web por la ruta más pequeña usada como thumb.
  const thumb = variants["320"] ?? variants["480"] ?? mainUrl;
  const card = variants["800"] ?? variants["1200"] ?? mainUrl;

  return {
    url: mainUrl,
    thumbUrl: thumb,
    cardUrl: card,
    variants,
    width: resolution.width,
    height: resolution.height,
  };
}

export async function deleteMediaFiles(url: string, variants?: VariantMap | null) {
  const fsPaths = new Set<string>();
  const all = [url, ...(variants ? Object.values(variants) : [])];
  for (const u of all) {
    const rel = u.replace(/^\//, "");
    const p = path.join(process.cwd(), rel);
    if (!p.startsWith(MEDIA_ROOT)) continue; // nunca borrar fuera de public/media
    fsPaths.add(p);
  }
  await Promise.all(
    [...fsPaths].map((p) => rm(p, { force: true }).catch(() => {}))
  );
}

export function isValidDimension(w: number, h: number) {
  return clamp(w, 1, MAX_DIMENSION) === w && clamp(h, 1, MAX_DIMENSION) === h;
}

/**
 * Genera un asset SVG de marca (usado por el seed cuando no hay foto).
 * Resultado: placeholder premium, no un icono roto.
 */
export async function svgToWebp(
  svg: string,
  width: number,
  height: number
): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density: 144 })
    .resize(width, height, { fit: "fill" })
    .webp({ quality: 82 })
    .toBuffer();
}