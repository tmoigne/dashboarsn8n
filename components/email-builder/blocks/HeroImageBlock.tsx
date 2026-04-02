import type { HeroImageBlockProps } from "@/types";

export default function HeroImageBlock({ props }: { props: HeroImageBlockProps }) {
  if (!props.imageUrl) {
    return (
      <div style={{ width: "100%", height: 160, background: "#2d333b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#8b949e", fontSize: 13 }}>Image hero — entrez une URL</span>
      </div>
    );
  }
  return (
    <img
      src={props.imageUrl}
      alt={props.altText}
      style={{ display: "block", width: "100%", maxWidth: "100%", border: 0 }}
    />
  );
}
