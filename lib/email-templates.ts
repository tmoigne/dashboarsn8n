import type { EmailBlock } from "@/types";

// Draft is intentionally localStorage — it's transient per-device working state.
// Saved templates are persisted in DB via /api/templates.

const DRAFT_KEY = "email_builder_draft";

export function saveDraft(blocks: EmailBlock[]): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(blocks));
  } catch {}
}

export function loadDraft(): EmailBlock[] | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
