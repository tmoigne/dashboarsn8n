import type { EmailBlock, EmailTemplate } from "@/types";

const DRAFT_KEY = "email_builder_draft";
const TEMPLATES_KEY = "email_builder_templates";
const MAX_TEMPLATES = 20;

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

export function loadTemplates(): EmailTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTemplate(name: string, blocks: EmailBlock[]): EmailTemplate {
  const templates = loadTemplates();
  const template: EmailTemplate = {
    id: crypto.randomUUID(),
    name,
    blocks,
    updatedAt: Date.now(),
  };
  const updated = [template, ...templates].slice(0, MAX_TEMPLATES);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  return template;
}

export function deleteTemplate(id: string): void {
  const templates = loadTemplates().filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
