# Dashboard n8n v2 + Email Builder — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre l'UI du dashboard n8n avec un style GitHub/Admin et ajouter un Email Builder par blocs configurables qui génère du HTML email inline-styled.

**Architecture:** Le dashboard adopte un layout sidebar + header fixe + contenu. L'email builder est une nouvelle route `/email-builder` avec trois colonnes : catalogue de blocs, canvas de prévisualisation, panel de configuration. Tout le state est local (localStorage) ; aucun backend n'est touché.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS (palette remplacée), localStorage.

---

## File Map

### Fichiers modifiés
- `tailwind.config.ts` — nouvelle palette GitHub/Admin
- `types/index.ts` — ajout `EmailBlock`, `EmailTemplate`, `EmailBlockType`
- `app/layout.tsx` — ajout sidebar persistante
- `app/page.tsx` — refonte complète : sidebar, header, stats bar, grille redesignée
- `app/settings/page.tsx` — adapter au nouveau style (couleurs uniquement)

### Nouveaux fichiers
- `components/Sidebar.tsx` — sidebar fixe avec navigation
- `components/StatsBar.tsx` — 4 métriques en haut de la page principale
- `lib/email-html.ts` — `generateEmailHtml(blocks)` + `renderBlockHtml(block)`
- `lib/email-templates.ts` — CRUD localStorage pour les templates
- `app/email-builder/page.tsx` — page email builder
- `components/email-builder/EmailBuilder.tsx` — composant principal (state, layout 3 colonnes)
- `components/email-builder/BlockCatalogue.tsx` — sidebar gauche (7 blocs + templates)
- `components/email-builder/Canvas.tsx` — colonne centrale (liste de blocs + contrôles)
- `components/email-builder/ConfigPanel.tsx` — colonne droite (formulaires par type de bloc)
- `components/email-builder/PreviewModal.tsx` — modal fullscreen avec iframe
- `components/email-builder/blocks/HeaderBlock.tsx`
- `components/email-builder/blocks/HeroImageBlock.tsx`
- `components/email-builder/blocks/IntroTextBlock.tsx`
- `components/email-builder/blocks/TwoCardsBlock.tsx`
- `components/email-builder/blocks/DoubleCTABlock.tsx`
- `components/email-builder/blocks/NoteBlock.tsx`
- `components/email-builder/blocks/FooterBlock.tsx`

---

## Task 1 — Nouvelle palette Tailwind + types EmailBlock

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `types/index.ts`

- [ ] **Step 1 : Remplacer la palette dans `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: "#0d1117",
        surface: "#161b22",
        border: "#30363d",
        text: "#c9d1d9",
        dim: "#8b949e",
        green: "#3fb950",
        "green-dark": "#238636",
        muted: "#21262d",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2 : Ajouter les types email dans `types/index.ts`** (après les types existants)

```typescript
// Ajouter à la fin de types/index.ts

export type EmailBlockType =
  | "header"
  | "hero-image"
  | "intro-text"
  | "two-cards"
  | "double-cta"
  | "note"
  | "footer";

export interface HeaderBlockProps {
  bgColor: string;
  logoLeftUrl: string;
  logoLeftHref: string;
  logoRightUrl: string;
  logoRightHref: string;
  showDivider: boolean;
  borderRadius: number;
}

export interface HeroImageBlockProps {
  imageUrl: string;
  altText: string;
}

export interface IntroTextBlockProps {
  content: string;
  align: "left" | "center" | "right";
}

export interface CardItem {
  bgColor: string;
  headerBgColor: string;
  headerBorderColor: string;
  logoUrl: string;
  amountText: string;
  amountColor: string;
  subtitle: string;
  details: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaBgColor: string;
  ctaTextColor: string;
}

export interface TwoCardsBlockProps {
  left: CardItem;
  right: CardItem;
  cumulableNote: string;
}

export interface DoubleCTABlockProps {
  title: string;
  subtitle: string;
  ctaLeft: { label: string; href: string; bgColor: string; textColor: string };
  ctaRight: { label: string; href: string; bgColor: string; textColor: string };
}

export interface NoteBlockProps {
  content: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
}

export interface FooterBlockProps {
  bgColor: string;
  logoLeftUrl: string;
  logoLeftHref: string;
  logoRightUrl: string;
  logoRightHref: string;
  contactText: string;
  unsubscribeLink: string;
  borderRadius: number;
}

export type EmailBlockProps =
  | HeaderBlockProps
  | HeroImageBlockProps
  | IntroTextBlockProps
  | TwoCardsBlockProps
  | DoubleCTABlockProps
  | NoteBlockProps
  | FooterBlockProps;

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  props: EmailBlockProps;
}

export interface EmailTemplate {
  id: string;
  name: string;
  blocks: EmailBlock[];
  updatedAt: number;
}
```

- [ ] **Step 3 : Vérifier que le projet compile**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -20
```

Expected : build success ou erreurs de types uniquement (pas d'erreurs Tailwind).

- [ ] **Step 4 : Commit**

```bash
cd /root/dashboarsn8n && git add tailwind.config.ts types/index.ts && git commit -m "feat: new GitHub/Admin palette + EmailBlock types"
```

---

## Task 2 — Sidebar de navigation

**Files:**
- Create: `components/Sidebar.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1 : Créer `components/Sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", icon: "⬡", label: "Dashboard" },
  { href: "/email-builder", icon: "✉", label: "Email Builder", isNew: true },
  { href: "/settings", icon: "⚙", label: "Paramètres" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-14 bg-surface border-r border-border flex flex-col items-center py-4 gap-1 z-40 group hover:w-48 transition-all duration-200 overflow-hidden">
      {/* Logo */}
      <div className="w-8 h-8 rounded-lg bg-green-dark flex items-center justify-center mb-4 flex-shrink-0">
        <span className="text-white font-mono font-bold text-sm">N</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 w-full px-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                active
                  ? "bg-muted border-l-2 border-green text-text"
                  : "text-dim hover:text-text hover:bg-muted"
              }`}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">
                {item.icon}
              </span>
              <span className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-2">
                {item.label}
                {item.isNew && (
                  <span className="bg-green-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2 : Mettre à jour `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "N8N Dashboard — Occitinfo",
  description: "Interface d'automatisation connectée à n8n",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-bg text-text">
        <Sidebar />
        <div className="pl-14">{children}</div>
      </body>
    </html>
  );
}
```

- [ ] **Step 3 : Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -10
```

- [ ] **Step 4 : Commit**

```bash
cd /root/dashboarsn8n && git add components/Sidebar.tsx app/layout.tsx && git commit -m "feat: add persistent sidebar navigation"
```

---

## Task 3 — Refonte complète de `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`
- Create: `components/StatsBar.tsx`

- [ ] **Step 1 : Créer `components/StatsBar.tsx`**

```tsx
"use client";

import type { HistoryEntry } from "@/types";

interface StatsBarProps {
  history: HistoryEntry[];
  instanceName: string | null;
}

export default function StatsBar({ history, instanceName }: StatsBarProps) {
  const total = history.length;
  const successes = history.filter((e) => e.status === "success").length;
  const rate = total > 0 ? Math.round((successes / total) * 100) : 0;
  const last = history[0];
  const lastStr = last
    ? new Date(last.timestamp).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const stats = [
    { label: "Tâches exécutées", value: String(total) },
    { label: "Taux de succès", value: total > 0 ? `${rate}%` : "—", green: rate >= 90 },
    { label: "Dernière exécution", value: lastStr },
    { label: "Instance active", value: instanceName ?? "Non configurée" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-surface border border-border rounded-lg px-4 py-3"
        >
          <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-1">
            {s.label}
          </p>
          <p
            className={`font-mono text-lg font-bold ${
              s.green ? "text-green" : "text-text"
            }`}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2 : Réécrire `app/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfigGuard from "@/components/ConfigGuard";
import TaskRunner from "@/components/TaskRunner";
import HistoryPanel from "@/components/history/HistoryPanel";
import ClaudeUsage from "@/components/ClaudeUsage";
import UsageStats from "@/components/UsageStats";
import StatsBar from "@/components/StatsBar";
import { TASKS } from "@/lib/tasks";
import { useHistory } from "@/hooks/useHistory";
import { useInstances } from "@/hooks/useInstances";
import type { Task, HistoryEntry } from "@/types";

const ICONS: Record<string, string> = {
  ScanText: "⌗",
  FileText: "⎙",
  FileSpreadsheet: "⊞",
  AlignLeft: "≡",
  Languages: "⇄",
  Tag: "◈",
  BarChart2: "▦",
  Table: "⊟",
  SpellCheck: "✓",
  Globe: "◉",
  Receipt: "◻",
  ClipboardList: "☰",
  Zap: "⚡",
};

const CATEGORY: Record<string, string> = {
  "ocr-image": "IMAGE",
  "extract-pdf": "PDF",
  "extract-file": "FICHIER",
  summarize: "TEXTE",
  translate: "TEXTE",
  classify: "TEXTE",
  stats: "TEXTE",
  "csv-json": "DONNÉES",
  spellcheck: "TEXTE",
  "detect-lang": "TEXTE",
  "extract-invoice": "DOCUMENT",
  "extract-form": "IMAGE",
  custom: "WEBHOOK",
};

export default function HomePage() {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [initialText, setInitialText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showInstanceMenu, setShowInstanceMenu] = useState(false);
  const { history, add: addHistory, clear: clearHistory } = useHistory();
  const { instances, activeInstance, switchTo } = useInstances();

  const handleReload = (entry: HistoryEntry) => {
    const task = TASKS.find((t) => t.id === entry.taskId);
    if (!task) return;
    setInitialText(entry.result);
    setActiveTask(task);
    setShowHistory(false);
  };

  return (
    <ConfigGuard>
      <div className="min-h-screen bg-bg">
        {/* Header fixe */}
        <header className="sticky top-0 z-30 bg-surface border-b border-border h-12 flex items-center justify-between px-6">
          <span className="font-mono text-sm text-text font-semibold">
            Tableau de bord
          </span>
          <div className="flex items-center gap-4">
            {instances.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowInstanceMenu((v) => !v)}
                  className="flex items-center gap-2 font-mono text-xs text-dim hover:text-text transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green" />
                  {activeInstance?.name ?? "Instance"}
                  <span className="text-dim/40">▾</span>
                </button>
                {showInstanceMenu && (
                  <div className="absolute right-0 top-6 mt-1 w-56 bg-surface border border-border rounded-lg overflow-hidden z-50 shadow-xl">
                    {instances.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          switchTo(inst.id);
                          setShowInstanceMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 font-mono text-xs transition-colors hover:bg-muted ${
                          inst.id === activeInstance?.id ? "text-green" : "text-dim"
                        }`}
                      >
                        {inst.name}
                        <span className="block text-dim/40 text-xs truncate mt-0.5">
                          {inst.baseUrl}
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-border">
                      <button
                        onClick={() => {
                          setShowInstanceMenu(false);
                          router.push("/settings");
                        }}
                        className="w-full text-left px-4 py-3 font-mono text-xs text-dim hover:text-text transition-colors hover:bg-muted"
                      >
                        + Gérer les instances
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="relative font-mono text-xs text-dim hover:text-text transition-colors"
            >
              Historique
              {history.length > 0 && (
                <span className="absolute -top-1 -right-3 w-4 h-4 rounded-full bg-green-dark text-white text-[9px] flex items-center justify-center font-bold">
                  {history.length > 9 ? "9+" : history.length}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">
          <StatsBar history={history} instanceName={activeInstance?.name ?? null} />

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs text-dim uppercase tracking-widest">
              Tâches disponibles — {TASKS.length}
            </h2>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              <span className="font-mono text-xs text-dim">Webhooks actifs</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TASKS.map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  setInitialText("");
                  setActiveTask(task);
                }}
                className="group text-left bg-surface border border-border hover:border-green/40 rounded-lg p-4 transition-all duration-150 hover:bg-muted"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                    <span className="font-mono text-base text-text/70 group-hover:text-green transition-colors">
                      {ICONS[task.icon] ?? "◆"}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-dim bg-bg border border-border px-2 py-0.5 rounded-full">
                    {CATEGORY[task.id] ?? task.inputType.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-text text-sm mb-1">
                  {task.label}
                </h3>
                <p className="text-dim text-xs leading-relaxed line-clamp-2">
                  {task.description}
                </p>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="font-mono text-[10px] text-dim/50 truncate">
                    {task.webhookPath}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <UsageStats history={history} />
            <ClaudeUsage />
          </div>
        </main>

        {showHistory && (
          <HistoryPanel
            history={history}
            onClear={clearHistory}
            onReload={handleReload}
            onClose={() => setShowHistory(false)}
          />
        )}

        {activeTask && (
          <TaskRunner
            task={activeTask}
            onClose={() => setActiveTask(null)}
            onAddHistory={addHistory}
            initialText={initialText}
          />
        )}
      </div>
    </ConfigGuard>
  );
}
```

- [ ] **Step 3 : Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -10
```

- [ ] **Step 4 : Commit**

```bash
cd /root/dashboarsn8n && git add app/page.tsx components/StatsBar.tsx && git commit -m "feat: redesign dashboard with GitHub/Admin style"
```

---

## Task 4 — Adapter settings/page.tsx au nouveau style

**Files:**
- Modify: `app/settings/page.tsx`

- [ ] **Step 1 : Lire le fichier complet**

```bash
cat /root/dashboarsn8n/app/settings/page.tsx
```

- [ ] **Step 2 : Remplacer les classes de couleur obsolètes dans `app/settings/page.tsx`**

Remplacer dans tout le fichier :
- `text-accent` → `text-green`
- `bg-accent` → `bg-green-dark`
- `hover:border-accent` → `hover:border-green`
- `border-accent` → `border-green`

Ajouter en haut du JSX retourné un header cohérent avec le dashboard, et envelopper le contenu dans `<main className="max-w-3xl mx-auto px-6 py-8">` :

```tsx
{/* Ajouter avant le contenu existant */}
<header className="sticky top-0 z-30 bg-surface border-b border-border h-12 flex items-center px-6">
  <span className="font-mono text-sm text-text font-semibold">Paramètres</span>
</header>
```

- [ ] **Step 3 : Commit**

```bash
cd /root/dashboarsn8n && git add app/settings/page.tsx && git commit -m "style: adapt settings page to new color palette"
```

---

## Task 5 — lib/email-html.ts et lib/email-templates.ts

**Files:**
- Create: `lib/email-html.ts`
- Create: `lib/email-templates.ts`

- [ ] **Step 1 : Créer `lib/email-html.ts`**

```typescript
import type {
  EmailBlock,
  HeaderBlockProps,
  HeroImageBlockProps,
  IntroTextBlockProps,
  TwoCardsBlockProps,
  DoubleCTABlockProps,
  NoteBlockProps,
  FooterBlockProps,
  CardItem,
} from "@/types";

function renderHeaderHtml(p: HeaderBlockProps): string {
  const dividerStyle = p.showDivider ? `border-right:1px solid #444444;` : "";
  return `<tr>
    <td style="background-color:${p.bgColor};padding:20px 32px;border-radius:${p.borderRadius}px ${p.borderRadius}px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="45%" style="vertical-align:middle;text-align:center;padding-right:16px;${dividerStyle}">
            <a href="${p.logoLeftHref}" style="display:block;text-decoration:none;">
              <img src="${p.logoLeftUrl}" alt="Logo gauche" height="55" style="display:block;margin:0 auto;height:55px;max-width:200px;" />
            </a>
          </td>
          <td width="55%" style="vertical-align:middle;text-align:center;padding-left:16px;">
            <a href="${p.logoRightHref}" style="display:block;text-decoration:none;">
              <img src="${p.logoRightUrl}" alt="Logo droit" height="60" style="display:block;margin:0 auto;height:60px;max-width:220px;" />
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function renderHeroImageHtml(p: HeroImageBlockProps): string {
  return `<tr>
    <td style="padding:0;text-align:center;">
      <img src="${p.imageUrl}" alt="${p.altText}" style="width:100%;max-width:620px;height:auto;display:block;margin:0;" />
    </td>
  </tr>`;
}

function renderIntroTextHtml(p: IntroTextBlockProps): string {
  return `<tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;">
      <p style="margin:0;font-size:15px;color:#555555;line-height:1.8;text-align:${p.align};">${p.content}</p>
    </td>
  </tr>`;
}

function renderCardHtml(card: CardItem, width: string): string {
  const details = card.details
    .map(
      (d) =>
        `<tr><td style="padding:7px 0;border-top:1px solid #333;">
          <p style="margin:0;font-size:12px;color:#cccccc;line-height:1.5;">
            <span style="color:${card.ctaBgColor};font-weight:700;margin-right:6px;">✓</span>${d}
          </p>
        </td></tr>`
    )
    .join("");

  return `<td width="${width}" style="vertical-align:top;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${card.bgColor};border-radius:14px;overflow:hidden;">
      <tr>
        <td style="background-color:${card.headerBgColor};padding:16px 18px;text-align:center;border-bottom:3px solid ${card.headerBorderColor};">
          <img src="${card.logoUrl}" alt="Logo" height="44" style="display:block;margin:0 auto;height:44px;max-width:180px;"/>
        </td>
      </tr>
      <tr>
        <td style="padding:22px 18px 8px;text-align:center;">
          <p style="margin:4px 0;font-size:52px;font-weight:900;color:${card.amountColor};line-height:1;">${card.amountText}</p>
          <p style="margin:0 0 16px;font-size:11px;color:#aaaaaa;">${card.subtitle}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 18px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${details}</table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 18px 18px;text-align:center;">
          <a href="${card.ctaHref}" style="display:block;background-color:${card.ctaBgColor};color:${card.ctaTextColor};font-size:13px;font-weight:700;text-decoration:none;padding:12px 16px;border-radius:50px;">
            ${card.ctaLabel}
          </a>
        </td>
      </tr>
    </table>
  </td>`;
}

function renderTwoCardsHtml(p: TwoCardsBlockProps): string {
  const note = p.cumulableNote
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr>
          <td style="background-color:#f6f9f4;border-left:4px solid #4a8c3f;border-radius:0 8px 8px 0;padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#444;line-height:1.6;">${p.cumulableNote}</p>
          </td>
        </tr>
      </table>`
    : "";

  return `<tr>
    <td style="background-color:#ffffff;padding:24px 28px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${renderCardHtml(p.left, "48%")}
          <td width="4%"></td>
          ${renderCardHtml(p.right, "48%")}
        </tr>
      </table>
      ${note}
    </td>
  </tr>`;
}

function renderDoubleCTAHtml(p: DoubleCTABlockProps): string {
  return `<tr>
    <td style="background-color:#f8f5f0;padding:28px 32px;border-top:1px solid #eeeeee;">
      <p style="margin:0 0 6px;font-size:17px;font-weight:800;color:#1c1c1c;text-align:center;">${p.title}</p>
      <p style="margin:0 0 20px;font-size:13px;color:#999;text-align:center;">${p.subtitle}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="padding-right:8px;text-align:center;">
            <a href="${p.ctaLeft.href}" style="display:block;background-color:${p.ctaLeft.bgColor};color:${p.ctaLeft.textColor};font-size:14px;font-weight:700;text-decoration:none;padding:15px 20px;border-radius:50px;">
              ${p.ctaLeft.label}
            </a>
          </td>
          <td width="48%" style="padding-left:8px;text-align:center;">
            <a href="${p.ctaRight.href}" style="display:block;background-color:${p.ctaRight.bgColor};color:${p.ctaRight.textColor};font-size:14px;font-weight:700;text-decoration:none;padding:15px 20px;border-radius:50px;">
              ${p.ctaRight.label}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function renderNoteHtml(p: NoteBlockProps): string {
  return `<tr>
    <td style="background-color:#ffffff;padding:0 32px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background-color:${p.bgColor};border-left:4px solid ${p.borderColor};border-radius:0 8px 8px 0;padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#444;line-height:1.6;">${p.emoji} ${p.content}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function renderFooterHtml(p: FooterBlockProps): string {
  return `<tr>
    <td style="background-color:${p.bgColor};padding:24px 32px;border-radius:0 0 ${p.borderRadius}px ${p.borderRadius}px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 14px;">
        <tr>
          <td style="padding-right:20px;border-right:1px solid #000000;vertical-align:middle;">
            <a href="${p.logoLeftHref}" style="display:block;text-decoration:none;">
              <img src="${p.logoLeftUrl}" alt="Logo gauche" height="30" style="height:30px;display:block;"/>
            </a>
          </td>
          <td style="padding-left:20px;vertical-align:middle;">
            <a href="${p.logoRightHref}" style="display:block;text-decoration:none;">
              <img src="${p.logoRightUrl}" alt="Logo droit" height="34" style="height:34px;display:block;"/>
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 6px;font-size:11px;color:#000000;line-height:1.6;">${p.contactText}</p>
      <p style="margin:0;font-size:10px;color:#000000;">
        Vous recevez cet email car vous êtes client(e).
        &nbsp;<a href="${p.unsubscribeLink}" style="color:#ffffff;text-decoration:underline;">Se désabonner</a>
      </p>
    </td>
  </tr>`;
}

export function renderBlockHtml(block: EmailBlock): string {
  switch (block.type) {
    case "header":
      return renderHeaderHtml(block.props as HeaderBlockProps);
    case "hero-image":
      return renderHeroImageHtml(block.props as HeroImageBlockProps);
    case "intro-text":
      return renderIntroTextHtml(block.props as IntroTextBlockProps);
    case "two-cards":
      return renderTwoCardsHtml(block.props as TwoCardsBlockProps);
    case "double-cta":
      return renderDoubleCTAHtml(block.props as DoubleCTABlockProps);
    case "note":
      return renderNoteHtml(block.props as NoteBlockProps);
    case "footer":
      return renderFooterHtml(block.props as FooterBlockProps);
    default:
      return "";
  }
}

export function generateEmailHtml(blocks: EmailBlock[]): string {
  const rows = blocks.map(renderBlockHtml).join("\n");
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f2efe9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2efe9;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">
          ${rows}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

- [ ] **Step 2 : Créer `lib/email-templates.ts`**

```typescript
import type { EmailTemplate, EmailBlock } from "@/types";

const STORAGE_KEY = "email_builder_templates";
const DRAFT_KEY = "email_builder_draft";
const MAX_TEMPLATES = 20;

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getTemplates(): EmailTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveTemplate(name: string, blocks: EmailBlock[]): EmailTemplate {
  const templates = getTemplates();
  const template: EmailTemplate = {
    id: uuid(),
    name,
    blocks,
    updatedAt: Date.now(),
  };
  const updated = [template, ...templates].slice(0, MAX_TEMPLATES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return template;
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function saveDraft(blocks: EmailBlock[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(blocks));
}

export function loadDraft(): EmailBlock[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "[]");
  } catch {
    return [];
  }
}
```

- [ ] **Step 3 : Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -10
```

- [ ] **Step 4 : Commit**

```bash
cd /root/dashboarsn8n && git add lib/email-html.ts lib/email-templates.ts && git commit -m "feat: add email HTML generator and template storage"
```

---

## Task 6 — Blocs visuels de l'email builder (rendu canvas)

**Files:**
- Create: `components/email-builder/blocks/HeaderBlock.tsx`
- Create: `components/email-builder/blocks/HeroImageBlock.tsx`
- Create: `components/email-builder/blocks/IntroTextBlock.tsx`
- Create: `components/email-builder/blocks/TwoCardsBlock.tsx`
- Create: `components/email-builder/blocks/DoubleCTABlock.tsx`
- Create: `components/email-builder/blocks/NoteBlock.tsx`
- Create: `components/email-builder/blocks/FooterBlock.tsx`

Ces composants sont le **rendu visuel** dans le canvas (pas la génération HTML email). Ils affichent un aperçu fidèle.

- [ ] **Step 1 : Créer `components/email-builder/blocks/HeaderBlock.tsx`**

```tsx
import type { HeaderBlockProps } from "@/types";

export default function HeaderBlock(p: HeaderBlockProps) {
  return (
    <div
      style={{ backgroundColor: p.bgColor, borderRadius: `${p.borderRadius}px ${p.borderRadius}px 0 0` }}
      className="px-8 py-5"
    >
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 flex justify-center">
          {p.logoLeftUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logoLeftUrl} alt="Logo gauche" className="h-12 max-w-[180px] object-contain" />
          ) : (
            <div className="h-12 w-32 bg-white/20 rounded flex items-center justify-center text-white/60 text-xs">Logo gauche</div>
          )}
        </div>
        {p.showDivider && <div className="w-px h-10 bg-white/30" />}
        <div className="flex-1 flex justify-center">
          {p.logoRightUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logoRightUrl} alt="Logo droit" className="h-14 max-w-[200px] object-contain" />
          ) : (
            <div className="h-12 w-32 bg-white/20 rounded flex items-center justify-center text-white/60 text-xs">Logo droit</div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Créer `components/email-builder/blocks/HeroImageBlock.tsx`**

```tsx
import type { HeroImageBlockProps } from "@/types";

export default function HeroImageBlock(p: HeroImageBlockProps) {
  return (
    <div className="w-full">
      {p.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.imageUrl} alt={p.altText} className="w-full block" />
      ) : (
        <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
          🖼 URL d&apos;image non définie
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3 : Créer `components/email-builder/blocks/IntroTextBlock.tsx`**

Note : le contenu est affiché comme texte brut (pas de HTML) pour éviter tout risque XSS.

```tsx
import type { IntroTextBlockProps } from "@/types";

export default function IntroTextBlock(p: IntroTextBlockProps) {
  return (
    <div className="bg-white px-8 py-6">
      <p
        className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap"
        style={{ textAlign: p.align }}
      >
        {p.content}
      </p>
    </div>
  );
}
```

- [ ] **Step 4 : Créer `components/email-builder/blocks/TwoCardsBlock.tsx`**

```tsx
import type { TwoCardsBlockProps, CardItem } from "@/types";

function Card({ card }: { card: CardItem }) {
  return (
    <div className="flex-1 rounded-xl overflow-hidden" style={{ backgroundColor: card.bgColor }}>
      <div
        className="p-4 flex justify-center"
        style={{ backgroundColor: card.headerBgColor, borderBottom: `3px solid ${card.headerBorderColor}` }}
      >
        {card.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.logoUrl} alt="Logo" className="h-10 max-w-[160px] object-contain" />
        ) : (
          <div className="h-10 w-28 bg-white/20 rounded flex items-center justify-center text-white/60 text-xs">Logo</div>
        )}
      </div>
      <div className="p-4 text-center">
        <p className="text-4xl font-black leading-none mb-1" style={{ color: card.amountColor }}>
          {card.amountText || "—"}
        </p>
        <p className="text-xs text-gray-400 mb-3">{card.subtitle}</p>
        {card.details.map((d, i) => (
          <p key={i} className="text-xs text-gray-300 py-1 border-t border-white/10 text-left">
            <span className="font-bold mr-1" style={{ color: card.ctaBgColor }}>✓</span>
            {d}
          </p>
        ))}
        <div
          className="mt-3 block text-xs font-bold py-2 px-4 rounded-full text-center"
          style={{ backgroundColor: card.ctaBgColor, color: card.ctaTextColor }}
        >
          {card.ctaLabel || "CTA"}
        </div>
      </div>
    </div>
  );
}

export default function TwoCardsBlock(p: TwoCardsBlockProps) {
  return (
    <div className="bg-white px-6 py-5">
      <div className="flex gap-3">
        <Card card={p.left} />
        <Card card={p.right} />
      </div>
      {p.cumulableNote && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-600 rounded-r-lg px-4 py-3">
          <p className="text-xs text-gray-600">{p.cumulableNote}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5 : Créer `components/email-builder/blocks/DoubleCTABlock.tsx`**

```tsx
import type { DoubleCTABlockProps } from "@/types";

export default function DoubleCTABlock(p: DoubleCTABlockProps) {
  return (
    <div className="bg-stone-50 border-t border-gray-100 px-8 py-6">
      {p.title && (
        <p className="text-center font-extrabold text-gray-900 text-lg mb-1">{p.title}</p>
      )}
      {p.subtitle && (
        <p className="text-center text-xs text-gray-400 mb-5">{p.subtitle}</p>
      )}
      <div className="flex gap-3">
        <div
          className="flex-1 text-center text-sm font-bold py-3 px-4 rounded-full"
          style={{ backgroundColor: p.ctaLeft.bgColor, color: p.ctaLeft.textColor }}
        >
          {p.ctaLeft.label || "Bouton gauche"}
        </div>
        <div
          className="flex-1 text-center text-sm font-bold py-3 px-4 rounded-full"
          style={{ backgroundColor: p.ctaRight.bgColor, color: p.ctaRight.textColor }}
        >
          {p.ctaRight.label || "Bouton droit"}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6 : Créer `components/email-builder/blocks/NoteBlock.tsx`**

```tsx
import type { NoteBlockProps } from "@/types";

export default function NoteBlock(p: NoteBlockProps) {
  return (
    <div className="bg-white px-8 pb-5">
      <div
        className="rounded-r-lg px-4 py-3"
        style={{
          backgroundColor: p.bgColor,
          borderLeft: `4px solid ${p.borderColor}`,
        }}
      >
        <p className="text-xs text-gray-600 leading-relaxed">
          {p.emoji} {p.content}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7 : Créer `components/email-builder/blocks/FooterBlock.tsx`**

```tsx
import type { FooterBlockProps } from "@/types";

export default function FooterBlock(p: FooterBlockProps) {
  return (
    <div
      className="px-8 py-5 text-center"
      style={{
        backgroundColor: p.bgColor,
        borderRadius: `0 0 ${p.borderRadius}px ${p.borderRadius}px`,
      }}
    >
      <div className="flex items-center justify-center gap-5 mb-3">
        {p.logoLeftUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.logoLeftUrl} alt="Logo gauche" className="h-7 object-contain" />
        ) : (
          <div className="h-7 w-20 bg-white/20 rounded" />
        )}
        <div className="w-px h-6 bg-black/30" />
        {p.logoRightUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.logoRightUrl} alt="Logo droit" className="h-8 object-contain" />
        ) : (
          <div className="h-8 w-24 bg-white/20 rounded" />
        )}
      </div>
      <p className="text-[10px] text-black/60 leading-relaxed mb-1">{p.contactText}</p>
      <p className="text-[10px] text-black/50">
        Vous recevez cet email car vous êtes client(e).{" "}
        <span className="underline">{p.unsubscribeLink}</span>
      </p>
    </div>
  );
}
```

- [ ] **Step 8 : Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -10
```

- [ ] **Step 9 : Commit**

```bash
cd /root/dashboarsn8n && git add components/email-builder/ && git commit -m "feat: add email builder visual block components"
```

---

## Task 7 — EmailBuilder composant principal + Canvas + ConfigPanel

**Files:**
- Create: `components/email-builder/EmailBuilder.tsx`
- Create: `components/email-builder/Canvas.tsx`
- Create: `components/email-builder/ConfigPanel.tsx`

- [ ] **Step 1 : Créer `components/email-builder/Canvas.tsx`**

```tsx
"use client";

import type { EmailBlock, EmailBlockType } from "@/types";
import HeaderBlock from "./blocks/HeaderBlock";
import HeroImageBlock from "./blocks/HeroImageBlock";
import IntroTextBlock from "./blocks/IntroTextBlock";
import TwoCardsBlock from "./blocks/TwoCardsBlock";
import DoubleCTABlock from "./blocks/DoubleCTABlock";
import NoteBlock from "./blocks/NoteBlock";
import FooterBlock from "./blocks/FooterBlock";
import type {
  HeaderBlockProps, HeroImageBlockProps, IntroTextBlockProps,
  TwoCardsBlockProps, DoubleCTABlockProps, NoteBlockProps, FooterBlockProps,
} from "@/types";

const BLOCK_LABELS: Record<EmailBlockType, string> = {
  header: "Header / Logos",
  "hero-image": "Hero Image",
  "intro-text": "Texte intro",
  "two-cards": "2 Cartes côte à côte",
  "double-cta": "Boutons CTA double",
  note: "Note / Encart",
  footer: "Footer",
};

interface CanvasProps {
  blocks: EmailBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onDelete: (id: string) => void;
  onAddBlock: () => void;
}

function renderBlock(block: EmailBlock) {
  switch (block.type) {
    case "header": return <HeaderBlock {...(block.props as HeaderBlockProps)} />;
    case "hero-image": return <HeroImageBlock {...(block.props as HeroImageBlockProps)} />;
    case "intro-text": return <IntroTextBlock {...(block.props as IntroTextBlockProps)} />;
    case "two-cards": return <TwoCardsBlock {...(block.props as TwoCardsBlockProps)} />;
    case "double-cta": return <DoubleCTABlock {...(block.props as DoubleCTABlockProps)} />;
    case "note": return <NoteBlock {...(block.props as NoteBlockProps)} />;
    case "footer": return <FooterBlock {...(block.props as FooterBlockProps)} />;
  }
}

export default function Canvas({ blocks, selectedId, onSelect, onMove, onDelete, onAddBlock }: CanvasProps) {
  return (
    <div className="flex-1 bg-muted overflow-y-auto flex flex-col items-center py-6 px-4">
      <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-4 self-start">
        APERÇU EMAIL (620px)
      </p>
      <div className="w-full max-w-[620px] shadow-2xl rounded overflow-hidden">
        {blocks.map((block, i) => (
          <div
            key={block.id}
            className={`relative cursor-pointer transition-all ${
              selectedId === block.id
                ? "outline outline-2 outline-blue-500 outline-offset-[-2px]"
                : "hover:outline hover:outline-1 hover:outline-border"
            }`}
            onClick={() => onSelect(block.id)}
          >
            {renderBlock(block)}
            {selectedId === block.id && (
              <div className="absolute top-0 right-0 flex gap-1 p-1 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(block.id, "up"); }}
                  disabled={i === 0}
                  className="bg-blue-600 disabled:bg-blue-900 disabled:opacity-40 text-white text-[10px] font-mono px-1.5 py-0.5 rounded"
                >⬆</button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(block.id, "down"); }}
                  disabled={i === blocks.length - 1}
                  className="bg-blue-600 disabled:bg-blue-900 disabled:opacity-40 text-white text-[10px] font-mono px-1.5 py-0.5 rounded"
                >⬇</button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                  className="bg-red-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded"
                >✕</button>
              </div>
            )}
            <div className="absolute bottom-0 left-0 bg-black/50 text-white text-[9px] font-mono px-2 py-0.5 pointer-events-none opacity-50">
              {BLOCK_LABELS[block.type]}
            </div>
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="bg-white h-48 flex items-center justify-center text-gray-400 text-sm">
            Ajoutez des blocs pour composer votre email
          </div>
        )}
      </div>

      <button
        onClick={onAddBlock}
        className="mt-4 bg-surface border border-dashed border-border rounded-lg px-6 py-2 font-mono text-xs text-dim hover:text-text hover:border-green transition-colors"
      >
        + Ajouter un bloc
      </button>
    </div>
  );
}
```

- [ ] **Step 2 : Créer `components/email-builder/ConfigPanel.tsx`**

```tsx
"use client";

import type { EmailBlock, EmailBlockType, CardItem } from "@/types";
import type {
  HeaderBlockProps, HeroImageBlockProps, IntroTextBlockProps,
  TwoCardsBlockProps, DoubleCTABlockProps, NoteBlockProps, FooterBlockProps,
} from "@/types";

interface ConfigPanelProps {
  block: EmailBlock | null;
  onChange: (id: string, props: Partial<EmailBlock["props"]>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] text-dim uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-muted border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:outline-none focus:border-green"
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 bg-muted border border-border rounded px-2 py-1.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
      />
      <span className="font-mono text-xs text-text">{value}</span>
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full py-1.5 rounded font-mono text-xs font-semibold transition-colors ${
        value ? "bg-green-dark text-white" : "bg-muted border border-border text-dim"
      }`}
    >
      {value ? "✓ " : ""}{label}
    </button>
  );
}

function CardConfig({ card, onChange }: { card: CardItem; onChange: (c: Partial<CardItem>) => void }) {
  return (
    <div className="space-y-2">
      <Field label="Fond carte"><ColorInput value={card.bgColor} onChange={(v) => onChange({ bgColor: v })} /></Field>
      <Field label="Fond header carte"><ColorInput value={card.headerBgColor} onChange={(v) => onChange({ headerBgColor: v })} /></Field>
      <Field label="Bordure header"><ColorInput value={card.headerBorderColor} onChange={(v) => onChange({ headerBorderColor: v })} /></Field>
      <Field label="Logo URL"><Input value={card.logoUrl} onChange={(v) => onChange({ logoUrl: v })} /></Field>
      <Field label="Montant (ex: -20€)"><Input value={card.amountText} onChange={(v) => onChange({ amountText: v })} /></Field>
      <Field label="Couleur montant"><ColorInput value={card.amountColor} onChange={(v) => onChange({ amountColor: v })} /></Field>
      <Field label="Sous-titre"><Input value={card.subtitle} onChange={(v) => onChange({ subtitle: v })} /></Field>
      <Field label="Détails (1 par ligne)">
        <textarea
          value={card.details.join("\n")}
          onChange={(e) => onChange({ details: e.target.value.split("\n") })}
          rows={3}
          className="w-full bg-muted border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:outline-none focus:border-green resize-none"
        />
      </Field>
      <Field label="CTA Label"><Input value={card.ctaLabel} onChange={(v) => onChange({ ctaLabel: v })} /></Field>
      <Field label="CTA Lien"><Input value={card.ctaHref} onChange={(v) => onChange({ ctaHref: v })} /></Field>
      <Field label="CTA couleur fond"><ColorInput value={card.ctaBgColor} onChange={(v) => onChange({ ctaBgColor: v })} /></Field>
      <Field label="CTA couleur texte"><ColorInput value={card.ctaTextColor} onChange={(v) => onChange({ ctaTextColor: v })} /></Field>
    </div>
  );
}

const BLOCK_LABELS: Record<EmailBlockType, string> = {
  header: "Header / Logos",
  "hero-image": "Hero Image",
  "intro-text": "Texte intro",
  "two-cards": "2 Cartes côte à côte",
  "double-cta": "Boutons CTA double",
  note: "Note / Encart",
  footer: "Footer",
};

export default function ConfigPanel({ block, onChange }: ConfigPanelProps) {
  if (!block) {
    return (
      <div className="w-56 bg-surface border-l border-border flex items-center justify-center flex-shrink-0">
        <p className="font-mono text-xs text-dim text-center px-4">
          Clique sur un bloc pour le configurer
        </p>
      </div>
    );
  }

  const update = (partial: Partial<EmailBlock["props"]>) => onChange(block.id, partial);

  return (
    <div className="w-56 bg-surface border-l border-border overflow-y-auto flex-shrink-0 p-3">
      <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3">
        CONFIG — {BLOCK_LABELS[block.type]}
      </p>
      <div className="space-y-3">
        {block.type === "header" && (() => {
          const p = block.props as HeaderBlockProps;
          return (
            <>
              <Field label="Couleur fond"><ColorInput value={p.bgColor} onChange={(v) => update({ bgColor: v })} /></Field>
              <Field label="Logo gauche URL"><Input value={p.logoLeftUrl} onChange={(v) => update({ logoLeftUrl: v })} /></Field>
              <Field label="Logo gauche lien"><Input value={p.logoLeftHref} onChange={(v) => update({ logoLeftHref: v })} /></Field>
              <Field label="Logo droit URL"><Input value={p.logoRightUrl} onChange={(v) => update({ logoRightUrl: v })} /></Field>
              <Field label="Logo droit lien"><Input value={p.logoRightHref} onChange={(v) => update({ logoRightHref: v })} /></Field>
              <Field label="Border radius (px)"><Input value={String(p.borderRadius)} onChange={(v) => update({ borderRadius: Number(v) || 0 })} /></Field>
              <Toggle value={p.showDivider} onChange={(v) => update({ showDivider: v })} label="Séparateur entre logos" />
            </>
          );
        })()}

        {block.type === "hero-image" && (() => {
          const p = block.props as HeroImageBlockProps;
          return (
            <>
              <Field label="URL de l'image"><Input value={p.imageUrl} onChange={(v) => update({ imageUrl: v })} /></Field>
              <Field label="Texte alternatif"><Input value={p.altText} onChange={(v) => update({ altText: v })} /></Field>
            </>
          );
        })()}

        {block.type === "intro-text" && (() => {
          const p = block.props as IntroTextBlockProps;
          return (
            <>
              <Field label="Contenu">
                <textarea
                  value={p.content}
                  onChange={(e) => update({ content: e.target.value })}
                  rows={5}
                  className="w-full bg-muted border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:outline-none focus:border-green resize-none"
                />
              </Field>
              <Field label="Alignement">
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => update({ align: a })}
                      className={`flex-1 py-1 rounded font-mono text-[10px] transition-colors ${
                        p.align === a ? "bg-green-dark text-white" : "bg-muted border border-border text-dim"
                      }`}
                    >
                      {a === "left" ? "⬅" : a === "center" ? "⬛" : "➡"}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          );
        })()}

        {block.type === "two-cards" && (() => {
          const p = block.props as TwoCardsBlockProps;
          return (
            <>
              <p className="font-mono text-[10px] text-green uppercase tracking-wider">Carte gauche</p>
              <CardConfig card={p.left} onChange={(c) => update({ left: { ...p.left, ...c } })} />
              <p className="font-mono text-[10px] text-green uppercase tracking-wider mt-3">Carte droite</p>
              <CardConfig card={p.right} onChange={(c) => update({ right: { ...p.right, ...c } })} />
              <Field label="Note cumulable (vide = masqué)">
                <textarea
                  value={p.cumulableNote}
                  onChange={(e) => update({ cumulableNote: e.target.value })}
                  rows={2}
                  className="w-full bg-muted border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:outline-none focus:border-green resize-none"
                />
              </Field>
            </>
          );
        })()}

        {block.type === "double-cta" && (() => {
          const p = block.props as DoubleCTABlockProps;
          return (
            <>
              <Field label="Titre"><Input value={p.title} onChange={(v) => update({ title: v })} /></Field>
              <Field label="Sous-titre"><Input value={p.subtitle} onChange={(v) => update({ subtitle: v })} /></Field>
              <p className="font-mono text-[10px] text-green uppercase tracking-wider">Bouton gauche</p>
              <Field label="Label"><Input value={p.ctaLeft.label} onChange={(v) => update({ ctaLeft: { ...p.ctaLeft, label: v } })} /></Field>
              <Field label="Lien"><Input value={p.ctaLeft.href} onChange={(v) => update({ ctaLeft: { ...p.ctaLeft, href: v } })} /></Field>
              <Field label="Couleur fond"><ColorInput value={p.ctaLeft.bgColor} onChange={(v) => update({ ctaLeft: { ...p.ctaLeft, bgColor: v } })} /></Field>
              <Field label="Couleur texte"><ColorInput value={p.ctaLeft.textColor} onChange={(v) => update({ ctaLeft: { ...p.ctaLeft, textColor: v } })} /></Field>
              <p className="font-mono text-[10px] text-green uppercase tracking-wider mt-2">Bouton droit</p>
              <Field label="Label"><Input value={p.ctaRight.label} onChange={(v) => update({ ctaRight: { ...p.ctaRight, label: v } })} /></Field>
              <Field label="Lien"><Input value={p.ctaRight.href} onChange={(v) => update({ ctaRight: { ...p.ctaRight, href: v } })} /></Field>
              <Field label="Couleur fond"><ColorInput value={p.ctaRight.bgColor} onChange={(v) => update({ ctaRight: { ...p.ctaRight, bgColor: v } })} /></Field>
              <Field label="Couleur texte"><ColorInput value={p.ctaRight.textColor} onChange={(v) => update({ ctaRight: { ...p.ctaRight, textColor: v } })} /></Field>
            </>
          );
        })()}

        {block.type === "note" && (() => {
          const p = block.props as NoteBlockProps;
          return (
            <>
              <Field label="Contenu">
                <textarea
                  value={p.content}
                  onChange={(e) => update({ content: e.target.value })}
                  rows={3}
                  className="w-full bg-muted border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:outline-none focus:border-green resize-none"
                />
              </Field>
              <Field label="Emoji"><Input value={p.emoji} onChange={(v) => update({ emoji: v })} /></Field>
              <Field label="Couleur fond"><ColorInput value={p.bgColor} onChange={(v) => update({ bgColor: v })} /></Field>
              <Field label="Couleur bordure gauche"><ColorInput value={p.borderColor} onChange={(v) => update({ borderColor: v })} /></Field>
            </>
          );
        })()}

        {block.type === "footer" && (() => {
          const p = block.props as FooterBlockProps;
          return (
            <>
              <Field label="Couleur fond"><ColorInput value={p.bgColor} onChange={(v) => update({ bgColor: v })} /></Field>
              <Field label="Logo gauche URL"><Input value={p.logoLeftUrl} onChange={(v) => update({ logoLeftUrl: v })} /></Field>
              <Field label="Logo gauche lien"><Input value={p.logoLeftHref} onChange={(v) => update({ logoLeftHref: v })} /></Field>
              <Field label="Logo droit URL"><Input value={p.logoRightUrl} onChange={(v) => update({ logoRightUrl: v })} /></Field>
              <Field label="Logo droit lien"><Input value={p.logoRightHref} onChange={(v) => update({ logoRightHref: v })} /></Field>
              <Field label="Texte contact"><Input value={p.contactText} onChange={(v) => update({ contactText: v })} /></Field>
              <Field label="Lien désabonnement"><Input value={p.unsubscribeLink} onChange={(v) => update({ unsubscribeLink: v })} /></Field>
              <Field label="Border radius (px)"><Input value={String(p.borderRadius)} onChange={(v) => update({ borderRadius: Number(v) || 0 })} /></Field>
            </>
          );
        })()}
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Créer `components/email-builder/EmailBuilder.tsx`**

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { EmailBlock, EmailBlockType } from "@/types";
import type {
  HeaderBlockProps, HeroImageBlockProps, IntroTextBlockProps,
  TwoCardsBlockProps, DoubleCTABlockProps, NoteBlockProps, FooterBlockProps,
} from "@/types";
import Canvas from "./Canvas";
import ConfigPanel from "./ConfigPanel";
import BlockCatalogue from "./BlockCatalogue";
import PreviewModal from "./PreviewModal";
import { generateEmailHtml } from "@/lib/email-html";
import { saveDraft, loadDraft, saveTemplate, getTemplates, deleteTemplate } from "@/lib/email-templates";
import type { EmailTemplate } from "@/types";

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const DEFAULT_PROPS: Record<EmailBlockType, EmailBlock["props"]> = {
  header: {
    bgColor: "#0078B8",
    logoLeftUrl: "", logoLeftHref: "https://",
    logoRightUrl: "", logoRightHref: "https://",
    showDivider: true, borderRadius: 12,
  } as HeaderBlockProps,
  "hero-image": { imageUrl: "", altText: "Image hero" } as HeroImageBlockProps,
  "intro-text": { content: "Votre texte introductif ici.", align: "center" } as IntroTextBlockProps,
  "two-cards": {
    left: {
      bgColor: "#1c1c1c", headerBgColor: "#A1D6B0", headerBorderColor: "#e0e0e0",
      logoUrl: "", amountText: "-20€", amountColor: "#ffffff",
      subtitle: "Description de l'offre gauche", details: ["Détail 1", "Détail 2"],
      ctaLabel: "Réserver →", ctaHref: "mailto:", ctaBgColor: "#ffffff", ctaTextColor: "#1c1c1c",
    },
    right: {
      bgColor: "#2d1800", headerBgColor: "#A1D6B0", headerBorderColor: "#F5A623",
      logoUrl: "", amountText: "-50€", amountColor: "#F5A623",
      subtitle: "Description de l'offre droite", details: ["Détail 1", "Détail 2"],
      ctaLabel: "Commander →", ctaHref: "mailto:", ctaBgColor: "#F5A623", ctaTextColor: "#1c1c1c",
    },
    cumulableNote: "💡 Ces deux offres sont cumulables.",
  } as TwoCardsBlockProps,
  "double-cta": {
    title: "Commandez sans attendre",
    subtitle: "Offre valable jusqu'au 30 avril",
    ctaLeft: { label: "✉ Écrire à gauche", href: "mailto:", bgColor: "#1c1c1c", textColor: "#ffffff" },
    ctaRight: { label: "✉ Écrire à droite", href: "mailto:", bgColor: "#F5A623", textColor: "#1c1c1c" },
  } as DoubleCTABlockProps,
  note: { content: "Contenu de la note.", bgColor: "#f6f9f4", borderColor: "#4a8c3f", emoji: "💡" } as NoteBlockProps,
  footer: {
    bgColor: "#0078B8",
    logoLeftUrl: "", logoLeftHref: "https://",
    logoRightUrl: "", logoRightHref: "https://",
    contactText: "Votre entreprise — contact@exemple.fr",
    unsubscribeLink: "{{ unsubscribe }}", borderRadius: 12,
  } as FooterBlockProps,
};

export default function EmailBuilder() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailName, setEmailName] = useState("Mon email");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft.length > 0) setBlocks(draft);
    setTemplates(getTemplates());
  }, []);

  useEffect(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => saveDraft(blocks), 500);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [blocks]);

  const addBlock = useCallback((type: EmailBlockType) => {
    const block: EmailBlock = { id: uuid(), type, props: { ...DEFAULT_PROPS[type] } };
    setBlocks((prev) => [...prev, block]);
    setSelectedId(block.id);
    setShowAddModal(false);
  }, []);

  const updateBlock = useCallback((id: string, partial: Partial<EmailBlock["props"]>) => {
    setBlocks((prev) =>
      prev.map((b) => b.id === id ? { ...b, props: { ...b.props, ...partial } } : b)
    );
  }, []);

  const moveBlock = useCallback((id: string, dir: "up" | "down") => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const copyHtml = useCallback(async () => {
    const html = generateEmailHtml(blocks);
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [blocks]);

  const handleSaveTemplate = useCallback(() => {
    const name = prompt("Nom du template :", emailName);
    if (!name) return;
    saveTemplate(name, blocks);
    setTemplates(getTemplates());
  }, [blocks, emailName]);

  const handleLoadTemplate = useCallback((t: EmailTemplate) => {
    setBlocks(t.blocks);
    setSelectedId(null);
    setShowAddModal(false);
  }, []);

  const handleDeleteTemplate = useCallback((id: string) => {
    deleteTemplate(id);
    setTemplates(getTemplates());
  }, []);

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Toolbar */}
      <div className="bg-surface border-b border-border h-12 flex items-center justify-between px-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="font-mono text-xs text-dim hover:text-text transition-colors"
          >
            ← Dashboard
          </button>
          <span className="text-border">|</span>
          <span className="text-green text-xs font-mono">✉</span>
          <input
            value={emailName}
            onChange={(e) => setEmailName(e.target.value)}
            className="font-mono text-sm text-text bg-transparent border-none outline-none w-48"
          />
          <span className="bg-green-dark text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
            Nouveau
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-muted border border-border rounded px-3 py-1.5 font-mono text-xs text-dim hover:text-text transition-colors"
          >
            👁 Prévisualiser
          </button>
          <button
            onClick={copyHtml}
            className="bg-muted border border-border rounded px-3 py-1.5 font-mono text-xs text-dim hover:text-text transition-colors"
          >
            {copied ? "✓ Copié !" : "📋 Copier HTML"}
          </button>
          <button
            onClick={handleSaveTemplate}
            className="bg-green-dark text-white rounded px-3 py-1.5 font-mono text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            💾 Sauvegarder
          </button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        <BlockCatalogue
          onAddBlock={addBlock}
          templates={templates}
          onLoadTemplate={handleLoadTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
        <Canvas
          blocks={blocks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={moveBlock}
          onDelete={deleteBlock}
          onAddBlock={() => setShowAddModal(true)}
        />
        <ConfigPanel block={selectedBlock} onChange={updateBlock} />
      </div>

      {showPreview && (
        <PreviewModal html={generateEmailHtml(blocks)} onClose={() => setShowPreview(false)} />
      )}

      {showAddModal && (
        <BlockCatalogue
          onAddBlock={addBlock}
          templates={templates}
          onLoadTemplate={handleLoadTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          asModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4 : Commit**

```bash
cd /root/dashboarsn8n && git add components/email-builder/EmailBuilder.tsx components/email-builder/Canvas.tsx components/email-builder/ConfigPanel.tsx && git commit -m "feat: add email builder main component, canvas, config panel"
```

---

## Task 8 — BlockCatalogue + PreviewModal + page email-builder

**Files:**
- Create: `components/email-builder/BlockCatalogue.tsx`
- Create: `components/email-builder/PreviewModal.tsx`
- Create: `app/email-builder/page.tsx`

- [ ] **Step 1 : Créer `components/email-builder/BlockCatalogue.tsx`**

```tsx
"use client";

import type { EmailBlockType, EmailTemplate } from "@/types";

const BLOCKS: { type: EmailBlockType; icon: string; label: string }[] = [
  { type: "header", icon: "⬛", label: "Header / Logos" },
  { type: "hero-image", icon: "🖼", label: "Hero Image" },
  { type: "intro-text", icon: "📄", label: "Texte intro" },
  { type: "two-cards", icon: "🃏", label: "2 Cartes côte à côte" },
  { type: "double-cta", icon: "🔘", label: "Boutons CTA double" },
  { type: "note", icon: "ℹ️", label: "Note / Encart" },
  { type: "footer", icon: "📫", label: "Footer" },
];

interface BlockCatalogueProps {
  onAddBlock: (type: EmailBlockType) => void;
  templates: EmailTemplate[];
  onLoadTemplate: (t: EmailTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  asModal?: boolean;
  onClose?: () => void;
}

function BlockList({ onAddBlock }: { onAddBlock: (type: EmailBlockType) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {BLOCKS.map((b) => (
        <button
          key={b.type}
          onClick={() => onAddBlock(b.type)}
          className="flex items-center gap-2 bg-muted border border-border rounded px-2 py-2 text-left hover:border-green transition-colors group"
        >
          <span className="text-sm">{b.icon}</span>
          <span className="font-mono text-xs text-text group-hover:text-green transition-colors">
            {b.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function BlockCatalogue({
  onAddBlock, templates, onLoadTemplate, onDeleteTemplate, asModal, onClose,
}: BlockCatalogueProps) {
  if (asModal) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-surface border border-border rounded-xl p-5 w-72" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-sm text-text font-semibold">Ajouter un bloc</p>
            <button onClick={onClose} className="text-dim hover:text-text font-mono text-xs">✕</button>
          </div>
          <BlockList onAddBlock={onAddBlock} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-48 bg-surface border-r border-border flex flex-col p-3 flex-shrink-0 overflow-y-auto">
      <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3">
        Blocs disponibles
      </p>
      <BlockList onAddBlock={onAddBlock} />

      {templates.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-2">
            Mes templates
          </p>
          <div className="flex flex-col gap-1">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center gap-1">
                <button
                  onClick={() => onLoadTemplate(t)}
                  className="flex-1 text-left bg-muted border border-border rounded px-2 py-1.5 font-mono text-xs text-dim hover:text-text hover:border-green transition-colors truncate"
                >
                  {t.name}
                </button>
                <button
                  onClick={() => onDeleteTemplate(t.id)}
                  className="text-dim hover:text-red-400 font-mono text-xs px-1 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2 : Créer `components/email-builder/PreviewModal.tsx`**

```tsx
"use client";

interface PreviewModalProps {
  html: string;
  onClose: () => void;
}

export default function PreviewModal({ html, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="bg-surface border-b border-border h-12 flex items-center justify-between px-6 flex-shrink-0">
        <span className="font-mono text-sm text-text">Prévisualisation</span>
        <button
          onClick={onClose}
          className="font-mono text-xs text-dim hover:text-text transition-colors bg-muted border border-border rounded px-3 py-1.5"
        >
          ✕ Fermer
        </button>
      </div>
      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <iframe
          srcDoc={html}
          className="w-full max-w-[680px] border border-border rounded-lg"
          style={{ height: "max-content", minHeight: "600px" }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Créer `app/email-builder/page.tsx`**

```tsx
import EmailBuilder from "@/components/email-builder/EmailBuilder";

export default function EmailBuilderPage() {
  return <EmailBuilder />;
}
```

- [ ] **Step 4 : Vérifier le build complet**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -20
```

Expected : build success, 0 erreurs.

- [ ] **Step 5 : Commit final**

```bash
cd /root/dashboarsn8n && git add components/email-builder/BlockCatalogue.tsx components/email-builder/PreviewModal.tsx app/email-builder/ && git commit -m "feat: complete email builder - catalogue, preview modal, page route"
```

---

## Self-Review

### Spec coverage
- ✅ Dashboard style GitHub/Admin (palette, sidebar, header fixe, stats bar, grille)
- ✅ Sidebar icônes avec expand hover + badge NEW
- ✅ Email Builder route `/email-builder`
- ✅ 7 blocs : header, hero-image, intro-text, two-cards, double-cta, note, footer
- ✅ Interface 3 colonnes : catalogue | canvas | config
- ✅ Contrôles ⬆⬇✕ sur chaque bloc sélectionné
- ✅ Modal "+ Ajouter un bloc"
- ✅ Prévisualisation fullscreen (iframe)
- ✅ Copier HTML (clipboard)
- ✅ Sauvegarder/charger/supprimer templates (localStorage, max 20)
- ✅ Auto-save draft (debounce 500ms)
- ✅ Adapter settings/page.tsx au nouveau style

### Type consistency
- `EmailBlock`, `EmailBlockType`, `EmailTemplate`, `CardItem` définis en Task 1 ✅
- `DEFAULT_PROPS` couvre les 7 types ✅
- `BLOCK_LABELS` identique dans `Canvas.tsx` et `ConfigPanel.tsx` ✅
- `renderBlockHtml` couvre tous les types ✅
- `IntroTextBlock` utilise `{p.content}` (texte brut, pas de HTML) — pas de XSS ✅
- `FooterBlock` affiche `unsubscribeLink` comme texte (pas de `<a>` cliquable dans le canvas) ✅
