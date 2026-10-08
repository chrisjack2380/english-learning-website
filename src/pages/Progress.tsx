import { ArrowDownToLine, ArrowRight } from 'lucide-react';
import { lessons, scenes } from '../content';
import { nextLesson, type LearningState } from '../learning';
import type { Page } from '../types';
export function ProgressPage({
  state,
  navigate,
  exportData,
}: {
  state: LearningState;
  navigate: (page: Page) => void;
  exportData: () => void;
}) {
  const current = nextLesson(state);
  const activeDays = Object.keys(state.activity).filter((d) => state.activity[d] > 0).length;
  const seconds = Object.values(state.activity).reduce((a, b) => a + b, 0);
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR SMALL STEPS, REMEMBERED</p>
          <h1>每一份努力，都留下足迹。</h1>
          <p className="muted">来自你的真实练习，不以观看页面作为掌握依据。</p>
        </div>
        <button className="button ghost" onClick={exportData}>
          <ArrowDownToLine size={17} />
          导出记录
        </button>
      </div>
      <div className="progress-summary card">
        <div
          className="progress-ring"
          style={{ '--progress': `${(state.completed.length / 6) * 100}%` } as React.CSSProperties}
        >
          <span>
            {Math.round((state.completed.length / 6) * 100)}
            <small>%</small>
          </span>
        </div>
        <div>
          <p className="eyebrow">FOUNDATIONS</p>
          <h2>入门路径 · {state.completed.length} / 6 课</h2>
          <p>{current ? `下一步：${current.title}` : '入门路径已完成，继续复习和生活实践。'}</p>
          <p className="muted">
            累计 {Math.floor(seconds / 60)} 分钟 · {activeDays} 个学习日 ·{' '}
            {state.sceneResults.length} 次场景任务
          </p>
        </div>
      </div>
      <div className="section-heading">
        <h2>知识掌握与复习</h2>
        <button className="text-button" onClick={() => navigate('review')}>
          去温习
          <ArrowRight size={15} />
        </button>
      </div>
      <div className="knowledge-list">
        {lessons.map((l) => {
          const k = state.skills[l.id];
          return (
            <div className="knowledge-row card" key={l.id}>
              <div>
                <strong>{l.skill}</strong>
                <p>{l.goal}</p>
              </div>
              <span className={`tag ${!k ? 'neutral' : k.status === 'review' ? 'peach' : 'sage'}`}>
                {!k ? '尚未学习' : k.status === 'review' ? '需要巩固' : '初步掌握'}
              </span>
              <small>
                {k
                  ? `${k.due <= Date.now() ? '现在可复习' : '复习：' + new Date(k.due).toLocaleDateString('zh-CN')} · 正确复习 ${k.correctReviews} 次`
                  : '完成课程后安排'}
              </small>
            </div>
          );
        })}
      </div>
      <div className="section-heading">
        <h2>最近练习</h2>
      </div>
      <div className="card history">
        {state.attempts.length === 0 ? (
          <p className="muted">还没有课程练习记录，开始第一课吧。</p>
        ) : (
          state.attempts
            .slice(-10)
            .reverse()
            .map((a, i) => (
              <div key={i}>
                <span>{lessons.find((l) => l.id === a.lessonId)?.title}</span>
                <strong>
                  首次 {a.correct} / {a.total} 正确
                </strong>
                <small>{new Date(a.at).toLocaleString('zh-CN')}</small>
              </div>
            ))
        )}
      </div>
      <div className="section-heading">
        <h2>生活场景足迹</h2>
      </div>
      <div className="card history">
        {state.sceneResults.length === 0 ? (
          <p className="muted">还没有完成场景任务。</p>
        ) : (
          state.sceneResults
            .slice(-10)
            .reverse()
            .map((a, i) => (
              <div key={i}>
                <span>{scenes.find((s) => s.id === a.scene)?.title}</span>
                <strong>{a.mistakes ? `${a.mistakes} 次调整` : '一次通过'}</strong>
                <small>{new Date(a.at).toLocaleString('zh-CN')}</small>
              </div>
            ))
        )}
      </div>
    </>
  );
}
