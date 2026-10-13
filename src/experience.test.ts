import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { contextRecall, stageRecallTerms } from './context-practice';
import { lifeJourneys } from './life-content';
import { officeLab } from './office-lab';
import { lookupKnowledge } from './knowledge';
import { freshStage, parseJourneys } from './journey-learning';
import { freshState, parseState } from './learning';
import { stageViews } from './stage-visuals';
describe('context learning and reusable three dimensional assets', () => {
  it('context recall preserves real sentences and selects only the evaluated terms', () => {
    for (const journey of [...lifeJourneys, officeLab])
      for (const stage of journey.stages) {
        expect(stageRecallTerms(stage)).toHaveLength(3);
        for (const term of stageRecallTerms(stage)) {
          const entry = lookupKnowledge(term)!;
          const q = contextRecall(
            entry,
            stage.words.map((w) => w[0]),
          );
          expect(q.options).toContain(term);
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.line).not.toContain('undefined');
          expect(q.prompt).not.toContain('是什么意思');
        }
      }
    expect(
      contextRecall(
        {
          term: 'train',
          example: 'The train is delayed.',
          collocations: ['catch a train'],
          usage: 'commuting',
        },
        ['station', 'platform'],
      ).line,
    ).toBe('The ________ is delayed.');
    expect(
      contextRecall(
        { term: 'train', example: 'We trained yesterday.', collocations: [], usage: '' },
        ['station'],
      ).line,
    ).toBe('We trained yesterday.');
  });
  it('new completions retain partial recall and self evidence without destroying legacy records', () => {
    const stage = lifeJourneys[0].stages[0];
    const p = {
      ...freshStage(),
      learningVersion: 2 as const,
      phase: 6,
      seen: stage.words.map((w) => w[0]),
      recognized: stageRecallTerms(stage),
      listening: true,
      cloze: true,
      imitated: true,
      output: true,
      completed: true,
      outputMode: 'self-checked' as const,
      outputText: 'I still need to find my bag.',
      apiKey: 'private-extra',
    };
    const parsed = parseState(
      JSON.stringify({
        ...freshState(),
        journeys: { commute: { stage: 0, stages: { [stage.id]: p }, at: 1 } },
      }),
    );
    expect(parsed.journeys!.commute.stages[stage.id].recognized).toHaveLength(3);
    expect(parsed.journeys!.commute.stages[stage.id].outputText).toContain('bag');
    expect(parsed.journeys!.commute.stages[stage.id]).not.toHaveProperty('apiKey');
    expect(() =>
      parseJourneys(
        { commute: { stage: 0, stages: { [stage.id]: { ...p, recognized: [] } }, at: 1 } },
        () => true,
      ),
    ).toThrow();
    expect(() =>
      parseJourneys(
        {
          commute: {
            stage: 0,
            stages: { [stage.id]: { ...p, learningVersion: undefined } },
            at: 1,
          },
        },
        () => true,
      ),
    ).toThrow();
  });
  it('commute includes separate street and platform views without changing old stage IDs', () => {
    expect(stageViews['leave-home'].map((v) => v.name).join(' ')).toContain('街道');
    expect(stageViews.station.map((v) => v.name).join(' ')).toContain('站台');
    for (const journey of lifeJourneys)
      for (const stage of journey.stages) expect(stageViews[stage.id]?.length).toBeGreaterThan(0);
  });
  it('the exported GLB has actual indexed geometry, semantic meshes, embedded animation and no remote textures', () => {
    const file = readFileSync('public/models/office.glb');
    expect(file.subarray(0, 4).toString()).toBe('glTF');
    expect(file.readUInt32LE(4)).toBe(2);
    expect(file.readUInt32LE(8)).toBe(file.length);
    expect(file.length).toBeLessThan(2_000_000);
    const n = file.readUInt32LE(12);
    const doc = JSON.parse(file.subarray(20, 20 + n).toString());
    expect(doc.meshes.length).toBeGreaterThan(40);
    expect(doc.animations[0].channels.length).toBeGreaterThan(0);
    for (const term of officeLab.stages[0].words.map((w) => w[0]))
      expect(doc.nodes.some((n: any) => n.extras?.term === term)).toBe(true);
    expect(doc.buffers.every((b: any) => !b.uri)).toBe(true);
    expect(doc.images || []).toEqual([]);
  });
});

it('legacy full-word evidence remains valid and a sentence task retains its communication context', () => {
  const stage = lifeJourneys[0].stages[0];
  const p = {
    ...freshStage(),
    phase: 6,
    seen: stage.words.map((w) => w[0]),
    recognized: [...stage.words.map((w) => w[0]), ...stage.expressions.map((e) => e[0])],
    listening: true,
    cloze: true,
    imitated: true,
    output: true,
    completed: true,
  };
  expect(
    parseJourneys({ commute: { stage: 0, stages: { [stage.id]: p }, at: 1 } }, () => true).commute
      .stages[stage.id].completed,
  ).toBe(true);
  const phrase = lookupKnowledge(stage.expressions[0][0])!;
  expect(contextRecall(phrase, ['Could we leave later?']).line).toBe(phrase.usage);
});
