"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Trash2, Edit2, X, Check, Shield, User, ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import { TASKS } from "@/lib/tasks";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  taskAccess: { taskId: string }[];
}

const EMPTY_FORM = { name: "", email: "", password: "", role: "user", taskIds: [] as string[] };

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("admin");

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    if (res.status === 401) { router.push("/"); return; }
    setUsers(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchUsers();
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => { if (s?.user?.role) setCurrentUserRole(s.user.role); })
      .catch(() => {});
  }, [fetchUsers]);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(u: UserRow) {
    setForm({ name: u.name, email: u.email, password: "", role: u.role, taskIds: u.taskAccess.map(t => t.taskId) });
    setEditingId(u.id);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = editingId
        ? await fetch(`/api/users/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur"); return; }
      setShowForm(false);
      fetchUsers();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    setDeletingId(id);
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchUsers();
  }

  function toggleTask(taskId: string) {
    setForm(f => ({
      ...f,
      taskIds: f.taskIds.includes(taskId) ? f.taskIds.filter(t => t !== taskId) : [...f.taskIds, taskId],
    }));
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface border-b border-border h-12 flex items-center gap-3 px-6">
        <Link href={currentUserRole === "superadmin" ? "/admin" : "/"} className="text-dim hover:text-text transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <span className="font-mono text-sm text-text font-semibold">Gestion des comptes</span>
        <div className="flex-1" />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-dark hover:bg-green text-white px-3 py-1.5 rounded-lg font-mono text-xs transition-colors"
        >
          <UserPlus size={13} /> Nouveau compte
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-dim text-sm font-mono">Chargement…</p>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-dim text-sm mb-4">Aucun utilisateur</p>
            <button onClick={openCreate} className="bg-green-dark hover:bg-green text-white px-4 py-2 rounded-xl font-mono text-xs transition-colors">
              Créer le premier compte
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs text-dim uppercase tracking-widest mb-4">
              Utilisateurs — {users.length}
            </p>
            {users.map(user => (
              <div key={user.id} className="bg-surface border border-border rounded-xl p-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  {user.role === "superadmin" ? <Crown size={15} style={{ color: "#c084fc" }} /> :
                   user.role === "admin" ? <Shield size={15} style={{ color: "#58a6ff" }} /> :
                   <User size={15} className="text-dim" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text text-sm">{user.name}</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                      user.role === "superadmin" ? "text-purple-400 border-purple-800 bg-purple-950/30" :
                      user.role === "admin" ? "text-blue-400 border-blue-800 bg-blue-950/30" :
                      "text-dim border-border bg-muted"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-dim mt-0.5">{user.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.taskAccess.length === 0 ? (
                      <span className="font-mono text-xs text-dim/50">Aucun accès tâche</span>
                    ) : user.role === "admin" ? (
                      <span className="font-mono text-xs text-green/70">Accès complet (admin)</span>
                    ) : (
                      user.taskAccess.map(t => {
                        const task = TASKS.find(tk => tk.id === t.taskId);
                        return (
                          <span key={t.taskId} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-green-dark/20 text-green border border-green-dark/30">
                            {task?.label ?? t.taskId}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-dim hover:text-text transition-colors" title="Modifier">
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                    className="p-1.5 rounded-lg text-dim hover:text-red-400 transition-colors disabled:opacity-40"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-text">{editingId ? "Modifier le compte" : "Nouveau compte"}</h2>
              <button onClick={() => setShowForm(false)} className="text-dim hover:text-text"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Nom" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Jean Dupont" required />
              <FormField label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="jean@example.com" required />
              <FormField
                label={editingId ? "Nouveau mot de passe (laisser vide = inchangé)" : "Mot de passe"}
                type="password" value={form.password}
                onChange={v => setForm(f => ({ ...f, password: v }))}
                placeholder="••••••••"
                required={!editingId}
              />
              <div>
                <label className="font-mono text-xs text-dim uppercase tracking-widest block mb-2">Rôle</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-mono text-sm text-text focus:outline-none focus:border-green transition-colors"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                  {currentUserRole === "superadmin" && <option value="superadmin">Superadmin</option>}
                </select>
              </div>

              {/* Task access */}
              <div>
                <label className="font-mono text-xs text-dim uppercase tracking-widest block mb-2">
                  Accès aux tâches {form.role === "admin" && <span className="text-green/60 normal-case">(admin = tout)</span>}
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {TASKS.map(task => {
                    const active = form.taskIds.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left"
                        style={{
                          background: active ? "rgba(35,134,54,0.1)" : "transparent",
                          borderColor: active ? "rgba(35,134,54,0.4)" : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${active ? "bg-green-dark border-green" : "border border-border"}`}>
                          {active && <Check size={10} className="text-white" />}
                        </div>
                        <div>
                          <p className="font-mono text-xs text-text">{task.label}</p>
                          <p className="font-mono text-[10px] text-dim/60 truncate">{task.webhookPath}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3">
                  <p className="font-mono text-xs text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border text-dim hover:text-text rounded-xl py-2.5 font-mono text-xs transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-green-dark hover:bg-green disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 font-mono text-sm transition-colors">
                  {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, type = "text", value, onChange, placeholder, required }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="font-mono text-xs text-dim uppercase tracking-widest block mb-2">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-green transition-colors"
      />
    </div>
  );
}
