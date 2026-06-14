// 《公众号冷启动资产库》§3 文章结构模板（5式）

export const ARTICLE_TEMPLATES = {
  T1: { id: 'T1', name: '观点文', words: [1700, 2600], fit: ['观点'], blocks: '开头钩（O02/O08优先）→ 亮观点（一句话立论）→ 三个论证节（小标题：论点+案例+金句）→ 升华（拉到更大命题）→ 结尾互动' },
  T2: { id: 'T2', name: '干货文', words: [1400, 2300], fit: ['干货'], blocks: '痛点开头（O10/O06）→ 框架预告（"接下来三步"）→ 分点详解（每点：是什么+怎么做+一个例子）→ 总结清单（可截图收藏）→ 引导收藏在看' },
  T3: { id: 'T3', name: '故事文', words: [1900, 2900], fit: ['故事'], blocks: '悬念开场（O03/O05）→ 故事推进（2~3次转折，每次转折一个小标题）→ 价值落点（道理一句话）→ 升华金句 → 互动' },
  T4: { id: 'T4', name: '热点评论文', words: [1100, 1900], fit: ['热评'], blocks: '热点速描（O07，≤120字讲完事件）→ 独特角度声明 → 2~3层递进分析 → 观点落锤（金句）→ 站队式提问互动' },
  T5: { id: 'T5', name: '清单盘点文', words: [1400, 2100], fit: ['清单'], blocks: '引入（为什么值得收藏）→ N条清单（每条小标题+100字展开）→ 收尾（挑1条展开升华）→ 引导转发给需要的人' },
};

export function templateForType(type) {
  for (const t of Object.values(ARTICLE_TEMPLATES)) {
    if (t.fit.includes(type)) return t;
  }
  return ARTICLE_TEMPLATES.T2;
}

export function templatesDigest() {
  return Object.values(ARTICLE_TEMPLATES)
    .map((t) => `${t.id}「${t.name}」${t.words[0]}~${t.words[1]}字：${t.blocks}`)
    .join('\n');
}
