'use client';

import { useRef, useState } from 'react';
import { CARDS, PALETTES } from './templates';

function normalize(card) {
  if (!card) return null;
  const tpl = String(card.tpl || 'C_BANNER').replace(/-/g, '_').toUpperCase();
  return { ...card, tpl: CARDS[tpl] ? tpl : 'C_BANNER' };
}

/**
 * 卡片条：头图 + 金句卡的预览/下载（尺寸各异，按各自 w/h 导出）
 * props: cards=[{tpl, title/quote, ..., label}], theme 主题色名, filename
 */
export default function CardsStrip({ cards, theme = '微信绿', filename = '配图' }) {
  const refs = useRef([]);
  const [busy, setBusy] = useState('');
  const p = PALETTES[theme] || PALETTES['微信绿'];
  const list = (cards || []).map(normalize).filter(Boolean);

  async function exportOne(i) {
    const node = refs.current[i];
    const meta = CARDS[list[i].tpl];
    if (!node || !meta || busy) return;
    setBusy(`one-${i}`);
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(node, { width: meta.w, height: meta.h, pixelRatio: 1, cacheBust: true, style: { transform: 'none' } });
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${list[i].label || meta.name}_${meta.w}x${meta.h}.png`;
      a.click();
    } catch (e) { /* 可重试 */ } finally { setBusy(''); }
  }

  async function exportZip() {
    if (busy) return;
    setBusy('zip');
    try {
      const [{ toPng }, { default: JSZip }] = await Promise.all([import('html-to-image'), import('jszip')]);
      const zip = new JSZip();
      for (let i = 0; i < list.length; i++) {
        const node = refs.current[i];
        const meta = CARDS[list[i].tpl];
        if (!node || !meta) continue;
        const url = await toPng(node, { width: meta.w, height: meta.h, pixelRatio: 1, cacheBust: true, style: { transform: 'none' } });
        zip.file(`${String(i).padStart(2, '0')}_${list[i].label || 'card'}_${meta.w}x${meta.h}.png`, url.split(',')[1], { base64: true });
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${filename}_配图包.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) { /* 可重试 */ } finally { setBusy(''); }
  }

  if (list.length === 0) return null;

  return (
    <div className="framesBlock">
      <div className="framesStrip">
        {list.map((card, i) => {
          const meta = CARDS[card.tpl];
          const Comp = meta.Comp;
          const previewW = meta.w > meta.h ? 260 : 150;
          const scale = previewW / meta.w;
          return (
            <div className="frameCell" key={i}>
              <div className="frameViewport" style={{ width: previewW, height: meta.h * scale }}>
                <div
                  ref={(el) => { refs.current[i] = el; }}
                  style={{ width: meta.w, height: meta.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                >
                  <Comp d={card} p={p} />
                </div>
              </div>
              <button className="linkBtn frameDl" onClick={() => exportOne(i)} disabled={!!busy}>
                {busy === `one-${i}` ? '出图…' : `${card.label || meta.name} ↓`}
              </button>
            </div>
          );
        })}
      </div>
      <button className="btn btnGhost btnSmall" onClick={exportZip} disabled={!!busy} style={{ marginTop: 8 }}>
        {busy === 'zip' ? '正在打包出图…' : `打包下载头图+金句卡（${list.length} 张 zip）`}
      </button>
    </div>
  );
}
