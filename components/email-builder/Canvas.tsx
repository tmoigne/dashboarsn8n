"use client";

import type { EmailBlock } from "@/types";
import { ChevronUp, ChevronDown, X } from "lucide-react";
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

interface Props {
  blocks: EmailBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function Canvas({ blocks, selectedId, onSelect, onMoveUp, onMoveDown, onRemove }: Props) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#2d333b] flex flex-col items-center py-8 px-4">
      {blocks.length === 0 && (
        <div className="mt-24 text-dim text-sm text-center">
          <p className="text-4xl mb-4">✉</p>
          <p>Ajoutez des blocs depuis le catalogue</p>
        </div>
      )}

      <div style={{ width: 620, maxWidth: "100%" }}>
        {blocks.map((block, i) => {
          const selected = block.id === selectedId;
          return (
            <div
              key={block.id}
              onClick={() => onSelect(block.id)}
              className="relative cursor-pointer"
              style={{
                outline: selected ? "2px solid #58a6ff" : "2px solid transparent",
                outlineOffset: 0,
              }}
            >
              {/* Controls */}
              <div
                className={`absolute top-1 right-1 flex gap-1 z-10 transition-opacity ${selected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
                onClick={(e) => e.stopPropagation()}
              >
                {i > 0 && (
                  <button
                    onClick={() => onMoveUp(block.id)}
                    className="bg-[#161b22] border border-border text-dim hover:text-text p-0.5 rounded"
                  >
                    <ChevronUp size={14} />
                  </button>
                )}
                {i < blocks.length - 1 && (
                  <button
                    onClick={() => onMoveDown(block.id)}
                    className="bg-[#161b22] border border-border text-dim hover:text-text p-0.5 rounded"
                  >
                    <ChevronDown size={14} />
                  </button>
                )}
                <button
                  onClick={() => onRemove(block.id)}
                  className="bg-[#161b22] border border-border text-dim hover:text-red-400 p-0.5 rounded"
                >
                  <X size={14} />
                </button>
              </div>

              <BlockPreview block={block} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
