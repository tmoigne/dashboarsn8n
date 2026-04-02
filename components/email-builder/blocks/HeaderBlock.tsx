import type { HeaderBlockProps } from "@/types";

export default function HeaderBlock({ props }: { props: HeaderBlockProps }) {
  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        background: props.bgColor,
        borderRadius: `${props.borderRadius}px ${props.borderRadius}px 0 0`,
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "16px 20px" }}>
            {props.logoLeftUrl ? (
              <img src={props.logoLeftUrl} height={32} alt="Logo gauche" style={{ display: "block", border: 0 }} />
            ) : (
              <div style={{ height: 32, width: 80, background: "#444", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#888", fontSize: 10 }}>Logo G</span>
              </div>
            )}
          </td>
          <td style={{ padding: "16px 20px", textAlign: "right" }}>
            {props.logoRightUrl ? (
              <img src={props.logoRightUrl} height={32} alt="Logo droite" style={{ display: "block", border: 0, marginLeft: "auto" }} />
            ) : (
              <div style={{ height: 32, width: 80, background: "#444", borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#888", fontSize: 10 }}>Logo D</span>
              </div>
            )}
          </td>
        </tr>
        {props.showDivider && (
          <tr>
            <td colSpan={2} style={{ borderBottom: "1px solid #e5e0d8", padding: 0 }} />
          </tr>
        )}
      </tbody>
    </table>
  );
}
