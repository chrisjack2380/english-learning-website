import type { TaskSpec } from './communication';

export type SceneCategory = 'workplace' | 'business' | 'social' | 'daily';
export type SceneRole = 'colleague' | 'friend' | 'customer' | 'service' | 'interviewer';
export type Expression = {
  basic: string;
  natural: string;
  fluent: string;
  explanation: string;
  usage: string;
};
export type SceneQuestion = {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};
export type CommunicationTurn = {
  role: string;
  line: string;
  zh: string;
  task: string;
  sample: string;
  rubric: TaskSpec;
  followUp: string;
  advanced: { label: string; pattern: string; hint: string };
};
export type SceneCore = {
  id: string;
  title: string;
  english: string;
  role: SceneRole;
  brief: string;
  goal: string;
  context: string;
  nuance: string;
  listening: Omit<SceneQuestion, 'prompt'> & { line: string; question: string };
  analysisQuestion: SceneQuestion;
  expressions: Expression[];
  turns: CommunicationTurn[];
};
export type SceneMetadata = {
  category: SceneCategory;
  levels: ('B1' | 'B2' | 'C1')[];
  location: string;
  roles: { name: string; job: string; relationship: string }[];
  vocabulary: { en: string; zh: string }[];
  grammar: string[];
  culture: string[];
  difficulty: { b2: string; c1: string };
  practice: string[];
  evaluation: string[];
  environment: {
    kind: 'office' | 'lounge' | 'demo' | 'service';
    name: string;
    heading: string;
    objects: string[];
    stages: string[];
  };
  c1Question: SceneQuestion;
};
export type CommunicationScene = SceneCore &
  SceneMetadata & {
    knowledgeIds?: string[];
    source?: 'template' | 'ai';
    customization?: { request: string; level: 'B2' | 'C1'; product: string; facts: string };
  };
export const categoryLabels: Record<SceneCategory, string> = {
  workplace: '职场交流',
  business: '商务交流',
  social: '社交与文化',
  daily: '生活问题',
};
