import { useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { lessons } from '../content';
import { dueLessons, type LearningState } from '../learning';
import { Exercise } from '../components/Exercise';
export function ReviewPanel({
  state,
  onReview,
  onExit,
}: {
  state: LearningState;
  onReview: (id: string, correct: boolean) => void;
  onExit: () => void;
}) {
  const [queue, setQueue] = useState(() => dueLessons(state).map((l) => l.id));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const current = lessons.find((l) => l.id === queue[index]);
  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">MAKE IT STICK</p>
          <h1>温故，才能知新。</h1>
          <p className="muted">先尝试回忆，再查看反馈。答错的知识会更快与你见面。</p>
        </div>
        <span className="round-icon sage">
          <RotateCcw size={26} />
        </span>
      </div>
      {current ? (
        <div className="card exercise-card">
          <p className="muted">
            复习 {index + 1} / {queue.length} · {current.skill}
          </p>
          <Exercise
            key={current.id}
            question={current.review}
            review
            onDone={(correct) => {
              onReview(current.id, correct);
              setResults([...results, correct]);
              setIndex(index + 1);
            }}
          />
        </div>
      ) : (
        <div className="card empty-state">
          <span className="round-icon sage">
            <Check size={28} />
          </span>
          <h2>{results.length ? '本轮复习完成' : '今天没有到期的知识'}</h2>
          <p>
            {results.length
              ? `${results.filter(Boolean).length} / ${results.length} 个知识点首次回忆正确。${results.some((x) => !x) ? '答错的知识已安排 10 分钟后再练。' : '正确知识的复习间隔已延长。'}`
              : '学完课程后会自动安排复习，你也可以提前巩固。'}
          </p>
          <p className="note">
            首次错题：立即复习；正确课程：次日复习。复习正确后按 1 / 3 / 7 / 14 天延长；复习答错则
            10 分钟后再练。这是学习建议，不是长期掌握保证。
          </p>
          <button className="button primary" onClick={onExit}>
            回到今日学习
            <ArrowRight size={17} />
          </button>
          {Object.keys(state.skills).length > 0 && (
            <button
              className="button ghost"
              onClick={() => {
                setQueue(lessons.filter((l) => state.skills[l.id]).map((l) => l.id));
                setIndex(0);
                setResults([]);
              }}
            >
              提前巩固已学知识
            </button>
          )}
        </div>
      )}
    </section>
  );
}
