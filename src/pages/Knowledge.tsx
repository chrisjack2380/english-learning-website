import { useState } from 'react';
import {
  goalLabels,
  knowledgeEntries,
  knowledgeSources,
  relatedKnowledge,
  type LearningGoal,
} from '../knowledge';
import { knowledgePlan, knowledgeToScene, recordKnowledge } from '../knowledge-learning';
import { LearningText, useKnowledge } from '../components/KnowledgeContext';
import { Speak } from '../components/Speech';
import type { CommunicationScene } from '../scene-schema';
import { lifeJourneys } from '../life-content';
import { dayKey } from '../learning';
export function KnowledgePage({
  onOpen,
  advanced = false,
  onJourney,
  onBasic,
}: {
  onOpen: (s: CommunicationScene) => void;
  advanced?: boolean;
  onJourney: (id: string) => void;
  onBasic: (id: string) => void;
}) {
  const { state, update, open } = useKnowledge();
  const plan = knowledgePlan(state, advanced);
  const [selected, setSelected] = useState(plan.next?.id || 'allocate');
  const [search, setSearch] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [privateText, setPrivateText] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const e = knowledgeEntries.find((e) => e.id === selected)!;
  const filtered = knowledgeEntries.filter(
    (e) =>
      (!savedOnly || state.records[e.id]?.saved || state.records[e.id]?.introducedAt) &&
      `${e.term} ${e.zh} ${e.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()),
  );
  function choose(id: string) {
    setSelected(id);
    setAnswer('');
    setFeedback('');
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">KNOWLEDGE → UNDERSTANDING → COMMUNICATION</p>
          <h1>让知识，真正用得出来。</h1>
          <p className="muted">先理解含义、搭配与边界，再把它用于有目的的交流。</p>
        </div>
        <span className="tag">{knowledgeEntries.length} 个原创词语与知识单元</span>
      </div>
      <section className="card knowledge-goal">
        <label>
          我的学习目标
          <select
            aria-label="我的学习目标"
            value={state.goal}
            onChange={(ev) => {
              const goal = ev.target.value as LearningGoal;
              update({ ...state, goal });
              const next = knowledgePlan({ ...state, goal }, advanced).next;
              if (next) choose(next.id);
            }}
          >
            {Object.entries(goalLabels).map(([id, label]) => (
              <option value={id} key={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div>
          <strong>{goalLabels[state.goal]} · 今日路线</strong>
          <p>
            已理解{' '}
            {
              knowledgeEntries.filter(
                (e) => e.goals.includes(state.goal) && state.records[e.id]?.understood,
              ).length
            }{' '}
            个 · {plan.due.length} 个到期应用练习
          </p>
          <div className="row wrap">
            {plan.upcoming.map((e) => (
              <button className="text-button" key={e.id} onClick={() => choose(e.id)}>
                {e.term} → 应用
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="card word-bank-summary">
        <h2>我的词库与复习</h2>
        <p>
          今天新发现{' '}
          {
            Object.values(state.records).filter(
              (r) => r.introducedAt && dayKey(r.introducedAt) === dayKey(),
            ).length
          }{' '}
          个 · 已收藏 {Object.values(state.records).filter((r) => r.saved).length} 个 · 已辨认{' '}
          {Object.values(state.records).filter((r) => r.recognitions).length} 个 · 到期{' '}
          {
            Object.values(state.records).filter(
              (r) => (r.introducedAt || r.understood) && r.due > 0 && r.due <= Date.now(),
            ).length
          }{' '}
          个
        </p>
        <p className="muted small-text">
          收藏和看过不代表掌握。辨认、应用输出分别累计；答错 10 分钟后再练，正确按 1 / 3 / 7 / 14
          天复习，同日重复不延长间隔。
        </p>
      </section>
      <div className="knowledge-layout">
        <aside className="card knowledge-index">
          <label>
            搜索知识
            <input
              type="search"
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="allocate、语法、商务…"
            />
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={savedOnly}
              onChange={(ev) => setSavedOnly(ev.target.checked)}
            />
            只看个人词库
          </label>
          <nav aria-label="知识单元">
            {filtered.map((unit) => (
              <button
                className={unit.id === selected ? 'selected' : ''}
                key={unit.id}
                onClick={() => choose(unit.id)}
              >
                <strong>{unit.term}</strong>
                <small>
                  {unit.zh} · {unit.level}
                  {state.records[unit.id]?.recognitions
                    ? ' · 已辨认'
                    : state.records[unit.id]?.understood
                      ? ' · 已理解'
                      : state.records[unit.id]?.introducedAt
                        ? ' · 已发现'
                        : ''}
                </small>
              </button>
            ))}
          </nav>
          {(savedOnly ? state.words || [] : []).map((w) => (
            <button
              className="personal-word"
              key={w.term}
              onClick={() => open(w.term, w.context, w.zh)}
            >
              <strong>{w.term}</strong>
              <small>{w.zh || '待补中文笔记'} · 我的摘词</small>
            </button>
          ))}
          {!filtered.length && !(savedOnly && state.words?.length) && (
            <p>没有匹配的单元，可调整搜索或加入词库。</p>
          )}
        </aside>
        <section className="card knowledge-unit">
          <p className="eyebrow">
            {e.tags.join(' · ')} · {e.level}
          </p>
          <h2>{e.term}</h2>
          <p className="english">{e.zh}</p>
          <p>{e.en}</p>
          <p className="muted">{e.ipa}</p>
          <Speak text={e.term} />
          <h3>搭配与场景含义</h3>
          {e.collocations.map((c) => (
            <p key={c}>
              <LearningText text={c} zh={e.usage} />
            </p>
          ))}
          <p>{e.usage}</p>
          <p className="note">{e.contrast}</p>
          <h3>放进真实表达</h3>
          <p className="english">
            <LearningText text={e.example} zh={e.translation} />
          </p>
          <p>{e.translation}</p>
          <Speak text={e.example} />
          <button
            className="text-button"
            onClick={() =>
              update(recordKnowledge(state, e.id, state.records[e.id]?.saved ? 'remove' : 'save'))
            }
          >
            {state.records[e.id]?.saved ? '移出个人词库' : '加入个人词库'}
          </button>
          <form
            className="knowledge-check"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (answer === e.question.answer) {
                update(recordKnowledge(state, e.id, 'understand'));
                setFeedback('含义理解已记录。下一步用自己的话完成场景任务。');
              } else {
                setFeedback(`再核对含义：${e.question.why}`);
              }
            }}
          >
            <fieldset>
              <legend>{e.question.prompt}</legend>
              {e.question.options.map((option) => (
                <label className="knowledge-option" key={option}>
                  <input
                    type="radio"
                    name="knowledge-answer"
                    checked={answer === option}
                    onChange={() => setAnswer(option)}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
            <button className="button ghost" disabled={!answer}>
              检查理解
            </button>
          </form>
          {feedback && (
            <p className="note" role="status">
              {feedback}
            </p>
          )}
          <div className="row wrap">
            <button
              className="button primary"
              onClick={() =>
                lifeJourneys.some((j) => j.id === e.scene)
                  ? onJourney(e.scene)
                  : ['greeting', 'cafe', 'directions'].includes(e.scene)
                    ? onBasic(e.scene)
                    : onOpen(knowledgeToScene(e.id, advanced))
              }
            >
              把 {e.term} 用到场景里
            </button>
            {state.records[e.id]?.practices > 0 && (
              <button
                className="text-button"
                onClick={() => update(recordKnowledge(state, e.id, 'again'))}
              >
                这个知识仍需巩固
              </button>
            )}
          </div>
          <p className="small-text muted">
            理解题不代表掌握；场景辨认与应用后安排 1/3/7/14
            天复习。IELTS/TOEFL/六级为原创选编方向，并非完整官方词表或考试分数预测。
          </p>
          {state.records[e.id]?.lastOutput && (
            <details>
              <summary>上次应用输出</summary>
              <p>{state.records[e.id].lastOutput}</p>
            </details>
          )}
        </section>
      </div>
      <section className="card private-reading">
        <h2>从我的资料发现知识</h2>
        <p>
          粘贴或导入个人 TXT/Markdown
          笔记（最多200KB），仅在当前页面内存处理；不自动保存、上传模型或进入GitHub。当前只匹配已审核知识，PDF/教材章节解析后续扩展。
        </p>
        <label>
          私人学习资料
          <textarea
            value={privateText}
            maxLength={200000}
            onChange={(e) => setPrivateText(e.target.value)}
          />
        </label>
        <label>
          导入个人文本
          <input
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 200000) {
                setUploadStatus('文件过大，请使用200KB以内文本。');
                return;
              }
              setPrivateText(await f.text());
              setUploadStatus('已在本页读取，原文不会自动保存。');
              e.target.value = '';
            }}
          />
        </label>
        <button
          className="text-button"
          onClick={() => {
            setPrivateText('');
            setUploadStatus('私人资料已清除。');
          }}
        >
          清除私人资料
        </button>
        {uploadStatus && <p role="status">{uploadStatus}</p>}
        <div className="row wrap">
          {relatedKnowledge(privateText).map((e) => (
            <button className="button ghost" key={e.id} onClick={() => choose(e.id)}>
              学习 {e.term}
            </button>
          ))}
        </div>
        {privateText && !relatedKnowledge(privateText).length && (
          <p>当前审核库没有匹配，请用即时词典探索其他词；不会伪造教材分析。</p>
        )}
      </section>
      <section className="card knowledge-sources">
        <h2>来源与版权</h2>
        <p>
          当前内置32个原创知识单元、1154个合法授权的英文词典词条。官方资源链接供学习参考；本站课程为原创选编，非
          Cambridge/IELTS/TOEFL 官方授权教材，不转载受保护的书籍、真题或官方释义。
        </p>
        {knowledgeSources.map((s) => (
          <div key={s.id}>
            <strong>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.name}
                </a>
              ) : (
                s.name
              )}
            </strong>
            <p className="small-text muted">{s.rights}</p>
          </div>
        ))}
        <a
          href={`${import.meta.env.BASE_URL}dictionary/WORDNET-LICENSE.txt`}
          target="_blank"
          rel="noreferrer"
        >
          WordNet 补充英文释义许可（保留版权与免责声明）
        </a>
      </section>
    </>
  );
}
