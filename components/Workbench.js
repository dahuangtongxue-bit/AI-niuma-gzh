'use client';

import { useEffect, useState, useRef } from 'react';
import EmployeeCard from './EmployeeCard';
import DnaBar from './DnaBar';
import WorkLog from './WorkLog';
import ArticleCard from './ArticleCard';
import FeedPanel from './FeedPanel';
import { runProduction } from '@/lib/pipeline';

const todayKey = () => {
  const d = new Date();
  return `mp-delivery:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Workbench({ profile, onRetrain }) {
  const [mode, setMode] = useState('feed');
  const [hot, setHot] = useState('');
  const [status, setStatus] = useState('idle');
  const stopRef = useRef({ stop: false });
  const [logs, setLogs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(todayKey());
      if (saved) {
        const data = JSON.parse(saved);
        setNotes(data.notes || []);
        setLogs(data.logs || []);
        if ((data.notes || []).length > 0) setStatus('done');
      }
    } catch (e) { /* 忽略坏数据 */ }
  }, []);

  function stopWork() { stopRef.current.stop = true; }

  async function run(extra) {
    stopRef.current = { stop: false };
    setStatus('working');
    setError('');
    setNotes([]);
    const collected = { logs: [], notes: [] };
    setLogs([]);
    try {
      await runProduction({
        profile,
        hot: hot.trim(),
        shouldStop: () => stopRef.current.stop,
        ...extra,
        onLog: (entry) => { collected.logs.push(entry); setLogs((prev) => [...prev, entry]); },
        onNote: (note) => { collected.notes.push(note); setNotes((prev) => [...prev, note]); },
      });
      setStatus('done');
      try { localStorage.setItem(todayKey(), JSON.stringify(collected, (k, v) => ((k === 'bgDataUrl' || k === 'photos' || k === 'coverDataUrl') ? undefined : v))); } catch (e) {}
    } catch (e) {
      setStatus(notes.length > 0 ? 'done' : 'idle');
      setError(String(e.message || e));
    }
  }
  const start = () => run({});
  const startFeed = (feed) => run({ feed });

  const dateStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="workbench">
      <div className="lanyard" />
      <header className="topbar">
        <EmployeeCard profile={profile} mini />
        <div className="topbarRight">
          <span className="topbarDate">{dateStr}</span>
          <button className="btn btnGhost btnSmall" onClick={onRetrain}>重新培训（改档案）</button>
        </div>
      </header>

      <DnaBar />

      <div className="modeTabs">
        <button className={`modeTab ${mode === 'feed' ? 'on' : ''}`} onClick={() => status !== 'working' && setMode('feed')}>
          📸 投喂一篇<span>给素材，精做一篇</span>
        </button>
        <button className={`modeTab ${mode === 'daily' ? 'on' : ''}`} onClick={() => status !== 'working' && setMode('daily')}>
          🗓 自主头条<span>阿文自己选题</span>
        </button>
      </div>

      {mode === 'feed' ? (
        <div className="card controlCard feedControlCard">
          <FeedPanel working={status === 'working'} onProduce={startFeed} onStop={stopWork} />
        </div>
      ) : (
        <div className="card controlCard">
          <div className="controlLeft">
            <div className="sectionLabel">今日热点投喂（可选）</div>
            <textarea
              rows={2}
              value={hot}
              onChange={(e) => setHot(e.target.value)}
              placeholder="把微博热搜、刷屏事件、行业新闻、对标爆款标题贴进来，阿文会结合选题。空着也能干活。"
              disabled={status === 'working'}
            />
          </div>
          <div className="controlRight">
            <button
              className={`btn btnBig ${status === 'working' ? 'btnStop' : 'btnPrimary'}`}
              onClick={status === 'working' ? stopWork : start}
            >
              {status === 'working' ? '⏹ 阿文执笔中…点此叫停' : status === 'done' ? '重写今日头条稿' : '阿文，开工'}
            </button>
            <div className="controlHint">交付物：1 篇排版成稿＋标题Top3＋头图＋金句卡＋摘要</div>
          </div>
        </div>
      )}

      {error ? (
        <div className="card errorCard">
          生产中断：{error}
          <div className="errorHint">排查：① 含 429 → 网关并发/频率限流（已串行+重试）；② 含「思考过程/空内容」→ LLM_MODEL 换非思考版；③ 含 504/超时 → 模型出字太慢，换更快的模型；④ 走截图入职需配 LLM_MODEL_VISION。</div>
        </div>
      ) : null}

      <div className="mainGrid">
        <div className="deliverCol">
          {notes.length === 0 && status !== 'working' ? (
            <div className="card emptyCard">
              <div className="emptyEmoji">📰</div>
              <div>{mode === 'feed' ? '上面给阿文投喂素材：照片＋主题＋文风，她精做一篇头条给你。' : '交付区还是空的。点「阿文，开工」，几分钟后来收今天的头条稿。'}</div>
            </div>
          ) : null}
          {status === 'working' && notes.length === 0 ? (
            <div className="card emptyCard">
              <div className="emptyEmoji">⏳</div>
              <div>编辑部运转中——右侧工作日志可以看她选题、起纲、成文、被质检打回的全过程。</div>
            </div>
          ) : null}
          {notes.map((n, i) => (
            <ArticleCard note={n} key={n.id ?? i} />
          ))}
        </div>
        <div className="logCol">
          <WorkLog entries={logs} />
        </div>
      </div>
    </div>
  );
}
