# N8N Dashboard — Occitinfo

Interface Next.js pour exécuter des tâches n8n via webhooks.

## Déploiement sur Dokploy

1. Push ce projet sur un repo Git (GitHub, Gitea, etc.)
2. Dans Dokploy → **New Application** → Source: Git
3. Build method: **Dockerfile**
4. Port: **3000**
5. Deploy ✓

## Premier démarrage

Au premier chargement, tu seras redirigé vers `/settings` pour entrer :
- L'URL de base de ton n8n (ex: `http://192.168.1.50:5678`)
- La clé API (header `X-Api-Key`)

La config est stockée dans le `localStorage` du navigateur.

## Webhooks n8n attendus

Crée ces workflows dans n8n avec un **Webhook trigger** sur chaque chemin :

| Chemin | Payload reçu | Utilisation |
|--------|-------------|-------------|
| `/webhook/ocr-image` | `{ filename, data (base64), mime }` | OCR image |
| `/webhook/extract-pdf` | `{ filename, data (base64), mime }` | Extraction PDF |
| `/webhook/summarize` | `{ text }` | Résumé |
| `/webhook/translate` | `{ text }` | Traduction |
| `/webhook/classify` | `{ text }` | Classification |
| `/webhook/custom` | JSON libre | Webhook libre |
| `/webhook/ping` | `{ ping: true }` | Test de connexion |

Chaque workflow doit terminer par un node **"Respond to Webhook"** avec le résultat.

## Auth webhook n8n

Dans chaque Webhook node → **Header Auth** :
- Header Name: `X-Api-Key`
- Header Value: ta clé secrète

## Dev local

```bash
npm install
npm run dev
# → http://localhost:3000
```
