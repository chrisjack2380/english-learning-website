import { ArrowRight } from 'lucide-react';
import { lifeJourneys } from '../life-content';
import { JourneyWorld } from './JourneyPlayer';
import type { JourneyRecords } from '../journey-learning';
export function JourneyCatalog({
  onOpen,
  records = {},
  limit,
}: {
  onOpen: (id: string) => void;
  records?: JourneyRecords;
  limit?: number;
}) {
  return (
    <div className="journey-catalog">
      {lifeJourneys.slice(0, limit).map((j) => (
        <article className="card journey-card" key={j.id}>
          <JourneyWorld image={j.stages[0].image} place={j.english} />
          <div className="journey-card-copy">
            <span className="tag neutral">{j.level} · 5 个生活阶段</span>
            <h3>{j.title}</h3>
            <p>{j.goal}</p>
            <p className="muted small-text">
              {j.stages.reduce((n, s) => n + s.words.length, 0)} 个词语 +{' '}
              {j.stages.reduce((n, s) => n + s.expressions.length, 0)} 句表达 · 已完成{' '}
              {j.stages.filter((s) => records[j.id]?.stages[s.id]?.completed).length}/5 段
            </p>
            <button
              className="button ghost"
              onClick={() => onOpen(j.id)}
              aria-label={`学习${j.title}`}
            >
              {records[j.id] ? '继续生活流程' : '进入生活流程'}
              <ArrowRight size={16} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
