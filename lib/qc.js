// 质检环：《公众号冷启动资产库》§6 硬规则的程序化实现
import { checkText } from './bannedWords';
import { ARTICLE_TEMPLATES } from './articleTemplates';
import { articleChars } from './wxFormat';

const cjk = (s) => (String(s || '').match(/[\u4e00-\u9fffA-Za-z0-9]/g) || []).length;
const CTA_RE = /(在看|留言|评论|聊聊|你怎么看|告诉我|你呢|说说)/;

/**
 * @param {object} article {opening, sections, ending, quotes_for_card, summary}
 * @param {string} title 定稿标题
 * @param {string} tplId 模板编号
 */
export function runQC(article, title, tplId) {
  const rules = [];
  const push = (id, name, pass, detail, hard = false) => rules.push({ id, name, pass: !!pass, detail, hard });

  const sections = article?.sections || [];
  const allParas = [
    ...(article?.opening || []),
    ...sections.flatMap((s) => s.paras || []),
    ...(article?.ending || []),
  ];

  if (allParas.length === 0) {
    push('R0', '正文完整性', false, '正文为空', true);
    return { rules, hardFails: rules.filter((r) => !r.pass && r.hard), pass: false, words: 0 };
  }

  const words = articleChars(article);
  const tpl = ARTICLE_TEMPLATES[tplId];

  // R1 总字数落在模板区间（±10%）
  if (tpl) {
    const lo = Math.floor(tpl.words[0] * 0.9);
    const hi = Math.ceil(tpl.words[1] * 1.1);
    push('R1', `字数${tpl.words[0]}~${tpl.words[1]}`, words >= lo && words <= hi, `实测 ${words} 字`, true);
  }

  // R2 单段≤170字
  const longPara = allParas.find((p) => cjk(p) > 170);
  push('R2', '单段≤170字', !longPara, longPara ? `存在 ${cjk(longPara)} 字超长段` : '段落节奏达标', true);

  // R3 小标题≥3
  push('R3', '小标题≥3个', sections.length >= 3, `共 ${sections.length} 个小节`);

  // R4 金句≥2 且文末段含金句感（以卡候选数为准）
  const quotes = (article?.quotes_for_card || []).filter(Boolean);
  push('R4', '金句卡候选≥2句', quotes.length >= 2, `提炼 ${quotes.length} 句`);

  // R5 结尾含互动/在看引导
  const lastPara = (article?.ending || []).slice(-1)[0] || '';
  push('R5', '结尾互动引导', CTA_RE.test(lastPara), CTA_RE.test(lastPara) ? '结尾含互动' : '结尾缺互动提问');

  // R6 摘要 20~120 字
  const sLen = cjk(article?.summary || '');
  push('R6', '摘要20~120字', sLen >= 20 && sLen <= 120, `摘要 ${sLen} 字`);

  // R7 违禁词（标题+摘要+全文）
  const hits = checkText(title + (article?.summary || '') + allParas.join('') + sections.map((s) => s.heading).join('')).filter((h) => h.severity === 'block');
  push('R7', '违禁词过滤', hits.length === 0, hits.length ? `命中：${hits.map((h) => h.word).join('、')}` : '未命中违禁词', true);

  // R8 开头首段≤100字
  const first = (article?.opening || [])[0] || '';
  push('R8', '开头首段≤100字', cjk(first) > 0 && cjk(first) <= 100, `首段 ${cjk(first)} 字`);

  // R9 标题≤30字
  const tLen = (title || '').trim().length;
  push('R9', '标题≤30字', tLen > 0 && tLen <= 30, `标题 ${tLen} 字`);

  const hardFails = rules.filter((r) => !r.pass && r.hard);
  return { rules, hardFails, pass: hardFails.length === 0, words };
}

export function violationBrief(qc) {
  return qc.hardFails.map((r) => `${r.name}未达标：${r.detail}`).join('；');
}
