import { activeModel, validateConfig, type ModelConfig } from './model-config';

type Message = { role: 'user' | 'assistant'; content: string };
async function boundedJSON(response: Response) {
  if (!response.ok) {
    const reason =
      response.status === 401 || response.status === 403
        ? '认证或访问被拒绝，请检查 Key 与模型权限'
        : response.status === 429
          ? '请求过多或额度不足'
          : response.status === 404
            ? '模型或接口未找到'
            : '模型服务暂不可用';
    throw new Error(`${reason}（${response.status}）。`); // Never reflect vendor bodies or headers.
  }
  if (!response.body) throw new Error('模型返回空响应。');
  const reader = response.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 200000) throw new Error('模型响应过大。');
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(all));
  } catch {
    throw new Error('模型返回了无法读取的数据。');
  }
}
/** No proxy: a key is sent only to the endpoint selected and authorized by its owner. */
export async function requestModel(
  config: ModelConfig,
  secret: string,
  system: string,
  messages: Message[],
  signal?: AbortSignal,
): Promise<string> {
  validateConfig(config);
  if (!secret.trim() || secret.length > 1000 || /[\r\n]/.test(secret))
    throw new Error('API Key 格式不正确。');
  if (
    system.length + messages.reduce((n, m) => n + m.content.length, 0) > 40000 ||
    messages.length > 24
  )
    throw new Error('本次内容过长，请缩短输入或开始新对话。');
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 30000);
  const cancel = () => timeout.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) timeout.abort();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let endpoint = config.endpoint,
    body: unknown;
  if (config.provider === 'claude') {
    headers['x-api-key'] = secret;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
    body = { model: config.model, system, messages, max_tokens: 2500 };
  } else if (config.provider === 'gemini') {
    headers['x-goog-api-key'] = secret;
    endpoint += `/v1beta/models/${encodeURIComponent(config.model)}:generateContent`;
    body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 3000 },
    };
  } else {
    headers.Authorization = `Bearer ${secret}`;
    body = {
      model: config.model,
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: 2500,
    };
  }
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      signal: timeout.signal,
    });
    const data = await boundedJSON(response);
    const output =
      config.provider === 'claude'
        ? data.content
            ?.filter((p: { type: string }) => p.type === 'text')
            .map((p: { text: string }) => p.text)
            .join('\n')
        : config.provider === 'gemini'
          ? data.candidates?.[0]?.content?.parts
              ?.map((p: { text: string }) => p.text || '')
              .join('\n')
          : data.choices?.[0]?.message?.content;
    if (typeof output !== 'string' || !output.trim() || output.length > 24000)
      throw new Error('模型没有返回有效的文本。');
    return output.split(secret).join('[已移除敏感内容]');
  } catch (e) {
    if (timeout.signal.aborted)
      throw new Error('请求已取消或超过 30 秒，请重试；本地学习仍可使用。');
    if (e instanceof TypeError)
      throw new Error(
        '无法连接模型。可能是网络或服务商 CORS 限制；可使用支持浏览器访问的服务，本地功能不受影响。',
      );
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
export async function testModel(config: ModelConfig, secret: string, signal?: AbortSignal) {
  await requestModel(
    config,
    secret,
    'Reply briefly with OK.',
    [{ role: 'user', content: 'Connection test. Reply OK.' }],
    signal,
  );
}
export async function modelJSON(system: string, input: unknown, signal?: AbortSignal) {
  const { config, secret } = activeModel();
  const raw = await requestModel(
    config,
    secret,
    system,
    [{ role: 'user', content: JSON.stringify(input) }],
    signal,
  );
  try {
    return JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
  } catch {
    throw new Error('模型未返回要求的 JSON 格式，请重试或使用本地功能。');
  }
}
