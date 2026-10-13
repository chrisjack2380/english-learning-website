import { lazy, Suspense, useEffect, useState } from 'react';
const OfficeWorld = lazy(() => import('./OfficeWorld'));

import { contextRecall, stageRecallTerms } from '../context-practice';
import { stageViews } from '../stage-visuals';
import { ArrowRight, ChevronLeft, Pause, Play, RotateCcw } from 'lucide-react';
import type { LearningJourney } from '../journey-schema';
import { teachingSteps } from '../journey-schema';
import {
  equivalentOutput,
  freshStage,
  guidedFirstScore,
  type StageProgress,
} from '../journey-learning';
import { lookupKnowledge, wordId, type KnowledgeEntry } from '../knowledge';
import { recordKnowledge } from '../knowledge-learning';
import { communicationFeedback } from '../feedback';
import { LearningText, useKnowledge } from './KnowledgeContext';
import { useTeaching } from './TeachingContext';
import { Speak, VoiceInput } from './Speech';
import { AutoDialogue } from './AutoDialogue';
import type { OutputEvidence } from './CommunicationPlayer';
// Rotate answer positions deterministically. This is presentation, never a semantic grading rule.
export function optionOrder(options: string[], key: string) {
  const n = [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % options.length;
  return [...options.slice(n), ...options.slice(0, n)];
}
export function JourneyWorld({
  image,
  place,
  children,
  priority = false,
  stageId,
}: {
  stageId?: string;
  image: number;
  place: string;
  children?: React.ReactNode;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);
  useEffect(() => {
    setViewIndex(0);
    setLoaded(false);
    setFailed(false);
  }, [stageId]);
  const views = stageId ? stageViews[stageId] : undefined;
  const view = views?.[viewIndex];
  const tile = view?.tile ?? image;
  return (
    <div
      className={`journey-world focus-${view?.focus || 'center'} ${paused ? 'still' : ''} ${failed ? 'image-fallback' : ''}`}
    >
      {!failed && (
        <img
          key={`${stageId}-${viewIndex}`}
          src={`${import.meta.env.BASE_URL}visuals/${view?.atlas === 'process' ? 'process' : 'life'}-atlas.png`}
          alt={`${view?.name || place} · 原创合成环境图片`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ left: `-${(tile % 3) * 100}%`, top: `-${Math.floor(tile / 3) * 100}%` }}
        />
      )}
      <span className="journey-place">{view?.name || place}</span>
      {view && (
        <div className={`scene-activity motion-${view.motion}`} aria-label="环境动态">
          <span className="scene-actor" aria-hidden="true">
            <i />
            <b />
          </span>
          <span className="scene-state" lang="en">
            {view.state}
          </span>
        </div>
      )}
      {views && views.length > 1 && (
        <div className="scene-view-switch" aria-label="当前阶段的环境">
          <button
            type="button"
            className="tag"
            onClick={() => {
              setViewIndex((viewIndex + 1) % views.length);
              setLoaded(false);
            }}
          >
            切换环境：{views[(viewIndex + 1) % views.length].name}
          </button>
        </div>
      )}
      {!failed && !loaded && (
        <p className="image-loading-note" role="status">
          正在加载场景图片…
        </p>
      )}
      <button
        className="world-pause icon-button"
        type="button"
        aria-label={paused ? '恢复场景动效' : '暂停场景动效'}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play size={16} /> : <Pause size={16} />}
      </button>
      {failed && (
        <p className="image-fallback-note">环境图片暂未加载；可继续点击下面的英语元素学习。</p>
      )}
      {children}
    </div>
  );
}
export function JourneyPlayer({
  journey,
  onExit,
  onFinish,
  persist = true,
  onAdvanced,
  office3d = false,
}: {
  journey: LearningJourney;
  onExit: () => void;
  onFinish?: (correct: number, mistakes: number, outputs: OutputEvidence[]) => void;
  office3d?: boolean;
  persist?: boolean;
  onAdvanced?: () => void;
}) {
  const t = useTeaching(),
    k = useKnowledge();
  const saved = persist ? t.records[journey.id] : undefined;
  const [index, setIndex] = useState(() => {
    const current = Math.min(saved?.stage || 0, journey.stages.length - 1);
    const unfinished = journey.stages.findIndex((s) => !saved?.stages[s.id]?.completed);
    return saved?.stages[journey.stages[current].id]?.completed && unfinished >= 0
      ? unfinished
      : current;
  });
  const [local, setLocal] = useState<Record<string, StageProgress>>(() => saved?.stages || {});
  const stage = journey.stages[index];
  const p = local[stage.id] || freshStage();
  const [selected, setSelected] = useState('');
  const [choice, setChoice] = useState('');
  const [message, setMessage] = useState('');
  const [input, setInput] = useState(p.outputText || '');
  const [selfChecked, setSelfChecked] = useState(false);
  const [feedbackShown, setFeedbackShown] = useState(false);
  const [hint, setHint] = useState(false);
  const [typed, setTyped] = useState(Boolean(p.outputText && p.phase === 5));
  const [audio, setAudio] = useState(true);
  const items = stageRecallTerms(stage);
  const nextTerm = items.find((term) => !p.recognized.includes(term));
  function contextualUnit(term: string): KnowledgeEntry | undefined {
    const known = lookupKnowledge(term);
    if (known) return known;
    const word = stage.words.find((w) => w[0] === term),
      expression = stage.expressions.find((e) => e[0] === term);
    if (!word && !expression) return;
    const zh = word?.[1] || expression![1];
    return {
      id: wordId(term),
      term,
      zh,
      en: word?.[2] || 'A contextual expression; check the stated purpose against the scene.',
      example: word?.[3] || term,
      translation: word?.[4] || zh,
      collocations: word?.[5].split(';') || stage.words.slice(0, 2).map((w) => w[0]),
      aliases: [],
      kind: 'phrase',
      level: 'B2',
      tags: ['当前模板'],
      goals: ['work'],
      ipa: '',
      usage: expression?.[2] || zh,
      contrast: '当前场景参考表达，生成内容需核对；不自动加入系统知识库。',
      scene: journey.id,
      domain: 'daily',
      source: 'original',
      question: {
        prompt: '这句表达的用途是什么？',
        options: [zh, '询问水果价格', '取消整个出行计划'],
        answer: zh,
        why: expression?.[2] || word![4],
      },
    };
  }
  const unit = contextualUnit(nextTerm || items[0]);
  const inspected = contextualUnit(selected);
  const recall = unit
    ? contextRecall(
        unit,
        stage.words.map((w) => w[0]),
      )
    : undefined;
  function commit(patch: Partial<StageProgress>, atIndex = index) {
    const sid = journey.stages[atIndex].id;
    const next = {
      ...local,
      [sid]: {
        ...(local[sid] || freshStage()),
        learningVersion: 2 as const,
        ...patch,
        at: Date.now(),
      },
    };
    setLocal(next);
    if (persist)
      t.update({ ...t.records, [journey.id]: { stage: atIndex, stages: next, at: Date.now() } });
  }
  function advance(phase: number) {
    commit({ phase });
    setChoice('');
    setMessage('');
    setInput('');
    setSelected('');
    setHint(false);
    setSelfChecked(false);
    setFeedbackShown(false);
  }
  function discover(term: string) {
    setSelected(term);
    if (!p.seen.includes(term)) {
      commit({ seen: [...p.seen, term] });
      const e = lookupKnowledge(term);
      if (e) k.update(recordKnowledge(k.state, e.id, 'discover'));
    }
  }
  function wrong(text: string, id?: string) {
    const group = p.phase === 3 ? 'listening' : p.phase === 5 ? 'output' : 'vocabulary';
    commit({
      mistakes: p.mistakes + 1,
      firstChecks: {
        ...(p.firstChecks || {
          vocabulary: p.mistakes === 0,
          listening: p.mistakes === 0,
          output: p.mistakes === 0,
        }),
        [group]: false,
      },
    });
    setMessage(text);
    if (id) k.update(recordKnowledge(k.state, id, 'miss'));
  }
  useEffect(() => {
    setSelfChecked(false);
    setFeedbackShown(false);
  }, [index]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [index, p.phase]);
  function finishOutput(answer: string, mode: StageProgress['outputMode'] = 'supported') {
    const finalChecks = {
      ...(p.firstChecks || {
        vocabulary: p.mistakes === 0,
        listening: p.mistakes === 0,
        output: p.mistakes === 0,
      }),
      ...(mode === 'self-checked' ? { output: false } : {}),
    };
    commit({
      phase: 6,
      output: true,
      completed: true,
      outputText: answer,
      outputMode: mode,
      firstChecks: finalChecks,
    });
    if (mode === 'self-checked') {
      const entry = lookupKnowledge(stage.expressions[0][0]);
      if (entry) k.update(recordKnowledge(k.state, entry.id, 'miss'));
    }
    setMessage('');
    if (index === journey.stages.length - 1) {
      const mistakes = Object.values(local).reduce((n, s) => n + s.mistakes, 0);
      onFinish?.(
        guidedFirstScore(
          Object.values({ ...local, [stage.id]: { ...p, firstChecks: finalChecks } }),
        ),
        mistakes,
        [
          {
            role: stage.role,
            prompt: stage.output.prompt,
            text: answer,
            revised: true,
            guided: true,
          },
          {
            role: '学习者 · 跟读自评',
            prompt: '模仿参考表达',
            text: stage.expressions[0][0],
            revised: true,
            guided: true,
          },
        ],
      );
    }
  }
  return (
    <section className="journey-player">
      <div className="row spread wrap">
        <button className="text-button back" onClick={onExit}>
          <ChevronLeft size={17} />
          返回学习空间
        </button>
        <button className="text-button" aria-pressed={audio} onClick={() => setAudio(!audio)}>
          {audio ? '自动语音：开' : '自动语音：关'}
        </button>
        {onAdvanced && (
          <button className="text-button" onClick={onAdvanced}>
            高级自由表达
          </button>
        )}
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">LIFE → LANGUAGE · {journey.level}</p>
          <h1>{journey.title}</h1>
          <p className="muted">{journey.goal}</p>
        </div>
        <span className="tag">
          阶段 {index + 1} / {journey.stages.length}
        </span>
      </div>
      <div className="journey-stage-road" aria-label="生活过程阶段">
        {journey.stages.map((s, i) => (
          <button
            key={s.id}
            aria-current={index === i ? 'step' : undefined}
            disabled={i > 0 && !local[journey.stages[i - 1].id]?.completed}
            onClick={() => {
              setIndex(i);
              setSelected('');
              setMessage('');
              setChoice('');
              setInput('');
              commit({}, i);
            }}
          >
            <span>{local[s.id]?.completed ? '✓' : i + 1}</span>
            {s.title}
          </button>
        ))}
      </div>
      <ol className="teaching-road" aria-label="教学步骤">
        {teachingSteps.map((s, i) => (
          <li key={s} className={i === p.phase ? 'current' : i < p.phase ? 'done' : ''}>
            {i + 1} · {s}
          </li>
        ))}
      </ol>
      <div className="journey-layout">
        <aside className="journey-environment">
          {office3d ? (
            <Suspense fallback={<p>正在准备三维办公室…</p>}>
              <OfficeWorld onSelect={discover} seen={p.seen} terms={stage.words.map((w) => w[0])} />
            </Suspense>
          ) : (
            <JourneyWorld image={stage.image} place={stage.place} priority stageId={stage.id}>
              <div className="world-word-elements">
                {stage.words.map(([term]) => (
                  <button
                    key={term}
                    onClick={() => discover(term)}
                    aria-pressed={selected === term}
                    className={p.seen.includes(term) ? 'discovered' : ''}
                  >
                    {p.seen.includes(term) ? '✓ ' : '+ '}
                    {term}
                  </button>
                ))}
              </div>
            </JourneyWorld>
          )}
          <p className="muted small-text">
            点击物品、动作与状态标签发现英语。图片用于环境理解，标签也支持键盘操作。
          </p>
          <AutoDialogue
            key={`${stage.id}-${p.phase}`}
            text={
              p.phase === 3
                ? stage.listening.line
                : p.phase === 6
                  ? stage.output.reply
                  : stage.intro
            }
            zh={
              p.phase === 3
                ? stage.listening.zh
                : p.phase === 6
                  ? stage.output.replyZh
                  : stage.introZh
            }
            role={stage.role}
            auto={audio}
          />
          {selected && (
            <article className="card discovered-word" aria-label="发现的英语元素">
              <h3>{selected}</h3>
              {inspected ? (
                <>
                  <p>{inspected.zh}</p>
                  <p lang="en">{inspected.en}</p>
                  <Speak key={selected} text={selected} auto={audio} />
                  <LearningText text={inspected.example} zh={inspected.translation} />
                  <p>{inspected.translation}</p>
                  <p className="muted">{inspected.collocations.join(' · ')}</p>
                  <button
                    className="text-button"
                    onClick={() => k.open(selected, inspected.example, inspected.translation)}
                  >
                    完整释义与个人词库
                  </button>
                </>
              ) : (
                <>
                  <p>从下面的原文与译文理解当前含义。</p>
                  <button
                    className="text-button"
                    onClick={() => k.open(selected, stage.intro, stage.introZh)}
                  >
                    查看上下文词典
                  </button>
                </>
              )}
            </article>
          )}
        </aside>
        <div className="card journey-lesson">
          <p className="eyebrow">
            {stage.title} · {teachingSteps[p.phase]}
          </p>
          {p.phase === 0 && (
            <>
              <h2>先观察，再认识这里的英语。</h2>
              <p>
                点击环境里的 {stage.words.length}{' '}
                个标签，了解它们在这个阶段的意思。现在不需要组织英文回答。
              </p>
              <p role="status">
                已发现 {stage.words.filter((w) => p.seen.includes(w[0])).length} /{' '}
                {stage.words.length}
              </p>
              <button
                className="button primary"
                disabled={!stage.words.every((w) => p.seen.includes(w[0]))}
                onClick={() => advance(1)}
              >
                学习词汇与表达 <ArrowRight size={17} />
              </button>
            </>
          )}
          {p.phase === 1 && (
            <>
              <h2>理解词语怎样组成表达。</h2>
              <div className="stage-vocabulary">
                {stage.words.map(([term, zh]) => (
                  <button className="word-learning-card" key={term} onClick={() => discover(term)}>
                    <strong lang="en">{term}</strong>
                    <span>{zh}</span>
                  </button>
                ))}
              </div>
              {stage.expressions.map(([line, zh, why]) => (
                <article className="expression-input" key={line}>
                  <p className="english">
                    <LearningText text={line} zh={zh} />
                  </p>
                  <p>{zh}</p>
                  <p className="note">{why}</p>
                  <Speak text={line} />
                  <button
                    className="text-button"
                    onClick={() => {
                      discover(line);
                      k.open(line, line, zh);
                    }}
                  >
                    查这句表达 / 加入词库
                  </button>
                </article>
              ))}
              <p className="small-text muted">
                先在情境中回忆三个关键词语，其余词语继续探索；看过和收藏不等于掌握。
              </p>
              <button className="button primary" onClick={() => advance(2)}>
                开始情境回忆
              </button>
            </>
          )}
          {p.phase === 2 && unit && recall && nextTerm && (
            <>
              <h2>让词语回到真实表达里。</h2>
              <p>
                情境回忆 {items.filter((term) => p.recognized.includes(term)).length + 1} /{' '}
                {items.length}
              </p>
              <p>
                {stage.place} · {recall.prompt}
              </p>
              <p className="english" lang="en">
                {recall.line}
              </p>
              <button className="text-button" onClick={() => setHint(!hint)}>
                需要一点提示
              </button>
              {hint && (
                <p className="note">
                  {recall.hint}
                  <br />
                  {unit.translation}
                </p>
              )}
              <div className="guided-options" role="group" aria-label="情境回忆选项">
                {optionOrder(recall.options, unit.id).map((a) => (
                  <button
                    aria-pressed={choice === a}
                    key={a}
                    onClick={() => {
                      setChoice(a);
                      setMessage('');
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                className="button primary"
                disabled={!choice}
                onClick={() => {
                  if (choice === recall.answer) {
                    const recognized = [...new Set([...p.recognized, nextTerm])];
                    commit({
                      recognized,
                      phase: items.every((term) => recognized.includes(term)) ? 3 : 2,
                      ...(hint
                        ? {
                            firstChecks: {
                              ...(p.firstChecks || {
                                vocabulary: true,
                                listening: true,
                                output: true,
                              }),
                              vocabulary: false,
                            },
                          }
                        : {}),
                    });
                    k.update(recordKnowledge(k.state, unit.id, hint ? 'miss' : 'recognize'));
                    setChoice('');
                    setMessage('');
                    setHint(false);
                  } else wrong(`再读一次完整情境：${unit.example}。${unit.translation}`, unit.id);
                }}
              >
                理解并继续
              </button>
              <p className="muted small-text">
                可随时查看提示。使用提示会安排短期巩固，不计为独立回忆。
              </p>
            </>
          )}
          {p.phase === 2 && !nextTerm && (
            <button className="button primary" onClick={() => advance(3)}>
              继续听角色表达
            </button>
          )}
          {p.phase === 3 && (
            <>
              <h2>听懂角色的意思。</h2>
              <p>先听，再选对应的行动或情境；需要时可慢速、重播或查看翻译。</p>
              <h3>{stage.listening.question}</h3>
              <div className="guided-options" role="group" aria-label="听力选项">
                {optionOrder(stage.listening.options, stage.id).map((a) => (
                  <button
                    aria-pressed={choice === a}
                    key={a}
                    onClick={() => {
                      setChoice(a);
                      setMessage('');
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                className="button primary"
                disabled={!choice}
                onClick={() => {
                  if (choice === stage.listening.answer) {
                    commit({ listening: true, phase: 4 });
                    setChoice('');
                    setMessage('');
                  } else wrong(stage.listening.why, lookupKnowledge(stage.expressions[0][0])?.id);
                }}
              >
                检查听力
              </button>
            </>
          )}
          {p.phase === 4 && (
            <>
              <h2>借助词库，把表达补完整。</h2>
              <p>{stage.cloze.zh}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (equivalentOutput(input, stage.cloze.answer, stage.cloze.alternatives)) {
                    commit({ cloze: true, phase: 5 });
                    setInput('');
                    setMessage('');
                  } else
                    wrong(
                      `这道填空可用 ${stage.cloze.answer}。${stage.cloze.why}`,
                      lookupKnowledge(stage.cloze.answer)?.id,
                    );
                }}
              >
                <p className="english">
                  {stage.cloze.before}
                  <input
                    aria-label="情境填空"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={200}
                  />
                  {stage.cloze.after}
                </p>
                <div className="row wrap">
                  {optionOrder(
                    [...new Set([stage.cloze.answer, ...stage.words.slice(0, 3).map((w) => w[0])])],
                    stage.id,
                  ).map((w) => (
                    <button type="button" className="tag" key={w} onClick={() => setInput(w)}>
                      {w}
                    </button>
                  ))}
                </div>
                <p className="muted small-text">词库可点击填入；这是受控填空，不是自由表达评分。</p>
                <button className="button primary" disabled={!input.trim()}>
                  检查填空
                </button>
              </form>
            </>
          )}
          {p.phase === 5 && (
            <>
              <h2>先模仿，再表达自己的意思。</h2>
              <p className="english">
                <LearningText text={stage.expressions[0][0]} zh={stage.expressions[0][1]} />
              </p>
              <Speak text={stage.expressions[0][0]} />
              <p>听一遍，试着跟读。是否跟读由你确认，不代表发音已合格。</p>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={p.imitated}
                  onChange={(e) => commit({ imitated: e.target.checked })}
                />
                我已尝试跟读
              </label>
              <h3>
                <LearningText text={stage.output.prompt} zh={stage.output.zh} />
              </h3>
              <p>{stage.output.zh}</p>
              <p className="note">当前练习意图：{stage.output.intent || stage.output.why}</p>
              <button
                className="text-button"
                onClick={() => {
                  setTyped(!typed);
                  setInput('');
                  setSelfChecked(false);
                  setFeedbackShown(false);
                  setChoice('');
                  setMessage('');
                }}
              >
                {typed ? '使用有支架的选择回答' : '可选：自己输入 / 用语音试一试'}
              </button>
              {typed ? (
                <>
                  <label>
                    我的简单回应
                    <textarea
                      aria-label="我的简单回应"
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setSelfChecked(false);
                        setFeedbackShown(false);
                        setChoice('');
                        commit({ outputText: e.target.value });
                      }}
                      maxLength={1500}
                    />
                  </label>
                  <VoiceInput
                    onText={(text) => {
                      setInput(text);
                      setSelfChecked(false);
                      setFeedbackShown(false);
                      setChoice('');
                      commit({ outputText: text });
                    }}
                  />
                  <button
                    className="button ghost"
                    disabled={!input.trim()}
                    onClick={() => {
                      setFeedbackShown(true);
                      if (equivalentOutput(input, stage.output.answer, stage.output.equivalents)) {
                        setMessage('意思正确，这个简单表达可以完成当前任务。');
                        setChoice(input);
                      } else {
                        const f = communicationFeedback(input, stage.output.zh);
                        setMessage(
                          `${f.correctness} ${f.naturalness} ${f.context} ${f.upgrade} 当前本地模式未覆盖这种说法，不据此判错。请核对下方任务与参考，确认后可以保留自己的表达继续。`,
                        );
                      }
                    }}
                  >
                    查看表达反馈
                  </button>
                  <p className="note">
                    沟通目标：{stage.output.intent || stage.task}
                    <br />
                    关键词支架：
                    {stage.words
                      .slice(0, 3)
                      .map((w) => w[0])
                      .join(' · ')}
                    <br />
                    参考：{stage.output.answer}。{stage.output.why}
                  </p>
                  {feedbackShown &&
                    !equivalentOutput(input, stage.output.answer, stage.output.equivalents) && (
                      <label className="check-field">
                        <input
                          type="checkbox"
                          checked={selfChecked}
                          onChange={(e) => setSelfChecked(e.target.checked)}
                        />
                        我已核对：回应符合沟通目标，没有添加未知事实
                      </label>
                    )}
                  <p className="small-text muted">
                    自主核对可以继续学习，记录为自评；不自动认证意思、自然度或语境。可修改自己的表达再看反馈。
                  </p>
                </>
              ) : (
                <div className="guided-options" role="group" aria-label="简单回应选项">
                  {optionOrder(stage.output.options, stage.id).map((a) => (
                    <button
                      aria-pressed={choice === a}
                      key={a}
                      onClick={() => {
                        setChoice(a);
                        setMessage('');
                      }}
                    >
                      <span lang="en">{a}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                className="button primary"
                disabled={
                  !p.imitated ||
                  !(typed ? input.trim() && feedbackShown && (choice || selfChecked) : choice)
                }
                onClick={() => {
                  if (typed && selfChecked) finishOutput(input, 'self-checked');
                  else if (equivalentOutput(choice, stage.output.answer, stage.output.equivalents))
                    finishOutput(choice, typed ? 'reviewed' : 'supported');
                  else wrong(`这个回答本身可能语法正确，但没有回应当前问题。${stage.output.why}`);
                }}
              >
                完成简单回应
              </button>
              <p className="small-text muted">
                无需麦克风也可完整学习。自主复杂表达在高级模式中训练。
              </p>
            </>
          )}
          {p.phase === 6 && (
            <>
              <h2>这一小段，已经学进生活。</h2>
              <p>
                完成 {items.filter((term) => p.recognized.includes(term)).length}{' '}
                个关键词语的情境回忆、听力理解、填空和回应。其他看过的词语尚未授予掌握。
              </p>
              <p className="note">
                {p.mistakes
                  ? `${p.mistakes} 次调整已记录；答错词语安排 10 分钟后复习。`
                  : '本段首次理解正确的词语安排次日复习。'}{' '}
                辨认、跟读与自主表达是不同能力；本段不作为流利度或发音认证。
              </p>
              <p className="note">
                表达证据：
                {p.outputMode === 'self-checked'
                  ? '自主核对，尚未自动验证语义'
                  : p.outputMode === 'reviewed'
                    ? '审核同义表达'
                    : '借助表达选择'}
                {p.outputText && <span lang="en"> · {p.outputText}</span>}
              </p>
              <h3>带走两句表达</h3>
              {stage.expressions.map(([en, zh]) => (
                <p key={en}>
                  <LearningText text={en} zh={zh} />
                </p>
              ))}
              {index < journey.stages.length - 1 ? (
                <button
                  className="button primary"
                  onClick={() => {
                    const next = index + 1;
                    setIndex(next);
                    commit({}, next);
                    setMessage('');
                    setChoice('');
                    setInput('');
                    setSelected('');
                    setTyped(false);
                  }}
                >
                  继续：{journey.stages[index + 1].title}
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button className="button primary" onClick={onExit}>
                  回到学习空间，继续下一步
                </button>
              )}
              <button
                className="text-button"
                onClick={() => {
                  commit({ ...freshStage() });
                  setMessage('');
                  setChoice('');
                  setInput('');
                }}
              >
                再练这一阶段 <RotateCcw size={15} />
              </button>
            </>
          )}
          {message && (
            <p className="note" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
