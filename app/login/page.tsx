"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-dark flex items-center justify-center mb-4">
            <span className="text-white font-mono font-bold text-xl">N</span>
          </div>
          <h1 className="font-mono font-bold text-text text-lg tracking-tight">n8n Dashboard</h1>
          <p className="text-dim text-sm mt-1">Connexion à votre espace</p>
        </div>

        {/* Credentials par défaut — à supprimer après premier login */}
        <div className="mb-6 p-3 bg-yellow-950/40 border border-yellow-800/50 rounded-xl">
          <p className="font-mono text-xs text-yellow-400 mb-1">Compte superadmin par défaut :</p>
          <p className="font-mono text-xs text-yellow-300">admin@example.com</p>
          <p className="font-mono text-xs text-yellow-300">Admin1234!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs text-dim uppercase tracking-widest block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-green transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-xs text-dim uppercase tracking-widest block mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-green transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3">
              <p className="font-mono text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-dark hover:bg-green disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors font-mono text-sm uppercase tracking-widest"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
