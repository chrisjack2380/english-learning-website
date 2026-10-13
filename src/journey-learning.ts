import { lifeJourneys } from './life-content';
import type { LearningGoal } from './knowledge';
export type StageProgress = {
  firstChecks?: { vocabulary: boolean; listening: boolean; output: boolean };
  phase: number;
  seen: string[];
  recognized: string[];
  mistakes: number;
  listening: boolean;
  cloze: boolean;
  imitated: boolean;
  output: boolean;
  completed: boolean;
  at: number;
};
export type JourneyProgress = { stage: number; stages: Record<string, StageProgress>; at: number };
export type JourneyRecords = Record<string, JourneyProgress>;
export const freshStage = (): StageProgress => ({
  firstChecks: { vocabulary: true, listening: true, output: true },
  phase: 0,
  seen: [],
  recognized: [],
  mistakes: 0,
  listening: false,
  cloze: false,
  imitated: false,
  output: false,
  completed: false,
  at: Date.now(),
});
export function parseJourneys(value: unknown, known: (id: string) => boolean): JourneyRecords {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length > 200
  )
    throw new Error('生活过程记录无效');
  const result: JourneyRecords = {};
  const finite = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  for (const [id, raw] of Object.entries(value)) {
    const r = raw as JourneyProgress;
    if (
      !known(id) ||
      !r ||
      !Number.isInteger(r.stage) ||
      r.stage < 0 ||
      r.stage > 10 ||
      !finite(r.at) ||
      !r.stages ||
      typeof r.stages !== 'object' ||
      Array.isArray(r.stages) ||
      Object.keys(r.stages).length > 10
    )
      throw new Error('过程位置无效');
    const life = lifeJourneys.find((j) => j.id === id);
    if (life && r.stage >= life.stages.length) throw new Error('阶段位置无效');
    const stages: JourneyProgress['stages'] = {};
    for (const [sid, p] of Object.entries(r.stages)) {
      if (
        !/^[a-z0-9-]{1,100}$/.test(sid) ||
        (life && !life.stages.some((s) => s.id === sid)) ||
        !p ||
        !Number.isInteger(p.phase) ||
        p.phase < 0 ||
        p.phase > 6 ||
        !Number.isInteger(p.mistakes) ||
        p.mistakes < 0 ||
        p.mistakes > 100000 ||
        !finite(p.at) ||
        !['seen', 'recognized'].every(
          (k) =>
            Array.isArray(p[k as 'seen']) &&
            p[k as 'seen'].length <= 100 &&
            p[k as 'seen'].every((w) => typeof w === 'string' && w.length <= 200),
        ) ||
        !['listening', 'cloze', 'imitated', 'output', 'completed'].every(
          (k) => typeof p[k as 'listening'] === 'boolean',
        )
      )
        throw new Error('过程练习记录无效');
      if (
        p.completed &&
        (!p.listening || !p.cloze || !p.output || !p.imitated || p.recognized.length === 0)
      )
        throw new Error('阶段缺少练习证据');
      const definition = life?.stages.find((s) => s.id === sid);
      if (definition) {
        const terms = [
          ...definition.words.map((w) => w[0]),
          ...definition.expressions.map((e) => e[0]),
        ];
        if (
          [...p.seen, ...p.recognized].some((w) => !terms.includes(w)) ||
          new Set(p.seen).size !== p.seen.length ||
          new Set(p.recognized).size !== p.recognized.length ||
          (p.completed &&
            (p.phase !== 6 ||
              !terms.every((w) => p.recognized.includes(w)) ||
              !definition.words.every((w) => p.seen.includes(w[0]))))
        )
          throw new Error('阶段词语证据无效');
      }
      stages[sid] = {
        ...(p.firstChecks
          ? {
              firstChecks: Object.fromEntries(
                ['vocabulary', 'listening', 'output'].map((key) => {
                  const value = p.firstChecks?.[key as 'vocabulary'];
                  if (typeof value !== 'boolean') throw new Error('首次练习证据无效');
                  return [key, value];
                }),
              ) as NonNullable<StageProgress['firstChecks']>,
            }
          : {}),
        phase: p.phase,
        seen: [...p.seen],
        recognized: [...p.recognized],
        mistakes: p.mistakes,
        listening: p.listening,
        cloze: p.cloze,
        imitated: p.imitated,
        output: p.output,
        completed: p.completed,
        at: p.at,
      };
    }
    result[id] = { stage: r.stage, stages, at: r.at };
    if (life && life.stages.slice(0, r.stage).some((s) => !stages[s.id]?.completed))
      throw new Error('阶段先修记录不完整');
  }
  return result;
}
export function journeyPlan(records: JourneyRecords, goal: LearningGoal, minutes: number) {
  const preferred = goal === 'business' ? 'office-day' : 'commute';
  const ordered = [...lifeJourneys].sort(
    (a, b) => Number(b.id === preferred) - Number(a.id === preferred),
  );
  const active = ordered.filter(
    (j) => !j.stages.every((s) => records[j.id]?.stages[s.id]?.completed),
  );
  const recent = active
    .filter((j) => records[j.id])
    .sort((a, b) => records[b.id].at - records[a.id].at)[0];
  const journey = recent || active[0] || ordered[0];
  const index = journey.stages.findIndex((s) => !records[journey.id]?.stages[s.id]?.completed);
  const stage = Math.max(0, index);
  return {
    journey,
    stage,
    upcoming: journey.stages.slice(stage, stage + Math.max(1, Math.floor(minutes / 10))),
    allDone: active.length === 0,
  };
}
export function equivalentOutput(input: string, answer: string, equivalents: string[]) {
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.!?]+$/, '')
      .replace(/\b(i’m|i'm)\b/g, 'i am')
      .replace(/\b(i’ll|i'll)\b/g, 'i will')
      .replace(/\s+/g, ' ');
  return [answer, ...equivalents].some((s) => normalize(s) === normalize(input));
}
export function guidedFirstScore(stages: StageProgress[]) {
  return ['vocabulary', 'listening', 'output'].reduce(
    (sum, key) =>
      sum + Number(stages.every((p) => p.firstChecks?.[key as 'vocabulary'] ?? p.mistakes === 0)),
    0,
  );
}
