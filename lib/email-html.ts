import type {
  EmailBlock,
  HeaderBlockProps,
  HeroImageBlockProps,
  IntroTextBlockProps,
  TwoCardsBlockProps,
  DoubleCTABlockProps,
  NoteBlockProps,
  FooterBlockProps,
} from "@/types";

function renderHeader(p: HeaderBlockProps): string {
  const divider = p.showDivider
    ? `<tr><td colspan="2" style="border-bottom:1px solid #e5e0d8;padding:0;"></td></tr>`
    : "";
  return `
<table width="620" cellpadding="0" cellspacing="0" border="0" style="background:${p.bgColor};border-radius:${p.borderRadius}px ${p.borderRadius}px 0 0;margin:0 auto;">
  <tr>
    <td style="padding:20px 24px;">
      <a href="${p.logoLeftHref}"><img src="${p.logoLeftUrl}" height="36" alt="Logo" style="display:block;border:0;" /></a>
    </td>
    <td style="padding:20px 24px;text-align:right;">
      <a href="${p.logoRightHref}"><img src="${p.logoRightUrl}" height="36" alt="Logo" style="display:block;border:0;margin-left:auto;" /></a>
    </td>
  </tr>
  ${divider}
</table>`;
}

function renderHeroImage(p: HeroImageBlockProps): string {
  return `
<table width="620" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
  <tr>
    <td><img src="${p.imageUrl}" alt="${p.altText}" width="620" style="display:block;max-width:100%;border:0;" /></td>
  </tr>
</table>`;
}

function renderIntroText(p: IntroTextBlockProps): string {
  return `
<table width="620" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#ffffff;">
  <tr>
    <td style="padding:24px 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#333333;text-align:${p.align};">
      ${p.content.replace(/\n/g, "<br />")}
    </td>
  </tr>
</table>`;
}

function renderCard(card: TwoCardsBlockProps["left"]): string {
  const details = card.details
    .map(
      (d) =>
        `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#555555;padding:2px 0;">• ${d}</td></tr>`
    )
    .join("");
  return `
<td width="50%" style="padding:8px;vertical-align:top;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${card.bgColor};border-radius:8px;overflow:hidden;">
    <tr>
      <td style="background:${card.headerBgColor};border-bottom:3px solid ${card.headerBorderColor};padding:16px;text-align:center;">
        <img src="${card.logoUrl}" height="40" alt="" style="display:block;margin:0 auto;border:0;" />
      </td>
    </tr>
    <tr>
      <td style="padding:16px;text-align:center;">
        <div style="font-family:Arial,sans-serif;font-size:28px;font-weight:bold;color:${card.amountColor};">${card.amountText}</div>
        <div style="font-family:Arial,sans-serif;font-size:13px;color:#666666;margin-top:4px;">${card.subtitle}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 16px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${details}</table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 16px 16px;text-align:center;">
        <a href="${card.ctaHref}" style="display:inline-block;background:${card.ctaBgColor};color:${card.ctaTextColor};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:10px 24px;border-radius:6px;text-decoration:none;">${card.ctaLabel}</a>
      </td>
    </tr>
  </table>
</td>`;
}

function renderTwoCards(p: TwoCardsBlockProps): string {
  const note = p.cumulableNote
    ? `<tr><td style="padding:8px 16px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8f5e9;border-radius:6px;">
          <tr><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;color:#2e7d32;">${p.cumulableNote}</td></tr>
        </table>
      </td></tr>`
    : "";
  return `
<table width="620" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#ffffff;">
  <tr>
    ${renderCard(p.left)}
    ${renderCard(p.right)}
  </tr>
  ${note}
</table>`;
}

function renderDoubleCTA(p: DoubleCTABlockProps): string {
  return `
<table width="620" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#ffffff;">
  <tr>
    <td style="padding:32px 24px;text-align:center;">
      <div style="font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#333333;margin-bottom:8px;">${p.title}</div>
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#666666;margin-bottom:24px;">${p.subtitle}</div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="padding:0 8px;">
            <a href="${p.ctaLeft.href}" style="display:inline-block;background:${p.ctaLeft.bgColor};color:${p.ctaLeft.textColor};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:6px;text-decoration:none;">${p.ctaLeft.label}</a>
          </td>
          <td style="padding:0 8px;">
            <a href="${p.ctaRight.href}" style="display:inline-block;background:${p.ctaRight.bgColor};color:${p.ctaRight.textColor};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:6px;text-decoration:none;">${p.ctaRight.label}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function renderNote(p: NoteBlockProps): string {
  return `
<table width="620" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#ffffff;">
  <tr>
    <td style="padding:8px 24px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${p.bgColor};border-left:4px solid ${p.borderColor};border-radius:0 6px 6px 0;">
        <tr>
          <td style="padding:16px;font-family:Arial,sans-serif;font-size:14px;color:#333333;line-height:1.6;">
            ${p.emoji ? `<span style="margin-right:8px;">${p.emoji}</span>` : ""}${p.content.replace(/\n/g, "<br />")}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function renderFooter(p: FooterBlockProps): string {
  return `
<table width="620" cellpadding="0" cellspacing="0" border="0" style="background:${p.bgColor};border-radius:0 0 ${p.borderRadius}px ${p.borderRadius}px;margin:0 auto;">
  <tr>
    <td style="padding:20px 24px;">
      <a href="${p.logoLeftHref}"><img src="${p.logoLeftUrl}" height="28" alt="Logo" style="display:block;border:0;" /></a>
    </td>
    <td style="padding:20px 24px;text-align:right;">
      <a href="${p.logoRightHref}"><img src="${p.logoRightUrl}" height="28" alt="Logo" style="display:block;border:0;margin-left:auto;" /></a>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding:0 24px 20px;font-family:Arial,sans-serif;font-size:12px;color:#888888;text-align:center;">
      ${p.contactText}
      ${p.unsubscribeLink ? `&nbsp;·&nbsp;<a href="${p.unsubscribeLink}" style="color:#888888;">Se désabonner</a>` : ""}
    </td>
  </tr>
</table>`;
}

export function renderBlockToHtml(block: EmailBlock): string {
  switch (block.type) {
    case "header":
      return renderHeader(block.props);
    case "hero-image":
      return renderHeroImage(block.props);
    case "intro-text":
      return renderIntroText(block.props);
    case "two-cards":
      return renderTwoCards(block.props);
    case "double-cta":
      return renderDoubleCTA(block.props);
    case "note":
      return renderNote(block.props);
    case "footer":
      return renderFooter(block.props);
  }
}

export function generateEmailHtml(blocks: EmailBlock[]): string {
  const body = blocks.map(renderBlockToHtml).join("\n");
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Email</title>
</head>
<body style="margin:0;padding:0;background:#f2efe9;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2efe9;">
  <tr>
    <td align="center" style="padding:32px 0;">
      ${body}
    </td>
  </tr>
</table>
</body>
</html>`;
}
