// 工牌：数字员工的身份锚点（花名册 003 号）
export default function EmployeeCard({ profile, mini = false }) {
  const joined = profile?.joinedAt || '';

  if (mini) {
    return (
      <div className="badgeMini">
        <span className="badgeMiniAvatar">✒️</span>
        <span>
          <b>阿文</b>
          <i className="mono"> LK-003</i>
          <em className="badgeMiniDept">营销部 · 公众号运营专员</em>
        </span>
        <span className="statusDot" title="在岗" />
      </div>
    );
  }

  return (
    <div className="badgeCard">
      <div className="badgeHole" />
      <div className="badgeAvatar">✒️</div>
      <div className="badgeName">阿文</div>
      <div className="badgeId mono">工号 LK-003</div>
      <div className="badgeDept">营销部 · 公众号运营专员</div>
      <div className="badgeSkills">
        {['爆款标题', '长文结构', '金句提炼', '排版直出'].map((s) => (
          <span className="chip" key={s}>{s}</span>
        ))}
      </div>
      <div className="badgeFoot">
        <span>{joined ? `入职 ${joined}` : '待入职'}</span>
        <span className="stamp">试用期</span>
      </div>
    </div>
  );
}
