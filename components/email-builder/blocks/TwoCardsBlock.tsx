import type { TwoCardsBlockProps, CardItem } from "@/types";

function Card({ card }: { card: CardItem }) {
  return (
    <div style={{ flex: 1, margin: "0 6px", background: card.bgColor, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ background: card.headerBgColor, borderBottom: `3px solid ${card.headerBorderColor}`, padding: "12px 16px", textAlign: "center" }}>
        {card.logoUrl ? (
          <img src={card.logoUrl} height={36} alt="" style={{ display: "block", margin: "0 auto", border: 0 }} />
        ) : (
          <div style={{ height: 36, width: 80, background: "#333", borderRadius: 4, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#888", fontSize: 10 }}>Logo</span>
          </div>
        )}
      </div>
      <div style={{ padding: "12px 16px", textAlign: "center" }}>
        <div style={{ fontFamily: "Arial", fontSize: 24, fontWeight: "bold", color: card.amountColor }}>{card.amountText || "0 €"}</div>
        <div style={{ fontFamily: "Arial", fontSize: 12, color: "#666", marginTop: 4 }}>{card.subtitle}</div>
      </div>
      <div style={{ padding: "0 16px 12px" }}>
        {card.details.map((d, i) => (
          <div key={i} style={{ fontFamily: "Arial", fontSize: 12, color: "#555", padding: "2px 0" }}>• {d}</div>
        ))}
      </div>
      <div style={{ padding: "0 16px 16px", textAlign: "center" }}>
        <span style={{ display: "inline-block", background: card.ctaBgColor, color: card.ctaTextColor, fontFamily: "Arial", fontSize: 13, fontWeight: "bold", padding: "8px 20px", borderRadius: 6 }}>
          {card.ctaLabel || "Voir l'offre"}
        </span>
      </div>
    </div>
  );
}

export default function TwoCardsBlock({ props }: { props: TwoCardsBlockProps }) {
  return (
    <div style={{ background: "#ffffff", padding: "8px 8px 0" }}>
      <div style={{ display: "flex" }}>
        <Card card={props.left} />
        <Card card={props.right} />
      </div>
      {props.cumulableNote && (
        <div style={{ margin: "8px 8px 8px", background: "#e8f5e9", borderRadius: 6, padding: "10px 14px", fontFamily: "Arial", fontSize: 13, color: "#2e7d32" }}>
          {props.cumulableNote}
        </div>
      )}
    </div>
  );
}
