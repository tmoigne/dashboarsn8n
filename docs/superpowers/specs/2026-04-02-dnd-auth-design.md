# Drag & Drop + Auth System — Design Spec

**Date:** 2026-04-02
**Status:** Approved

---

## 1. Drag & Drop (Email Builder)

Ajout du drag & drop pour réordonner les blocs dans le canvas de l'email builder.

### Librairie
`@dnd-kit/core` + `@dnd-kit/sortable` — moderne, compatible Next.js App Router, zéro dépendance native.

### Changements
- `Canvas.tsx` : wrap la liste de blocs dans `SortableContext`, chaque bloc devient un `SortableItem` avec `useSortable`
- Les boutons ⬆⬇ restent comme fallback accessible
- Le drag déclenche `onReorder(newOrder: EmailBlock[])` remonté au `EmailBuilder.tsx`
- Curseur `grab` sur hover, `grabbing` pendant le drag
- Overlay visuel pendant le drag (bloc semi-transparent)

---

## 2. Auth System

### Stack
- **NextAuth.js v5** — gestion sessions, CredentialsProvider
- **Prisma** — ORM
- **SQLite** — base de données locale (fichier `prisma/db.sqlite`)
- **bcryptjs** — hash des mots de passe

### Schéma Prisma

```prisma
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
  blocks    String   // JSON stringifié
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

### Routes

| Route | Accès | Description |
|-------|-------|-------------|
| `/login` | Public | Page de connexion (style A, sans sidebar) |
| `/` | Authentifié | Dashboard |
| `/email-builder` | Authentifié | Email builder |
| `/settings` | Authentifié | Paramètres |
| `/admin/users` | Admin uniquement | Gestion des comptes |

### Middleware

`middleware.ts` à la racine — intercepte toutes les requêtes :
- Si non authentifié → redirect `/login`
- Si route `/admin/*` et role !== "admin" → redirect `/`
- Route `/login` toujours publique

### Page Login (`/login`)

- Card centrée sur fond `#0d1117`
- Logo N + titre "N8N Dashboard"
- Champs email + mot de passe
- Bouton "Se connecter" vert
- Message d'erreur si credentials invalides
- Pas de sidebar, pas de header

### Page Admin (`/admin/users`)

- Liste des utilisateurs (nom, email, rôle, date création)
- Formulaire inline : créer un compte (nom, email, mot de passe, rôle)
- Bouton supprimer par utilisateur (confirmation)
- Lien dans la sidebar visible uniquement pour les admins

### API Templates

Remplacement de localStorage par des routes API :

| Méthode | Route | Action |
|---------|-------|--------|
| GET | `/api/templates` | Liste les templates de l'utilisateur connecté |
| POST | `/api/templates` | Crée un template |
| DELETE | `/api/templates/[id]` | Supprime un template (propriétaire uniquement) |

`lib/email-templates.ts` : remplace toutes les fonctions localStorage par des `fetch` vers ces routes.

### Draft

Le draft auto-sauvegardé reste en localStorage (pas besoin de sync — c'est un état temporaire de session).

### Premier démarrage

Variable d'environnement `ADMIN_EMAIL` + `ADMIN_PASSWORD` + `ADMIN_NAME` dans `.env` : si aucun user en base au démarrage, un compte admin est créé automatiquement via un script `scripts/seed.ts`.

### Variables d'environnement

```env
NEXTAUTH_SECRET=<random_string>
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./db.sqlite"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme
ADMIN_NAME=Admin
```

---

## 3. Fichiers créés / modifiés

### Nouveaux fichiers
```
prisma/schema.prisma
prisma/db.sqlite              (généré)
scripts/seed.ts
middleware.ts
app/login/page.tsx
app/login/LoginForm.tsx
app/admin/users/page.tsx
app/admin/users/UsersClient.tsx
app/api/auth/[...nextauth]/route.ts
app/api/templates/route.ts
app/api/templates/[id]/route.ts
app/api/admin/users/route.ts
app/api/admin/users/[id]/route.ts
lib/auth.ts                   (config NextAuth)
lib/prisma.ts                 (singleton Prisma client)
```

### Fichiers modifiés
```
components/Canvas.tsx          (dnd-kit)
components/email-builder/EmailBuilder.tsx  (onReorder handler)
lib/email-templates.ts         (localStorage → fetch)
components/Sidebar.tsx         (lien Admin conditionnel)
app/layout.tsx                 (SessionProvider)
package.json                   (nouvelles dépendances)
```

---

## 4. Hors scope

- Récupération de mot de passe (reset par email)
- OAuth (Google, GitHub)
- Pagination des templates
- Rôles granulaires (juste admin/user)
