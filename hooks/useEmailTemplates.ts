"use client";

import { useState, useCallback, useEffect } from "react";
import type { EmailBlock, EmailTemplate } from "@/types";

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/templates");
      if (!res.ok) return;
      setTemplates(await res.json());
    } catch {}
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (name: string, blocks: EmailBlock[]): Promise<EmailTemplate> => {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, blocks }),
    });
    const template = await res.json();
    await refresh();
    return template;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  return { templates, save, remove, refresh };
}
