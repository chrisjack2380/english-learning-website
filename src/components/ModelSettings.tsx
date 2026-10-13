import { useEffect, useRef, useState } from 'react';
import { KeyRound, LockKeyhole, Trash2 } from 'lucide-react';
import {
  deleteModel,
  hasSecret,
  hasVault,
  lockModels,
  modelPreferences,
  providerInfo,
  saveModel,
  setDefaultModel,
  unlockModel,
  type ModelConfig,
  type Provider,
} from '../model-config';
import { testModel } from '../model-api';

export function ModelSettings() {
  const [preferences, setPreferences] = useState(modelPreferences);
  const [provider, setProvider] = useState<Provider>('openai');
  const [model, setModel] = useState(providerInfo.openai.model);
  const [endpoint, setEndpoint] = useState(providerInfo.openai.endpoint);
  const [key, setKey] = useState('');
  const [password, setPassword] = useState('');
  const [encrypted, setEncrypted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [tested, setTested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState('');
  const [unlockId, setUnlockId] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  function refresh() {
    setPreferences(modelPreferences());
  }
  function changed() {
    setTested(false);
    setStatus('');
  }
  function draft(): ModelConfig {
    return {
      id: editing || crypto.randomUUID(),
      provider,
      model: model.trim(),
      endpoint: endpoint.trim(),
      label: `${providerInfo[provider].label} · ${model.trim()}`,
    };
  }
  async function connect() {
    setBusy(true);
    setStatus('正在请求所选模型，通常需要几秒。');
    controller.current = new AbortController();
    try {
      await testModel(draft(), key, controller.current.signal);
      setTested(true);
      setStatus('连接测试通过，可以保存。');
    } catch (e) {
      setTested(false);
      setStatus(e instanceof Error ? e.message : '连接失败。');
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      await saveModel(draft(), key, encrypted ? password : undefined);
      setKey('');
      setPassword('');
      setEditing('');
      setTested(false);
      refresh();
      setStatus(
        encrypted
          ? '已保存到加密的本地保险箱。刷新后需要口令解锁。'
          : '已保存模型信息；Key 仅在本次页面会话内存中，刷新后需重新输入。',
      );
    } catch {
      setStatus('无法保存。请检查保险箱口令（至少 10 字符）与浏览器存储权限。');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card settings-card model-settings">
      <p className="eyebrow">OPTIONAL · YOUR MODEL, YOUR CHOICE</p>
      <h2>
        <KeyRound size={23} /> AI 模型配置
      </h2>
      <p>
        不配置也能使用全部课程、场景生成和本地表达训练。使用你自己的模型时，按该服务商的额度和规则计费。
      </p>
      <div className="note">
        <strong>你的 Key 属于个人隐私。</strong>
        <p>
          本站没有接收密钥的服务器。主动测试或使用 AI 时，浏览器将 Key
          直接发送到你选择的模型地址进行认证，并发送本次练习文本；不会发送给
          GitHub、开发者或其他模型。不要在输入中包含身份、账号或客户机密。
        </p>
        <p>
          默认仅保存在页面会话内存中；可选择加密本地保险箱。加密不能防止已解锁页面中的恶意扩展或脚本。更高安全要求建议使用自己的可信后端；接口可能因服务商浏览器限制无法连接。
        </p>
      </div>
      <ol className="config-steps">
        <li>选择服务与模型</li>
        <li>输入个人 Key</li>
        <li>测试并保存</li>
        <li>设置默认模型</li>
      </ol>
      <fieldset disabled={busy} className="config-fields">
        <label>
          模型类型
          <select
            aria-label="模型类型"
            value={provider}
            onChange={(e) => {
              const p = e.target.value as Provider;
              setProvider(p);
              setModel(providerInfo[p].model);
              setEndpoint(providerInfo[p].endpoint);
              setKey('');
              setEditing('');
              setConsent(false);
              changed();
            }}
          >
            {Object.entries(providerInfo).map(([id, info]) => (
              <option key={id} value={id}>
                {info.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          模型名称
          <input
            value={model}
            maxLength={100}
            onChange={(e) => {
              setModel(e.target.value);
              changed();
            }}
            placeholder="按服务商控制台填写模型 ID"
          />
        </label>
        <label className="full-field">
          模型请求地址
          <input
            value={endpoint}
            disabled={provider !== 'compatible'}
            maxLength={250}
            onChange={(e) => {
              setEndpoint(e.target.value);
              setConsent(false);
              changed();
            }}
            placeholder="https://你的服务域名/v1/chat/completions"
          />
        </label>
        <label className="full-field">
          个人 API Key
          <input
            type="password"
            autoComplete="off"
            value={key}
            maxLength={1000}
            onChange={(e) => {
              setKey(e.target.value);
              changed();
            }}
            placeholder="仅使用自己的 Key，不会写入学习备份"
          />
        </label>
        <label className="check-field full-field">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          我信任以上模型地址，并同意仅在主动使用 AI 时向它发送认证信息与练习文本。
        </label>
        <label className="check-field full-field">
          <input
            type="checkbox"
            checked={encrypted}
            onChange={(e) => setEncrypted(e.target.checked)}
          />
          用口令加密保存在本设备（可选）
        </label>
        {encrypted && (
          <label className="full-field">
            本地保险箱口令
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              maxLength={200}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 10 字符；忘记后只能删除并重新配置"
            />
          </label>
        )}
        <div className="row wrap full-field">
          <button
            type="button"
            className="button ghost"
            disabled={!consent || !key.trim() || !model.trim()}
            onClick={connect}
          >
            测试连接
          </button>
          <button
            type="button"
            className="button primary"
            disabled={!tested || !consent || (encrypted && password.length < 10)}
            onClick={save}
          >
            保存模型配置
          </button>
        </div>
      </fieldset>
      {busy && (
        <button className="text-button" onClick={() => controller.current?.abort()}>
          取消请求
        </button>
      )}
      {status && (
        <p className="note" role="status">
          {status}
        </p>
      )}
      <h3>本设备的模型</h3>
      {!preferences.models.length ? (
        <p className="muted">尚未配置，当前使用本地模式。</p>
      ) : (
        preferences.models.map((config) => (
          <article className="model-row" key={config.id}>
            <div>
              <strong>{config.label}</strong>
              <p className="small-text muted">
                {new URL(config.endpoint).hostname} ·{' '}
                {hasSecret(config.id)
                  ? '本次会话可用'
                  : hasVault(config.id)
                    ? '保险箱已锁定'
                    : '需要重新输入 Key'}
                {preferences.defaultId === config.id ? ' · 默认模型' : ''}
              </p>
            </div>
            <div className="row wrap">
              <button
                className="text-button"
                disabled={preferences.defaultId === config.id}
                onClick={() => {
                  try {
                    setDefaultModel(config.id);
                    refresh();
                    setStatus('已切换默认模型。');
                  } catch {
                    setStatus('无法保存默认模型。');
                  }
                }}
              >
                设为默认
              </button>
              {hasVault(config.id) && !hasSecret(config.id) && (
                <button
                  className="text-button"
                  onClick={() => {
                    setUnlockId(config.id);
                    setUnlockPassword('');
                  }}
                >
                  解锁保险箱
                </button>
              )}
              <button
                className="text-button"
                onClick={() => {
                  setProvider(config.provider);
                  setModel(config.model);
                  setEndpoint(config.endpoint);
                  setEditing(config.id);
                  setKey('');
                  setConsent(false);
                  changed();
                }}
              >
                重新配置
              </button>
              <button
                className="icon-button"
                aria-label={`删除 ${config.label}`}
                onClick={() => {
                  try {
                    deleteModel(config.id);
                    refresh();
                    setStatus('模型配置及本地密钥已删除。');
                  } catch {
                    setStatus('删除失败，请检查浏览器存储权限。');
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
            {unlockId === config.id && (
              <form
                className="vault-unlock"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await unlockModel(config, unlockPassword);
                    setUnlockId('');
                    setUnlockPassword('');
                    refresh();
                    setStatus('保险箱已解锁，本次页面会话可以使用。');
                  } catch {
                    setStatus('无法解锁，请检查口令或重新配置。');
                  }
                }}
              >
                <label>
                  解锁口令
                  <input
                    type="password"
                    autoComplete="off"
                    value={unlockPassword}
                    maxLength={200}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                  />
                </label>
                <button className="button ghost" disabled={unlockPassword.length < 10}>
                  解锁
                </button>
              </form>
            )}
          </article>
        ))
      )}
      <button
        className="text-button"
        onClick={() => {
          lockModels();
          refresh();
          setStatus('所有会话密钥已清除，加密配置保留。');
        }}
      >
        <LockKeyhole size={16} />
        锁定全部模型
      </button>
      <p className="small-text muted">
        模型配置与保险箱不会出现在学习备份中，不会跨设备同步。删除配置不等于在服务商撤销
        Key；若怀疑泄露，请去服务商控制台撤销。
      </p>
    </section>
  );
}
