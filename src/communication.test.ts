import { describe, it, expect, vi, afterEach } from 'vitest';
import { communicationScenes, higherLessons } from './advanced-content';
import { grammarIssues, taskEvidence, upgradeExpression } from './communication';
import {
  canOpen,
  dueLessons,
  finishLesson,
  finishScene,
  freshState,
  nextLesson,
  parseState,
  trackLessons,
} from './learning';
import { createTutorGateway } from './ai';
describe('communication path and legacy records', () => {
  it('existing foundations enter B1–B2 without erasing beginner progress', () => {
    const legacy = finishLesson(freshState(), 'hello', 2, 0, 1000);
    legacy.profile = { level: 'basics', minutes: 20, createdAt: 1000 };
    const restored = parseState(JSON.stringify(legacy));
    expect(restored.completed).toEqual(['hello']);
    expect(nextLesson(restored)?.id).toBe('meeting');
    expect(dueLessons(restored, 2000)).toEqual([]);
    expect(restored.skills.hello.status).toBe('review');
    expect(canOpen(restored, 'meeting')).toBe(true);
    expect(canOpen(restored, 'smalltalk')).toBe(false);
    expect(finishLesson(restored, 'smalltalk', 3, 0, 2000)).toBe(restored);
    const done = finishLesson(restored, 'meeting', 2, 1, 2000);
    expect(nextLesson(done)?.id).toBe('smalltalk');
    expect(done.skills.meeting.status).toBe('review');
    expect(parseState(JSON.stringify(done)).completed).toEqual(['hello', 'meeting']);
  });
  it('C1 and beginner remain independent tracks with their own prerequisites', () => {
    const s = freshState();
    s.profile = { level: 'advanced', minutes: 20, createdAt: 1000 };
    expect(nextLesson(s)?.id).toBe('meeting-c1');
    expect(trackLessons(s)).toHaveLength(3);
    expect(canOpen(s, 'smalltalk-c1')).toBe(false);
    const explored = finishScene(s, 'meeting', 0, 1000);
    expect(explored.completed).toEqual([]);
    expect(nextLesson(explored)?.id).toBe('meeting-c1');
    expect(() => parseState(JSON.stringify({ ...s, completed: ['pitch-c1'] }))).toThrow();
  });
  it('saves four-turn output backups, rejects malformed output without weakening import validation', () => {
    const s = freshState();
    s.outputs = [
      {
        scene: 'meeting',
        at: 1000,
        turns: communicationScenes[0].turns.map((t) => ({
          role: t.role,
          prompt: t.line,
          text: t.sample,
          revised: false,
        })),
      },
    ];
    expect(parseState(JSON.stringify(s))).toEqual(s);
    const bad = structuredClone(s);
    bad.outputs![0].turns[0].text = 'x'.repeat(1501);
    expect(() => parseState(JSON.stringify(bad))).toThrow();
    bad.outputs![0].turns = [];
    expect(() => parseState(JSON.stringify(bad))).toThrow();
  });
});
describe('real tasks and expression distinctions', () => {
  it('each model answer covers the actual task, including all C1 extension requirements', () => {
    for (const s of communicationScenes)
      for (const t of s.turns) {
        expect(taskEvidence(t.sample, t.rubric).passed, `${s.id}: ${t.sample}`).toBe(true);
        expect(
          taskEvidence(t.sample, { ...t.rubric, criteria: [...t.rubric.criteria, t.advanced] })
            .passed,
          `${s.id}: C1 ${t.sample}`,
        ).toBe(true);
        expect(taskEvidence('Hello!', t.rubric).passed).toBe(false);
        expect(
          taskEvidence(
            'This is an unrelated sentence that tells you absolutely nothing about the situation.',
            t.rubric,
          ).passed,
        ).toBe(false);
      }
    for (const l of higherLessons) expect(l.questions).toHaveLength(3);
  });
  it('checks missing task parts, permits independently worded output, identifies supported grammar errors', () => {
    const task = communicationScenes[0].turns[0].rubric;
    expect(
      taskEvidence(
        'My concern is the checkout flow; it needs another round of careful testing.',
        task,
      ).passed,
    ).toBe(true);
    const incomplete = taskEvidence(
      'I am concerned about how the whole project will progress during the week.',
      task,
    );
    expect(incomplete.passed).toBe(false);
    expect(incomplete.checks.filter((c) => !c.met)).toHaveLength(1);
    expect(
      taskEvidence(
        'I am agree but concerned about the checkout flow because we need testing.',
        task,
      ).passed,
    ).toBe(false);
  });
  it('upgrades the requested sentence and explains changes in meaning rather than inventing equivalence', () => {
    const r = upgradeExpression('I very like this product.');
    expect(r.corrected).toBe('I really like this product.');
    expect(r.issues).toHaveLength(1);
    expect(r.suggestion?.natural).toBe("I'm really impressed with this product.");
    expect(r.suggestion?.why).toContain('原句没有');
    expect(upgradeExpression('We need more time.').suggestion?.context).toContain('工作会议');
    expect(upgradeExpression('This is a custom sentence.').suggestion).toBeUndefined();
    expect(grammarIssues('I agree, but we should discuss the risks.')).toEqual([]);
    expect(upgradeExpression('Please explain me this.').corrected).toBe(
      'Please explain this to me.',
    );
    expect(upgradeExpression('We should discuss about a more better plan.').corrected).toBe(
      'We should discuss a better plan.',
    );
  });
});
describe('future secure AI transport', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('rejects external/provider endpoints and validates authenticated server responses', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.test' } });
    expect(() => createTutorGateway('https://provider.test')).toThrow();
    expect(() => createTutorGateway('//provider.test')).toThrow();
    const request = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'What would you suggest?', natural: 'Could we try a pilot?' }),
    });
    vi.stubGlobal('fetch', request);
    const config = {
      modelLabel: 'server-managed',
      role: 'colleague' as const,
      level: 'B2' as const,
      scene: 'meeting' as const,
      task: 'Negotiate a pilot',
    };
    await expect(
      createTutorGateway().reply(config, [{ role: 'user', content: 'Could we try a pilot?' }]),
    ).resolves.toMatchObject({ reply: 'What would you suggest?' });
    expect(request.mock.calls[0][1].credentials).toBe('same-origin');
    expect(request.mock.calls[0][1].body).not.toContain('apiKey');
    request.mockResolvedValue({ ok: true, json: async () => ({ reply: 42 }) });
    await expect(createTutorGateway().reply(config, [])).rejects.toThrow('格式');
  });
});
