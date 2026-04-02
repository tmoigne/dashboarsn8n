# Drag & Drop + Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter le drag & drop dans l'email builder et un système d'authentification multi-comptes avec stockage des templates en base de données.

**Architecture:** dnd-kit/sortable pour le drag & drop dans Canvas.tsx ; NextAuth v5 avec CredentialsProvider + Prisma + SQLite pour l'auth ; les templates migrent de localStorage vers des routes API authentifiées.

**Tech Stack:** @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, next-auth@beta, @prisma/client, prisma, bcryptjs, @types/bcryptjs, tsx

---

## Task 1: Drag & Drop — installer dnd-kit et refactorer Canvas

**Files:**
- Modify: `components/email-builder/Canvas.tsx`
- Modify: `components/email-builder/EmailBuilder.tsx`

- [ ] **Step 1: Installer les dépendances**

```bash
cd /root/dashboarsn8n
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Réécrire Canvas.tsx avec drag & drop**

Remplacer le contenu complet de `components/email-builder/Canvas.tsx` :

```tsx
"use client";

import type { EmailBlock } from "@/types";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import HeaderBlock from "./blocks/HeaderBlock";
import HeroImageBlock from "./blocks/HeroImageBlock";
import IntroTextBlock from "./blocks/IntroTextBlock";
import TwoCardsBlock from "./blocks/TwoCardsBlock";
import DoubleCTABlock from "./blocks/DoubleCTABlock";
import NoteBlock from "./blocks/NoteBlock";
import FooterBlock from "./blocks/FooterBlock";

function BlockPreview({ block }: { block: EmailBlock }) {
  switch (block.type) {
    case "header":     return <HeaderBlock props={block.props} />;
    case "hero-image": return <HeroImageBlock props={block.props} />;
    case "intro-text": return <IntroTextBlock props={block.props} />;
    case "two-cards":  return <TwoCardsBlock props={block.props} />;
    case "double-cta": return <DoubleCTABlock props={block.props} />;
    case "note":       return <NoteBlock props={block.props} />;
    case "footer":     return <FooterBlock props={block.props} />;
  }
}

interface SortableBlockProps {
  block: EmailBlock;
  index: number;
  total: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
}

function SortableBlock({ block, index, total, selected, onSelect, onMoveUp, onMoveDown, onRemove }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    outline: selected ? "2px solid #58a6ff" : "2px solid transparent",
    outlineOffset: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative cursor-pointer"
      onClick={() => onSelect(block.id)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 bg-[#161b22] border border-border text-dim hover:text-text p-0.5 rounded cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
        title="Glisser pour réordonner"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
          <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
          <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
        </svg>
      </div>

      {/* Controls */}
      <div
        className={`absolute top-1 right-1 flex gap-1 z-10 transition-opacity ${selected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {index > 0 && (
          <button onClick={() => onMoveUp(block.id)} className="bg-[#161b22] border border-border text-dim hover:text-text p-0.5 rounded">
            <ChevronUp size={14} />
          </button>
        )}
        {index < total - 1 && (
          <button onClick={() => onMoveDown(block.id)} className="bg-[#161b22] border border-border text-dim hover:text-text p-0.5 rounded">
            <ChevronDown size={14} />
          </button>
        )}
        <button onClick={() => onRemove(block.id)} className="bg-[#161b22] border border-border text-dim hover:text-red-400 p-0.5 rounded">
          <X size={14} />
        </button>
      </div>

      <BlockPreview block={block} />
    </div>
  );
}

interface Props {
  blocks: EmailBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (blocks: EmailBlock[]) => void;
}

export default function Canvas({ blocks, selectedId, onSelect, onMoveUp, onMoveDown, onRemove, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    onReorder(arrayMove(blocks, oldIndex, newIndex));
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#2d333b] flex flex-col items-center py-8 px-4">
      {blocks.length === 0 && (
        <div className="mt-24 text-dim text-sm text-center">
          <p className="text-4xl mb-4">✉</p>
          <p>Ajoutez des blocs depuis le catalogue</p>
        </div>
      )}
      <div style={{ width: 620, maxWidth: "100%" }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block, i) => (
              <SortableBlock
                key={block.id}
                block={block}
                index={i}
                total={blocks.length}
                selected={block.id === selectedId}
                onSelect={onSelect}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Ajouter onReorder dans EmailBuilder.tsx**

Dans `components/email-builder/EmailBuilder.tsx`, ajouter le handler `reorder` après `moveDown` :

```tsx
const reorder = useCallback((newBlocks: EmailBlock[]) => {
  setBlocks(newBlocks);
}, []);
```

Puis modifier le JSX `<Canvas ... />` pour ajouter `onReorder={reorder}` :

```tsx
<Canvas
  blocks={blocks}
  selectedId={selectedId}
  onSelect={setSelectedId}
  onMoveUp={moveUp}
  onMoveDown={moveDown}
  onRemove={removeBlock}
  onReorder={reorder}
/>
```

- [ ] **Step 4: Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -20
```

Résultat attendu : `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add components/email-builder/Canvas.tsx components/email-builder/EmailBuilder.tsx package.json package-lock.json
git commit -m "feat: add drag & drop reordering to email builder canvas"
```

---

## Task 2: Prisma + SQLite — schéma et client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `scripts/seed.ts`

- [ ] **Step 1: Installer les dépendances auth + db**

```bash
cd /root/dashboarsn8n
npm install next-auth@beta @prisma/client bcryptjs
npm install -D prisma @types/bcryptjs tsx
```

- [ ] **Step 2: Créer prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String          @id @default(cuid())
  email     String          @unique
  password  String
  name      String
  role      String          @default("user")
  createdAt DateTime        @default(now())
  templates EmailTemplate[]
}

model EmailTemplate {
  id        String   @id @default(cuid())
  name      String
  blocks    String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

- [ ] **Step 3: Créer lib/prisma.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error"] : [] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Créer .env**

```bash
cat > /root/dashboarsn8n/.env << 'EOF'
DATABASE_URL="file:./prisma/db.sqlite"
NEXTAUTH_SECRET=change_this_to_a_random_64_char_string
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin1234!
ADMIN_NAME=Admin
EOF
```

- [ ] **Step 5: Générer le client Prisma et la base**

```bash
cd /root/dashboarsn8n
npx prisma generate
npx prisma db push
```

Résultat attendu : `Your database is now in sync with your Prisma schema.`

- [ ] **Step 6: Créer scripts/seed.ts**

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log("Base déjà initialisée, seed ignoré.");
    return;
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin1234!";
  const name = process.env.ADMIN_NAME ?? "Admin";

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, password: hashed, name, role: "admin" } });
  console.log(`Admin créé : ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 7: Ajouter script seed dans package.json**

Dans `package.json`, dans la section `"scripts"`, ajouter :

```json
"seed": "tsx scripts/seed.ts"
```

- [ ] **Step 8: Lancer le seed**

```bash
cd /root/dashboarsn8n && npm run seed
```

Résultat attendu : `Admin créé : admin@example.com`

- [ ] **Step 9: Commit**

```bash
git add prisma/schema.prisma lib/prisma.ts scripts/seed.ts package.json package-lock.json
git commit -m "feat: add Prisma SQLite schema and seed script"
```

---

## Task 3: NextAuth — configuration et route

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `types/next-auth.d.ts`

- [ ] **Step 1: Créer lib/auth.ts**

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as { role: string }).role = token.role as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
```

- [ ] **Step 2: Créer app/api/auth/[...nextauth]/route.ts**

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Créer types/next-auth.d.ts**

```typescript
import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```

- [ ] **Step 4: Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -20
```

Résultat attendu : `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts app/api/auth/ types/next-auth.d.ts
git commit -m "feat: configure NextAuth with credentials provider"
```

---

## Task 4: Middleware de protection des routes

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Créer middleware.ts à la racine**

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -20
```

Résultat attendu : `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware protecting all routes"
```

---

## Task 5: Page de login

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/login/LoginForm.tsx`
- Create: `components/ConditionalLayout.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Créer app/login/LoginForm.tsx**

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-dim text-[10px] uppercase tracking-widest font-mono mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-green"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label className="block text-dim text-[10px] uppercase tracking-widest font-mono mb-1">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-green"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-dark hover:bg-green text-white font-semibold py-2 rounded text-sm transition-colors disabled:opacity-60"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Créer app/login/page.tsx**

```tsx
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-green-dark flex items-center justify-center mb-3">
            <span className="text-white font-mono font-bold text-base">N</span>
          </div>
          <h1 className="text-text font-semibold text-base">N8N Dashboard</h1>
          <p className="text-dim text-xs mt-1">Occitinfo</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Créer components/ConditionalLayout.tsx**

```tsx
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;
  return (
    <>
      <Sidebar />
      <div className="pl-14">{children}</div>
    </>
  );
}
```

- [ ] **Step 4: Modifier app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  title: "N8N Dashboard — Occitinfo",
  description: "Interface d'automatisation connectée à n8n",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-bg text-text">
        <SessionProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -20
```

Résultat attendu : `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add app/login/ components/ConditionalLayout.tsx app/layout.tsx
git commit -m "feat: add login page and conditional sidebar layout"
```

---

## Task 6: API Templates (remplace localStorage)

**Files:**
- Create: `app/api/templates/route.ts`
- Create: `app/api/templates/[id]/route.ts`
- Modify: `lib/email-templates.ts`
- Modify: `components/email-builder/EmailBuilder.tsx`

- [ ] **Step 1: Créer app/api/templates/route.ts**

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.emailTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return NextResponse.json(
    templates.map(t => ({
      id: t.id,
      name: t.name,
      blocks: JSON.parse(t.blocks),
      updatedAt: t.updatedAt.getTime(),
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, blocks } = await req.json();
  if (!name || !blocks) return NextResponse.json({ error: "name et blocks requis" }, { status: 400 });

  const template = await prisma.emailTemplate.create({
    data: { name, blocks: JSON.stringify(blocks), userId: session.user.id },
  });

  return NextResponse.json({
    id: template.id,
    name: template.name,
    blocks,
    updatedAt: template.updatedAt.getTime(),
  });
}
```

- [ ] **Step 2: Créer app/api/templates/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template || template.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.emailTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Réécrire lib/email-templates.ts**

```typescript
import type { EmailBlock, EmailTemplate } from "@/types";

const DRAFT_KEY = "email_builder_draft";

export function saveDraft(blocks: EmailBlock[]): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(blocks));
}

export function loadDraft(): EmailBlock[] | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function loadTemplates(): Promise<EmailTemplate[]> {
  try {
    const res = await fetch("/api/templates");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function saveTemplate(name: string, blocks: EmailBlock[]): Promise<EmailTemplate> {
  const res = await fetch("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, blocks }),
  });
  return res.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetch(`/api/templates/${id}`, { method: "DELETE" });
}
```

- [ ] **Step 4: Adapter EmailBuilder.tsx pour les fonctions async**

Dans `components/email-builder/EmailBuilder.tsx`, remplacer le useEffect de chargement :

```tsx
useEffect(() => {
  const draft = loadDraft();
  if (draft && draft.length > 0) setBlocks(draft);
  loadTemplates().then(setTemplates);
}, []);
```

Remplacer `handleSaveTemplate` :

```tsx
const handleSaveTemplate = async () => {
  const name = prompt("Nom du template :", emailName);
  if (!name) return;
  await saveTemplate(name, blocks);
  const updated = await loadTemplates();
  setTemplates(updated);
};
```

Remplacer `handleDeleteTemplate` :

```tsx
const handleDeleteTemplate = async (id: string) => {
  await deleteTemplate(id);
  const updated = await loadTemplates();
  setTemplates(updated);
};
```

- [ ] **Step 5: Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -20
```

Résultat attendu : `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add app/api/templates/ lib/email-templates.ts components/email-builder/EmailBuilder.tsx
git commit -m "feat: migrate templates from localStorage to database API"
```

---

## Task 7: Page admin gestion des utilisateurs

**Files:**
- Create: `app/admin/users/page.tsx`
- Create: `app/admin/users/UsersClient.tsx`
- Create: `app/api/admin/users/route.ts`
- Create: `app/api/admin/users/[id]/route.ts`
- Modify: `components/Sidebar.tsx`

- [ ] **Step 1: Créer app/api/admin/users/route.ts**

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, password, name, role } = await req.json();
  if (!email || !password || !name) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: role === "admin" ? "admin" : "user" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return NextResponse.json(user);
}
```

- [ ] **Step 2: Créer app/api/admin/users/[id]/route.ts**

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Impossible de supprimer son propre compte" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Créer app/admin/users/UsersClient.tsx**

```tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Props {
  initialUsers: User[];
  currentUserId: string;
}

export default function UsersClient({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setUsers(prev => [...prev, data]);
    setForm({ name: "", email: "", password: "", role: "user" });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  const inputCls = "w-full bg-bg border border-border rounded px-2 py-1.5 text-text text-xs font-mono focus:outline-none focus:border-green";

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-text text-lg font-semibold mb-6">Gestion des comptes</h1>

      <div className="bg-surface border border-border rounded-lg mb-8 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-dim text-xs font-mono uppercase tracking-widest">Nom</th>
              <th className="text-left px-4 py-3 text-dim text-xs font-mono uppercase tracking-widest">Email</th>
              <th className="text-left px-4 py-3 text-dim text-xs font-mono uppercase tracking-widest">Rôle</th>
              <th className="text-left px-4 py-3 text-dim text-xs font-mono uppercase tracking-widest">Créé le</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
                <td className="px-4 py-3 text-text">{u.name}</td>
                <td className="px-4 py-3 text-dim font-mono text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-green-dark text-white" : "bg-muted text-dim"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-dim text-xs">{new Date(u.createdAt).toLocaleDateString("fr")}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUserId && (
                    <button onClick={() => handleDelete(u.id, u.name)} className="text-dim hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-text text-sm font-semibold mb-4">Créer un compte</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-dim text-[10px] uppercase tracking-widest font-mono mb-1">Nom</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-dim text-[10px] uppercase tracking-widest font-mono mb-1">Email</label>
            <input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-dim text-[10px] uppercase tracking-widest font-mono mb-1">Mot de passe</label>
            <input type="password" className={inputCls} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
          </div>
          <div>
            <label className="block text-dim text-[10px] uppercase tracking-widest font-mono mb-1">Rôle</label>
            <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          {error && <p className="col-span-2 text-red-400 text-xs">{error}</p>}
          <div className="col-span-2">
            <button type="submit" disabled={loading} className="bg-green-dark hover:bg-green text-white text-xs font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60">
              {loading ? "Création…" : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Créer app/admin/users/page.tsx**

```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/");

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <UsersClient
      initialUsers={users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      currentUserId={session.user.id}
    />
  );
}
```

- [ ] **Step 5: Mettre à jour components/Sidebar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const NAV = [
  { href: "/", icon: "⬡", label: "Dashboard" },
  { href: "/email-builder", icon: "✉", label: "Email Builder", isNew: true },
  { href: "/settings", icon: "⚙", label: "Paramètres" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const nav = isAdmin
    ? [...NAV, { href: "/admin/users", icon: "👤", label: "Utilisateurs" }]
    : NAV;

  return (
    <aside className="fixed left-0 top-0 h-full w-14 bg-surface border-r border-border flex flex-col items-center py-4 gap-1 z-40 group hover:w-48 transition-all duration-200 overflow-hidden">
      <div className="w-8 h-8 rounded-lg bg-green-dark flex items-center justify-center mb-4 flex-shrink-0">
        <span className="text-white font-mono font-bold text-sm">N</span>
      </div>
      <nav className="flex flex-col gap-1 w-full px-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                active
                  ? "bg-muted border-l-2 border-green text-text"
                  : "border-l-2 border-transparent text-dim hover:text-text hover:bg-muted"
              }`}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
              <span className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-2">
                {item.label}
                {"isNew" in item && item.isNew && (
                  <span className="bg-green-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
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

- [ ] **Step 6: Vérifier le build**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -20
```

Résultat attendu : `✓ Compiled successfully`

- [ ] **Step 7: Commit**

```bash
git add app/admin/ app/api/admin/ components/Sidebar.tsx
git commit -m "feat: add admin users management page"
```

---

## Task 8: Dockerfile production + push GitHub

**Files:**
- Modify: `Dockerfile`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Mettre à jour le Dockerfile**

Remplacer le stage `runner` complet dans `Dockerfile` :

```dockerfile
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p ./public
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD sh -c "npx prisma db push --skip-generate && npx tsx scripts/seed.ts && node server.js"
```

- [ ] **Step 2: Créer .env.example**

```
DATABASE_URL="file:./prisma/db.sqlite"
NEXTAUTH_SECRET=change_this_to_a_random_64_char_string
NEXTAUTH_URL=https://your-domain.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin1234!
ADMIN_NAME=Admin
```

- [ ] **Step 3: Mettre à jour .gitignore**

```bash
echo ".env" >> /root/dashboarsn8n/.gitignore
echo "prisma/db.sqlite" >> /root/dashboarsn8n/.gitignore
```

- [ ] **Step 4: Build final**

```bash
cd /root/dashboarsn8n && npm run build 2>&1 | tail -10
```

Résultat attendu : `✓ Compiled successfully`

- [ ] **Step 5: Push GitHub**

```bash
git add Dockerfile .env.example .gitignore package.json
git commit -m "feat: configure Dockerfile for production with Prisma and auth"
git push origin main
```

---

## Variables d'environnement Dokploy

À configurer dans Dokploy → Environment Variables :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `file:./prisma/db.sqlite` |
| `NEXTAUTH_SECRET` | Chaîne aléatoire 64 caractères |
| `NEXTAUTH_URL` | URL publique du service (ex: `https://n8n.occitinfo.fr`) |
| `ADMIN_EMAIL` | Email du premier admin |
| `ADMIN_PASSWORD` | Mot de passe du premier admin |
| `ADMIN_NAME` | Nom du premier admin |
