'use client';

import { useEffect, useState } from 'react';
import OnboardingForm from '@/components/OnboardingForm';
import EmployeeCard from '@/components/EmployeeCard';
import Workbench from '@/components/Workbench';

const KEY = 'mp-employee:profile';

export default function Page() {
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setProfile(JSON.parse(saved));
    } catch (e) { /* 忽略 */ }
    setReady(true);
  }, []);

  function hire(p) {
    setProfile(p);
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* 忽略 */ }
  }

  function retrain() {
    setProfile(null);
    try { localStorage.removeItem(KEY); } catch (e) { /* 忽略 */ }
  }

  if (!ready) return null;

  if (!profile) {
    return (
      <div className="onboarding">
        <div className="lanyard" />
        <div className="onboardHero">
          <h1>给你的公众号，雇一位<span className="hl">主笔级运营专员</span></h1>
          <p>她叫阿文。每天交付 1 篇头条级成稿：标题、头图、金句卡、摘要齐活——正文带排版，复制即贴进后台，所见即所得。</p>
        </div>
        <div className="onboardGrid">
          <div className="onboardBadge">
            <EmployeeCard profile={null} />
            <div className="badgeCaption">填完右边的入职登记表，工牌即刻生效</div>
          </div>
          <OnboardingForm onHire={hire} />
        </div>
      </div>
    );
  }

  return <Workbench profile={profile} onRetrain={retrain} />;
}
