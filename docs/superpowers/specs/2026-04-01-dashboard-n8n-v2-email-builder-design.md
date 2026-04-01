# Dashboard n8n v2 + Email Builder — Design Spec

**Date:** 2026-04-01
**Status:** Approved

---

## 1. Objectif

Refondre l'interface du dashboard n8n avec un style professionnel de type GitHub/Admin, et ajouter un Email Builder intégré permettant de créer des emails HTML transactionnels/promotionnels par assemblage de blocs configurables.

---

## 2. Dashboard — Redesign (Style GitHub/Admin)

### 2.1 Palette de couleurs

| Token | Valeur | Usage |
|-------|--------|-------|
| `bg` | `#0d1117` | Fond global |
| `surface` | `#161b22` | Cards, panels, sidebar |
| `border` | `#30363d` | Bordures |
| `text` | `#c9d1d9` | Texte principal |
| `dim` | `#8b949e` | Texte secondaire, labels |
| `green` | `#3fb950` | Succès, indicateurs positifs |
| `green-dark` | `#238636` | Boutons primaires, badges |
| `accent` | `#238636` | CTA principal |

Remplacement complet de l'ancienne palette (`#0a0a0a` / `#ff6b35`).

### 2.2 Layout global

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (56px fixe, gauche)                        │
│  Logo N8N | Dashboard | Email Builder | Historique  │
│  | Settings                                         │
├─────────────────────────────────────────────────────┤
│  HEADER FIXE (48px)                                 │
│  Titre page | Instance switcher | Stats rapides     │
├─────────────────────────────────────────────────────┤
│  CONTENU PRINCIPAL                                  │
│  Stats bar (3-4 métriques)                          │
│  Grille de tâches (cards denses)                    │
└─────────────────────────────────────────────────────┘
```

### 2.3 Sidebar

- Largeur fixe : 56px (icônes seules), expand au hover en 200px avec labels
- Items : Dashboard, Email Builder (badge NEW), Historique, Paramètres
- Icônes Lucide React
- Item actif : fond `#21262d`, bordure gauche `#238636`

### 2.4 Header fixe

- Hauteur : 48px, fond `#161b22`, bordure bas `#30363d`
- Gauche : titre de la page courante
- Centre : Instance switcher (dropdown, instance active en vert)
- Droite : 2-3 stats compactes (ex: "247 tâches · 98% succès")

### 2.5 Stats bar (page principale)

4 métriques en cards horizontales :
- Total tâches exécutées
- Taux de succès (%)
- Dernière exécution (timestamp relatif)
- Instance active

### 2.6 Grille de tâches

- Cards plus denses : icône (24px) + titre + description courte + badge catégorie
- Indicateur de statut coloré (point vert = disponible)
- Card Email Builder : mise en avant avec badge "NEW" vert, fond légèrement différent
- Hover : `border-color: #238636`, transition 150ms
- Layout responsive : 3 colonnes large → 2 → 1

---

## 3. Email Builder — Nouvelle route `/email-builder`

### 3.1 Architecture

Nouveau fichier de page : `app/email-builder/page.tsx`
Composant principal : `components/email-builder/EmailBuilder.tsx`
Blocs : `components/email-builder/blocks/` (un fichier par bloc)
Types : extension de `types/index.ts`
Stockage : localStorage (`email_builder_templates`, `email_builder_draft`)

### 3.2 Layout interface

```
┌──────────────────────────────────────────────────────────────────┐
│  TOOLBAR: ← Dashboard | [nom email] | 👁 Preview | 📋 HTML | 💾 │
├──────────────┬──────────────────────────────┬────────────────────┤
│ BLOCS (190px)│      CANVAS (flex:1)         │  CONFIG (220px)    │
│              │  Aperçu email 620px centré   │  Panel du bloc     │
│ Catalogue    │  Blocs avec contrôles ⬆⬇✕   │  sélectionné       │
│ 7 blocs      │  + Ajouter un bloc           │                    │
│              │                              │  Champs selon      │
│ Mes templates│                              │  type de bloc      │
└──────────────┴──────────────────────────────┴────────────────────┘
```

### 3.3 Blocs disponibles

#### `HeaderBlock` — Header double logo
Champs : `bgColor`, `logoLeft.url`, `logoLeft.href`, `logoRight.url`, `logoRight.href`, `showDivider`, `borderRadius`

#### `HeroImageBlock` — Image hero pleine largeur
Champs : `imageUrl`, `altText`

#### `IntroTextBlock` — Texte introductif
Champs : `content` (textarea), `align` (left/center/right)

#### `TwoCardsBlock` — 2 cartes côte à côte
Champs par carte (left/right) : `bgColor`, `headerBgColor`, `headerBorderColor`, `logoUrl`, `amountText`, `amountColor`, `subtitle`, `details` (tableau de strings), `ctaLabel`, `ctaHref`, `ctaBgColor`, `ctaTextColor`
Champ global : `cumulableNote` (texte encart vert en bas, vide = masqué)

#### `DoubleCTABlock` — Boutons CTA double
Champs : `title`, `subtitle`, `ctaLeft.label`, `ctaLeft.href`, `ctaLeft.bgColor`, `ctaLeft.textColor`, `ctaRight.*` (mêmes champs)

#### `NoteBlock` — Encart / note
Champs : `content`, `bgColor`, `borderColor`, `emoji`

#### `FooterBlock` — Pied de page
Champs : `bgColor`, `logoLeft.url`, `logoLeft.href`, `logoRight.url`, `logoRight.href`, `contactText`, `unsubscribeLink`, `borderRadius`

### 3.4 Génération HTML

Chaque bloc expose une fonction `renderToHtml(props): string` qui génère le HTML inline-styled compatible email (table-based layout, pas de CSS externe, styles inline).

La fonction `generateEmailHtml(blocks[])` assemble le document complet en enveloppant les blocs dans le template outer (body, table wrapper, background `#f2efe9`).

### 3.5 Interactions

- **Sélection** : clic sur un bloc → outline bleu + panel config à droite
- **Réordonner** : boutons ⬆ ⬇ sur chaque bloc
- **Supprimer** : bouton ✕ sur chaque bloc (confirmation si dernier bloc)
- **Ajouter** : bouton "+ Ajouter un bloc" en bas du canvas, ouvre une mini-modale de sélection
- **Prévisualiser** : modal fullscreen avec iframe contenant le HTML généré
- **Copier HTML** : `navigator.clipboard.writeText(generateEmailHtml(...))` + toast confirmation
- **Sauvegarder template** : prompt pour le nom → sauvegarde dans localStorage
- **Charger template** : liste dans la sidebar gauche, clic pour charger (remplace le draft actuel)

### 3.6 Persistence

- Draft auto-sauvegardé dans `localStorage['email_builder_draft']` à chaque modification (debounce 500ms)
- Templates nommés dans `localStorage['email_builder_templates']` : `{id, name, blocks, updatedAt}[]`
- Maximum 20 templates stockés (rotation FIFO)

---

## 4. Types TypeScript

```typescript
// Bloc générique
interface EmailBlock {
  id: string;          // uuid v4
  type: EmailBlockType;
  props: EmailBlockProps;
}

type EmailBlockType =
  | 'header'
  | 'hero-image'
  | 'intro-text'
  | 'two-cards'
  | 'double-cta'
  | 'note'
  | 'footer';

// Template sauvegardé
interface EmailTemplate {
  id: string;
  name: string;
  blocks: EmailBlock[];
  updatedAt: number;
}
```

---

## 5. Fichiers à créer / modifier

### Nouveaux fichiers
```
app/email-builder/page.tsx
components/email-builder/EmailBuilder.tsx
components/email-builder/BlockCatalogue.tsx
components/email-builder/Canvas.tsx
components/email-builder/ConfigPanel.tsx
components/email-builder/PreviewModal.tsx
components/email-builder/blocks/HeaderBlock.tsx
components/email-builder/blocks/HeroImageBlock.tsx
components/email-builder/blocks/IntroTextBlock.tsx
components/email-builder/blocks/TwoCardsBlock.tsx
components/email-builder/blocks/DoubleCTABlock.tsx
components/email-builder/blocks/NoteBlock.tsx
components/email-builder/blocks/FooterBlock.tsx
lib/email-html.ts          (generateEmailHtml, renderBlock)
lib/email-templates.ts     (CRUD localStorage templates)
```

### Fichiers modifiés
```
app/page.tsx               (nouvelle sidebar, header, stats bar, cards redesign)
app/layout.tsx             (sidebar persistante si besoin)
app/settings/page.tsx      (adapter au nouveau style)
components/HistoryPanel.tsx (adapter au nouveau style)
components/UsageStats.tsx   (adapter au nouveau style)
tailwind.config.ts          (nouvelle palette de couleurs)
types/index.ts              (ajouter EmailBlock, EmailTemplate, EmailBlockType)
```

---

## 6. Ce qui n'est PAS dans le scope

- Envoi d'email (pas d'intégration SMTP/Resend)
- Éditeur rich-text (textarea simple pour les textes)
- Upload d'images (URLs uniquement)
- Drag & drop entre blocs (boutons ⬆⬇ suffisent)
- Undo/redo dans l'email builder
