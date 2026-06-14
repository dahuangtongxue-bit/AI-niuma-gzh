// 违禁词检测（公众号版）——与小红书规则的关键差异：
// 1. 新增微信红线：诱导分享（不转不是/转发抽奖/集赞/转发领取）为 block 级
// 2. 移除"站外引流"封禁：公众号内引导加微信/进群属私域常规操作，平台允许
// severity: 'block' = 硬打回；'warn' = 建议复查

const RULES = [
  { re: /最[强好佳优高全顶贵]/g, label: '绝对化用语（最X）', severity: 'warn' },
  { re: /(全网|史上|世界|全国)第一|第一名|销量第一|排名第一/g, label: '绝对化用语（第一）', severity: 'block' },
  { re: /100%|百分之百|绝对(有效|不|安全)/g, label: '绝对化承诺', severity: 'block' },
  { re: /国家级|顶级|极品|王牌/g, label: '广告法限用词', severity: 'warn' },
  { re: /(根治|治疗|治愈|包治|药用|疗效)/g, label: '医疗功效用语', severity: 'block' },
  { re: /(稳赚|躺赚|包赚|保底月入|无风险.{0,4}(收益|赚))/g, label: '夸大收益', severity: 'block' },
  { re: /(不转不是|转发抽奖|转发.{0,6}(领取|免费领)|集赞|分享.{0,4}领)/g, label: '诱导分享（微信红线）', severity: 'block' },
  { re: /(必须关注|强制关注|关注才能)/g, label: '强制关注（微信红线）', severity: 'block' },
  { re: /(震惊|惊呆|吓尿)/g, label: '标题党高危词', severity: 'warn' },
];

export function checkText(text) {
  if (!text) return [];
  const hits = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(text)) !== null) {
      hits.push({ word: m[0], label: rule.label, severity: rule.severity });
      if (m.index === rule.re.lastIndex) rule.re.lastIndex++;
    }
  }
  const seen = new Set();
  return hits.filter((h) => {
    const k = h.word + h.label;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function hasBlocked(text) {
  return checkText(text).some((h) => h.severity === 'block');
}
