import { officeLab } from './office-lab';
import { parseKnowledge, type KnowledgeState } from './knowledge-learning';
import { parseJourneys, type JourneyRecords } from './journey-learning';
import { lifeJourneys } from './life-content';
import { knowledgeEntries, type LearningGoal } from './knowledge';
import { lessons, scenes, type SceneId } from './content';
export const STORAGE_KEY = 'little-by-little:v1';
export type Profile = {
  level: 'beginner' | 'basics' | 'advanced';
  minutes: 10 | 20 | 30;
  createdAt: number;
  goal?: LearningGoal;
};
export type SkillRecord = {
  status: 'review' | 'learned';
  due: number;
  interval: number;
  correctReviews: number;
};
export type Attempt = { lessonId: string; correct: number; total: number; at: number };
export type LearningState = {
  version: 1;
  knowledge?: KnowledgeState;
  journeys?: JourneyRecords;
  profile: Profile | null;
  completed: string[];
  skills: Record<string, SkillRecord>;
  attempts: Attempt[];
  sceneResults: { scene: SceneId; mistakes: number; at: number }[];
  activity: Record<string, number>;
  outputs?: {
    scene: SceneId;
    courseId?: string;
    at: number;
    turns: { role: string; prompt: string; text: string; revised: boolean; guided?: boolean }[];
  }[];
};
export const freshState = (): LearningState => ({
  version: 1,
  profile: null,
  completed: [],
  skills: {},
  attempts: [],
  sceneResults: [],
  activity: {},
});
const DAY = 86400000;
export function dayKey(now = Date.now()) {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function parseState(raw: string): LearningState {
  const s = JSON.parse(raw) as LearningState;
  const finite = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  const known = (id: string) => lessons.some((l) => l.id === id);
  if (
    s.version !== 1 ||
    !Array.isArray(s.completed) ||
    !s.completed.every((id) => typeof id === 'string' && known(id)) ||
    new Set(s.completed).size !== s.completed.length ||
    !s.skills ||
    typeof s.skills !== 'object' ||
    Array.isArray(s.skills) ||
    !Array.isArray(s.attempts) ||
    !Array.isArray(s.sceneResults) ||
    !s.activity ||
    typeof s.activity !== 'object' ||
    Array.isArray(s.activity)
  )
    throw new Error('学习记录格式不受支持');
  if (
    s.profile !== null &&
    (!s.profile ||
      !['beginner', 'basics', 'advanced'].includes(s.profile.level) ||
      ![10, 20, 30].includes(s.profile.minutes) ||
      !finite(s.profile.createdAt))
  )
    throw new Error('学习设置格式错误');
  for (const [id, v] of Object.entries(s.skills))
    if (
      !known(id) ||
      !v ||
      !['review', 'learned'].includes(v.status) ||
      !finite(v.due) ||
      ![0, 1, 3, 7, 14].includes(v.interval) ||
      !finite(v.correctReviews)
    )
      throw new Error('知识记录格式错误');
  if (
    !s.attempts.every(
      (a) =>
        a &&
        known(a.lessonId) &&
        finite(a.correct) &&
        Number.isInteger(a.correct) &&
        a.total === 3 &&
        a.correct <= a.total &&
        finite(a.at),
    )
  )
    throw new Error('练习记录格式错误');
  if (
    !s.sceneResults.every(
      (a) =>
        a &&
        scenes.some((scene) => scene.id === a.scene) &&
        finite(a.mistakes) &&
        Number.isInteger(a.mistakes) &&
        finite(a.at),
    )
  )
    throw new Error('场景记录格式错误');
  if (!Object.entries(s.activity).every(([d, n]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && finite(n)))
    throw new Error('时间记录格式错误');
  if (
    s.outputs !== undefined &&
    (!Array.isArray(s.outputs) ||
      s.outputs.length > 100 ||
      !s.outputs.every(
        (o) =>
          o &&
          scenes.some((scene) => scene.id === o.scene) &&
          finite(o.at) &&
          (!o.courseId || known(o.courseId)) &&
          Array.isArray(o.turns) &&
          o.turns.length >= 2 &&
          o.turns.length <= 8 &&
          o.turns.every(
            (t) =>
              t &&
              typeof t.text === 'string' &&
              t.text.length <= 1500 &&
              typeof t.prompt === 'string' &&
              t.prompt.length <= 1500 &&
              typeof t.role === 'string' &&
              t.role.length <= 100 &&
              typeof t.revised === 'boolean',
          ),
      ))
  )
    throw new Error('自主表达记录格式错误');
  if (s.knowledge !== undefined) s.knowledge = parseKnowledge(s.knowledge);
  if (s.profile?.goal && !['ielts', 'toefl', 'business', 'work', 'daily'].includes(s.profile.goal))
    throw new Error('学习目标无效');
  // Preserve a sequential path. A backup cannot grant a later lesson without its prerequisites.
  if (s.completed.some((id) => prerequisites(id).some((l) => !s.completed.includes(l.id))))
    throw new Error('课程先修记录不完整');
  // Reconstruct the documented schema. Untrusted backup extras (including model keys/config) never survive import/export.
  return {
    version: 1,
    ...(s.knowledge ? { knowledge: s.knowledge } : {}),
    ...(s.journeys
      ? {
          journeys: parseJourneys(
            s.journeys,
            (id) =>
              id === officeLab.id ||
              lifeJourneys.some((j) => j.id === id) ||
              scenes.some((j) => `scene-${j.id}` === id) ||
              lessons.some((j) => `course-${j.id}` === id) ||
              knowledgeEntries.some((e) => `knowledge-${e.id}` === id),
          ),
        }
      : {}),
    profile: s.profile
      ? {
          level: s.profile.level,
          minutes: s.profile.minutes,
          createdAt: s.profile.createdAt,
          ...(s.profile.goal ? { goal: s.profile.goal } : {}),
        }
      : null,
    completed: [...s.completed],
    skills: Object.fromEntries(
      Object.entries(s.skills).map(([id, v]) => [
        id,
        { status: v.status, due: v.due, interval: v.interval, correctReviews: v.correctReviews },
      ]),
    ),
    attempts: s.attempts.map((a) => ({
      lessonId: a.lessonId,
      correct: a.correct,
      total: a.total,
      at: a.at,
    })),
    sceneResults: s.sceneResults.map((a) => ({ scene: a.scene, mistakes: a.mistakes, at: a.at })),
    activity: { ...s.activity },
    ...(s.outputs
      ? {
          outputs: s.outputs.map((o) => ({
            scene: o.scene,
            ...(o.courseId ? { courseId: o.courseId } : {}),
            at: o.at,
            turns: o.turns.map((t) => ({
              role: t.role,
              prompt: t.prompt,
              text: t.text,
              revised: t.revised,
              ...(t.guided === true ? { guided: true } : {}),
            })),
          })),
        }
      : {}),
  };
}
export function activeTrack(s: LearningState) {
  return s.profile?.level === 'advanced'
    ? 'advanced'
    : s.profile?.level === 'basics'
      ? 'intermediate'
      : 'beginner';
}
export function trackLessons(s: LearningState) {
  return lessons.filter((l) => (l.track || 'beginner') === activeTrack(s));
}
export function prerequisites(id: string) {
  const l = lessons.find((l) => l.id === id);
  if (!l) return [];
  const path = lessons.filter(
    (candidate) => (candidate.track || 'beginner') === (l.track || 'beginner'),
  );
  return path.slice(0, path.indexOf(l));
}
export function nextLesson(s: LearningState) {
  return trackLessons(s).find((l) => !s.completed.includes(l.id));
}
export function dueLessons(s: LearningState, now = Date.now()) {
  return trackLessons(s).filter((l) => s.skills[l.id]?.due <= now);
}
export function canOpen(s: LearningState, id: string) {
  return (
    lessons.some((l) => l.id === id) && prerequisites(id).every((l) => s.completed.includes(l.id))
  );
}
export function finishLesson(
  s: LearningState,
  id: string,
  firstCorrect: number,
  sceneMistakes: number,
  now = Date.now(),
): LearningState {
  if (!canOpen(s, id)) return s;
  const clean = firstCorrect === 3 && sceneMistakes === 0;
  return {
    ...s,
    completed: s.completed.includes(id) ? s.completed : [...s.completed, id],
    skills: {
      ...s.skills,
      [id]: {
        status: clean ? 'learned' : 'review',
        due: now + (clean ? DAY : 0),
        interval: clean ? 1 : 0,
        correctReviews: 0,
      },
    },
    attempts: [...s.attempts, { lessonId: id, correct: firstCorrect, total: 3, at: now }].slice(
      -500,
    ),
  };
}
export function reviewSkill(
  s: LearningState,
  id: string,
  correct: boolean,
  now = Date.now(),
): LearningState {
  const old = s.skills[id];
  if (!old) return s;
  const interval = correct
    ? old.interval < 1
      ? 1
      : old.interval < 3
        ? 3
        : old.interval < 7
          ? 7
          : 14
    : 0;
  const streak = correct ? old.correctReviews + 1 : 0;
  return {
    ...s,
    skills: {
      ...s.skills,
      [id]: {
        status: correct ? 'learned' : 'review',
        due: now + (correct ? interval * DAY : 10 * 60000),
        interval,
        correctReviews: streak,
      },
    },
  };
}
export function finishScene(
  s: LearningState,
  scene: SceneId,
  mistakes: number,
  now = Date.now(),
): LearningState {
  // Evidence is shared; scenario practice never completes a required course.
  const skills = { ...s.skills };
  if (mistakes > 0)
    for (const l of lessons.filter((l) => l.scene === scene && skills[l.id])) {
      skills[l.id] = {
        ...skills[l.id],
        status: 'review',
        due: now,
        interval: 0,
        correctReviews: 0,
      };
    }
  return {
    ...s,
    skills,
    sceneResults: [...s.sceneResults, { scene, mistakes, at: now }].slice(-200),
  };
}
export function addTime(s: LearningState, seconds: number, now = Date.now()): LearningState {
  if (!Number.isFinite(seconds) || seconds <= 0) return s;
  const key = dayKey(now);
  return {
    ...s,
    activity: { ...s.activity, [key]: (s.activity[key] || 0) + Math.min(seconds, 60) },
  };
}
export function dailyPlan(s: LearningState, now = Date.now()) {
  const due = dueLessons(s, now);
  const next = nextLesson(s);
  const allowance = (s.profile?.minutes || 20) - Math.min(due.length, 3) * 2;
  const path = trackLessons(s);
  const upcoming = next
    ? path
        .slice(path.indexOf(next))
        .filter(
          (_, i) =>
            i === 0 ||
            path
              .slice(path.indexOf(next), path.indexOf(next) + i + 1)
              .reduce((n, l) => n + l.minutes, 0) <= allowance,
        )
    : [];
  return { due, upcoming };
}
