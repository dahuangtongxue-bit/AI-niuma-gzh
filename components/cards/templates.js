// 头图/金句卡工厂：头图 900×383（2.35:1），金句卡 1080×1440（3:4）
// 配色跟随公众号主题色（与排版引擎 THEMES 同名联动）

const SANS = "'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif";
const SERIF = "'Noto Serif SC','Songti SC','SimSun',serif";

export const PALETTES = {
  微信绿: { grad: 'linear-gradient(135deg,#0BD168 0%,#067F44 100%)', accent: '#07C160', deep: '#069A4F', softBg: '#F0FAF4', ink: '#16321F' },
  靛蓝: { grad: 'linear-gradient(135deg,#4C6EF5 0%,#2C3FA3 100%)', accent: '#3B5BDB', deep: '#2F4AB8', softBg: '#F0F3FE', ink: '#1B2547' },
  砖红: { grad: 'linear-gradient(135deg,#E03131 0%,#9C1C1C 100%)', accent: '#C92A2A', deep: '#A61E1E', softBg: '#FCF1F0', ink: '#3D1414' },
  紫罗兰: { grad: 'linear-gradient(135deg,#845EF7 0%,#5235AC 100%)', accent: '#7048E8', deep: '#5B36C9', softBg: '#F5F1FE', ink: '#2A1B52' },
  墨金: { grad: 'linear-gradient(135deg,#C49A6C 0%,#7E5F3E 100%)', accent: '#B08968', deep: '#94714F', softBg: '#FAF5EE', ink: '#33271A' },
};

function coverSize(t) {
  const n = (t || '').length;
  if (n <= 6) return 96;
  if (n <= 9) return 82;
  if (n <= 12) return 70;
  return 58;
}

function Hl({ text, highlight, color, hlColor }) {
  if (highlight && text && text.includes(highlight)) {
    const i = text.indexOf(highlight);
    return (
      <span style={{ color }}>
        {text.slice(0, i)}
        <span style={{ color: hlColor }}>{highlight}</span>
        {text.slice(i + highlight.length)}
      </span>
    );
  }
  return <span style={{ color }}>{text}</span>;
}

const coverFrame = (extra) => ({
  width: 900, height: 383, fontFamily: SANS, boxSizing: 'border-box',
  display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', ...extra,
});

/* C_PHOTO 真实照片头图（照片铺底+渐变压暗+叠标题） */
function C_PHOTO({ d, p }) {
  return (
    <div style={coverFrame({ background: '#1B1B1B', justifyContent: 'flex-end', padding: 0 })}>
      {d.bgDataUrl ? (
        <img src={d.bgDataUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.35) 55%, rgba(0,0,0,.15) 100%)' }} />
      <div style={{ position: 'relative', padding: '0 56px 46px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ alignSelf: 'flex-start', background: p.accent, color: '#fff', borderRadius: 999, padding: '5px 18px', fontSize: 20, fontWeight: 800 }}>
          {d.badge || (d.mpName || '本店')}
        </div>
        <div style={{ fontSize: coverSize(d.title), fontWeight: 900, lineHeight: 1.2, color: '#fff', textShadow: '0 3px 18px rgba(0,0,0,.7)', letterSpacing: 1 }}>
          <Hl text={d.title} highlight={d.highlight} color="#FFFFFF" hlColor={p.accent === '#07C160' ? '#7Bed9f' : '#FFD43B'} />
        </div>
      </div>
    </div>
  );
}

/* C_BANNER 主题色大字横版 */
function C_BANNER({ d, p }) {
  return (
    <div style={coverFrame({ background: p.grad, padding: '44px 56px', justifyContent: 'space-between' })}>
      <div style={{ alignSelf: 'flex-start', border: '3px solid rgba(255,255,255,.9)', color: '#fff', borderRadius: 999, padding: '6px 22px', fontSize: 24, fontWeight: 700 }}>
        {d.badge || '深度'}
      </div>
      <div style={{ fontSize: coverSize(d.title), fontWeight: 900, lineHeight: 1.25, letterSpacing: 2 }}>
        <Hl text={d.title} highlight={d.highlight} color="#FFFFFF" hlColor="rgba(255,255,255,.65)" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,.85)', fontSize: 22 }}>
        <span>{d.sub || ''}</span>
        <span style={{ fontWeight: 700 }}>{d.mpName || ''}</span>
      </div>
    </div>
  );
}

/* C_QUOTE 引言式浅底 */
function C_QUOTE({ d, p }) {
  return (
    <div style={coverFrame({ background: p.softBg, padding: '40px 56px', justifyContent: 'center' })}>
      <div style={{ position: 'absolute', top: -30, left: 36, fontSize: 200, fontWeight: 900, color: p.accent, opacity: 0.18, fontFamily: SERIF, lineHeight: 1 }}>“</div>
      <div style={{ fontSize: Math.min(coverSize(d.title), 76), fontWeight: 900, lineHeight: 1.35, letterSpacing: 1 }}>
        <Hl text={d.title} highlight={d.highlight} color={p.ink} hlColor={p.accent} />
      </div>
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 46, height: 4, background: p.accent }} />
        <span style={{ color: p.ink, opacity: 0.65, fontSize: 22, fontWeight: 600 }}>{d.mpName || d.sub || ''}</span>
      </div>
    </div>
  );
}

/* C_NUM 数字式 */
function C_NUM({ d, p }) {
  return (
    <div style={coverFrame({ background: '#1B1B1F', padding: '40px 56px', flexDirection: 'row', alignItems: 'center', gap: 40 })}>
      <div style={{ fontSize: 220, fontWeight: 900, lineHeight: 1, color: p.accent, textShadow: '0 10px 0 rgba(255,255,255,.08)', flex: 'none' }}>{d.num || '3'}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: Math.min(coverSize(d.title), 70), fontWeight: 900, lineHeight: 1.3, color: '#fff' }}>
          <Hl text={d.title} highlight={d.highlight} color="#FFFFFF" hlColor={p.accent} />
        </div>
        <div style={{ marginTop: 14, color: 'rgba(255,255,255,.6)', fontSize: 22 }}>{d.sub || d.mpName || ''}</div>
      </div>
    </div>
  );
}

/* C_MINIMAL 色块极简 */
function C_MINIMAL({ d, p }) {
  return (
    <div style={coverFrame({ background: '#FFFFFF', flexDirection: 'row' })}>
      <div style={{ width: 18, background: p.grad, flex: 'none' }} />
      <div style={{ flex: 1, padding: '44px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ color: p.accent, fontSize: 22, fontWeight: 800, letterSpacing: 4, marginBottom: 16 }}>{(d.badge || '专栏').toUpperCase()}</div>
        <div style={{ fontSize: Math.min(coverSize(d.title), 78), fontWeight: 900, lineHeight: 1.3 }}>
          <Hl text={d.title} highlight={d.highlight} color="#1B1B1F" hlColor={p.accent} />
        </div>
        <div style={{ marginTop: 18, color: '#8A8A8E', fontSize: 21 }}>{d.sub || ''}　{d.mpName || ''}</div>
      </div>
    </div>
  );
}

/* ── 金句卡 1080×1440 ── */
const quoteFrame = (extra) => ({
  width: 1080, height: 1440, fontFamily: SANS, boxSizing: 'border-box',
  display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', ...extra,
});

function quoteSize(t) {
  const n = (t || '').length;
  if (n <= 12) return 110;
  if (n <= 20) return 92;
  if (n <= 30) return 78;
  return 64;
}

/* Q_LIGHT 浅底经典 */
function Q_LIGHT({ d, p }) {
  const today = new Date();
  const dateStr = `${today.getFullYear()} / ${String(today.getMonth() + 1).padStart(2, '0')} / ${String(today.getDate()).padStart(2, '0')}`;
  return (
    <div style={quoteFrame({ background: p.softBg, padding: '130px 110px' })}>
      <div style={{ fontSize: 300, fontWeight: 900, color: p.accent, lineHeight: 0.5, fontFamily: SERIF }}>“</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: quoteSize(d.quote), fontWeight: 800, lineHeight: 1.7, color: p.ink, fontFamily: SERIF, letterSpacing: 2 }}>{d.quote}</div>
      </div>
      <div style={{ borderTop: `3px solid ${p.accent}`, paddingTop: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: p.accent }}>{d.mpName || ''}</span>
        <span style={{ fontSize: 32, color: p.ink, opacity: 0.5, letterSpacing: 3 }}>{dateStr}</span>
      </div>
    </div>
  );
}

/* Q_DARK 深底主题色 */
function Q_DARK({ d, p }) {
  return (
    <div style={quoteFrame({ background: '#17171B', padding: '130px 110px' })}>
      <div style={{ width: 90, height: 10, background: p.accent }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: quoteSize(d.quote), fontWeight: 800, lineHeight: 1.75, color: '#F4F4F5', letterSpacing: 2 }}>{d.quote}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 34, fontWeight: 900 }}>{(d.mpName || '文')[0]}</span>
        <span style={{ fontSize: 38, fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>{d.mpName || ''}</span>
      </div>
    </div>
  );
}

export const CARDS = {
  C_PHOTO: { name: '照片头图', Comp: C_PHOTO, w: 900, h: 383 },
  C_BANNER: { name: '主题色大字横版', Comp: C_BANNER, w: 900, h: 383 },
  C_QUOTE: { name: '引言式头图', Comp: C_QUOTE, w: 900, h: 383 },
  C_NUM: { name: '数字式头图', Comp: C_NUM, w: 900, h: 383 },
  C_MINIMAL: { name: '色块极简头图', Comp: C_MINIMAL, w: 900, h: 383 },
  Q_LIGHT: { name: '金句卡·浅', Comp: Q_LIGHT, w: 1080, h: 1440 },
  Q_DARK: { name: '金句卡·深', Comp: Q_DARK, w: 1080, h: 1440 },
};

// 注入提示词的头图规格（金句卡由代码自动构建，不需模型填字段）
export const COVER_SPEC = `C_BANNER 主题色大字横版（通用首选）字段：title≤12字, highlight, sub≤14字, badge≤4字
C_QUOTE 引言式头图（观点/情感文）字段：title≤14字（可为标题或金句）, highlight
C_NUM 数字式头图（清单/数字标题）字段：title≤10字, highlight, num数字, sub≤14字
C_MINIMAL 色块极简（专栏/系列感）字段：title≤12字, highlight, sub≤14字, badge栏目名≤4字`;
