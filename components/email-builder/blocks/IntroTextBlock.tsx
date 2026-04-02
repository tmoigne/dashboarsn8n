import type { IntroTextBlockProps } from "@/types";

export default function IntroTextBlock({ props }: { props: IntroTextBlockProps }) {
  return (
    <div
      style={{
        padding: "20px 24px",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: 15,
        lineHeight: 1.6,
        color: "#333333",
        textAlign: props.align,
        whiteSpace: "pre-wrap",
      }}
    >
      {props.content || <span style={{ color: "#aaa" }}>Texte introductif…</span>}
    </div>
  );
}
