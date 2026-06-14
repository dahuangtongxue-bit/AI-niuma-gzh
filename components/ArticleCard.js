'use client';

import { useState } from 'react';
import CardsStrip from './cards/CardsStrip';
import { copyRich } from '@/lib/wxFormat';

function CopyBtn({ text, label = '复制' }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch (e) { /* 忽略 */ }
  }
  return (
    <button className="btn btnGhost btnSmall" onClick={copy}>
      {done ? '已复制 ✓' : label}
    </button>
  );
}

export default function ArticleCard({ note }) {
  const [showRejected, setShowRejected] = useState(false);
  const [showLoserTopics, setShowLoserTopics] = useState(false);
  const [richState, setRichState] = useState('');

  async function copyFormatted() {
    setRichState('busy');
    const ok = await copyRich(note.wxHtml, note.plain);
    setRichState(ok ? 'done' : 'fail');
    setTimeout(() => setRichState(''), 2000);
  }

  return (
    <div className="card noteCard">
      <div className="noteHead">
        <span className="noteIndex mono">今日头条稿</span>
        <span className="noteTopic">{note.topic.title}</span>
        <span className="chip">{note.topic.type}</span>
        <span className="chip">模板{note.tpl}·{note.words}字</span>
      </div>

      <div className="publishBar">
        <div className="publishSteps">
          <span className="pStep">① 复制带排版正文 → 公众号后台粘贴</span>
          <span className="pStep">② 下方打包下载头图+金句卡</span>
          <span className="pStep">③ 配图上传 → 群发</span>
        </div>
        <div className="publishBtns">
          <button className="btn btnPrimary btnSmall" onClick={copyFormatted} disabled={richState === 'busy'}>
            {richState === 'done' ? '已复制，去后台粘贴 ✓' : richState === 'fail' ? '复制失败，请重试' : '📋 复制带排版正文（直接贴后台）'}
          </button>
          <CopyBtn text={`${note.titles[0]?.text || ''}`} label="复制标题" />
          <CopyBtn text={note.summary} label="复制摘要" />
        </div>
      </div>

      <button className="linkBtn" onClick={() => setShowLoserTopics(!showLoserTopics)}>
        {showLoserTopics ? '收起落选选题 ▲' : `查看落选的 ${note.losers.length} 个选题及评分 ▼`}
      </button>
      {showLoserTopics ? (
        <div className="rejectedBox">
          {note.losers.map((t, i) => (
            <div className="rejectedRow" key={i}>
              <span className="mono rejectedScore">{t.score || '-'}分</span>
              <span className="rejectedText">{t.title}</span>
              <span className="rejectedWhy">{t.reason}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* 标题 Top3 */}
      <div className="sectionLabel" style={{ marginTop: 14 }}>标题 Top3（10 进 3）</div>
      {note.titles.map((t, i) => (
        <div className="titleRow" key={i}>
          <span className={`scoreBadge ${t.total >= 9 ? 'scoreHigh' : ''}`}>{t.total}分</span>
          <span className="titleText">{t.text}</span>
          <CopyBtn text={t.text} />
        </div>
      ))}
      <button className="linkBtn" onClick={() => setShowRejected(!showRejected)}>
        {showRejected ? '收起淘汰区 ▲' : `查看被淘汰的 ${note.rejected.length} 条标题及原因 ▼`}
      </button>
      {showRejected ? (
        <div className="rejectedBox">
          {note.rejected.map((r, i) => (
            <div className="rejectedRow" key={i}>
              <span className="mono rejectedScore">{r.total}分</span>
              <span className="rejectedText">{r.text}</span>
              {r.reasons?.length ? <span className="rejectedWhy">{r.reasons[0]}</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* 摘要 */}
      <div className="sectionLabel" style={{ marginTop: 16 }}>群发摘要 <CopyBtn text={note.summary} /></div>
      <div className="summaryBox">{note.summary}</div>

      {/* 排版预览 + 复制 */}
      <div className="previewGrid">
        <div>
          <div className="sectionLabel" style={{ marginTop: 16 }}>排版预览（所见即所得）</div>
          <div className="phoneFrame">
            <div className="phoneBar">{note.titles[0]?.text}</div>
            <div className="wxPreview" dangerouslySetInnerHTML={{ __html: note.wxHtml }} />
          </div>
        </div>
        <div className="previewSide">
          <div className="sectionLabel" style={{ marginTop: 16 }}>质检报告（机检）</div>
          <div className="qcGrid">
            {(note.qc?.rules || []).map((r) => (
              <div className={`qcChip ${r.pass ? 'qcPass' : 'qcFail'}`} key={r.id} title={r.detail}>
                {r.pass ? '✓' : '✗'} {r.name}
              </div>
            ))}
          </div>
          {(note.qc?.rules || []).filter((r) => !r.pass).map((r) => (
            <div className="hintWarn" key={r.id}>✗ {r.name}：{r.detail}</div>
          ))}

          <div className="sectionLabel" style={{ marginTop: 18 }}>交付动作</div>
          <button className="btn btnPrimary" style={{ width: '100%' }} onClick={copyFormatted} disabled={richState === 'busy'}>
            {richState === 'done' ? '已复制，去后台粘贴 ✓' : richState === 'fail' ? '复制失败，请重试' : '复制带排版正文（贴进公众号后台）'}
          </button>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <CopyBtn text={note.plain} label="复制纯文本" />
            <CopyBtn text={`${note.titles[0]?.text || ''}\n\n${note.summary}`} label="复制标题+摘要" />
          </div>

          {note.cards?.length ? (
            <>
              <div className="sectionLabel" style={{ marginTop: 18 }}>头图 + 金句卡（{note.theme}）</div>
              <CardsStrip cards={note.cards} theme={note.theme} filename="今日头条稿" />
            </>
          ) : null}
        </div>
      </div>

      {note.tip ? <div className="tipLine">📮 发布建议：{note.tip}</div> : null}
    </div>
  );
}
