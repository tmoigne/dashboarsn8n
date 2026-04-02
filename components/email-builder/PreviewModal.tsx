"use client";

import { X } from "lucide-react";

interface Props {
  html: string;
  onClose: () => void;
}

export default function PreviewModal({ html, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-lg flex flex-col"
        style={{ width: "90vw", height: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-text text-sm font-mono">Prévisualisation</span>
          <button onClick={onClose} className="text-dim hover:text-text">
            <X size={18} />
          </button>
        </div>
        <iframe
          srcDoc={html}
          className="flex-1 w-full rounded-b-lg"
          style={{ border: 0 }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
