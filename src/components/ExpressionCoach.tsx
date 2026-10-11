import { useState } from 'react';
import { upgradeExpression } from '../communication';
import { Speak, VoiceInput } from './Speech';
export function ExpressionCoach({ initial = '' }: { initial?: string }) {
  const [text, setText] = useState(initial);
  const [result, setResult] = useState<ReturnType<typeof upgradeExpression> | null>(null);
  return (
    <section className="card expression-coach">
      <p className="eyebrow">SAY IT WITH INTENT</p>
      <h2>表达升级工作台</h2>
      <p>先把意思说清楚，再根据场合调整。高级表达不一定更长，也不一定适合所有场景。</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResult(upgradeExpression(text));
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
            setText(e.target.value);
            setResult(null);
          }}
          placeholder="例如：I very like this product."
        />
        <VoiceInput
          onText={(value) => {
            setText(value.slice(0, 1500));
            setResult(null);
          }}
        />
        <div className="row wrap">
          <button className="button primary" disabled={!text.trim()}>
            分析表达
          </button>
          {['I very like this product.', 'I don’t agree.', 'We need more time.'].map((s) => (
            <button
              type="button"
              className="text-button"
              key={s}
              onClick={() => {
                setText(s.replace(/’/g, "'"));
                setResult(null);
              }}
            >
              试试：{s}
            </button>
          ))}
        </div>
      </form>
      {result && (
        <div className="upgrade-result" role="status">
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
              AI 分析自由文本。
            </p>
          )}
        </div>
      )}
      <p className="small-text muted">
        当前为本地规则与人工编写的示例库，支持 really like、discuss、比较级、agree 等常见问题。不是
        AI 全文批改，不评价真实发音。
      </p>
    </section>
  );
}
