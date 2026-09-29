import { MediaGallery } from "@/components/admin/MediaGallery";

export const metadata = { title: "Biblioteca de medios · Fyrama" };

export default function AdminMediaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Biblioteca de medios</h1>
        <p className="mt-1 text-sm text-ink-500">
          Todas las imágenes del sitio. Las imágenes en uso no se pueden eliminar para no romper el contenido.
        </p>
      </div>
      <MediaGallery />
    </div>
  );
}