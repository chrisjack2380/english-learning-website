import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import clips from './audio-manifest.json';
import { lessons, matches, normalize, scenes, sceneForLesson } from './content';
import {
  addTime,
  canOpen,
  dailyPlan,
  dueLessons,
  finishLesson,
  finishScene,
  freshState,
  nextLesson,
  parseState,
  reviewSkill,
} from './learning';
const now = 1791460800000;
describe('teaching content and responses', () => {
  it('all spoken teaching phrases have a committed fallback audio resource', () => {
    const spoken = new Set<string>();
    for (const l of lessons) {
      l.examples.forEach((e) => spoken.add(e.en));
      l.questions.forEach((q) => {
        if (q.english) spoken.add(q.english);
      });
    }
    for (const scene of [...scenes, ...lessons.map((l) => sceneForLesson(l.id))]) {
      scene.expressions.forEach((e) => spoken.add(e.en));
      scene.turns.forEach((t) => {
        spoken.add(t.line);
        spoken.add(t.sample);
      });
    }
    for (const phrase of spoken) {
      const resource = (clips as Record<string, string>)[phrase];
      expect(resource, phrase).toBeTruthy();
      expect(existsSync(`public/audio/${resource}`), phrase).toBe(true);
    }
  });

  it('all model answers are accepted, with punctuation and case flexibility', () => {
    for (const l of lessons)
      for (const q of [...l.questions, l.review])
        expect(matches(q.sample, q), l.id + q.sample).toBe(true);
    for (const s of [...scenes, ...lessons.map((l) => sceneForLesson(l.id))])
      for (const t of s.turns) expect(matches(t.sample, t), s.id + t.sample).toBe(true);
  });
  it('rejects empty and unrelated text for every question and dialogue', () => {
    for (const q of [
      ...lessons.flatMap((l) => [...l.questions, l.review]),
      ...scenes.flatMap((s) => s.turns),
    ]) {
      expect(matches('', q)).toBe(false);
      expect(matches('I am a purple airplane', q)).toBe(false);
    }
  });
  it('rejects negative and contradicted production answers', () => {
    expect(matches('I am not Lin.', lessons[1].questions[2])).toBe(false);
    expect(matches('I would not like a coffee.', lessons[3].questions[2])).toBe(false);
    expect(matches('two cup', lessons[2].review)).toBe(false);
    expect(matches('The cup is on the table.', lessons[4].questions[2])).toBe(false);
    expect(matches('go straight then turn left', lessons[5].review)).toBe(false);
    expect(matches('cup is on table', lessons[4].review)).toBe(false);
  });
  it('accepts natural taught alternatives', () => {
    expect(matches('My name is Lin!', lessons[1].questions[2])).toBe(true);
    expect(matches('Can I have a coffee, please?', lessons[3].review)).toBe(true);
    expect(matches('Go straight and then turn right.', lessons[5].review)).toBe(true);
    expect(normalize('  I’m Lin! ')).toBe("i'm lin");
  });
  it('offers a correct and at least one incorrect branch in every dialogue turn', () => {
    for (const t of scenes.flatMap((s) => s.turns)) {
      expect(t.options).toContain(t.correct);
      expect(t.options.filter((v) => !matches(v, t))).not.toHaveLength(0);
    }
  });
});
describe('progress and scheduling', () => {
  it('starts with no invented progress and recommends lesson one', () => {
    const s = freshState();
    expect(nextLesson(s)?.id).toBe('hello');
    expect(dueLessons(s, now)).toEqual([]);
    expect(canOpen(s, 'names')).toBe(false);
    expect(canOpen(s, 'missing')).toBe(false);
  });
  it('does not allow completing lessons out of sequence', () => {
    const s = freshState();
    expect(finishLesson(s, 'order', 3, 0, now)).toBe(s);
  });
  it('completion unlocks the next lesson and schedules recall tomorrow', () => {
    const s = finishLesson(freshState(), 'hello', 3, 0, now);
    expect(s.completed).toEqual(['hello']);
    expect(nextLesson(s)?.id).toBe('names');
    expect(canOpen(s, 'names')).toBe(true);
    expect(s.skills.hello.due).toBe(now + 86400000);
    expect(s.skills.hello.status).toBe('learned');
  });
  it('a corrected initial error is still due for immediate review', () => {
    const s = finishLesson(freshState(), 'hello', 2, 0, now);
    expect(dueLessons(s, now).map((l) => l.id)).toEqual(['hello']);
    expect(s.skills.hello.status).toBe('review');
    expect(s.attempts[0].correct).toBe(2);
  });
  it('scenario mistakes also create a weak knowledge record', () => {
    const s = finishLesson(freshState(), 'hello', 3, 1, now);
    expect(s.skills.hello.status).toBe('review');
  });
  it('exploration stores evidence without completing or unlocking courses', () => {
    const s = finishScene(freshState(), 'cafe', 0, now);
    expect(s.sceneResults).toHaveLength(1);
    expect(s.completed).toEqual([]);
    expect(nextLesson(s)?.id).toBe('hello');
    expect(canOpen(s, 'names')).toBe(false);
  });
  it('exploration errors revisit existing related skills without granting unseen lessons', () => {
    const started = finishLesson(freshState(), 'hello', 3, 0, now);
    const practiced = finishScene(started, 'greeting', 1, now);
    expect(practiced.completed).toEqual(['hello']);
    expect(practiced.skills.hello.status).toBe('review');
    expect(practiced.skills.names).toBeUndefined();
    expect(dueLessons(practiced, now).map((l) => l.id)).toEqual(['hello']);
  });
  it('correct recall increases intervals; wrong recall schedules ten minutes', () => {
    let s = finishLesson(freshState(), 'hello', 2, 0, now);
    for (const interval of [1, 3, 7, 14, 14]) {
      s = reviewSkill(s, 'hello', true, now);
      expect(s.skills.hello.interval).toBe(interval);
      expect(s.skills.hello.due).toBe(now + interval * 86400000);
    }
    s = reviewSkill(s, 'hello', false, now);
    expect(s.skills.hello.interval).toBe(0);
    expect(s.skills.hello.due).toBe(now + 600000);
    expect(s.skills.hello.status).toBe('review');
  });
  it('never duplicates completed courses', () => {
    let s = finishLesson(freshState(), 'hello', 3, 0, now);
    s = finishLesson(s, 'hello', 3, 0, now);
    expect(s.completed).toEqual(['hello']);
    expect(s.attempts).toHaveLength(2);
  });
  it('daily goal affects course suggestions and prioritizes due reviews', () => {
    const s = freshState();
    s.profile = { level: 'beginner', minutes: 10, createdAt: now };
    expect(dailyPlan(s, now).upcoming).toHaveLength(1);
    s.profile.minutes = 30;
    expect(dailyPlan(s, now).upcoming).toHaveLength(3);
    const weak = finishLesson(s, 'hello', 2, 0, now);
    expect(dailyPlan(weak, now).due[0].id).toBe('hello');
  });
  it('restores a real record and rejects malformed, unknown, and incomplete backups', () => {
    const s = finishLesson(freshState(), 'hello', 2, 0, now);
    expect(parseState(JSON.stringify(s))).toEqual(s);
    for (const invalid of [
      { ...s, version: 2 },
      { ...s, completed: ['invalid'] },
      { ...s, completed: ['names'] },
      { ...s, skills: { hello: { ...s.skills.hello, due: 'never' } } },
      { ...s, profile: { level: 'beginner', minutes: 200, createdAt: now } },
    ])
      expect(() => parseState(JSON.stringify(invalid))).toThrow();
    expect(() => parseState('{broken')).toThrow();
  });
  it('records real elapsed time, with caps and invalid-duration rejection', () => {
    const s = addTime(freshState(), 15, now);
    expect(Object.values(s.activity)).toEqual([15]);
    expect(Object.values(addTime(s, 10000, now).activity)).toEqual([75]);
    expect(addTime(s, -4, now)).toBe(s);
    expect(addTime(s, NaN, now)).toBe(s);
  });
});
