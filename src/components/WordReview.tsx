import { useState } from 'react';
import { contextRecall } from '../context-practice';
import { knowledgeEntries } from '../knowledge';
import { recordKnowledge } from '../knowledge-learning';
import { useKnowledge } from './KnowledgeContext';
import { Speak } from './Speech';
import { optionOrder } from './JourneyPlayer';
export function WordReview() {
  const k = useKnowledge();
  const [queue, setQueue] = useState(() =>
    knowledgeEntries
      .filter((e) => {
        const r = k.state.records[e.id];
        return r && (r.introducedAt || r.understood) && r.due > 0 && r.due <= Date.now();
      })
      .map((e) => e.id),
  );
  const [index, setIndex] = useState(0),
    [choice, setChoice] = useState(''),
    [feedback, setFeedback] = useState(''),
    [checked, setChecked] = useState(false),
    [hint, setHint] = useState(false);
  const e = knowledgeEntries.find((e) => e.id === queue[index]);
  const recall = e
    ? contextRecall(
        e,
        knowledgeEntries
          .filter((x) => x.kind === e.kind && x.id !== e.id)
          .slice(0, 2)
          .map((x) => x.term),
      )
    : undefined;
  return (
    <section className="card word-review">
      <h2>场景词语复习</h2>
      {e && recall ? (
        <>
          <p>
            主动回忆 {index + 1} / {queue.length}
          </p>
          <p>{recall.prompt}</p>
          <h3 lang="en">{recall.line}</h3>
          <button className="text-button" onClick={() => setHint(true)}>
            需要一点提示
          </button>
          {hint && (
            <p className="note">
              {recall.hint} {e.translation}
              <Speak text={e.example} />
            </p>
          )}
          <div className="guided-options" role="group" aria-label="词语复习选项">
            {optionOrder(recall.options, e.id).map((o) => (
              <button
                key={o}
                disabled={checked}
                aria-pressed={choice === o}
                onClick={() => setChoice(o)}
              >
                {o}
              </button>
            ))}
          </div>
          {checked ? (
            <>
              <p className="note" role="status">
                {feedback}
              </p>
              <button
                className="button primary"
                onClick={() => {
                  setIndex(index + 1);
                  setChecked(false);
                  setChoice('');
                  setFeedback('');
                  setHint(false);
                }}
              >
                继续词语复习
              </button>
            </>
          ) : (
            <button
              className="button primary"
              disabled={!choice}
              onClick={() => {
                const right = choice === recall.answer;
                k.update(recordKnowledge(k.state, e.id, right && !hint ? 'recognize' : 'miss'));
                setFeedback(
                  `${right && !hint ? '情境回忆正确。' : '借助提示或调整的表达，10 分钟后再巩固。'} ${e.translation} ${e.contrast}`,
                );
                setChecked(true);
              }}
            >
              检查词语回忆
            </button>
          )}
        </>
      ) : (
        <>
          <p>
            {queue.length ? '本轮词语复习已记录。' : '当前没有到期词语。'}
            辨认正确与自主使用分别记录。
          </p>
          <button
            className="text-button"
            onClick={() => {
              setQueue(
                knowledgeEntries
                  .filter(
                    (e) =>
                      k.state.records[e.id]?.introducedAt ||
                      k.state.records[e.id]?.saved ||
                      k.state.records[e.id]?.understood,
                  )
                  .map((e) => e.id),
              );
              setIndex(0);
              setChoice('');
              setChecked(false);
            }}
          >
            提前回忆词库中的词语
          </button>
        </>
      )}
    </section>
  );
}
