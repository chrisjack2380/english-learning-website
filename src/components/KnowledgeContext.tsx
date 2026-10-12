import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { lookupKnowledge } from '../knowledge';
import { freshKnowledge, recordKnowledge, type KnowledgeState } from '../knowledge-learning';
import { Speak } from './Speech';
import { analyzeWithModel } from '../ai-training';
const Context = createContext<{
  state: KnowledgeState;
  update: (value: KnowledgeState) => void;
  open: (text: string, context: string, zh?: string) => void;
}>({ state: freshKnowledge(), update: () => {}, open: () => {} });
export const useKnowledge = () => useContext(Context);
type Definition = { pos: string; definition: string };
let cached: Promise<Record<string, Definition[]>> | undefined;
function dictionary() {
  return (cached ||= fetch(`${import.meta.env.BASE_URL}dictionary/wordnet.json`)
    .then((r) => {
      if (!r.ok) throw new Error('词典暂未加载');
      return r.json().then((data) => data.entries);
    })
    .catch((e) => {
      cached = undefined;
      throw e;
    }));
}
export function KnowledgeProvider({
  state,
  update,
  children,
}: {
  state: KnowledgeState;
  update: (s: KnowledgeState) => void;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<{ text: string; context: string; zh: string } | null>(
    null,
  );
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [status, setStatus] = useState('');
  const [ai, setAI] = useState('');
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [note, setNote] = useState('');
  const entry = selected ? lookupKnowledge(selected.text) : undefined;
  useEffect(() => {
    if (!selected) return;
    dialog.current?.showModal();
    setDefinitions([]);
    setAI('');
    setStatus('');
    setNote(state.words?.find((w) => w.term === selected.text)?.zh || '');
    let active = true;
    dictionary()
      .then((d) => {
        if (active) setDefinitions(d[selected.text.toLowerCase()] || []);
      })
      .catch(() => {
        if (active) setStatus('英文词典暂未加载，可继续阅读例句。');
      });
    return () => {
      active = false;
      controller.current?.abort();
    };
  }, [selected]);
  const close = () => {
    controller.current?.abort();
    setSelected(null);
  };
  return (
    <Context.Provider
      value={{
        state,
        update,
        open: (text, context, zh = '') =>
          setSelected({ text: text.slice(0, 1500), context: context.slice(0, 1500), zh }),
      }}
    >
      {children}
      {selected && (
        <dialog
          ref={dialog}
          className="dictionary-dialog"
          onCancel={close}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <article>
            <div className="row spread">
              <p className="eyebrow">LEARN IT IN CONTEXT</p>
              <button className="text-button" onClick={close}>
                关闭词典
              </button>
            </div>
            <h2>{selected.text}</h2>
            <Speak text={selected.text} compact />
            {entry ? (
              <>
                {entry.term.toLowerCase() !== selected.text.toLowerCase() && (
                  <p className="muted">原形：{entry.term}。以下释义、音标和搭配对应原形。</p>
                )}
                <p className="english">{entry.zh}</p>
                <p>{entry.en}</p>
                <p className="muted">{entry.ipa}</p>
                <h3>场景含义与用法</h3>
                <p>{entry.usage}</p>
                <p className="note">{entry.contrast}</p>
                <h3>常见搭配</h3>
                <p lang="en">{entry.collocations.join(' · ')}</p>
                <h3>例句</h3>
                <LearningText text={entry.example} zh={entry.translation} />
                <p>{entry.translation}</p>
                <button
                  className="button primary"
                  onClick={() =>
                    update(
                      recordKnowledge(
                        state,
                        entry.id,
                        state.records[entry.id]?.saved ? 'remove' : 'save',
                      ),
                    )
                  }
                >
                  {state.records[entry.id]?.saved ? '移出个人词库' : '加入个人词库'}
                </button>
              </>
            ) : (
              <>
                <p>这个词或短语尚无本站审核的中文单独释义。</p>
                {definitions.map((d, i) => (
                  <p key={i} lang="en">
                    <strong>{d.pos}</strong> · {d.definition}
                  </p>
                ))}
                {!definitions.length && (
                  <p className="muted">暂未收录英文独立释义；可结合整句含义或主动请求模型解释。</p>
                )}
              </>
            )}
            {!entry && (
              <>
                <label>
                  我的中文笔记
                  <input value={note} maxLength={1500} onChange={(e) => setNote(e.target.value)} />
                </label>
                <button
                  className="button primary"
                  onClick={() => {
                    const exists = state.words?.some((w) => w.term === selected.text);
                    update({
                      ...state,
                      words: exists
                        ? (state.words || []).filter((w) => w.term !== selected.text)
                        : [
                            { term: selected.text, context: selected.context, zh: note },
                            ...(state.words || []),
                          ].slice(0, 200),
                    });
                  }}
                >
                  {state.words?.some((w) => w.term === selected.text)
                    ? '移出个人词库'
                    : '加入个人词库'}
                </button>
              </>
            )}
            <h3>当前句子</h3>
            <p lang="en">{selected.context}</p>
            {selected.zh && <p>{selected.zh}</p>}
            <button
              className="button ghost"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const current = new AbortController();
                controller.current?.abort();
                controller.current = current;
                try {
                  const r = await analyzeWithModel(
                    selected.text,
                    `解释这个词/短语的中英文含义、搭配、场景用法。上下文：${selected.context}`,
                    current.signal,
                  );
                  if (!current.signal.aborted) setAI(`${r.analysis}\n${r.context}\n${r.why}`);
                } catch (e) {
                  setStatus(e instanceof Error ? e.message : 'AI 暂不可用');
                } finally {
                  setBusy(false);
                }
              }}
            >
              用我的 AI 解释上下文
            </button>
            {ai && (
              <p className="note" role="status">
                AI 建议，需核对：{ai}
              </p>
            )}
            {status && <p role="status">{status}</p>}
            <small>
              本站原创32个单元；英文补充释义来自 WordNet 3.0。
              <a
                href={`${import.meta.env.BASE_URL}dictionary/WORDNET-LICENSE.txt`}
                target="_blank"
                rel="noreferrer"
              >
                许可与版权
              </a>
              。未收录不代表该词不存在，不能把整句译文当作单词释义。
            </small>
          </article>
        </dialog>
      )}
    </Context.Provider>
  );
}
export function LearningText({ text, zh = '' }: { text: string; zh?: string }) {
  const { open } = useKnowledge();
  const parts = text.split(/([A-Za-z]+(?:['’-][A-Za-z]+)?)/g);
  return (
    <span
      className="learning-text"
      lang="en"
      onMouseUp={() => {
        const chosen = window.getSelection()?.toString().trim();
        if (chosen && chosen.length > 2 && chosen.length < 160) open(chosen, text, zh);
      }}
    >
      {parts.map((part, i) =>
        /^[A-Za-z]/.test(part) ? (
          <button
            className="word-token"
            type="button"
            key={i}
            aria-label={`查词 ${part}`}
            onClick={() => open(part, text, zh)}
          >
            {part}
          </button>
        ) : (
          part
        ),
      )}
      <button
        className="sentence-lookup"
        type="button"
        aria-label={`查看整句 ${text}`}
        onClick={() => open(text, text, zh)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 9L9 3M3 3h6v6" fill="none" stroke="currentColor" />
        </svg>
      </button>
    </span>
  );
}
