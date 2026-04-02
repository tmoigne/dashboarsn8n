"use client";

import type { EmailBlockType, EmailTemplate } from "@/types";
import { Trash2 } from "lucide-react";

const BLOCK_TYPES: { type: EmailBlockType; label: string; desc: string; icon: string }[] = [
  { type: "header",     label: "Header",      desc: "Double logo",         icon: "🏷" },
  { type: "hero-image", label: "Image Hero",  desc: "Image pleine largeur", icon: "🖼" },
  { type: "intro-text", label: "Texte intro", desc: "Paragraphe aligné",   icon: "📝" },
  { type: "two-cards",  label: "2 Cartes",    desc: "Offres côte à côte",  icon: "🃏" },
  { type: "double-cta", label: "Double CTA",  desc: "2 boutons d'action",  icon: "🔗" },
  { type: "note",       label: "Note",        desc: "Encart coloré",       icon: "💬" },
  { type: "footer",     label: "Footer",      desc: "Pied de page",        icon: "📄" },
];

interface Props {
  templates: EmailTemplate[];
  onAddBlock: (type: EmailBlockType) => void;
  onLoadTemplate: (t: EmailTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function BlockCatalogue({ templates, onAddBlock, onLoadTemplate, onDeleteTemplate }: Props) {
  return (
    <aside className="w-48 flex-shrink-0 bg-surface border-r border-border flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-border">
        <p className="text-dim text-[10px] uppercase tracking-widest font-mono mb-2">Blocs</p>
        <div className="flex flex-col gap-1">
          {BLOCK_TYPES.map((b) => (
            <button
              key={b.type}
              onClick={() => onAddBlock(b.type)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left transition-colors group w-full"
            >
              <span className="text-base leading-none">{b.icon}</span>
              <div className="min-w-0">
                <p className="text-text text-xs font-medium truncate">{b.label}</p>
                <p className="text-dim text-[10px] truncate">{b.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {templates.length > 0 && (
        <div className="px-3 py-3">
          <p className="text-dim text-[10px] uppercase tracking-widest font-mono mb-2">Templates</p>
          <div className="flex flex-col gap-1">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center gap-1 group">
                <button
                  onClick={() => onLoadTemplate(t)}
                  className="flex-1 text-left px-2 py-1.5 rounded hover:bg-muted transition-colors min-w-0"
                >
                  <p className="text-text text-xs truncate">{t.name}</p>
                  <p className="text-dim text-[10px]">{new Date(t.updatedAt).toLocaleDateString("fr")}</p>
                </button>
                <button
                  onClick={() => onDeleteTemplate(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-dim hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
