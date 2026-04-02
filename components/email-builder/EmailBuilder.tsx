"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { EmailBlock, EmailBlockType, EmailBlockProps, EmailTemplate } from "@/types";
import { generateEmailHtml } from "@/lib/email-html";
import { saveDraft, loadDraft, loadTemplates, saveTemplate, deleteTemplate } from "@/lib/email-templates";
import BlockCatalogue from "./BlockCatalogue";
import Canvas from "./Canvas";
import ConfigPanel from "./ConfigPanel";
import PreviewModal from "./PreviewModal";
import { Eye, Clipboard, Save, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

function defaultProps(type: EmailBlockType): EmailBlockProps {
  switch (type) {
    case "header":
      return { bgColor: "#ffffff", logoLeftUrl: "", logoLeftHref: "#", logoRightUrl: "", logoRightHref: "#", showDivider: true, borderRadius: 8 };
    case "hero-image":
      return { imageUrl: "", altText: "" };
    case "intro-text":
      return { content: "Votre texte ici…", align: "left" };
    case "two-cards":
      return {
        left:  { bgColor: "#f9f9f9", headerBgColor: "#eeeeee", headerBorderColor: "#cccccc", logoUrl: "", amountText: "99 €", amountColor: "#333333", subtitle: "par mois", details: ["Détail 1", "Détail 2"], ctaLabel: "Voir l'offre", ctaHref: "#", ctaBgColor: "#238636", ctaTextColor: "#ffffff" },
        right: { bgColor: "#f9f9f9", headerBgColor: "#eeeeee", headerBorderColor: "#cccccc", logoUrl: "", amountText: "199 €", amountColor: "#333333", subtitle: "par mois", details: ["Détail 1", "Détail 2"], ctaLabel: "Voir l'offre", ctaHref: "#", ctaBgColor: "#238636", ctaTextColor: "#ffffff" },
        cumulableNote: "",
      };
    case "double-cta":
      return { title: "Passez à l'action", subtitle: "Choisissez votre option", ctaLeft: { label: "Option A", href: "#", bgColor: "#238636", textColor: "#ffffff" }, ctaRight: { label: "Option B", href: "#", bgColor: "#0d419d", textColor: "#ffffff" } };
    case "note":
      return { content: "Information importante à retenir.", bgColor: "#fff8dc", borderColor: "#f5c400", emoji: "💡" };
    case "footer":
      return { bgColor: "#f2efe9", logoLeftUrl: "", logoLeftHref: "#", logoRightUrl: "", logoRightHref: "#", contactText: "contact@example.com", unsubscribeLink: "#", borderRadius: 8 };
  }
}

export default function EmailBuilder() {
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailName, setEmailName] = useState("Sans titre");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft + templates on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.length > 0) setBlocks(draft);
    setTemplates(loadTemplates());
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDraft(blocks), 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [blocks]);

  const addBlock = useCallback((type: EmailBlockType) => {
    const block = { id: crypto.randomUUID(), type, props: defaultProps(type) } as EmailBlock;
    setBlocks(prev => [...prev, block]);
    setSelectedId(block.id);
  }, []);

  const updateBlock = useCallback((id: string, props: EmailBlockProps) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, props } as EmailBlock : b));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== id);
      if (selectedId === id) setSelectedId(next.length > 0 ? next[next.length - 1].id : null);
      return next;
    });
  }, [selectedId]);

  const moveUp = useCallback((id: string) => {
    setBlocks(prev => {
      const i = prev.findIndex(b => b.id === id);
      if (i <= 0) return prev;
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    setBlocks(prev => {
      const i = prev.findIndex(b => b.id === id);
      if (i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }, []);

  const handleSaveTemplate = () => {
    const name = prompt("Nom du template :", emailName);
    if (!name) return;
    saveTemplate(name, blocks);
    setTemplates(loadTemplates());
  };

  const handleLoadTemplate = (t: EmailTemplate) => {
    if (!confirm(`Charger "${t.name}" ? Le brouillon actuel sera remplacé.`)) return;
    setBlocks(t.blocks);
    setSelectedId(null);
    setEmailName(t.name);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplates(loadTemplates());
  };

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(generateEmailHtml(blocks));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedBlock = blocks.find(b => b.id === selectedId) ?? null;
  const html = generateEmailHtml(blocks);

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-surface border-b border-border flex-shrink-0 h-12">
        <Link href="/" className="text-dim hover:text-text transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="w-px h-4 bg-border" />
        <input
          value={emailName}
          onChange={e => setEmailName(e.target.value)}
          className="bg-transparent text-text text-sm font-medium focus:outline-none border-b border-transparent focus:border-border w-48"
        />
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dim hover:text-text border border-border rounded hover:border-green-dark transition-colors"
        >
          <Eye size={14} /> Prévisualiser
        </button>
        <button
          onClick={handleCopyHtml}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dim hover:text-text border border-border rounded hover:border-green-dark transition-colors"
        >
          {copied ? <Check size={14} className="text-green" /> : <Clipboard size={14} />}
          {copied ? "Copié !" : "Copier HTML"}
        </button>
        <button
          onClick={handleSaveTemplate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-dark hover:bg-green text-white rounded transition-colors"
        >
          <Save size={14} /> Sauvegarder
        </button>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <BlockCatalogue
          templates={templates}
          onAddBlock={addBlock}
          onLoadTemplate={handleLoadTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
        <Canvas
          blocks={blocks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onRemove={removeBlock}
          onReorder={setBlocks}
        />
        <ConfigPanel block={selectedBlock} onChange={updateBlock} />
      </div>

      {showPreview && <PreviewModal html={html} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
