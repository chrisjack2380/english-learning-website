import { goalLabels, type LearningGoal } from '../knowledge';
import { useState } from 'react';
import { ArrowRight, BookOpen, Check, Leaf, Sprout, Target } from 'lucide-react';
import type { Profile } from '../learning';
import { Brand } from '../components/Brand';
import { World } from '../components/World';
export function Onboarding({ onStart }: { onStart: (profile: Profile) => void }) {
  const [goal, setGoal] = useState<LearningGoal>('work');
  const [level, setLevel] = useState<Profile['level']>('basics');
  const [minutes, setMinutes] = useState<Profile['minutes']>(20);
  return (
    <div className="onboarding">
      <Brand />
      <div className="onboard-layout">
        <div className="onboard-art">
          <span className="eyebrow">A SMALL STEP. A BIG WORLD.</span>
          <h1>
            让英语走进
            <br />
            <em>真实交流</em>。
          </h1>
          <p>
            不必先知道学什么。
            <br />
            我们会为你安排一条清晰的路。
          </p>
          <World scene="meeting" hero />
          <div className="onboard-promise">
            <Leaf size={19} />
            免费课程 · 无需注册 · 每天一点
          </div>
        </div>
        <section className="onboard-form card">
          <p className="eyebrow">WELCOME ABOARD</p>
          <h2>先认识一下你。</h2>
          <p className="muted">选择基础、目标和节奏，开始你的专属学习节奏。</p>
          <fieldset>
            <legend>01 · 你目前的英语基础</legend>
            <label className={`level-choice ${level === 'beginner' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="level"
                checked={level === 'beginner'}
                onChange={() => setLevel('beginner')}
              />
              <span className="round-icon peach">
                <Sprout size={22} />
              </span>
              <span>
                <strong>从零开始</strong>
                <small>不确定从哪里开始，想一步步学习</small>
              </span>
              <Check size={18} />
            </label>
            <label className={`level-choice ${level === 'basics' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="level"
                checked={level === 'basics'}
                onChange={() => setLevel('basics')}
              />
              <span className="round-icon sage">
                <BookOpen size={22} />
              </span>
              <span>
                <strong>已有英语基础</strong>
                <small>B1–B2 · 希望更自然地表达观点和真实交流</small>
              </span>
              <Check size={18} />
            </label>
            <label className={`level-choice ${level === 'advanced' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="level"
                checked={level === 'advanced'}
                onChange={() => setLevel('advanced')}
              />
              <span className="round-icon blue">
                <Target size={22} />
              </span>
              <span>
                <strong>挑战高级表达</strong>
                <small>C1 · 论证、隐含意义与语域</small>
              </span>
              <Check size={18} />
            </label>
          </fieldset>
          <fieldset>
            <legend>02 · 每天留一点时间</legend>
            <div className="duration-options">
              {([10, 20, 30] as const).map((n) => (
                <button
                  className={minutes === n ? 'selected' : ''}
                  key={n}
                  aria-pressed={minutes === n}
                  onClick={() => setMinutes(n)}
                >
                  <strong>{n}</strong> 分钟
                  <small>{n === 10 ? '轻松起步' : n === 20 ? '稳步前进' : '沉浸学习'}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field-label">
            学习目标
            <select
              aria-label="新手学习目标"
              value={goal}
              onChange={(e) => setGoal(e.target.value as LearningGoal)}
            >
              {Object.entries(goalLabels).map(([id, label]) => (
                <option value={id} key={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="note">
            <Target size={18} />
            <p>
              {level === 'beginner'
                ? '从 Pre-A1「从一句 Hello 开始」学习问候，逐步走向生活交流。'
                : level === 'advanced'
                  ? '从 C1「美国职场会议交流 · C1 挑战」开始，训练论证、限定观点和隐含意义。选择不是能力认证。'
                  : '从 B1–B2「美国职场会议交流」开始，练习观点、听力与自然表达。选择仅为学习起点参考，不是能力认证。'}
            </p>
          </div>
          <button
            className="button primary wide"
            onClick={() => onStart({ level, minutes, goal, createdAt: Date.now() })}
          >
            开启我的学习旅程
            <ArrowRight size={19} />
          </button>
          <small className="privacy-note">记录保存在本设备浏览器中，更换设备不会自动同步。</small>
        </section>
      </div>
      <footer>Good things take small steps. 好的改变，始于一小步。</footer>
    </div>
  );
}
