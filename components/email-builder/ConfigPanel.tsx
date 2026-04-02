"use client";

import type { EmailBlock, EmailBlockProps } from "@/types";

interface Props {
  block: EmailBlock | null;
  onChange: (id: string, props: EmailBlockProps) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-dim text-[10px] uppercase tracking-widest font-mono mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-bg border border-border rounded px-2 py-1.5 text-text text-xs font-mono focus:outline-none focus:border-green";
const textareaCls = `${inputCls} resize-none h-20`;

export default function ConfigPanel({ block, onChange }: Props) {
  if (!block) {
    return (
      <aside className="w-56 flex-shrink-0 bg-surface border-l border-border flex items-center justify-center">
        <p className="text-dim text-xs text-center px-4">Sélectionnez un bloc pour le configurer</p>
      </aside>
    );
  }

  function update(partial: Partial<EmailBlockProps>) {
    onChange(block!.id, { ...block!.props, ...partial } as EmailBlockProps);
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-surface border-l border-border overflow-y-auto">
      <div className="px-3 py-3">
        <p className="text-dim text-[10px] uppercase tracking-widest font-mono mb-3">
          Config · {block.type}
        </p>

        {block.type === "header" && (
          <>
            <Field label="Fond">
              <input type="color" value={block.props.bgColor} onChange={e => update({ bgColor: e.target.value })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
            </Field>
            <Field label="Logo gauche URL">
              <input className={inputCls} value={block.props.logoLeftUrl} onChange={e => update({ logoLeftUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Logo gauche lien">
              <input className={inputCls} value={block.props.logoLeftHref} onChange={e => update({ logoLeftHref: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Logo droite URL">
              <input className={inputCls} value={block.props.logoRightUrl} onChange={e => update({ logoRightUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Logo droite lien">
              <input className={inputCls} value={block.props.logoRightHref} onChange={e => update({ logoRightHref: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Séparateur">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={block.props.showDivider} onChange={e => update({ showDivider: e.target.checked })} />
                <span className="text-text text-xs">Afficher</span>
              </label>
            </Field>
            <Field label="Border radius">
              <input type="number" className={inputCls} value={block.props.borderRadius} onChange={e => update({ borderRadius: +e.target.value })} min={0} max={32} />
            </Field>
          </>
        )}

        {block.type === "hero-image" && (
          <>
            <Field label="URL image">
              <input className={inputCls} value={block.props.imageUrl} onChange={e => update({ imageUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Texte alternatif">
              <input className={inputCls} value={block.props.altText} onChange={e => update({ altText: e.target.value })} />
            </Field>
          </>
        )}

        {block.type === "intro-text" && (
          <>
            <Field label="Contenu">
              <textarea className={textareaCls} value={block.props.content} onChange={e => update({ content: e.target.value })} />
            </Field>
            <Field label="Alignement">
              <select className={inputCls} value={block.props.align} onChange={e => update({ align: e.target.value as "left" | "center" | "right" })}>
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
              </select>
            </Field>
          </>
        )}

        {block.type === "two-cards" && (
          <>
            {(["left", "right"] as const).map(side => (
              <div key={side} className="mb-4">
                <p className="text-green text-[10px] uppercase font-mono mb-2">{side === "left" ? "Carte gauche" : "Carte droite"}</p>
                <Field label="Fond carte">
                  <input type="color" value={block.props[side].bgColor} onChange={e => update({ [side]: { ...block.props[side], bgColor: e.target.value } })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
                </Field>
                <Field label="Logo URL">
                  <input className={inputCls} value={block.props[side].logoUrl} onChange={e => update({ [side]: { ...block.props[side], logoUrl: e.target.value } })} placeholder="https://..." />
                </Field>
                <Field label="Montant">
                  <input className={inputCls} value={block.props[side].amountText} onChange={e => update({ [side]: { ...block.props[side], amountText: e.target.value } })} placeholder="99 €" />
                </Field>
                <Field label="Couleur montant">
                  <input type="color" value={block.props[side].amountColor} onChange={e => update({ [side]: { ...block.props[side], amountColor: e.target.value } })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
                </Field>
                <Field label="Sous-titre">
                  <input className={inputCls} value={block.props[side].subtitle} onChange={e => update({ [side]: { ...block.props[side], subtitle: e.target.value } })} />
                </Field>
                <Field label="Détails (1 par ligne)">
                  <textarea className={textareaCls} value={block.props[side].details.join("\n")} onChange={e => update({ [side]: { ...block.props[side], details: e.target.value.split("\n") } })} />
                </Field>
                <Field label="Label CTA">
                  <input className={inputCls} value={block.props[side].ctaLabel} onChange={e => update({ [side]: { ...block.props[side], ctaLabel: e.target.value } })} />
                </Field>
                <Field label="Lien CTA">
                  <input className={inputCls} value={block.props[side].ctaHref} onChange={e => update({ [side]: { ...block.props[side], ctaHref: e.target.value } })} placeholder="https://..." />
                </Field>
                <Field label="Fond CTA">
                  <input type="color" value={block.props[side].ctaBgColor} onChange={e => update({ [side]: { ...block.props[side], ctaBgColor: e.target.value } })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
                </Field>
              </div>
            ))}
            <Field label="Note cumulable">
              <textarea className={textareaCls} value={block.props.cumulableNote} onChange={e => update({ cumulableNote: e.target.value })} placeholder="Laisser vide pour masquer" />
            </Field>
          </>
        )}

        {block.type === "double-cta" && (
          <>
            <Field label="Titre">
              <input className={inputCls} value={block.props.title} onChange={e => update({ title: e.target.value })} />
            </Field>
            <Field label="Sous-titre">
              <input className={inputCls} value={block.props.subtitle} onChange={e => update({ subtitle: e.target.value })} />
            </Field>
            {(["ctaLeft", "ctaRight"] as const).map(side => (
              <div key={side} className="mb-3">
                <p className="text-green text-[10px] uppercase font-mono mb-2">{side === "ctaLeft" ? "Bouton gauche" : "Bouton droite"}</p>
                <Field label="Label">
                  <input className={inputCls} value={block.props[side].label} onChange={e => update({ [side]: { ...block.props[side], label: e.target.value } })} />
                </Field>
                <Field label="Lien">
                  <input className={inputCls} value={block.props[side].href} onChange={e => update({ [side]: { ...block.props[side], href: e.target.value } })} placeholder="https://..." />
                </Field>
                <Field label="Fond">
                  <input type="color" value={block.props[side].bgColor} onChange={e => update({ [side]: { ...block.props[side], bgColor: e.target.value } })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
                </Field>
                <Field label="Texte">
                  <input type="color" value={block.props[side].textColor} onChange={e => update({ [side]: { ...block.props[side], textColor: e.target.value } })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
                </Field>
              </div>
            ))}
          </>
        )}

        {block.type === "note" && (
          <>
            <Field label="Contenu">
              <textarea className={textareaCls} value={block.props.content} onChange={e => update({ content: e.target.value })} />
            </Field>
            <Field label="Emoji">
              <input className={inputCls} value={block.props.emoji} onChange={e => update({ emoji: e.target.value })} placeholder="💡" />
            </Field>
            <Field label="Fond">
              <input type="color" value={block.props.bgColor} onChange={e => update({ bgColor: e.target.value })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
            </Field>
            <Field label="Bordure">
              <input type="color" value={block.props.borderColor} onChange={e => update({ borderColor: e.target.value })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
            </Field>
          </>
        )}

        {block.type === "footer" && (
          <>
            <Field label="Fond">
              <input type="color" value={block.props.bgColor} onChange={e => update({ bgColor: e.target.value })} className="w-full h-8 rounded border border-border cursor-pointer bg-bg" />
            </Field>
            <Field label="Logo gauche URL">
              <input className={inputCls} value={block.props.logoLeftUrl} onChange={e => update({ logoLeftUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Logo gauche lien">
              <input className={inputCls} value={block.props.logoLeftHref} onChange={e => update({ logoLeftHref: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Logo droite URL">
              <input className={inputCls} value={block.props.logoRightUrl} onChange={e => update({ logoRightUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Logo droite lien">
              <input className={inputCls} value={block.props.logoRightHref} onChange={e => update({ logoRightHref: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Texte contact">
              <textarea className={textareaCls} value={block.props.contactText} onChange={e => update({ contactText: e.target.value })} />
            </Field>
            <Field label="Lien désabonnement">
              <input className={inputCls} value={block.props.unsubscribeLink} onChange={e => update({ unsubscribeLink: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Border radius">
              <input type="number" className={inputCls} value={block.props.borderRadius} onChange={e => update({ borderRadius: +e.target.value })} min={0} max={32} />
            </Field>
          </>
        )}
      </div>
    </aside>
  );
}
