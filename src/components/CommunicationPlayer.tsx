import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Pause, Play, RotateCcw } from 'lucide-react';
import {
  communicationScenes,
  higherLessons,
  createCommunicationLesson,
  type CommunicationScene,
} from '../advanced-content';
import type { Lesson } from '../content';
import { taskEvidence } from '../communication';
import { CommunicationWorld } from './CommunicationWorld';
import { Exercise } from './Exercise';
import { ExpressionCoach } from './ExpressionCoach';
import { Speak, VoiceInput } from './Speech';
import { AIRolePractice } from './AIRolePractice';
export type OutputEvidence = { role: string; prompt: string; text: string; revised: boolean };
export function CommunicationPlayer({
  id,
  lesson,
  challenge = false,
  onExit,
  onNext,
  onFinish,
  definition,
}: {
  id: CommunicationScene['id'];
  definition?: CommunicationScene;
  lesson?: Lesson;
  challenge?: boolean;
  onExit: () => void;
  onNext?: (id: string) => void;
  onFinish: (correct: number, mistakes: number, outputs: OutputEvidence[]) => void;
}) {
  const scene = definition || communicationScenes.find((s) => s.id === id)!;
  const course = lesson || createCommunicationLesson(scene, challenge);
  const advanced = course.track === 'advanced';
  const [phase, setPhase] = useState(0);
  const [demo, setDemo] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [zh, setZh] = useState(false);
  const [inspect, setInspect] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<ReturnType<typeof taskEvidence> | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [revised, setRevised] = useState(false);
  const [score, setScore] = useState(0);
  const [outputs, setOutputs] = useState<OutputEvidence[]>([]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.speechSynthesis?.cancel();
  }, [phase, step]);
  const turn = scene.turns[step];
  const task = advanced
    ? { ...turn.rubric, criteria: [...turn.rubric.criteria, turn.advanced] }
    : turn.rubric;
  const next = higherLessons.filter((l) => l.track === course.track)[
    communicationScenes.indexOf(scene) + 1
  ];
  const steps = ['真实场景', '听力与意图', '表达分析', '自主沟通', '反馈与下一步'];
  return (
    <section className="communication-player">
      <button className="text-button back" onClick={onExit}>
        <ChevronLeft size={17} />
        {lesson ? '返回学习首页' : '返回场景探索'}
      </button>
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {advanced ? 'C1 · NUANCE & REASONING' : 'B1–B2 · REAL COMMUNICATION'}
          </p>
          <h1>{course.title}</h1>
          <p className="muted">{scene.goal}</p>
        </div>
        <span className="tag">{advanced ? 'C1 挑战' : 'Intermediate'}</span>
      </div>
      <ol className="lesson-steps">
        {steps.map((s, i) => (
          <li key={s} className={phase === i ? 'current' : phase > i ? 'done' : ''}>
            <span>{phase > i ? <Check size={13} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {phase < 4 && (
        <div className="communication-stage">
          <CommunicationWorld
            scene={id}
            definition={scene}
            step={phase === 0 ? demo : step}
            playing={playing}
            onInspect={(item) => setInspect(item === 'context' ? scene.context : scene.goal)}
          />
          <div className="animation-controls">
            <button
              className="icon-button"
              aria-label={playing ? '暂停动画' : '播放动画'}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              className="icon-button"
              aria-label="重播环境动画"
              onClick={() => {
                setPlaying(true);
                setDemo(0);
              }}
            >
              <RotateCcw size={16} />
            </button>
            <span>角色与屏幕随沟通阶段变化 · 观看不计掌握</span>
          </div>
          {inspect && (
            <p className="note" role="status">
              {inspect}
            </p>
          )}
        </div>
      )}
      {phase === 0 && (
        <section className="card task-brief">
          <p className="eyebrow">YOUR MISSION</p>
          <h2>先解决一个真实问题。</h2>
          <p>{scene.brief}</p>
          <p className="note">{scene.context}</p>
          <details className="scene-notes">
            <summary>查看场景学习档案与评价标准</summary>
            <p>地点：{scene.location}</p>
            {scene.roles.map((r) => (
              <p key={r.name}>
                {r.name} · {r.job} · {r.relationship}
              </p>
            ))}
            <h3>词汇与语法</h3>
            <p>{scene.vocabulary.map((v) => `${v.en}（${v.zh}）`).join(' · ')}</p>
            <ul>
              {scene.grammar.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <h3>文化与沟通</h3>
            <ul>
              {scene.culture.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <h3>本次任务的评价标准</h3>
            <ul>
              {scene.evaluation.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <p>{advanced ? scene.difficulty.c1 : scene.difficulty.b2}</p>
          </details>
          <div className="row spread">
            <h3>
              角色示范 · {demo + 1} / {scene.turns.length}
            </h3>
            <button className="text-button" aria-pressed={zh} onClick={() => setZh(!zh)}>
              {zh ? '隐藏中文' : '显示中文'}
            </button>
          </div>
          <div className="dialogue-line">
            <span>{scene.turns[demo].role}</span>
            <p lang="en">{scene.turns[demo].line}</p>
            {zh && <small>{scene.turns[demo].zh}</small>}
            <Speak text={scene.turns[demo].line} />
          </div>
          <div className="dialogue-line user-line">
            <span>你 · 一种可能的回应</span>
            <p lang="en">{scene.turns[demo].sample}</p>
            <Speak text={scene.turns[demo].sample} />
          </div>
          <div className="row wrap">
            <button
              className="button ghost"
              disabled={demo === 0}
              onClick={() => setDemo(demo - 1)}
            >
              上一步示范
            </button>
            <button
              className="button ghost"
              disabled={demo === scene.turns.length - 1}
              onClick={() => setDemo(demo + 1)}
            >
              下一步示范
            </button>
            <button className="button primary" onClick={() => setPhase(1)}>
              开始听力任务
              <ArrowRight size={17} />
            </button>
          </div>
          <p className="small-text muted">
            1×
            使用设备英文语音；设备不可用时使用合成备用音频。真实环境中的口音、语速和背景声会变化。
          </p>
        </section>
      )}
      {phase === 1 && (
        <div className="card exercise-card">
          <Exercise
            question={course.questions[0]}
            onDone={(first) => {
              setScore(first ? 1 : 0);
              setPhase(2);
            }}
          />
        </div>
      )}
      {phase === 2 && (
        <>
          <section className="card expression-analysis">
            <p className="eyebrow">NOTICE THE DIFFERENCE</p>
            <h2>同一个意图，怎样说更合适？</h2>
            <p>以下均是可用表达。流畅英语使用者常这样说，但每个人、行业和文化的习惯都有差异。</p>
            {scene.expressions.map((e) => (
              <article key={e.basic} className="expression-family">
                <div className="expression-registers">
                  {[
                    ['基础表达', e.basic],
                    ['自然表达', e.natural],
                    ['常见流畅表达', e.fluent],
                  ].map(([label, en]) => (
                    <div key={label}>
                      <span className="tag neutral">{label}</span>
                      <p lang="en">{en}</p>
                      <Speak text={en} compact />
                    </div>
                  ))}
                </div>
                <p>{e.explanation}</p>
                <p className="small-text muted">使用场合：{e.usage}</p>
              </article>
            ))}
            <div className="note">
              <strong>读懂言外之意</strong>
              <p>{scene.nuance}</p>
            </div>
          </section>
          <div className="card exercise-card">
            <Exercise
              question={course.questions[1]}
              onDone={(first) => {
                setScore((n) => n + (first ? 1 : 0));
                setPhase(3);
              }}
            />
          </div>
        </>
      )}
      {phase === 3 && (
        <div className="communication-practice-grid">
          <section className="card scene-dialogue">
            <div className="row spread">
              <p className="eyebrow">
                YOUR TURN · {step + 1} / {scene.turns.length}
              </p>
              <button className="text-button" aria-pressed={zh} onClick={() => setZh(!zh)}>
                {zh ? '隐藏中文' : '显示中文'}
              </button>
            </div>
            <div className="dialogue-line">
              <span>{turn.role}</span>
              <p lang="en">{turn.line}</p>
              {zh && <small>{turn.zh}</small>}
              <Speak text={turn.line} />
            </div>
            <h3>沟通任务</h3>
            <p>{turn.task}</p>
            {advanced && <p className="note">{turn.advanced.hint}</p>}
            <ul className="task-checklist">
              {task.criteria.map((c) => (
                <li key={c.label}>
                  {feedback?.checks.find((f) => f.label === c.label)?.met ? '✓' : '○'} {c.label}
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const result = taskEvidence(answer, task);
                setFeedback(result);
                if (!result.passed) {
                  setMistakes((n) => n + 1);
                  setRevised(true);
                }
              }}
            >
              <label className="field-label" htmlFor="task-output">
                你的自主英文回答
              </label>
              <textarea
                id="task-output"
                value={answer}
                maxLength={1500}
                disabled={feedback?.passed}
                placeholder="用自己的理由和措辞回应，不需要背示范句。"
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setFeedback(null);
                }}
              />
              <VoiceInput
                onText={(value) => {
                  if (!feedback?.passed) {
                    setAnswer(value.slice(0, 1500));
                    setFeedback(null);
                  }
                }}
              />
              {feedback && (
                <div className={`feedback ${feedback.passed ? 'correct' : 'wrong'}`} role="status">
                  <strong>
                    {feedback.passed
                      ? '已找到任务要素，请核对意思与语气。'
                      : '补充或调整表达后再试。'}
                  </strong>
                  <p>
                    {feedback.words} 个英文单词
                    {feedback.enough
                      ? '，已达到输出长度。'
                      : `，请至少使用 ${task.minWords} 词说明意思。`}
                  </p>
                  {feedback.checks
                    .filter((c) => !c.met)
                    .map((c) => (
                      <p key={c.label}>待补充：{c.label}</p>
                    ))}
                  {feedback.issues.map((issue, i) => (
                    <p key={i}>
                      {issue.before} → {issue.after} · {issue.why}
                    </p>
                  ))}
                  <small>
                    仅按词语与已知规则检查，不保证语义、事实或语法完整正确；不作为英语等级评分。
                  </small>
                </div>
              )}
              {feedback?.passed ? (
                <>
                  <div className="dialogue-line role-response">
                    <span>预设角色回应 · 非 AI</span>
                    <p lang="en">{turn.followUp}</p>
                  </div>
                  <Speak text={turn.followUp} />
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => {
                      const updated = [
                        ...outputs,
                        { role: turn.role, prompt: turn.line, text: answer.trim(), revised },
                      ];
                      setOutputs(updated);
                      if (step === scene.turns.length - 1) {
                        const finalScore =
                          score + (mistakes === 0 && !updated.some((o) => o.revised) ? 1 : 0);
                        setScore(finalScore);
                        onFinish(finalScore, mistakes, updated);
                        setPhase(4);
                      } else {
                        setStep(step + 1);
                        setAnswer('');
                        setFeedback(null);
                        setRevised(false);
                      }
                    }}
                  >
                    {step === scene.turns.length - 1 ? '完成沟通任务' : '回应追问'}
                    <ArrowRight size={17} />
                  </button>
                </>
              ) : (
                <button className="button primary" disabled={!answer.trim()}>
                  检查任务要素
                </button>
              )}
            </form>
            <details
              onToggle={(e) => {
                if (e.currentTarget.open) {
                  setRevised(true);
                }
              }}
            >
              <summary>需要支架？查看一种参考回应</summary>
              <p lang="en">{turn.sample}</p>
              <p className="small-text muted">
                参考句只用于练习。结合自己的意思改写，不以重复句子证明独立掌握。
              </p>
            </details>
          </section>
          <div>
            <AIRolePractice
              key={step}
              scene={scene}
              level={advanced ? 'C1' : 'B2'}
              answer={answer}
              task={turn.task}
              onAdvice={() => setRevised(true)}
            />
            <section className="card output-history">
              <h3>已经说过的话</h3>
              {outputs.length ? (
                outputs.map((o, i) => (
                  <div key={i}>
                    <small>TURN {i + 1}</small>
                    <p lang="en">{o.text}</p>
                  </div>
                ))
              ) : (
                <p className="muted">每次回应会留在这里，帮助你保持上下文。</p>
              )}
            </section>
            <ExpressionCoach />
          </div>
        </div>
      )}
      {phase === 4 && (
        <section className="card completion">
          <div className="completion-mark">
            <Check size={34} />
          </div>
          <p className="eyebrow">FROM WORDS TO COMMUNICATION</p>
          <h2>你完成了一次有目的的交流。</h2>
          <p>{scene.goal}</p>
          <div className="result-grid">
            <div>
              <strong>{score} / 3</strong>
              <span>首次任务检查通过</span>
            </div>
            <div>
              <strong>{scene.turns.length} 轮</strong>
              <span>自主英文输出</span>
            </div>
            <div>
              <strong>{score === 3 ? '明天' : '现在'}</strong>
              <span>建议巩固</span>
            </div>
          </div>
          <p className="note">
            {lesson
              ? '课程与输出记录已保存，下一课已解锁。'
              : '探索与输出记录已保存，系统必修课程完成情况不变。'}
            {score !== 3
              ? '本次调整或提示使用会安排复习。'
              : '次日主动回忆，检查能否不用示范完成任务。'}
            本地任务检查不是语义评估、CEFR 认证或 AI 反馈。
          </p>
          <details>
            <summary>查看本次输出记录</summary>
            {outputs.map((o, i) => (
              <div key={i}>
                <p className="muted">{o.prompt}</p>
                <p lang="en">{o.text}</p>
              </div>
            ))}
          </details>
          {lesson && next && onNext && (
            <button className="button primary" onClick={() => onNext(next.id)}>
              继续：{next.title}
              <ArrowRight size={17} />
            </button>
          )}
          <button className="button ghost" onClick={onExit}>
            {lesson ? '返回学习首页' : '返回场景探索'}
          </button>
        </section>
      )}
    </section>
  );
}
