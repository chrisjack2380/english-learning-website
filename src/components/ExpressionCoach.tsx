import { useEffect, useRef, useState } from 'react';
import { upgradeExpression } from '../communication';
import { communicationScenes } from '../advanced-content';
import { analyzeWithModel, type ExpressionAnalysis } from '../ai-training';
import { Speak, VoiceInput } from './Speech';
export function ExpressionCoach({ initial = '' }: { initial?: string }) {
  const [text, setText] = useState(initial);
  const [result, setResult] = useState<ReturnType<typeof upgradeExpression> | null>(null);
  const [context, setContext] = useState('工作交流');
  const [ai, setAI] = useState<ExpressionAnalysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const controller = useRef<AbortController | null>(null);
  const requestVersion = useRef(0);
  useEffect(() => () => controller.current?.abort(), []);
  function resetAdvice() {
    requestVersion.current++;
    controller.current?.abort();
    setAI(null);
    setStatus('');
    setBusy(false);
  }
  return (
    <section className="card expression-coach">
      <p className="eyebrow">MAKE MY ENGLISH NATURAL</p>
      <h2>表达升级工作台</h2>
      <p>先把意思说清楚，再根据场合调整。高级表达不一定更长，也不一定适合所有场景。</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          resetAdvice();
          setResult(
            upgradeExpression(
              text,
              communicationScenes.flatMap((s) => s.expressions),
            ),
          );
          setAI(null);
          setStatus('');
        }}
      >
        <label className="field-label" htmlFor="upgrade-input">
          想改进的英文表达
        </label>
        <textarea
          id="upgrade-input"
          value={text}
          maxLength={1500}
          onChange={(e) => {
            resetAdvice();
            setText(e.target.value);
            setResult(null);
          }}
          placeholder="例如：I very like this product."
        />
        <label className="field-label">
          使用场合
          <input
            value={context}
            maxLength={500}
            onChange={(e) => {
              setContext(e.target.value);
              resetAdvice();
            }}
            placeholder="例如：向采购经理介绍产品"
          />
        </label>
        <VoiceInput
          onText={(value) => {
            resetAdvice();
            setText(value.slice(0, 1500));
            setResult(null);
          }}
        />
        <div className="row wrap">
          <button className="button primary" disabled={!text.trim()}>
            分析表达
          </button>
          <button
            type="button"
            className="button ghost"
            disabled={!text.trim() || busy}
            onClick={async () => {
              setBusy(true);
              setStatus('');
              controller.current = new AbortController();
              const version = ++requestVersion.current;
              try {
                const analysis = await analyzeWithModel(text, context, controller.current.signal);
                if (version === requestVersion.current) setAI(analysis);
              } catch (e) {
                if (version === requestVersion.current)
                  setStatus(e instanceof Error ? e.message : 'AI 暂不可用。');
              } finally {
                if (version === requestVersion.current) setBusy(false);
              }
            }}
          >
            用我的 AI 深入分析
          </button>
          {busy && (
            <button
              type="button"
              className="text-button"
              onClick={() => controller.current?.abort()}
            >
              取消 AI 请求
            </button>
          )}
          {['I very like this product.', 'I don’t agree.', 'We need more time.'].map((s) => (
            <button
              type="button"
              className="text-button"
              key={s}
              onClick={() => {
                resetAdvice();
                setText(s.replace(/’/g, "'"));
                setResult(null);
              }}
            >
              试试：{s}
            </button>
          ))}
        </div>
      </form>
      {status && (
        <p className="note" role="status">
          {status}
        </p>
      )}
      {ai && (
        <div className="upgrade-result ai-feedback" role="status">
          <span className="tag">真实模型 · AI 建议，需核对</span>
          {[
            ['原句分析', ai.analysis],
            ['语法问题', ai.grammar],
            ['修正表达', ai.corrected],
            ['更自然表达', ai.natural],
            ['更丰富表达', ai.advanced],
            ['使用场景', ai.context],
            ['为什么这样说', ai.why],
          ].map(([label, value]) => (
            <div key={label}>
              <h3>{label}</h3>
              <p>{value}</p>
            </div>
          ))}
          <p className="small-text muted">
            AI 可能误改语义或事实；建议不作为能力认证。文本已发送到你选择的模型，不自动保存。
          </p>
        </div>
      )}
      {result && (
        <div className="upgrade-result" role="status">
          <span className="tag neutral">本地规则与审核示例</span>
          <h3>原句分析</h3>
          <p>原意：{text}。先检查已支持的错误，再比较表达的目的、事实和语气。</p>
          <h3>1 · 已检查的语法规则</h3>
          {result.issues.length ? (
            result.issues.map((issue, i) => (
              <p key={i}>
                <strong>
                  {issue.before} → {issue.after}
                </strong>
                <br />
                {issue.why}
              </p>
            ))
          ) : (
            <p>在当前支持的规则中未发现问题；这不代表全文语法正确。</p>
          )}
          <p lang="en" className="english">
            {result.corrected}
          </p>
          {result.suggestion ? (
            <>
              <h3>2 · 更自然的表达</h3>
              <p lang="en" className="english">
                {result.suggestion.natural}
              </p>
              <Speak text={result.suggestion.natural} compact />
              <h3>3 · 更具体、层次更丰富的表达</h3>
              <p lang="en" className="english">
                {result.suggestion.advanced}
              </p>
              <Speak text={result.suggestion.advanced} compact />
              <h3>4 · 使用场景与表达差异</h3>
              <p>{result.suggestion.context}</p>
              <h3>5 · 为什么这样说</h3>
              <p>{result.suggestion.why}</p>
            </>
          ) : (
            <p className="note">
              这句尚无经过审核的整句升级示例。请用场景中的表达分析核对意图、语气和事实；未来可接入服务端
              AI；也可以主动使用你已配置的模型分析自由文本。
            </p>
          )}
        </div>
      )}
      <p className="small-text muted">
        本地模式使用已知规则、场景表达库及观点/建议/职责/产品目的框架，保留输入意思并解释适用条件。不是
        AI 全文批改，不评价真实发音。
      </p>
    </section>
  );
}
