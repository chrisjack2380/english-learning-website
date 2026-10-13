import { describe, it, expect } from 'vitest';
import { lifeJourneys } from './life-content';
import { knowledgeEntries, lookupKnowledge } from './knowledge';
import { freshKnowledge, recordKnowledge, parseKnowledge } from './knowledge-learning';
import { equivalentOutput, freshStage, journeyPlan, parseJourneys } from './journey-learning';
import { communicationJourney, basicJourney } from './journey-adapters';
import { communicationScenes } from './advanced-content';
import { scenes, lessons, sceneForLesson } from './content';
import { communicationFeedback } from './feedback';
import { existsSync } from 'node:fs';
import clips from './audio-manifest.json';
describe('input-first teaching engine', () => {
  it('seven complete processes have original lexical input and coherent controlled tasks', () => {
    expect(lifeJourneys).toHaveLength(7);
    expect(new Set(knowledgeEntries.map((e) => e.id)).size).toBe(knowledgeEntries.length);
    for (const j of lifeJourneys) {
      expect(j.stages).toHaveLength(5);
      expect(
        new Set(j.stages.flatMap((s) => s.words.map((w) => w[0]))).size,
      ).toBeGreaterThanOrEqual(30);
      for (const s of j.stages) {
        expect(s.words).toHaveLength(6);
        expect(s.expressions).toHaveLength(2);
        for (const w of s.words) {
          expect(w[2].length).toBeGreaterThan(12);
          expect(w[3]).not.toContain('undefined');
          expect(w[5].split(';').length).toBeGreaterThanOrEqual(2);
          expect(lookupKnowledge(w[0]), w[0]).toBeTruthy();
        }
        for (const e of s.expressions) expect(lookupKnowledge(e[0])).toBeTruthy();
        expect(s.listening.options).toContain(s.listening.answer);
        expect(s.output.options).toContain(s.output.answer);
        expect(s.cloze.before + s.cloze.answer + s.cloze.after).not.toContain('undefined');
      }
    }
  });
  it('all retained scenarios and course variants receive input before free output', () => {
    for (const s of communicationScenes) {
      const j = communicationJourney(s, `scene-${s.id}`);
      expect(j.stages[0].listening.answer).toBe(s.listening.answer);
      expect(j.stages[0].expressions[0][0]).toBe(s.expressions[0].natural);
      for (const term of [
        ...j.stages[0].words.map((w) => w[0]),
        ...j.stages[0].expressions.map((e) => e[0]),
      ])
        expect(lookupKnowledge(term), term).toBeTruthy();
    }
    for (const s of [
      ...scenes.filter((s) => ['greeting', 'cafe', 'directions'].includes(s.id)),
      ...lessons.filter((l) => !l.track).map((l) => sceneForLesson(l.id)),
    ]) {
      const j = basicJourney(s, `scene-${s.id}`);
      expect(j.stages[0].output.answer).toBe(s.turns[0].correct);
      for (const e of j.stages[0].expressions) expect(lookupKnowledge(e[0]), e[0]).toBeTruthy();
    }
  });
  it('discovery and favorites grant no mastery, and recognition preserves short reviews and same-day intervals', () => {
    let s = recordKnowledge(freshKnowledge(), 'ticket-machine', 'discover', '', 1000);
    s = recordKnowledge(s, 'ticket-machine', 'save', '', 2000);
    expect(s.records['ticket-machine'].understood).toBe(false);
    expect(s.records['ticket-machine'].practices).toBe(0);
    expect(s.records['ticket-machine'].interval).toBe(0);
    s = recordKnowledge(s, 'ticket-machine', 'recognize', '', 3000);
    expect(s.records['ticket-machine'].interval).toBe(1);
    s = recordKnowledge(s, 'ticket-machine', 'practice', 'I used the machine.', 4500);
    expect(s.records['ticket-machine'].interval).toBe(1);
    s = recordKnowledge(s, 'ticket-machine', 'recognize', '', 4000);
    expect(s.records['ticket-machine'].interval).toBe(1);
    s = recordKnowledge(s, 'ticket-machine', 'recognize', '', 86404000);
    expect(s.records['ticket-machine'].interval).toBe(3);
    s = recordKnowledge(s, 'ticket-machine', 'miss', '', 86405000);
    s = recordKnowledge(s, 'ticket-machine', 'recognize', '', 86406000);
    expect(s.records['ticket-machine'].due).toBe(86405000 + 600000);
    expect(s.records['ticket-machine'].interval).toBe(0);
    expect(parseKnowledge({ ...s, apiKey: 'test-only-secret' })).not.toHaveProperty('apiKey');
  });
  it('simple equivalent utterances are acknowledged without target vocabulary and unknown responses are not graded', () => {
    const cafe = basicJourney(scenes.find((s) => s.id === 'cafe')!, 'scene-cafe').stages[0];
    expect(equivalentOutput('Coffee!', cafe.output.answer, cafe.output.equivalents)).toBe(true);
    const s = lifeJourneys.find((j) => j.id === 'groceries')!.stages[4];
    expect(equivalentOutput('Yes, please.', s.output.answer, s.output.equivalents)).toBe(true);
    const q = lifeJourneys.find((j) => j.id === 'office-day')!.stages[0];
    expect(
      equivalentOutput('What should I do first today?', q.output.answer, q.output.equivalents),
    ).toBe(true);
    expect(communicationFeedback('I joined a meeting yesterday.').correctness).toContain(
      '可以理解',
    );
    expect(communicationFeedback('I joined a meeting yesterday.').why).toContain('不应一律');
  });
  it('completed-stage and prerequisite claims require real checks; exported progress keeps only known fields', () => {
    const p = { ...freshStage(), apiKey: 'test-only-secret' };
    expect(
      parseJourneys(
        { commute: { stage: 0, stages: { 'leave-home': p }, at: 1 } },
        (id) => id === 'commute',
      ).commute.stages['leave-home'],
    ).not.toHaveProperty('apiKey');
    expect(() =>
      parseJourneys(
        { commute: { stage: 0, stages: { 'leave-home': { ...p, completed: true } }, at: 1 } },
        () => true,
      ),
    ).toThrow();
    expect(() => parseJourneys({ commute: { stage: 1, stages: {}, at: 1 } }, () => true)).toThrow();
  });
  it('a time budget suggests manageable segments and completed processes lead to another', () => {
    expect(journeyPlan({}, 'work', 10).upcoming).toHaveLength(1);
    expect(journeyPlan({}, 'work', 20).upcoming).toHaveLength(2);
    expect(journeyPlan({}, 'work', 30).upcoming).toHaveLength(3);
    expect(journeyPlan({}, 'business', 20).journey.id).toBe('office-day');
    const done = Object.fromEntries(
      lifeJourneys[0].stages.map((s) => [s.id, { ...freshStage(), completed: true }]),
    );
    expect(journeyPlan({ commute: { stage: 4, stages: done, at: 1 } }, 'work', 20).journey.id).toBe(
      'groceries',
    );
  });
  it('all fixed vocabulary, expressions and life dialogue have downloadable audio', () => {
    const manifest = clips as Record<string, string>;
    for (const e of knowledgeEntries)
      for (const line of [e.term, e.example]) {
        expect(manifest[line], line).toBeTruthy();
        expect(existsSync(`public/audio/${manifest[line]}`), line).toBe(true);
      }
    for (const j of lifeJourneys)
      for (const s of j.stages)
        for (const line of [
          s.intro,
          s.listening.line,
          s.output.prompt,
          s.output.answer,
          s.output.reply,
        ]) {
          expect(manifest[line], line).toBeTruthy();
          expect(existsSync(`public/audio/${manifest[line]}`)).toBe(true);
        }
  });
});
