import type { NoteBlockProps } from "@/types";

export default function NoteBlock({ props }: { props: NoteBlockProps }) {
  return (
    <div style={{ background: "#ffffff", padding: "4px 20px 12px" }}>
      <div style={{ background: props.bgColor, borderLeft: `4px solid ${props.borderColor}`, borderRadius: "0 6px 6px 0", padding: "14px 16px", fontFamily: "Arial", fontSize: 14, color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
        {props.emoji && <span style={{ marginRight: 8 }}>{props.emoji}</span>}
        {props.content || <span style={{ color: "#aaa" }}>Contenu de la note…</span>}
      </div>
    </div>
  );
}
