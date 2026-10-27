import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  activeModel,
  deleteModel,
  hasSecret,
  lockModels,
  modelPreferences,
  MODEL_PREFS_KEY,
  MODEL_VAULT_KEY,
  providerInfo,
  saveModel,
  setDefaultModel,
  unlockModel,
  validateConfig,
  type ModelConfig,
} from './model-config';
import { requestModel } from './model-api';
import { analyzeWithModel, roleWithModel } from './ai-training';
import { communicationScenes } from './advanced-content';

const config = (provider: ModelConfig['provider'] = 'openai'): ModelConfig => ({
  id: `test-${provider}`,
  provider,
  label: 'Testing only',
  model: providerInfo[provider].model || 'local-model',
  endpoint: providerInfo[provider].endpoint || 'https://models.example.org/v1/chat/completions',
});
let storage: Map<string, string>;
const mockKey = 'test-only-private-key';
describe('private model settings and safe provider transport', () => {
  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) || null,
      setItem: (k: string, v: string) => storage.set(k, v),
    });
    lockModels();
  });
  afterEach(() => {
    lockModels();
    vi.unstubAllGlobals();
  });
  it('keeps session keys off disk and stores only whitelisted metadata', async () => {
    await saveModel({ ...config(), apiKey: 'unexpected' } as ModelConfig, mockKey);
    expect(hasSecret(config().id)).toBe(true);
    expect([...storage.values()].join('')).not.toContain(mockKey);
    expect(storage.get(MODEL_PREFS_KEY)).not.toContain('apiKey');
    lockModels();
    expect(() => activeModel()).toThrow('解锁');
  });
  it('encrypts keys with a local password, rejects wrong passwords and clears on deletion', async () => {
    await saveModel(config(), mockKey, 'a-long-local-passphrase');
    expect(storage.get(MODEL_VAULT_KEY)).not.toContain(mockKey);
    lockModels();
    await expect(unlockModel(config(), 'wrong-long-password')).rejects.toThrow('解锁');
    await unlockModel(config(), 'a-long-local-passphrase');
    expect(activeModel().secret).toBe(mockKey);
    await saveModel(config('gemini'), 'second-test-only-key');
    setDefaultModel('test-gemini');
    expect(activeModel().config.provider).toBe('gemini');
    deleteModel('test-openai');
    expect(storage.get(MODEL_VAULT_KEY)).not.toContain('test-openai');
    deleteModel('test-gemini');
    expect(modelPreferences().models).toEqual([]);
    expect(() => activeModel()).toThrow();
  });
  it('binds an encrypted key to provider and endpoint metadata', async () => {
    await saveModel(config(), mockKey, 'a-long-local-passphrase');
    lockModels();
    await expect(
      unlockModel({ ...config(), model: 'another-model' }, 'a-long-local-passphrase'),
    ).rejects.toThrow('解锁');
  });
  it('rejects credential/query URLs, insecure endpoints, official endpoint overrides and local addresses', () => {
    for (const endpoint of [
      'http://models.example.org/chat/completions',
      'https://name:secret@models.example.org/chat/completions',
      'https://models.example.org/chat/completions?key=secret',
      'https://localhost/chat/completions',
      'https://127.0.0.1/chat/completions',
      'https://[::1]/chat/completions',
    ])
      expect(() => validateConfig({ ...config('compatible'), endpoint })).toThrow();
    expect(() =>
      validateConfig({ ...config(), endpoint: 'https://other.example.org/chat/completions' }),
    ).toThrow();
  });
  it('sends owner keys only in the selected provider header, with no cookies, redirects or URL keys', async () => {
    for (const provider of ['openai', 'claude', 'gemini', 'compatible'] as const) {
      const response =
        provider === 'claude'
          ? { content: [{ type: 'text', text: 'OK' }] }
          : provider === 'gemini'
            ? { candidates: [{ content: { parts: [{ text: 'OK' }] } }] }
            : { choices: [{ message: { content: 'OK' } }] };
      const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(response)));
      vi.stubGlobal('fetch', fetch);
      expect(
        await requestModel(config(provider), mockKey, 'system', [
          { role: 'user', content: 'Hello' },
        ]),
      ).toBe('OK');
      const [url, options] = fetch.mock.calls[0];
      expect(url).not.toContain(mockKey);
      expect(options.body).not.toContain(mockKey);
      expect(options.credentials).toBe('omit');
      expect(options.redirect).toBe('error');
      expect(options.referrerPolicy).toBe('no-referrer');
      expect(Object.values(options.headers).join(' ')).toContain(mockKey);
    }
  });
  it('does not echo vendor secrets, errors or invalid responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(mockKey, { status: 401 })));
    await expect(requestModel(config(), mockKey, 'system', [])).rejects.toThrow('401');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ choices: [{ message: { content: mockKey } }] })),
        ),
    );
    expect(await requestModel(config(), mockKey, 'system', [])).not.toContain(mockKey);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('CORS')));
    await expect(requestModel(config(), mockKey, 'system', [])).rejects.toThrow('CORS');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x'.repeat(200001))));
    await expect(requestModel(config(), mockKey, 'system', [])).rejects.toThrow('过大');
  });
  it('validates actual AI feedback structure instead of substituting local feedback', async () => {
    await saveModel(config(), mockKey);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        async () =>
          new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      reply: 'Understood.',
                      followUp: 'What is the next step?',
                      corrected: 'A pilot could help.',
                      natural: 'Could we try a pilot?',
                      explanation: '这是建议。',
                    }),
                  },
                },
              ],
            }),
          ),
      ),
    );
    expect(
      (
        await roleWithModel(communicationScenes[0], 'B2', 'Suggest a pilot', [
          { role: 'user', content: 'A pilot could help.' },
        ])
      ).reply,
    ).toBe('Understood.');
    await expect(analyzeWithModel('A pilot could help.', 'meeting')).rejects.toThrow('字段');
  });
});
