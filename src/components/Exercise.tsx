import { grammarIssues } from '../communication';
import { useState } from 'react';
import { Check, ArrowRight, Lightbulb } from 'lucide-react';
import { matches, type Question } from '../content';
import { Speak, VoiceInput } from './Speech';
import { LearningText } from './KnowledgeContext';

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
  const [confirmed, setConfirmed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [missed, setMissed] = useState(false);
  const [showText, setShowText] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const good = question.selfReview
      ? confirmed && /[a-z]{2}/i.test(answer) && grammarIssues(answer).length === 0
      : matches(answer, question);
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
              <LearningText text={question.english} />
            </p>
          )}
          <small>先听再答；系统没有英文声音时，可用文本完成理解练习。</small>
        </div>
      )}
      <form onSubmit={submit}>
        {question.selfReview && (
          <p className="note">
            开放输出按已知用法给提示，并由你对照任务和参考进行自评；不按关键词评分。
          </p>
        )}
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
                <span className="option-letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
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
              {question.selfReview
                ? '对照目标与参考自主核对，不提供全文语义认证。'
                : question.rubric
                  ? '按任务要素检查，不代表语义或全文语法评价。'
                  : '预设句型练习：支持本课的常用表达，暂不评价自由写作或真实发音。'}
            </p>
          </>
        )}
        {question.selfReview && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            我已对照目标与参考核对意思、事实和语气
          </label>
        )}
        {feedback && (
          <div role="status" className={`feedback ${feedback}`}>
            <strong>
              {feedback === 'correct'
                ? question.selfReview
                  ? '已记录你的自评，可以继续巩固。'
                  : question.rubric
                    ? '已找到任务要素，请核对意思与语气。'
                    : '表达正确，做得好！'
                : '再想一想，可以改正后继续。'}
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
