import { describe, it, expect } from 'vitest';
import { knowledgeEntries, goalLabels, lookupKnowledge } from './knowledge';
import {
  freshKnowledge,
  recordKnowledge,
  knowledgePlan,
  knowledgeToScene,
  parseKnowledge,
} from './knowledge-learning';
import { freshState, parseState } from './learning';
import { communicationFeedback } from './feedback';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import audioManifest from './audio-manifest.json';
describe('knowledge understanding, application and learning route', () => {
  it('every original unit contains usable meanings, collocations, examples and boundaries', () => {
    expect(knowledgeEntries).toHaveLength(32);
    expect(new Set(knowledgeEntries.map((e) => e.id)).size).toBe(32);
    for (const e of knowledgeEntries) {
      expect(e.en.length).toBeGreaterThan(15);
      expect(e.collocations.length).toBeGreaterThanOrEqual(3);
      expect(e.question.options).toContain(e.question.answer);
      expect(e.example).not.toContain('undefined');
    }
    expect(lookupKnowledge('allocated')?.term).toBe('allocate');
    expect(lookupKnowledge('allocation')).toBeUndefined();
    expect(lookupKnowledge('assessment')).toBeUndefined();
  });
  it('all goals recommend units without erasing previous progress', () => {
    for (const goal of Object.keys(goalLabels) as (keyof typeof goalLabels)[]) {
      const s = { ...freshKnowledge(), goal };
      expect(knowledgePlan(s).next?.goals).toContain(goal);
    }
    const s = recordKnowledge(freshKnowledge(), 'allocate', 'understand', '', 1000);
    expect(knowledgePlan(s, false, 2000).next?.id).toBe('allocate');
  });
  it('understanding does not grant practice; application schedules review and records independent output', () => {
    const applied = recordKnowledge(
      freshKnowledge(),
      'allocate',
      'practice',
      'I would review the resources.',
      1000,
    );
    expect(applied.records.allocate.understood).toBe(true);
    expect(knowledgePlan(applied, false, 2000).next?.id).not.toBe('allocate');
    let s = recordKnowledge(freshKnowledge(), 'allocate', 'understand', '', 1000);
    expect(s.records.allocate.practices).toBe(0);
    s = recordKnowledge(s, 'allocate', 'practice', 'Our proposal needs additional support.', 2000);
    expect(s.records.allocate.interval).toBe(1);
    expect(s.records.allocate.lastOutput).toContain('proposal');
    s = recordKnowledge(s, 'allocate', 'practice', 'I would check the budget first.', 3000);
    expect(s.records.allocate.interval).toBe(3);
    expect(recordKnowledge(s, 'allocate', 'again', '', 4000).records.allocate.due).toBe(4000);
  });
  it('knowledge becomes a coherent four-turn task with its own meaning and criteria', () => {
    for (const e of knowledgeEntries) {
      const scene = knowledgeToScene(e.id, true);
      expect(scene.knowledgeIds).toEqual([e.id]);
      expect(scene.listening.line).toBe(e.example);
      expect(scene.turns).toHaveLength(4);
      expect(scene.turns[0].task).toContain(e.collocations[0]);
      expect(scene.turns[1].line).toContain(e.term);
      expect(scene.turns[0].rubric.criteria[0].label).toBe('表达具体建议或解读');
    }
    expect(knowledgeToScene('allocate').context).toContain('预算');
    expect(knowledgeToScene('allocate').context).toContain('Maya');
    expect(knowledgeToScene('allocate').roles[0].name).toBe('Maya');
    expect(knowledgeToScene('allocate').turns[0].role).toContain('Maya');
    expect(knowledgeToScene('get-into').context).not.toContain('预算');
    expect(knowledgeToScene('get-into').turns[2].sample).toContain('interests');
    expect(knowledgeToScene('written-confirmation').turns[2].sample).toContain('lease');
    expect(knowledgeToScene('evidence').roles[0].job).toBe('研究项目导师');
  });
  it('every fixed knowledge utterance has a real bundled audio fallback', () => {
    const clips = audioManifest as Record<string, string>;
    for (const e of knowledgeEntries) {
      const s = knowledgeToScene(e.id);
      for (const line of [
        e.term,
        e.example,
        ...s.turns.flatMap((t) => [t.line, t.sample, t.followUp]),
        ...s.expressions.flatMap((x) => [x.basic, x.natural, x.fluent]),
      ]) {
        expect(clips[line], line).toBeTruthy();
        expect(existsSync(`public/audio/${clips[line]}`), line).toBe(true);
      }
    }
  });
  it('backs up learning and vocabulary, rejects corrupt records and strips private configuration', () => {
    const state = {
      ...freshState(),
      knowledge: recordKnowledge(freshKnowledge(), 'allocate', 'save'),
      apiKey: 'test-only-secret',
    };
    const restored = parseState(JSON.stringify(state));
    expect(restored.knowledge?.records.allocate.saved).toBe(true);
    expect(JSON.stringify(restored)).not.toContain('test-only-secret');
    expect(() => parseKnowledge({ goal: 'work', records: { invalid: {} } })).toThrow();
  });
  it('does not grade open meanings from word count or topic tokens, and distinguishes completed from ongoing work', () => {
    const f = communicationFeedback('I developed products for five years.', 'interview');
    expect(f.correctness).toContain('已结束');
    expect(f.naturalness).toContain('have been developing');
    expect(f.upgrade).toContain('不能自动替换');
    expect(communicationFeedback('I see a different risk.', 'meeting').canReflect).toBe(true);
    expect(communicationFeedback('I very like this product.').issues.length).toBeGreaterThan(0);
    expect(f).not.toHaveProperty('passed');
  });
  it('licensed supplementary glosses retain the complete copyright and disclaimer', () => {
    const d = JSON.parse(readFileSync('public/dictionary/wordnet.json', 'utf8'));
    expect(Object.keys(d.entries)).toHaveLength(1154);
    expect(d.license).toContain('Copyright 2006');
    expect(d.license).toContain('AS IS');
    expect(d.entries.pilot.length).toBeGreaterThan(0);
  });
});
