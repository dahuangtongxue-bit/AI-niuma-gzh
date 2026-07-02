import { formulasDigest } from './titleFormulas';
import { openingsDigest } from './openings';
import { ARTICLE_TEMPLATES, templatesDigest } from './articleTemplates';
import { COVER_SPEC } from '@/components/cards/templates';
import { currentDnaBlock } from './dna';

const JSON_ONLY = '只输出 JSON 本体，禁止输出任何解释、前言、markdown 代码围栏。';

function profileBrief(p) {
  const dnaBlock = currentDnaBlock();
  const sig = (p.signatures || []).filter(Boolean).map((s) => `  · ${s}`).join('\n');
  const diff = (p.differentiators || []).filter(Boolean).map((s) => `  · ${s}`).join('\n');
  const hl = (p.highlights || []).filter(Boolean).map((s) => `  · ${s}`).join('\n');
  return [
    dnaBlock ? dnaBlock + '\n\n【员工本地补充档案（若与品牌DNA冲突，以品牌DNA为准）】' : '',
    `公众号/主体名称：${p.mpName || p.name || '（未提供，绝不可自行编造）'}`,
    p.category ? `品类：${p.category}` : '',
    `行业/内容定位：${p.industry || p.category || ''}`,
    `业务一句话：${p.product || p.persona || ''}`,
    (p.city || p.area) ? `位置：${[p.city, p.area].filter(Boolean).join(' ')}` : '',
    p.persona ? `主体人设/口吻：${p.persona}` : '',
    sig ? `真实招牌/业务（只能写这些，不得编造新项目）：\n${sig}` : (p.sellingPoints ? `核心观点/卖点：${p.sellingPoints}` : ''),
    diff ? `真实差异点：\n${diff}` : '',
    hl ? `可写成内容的真实亮点：\n${hl}` : '',
    `目标读者：${p.audience || ''}`,
    `语气风格：${p.tone || '专业可信'}`,
    p.landing ? `引流/到店信息（必须自然写进文末，作为行动指引）：${p.landing}` : '',
    p.tabooConfirmed ? `禁止写入（疑似夸大宣传）：${p.tabooConfirmed}` : '',
    p.forbidden ? `品牌禁忌词（绝不可出现）：${p.forbidden}` : '',
    p.benchmarks ? `对标参考：\n${p.benchmarks}` : '',
  ].filter(Boolean).join('\n');
}

// 真实创作铁律：所有引擎共用
const REALITY_RULE = `\n\n【真实创作铁律 · 最高优先级】
1. 你是这个真实主体（门店/品牌/机构）自己的运营，不是写虚构稿。文中出现的名称、地址、产品、价格、数据、故事，必须全部来自上面的真实档案。
2. 档案里没有的名称/分店/产品/数据一律不许编造，也不要用"某网红""听说"这类含糊指代。
3. 招牌/业务只能从真实档案里选，可围绕真实细节展开，但不得无中生有。
4. 以本主体视角写，让读者知道这是它在分享/自述，并据此能找上门或联系。
5. 文末自然带上引流/到店信息，给出明确的行动指引。`

/** 选题海选：5个候选带推荐指数，员工自行定稿1个 */
export function topicPrompt(profile, hotTopics) {
  const system = `你是「阿文」，资深公众号主笔兼运营。公众号是转发逻辑：选题的第一标准是"读者愿意转发到朋友圈/点在看"，第二是搜一搜长尾价值。
5个候选选题要求：
1. 类型覆盖：观点/干货/故事/热评/清单 中至少 4 种（type 字段从这5个词里选）
2. 每个选题给推荐指数 score（1-10，严格拉开差距）和一句理由；指数最高的将直接投产
3. 必须从目标读者的真实处境出发替读者说话，禁止自嗨式品牌宣传
4. 每个选题绑定一个搜一搜关键词
${hotTopics ? '5. 老板投喂了热点情报，至少 2 个候选要自然结合热点（type=热评优先）' : ''}
6. 选题必须能用本主体真实招牌/差异点/亮点写出来，不得策划需编造事实才能完成的选题${REALITY_RULE}
${JSON_ONLY}`;

  const user = `入职档案：
${profileBrief(profile)}
${hotTopics ? `\n今日热点情报（老板投喂）：\n${hotTopics}` : ''}

输出 JSON：
{"topics":[{"title":"选题一句话","type":"观点|干货|故事|热评|清单","angle":"切入角度30字内","keyword":"搜一搜关键词","score":8,"reason":"推荐理由40字内"}]}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/** 第一阶段：大纲 + 10个候选标题 + 摘要 + 头图文案 */
export function outlinePrompt(profile, topic, tpl, feed) {
  const system = `你是「阿文」，资深公众号主笔。先出大纲再动笔，这是长文质量的生命线。

【结构工艺】本文使用模板${tpl.id}「${tpl.name}」（${tpl.words[0]}~${tpl.words[1]}字），结构：${tpl.blocks}
小标题 3~5 个，每个小节规划 2~4 个论证要点。

【开头工艺】从《开头钩子库》选定一式并写出开头方案：
${openingsDigest()}

【标题工艺】产出 10 个候选标题，覆盖至少 4 个大类，每条 ≤30 字、前 13 字出钩子、标注公式编号、与正文必须能兑现（标题党会被平台限流）。公式库：
${formulasDigest()}
违禁（绝不可出现）：最X/第一/100%/治疗/稳赚/不转不是/转发抽奖/集赞/震惊。

【摘要工艺】群发摘要 40~110 字：一句钩子 + 一句价值承诺，不剧透结论。

【头图工艺】从以下版式选一个并填写字段：
${COVER_SPEC}${REALITY_RULE}

${JSON_ONLY}`;

  const user = `入职档案：
${profileBrief(profile)}

今日定稿选题：${topic.title}
切入角度：${topic.angle}
搜一搜关键词：${topic.keyword}
文章类型：${topic.type}
${feed ? `\n【老板特别投喂——必须严格遵循】\n· 主题/角度：${feed.theme}\n· 文风要求：${feed.tone}\n${feed.structureKey && feed.structureKey !== 'auto' ? '· 结构倾向：' + feed.structure : ''}\n${feed.photos && feed.photos.length ? '· 老板提供了 ' + feed.photos.length + ' 张真实照片，文中配图处可呼应，但不得脑补照片没有的内容。' : ''}\n紧扣此主题展开，文风严格按要求，不要跑回泛泛的品牌介绍。` : ''}

输出 JSON：
{
"titles":[{"text":"标题","formula":"公式编号"}],
"opening_plan":{"style":"O编号","draft":"开头首段草案≤100字"},
"outline":[{"heading":"小标题","points":["要点1","要点2"]}],
"summary":"群发摘要",
"cover":{"tpl":"版式ID","title":"≤12字","highlight":"高亮词","sub":"副题","num":"","badge":"≤4字"},
"tip":"发布建议（时段+置顶留言话术，45字内）"
}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/** 第二阶段：按纲成文 */
export function articlePrompt(profile, topic, tpl, outline, feed) {
  const system = `你是「阿文」，资深公众号主笔。现在按已定大纲成文，工艺标准（质检环会逐条机检，违者打回）：
- 总字数 ${tpl.words[0]}~${tpl.words[1]} 字；单段 ≤150 字；段落多分段，移动端阅读节奏
- 开头：按 opening_plan 落笔，首段 ≤100 字，开头总共 ≤3 段
- 每个小节 2~5 段；每个小节配 1 句金句（quote 字段，二元重定义/对仗/扎心反问句式优先）
- 重点短语用【】包裹（每段至多 1 处），排版引擎会渲染为主题色加粗
- 结尾 2~3 段：压轴金句 + 一个互动提问（"你怎么看/留言聊聊"风格，克制，只 1 处）
- 从全文提炼 2 句最强金句进 quotes_for_card（≤30字/句，独立成立、适合转发朋友圈）
- 语气：${profile.tone}；通篇替读者说话，案例具体，禁空话套话
- 文中需要配图处用独立段落标注：【配图：画面描述】（最多2处，可没有）
${feed ? '- 本篇按老板投喂主题「' + feed.theme + '」写，文风：' + feed.tone + '，紧扣主题不跑偏' : ''}${REALITY_RULE}
${JSON_ONLY}`;

  const user = `入职档案：
${profileBrief(profile)}

选题：${topic.title}（${topic.type}）
搜一搜关键词：${topic.keyword}（正文前200字自然出现2次）
开头方案：${outline.opening_plan?.style || 'O01'}「${outline.opening_plan?.draft || ''}」
大纲：
${(outline.outline || []).map((s, i) => `${i + 1}. ${s.heading}：${(s.points || []).join('；')}`).join('\n')}

输出 JSON：
{
"opening":["首段≤100字","第二段"],
"sections":[{"heading":"小标题","paras":["段落…"],"quote":"本节金句"}],
"ending":["压轴段","互动提问段"],
"quotes_for_card":["金句1","金句2"]
}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/** 标题评委 */
export function judgePrompt(titles, profile) {
  const system = `你是公众号内容质检员，按打分卡给标题打分，每维 0-2 分：
- 钩子强度：0=平淡；1=有钩子；2=前13字即出强钩子
- 搜一搜价值：0=无人会搜；1=含相关词；2=核心搜索词靠前
- 人群共鸣：0=泛泛；1=隐含人群；2=目标读者觉得"在替我说话"
- 具体程度：0=全是big word；1=有具体信息；2=含数字/身份/场景
打分严格拉开差距，禁止全给2分。${JSON_ONLY}`;

  const user = `目标读者：${profile.audience}
搜一搜关键词参考：${profile.industry}

待打分标题：
${titles.map((t, i) => `${i}. ${t}`).join('\n')}

输出 JSON（s=[钩子,搜一搜,共鸣,具体]）：
[{"i":0,"s":[2,1,2,1],"why":"≤15字短评"}]`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/** 质检打回返工 */
export function fixPrompt(article, brief) {
  const system = `你是「阿文」。你刚交的文章被质检环打回，按违规清单最小幅度修订：保持选题、结构、小标题和字段 schema 完全不变，只修不达标处（如拆分超长段、增删字数、替换违禁词）。${JSON_ONLY}`;
  const user = `违规清单：${brief}

原稿 JSON：
${JSON.stringify(article)}

输出修订后的同 schema 完整 JSON（opening/sections/ending/quotes_for_card 全部字段）。`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export { ARTICLE_TEMPLATES, templatesDigest };
