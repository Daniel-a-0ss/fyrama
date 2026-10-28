# Panel administrativo — guía de uso

Acceso: `/admin` (login con las credenciales del seed o de un usuario creado).

## Roles

- **ADMIN**: acceso completo. Gestiona además **Usuarios** y **Auditoría**.
- **EDITOR**: contenido del sitio (inmuebles, blog, asesoría, medios, solicitudes) sin ver
  usuarios ni auditoría. Las rutas también lo bloquean en backend.

## Secciones

### Dashboard (`/admin`)
Resumen de inmuebles, solicitudes, artículos, medios y actividad reciente.

### Inmuebles (`/admin/viviendas`)
- Tabs por estado (Todas/Publicadas/Borradores/Ocultas), buscador y paginación.
- **Nuevo inmueble**: formulario completo (datos, ubicación, spec, características con predefinidas).
- **Editar**: `ImageManager` para subir/reordenar imágenes y fijar portada; campos SEO; estado
  `DRAFT → PUBLISHED → HIDDEN`; marcar como **Destacada**.

### Contenido (`/admin/contenido`)
- Artículos del blog con editor Markdown + vista previa en vivo, portada (MediaPicker),
  categoría, fecha de publicación y SEO.
- **Categorías**: crearlas o renombrarlas junto al listado para no perder referencias.

### Asesoría jurídica (`/admin/asesoria`)
CRUD de servicios mostrados en `/asesoria-juridica`: título, descripción, contenido Markdown,
icono, orden, activo/inactivo.

### Medios (`/admin/media`)
Biblioteca global de imágenes: subida múltiple (arrastrar y soltar), filtro por tipo,
paginación. "Eliminar" falla si la imagen está en uso (asociada a algún inmueble o artículo).

### Solicitudes (`/admin/solicitudes`)
Mensajes del formulario de contacto. Cambiar estado: `NUEVA → EN CONTACTO → CERRADA`.
Filtros por tipo (inmueble/legal/general), estado y búsqueda.

### Usuarios (ADMIN) (`/admin/usuarios`)
Crear/editar usuarios con rol y estado. Protecciones: no se puede eliminar
al último ADMIN activo, ni desactivar/eliminar a uno mismo; al borrar un usuario se revocan
sus sesiones.

### Auditoría (ADMIN) (`/admin/auditoria`)
Registro inmutable de actividad administrativa: quién hizo qué, cuándo, desde qué IP y con
qué detalle. Filtrar por acción.

### Configuración (`/admin/configuracion`)
Ajustes del sitio (email/telefonía/ciudad de contacto, aviso legal, textos SEO) y cambio de
contraseña del usuario actual.

## Consejos

- Los borrados de inmueble son **baja lógica** (`deletedAt`); no se muestran en el público ni
  en el admin.
- Las imágenes de portada de los inmuebles se fijan en el `ImageManager`.
- El contenido se guarda en Markdown; los enlaces/negritas/tablas se soportan, el HTML crudo no.