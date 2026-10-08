import { useState } from 'react';
import { Check, ArrowRight, Lightbulb } from 'lucide-react';
import { matches, type Question } from '../content';
import { Speak, VoiceInput } from './Speech';

export function Exercise({
  question,
  onDone,
  number,
  review = false,
}: {
  question: Question;
  onDone: (firstCorrect: boolean) => void;
  number?: string;
  review?: boolean;
}) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [missed, setMissed] = useState(false);
  const [showText, setShowText] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const good = matches(answer, question);
    setFeedback(good ? 'correct' : 'wrong');
    if (!good) setMissed(true);
  }
  return (
    <div className="exercise">
      <div className="eyebrow">
        {number || (review ? 'RECALL & RETAIN · 主动回忆' : 'YOUR TURN · 轮到你了')}
      </div>
      <h2>{question.prompt}</h2>
      {question.listening && question.english && (
        <div className="listening-panel">
          <Speak text={question.english} />
          <button type="button" className="text-button" onClick={() => setShowText(!showText)}>
            {showText ? '隐藏英文' : '无声音？显示英文文本'}
          </button>
          {showText && (
            <p className="english" lang="en">
              {question.english}
            </p>
          )}
          <small>先听再答；系统没有英文声音时，可用文本完成理解练习。</small>
        </div>
      )}
      <form onSubmit={submit}>
        {question.options ? (
          <fieldset className="answer-options" disabled={feedback === 'correct'}>
            <legend className="sr-only">选择答案</legend>
            {question.options.map((option, i) => (
              <label className={`answer-option ${answer === option ? 'chosen' : ''}`} key={option}>
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answer === option}
                  onChange={() => {
                    setAnswer(option);
                    setFeedback(null);
                  }}
                />
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
                {answer === option && <Check size={18} />}
              </label>
            ))}
          </fieldset>
        ) : (
          <>
            <label className="field-label" htmlFor="written-answer">
              你的英文回答
            </label>
            <input
              id="written-answer"
              autoComplete="off"
              spellCheck="false"
              placeholder="在这里写一句英语…"
              value={answer}
              disabled={feedback === 'correct'}
              onChange={(e) => {
                setAnswer(e.target.value);
                setFeedback(null);
              }}
            />
            <VoiceInput
              onText={(text) => {
                setAnswer(text);
                setFeedback(null);
              }}
            />
            <p className="muted small-text">
              预设句型练习：支持本课的常用表达，暂不评价自由写作或真实发音。
            </p>
          </>
        )}
        {feedback && (
          <div role="status" className={`feedback ${feedback}`}>
            <strong>
              {feedback === 'correct' ? '表达正确，做得好！' : '再想一想，可以改正后继续。'}
            </strong>
            <p>{question.explanation}</p>
            {feedback === 'wrong' && (
              <p>
                <Lightbulb size={15} /> 参考：<span lang="en">{question.sample}</span>
              </p>
            )}
          </div>
        )}
        {feedback === 'correct' ? (
          <button type="button" className="button primary" onClick={() => onDone(!missed)}>
            继续
            <ArrowRight size={18} />
          </button>
        ) : (
          <button type="submit" className="button primary" disabled={!answer.trim()}>
            检查答案
            <Check size={17} />
          </button>
        )}
      </form>
    </div>
  );
}
