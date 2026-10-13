export type WordSeed = [
  term: string,
  zh: string,
  meaning: string,
  example: string,
  translation: string,
  collocations: string,
];
export type ExpressionSeed = [line: string, zh: string, explanation: string];
export type JourneyStage = {
  id: string;
  title: string;
  place: string;
  image: number;
  role: string;
  intro: string;
  introZh: string;
  task: string;
  words: WordSeed[];
  expressions: ExpressionSeed[];
  listening: {
    line: string;
    zh: string;
    question: string;
    options: string[];
    answer: string;
    why: string;
  };
  cloze: {
    before: string;
    after: string;
    answer: string;
    alternatives: string[];
    zh: string;
    why: string;
  };
  output: {
    intent?: string;
    prompt: string;
    zh: string;
    options: string[];
    answer: string;
    equivalents: string[];
    why: string;
    reply: string;
    replyZh: string;
  };
};
export type LearningJourney = {
  id: string;
  title: string;
  english: string;
  level: string;
  goal: string;
  stages: JourneyStage[];
};
export const teachingSteps = [
  '观察与发现',
  '词汇与表达',
  '情境回忆',
  '听力匹配',
  '情境填空',
  '模仿与输出',
  '反馈与复习',
] as const;
