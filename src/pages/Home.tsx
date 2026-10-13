import { ArrowRight, BookOpen, Clock3, RotateCcw, Sprout } from 'lucide-react';
import { useKnowledge } from '../components/KnowledgeContext';
import { knowledgeEntries, goalLabels } from '../knowledge';
import { journeyPlan } from '../journey-learning';
import { dayKey, nextLesson, trackLessons, dueLessons, type LearningState } from '../learning';
import type { Page } from '../types';
import type { SceneId } from '../content';
import { JourneyWorld } from '../components/JourneyPlayer';
import { JourneyCatalog } from '../components/JourneyCatalog';
export function HomePage({
  state,
  navigate,
  openLesson,
  startToday,
  continueCourse,
  onJourney,
}: {
  state: LearningState;
  navigate: (p: Page) => void;
  openLesson: (id: string) => void;
  setSceneId: (id: SceneId) => void;
  startToday: () => void;
  continueCourse: () => void;
  onJourney: (id: string) => void;
}) {
  const k = useKnowledge();
  const profile = state.profile!;
  const plan = journeyPlan(state.journeys || {}, k.state.goal, profile.minutes);
  const segment = plan.journey.stages[plan.stage];
  const words = knowledgeEntries.filter(
    (e) => k.state.records[e.id]?.introducedAt || k.state.records[e.id]?.understood,
  );
  const due = words.filter(
    (e) => k.state.records[e.id].due > 0 && k.state.records[e.id].due <= Date.now(),
  );
  const today = words.filter((e) => dayKey(k.state.records[e.id].introducedAt) === dayKey());
  const next = nextLesson(state);
  const courseDue = dueLessons(state);
  const path = trackLessons(state);
  return (
    <>
      <div className="section-heading greeting-heading">
        <div>
          <p className="eyebrow">YOUR ENGLISH, IN EVERYDAY LIFE</p>
          <h1>
            今天，也向前<em>一步。</em>
            <span className="little-sun">✳</span>
          </h1>
          <p className="muted">先看懂生活里的英语，再试着用起来。</p>
        </div>
        <span className="daily-time">
          <Clock3 size={17} />
          每日 {profile.minutes} 分钟
        </span>
      </div>
      <section className="hero-card life-hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span />
            你的下一小步 · {goalLabels[k.state.goal]}
          </span>
          <h2>
            {due.length
              ? '让学过的词语，\n在记忆里留下来。'
              : `${plan.journey.title}\n${segment.title}`}
          </h2>
          <p>
            {due.length
              ? `${due.length} 个词语已到复习时间。先回忆，再继续生活场景。`
              : plan.journey.goal}
          </p>
          <button className="button primary" onClick={startToday}>
            开始今天的学习
            <ArrowRight size={18} />
          </button>
          <button className="text-button" onClick={continueCourse}>
            {profile.level === 'beginner' ? '继续入门课程' : '继续系统沟通课'}
          </button>
          <p className="hero-meta">观察 · 学词 · 听懂 · 模仿 · 简单回应</p>
        </div>
        <div className="hero-art life-hero-art">
          <JourneyWorld image={segment.image} place={segment.place} />
          <span className="floating-caption">Small steps. Real life.</span>
        </div>
      </section>
      <div className="stats-row">
        <div>
          <span className="stat-icon sage">
            <Sprout size={20} />
          </span>
          <div>
            <strong>
              {today.length}
              <small> 个</small>
            </strong>
            <p>今天新发现</p>
          </div>
        </div>
        <div>
          <span className="stat-icon peach">
            <BookOpen size={20} />
          </span>
          <div>
            <strong>
              {words.filter((e) => k.state.records[e.id].recognitions).length}
              <small> 个</small>
            </strong>
            <p>通过词语辨认</p>
          </div>
        </div>
        <div>
          <span className="stat-icon yellow">
            <RotateCcw size={20} />
          </span>
          <div>
            <strong>
              {due.length}
              <small> 个词语</small>
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
              {Math.floor(Object.values(state.activity).reduce((a, b) => a + b, 0) / 60)}
              <small> 分钟</small>
            </strong>
            <p>累计学习时间</p>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TODAY’S SMALL STEPS</p>
              <h2>今天的小目标</h2>
            </div>
            <span className="tag neutral">{profile.minutes} 分钟计划</span>
          </div>
          <p className="muted">
            建议完成 {plan.upcoming.length} 个小段，约每段 10
            分钟；可按自己的节奏调整。退出后从已保存步骤继续。
          </p>
          <div className="task-list">
            {courseDue.length > 0 && (
              <button className="task-row" onClick={() => navigate('review')}>
                <span className="task-marker review-marker">
                  <RotateCcw size={18} />
                </span>
                <span>
                  <strong>把旧知识再唤醒</strong>
                  <small>{courseDue.length} 个到期课程知识 · 先回忆，再反馈</small>
                </span>
              </button>
            )}
            {due.length > 0 && (
              <button className="task-row" onClick={() => navigate('review')}>
                <span className="task-marker review-marker">
                  <RotateCcw size={18} />
                </span>
                <span>
                  <strong>温习已学词语</strong>
                  <small>{due.length} 个到期词语 · 先回忆再看解释</small>
                </span>
              </button>
            )}
            {plan.upcoming.map((s, i) => (
              <button
                className="task-row"
                key={s.id}
                disabled={
                  i > 0 &&
                  !state.journeys?.[plan.journey.id]?.stages[plan.upcoming[i - 1].id]?.completed
                }
                onClick={() => onJourney(plan.journey.id)}
              >
                <span className="task-marker current-marker">{i + 1}</span>
                <span>
                  <strong>{s.title}</strong>
                  <small>
                    {s.words.length} 个词语 · {s.expressions.length} 句表达
                  </small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className="card knowledge-home">
          <p className="eyebrow">A ROUTE THAT KEEPS GROWING</p>
          <h2>词语有来处，学习有下一步。</h2>
          <p>日常与职场场景共享词库；IELTS、TOEFL、学术和商务知识可继续转为应用训练。</p>
          <button className="button ghost" onClick={() => navigate('knowledge')}>
            打开知识与个人词库
          </button>
          <p className="muted small-text">收藏、辨认、跟读和自主表达分别记录，不以浏览代替掌握。</p>
          <hr />
          <h3>系统课程</h3>
          <p>
            当前路径完成 {path.filter((l) => state.completed.includes(l.id)).length} / {path.length}{' '}
            课。
          </p>
          {next && (
            <button className="text-button" onClick={() => openLesson(next.id)}>
              下一课：{next.title}
              <ArrowRight size={15} />
            </button>
          )}
          <button className="text-button" onClick={() => navigate('path')}>
            查看完整学习路径
          </button>
        </section>
      </div>
      <section className="scene-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A WHOLE DAY, ONE STEP AT A TIME</p>
            <h2>在生活里发现英语。</h2>
          </div>
          <button className="text-button" onClick={() => navigate('explore')}>
            探索全部场景
            <ArrowRight size={16} />
          </button>
        </div>
        <JourneyCatalog onOpen={onJourney} records={state.journeys} limit={3} />
      </section>
    </>
  );
}
