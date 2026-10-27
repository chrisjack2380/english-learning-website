import { describe, expect, it, vi, afterEach } from 'vitest';
import { communicationScenes, createCommunicationLesson } from './advanced-content';
import {
  applyAIProse,
  generateScene,
  loadCustomScenes,
  CUSTOM_SCENES_KEY,
} from './scene-generator';
import { taskEvidence, upgradeExpression } from './communication';
import { freshState, parseState } from './learning';

describe('scene database and template generation', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('contains distinct communication missions with complete metadata, four stages, B2 and C1 tasks', () => {
    expect(communicationScenes).toHaveLength(11);
    expect(new Set(communicationScenes.map((s) => s.id)).size).toBe(11);
    for (const scene of communicationScenes) {
      expect(scene.levels).toContain('B2');
      expect(scene.levels).toContain('C1');
      expect(scene.roles.length).toBeGreaterThan(0);
      expect(scene.vocabulary.length).toBeGreaterThanOrEqual(3);
      expect(scene.grammar.length).toBeGreaterThanOrEqual(3);
      expect(scene.culture.length).toBeGreaterThan(0);
      expect(scene.evaluation).toHaveLength(4);
      expect(scene.environment.stages).toHaveLength(scene.turns.length);
      expect(scene.c1Question.options).toContain(scene.c1Question.answer);
      expect(scene.c1Question).not.toEqual(scene.analysisQuestion);
    }
  });
  it('new database records produce lessons without editing ID unions, routes or player branches', () => {
    const added = { ...communicationScenes[3], id: 'new-reviewed-scene', title: '新增任务' };
    expect(createCommunicationLesson(added).id).toBe('new-reviewed-scene');
    expect(createCommunicationLesson(added, true).level).toBe('C1');
    expect(createCommunicationLesson(added).scene).toBe('new-reviewed-scene');
  });
  it('generates a relevant procurement dialogue offline without inventing equipment capabilities', () => {
    const scene = generateScene({
      request: '我想练习向美国客户介绍环保设备。',
      template: 'auto',
      level: 'C1',
      product: '',
      facts: '',
    });
    expect(scene.id).toBe('pitch');
    expect(scene.customization?.product).toBe('environmental equipment');
    expect(scene.roles[0].job).toContain('采购');
    expect(scene.context).toContain('不得添加分子级');
    expect(scene.turns[1].line).toContain('different');
    for (const t of scene.turns)
      expect(
        taskEvidence(t.sample, { ...t.rubric, criteria: [...t.rubric.criteria, t.advanced] })
          .passed,
        t.sample,
      ).toBe(true);
    expect(scene.turns.flatMap((t) => [t.line, t.sample]).join(' ')).not.toMatch(
      /guarantee.*(100|90)|molecular|certified/i,
    );
    expect(() =>
      generateScene({
        request: '我想练习完全未知的主题',
        template: 'auto',
        level: 'B2',
        product: '',
        facts: '',
      }),
    ).toThrow('模板');
  });
  it('uses trusted templates for all supported intents and explicit parameters', () => {
    for (const scene of communicationScenes) {
      const generated = generateScene({
        request: '针对新的沟通需求练习',
        template: scene.id,
        level: 'B2',
        product: 'equipment',
        facts: 'No field tests yet.',
      });
      expect(generated.turns).toHaveLength(4);
      expect(generated.customization?.facts).toBe('No field tests yet.');
      expect(generated.environment.kind).toBe(scene.environment.kind);
    }
  });
  it('rejects AI regexes, missing turns and model samples that do not complete the template task', () => {
    const base = communicationScenes[3];
    const prose = {
      title: '面试挑战',
      brief: base.brief,
      context: base.context,
      expressions: base.expressions,
      turns: base.turns.map(({ line, zh, sample, followUp }) => ({ line, zh, sample, followUp })),
    };
    expect(applyAIProse(base, prose).source).toBe('ai');
    expect(() => applyAIProse(base, { ...prose, rubric: { pattern: '(a+)+$' } })).toThrow();
    expect(() => applyAIProse(base, { ...prose, turns: [] })).toThrow();
    expect(() =>
      applyAIProse(base, { ...prose, turns: prose.turns.map((t) => ({ ...t, sample: 'Hello!' })) }),
    ).toThrow();
    vi.stubGlobal('localStorage', {
      getItem: () =>
        JSON.stringify([
          {
            savedAt: Date.now(),
            input: { request: '面试', template: 'interview', level: 'B2', product: '', facts: '' },
            prose: { ...prose, turns: [] },
          },
        ]),
    });
    expect(loadCustomScenes()).toEqual([]);
    expect(CUSTOM_SCENES_KEY).not.toContain('model');
  });
  it('offers compositional expression upgrades while preserving claims and explaining scope', () => {
    expect(upgradeExpression('We should reduce the initial scope.').suggestion?.natural).toBe(
      'One option would be to reduce the initial scope.',
    );
    expect(upgradeExpression('I think that the pilot is worthwhile.').suggestion?.advanced).toBe(
      'I would argue that the pilot is worthwhile.',
    );
    const product = upgradeExpression('Our product can remove odors.');
    expect(product.suggestion?.natural).toBe('Our product is designed to remove odors.');
    expect(product.suggestion?.why).toContain('尚未核验');
    expect(product.suggestion?.advanced).not.toContain('molecular');
    expect(upgradeExpression('We need informations despite of the delay.').corrected).toBe(
      'We need information despite the delay.',
    );
  });
  it('strips foreign private config from imported backups at every reconstructed level', () => {
    const state = {
      ...freshState(),
      apiKey: 'mock-private-value',
      model: { endpoint: 'private' },
      profile: { level: 'basics', minutes: 20, createdAt: 1000, apiKey: 'mock-private-value' },
    };
    const restored = parseState(JSON.stringify(state));
    expect(JSON.stringify(restored)).not.toContain('mock-private-value');
    expect(Object.keys(restored)).not.toContain('model');
  });
});
