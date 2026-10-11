import { useEffect, useRef, useState } from 'react';
import { roleWithModel, type RoleFeedback } from '../ai-training';
import type { CommunicationScene } from '../scene-schema';
import { Speak } from './Speech';

export function AIRolePractice({
  scene,
  level,
  answer,
  task,
  onAdvice,
}: {
  scene: CommunicationScene;
  level: 'B2' | 'C1';
  answer: string;
  task: string;
  onAdvice: () => void;
}) {
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [result, setResult] = useState<RoleFeedback | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function ask(text: string, fresh = false) {
    setBusy(true);
    controller.current = new AbortController();
    const messages = [...(fresh ? [] : history), { role: 'user' as const, content: text }];
    try {
      const feedback = await roleWithModel(scene, level, task, messages, controller.current.signal);
      if (controller.current.signal.aborted) return;
      setResult(feedback);
      setHistory([
        ...messages,
        { role: 'assistant', content: feedback.reply + ' ' + feedback.followUp },
      ]);
      setFollowUp('');
      setStatus('');
      onAdvice();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'AI 暂不可用。');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card ai-role-practice">
      <p className="eyebrow">OPTIONAL · REAL MODEL FEEDBACK</p>
      <h3>让角色继续追问</h3>
      <p>
        把本轮回答交给你配置的模型，让{scene.roles[0].job}接话。AI
        建议需要核对，不替代本地任务检查或授予掌握。
      </p>
      <button
        className="button ghost"
        disabled={!answer.trim() || busy}
        onClick={() => {
          void ask(answer, true);
        }}
      >
        获取 AI 角色反馈
      </button>
      {busy && (
        <button className="text-button" onClick={() => controller.current?.abort()}>
          取消 AI 请求
        </button>
      )}
      {status && (
        <p className="note" role="status">
          {status}
        </p>
      )}
      {result && (
        <div className="ai-feedback" role="status">
          <span className="tag">真实模型 · AI 建议</span>
          <p lang="en">{result.reply}</p>
          <Speak text={result.reply} compact />
          <p lang="en">
            <strong>{result.followUp}</strong>
          </p>
          <h4>修正与自然表达</h4>
          <p lang="en">{result.corrected}</p>
          <p lang="en">{result.natural}</p>
          <p>{result.explanation}</p>
          <details>
            <summary>查看本次 AI 对话上下文</summary>
            {history.map((m, i) => (
              <p key={i}>
                <strong>{m.role === 'user' ? '你' : '角色'}：</strong>
                {m.content}
              </p>
            ))}
          </details>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(followUp);
            }}
          >
            <label className="field-label" htmlFor="ai-follow-up">
              回答 AI 的追问
            </label>
            <textarea
              id="ai-follow-up"
              maxLength={1500}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
            <button
              className="button ghost"
              disabled={busy || !followUp.trim() || history.length >= 12}
            >
              继续 AI 对话
            </button>
          </form>
          {history.length >= 12 && (
            <p className="small-text muted">已完成六轮延伸，可用本轮回答重新开始。</p>
          )}
        </div>
      )}
      <p className="small-text muted">
        仅在点击时发送到所选模型；AI 对话不自动保存。使用建议会标记本轮使用支架并安排复习。
      </p>
    </section>
  );
}
