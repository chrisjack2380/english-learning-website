/** Independent server boundary. No provider secrets or direct model calls in the browser. */
export type TutorConfig = {
  modelLabel: string;
  role: 'colleague' | 'friend' | 'customer' | 'service' | 'interviewer';
  level: 'B1' | 'B2' | 'C1';
  scene: 'meeting' | 'smalltalk' | 'pitch';
  task: string;
};
export type TutorReply = {
  reply: string;
  followUp?: string;
  chineseHint?: string;
  correction?: string;
  natural?: string;
  explanation?: string;
};
export interface TutorGateway {
  reply(
    config: TutorConfig,
    messages: { role: 'user' | 'assistant'; content: string }[],
    signal?: AbortSignal,
  ): Promise<TutorReply>;
}
/** Attach only to a trusted, authenticated same-origin server deployment. Pages has none. */
export function createTutorGateway(path = '/api/tutor'): TutorGateway {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
    throw new Error('AI 必须通过同源服务端接入');
  return {
    async reply(config, messages, signal) {
      const endpoint = new URL(path, window.location.origin);
      if (endpoint.origin !== window.location.origin) throw new Error('AI 服务必须同源');
      const result = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, messages }),
        signal,
      });
      if (!result.ok) throw new Error(`AI 服务暂不可用 (${result.status})`);
      const data: unknown = await result.json();
      if (
        !data ||
        typeof data !== 'object' ||
        !('reply' in data) ||
        typeof data.reply !== 'string' ||
        data.reply.length > 6000
      )
        throw new Error('AI 服务返回格式错误');
      for (const field of ['followUp', 'chineseHint', 'correction', 'natural', 'explanation'])
        if (
          field in data &&
          (typeof (data as Record<string, unknown>)[field] !== 'string' ||
            (data as Record<string, string>)[field].length > 6000)
        )
          throw new Error('AI 反馈格式错误');
      return data as TutorReply;
    },
  };
}
