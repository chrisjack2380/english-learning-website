import { useState } from 'react';
import { ArrowRight, BookOpen, Check, Leaf, Sprout, Target } from 'lucide-react';
import type { Profile } from '../learning';
import { Brand } from '../components/Brand';
import { World } from '../components/World';
export function Onboarding({ onStart }: { onStart: (profile: Profile) => void }) {
  const [level, setLevel] = useState<Profile['level']>('beginner');
  const [minutes, setMinutes] = useState<Profile['minutes']>(20);
  return (
    <div className="onboarding">
      <Brand />
      <div className="onboard-layout">
        <div className="onboard-art">
          <span className="eyebrow">A SMALL STEP. A BIG WORLD.</span>
          <h1>
            英语，从今天的
            <br />
            <em>一小步</em>开始。
          </h1>
          <p>
            不必先知道学什么。
            <br />
            我们会为你安排一条清晰的路。
          </p>
          <World scene="greeting" hero />
          <div className="onboard-promise">
            <Leaf size={19} />
            免费课程 · 无需注册 · 每天一点
          </div>
        </div>
        <section className="onboard-form card">
          <p className="eyebrow">WELCOME ABOARD</p>
          <h2>先认识一下你。</h2>
          <p className="muted">只需两个选择，开始你的专属学习节奏。</p>
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
                <strong>有一点基础</strong>
                <small>认识一些英语，希望巩固并开口交流</small>
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
          <div className="note">
            <Target size={18} />
            <p>
              {level === 'beginner'
                ? '从 Pre-A1「从一句 Hello 开始」学习问候，逐步走向生活交流。'
                : '先用第一课快速巩固，凭真实练习解锁下一课；也可直接探索生活场景。水平选择只是起点参考，不是能力认证。'}
            </p>
          </div>
          <button
            className="button primary wide"
            onClick={() => onStart({ level, minutes, createdAt: Date.now() })}
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
