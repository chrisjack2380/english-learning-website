import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Pause, Play, RotateCcw } from 'lucide-react';
import {
  communicationScenes,
  higherLessons,
  createCommunicationLesson,
  type CommunicationScene,
} from '../advanced-content';
import type { Lesson } from '../content';
import { communicationFeedback } from '../feedback';
import { LearningText } from './KnowledgeContext';
import { AutoDialogue } from './AutoDialogue';
import { CommunicationWorld } from './CommunicationWorld';
import { Exercise } from './Exercise';
import { ExpressionCoach } from './ExpressionCoach';
import { Speak, VoiceInput } from './Speech';
import { AIRolePractice } from './AIRolePractice';
import { JourneyPlayer } from './JourneyPlayer';
import { communicationJourney } from '../journey-adapters';
export type OutputEvidence = {
  role: string;
  prompt: string;
  text: string;
  revised: boolean;
  guided?: boolean;
};
type PlayerProps = {
  id: CommunicationScene['id'];
  definition?: CommunicationScene;
  lesson?: Lesson;
  challenge?: boolean;
  onExit: () => void;
  onNext?: (id: string) => void;
  onFinish: (correct: number, mistakes: number, outputs: OutputEvidence[]) => void;
};
export function CommunicationPlayer(props: PlayerProps) {
  const [advanced, setAdvanced] = useState(false);
  const [complete, setComplete] = useState(false);
  const scene = props.definition || communicationScenes.find((s) => s.id === props.id)!;
  const course = props.lesson;
  const next = course
    ? higherLessons.filter((l) => l.track === course.track)[
        higherLessons.filter((l) => l.track === course.track).findIndex((l) => l.id === course.id) +
          1
      ]
    : undefined;
  return advanced ? (
    <AdvancedCommunicationPlayer {...props} />
  ) : (
    <>
      {scene.source === 'ai' && (
        <p className="note">
          当前场景表达由你的模型改写，尚未经过教学审核。请核对事实与用法；本地课程仍可独立使用。
        </p>
      )}
      <JourneyPlayer
        journey={{
          ...communicationJourney(
            scene,
            course
              ? `course-${course.id}`
              : scene.knowledgeIds
                ? `knowledge-${scene.knowledgeIds[0]}`
                : `scene-${scene.id}`,
          ),
          title: course?.title || (props.challenge ? `${scene.title} · C1 挑战` : scene.title),
        }}
        persist={!props.definition || !!scene.knowledgeIds}
        onExit={props.onExit}
        onAdvanced={() => setAdvanced(true)}
        onFinish={(c, m, o) => {
          props.onFinish(c, m, o);
          setComplete(true);
        }}
      />
      <details className="card">
        <summary>当前场景的表达分析与完整情境</summary>
        <p>{scene.context}</p>
        <p>{scene.nuance}</p>
        {scene.expressions.map((e) => (
          <article key={e.natural}>
            <p>
              <LearningText text={e.basic} />
            </p>
            <p>
              <LearningText text={e.natural} />
            </p>
            <p>
              <LearningText text={e.fluent} />
            </p>
            <p>{e.explanation}</p>
            <p>{e.usage}</p>
          </article>
        ))}
      </details>
      {complete && next && props.onNext && (
        <button className="button primary" onClick={() => props.onNext?.(next.id)}>
          继续：{next.title}
        </button>
      )}
    </>
  );
}
export function AdvancedCommunicationPlayer({
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
  const [feedback, setFeedback] = useState<ReturnType<typeof communicationFeedback> | null>(null);
  const [aiAuto, setAIAuto] = useState(false);
  const [submitted, setSubmitted] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const passed = Boolean(feedback?.canReflect && feedback.issues.length === 0 && confirmed);
  const [mistakes, setMistakes] = useState(0);
  const [revised, setRevised] = useState(false);
  const [score, setScore] = useState(0);
  const [outputs, setOutputs] = useState<OutputEvidence[]>([]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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
        {lesson ? '返回学习首页' : scene.knowledgeIds ? '返回知识路线' : '返回场景探索'}
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
            <p lang="en">
              <LearningText text={scene.turns[demo].line} zh={scene.turns[demo].zh} />
            </p>
            {zh && <small>{scene.turns[demo].zh}</small>}
            <Speak text={scene.turns[demo].line} />
          </div>
          <div className="dialogue-line user-line">
            <span>你 · 一种可能的回应</span>
            <p lang="en">
              <LearningText text={scene.turns[demo].sample} />
            </p>
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
                      <p lang="en">
                        <LearningText text={en} zh={e.usage} />
                      </p>
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
              <p lang="en">
                <LearningText text={turn.line} zh={turn.zh} />
              </p>
              {zh && <small>{turn.zh}</small>}
              <Speak text={turn.line} />
            </div>
            <h3>沟通任务</h3>
            <p>{turn.task}</p>
            {advanced && <p className="note">{turn.advanced.hint}</p>}
            <ul className="task-checklist">
              {task.criteria.map((c) => (
                <li key={c.label}>○ {c.label}</li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const result = communicationFeedback(answer, scene.context, scene.knowledgeIds);
                setConfirmed(false);
                setFeedback(result);
                if (result.canReflect && result.issues.length === 0) setSubmitted((n) => n + 1);
                if (!result.canReflect || result.issues.length) {
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
                disabled={passed}
                placeholder="用自己的理由和措辞回应，不需要背示范句。"
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setFeedback(null);
                  setConfirmed(false);
                }}
              />
              <VoiceInput
                onText={(value) => {
                  if (!passed) {
                    setAnswer(value.slice(0, 1500));
                    setFeedback(null);
                    setConfirmed(false);
                  }
                }}
              />
              {feedback && (
                <div className="feedback layered-feedback" role="status">
                  <strong>
                    {!feedback.canReflect || feedback.issues.length
                      ? '补充或调整表达后再试。'
                      : '分层建议已生成，请对照任务核对。'}
                  </strong>
                  <h4>1 · 信息与语言正确性</h4>
                  <p>{feedback.correctness}</p>
                  <h4>2 · 自然表达</h4>
                  <p lang="en">{feedback.naturalness}</p>
                  <h4>3 · 当前语境</h4>
                  <p>{feedback.context}</p>
                  <h4>4 · 如何升级</h4>
                  <p>{feedback.upgrade}</p>
                  <p>{feedback.why}</p>
                  {feedback.issues.map((issue, i) => (
                    <p key={i}>
                      {issue.before} → {issue.after} · {issue.why}
                    </p>
                  ))}
                  {!feedback.canReflect && <p>这句尚未提供当前任务需要的信息；请表达你的意思。</p>}
                  <small>
                    本地反馈只判断已覆盖规则；未确认的意思和语境需自行核对或请求真实模型。没有关键词通关或英语能力评分。
                  </small>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      disabled={!feedback.canReflect || Boolean(feedback.issues.length)}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    我已对照沟通目标、事实和参考核对意思与语气
                  </label>
                </div>
              )}
              {feedback?.canReflect && feedback.issues.length === 0 && (
                <AutoDialogue text={turn.followUp} role="预设角色回应 · 非 AI" />
              )}
              {passed ? (
                <>
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => {
                      const updated = [
                        ...outputs,
                        { role: turn.role, prompt: turn.line, text: answer.trim(), revised },
                      ];
                      setOutputs(updated);
                      setConfirmed(false);
                      setSubmitted(0);
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
                        setConfirmed(false);
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
                  查看分层反馈
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
            <label className="check-field ai-auto-choice">
              <input
                type="checkbox"
                checked={aiAuto}
                onChange={(e) => setAIAuto(e.target.checked)}
              />
              本场景提交回答后使用我的 AI 自动互动（发送练习文本）
            </label>
            <AIRolePractice
              key={step}
              automatic={aiAuto}
              requestId={submitted}
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
              <span>理解与独立应用记录</span>
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
            本次记录包含你的自评，不是语义认证、CEFR 等级或真实掌握评分。
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
            {lesson ? '返回学习首页' : scene.knowledgeIds ? '返回知识路线' : '返回场景探索'}
          </button>
        </section>
      )}
    </section>
  );
}
