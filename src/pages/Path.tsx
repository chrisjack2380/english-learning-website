import { ArrowRight, Check, LockKeyhole, Sparkles, Target } from 'lucide-react';
import { lessons, sceneForLesson } from '../content';
import { canOpen, type LearningState } from '../learning';
export function PathPage({
  state,
  openLesson,
}: {
  state: LearningState;
  openLesson: (id: string) => void;
}) {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">FROM HELLO TO THE WORLD</p>
          <h1>每一步，都有方向。</h1>
          <p className="muted">
            六节连续入门课程，逐步走向真实交流。完成练习与情境任务后，下一课自动解锁。
          </p>
        </div>
        <span className="tag">{state.completed.length} / 6 已完成</span>
      </div>
      <div className="path-intro card">
        <Target size={25} />
        <div>
          <strong>当前阶段：Pre-A1 → A1 起步</strong>
          <p>目标是开启对话、点一杯咖啡、问清方向。标签参考 CEFR 能力描述，不是等级认证。</p>
        </div>
      </div>
      <div className="course-path">
        {lessons.map((l, i) => {
          const done = state.completed.includes(l.id);
          const unlocked = canOpen(state, l.id);
          return (
            <article
              className={`course-node card ${done ? 'completed' : unlocked ? 'available' : 'locked'}`}
              key={l.id}
            >
              <span className="course-index">
                {done ? <Check size={24} /> : String(i + 1).padStart(2, '0')}
              </span>
              <div className="course-body">
                <div className="row">
                  <span className="tag neutral">{l.level}</span>
                  <span className="muted small-text">
                    {l.minutes} 分钟 · {i > 0 ? '先修：' + lessons[i - 1].title : '无需先修'}
                  </span>
                </div>
                <h2>{l.title}</h2>
                <p>{l.goal}</p>
                <small>讲解 → 动画 → 听力与表达 → {sceneForLesson(l.id).title}</small>
              </div>
              <button
                className={`button ${unlocked && !done ? 'primary' : 'ghost'}`}
                disabled={!unlocked}
                onClick={() => openLesson(l.id)}
              >
                {done ? '再次学习' : unlocked ? '开始学习' : '待解锁'}
                {unlocked ? <ArrowRight size={17} /> : <LockKeyhole size={16} />}
              </button>
            </article>
          );
        })}
      </div>
      <div className="future-note">
        <Sparkles size={20} />
        <div>
          <strong>更远的路，正在规划中</strong>
          <p>
            后续扩展完整 A1、A2 和更高等级，以及旅行与工作场景。本阶段不将入门六课当作完整等级课程。
          </p>
        </div>
      </div>
    </>
  );
}
