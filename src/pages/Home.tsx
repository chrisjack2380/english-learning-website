import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Compass,
  Flame,
  LockKeyhole,
  MessageCircle,
  RotateCcw,
  Sprout,
} from 'lucide-react';
import { lessons, type SceneId } from '../content';
import { dailyPlan, dueLessons, nextLesson, canOpen, type LearningState } from '../learning';
import type { Page } from '../types';
import { World } from '../components/World';
import { SceneCards } from '../components/SceneCards';
export function HomePage({
  state,
  navigate,
  openLesson,
  setSceneId,
  startToday,
}: {
  state: LearningState;
  navigate: (page: Page) => void;
  openLesson: (id: string) => void;
  setSceneId: (id: SceneId) => void;
  startToday: () => void;
}) {
  const profile = state.profile!;
  const current = nextLesson(state);
  const plan = dailyPlan(state);
  const due = dueLessons(state);
  const activeDays = Object.keys(state.activity).filter((d) => state.activity[d] > 0).length;
  const seconds = Object.values(state.activity).reduce((a, b) => a + b, 0);
  return (
    <>
      <div className="section-heading greeting-heading">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}{' '}
            · A FRESH START
          </p>
          <h1>
            今天，也向前<em>一步。</em>
            <span className="little-sun">✳</span>
          </h1>
          <p className="muted">不用想该学什么，我们已经为你准备好了。</p>
        </div>
        <span className="daily-time">
          <Clock3 size={17} />
          每日 {profile.minutes} 分钟
        </span>
      </div>
      <section className="hero-card">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span />
            你的下一小步 · {due.length ? '巩固已学知识' : current?.level || '生活实践'}
          </span>
          <h2>
            {due.length
              ? '让学过的英语，\n真正留下来。'
              : current
                ? current.id === 'hello'
                  ? '从一句 Hello，\n认识一个新世界。'
                  : current.title
                : '把每一小步，\n变成生活里的英语。'}
          </h2>
          <p>
            {due.length
              ? `${due.length} 个知识点需要复习，先用两分钟回忆一下。`
              : current?.goal || '入门路径已完成，继续场景练习和间隔复习。'}
          </p>
          <button className="button primary" onClick={startToday}>
            开始今天的学习
            <ArrowRight size={19} />
          </button>
          <div className="hero-meta">
            <Clock3 size={15} />
            {due.length ? '约 2 分钟起' : `约 ${current?.minutes || 10} 分钟`}
            <span>·</span>
            {due.length ? '回忆 + 反馈' : '动画讲解 + 互动练习'}
          </div>
        </div>
        <div className="hero-art">
          <World scene={current?.scene || 'greeting'} hero />
          <span className="floating-caption">
            <MessageCircle size={16} />A little English, a little closer.
          </span>
        </div>
      </section>
      <div className="stats-row">
        <div>
          <span className="stat-icon sage">
            <BookOpen size={20} />
          </span>
          <div>
            <strong>
              {state.completed.length}
              <small> / {lessons.length} 课</small>
            </strong>
            <p>已完成课程</p>
          </div>
        </div>
        <div>
          <span className="stat-icon peach">
            <Flame size={20} />
          </span>
          <div>
            <strong>
              {activeDays}
              <small> 天</small>
            </strong>
            <p>实际学习天数</p>
          </div>
        </div>
        <div>
          <span className="stat-icon yellow">
            <RotateCcw size={20} />
          </span>
          <div>
            <strong>
              {due.length}
              <small> 个知识点</small>
            </strong>
            <p>等待温习</p>
          </div>
        </div>
        <div>
          <span className="stat-icon blue">
            <Clock3 size={20} />
          </span>
          <div>
            <strong>
              {Math.floor(seconds / 60)}
              <small> 分钟</small>
            </strong>
            <p>累计学习时间</p>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="card daily-plan">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR DAILY JOURNEY</p>
              <h2>今天的小目标</h2>
            </div>
            <span className="tag neutral">{profile.minutes} 分钟计划</span>
          </div>
          <p className="muted small-text">
            按 {profile.minutes} 分钟推荐 {plan.upcoming.length}{' '}
            节课程；有错题时先复习。用时为建议，可按自己的节奏调整。
          </p>
          <div className="task-list">
            {due.length > 0 && (
              <button className="task-row" onClick={() => navigate('review')}>
                <span className="task-marker review-marker">
                  <RotateCcw size={19} />
                </span>
                <span>
                  <strong>把旧知识再唤醒</strong>
                  <small>{due.length} 个到期知识点 · 先回忆，再反馈</small>
                </span>
                <ChevronRight size={18} />
              </button>
            )}
            {plan.upcoming.map((l, i) => (
              <button
                key={l.id}
                className="task-row"
                onClick={() => openLesson(l.id)}
                disabled={!canOpen(state, l.id)}
              >
                <span className={`task-marker ${i === 0 ? 'current-marker' : ''}`}>{i + 1}</span>
                <span>
                  <strong>{l.title}</strong>
                  <small>
                    {l.skill} · 约 {l.minutes} 分钟
                  </small>
                </span>
                {canOpen(state, l.id) ? <ChevronRight size={18} /> : <LockKeyhole size={16} />}
              </button>
            ))}
            <button className="task-row" onClick={() => navigate('explore')}>
              <span className="task-marker explore-marker">
                <Compass size={19} />
              </span>
              <span>
                <strong>在生活里，试着说一句</strong>
                <small>自由场景练习 · 完成课程后可选</small>
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
        <section className="card path-preview">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A CLEAR WAY FORWARD</p>
              <h2>你的学习路线</h2>
            </div>
            <Sprout size={22} />
          </div>
          <p className="muted">从敢说 Hello，到完成一次真实交流。</p>
          <div className="stage-road">
            <div className="stage active">
              <span>01</span>
              <div>
                <strong>开启第一段对话</strong>
                <small>Pre-A1 · 问候、自我介绍</small>
              </div>
            </div>
            <div className={`stage ${state.completed.length >= 2 ? 'active' : ''}`}>
              <span>02</span>
              <div>
                <strong>走进生活场景</strong>
                <small>Pre-A1 → A1 · 数量、点餐</small>
              </div>
            </div>
            <div className={`stage ${state.completed.length >= 4 ? 'active' : ''}`}>
              <span>03</span>
              <div>
                <strong>让英语带你出发</strong>
                <small>A1 起步 · 位置、问路</small>
              </div>
            </div>
          </div>
          <button className="text-button" onClick={() => navigate('path')}>
            查看完整学习路径
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <section className="scene-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TAKE YOUR ENGLISH OUTSIDE</p>
            <h2>把英语，带进生活。</h2>
          </div>
          <button className="text-button" onClick={() => navigate('explore')}>
            探索全部场景
            <ArrowRight size={16} />
          </button>
        </div>
        <SceneCards onOpen={setSceneId} state={state} />
      </section>
    </>
  );
}
