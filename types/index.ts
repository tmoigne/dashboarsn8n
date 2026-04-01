export interface WebhookConfig {
  baseUrl: string;
  apiKey: string;
}

export interface Task {
  id: string;
  label: string;
  description: string;
  icon: string;
  webhookPath: string;
  inputType: "image" | "pdf" | "text" | "file" | "document";
  inputLabel: string;
  inputPlaceholder?: string;
  outputFormats?: Array<{ id: string; label: string }>;
}

export interface HistoryEntry {
  id: string;
  taskId: string;
  taskLabel: string;
  webhookPath: string;
  timestamp: number;
  status: "success" | "error";
  result: string;
}

export interface N8nInstance {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
}

// ── Email Builder ─────────────────────────────────────────────────────────────

export type EmailBlockType =
  | "header"
  | "hero-image"
  | "intro-text"
  | "two-cards"
  | "double-cta"
  | "note"
  | "footer";

export interface HeaderBlockProps {
  bgColor: string;
  logoLeftUrl: string;
  logoLeftHref: string;
  logoRightUrl: string;
  logoRightHref: string;
  showDivider: boolean;
  borderRadius: number;
}

export interface HeroImageBlockProps {
  imageUrl: string;
  altText: string;
}

export interface IntroTextBlockProps {
  content: string;
  align: "left" | "center" | "right";
}

export interface CardItem {
  bgColor: string;
  headerBgColor: string;
  headerBorderColor: string;
  logoUrl: string;
  amountText: string;
  amountColor: string;
  subtitle: string;
  details: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaBgColor: string;
  ctaTextColor: string;
}

export interface TwoCardsBlockProps {
  left: CardItem;
  right: CardItem;
  cumulableNote: string;
}

export interface DoubleCTABlockProps {
  title: string;
  subtitle: string;
  ctaLeft: { label: string; href: string; bgColor: string; textColor: string };
  ctaRight: { label: string; href: string; bgColor: string; textColor: string };
}

export interface NoteBlockProps {
  content: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
}

export interface FooterBlockProps {
  bgColor: string;
  logoLeftUrl: string;
  logoLeftHref: string;
  logoRightUrl: string;
  logoRightHref: string;
  contactText: string;
  unsubscribeLink: string;
  borderRadius: number;
}

export type EmailBlockProps =
  | HeaderBlockProps
  | HeroImageBlockProps
  | IntroTextBlockProps
  | TwoCardsBlockProps
  | DoubleCTABlockProps
  | NoteBlockProps
  | FooterBlockProps;

export type EmailBlock =
  | { id: string; type: "header";     props: HeaderBlockProps }
  | { id: string; type: "hero-image"; props: HeroImageBlockProps }
  | { id: string; type: "intro-text"; props: IntroTextBlockProps }
  | { id: string; type: "two-cards";  props: TwoCardsBlockProps }
  | { id: string; type: "double-cta"; props: DoubleCTABlockProps }
  | { id: string; type: "note";       props: NoteBlockProps }
  | { id: string; type: "footer";     props: FooterBlockProps };

export interface EmailTemplate {
  id: string;
  name: string;
  blocks: EmailBlock[];
  updatedAt: number;
}
