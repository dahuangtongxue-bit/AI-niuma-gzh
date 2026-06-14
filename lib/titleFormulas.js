// 《公众号冷启动资产库》§1 标题公式库（32式）结构化版本

export const FORMULAS = [
  { id: 'A01', cat: 'A', catName: '观点态度', name: '劝退式', tpl: '我劝你，别再{行为}了', ex: '我劝你，别再熬夜做PPT了' },
  { id: 'A02', cat: 'A', catName: '观点态度', name: '差距式', tpl: '{行为}，正在悄悄拉开人和人的差距', ex: '会提问，正在悄悄拉开人和人的差距' },
  { id: 'A03', cat: 'A', catName: '观点态度', name: '圈层式', tpl: '真正厉害的人，都在{反直觉行为}', ex: '真正厉害的人，都在做减法' },
  { id: 'A04', cat: 'A', catName: '观点态度', name: '清醒式', tpl: '{X}，是成年人最大的清醒', ex: '定期清理朋友圈，是成年人最大的清醒' },
  { id: 'A05', cat: 'A', catName: '观点态度', name: '不一样式', tpl: '关于{X}，说点不一样的', ex: '关于AI抢饭碗，说点不一样的' },
  { id: 'B06', cat: 'B', catName: '故事悬念', name: '后来式', tpl: '那个{标签}的人，后来怎么样了', ex: '那个裸辞做自媒体的同事，后来怎么样了' },
  { id: 'B07', cat: 'B', catName: '故事悬念', name: '档案式', tpl: '我，{年龄}，{身份}，{今天的事件}', ex: '我，35岁，二胎妈妈，今天重新投了简历' },
  { id: 'B08', cat: 'B', catName: '故事悬念', name: '顿悟式', tpl: '{经历}之后，我才明白{道理}', ex: '管了三年供应商，我才明白什么叫靠谱' },
  { id: 'B09', cat: 'B', catName: '故事悬念', name: '自白式', tpl: '一个{身份}的自白', ex: '一个县城餐饮老板的自白' },
  { id: 'C10', cat: 'C', catName: '身份共鸣', name: '崩溃式', tpl: '成年人的{情绪}，都是从{小事}开始的', ex: '成年人的崩溃，都是从算房贷开始的' },
  { id: 'C11', cat: 'C', catName: '身份共鸣', name: '体面式', tpl: '{人群}最大的体面，是{X}', ex: '中年人最大的体面，是不诉苦' },
  { id: 'C12', cat: 'C', catName: '身份共鸣', name: '共同点式', tpl: '{优秀人群}，都有这一个共同点', ex: '存得下钱的人，都有这一个共同点' },
  { id: 'C13', cat: 'C', catName: '身份共鸣', name: '一边一边式', tpl: '谁不是一边{丧}，一边{燃}', ex: '谁不是一边喊累，一边把日子过好' },
  { id: 'D14', cat: 'D', catName: '干货承诺', name: '最好答案式', tpl: '关于{X}，这是我见过最好的答案', ex: '关于要不要报班，这是我见过最好的答案' },
  { id: 'D15', cat: 'D', catName: '干货承诺', name: '重新理解式', tpl: '读完这篇，你会重新理解{X}', ex: '读完这篇，你会重新理解"复利"' },
  { id: 'D16', cat: 'D', catName: '干货承诺', name: '一篇说透式', tpl: '{X}的底层逻辑，一篇说透', ex: '私域运营的底层逻辑，一篇说透' },
  { id: 'D17', cat: 'D', catName: '干货承诺', name: '普通人式', tpl: '普通人最该练的{N}个{X}能力', ex: '普通人最该练的3个表达能力' },
  { id: 'E18', cat: 'E', catName: '数字清单', name: '建议式', tpl: '{N}条建议，送给{处境}的你', ex: '18条建议，送给刚进职场的你' },
  { id: 'E19', cat: 'E', catName: '数字清单', name: '迹象式', tpl: '{N}个迹象，说明{判断}', ex: '5个迹象，说明你正在被工作消耗' },
  { id: 'E20', cat: 'E', catName: '数字清单', name: '讲清式', tpl: '用{N}句话，讲清{复杂概念}', ex: '用7句话，讲清什么是好战略' },
  { id: 'F21', cat: 'F', catName: '热点借势', name: '看到式', tpl: '从{热点}，我看到了{你的角度}', ex: '从这次直播翻车，我看到了流量的代价' },
  { id: 'F22', cat: 'F', catName: '热点借势', name: '真相式', tpl: '{热点}刷屏背后，藏着{N}个真相', ex: '这个AI应用刷屏背后，藏着3个真相' },
  { id: 'F23', cat: 'F', catName: '热点借势', name: '没人说式', tpl: '{热点}火了，但没人告诉你{B面}', ex: 'CityWalk火了，但没人告诉你商家的账' },
  { id: 'G24', cat: 'G', catName: '提问质疑', name: '悖论式', tpl: '为什么越{努力}的人，越{反结果}？', ex: '为什么越省钱的人，越存不下钱？' },
  { id: 'G25', cat: 'G', catName: '提问质疑', name: '必要式', tpl: '{大家默认的事}，真的有必要吗？', ex: '日更，真的有必要吗？' },
  { id: 'G26', cat: 'G', catName: '提问质疑', name: '需要式', tpl: '我们到底需要什么样的{X}', ex: '我们到底需要什么样的AI助手' },
  { id: 'H27', cat: 'H', catName: '反差转折', name: '他却式', tpl: '别人都在{A}，他却{B}', ex: '别人都在卷低价，他却涨价了' },
  { id: 'H28', cat: 'H', catName: '反差转折', name: '不起眼式', tpl: '最不起眼的{X}，往往最{Y}', ex: '最不起眼的复盘，往往最值钱' },
  { id: 'H29', cat: 'H', catName: '反差转折', name: '你以为式', tpl: '你以为的{A}，其实是{B}', ex: '你以为的稳定，其实是温水' },
  { id: 'I30', cat: 'I', catName: '紧迫提醒', name: '就晚了式', tpl: '再不懂{X}，就真的晚了', ex: '再不懂AI工作流，就真的晚了' },
  { id: 'I31', cat: 'I', catName: '紧迫提醒', name: '窗口期式', tpl: '{X}的窗口期，正在关闭', ex: '个人IP的窗口期，正在关闭' },
  { id: 'J32', cat: 'J', catName: '金句标题', name: '金句副题式', tpl: '"{金句}"：{副题}', ex: '"慢慢来，比较快"：写给焦虑的你' },
];

export function formulasDigest() {
  const byCat = {};
  for (const f of FORMULAS) {
    const k = `${f.cat}类·${f.catName}`;
    (byCat[k] = byCat[k] || []).push(`${f.id}${f.name}「${f.tpl}」`);
  }
  return Object.entries(byCat)
    .map(([k, list]) => `${k}：${list.join('；')}`)
    .join('\n');
}
