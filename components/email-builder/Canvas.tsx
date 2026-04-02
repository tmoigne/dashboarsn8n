"use client";

import type { EmailBlock } from "@/types";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

interface SortableBlockProps {
  block: EmailBlock;
  index: number;
  total: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
}

function SortableBlock({ block, index, total, selected, onSelect, onMoveUp, onMoveDown, onRemove }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    outline: selected ? "2px solid #58a6ff" : "2px solid transparent",
    outlineOffset: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative cursor-pointer"
      onClick={() => onSelect(block.id)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 bg-[#161b22] border border-border text-dim hover:text-text p-0.5 rounded cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
        title="Glisser pour réordonner"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
          <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
          <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
        </svg>
      </div>

      {/* Controls */}
      <div
        className={`absolute top-1 right-1 flex gap-1 z-10 transition-opacity ${selected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {index > 0 && (
          <button onClick={() => onMoveUp(block.id)} className="bg-[#161b22] border border-border text-dim hover:text-text p-0.5 rounded">
            <ChevronUp size={14} />
          </button>
        )}
        {index < total - 1 && (
          <button onClick={() => onMoveDown(block.id)} className="bg-[#161b22] border border-border text-dim hover:text-text p-0.5 rounded">
            <ChevronDown size={14} />
          </button>
        )}
        <button onClick={() => onRemove(block.id)} className="bg-[#161b22] border border-border text-dim hover:text-red-400 p-0.5 rounded">
          <X size={14} />
        </button>
      </div>

      <BlockPreview block={block} />
    </div>
  );
}

interface Props {
  blocks: EmailBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (blocks: EmailBlock[]) => void;
}

export default function Canvas({ blocks, selectedId, onSelect, onMoveUp, onMoveDown, onRemove, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    onReorder(arrayMove(blocks, oldIndex, newIndex));
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#2d333b] flex flex-col items-center py-8 px-4">
      {blocks.length === 0 && (
        <div className="mt-24 text-dim text-sm text-center">
          <p className="text-4xl mb-4">✉</p>
          <p>Ajoutez des blocs depuis le catalogue</p>
        </div>
      )}
      <div style={{ width: 620, maxWidth: "100%" }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block, i) => (
              <SortableBlock
                key={block.id}
                block={block}
                index={i}
                total={blocks.length}
                selected={block.id === selectedId}
                onSelect={onSelect}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
