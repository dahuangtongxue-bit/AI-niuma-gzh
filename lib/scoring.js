import { checkText } from './bannedWords';

// 公众号标题钩子词（前13字折叠位判定用）
const HOOK_WORDS = [
  '我劝你', '别再', '正在', '真正', '后来', '才明白', '自白', '成年人', '中年人',
  '为什么', '真的', '到底', '别人都在', '你以为', '再不', '窗口期', '真相',
  '最好的答案', '一篇说透', '底层逻辑', '建议', '迹象', '刷屏', '没人告诉你', '清醒',
];

const SPECIFIC_RE = /([0-9０-９]+|[一二两三四五六七八九十百千]+)\s*(条|个|句|岁|年|步|招|天|次|篇|%)?/;

export function hardCheck(title) {
  const t = (title || '').trim();
  const issues = checkText(t);
  const blocked = issues.filter((i) => i.severity === 'block');
  const first13 = t.slice(0, 13);
  return {
    len: t.length,
    lenOK: t.length > 0 && t.length <= 30,
    blocked,
    warns: issues.filter((i) => i.severity === 'warn'),
    hookInFront: HOOK_WORDS.some((w) => first13.includes(w)),
    hasSpecific: SPECIFIC_RE.test(t),
  };
}

/**
 * 合并打分：模型4维（钩子/搜一搜/人群共鸣/具体，各0-2）+ 代码合规维（0-2）
 * 总分10，≥7 合格；block违禁或超长直接不合格
 */
export function combineScore(title, judgeDims, why) {
  const h = hardCheck(title);
  const dims = Array.isArray(judgeDims) && judgeDims.length === 4
    ? judgeDims.map((d) => Math.max(0, Math.min(2, Number(d) || 0)))
    : [0, 0, 0, 0];

  if (h.hasSpecific && dims[3] === 0) dims[3] = 1;
  if (h.hookInFront && dims[0] === 0) dims[0] = 1;

  const complianceDim = h.lenOK && h.blocked.length === 0 ? 2 : 0;
  const total = dims.reduce((a, b) => a + b, 0) + complianceDim;

  const reasons = [];
  if (!h.lenOK) reasons.push(`超长（${h.len}字>30）`);
  for (const b of h.blocked) reasons.push(`违禁词「${b.word}」(${b.label})`);
  if (why) reasons.push(why);
  if (h.warns.length) reasons.push(`复查：${h.warns.map((w) => w.word).join('、')}`);

  return {
    total,
    pass: total >= 7 && h.lenOK && h.blocked.length === 0,
    dims: { 钩子: dims[0], 搜一搜: dims[1], 共鸣: dims[2], 具体: dims[3], 合规: complianceDim },
    reasons,
    warns: h.warns,
  };
}
