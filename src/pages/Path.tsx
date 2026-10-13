import { ArrowRight, Check, LockKeyhole, Target } from 'lucide-react';
import { canOpen, activeTrack, trackLessons, type LearningState, type Profile } from '../learning';
import { trackInfo } from '../advanced-content';
import { LevelSelector } from '../components/LevelSelector';
export function PathPage({
  state,
  openLesson,
  onLevel,
}: {
  state: LearningState;
  openLesson: (id: string) => void;
  onLevel: (level: Profile['level']) => void;
}) {
  const path = trackLessons(state);
  const info = trackInfo[activeTrack(state)];
  const done = path.filter((l) => state.completed.includes(l.id)).length;
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">A PATH TO REAL COMMUNICATION</p>
          <h1>每一步，都有方向。</h1>
          <p className="muted">按沟通能力选择路径，每次任务都让下一次交流更有把握。</p>
        </div>
        <span className="tag">
          {done} / {path.length} 已完成
        </span>
      </div>
      <LevelSelector value={state.profile!.level} onChange={onLevel} />
      <div className="path-intro card">
        <Target size={25} />
        <div>
          <strong>
            {info.name} · {info.level}
          </strong>
          <p>
            {info.description}。标签是教学设计参考；场景训练不是完整 CEFR 等级课程，也不是认证。
          </p>
        </div>
      </div>
      <div className="course-path">
        {path.map((l, i) => {
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
                    {l.minutes} 分钟 ·{' '}
                    {i ? '先修：' + path[i - 1].title : '本路径起点，无需先修入门课'}
                  </span>
                </div>
                <h2>{l.title}</h2>
                <p>{l.goal}</p>
                <small>
                  {l.track
                    ? '真实场景 → 沟通任务 → 表达分析 → 自主输出 → 复习'
                    : '讲解 → 动画 → 听力与表达 → 情景应用'}
                </small>
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
      <p className="note">
        不同路径分别记录先修进度；切换等级不会抹去旧记录，也不会自动授予未学课程。Advanced
        用同一真实场景增加因果、限定承诺与语域要求，完整学术讨论等后续扩充。
      </p>
    </>
  );
}
