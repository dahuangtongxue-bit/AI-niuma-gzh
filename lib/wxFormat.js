// 排版引擎：文章 JSON → 公众号后台可直接粘贴的内联样式 HTML
// 原理：公众号编辑器粘贴时剥离 class 但保留 inline style，故全部样式内联（秀米同理）

export const THEMES = {
  微信绿: { accent: '#07C160', deep: '#069A4F', softBg: '#F0FAF4' },
  靛蓝: { accent: '#3B5BDB', deep: '#2F4AB8', softBg: '#F0F3FE' },
  砖红: { accent: '#C92A2A', deep: '#A61E1E', softBg: '#FCF1F0' },
  紫罗兰: { accent: '#7048E8', deep: '#5B36C9', softBg: '#F5F1FE' },
  墨金: { accent: '#B08968', deep: '#94714F', softBg: '#FAF5EE' },
};

const esc = (s) =>
  String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 【重点】标记 → 主题色加粗
function mark(text, accent) {
  return esc(text).replace(/【([^【】]{1,40})】/g, `<strong style="color:${accent};">$1</strong>`);
}

function para(text, accent) {
  return `<p style="margin:0 0 20px;font-size:15px;color:#3f3f3f;line-height:1.8;letter-spacing:0.5px;text-align:justify;">${mark(text, accent)}</p>`;
}

function heading(n, text, accent) {
  return `<section style="margin:36px 0 20px;">
<span style="display:inline-block;background:${accent};color:#ffffff;font-size:14px;font-weight:700;padding:3px 11px;border-radius:4px;letter-spacing:1px;">${String(n).padStart(2, '0')}</span>
<span style="font-size:18px;font-weight:700;color:#222222;margin-left:10px;">${esc(text)}</span>
</section>`;
}

function quoteBlock(text, accent, softBg) {
  return `<section style="margin:28px 16px;padding:18px 20px;border-left:4px solid ${accent};background:${softBg};">
<p style="margin:0;font-size:15px;color:#444444;line-height:1.9;font-weight:600;">${esc(text)}</p>
</section>`;
}

function endBlock(mpName, accent, softBg) {
  return `<section style="margin:40px 16px 10px;padding:22px 20px;background:${softBg};border-radius:8px;text-align:center;">
<p style="margin:0 0 6px;font-size:14px;color:#666666;line-height:1.8;">觉得有用，点个「在看」，转给需要的朋友</p>
<p style="margin:0;font-size:13px;color:${accent};font-weight:700;letter-spacing:1px;">${esc(mpName || '')}</p>
</section>`;
}

/**
 * @param {object} article {opening:[], sections:[{heading,paras:[],quote}], ending:[]}
 * @param {string} themeName THEMES key
 * @param {string} mpName 公众号名（文末引导块署名）
 * @returns {string} 内联样式 HTML
 */
export function articleToWxHtml(article, themeName, mpName) {
  const t = THEMES[themeName] || THEMES['微信绿'];
  const parts = [];
  parts.push(`<section style="font-size:15px;color:#3f3f3f;">`);
  (article.opening || []).forEach((p) => parts.push(para(p, t.accent)));
  (article.sections || []).forEach((s, i) => {
    parts.push(heading(i + 1, s.heading, t.accent));
    (s.paras || []).forEach((p) => parts.push(para(p, t.accent)));
    if (s.quote) parts.push(quoteBlock(s.quote, t.accent, t.softBg));
  });
  (article.ending || []).forEach((p) => parts.push(para(p, t.accent)));
  parts.push(endBlock(mpName, t.accent, t.softBg));
  parts.push(`</section>`);
  return parts.join('\n');
}

/** 纯文本版（降级粘贴/备用） */
export function articleToPlain(article) {
  const lines = [];
  (article.opening || []).forEach((p) => lines.push(p, ''));
  (article.sections || []).forEach((s, i) => {
    lines.push(`${String(i + 1).padStart(2, '0')}｜${s.heading}`, '');
    (s.paras || []).forEach((p) => lines.push(p, ''));
    if (s.quote) lines.push(`「${s.quote}」`, '');
  });
  (article.ending || []).forEach((p) => lines.push(p, ''));
  return lines.join('\n').replace(/【|】/g, '');
}

/** 全文字数（汉字+字母数字） */
export function articleChars(article) {
  const all = [
    ...(article.opening || []),
    ...(article.sections || []).flatMap((s) => [s.heading, ...(s.paras || []), s.quote || '']),
    ...(article.ending || []),
  ].join('');
  return (all.match(/[\u4e00-\u9fffA-Za-z0-9]/g) || []).length;
}

/** 富文本复制：优先 ClipboardItem（text/html），降级 execCommand */
export async function copyRich(html, plain) {
  try {
    if (navigator.clipboard && typeof window !== 'undefined' && window.ClipboardItem) {
      await navigator.clipboard.write([
        new window.ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      return true;
    }
  } catch (e) { /* 走降级 */ }
  try {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    div.style.position = 'fixed';
    div.style.left = '-9999px';
    div.innerHTML = html;
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    const ok = document.execCommand('copy');
    sel.removeAllRanges();
    div.remove();
    return ok;
  } catch (e) {
    return false;
  }
}
