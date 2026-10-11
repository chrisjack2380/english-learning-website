import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Plus, Sparkles, Trash2 } from 'lucide-react';
import { communicationScenes } from '../advanced-content';
import {
  applyAIProse,
  CUSTOM_SCENES_KEY,
  generateScene,
  loadCustomScenes,
  restoreCustomScene,
  type SavedScene,
  type SceneRequest,
} from '../scene-generator';
import { rewriteSceneWithModel } from '../ai-training';
import type { CommunicationScene } from '../scene-schema';

export function SceneGenerator({
  onOpen,
  advanced = false,
}: {
  onOpen: (scene: CommunicationScene) => void;
  advanced?: boolean;
}) {
  const [input, setInput] = useState<SceneRequest>({
    request: '',
    template: 'auto',
    level: advanced ? 'C1' : 'B2',
    product: '',
    facts: '',
  });
  const [scene, setScene] = useState<CommunicationScene | null>(null);
  const [prose, setProse] = useState<unknown>();
  const [saved, setSaved] = useState(loadCustomScenes);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  function change(key: keyof SceneRequest, value: string) {
    setInput((s) => ({ ...s, [key]: value }));
    setScene(null);
    setProse(undefined);
    setStatus('');
    controller.current?.abort();
  }
  function store(items: SavedScene[]) {
    try {
      localStorage.setItem(CUSTOM_SCENES_KEY, JSON.stringify(items));
      setSaved(items);
      setStatus('已更新本设备的场景库；不会自动同步，也不包含模型配置。');
    } catch {
      setStatus('浏览器无法保存；当前场景仍可练习。');
    }
  }
  return (
    <section className="card scene-generator">
      <p className="eyebrow">BUILD A TASK AROUND YOUR LIFE</p>
      <h2>生成我的训练场景</h2>
      <p>
        描述想完成的交流，系统用审核模板组合角色、任务与练习。不需要
        AI，不会将行业名称变成未经验证的技术主张。
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            setScene(generateScene(input));
            setProse(undefined);
            setStatus('已用本地模板生成。可以直接开始练习，也可选用自己的 AI 改写。');
          } catch (e) {
            setStatus(e instanceof Error ? e.message : '生成失败。');
          }
        }}
      >
        <label className="field-label" htmlFor="scene-request">
          我想练习的沟通任务
        </label>
        <textarea
          id="scene-request"
          maxLength={500}
          value={input.request}
          onChange={(e) => change('request', e.target.value)}
          placeholder="例如：我想练习向美国客户介绍环保设备。"
        />
        <div className="config-fields">
          <label>
            场景模板
            <select
              aria-label="场景模板"
              value={input.template}
              onChange={(e) => change('template', e.target.value)}
            >
              <option value="auto">根据需求匹配</option>
              {communicationScenes.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            训练难度
            <select
              aria-label="训练难度"
              value={input.level}
              onChange={(e) => change('level', e.target.value)}
            >
              <option value="B2">B2 · 清楚交流与回应</option>
              <option value="C1">C1 · 论证、条件与语域</option>
            </select>
          </label>
          <label>
            产品或行业英文名称（可选）
            <input
              maxLength={80}
              value={input.product}
              onChange={(e) => change('product', e.target.value)}
              placeholder="environmental equipment"
            />
          </label>
          <label>
            已知事实或限制（可选）
            <input
              maxLength={700}
              value={input.facts}
              onChange={(e) => change('facts', e.target.value)}
              placeholder="尚无现场测试结果，不承诺性能"
            />
          </label>
        </div>
        <button className="button primary" disabled={!input.request.trim() || busy}>
          <Plus size={17} />
          生成本地场景
        </button>
      </form>
      {status && (
        <p className="note" role="status">
          {status}
        </p>
      )}
      {scene && (
        <article className="generated-preview">
          <div className="row spread wrap">
            <h3>{scene.title}</h3>
            <span className="tag">
              {scene.source === 'ai' ? 'AI 改写 · 待自行核对' : '本地审核模板'} · {input.level}
            </span>
          </div>
          <p>{scene.brief}</p>
          <p className="small-text muted">
            {scene.location} · {scene.roles.map((r) => r.job).join('、')}
          </p>
          <p>{scene.goal}</p>
          <p className="note">{scene.context}</p>
          <ol>
            {scene.turns.map((t) => (
              <li key={t.line}>{t.task}</li>
            ))}
          </ol>
          <div className="row wrap">
            <button className="button primary" onClick={() => onOpen(scene)}>
              开始生成的训练
              <ArrowRight size={16} />
            </button>
            <button
              className="button ghost"
              onClick={() =>
                store(
                  [
                    { savedAt: Date.now(), input: { ...input }, ...(prose ? { prose } : {}) },
                    ...saved,
                  ].slice(0, 12),
                )
              }
            >
              保存到我的场景库
            </button>
            <button
              className="button ghost"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                controller.current = new AbortController();
                try {
                  const value = await rewriteSceneWithModel(scene, controller.current.signal);
                  const base = generateScene(input);
                  setScene(applyAIProse(base, value));
                  setProse(value);
                  setStatus('AI 已改写情境与对话。任务规则仍来自审核模板；请核对新增事实和表达。');
                } catch (e) {
                  setStatus(e instanceof Error ? e.message : 'AI 请求失败；本地场景保留。');
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Sparkles size={16} />
              用我的 AI 改写场景
            </button>
            {busy && (
              <button className="text-button" onClick={() => controller.current?.abort()}>
                取消 AI 请求
              </button>
            )}
          </div>
        </article>
      )}
      {saved.length > 0 && (
        <div className="saved-scenes">
          <h3>我的场景库 · {saved.length} / 12</h3>
          {saved.map((item, i) => (
            <div className="model-row" key={`${item.savedAt}-${i}`}>
              <div>
                <strong>{restoreCustomScene(item).title}</strong>
                <p className="small-text muted">{item.input.request}</p>
              </div>
              <div className="row">
                <button className="text-button" onClick={() => onOpen(restoreCustomScene(item))}>
                  继续练习
                </button>
                <button
                  className="icon-button"
                  aria-label={`删除自定义场景 ${i + 1}`}
                  onClick={() => store(saved.filter((_, index) => index !== i))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="small-text muted">
        自定义训练记录按所属模板保存，不跳过系统必修课。场景库只在本浏览器保存；AI
        改写需要已配置并解锁模型，可能产生服务商费用。
      </p>
    </section>
  );
}
