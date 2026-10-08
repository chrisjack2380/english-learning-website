/** Future server boundary. Never accept provider keys in client configuration. */
export type TutorConfig = {
  modelLabel: string;
  role: 'barista' | 'neighbor' | 'guide';
  level: 'Pre-A1' | 'A1' | 'A2';
};
export type TutorReply = { reply: string; chineseHint?: string; suggestion?: string };
export interface TutorGateway {
  // Implement only against an authenticated same-origin backend with rate limits.
  reply(
    config: TutorConfig,
    messages: { role: 'user' | 'assistant'; content: string }[],
    signal?: AbortSignal,
  ): Promise<TutorReply>;
}
