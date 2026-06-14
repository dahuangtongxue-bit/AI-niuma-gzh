import { topicPrompt, outlinePrompt, articlePrompt, judgePrompt, fixPrompt } from './prompts';
import { combineScore } from './scoring';
import { runQC, violationBrief } from './qc';
import { templateForType } from './articleTemplates';
import { articleToWxHtml, articleToPlain, articleChars } from './wxFormat';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 剥离思考型模型的 <think> 段：完整段删除；未闭合（被截断）则从 <think> 起整体丢弃
function stripThink(s) {
  let t = String(s || '').replace(/<think>[\s\S]*?<\/think>/gi, '');
  const i = t.search(/<think>/i);
  if (i >= 0) t = t.slice(0, i);
  return t.trim();
}

// 加固版 chat：流式直通解析（绕开 Netlify 首字节 504），兼容非流式 JSON
async function chat(messages, { temperature = 0.7, judge = false, max_tokens = 4000 } = {}) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, temperature, judge, max_tokens }),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); if (d.error) msg = d.error; } catch (e) {}
    throw new Error(msg);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('text/event-stream')) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '', delta = '', snapshot = '', sawDelta = false;
    const feed = (payload) => {
      try {
        const j = JSON.parse(payload);
        const c0 = j?.choices?.[0];
        const d = c0?.delta?.content;
        if (typeof d === 'string' && d) { delta += d; sawDelta = true; return; }
        const full = c0?.message?.content ?? c0?.text;
        if (typeof full === 'string' && full) snapshot = full;
      } catch (e) {}
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        feed(payload);
      }
    }
    const tail = buf.trim();
    if (tail.startsWith('data:')) { const p = tail.slice(5).trim(); if (p && p !== '[DONE]') feed(p); }
    const content = stripThink(sawDelta ? delta : snapshot);
    if (!content) throw new Error('流式返回为空：当前模型可能只输出思考过程，请把 LLM_MODEL 换成非思考版');
    return content;
  }

  const data = await res.json().catch(() => ({}));
  if (data.error) throw new Error(data.error);
  let c = data.content ?? data?.choices?.[0]?.message?.content ?? '';
  if (Array.isArray(c)) c = c.map((x) => x?.text || '').join('');
  c = stripThink(c);
  if (!c) throw new Error('上游返回空内容');
  return c;
}

// 防弹 JSON：括号配对提取全部候选 + 从大到小试 + 裸换行/尾逗号自动修复
function extractCandidates(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch !== '{' && ch !== '[') continue;
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (esc) { esc = false; continue; }
      if (inStr) { if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
      if (c === '"') { inStr = true; continue; }
      if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') { depth--; if (depth === 0) { end = j; break; } }
    }
    if (end > i) { out.push(s.slice(i, end + 1)); i = end; }
  }
  return out;
}

function repairJSON(s) {
  let r = '', inStr = false, esc = false;
  for (const c of s) {
    if (esc) { r += c; esc = false; continue; }
    if (inStr) {
      if (c === '\\') { r += c; esc = true; continue; }
      if (c === '"') { inStr = false; r += c; continue; }
      if (c === '\n') { r += '\\n'; continue; }
      if (c === '\r') { r += '\\r'; continue; }
      if (c === '\t') { r += '\\t'; continue; }
      r += c; continue;
    }
    if (c === '"') inStr = true;
    r += c;
  }
  return r.replace(/,\s*([}\]])/g, '$1');
}

function parseJSON(text) {
  const cleaned = String(text).replace(/```json|```/gi, '').trim();
  const cands = extractCandidates(cleaned);
  cands.sort((a, b) => b.length - a.length);
  const tries = cands.length ? cands : [cleaned];
  let lastErr;
  for (const c of tries) {
    try { return JSON.parse(c); } catch (e) { lastErr = e; }
    try { return JSON.parse(repairJSON(c)); } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('未找到可解析的 JSON');
}

async function chatJSON(messages, opts) {
  let lastErr, lastRaw = '';
  for (let i = 0; i < 2; i++) {
    try { lastRaw = await chat(messages, opts); return parseJSON(lastRaw); }
    catch (e) { lastErr = e; if (i === 0) await sleep(1500); }
  }
  const head = String(lastRaw).slice(0, 100).replace(/\s+/g, ' ');
  throw new Error(`输出解析失败：${lastErr?.message || lastErr}${head ? `｜原文开头：${head}…` : ''}`);
}

const now = () =>
  new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

export async function runProduction({ profile, hot, onLog, onNote, shouldStop, feed }) {
  const log = (text, type = 'info') => onLog && onLog({ time: now(), text, type });

  log('打卡上班 ✓ 正在复习《标题32式》《开头钩子库》和排版规范…');

  let topics = [];
  let topic;
  if (feed && feed.theme) {
    // ─ 投喂模式：跳过海选，直接用老板指定主题成稿 ─
    log(`收到本篇投喂任务：「${feed.theme}」 · 文风：${feed.tone}`);
    if (feed.photos && feed.photos.length) log(`已收到 ${feed.photos.length} 张真实照片${feed.coverDataUrl && !feed.useAIImage ? '，其中 1 张将作头图' : ''}`);
    topic = {
      title: feed.theme,
      type: feed.structureKey && feed.structureKey !== 'auto' ? feed.structure : '观点',
      angle: '紧扣投喂主题展开',
      keyword: feed.theme,
      score: '-',
    };
  } else {
    // ─ 选题海选 ─
    log(hot ? '收到热点情报，开始选题海选（转发价值优先）…' : '开始选题海选（5 个候选，转发价值优先）…');
    const topicData = await chatJSON(topicPrompt(profile, hot), { temperature: 0.85 });
    topics = (topicData.topics || []).filter((t) => t && t.title).slice(0, 5);
    if (topics.length === 0) throw new Error('选题引擎未返回有效选题');
    topics.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
    topic = topics[0];
    const losersBrief = topics.slice(1).map((t) => `「${t.title}」${t.score || '-'}分`).join('；');
    log(`选题定稿：「${topic.title}」（${topic.score}分·${topic.type}）。落选：${losersBrief}`, 'cut');
  }

  if (shouldStop && shouldStop()) { log('已收到叫停指令，停止生产。', 'warn'); return { topics, notes: [] }; }

  // ─ 大纲 + 标题 ─
  const tpl = templateForType(topic.type);
  log(`按模板${tpl.id}「${tpl.name}」起大纲，同步海选 10 个标题…`);
  const outline = await chatJSON(outlinePrompt(profile, topic, tpl, feed), { temperature: 0.85, max_tokens: 3000 });
  const rawTitles = (outline.titles || [])
    .map((t) => (typeof t === 'string' ? { text: t, formula: '' } : t))
    .filter((t) => t && t.text)
    .slice(0, 10);
  if (rawTitles.length === 0) throw new Error('未生成有效标题');
  log(`大纲就绪：${(outline.outline || []).length} 个小节，开头走 ${outline.opening_plan?.style || 'O01'} 式。开始成文（${tpl.words[0]}~${tpl.words[1]}字）…`, 'ok');

  // ─ 成文 → 标题评分（串行，避开网关并发限流 429）─
  let article;
  try {
    article = await chatJSON(articlePrompt(profile, topic, tpl, outline, feed), { temperature: 0.8, max_tokens: 6000 });
  } catch (e) {
    throw new Error(`成文失败：${e?.message || e}`);
  }
  if (shouldStop && shouldStop()) { log('已收到叫停指令，正文已生成但停止后续。', 'warn'); }
  await sleep(1200);
  let judged = [];
  try {
    judged = await chatJSON(judgePrompt(rawTitles.map((t) => t.text), profile), { temperature: 0.2, judge: true });
  } catch (e) {
    log(`评分模型异常，标题降级为硬规则打分（${e?.message || ''}）`, 'warn');
  }

  // ─ 标题 10 进 3 ─
  const jm = {};
  if (Array.isArray(judged)) for (const j of judged) if (j && typeof j === 'object' && Number.isInteger(j.i)) jm[j.i] = j;
  const scored = rawTitles.map((t, i) => {
    const j = jm[i] || {};
    return { ...t, ...combineScore(t.text, j.s, j.why) };
  });
  scored.sort((a, b) => b.total - a.total);
  const passed = scored.filter((s) => s.pass);
  const top3 = (passed.length >= 3 ? passed : scored).slice(0, 3);
  const rejected = scored.filter((s) => !top3.includes(s));
  log(`标题定稿：「${top3[0].text}」（${top3[0].total}分），淘汰 ${rejected.length} 条`, 'cut');

  // ─ 质检 + 打回返工（最多1次）─
  let qc = runQC(article, top3[0].text, tpl.id);
  log(`质检：${qc.rules.filter((r) => r.pass).length}/${qc.rules.length} 项通过，全文 ${qc.words} 字`, qc.pass ? 'ok' : 'warn');
  if (!qc.pass) {
    const brief = violationBrief(qc);
    log(`硬规则未达标，打回返工：${brief}`, 'warn');
    try {
      const fixed = await chatJSON(fixPrompt(article, brief), { temperature: 0.4, max_tokens: 6000 });
      if (fixed?.sections?.length) {
        article = { ...article, ...fixed };
        qc = runQC(article, top3[0].text, tpl.id);
        log(`返工后复检：${qc.rules.filter((r) => r.pass).length}/${qc.rules.length} 项通过${qc.pass ? ' ✓' : '（仍有未达标项已标注，请验收留意）'}`, qc.pass ? 'ok' : 'warn');
      }
    } catch (e) {
      log(`返工失败（${e.message}），按原稿交付并标注问题`, 'warn');
    }
  }

  // ─ 排版引擎 ─
  const theme = profile.theme || '微信绿';
  const wxHtml = articleToWxHtml(article, theme, profile.mpName);
  const plain = articleToPlain(article);
  log(`排版引擎出稿：主题色「${theme}」，内联样式 ${Math.round(wxHtml.length / 1000)}k 字符，可直接粘贴后台 ✓`, 'ok');

  // ─ 配图收集：头图（投喂的真实照片优先）+ 金句卡×2 ─
  const cards = [];
  if (feed && feed.coverDataUrl && !feed.useAIImage) {
    cards.push({ tpl: 'C_PHOTO', bgDataUrl: feed.coverDataUrl, title: outline.cover?.title || top3[0].text, mpName: profile.mpName, label: '头图(真实照片)' });
    log('头图采用老板提供的真实照片 ✓', 'ok');
  } else if (outline.cover) {
    cards.push({ ...outline.cover, mpName: profile.mpName, label: '头图' });
  }
  const quotes = (article.quotes_for_card || []).filter(Boolean).slice(0, 2);
  quotes.forEach((q, i) => {
    cards.push({ tpl: i === 0 ? 'Q_LIGHT' : 'Q_DARK', quote: q, mpName: profile.mpName, label: `金句卡${i + 1}` });
  });
  log(`配图工厂完工：头图 1 张 + 金句卡 ${quotes.length} 张`, 'ok');

  const note = {
    id: 0,
    topic,
    losers: topics.slice(1),
    tpl: tpl.id,
    tplName: tpl.name,
    titles: top3,
    rejected,
    article,
    words: articleChars(article),
    summary: article.summary || outline.summary || '',
    qc,
    wxHtml,
    plain,
    cards,
    theme,
    tip: outline.tip || '',
    photos: (feed && feed.photos) || [],
  };
  onNote && onNote(note);
  log('今日头条稿交付完成，请老板验收 ✓', 'ok');
  return { topics, notes: [note] };
}
