import { lessons, type SceneId } from './content';
export const STORAGE_KEY = 'little-by-little:v1';
export type Profile = { level: 'beginner' | 'basics'; minutes: 10 | 20 | 30; createdAt: number };
export type SkillRecord = {
  status: 'review' | 'learned';
  due: number;
  interval: number;
  correctReviews: number;
};
export type Attempt = { lessonId: string; correct: number; total: number; at: number };
export type LearningState = {
  version: 1;
  profile: Profile | null;
  completed: string[];
  skills: Record<string, SkillRecord>;
  attempts: Attempt[];
  sceneResults: { scene: SceneId; mistakes: number; at: number }[];
  activity: Record<string, number>;
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
      !['beginner', 'basics'].includes(s.profile.level) ||
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
        ['greeting', 'cafe', 'directions'].includes(a.scene) &&
        finite(a.mistakes) &&
        Number.isInteger(a.mistakes) &&
        finite(a.at),
    )
  )
    throw new Error('场景记录格式错误');
  if (!Object.entries(s.activity).every(([d, n]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && finite(n)))
    throw new Error('时间记录格式错误');
  // Preserve a sequential path. A backup cannot grant a later lesson without its prerequisites.
  if (
    s.completed.some((id) =>
      lessons
        .slice(
          0,
          lessons.findIndex((l) => l.id === id),
        )
        .some((l) => !s.completed.includes(l.id)),
    )
  )
    throw new Error('课程先修记录不完整');
  return s;
}
export function nextLesson(s: LearningState) {
  return lessons.find((l) => !s.completed.includes(l.id));
}
export function dueLessons(s: LearningState, now = Date.now()) {
  return lessons.filter((l) => s.skills[l.id]?.due <= now);
}
export function canOpen(s: LearningState, id: string) {
  const i = lessons.findIndex((l) => l.id === id);
  return i >= 0 && lessons.slice(0, i).every((l) => s.completed.includes(l.id));
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
  const upcoming = next
    ? lessons
        .slice(lessons.indexOf(next))
        .filter(
          (_, i) =>
            i === 0 ||
            lessons
              .slice(lessons.indexOf(next), lessons.indexOf(next) + i + 1)
              .reduce((n, l) => n + l.minutes, 0) <= allowance,
        )
    : [];
  return { due, upcoming };
}
