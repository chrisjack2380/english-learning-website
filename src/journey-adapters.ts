import type { CommunicationScene } from './scene-schema';
import type { Scene } from './content';
import type { LearningJourney, JourneyStage } from './journey-schema';
import { lifeJourneys } from './life-content';
import { lookupKnowledge } from './knowledge';
import { adultOutput, adultTranslations } from './legacy-teaching';
import { beginnerVocabulary } from './beginner-teaching';
export function communicationJourney(scene: CommunicationScene, id: string): LearningJourney {
  const base = lifeJourneys.find(
    (j) =>
      j.id ===
      (scene.category === 'daily'
        ? 'hotel'
        : scene.category === 'social'
          ? 'commute'
          : 'office-day'),
  )!;
  const stage = base.stages[scene.category === 'social' ? 4 : scene.category === 'daily' ? 0 : 2];
  // Start from reviewed vocabulary, replacing entries only when a full dictionary unit exists.
  const mapped = (scene.knowledgeIds || [])
    .map((id) => id.replace(/-/g, ' '))
    .concat(scene.vocabulary.map((v) => v.en))
    .map(lookupKnowledge)
    .filter((e) => !!e)
    .map(
      (e) =>
        [
          e.term,
          e.zh,
          e.en,
          e.example,
          e.translation,
          e.collocations.join(';'),
        ] as JourneyStage['words'][number],
    );
  const words = [...new Map([...mapped, ...stage.words].map((w) => [w[0], w])).values()].slice(
    0,
    6,
  );
  return {
    id,
    title: scene.title,
    english: scene.english,
    level: scene.levels.join(' / '),
    goal: scene.goal,
    stages: [
      {
        ...stage,
        id: 'guided',
        title: '先理解，再应用',
        place: scene.location,
        image: scene.category === 'daily' ? 5 : scene.category === 'social' ? 3 : 7,
        role: scene.roles[0].name,
        intro: scene.listening.line,
        introZh: `听力重点：${scene.listening.explanation}`,
        words,
        expressions: scene.expressions
          .slice(0, 2)
          .map((e) => [e.natural, adultTranslations[e.natural] || e.usage, e.explanation]),
        listening: {
          line: scene.listening.line,
          zh: `听力重点：${scene.listening.explanation}`,
          question: scene.listening.question,
          options: scene.listening.options,
          answer: scene.listening.answer,
          why: scene.listening.explanation,
        },
        cloze: (() => {
          const w = words.find((w) => w[3].toLowerCase().includes(w[0].toLowerCase()))!;
          const at = w[3].toLowerCase().indexOf(w[0].toLowerCase());
          return {
            before: w[3].slice(0, at),
            answer: w[3].slice(at, at + w[0].length),
            after: w[3].slice(at + w[0].length),
            alternatives: [],
            zh: w[4],
            why: w[2],
          };
        })(),
        output: scene.knowledgeIds
          ? {
              ...adultOutput(scene.id),
              prompt: 'What does this expression mean?',
              zh: '用下面的例句理解这个词语；选择对应的真实表达。',
              answer: words[0][3],
              options: [words[0][3], 'The train is packed.', 'I need a shopping basket.'],
              equivalents: [],
              why: words[0][2],
            }
          : scene.customization || scene.source === 'ai'
            ? {
                ...adultOutput(scene.id),
                prompt: scene.turns[0].line,
                zh: scene.turns[0].task,
                answer: scene.expressions[0].natural,
                options: [
                  scene.expressions[0].natural,
                  'The apples are ripe.',
                  'I need a boarding pass.',
                ],
                equivalents: [scene.expressions[0].basic],
                why: scene.expressions[0].explanation,
              }
            : adultOutput(scene.id),
        task: scene.goal,
      },
    ],
  };
}
export function basicJourney(scene: Scene, id: string): LearningJourney {
  const base = lifeJourneys.find(
    (j) =>
      j.id ===
      (scene.id === 'cafe' ? 'dining' : scene.id === 'directions' ? 'commute' : 'office-day'),
  )!;
  const stage = base.stages[scene.id === 'cafe' ? 1 : scene.id === 'directions' ? 1 : 0];
  const words = beginnerVocabulary[scene.id] || beginnerVocabulary.greeting;
  const line = words[0][3],
    at = line.toLowerCase().indexOf(words[0][0]);
  const first = scene.turns[0];
  return {
    id,
    title: scene.title,
    english: scene.english,
    level: scene.level,
    goal: scene.description,
    stages: [
      {
        ...stage,
        id: 'guided',
        title: '先理解，再练习',
        role: first.speaker,
        intro: first.line,
        introZh: first.zh,
        words,
        expressions: scene.expressions
          .slice(0, 2)
          .map((e) => [e.en, e.zh, '先听懂意思，再跟读；简单表达可以完成真实沟通。']),
        listening: {
          line: first.line,
          zh: first.zh,
          question: '这句话的意思是什么？',
          options: [first.zh, '询问航班延误', '说明医学检查结果'],
          answer: first.zh,
          why: first.feedback,
        },
        cloze: {
          before: line.slice(0, at),
          answer: line.slice(at, at + words[0][0].length),
          after: line.slice(at + words[0][0].length),
          alternatives: [],
          zh: words[0][4],
          why: words[0][2],
        },
        output: {
          prompt: first.line,
          zh: first.task,
          options: first.options,
          answer: first.correct,
          equivalents: [first.sample],
          why: first.feedback,
          reply: 'Thank you. Let us continue.',
          replyZh: '谢谢。我们继续。',
        },
      },
    ],
  };
}
