import type { DoubleCTABlockProps } from "@/types";

export default function DoubleCTABlock({ props }: { props: DoubleCTABlockProps }) {
  return (
    <div style={{ background: "#ffffff", padding: "28px 20px", textAlign: "center" }}>
      <div style={{ fontFamily: "Arial", fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 8 }}>
        {props.title || "Titre"}
      </div>
      <div style={{ fontFamily: "Arial", fontSize: 13, color: "#666", marginBottom: 20 }}>
        {props.subtitle || "Sous-titre"}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <span style={{ display: "inline-block", background: props.ctaLeft.bgColor, color: props.ctaLeft.textColor, fontFamily: "Arial", fontSize: 14, fontWeight: "bold", padding: "10px 24px", borderRadius: 6 }}>
          {props.ctaLeft.label || "Bouton 1"}
        </span>
        <span style={{ display: "inline-block", background: props.ctaRight.bgColor, color: props.ctaRight.textColor, fontFamily: "Arial", fontSize: 14, fontWeight: "bold", padding: "10px 24px", borderRadius: 6 }}>
          {props.ctaRight.label || "Bouton 2"}
        </span>
      </div>
    </div>
  );
}
