import { BookOpen, Compass } from 'lucide-react';
import type { SceneId } from '../content';
import type { LearningState } from '../learning';
import { SceneCards } from '../components/SceneCards';
export function ExplorePage({
  state,
  setSceneId,
}: {
  state: LearningState;
  setSceneId: (id: SceneId) => void;
}) {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">A WORLD TO PRACTICE IN</p>
          <h1>在这里，英语有了生活。</h1>
          <p className="muted">选择一个场景，听示范、学表达，再亲自完成沟通任务。</p>
        </div>
        <span className="round-icon peach">
          <Compass size={27} />
        </span>
      </div>
      <SceneCards onOpen={setSceneId} state={state} />
      <div className="note exploration-note">
        <BookOpen size={20} />
        <p>自由探索可随时开始，练习记录与系统学习共享。场景完成不会跳过尚未完成的必修课。</p>
      </div>
      <section className="card">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>不是看一场动画，而是完成一次交流。</h2>
        <div className="how-grid">
          <div>
            <strong>01 · 看一看</strong>
            <p>观察场景，逐句收听角色对话。</p>
          </div>
          <div>
            <strong>02 · 试着说</strong>
            <p>选择、输入或说出回答，完成分步任务。</p>
          </div>
          <div>
            <strong>03 · 带走它</strong>
            <p>根据反馈调整表达，再在生活中使用。</p>
          </div>
        </div>
      </section>
    </>
  );
}
