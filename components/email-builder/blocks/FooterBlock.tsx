import type { FooterBlockProps } from "@/types";

export default function FooterBlock({ props }: { props: FooterBlockProps }) {
  return (
    <div style={{ background: props.bgColor, borderRadius: `0 0 ${props.borderRadius}px ${props.borderRadius}px`, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          {props.logoLeftUrl ? (
            <img src={props.logoLeftUrl} height={24} alt="Logo" style={{ display: "block", border: 0 }} />
          ) : (
            <div style={{ height: 24, width: 60, background: "#444", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#888", fontSize: 9 }}>Logo G</span>
            </div>
          )}
        </div>
        <div>
          {props.logoRightUrl ? (
            <img src={props.logoRightUrl} height={24} alt="Logo" style={{ display: "block", border: 0 }} />
          ) : (
            <div style={{ height: 24, width: 60, background: "#444", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#888", fontSize: 9 }}>Logo D</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ fontFamily: "Arial", fontSize: 11, color: "#888", textAlign: "center" }}>
        {props.contactText}
        {props.unsubscribeLink && (
          <span> · <span style={{ color: "#888", textDecoration: "underline" }}>Se désabonner</span></span>
        )}
      </div>
    </div>
  );
}
