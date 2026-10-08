import { ArrowRight, Coffee, MapPin, MessageCircle } from 'lucide-react';
import { scenes, type SceneId } from '../content';
import type { LearningState } from '../learning';
import { World } from './World';
export function SceneCards({
  onOpen,
  state,
}: {
  onOpen: (id: SceneId) => void;
  state: LearningState;
}) {
  const icons = { greeting: MessageCircle, cafe: Coffee, directions: MapPin };
  return (
    <div className="scene-cards">
      {scenes.map((s) => {
        const Icon = icons[s.id];
        const n = state.sceneResults.filter((a) => a.scene === s.id).length;
        return (
          <article className={`scene-card card ${s.color}`} key={s.id}>
            <button
              className="scene-art-button"
              aria-label={`进入${s.title}`}
              onClick={() => onOpen(s.id)}
            >
              <World scene={s.id} playing={false} />
              <span className="scene-level">{s.level}</span>
            </button>
            <div className="scene-card-copy">
              <div className="row spread">
                <span className="eyebrow">{s.english}</span>
                <Icon size={19} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <div className="row spread">
                <small>{n ? `已完成 ${n} 次` : '4 步沟通任务'}</small>
                <button className="text-button" onClick={() => onOpen(s.id)}>
                  进入场景
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
