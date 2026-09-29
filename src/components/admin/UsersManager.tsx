"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, UserCog } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Label, Input, Select, FieldError } from "@/components/ui/Field";
import { api, errorMessage, ApiError } from "@/lib/client/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count?: { auditLogs: number };
};

const EMPTY = {
  name: "",
  email: "",
  role: "EDITOR",
  password: "",
  active: true,
};

export function UsersManager({ initial, currentUserId }: { initial: User[]; currentUserId: string }) {
  const [users, setUsers] = useState<User[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [fieldsError, setFieldsError] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setFieldsError({});
    setOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: "", active: u.active });
    setError("");
    setFieldsError({});
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFieldsError({});
    try {
      const url = editing ? `/api/admin/users/${editing.id}` : "/api/admin/users";
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
        active: form.active,
      };
      if (editing ? form.password : true) body.password = form.password;
      await api(url, { method: editing ? "PUT" : "POST", body: JSON.stringify(body) });
      const reload = await api<{ users: User[] }>("/api/admin/users");
      setUsers(reload.users);
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFieldsError(err.fields);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(u: User) {
    if (!confirm(`¿Eliminar a ${u.name} (${u.email})? Se revocan sus sesiones.`)) return;
    try {
      await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  const isSelf = (u: User) => u.id === currentUserId;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openNew}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800"
        >
          <Plus className="size-4" aria-hidden /> Nuevo usuario
        </button>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone-300 bg-white py-14 text-center text-ink-500">
          No hay usuarios.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-bone-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-bone-200 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="hidden px-4 py-3 lg:table-cell">Último acceso</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-bone-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">
                      {u.name} {isSelf(u) && <span className="text-xs text-ink-400">(tú)</span>}
                    </p>
                    <p className="text-xs text-ink-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN" ? "bg-pine-900/10 text-pine-800" : "bg-gold-200/60 text-ink-700"
                      }`}
                    >
                      {u.role === "ADMIN" ? <ShieldCheck className="size-3" aria-hidden /> : <UserCog className="size-3" aria-hidden />}
                      {u.role === "ADMIN" ? "Administrador" : "Editor"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.active ? "text-pine-800" : "text-ink-400"}>
                      {u.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 lg:table-cell">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("es-CO") : "Nunca"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-bone-100"
                        aria-label={`Editar a ${u.name}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                      {!isSelf(u) && (
                        <button
                          type="button"
                          onClick={() => remove(u)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          aria-label={`Eliminar a ${u.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Editar a ${editing.name}` : "Nuevo usuario"}>
        <form onSubmit={save} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <Label htmlFor="u-name">Nombre *</Label>
            <Input id="u-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} invalid={Boolean(fieldsError.name)} />
            <FieldError message={fieldsError.name?.[0]} />
          </div>
          <div>
            <Label htmlFor="u-email">Correo *</Label>
            <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} invalid={Boolean(fieldsError.email)} />
            <FieldError message={fieldsError.email?.[0]} />
          </div>
          <div>
            <Label htmlFor="u-role">Rol</Label>
            <Select id="u-role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Administrador</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="u-password">
              Contraseña {editing ? "(déjala en blanco para no cambiarla)" : "*"}
            </Label>
            <Input
              id="u-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              invalid={Boolean(fieldsError.password)}
            />
            <FieldError message={fieldsError.password?.[0]} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="size-4 accent-pine-800"
            />
            Cuenta activa
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-pine-950 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
          >
            {busy ? "Guardando…" : editing ? "Guardar cambios" : "Crear usuario"}
          </button>
        </form>
      </Modal>
    </div>
  );
}