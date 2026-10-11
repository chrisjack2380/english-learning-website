/** User-owned configuration. Secrets never enter learning state, backups, URLs or repository files. */
export type Provider = 'openai' | 'claude' | 'gemini' | 'compatible';
export type ModelConfig = {
  id: string;
  provider: Provider;
  model: string;
  endpoint: string;
  label: string;
};
export const MODEL_PREFS_KEY = 'little-by-little:model-preferences:v1';
export const MODEL_VAULT_KEY = 'little-by-little:model-vault:v1';
export const providerInfo: Record<Provider, { label: string; model: string; endpoint: string }> = {
  openai: {
    label: 'OpenAI',
    model: 'gpt-4.1-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  claude: {
    label: 'Claude',
    model: 'claude-sonnet-4-5',
    endpoint: 'https://api.anthropic.com/v1/messages',
  },
  gemini: {
    label: 'Gemini',
    model: 'gemini-2.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com',
  },
  compatible: { label: 'OpenAI 兼容服务', model: '', endpoint: '' },
};
type Preferences = { models: ModelConfig[]; defaultId: string };
type Sealed = { salt: string; iv: string; data: string };
const secrets = new Map<string, string>();
export function validateConfig(config: ModelConfig) {
  if (
    !Object.hasOwn(providerInfo, config.provider) ||
    !/^[a-zA-Z0-9._-]{1,100}$/.test(config.model) ||
    !/^[a-zA-Z0-9-]{1,80}$/.test(config.id) ||
    typeof config.label !== 'string' ||
    config.label.length > 100
  )
    throw new Error('模型名称或配置格式不正确。');
  const url = new URL(config.endpoint);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.port ||
    !url.hostname.includes('.') ||
    /^[\d.]+$/.test(url.hostname) ||
    /(^|\.)(localhost|local|internal|test|invalid)$/.test(url.hostname) ||
    url.hostname.includes(':')
  )
    throw new Error('模型地址必须是无凭据和查询参数的公共 HTTPS 地址。');
  if (
    config.provider !== 'compatible' &&
    config.endpoint !== providerInfo[config.provider].endpoint
  )
    throw new Error('官方模型仅连接其固定官方地址。');
  if (config.provider === 'compatible' && !url.pathname.endsWith('/chat/completions'))
    throw new Error('兼容服务请填写完整的 /chat/completions 地址。');
}
export function modelPreferences(): Preferences {
  try {
    const data = JSON.parse(localStorage.getItem(MODEL_PREFS_KEY) || 'null');
    if (
      !data ||
      !Array.isArray(data.models) ||
      data.models.length > 8 ||
      typeof data.defaultId !== 'string'
    )
      return { models: [], defaultId: '' };
    const models = data.models.map((v: ModelConfig) => {
      validateConfig(v);
      return {
        id: v.id,
        provider: v.provider,
        model: v.model,
        endpoint: v.endpoint,
        label: v.label,
      };
    });
    return {
      models,
      defaultId: models.some((m: ModelConfig) => m.id === data.defaultId)
        ? data.defaultId
        : models[0]?.id || '',
    };
  } catch {
    return { models: [], defaultId: '' };
  }
}
const b64 = (data: Uint8Array) => btoa(String.fromCharCode(...data));
const bytes = (str: string) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
async function derive(password: string, salt: Uint8Array) {
  if (password.length < 10 || password.length > 200)
    throw new Error('保险箱口令请使用 10–200 个字符。');
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 210000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}
const aad = (config: ModelConfig) =>
  new TextEncoder().encode(
    JSON.stringify([config.id, config.provider, config.model, config.endpoint]),
  );
function vault(): Record<string, Sealed> {
  try {
    const v = JSON.parse(localStorage.getItem(MODEL_VAULT_KEY) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
export async function saveModel(config: ModelConfig, secret: string, password?: string) {
  validateConfig(config);
  config = {
    id: config.id,
    provider: config.provider,
    model: config.model,
    endpoint: config.endpoint,
    label: config.label,
  };
  if (!secret.trim() || secret.length > 1000 || /[\r\n]/.test(secret))
    throw new Error('请填写有效的个人 API Key。');
  const current = modelPreferences();
  if (current.models.length >= 8 && !current.models.some((m) => m.id === config.id))
    throw new Error('最多保存 8 个模型，请先删除不用的配置。');
  const sealed = vault();
  if (password) {
    const salt = crypto.getRandomValues(new Uint8Array(16)),
      iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await derive(password, salt);
    const data = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: aad(config) },
      key,
      new TextEncoder().encode(secret.trim()),
    );
    sealed[config.id] = { salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(data)) };
  } else delete sealed[config.id];
  const models = [...current.models.filter((m) => m.id !== config.id), config];
  // Commit storage before making a connection available. A storage failure is shown to the user.
  localStorage.setItem(MODEL_VAULT_KEY, JSON.stringify(sealed));
  localStorage.setItem(
    MODEL_PREFS_KEY,
    JSON.stringify({ models, defaultId: current.defaultId || config.id }),
  );
  secrets.set(config.id, secret.trim());
}
export function hasSecret(id: string) {
  return secrets.has(id);
}
export function hasVault(id: string) {
  return Boolean(vault()[id]);
}
export async function unlockModel(config: ModelConfig, password: string) {
  validateConfig(config);
  const record = vault()[config.id];
  if (
    !record ||
    !['salt', 'iv', 'data'].every(
      (k) =>
        typeof record[k as keyof Sealed] === 'string' && record[k as keyof Sealed].length < 3000,
    )
  )
    throw new Error('没有可解锁的本地保险箱。');
  try {
    const key = await derive(password, bytes(record.salt));
    const data = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes(record.iv), additionalData: aad(config) },
      key,
      bytes(record.data),
    );
    secrets.set(config.id, new TextDecoder().decode(data));
  } catch {
    throw new Error('无法解锁，请检查口令或重新配置。');
  }
}
export function setDefaultModel(id: string) {
  const p = modelPreferences();
  if (!p.models.some((m) => m.id === id)) throw new Error('模型配置不存在。');
  localStorage.setItem(MODEL_PREFS_KEY, JSON.stringify({ ...p, defaultId: id }));
}
export function deleteModel(id: string) {
  secrets.delete(id);
  const v = vault();
  delete v[id];
  localStorage.setItem(MODEL_VAULT_KEY, JSON.stringify(v));
  const p = modelPreferences(),
    models = p.models.filter((m) => m.id !== id);
  localStorage.setItem(
    MODEL_PREFS_KEY,
    JSON.stringify({ models, defaultId: p.defaultId === id ? models[0]?.id || '' : p.defaultId }),
  );
}
export function lockModels() {
  secrets.clear();
}
export function activeModel() {
  const p = modelPreferences(),
    config = p.models.find((m) => m.id === p.defaultId);
  if (!config || !secrets.has(config.id)) throw new Error('请先在学习设置中配置或解锁默认模型。');
  return { config, secret: secrets.get(config.id)! };
}
