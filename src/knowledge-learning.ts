import { knowledgeEntries, type LearningGoal } from './knowledge';
import { generateScene } from './scene-generator';
import type { CommunicationScene } from './scene-schema';
export type KnowledgeRecord = {
  saved: boolean;
  understood: boolean;
  practices: number;
  due: number;
  interval: number;
  lastOutput: string;
};
export type KnowledgeState = {
  goal: LearningGoal;
  records: Record<string, KnowledgeRecord>;
  words?: { term: string; context: string; zh: string }[];
};
export const freshKnowledge = (): KnowledgeState => ({ goal: 'work', records: {} });
export function parseKnowledge(value: unknown): KnowledgeState {
  if (!value || typeof value !== 'object') throw new Error('知识记录无效');
  const v = value as KnowledgeState;
  if (
    !['ielts', 'toefl', 'business', 'work', 'daily'].includes(v.goal) ||
    !v.records ||
    typeof v.records !== 'object' ||
    Array.isArray(v.records)
  )
    throw new Error('知识目标无效');
  const records: KnowledgeState['records'] = {};
  for (const [id, r] of Object.entries(v.records)) {
    if (
      !knowledgeEntries.some((e) => e.id === id) ||
      !r ||
      typeof r.saved !== 'boolean' ||
      typeof r.understood !== 'boolean' ||
      !Number.isInteger(r.practices) ||
      r.practices < 0 ||
      r.practices > 100000 ||
      !Number.isFinite(r.due) ||
      r.due < 0 ||
      ![0, 1, 3, 7, 14].includes(r.interval) ||
      typeof r.lastOutput !== 'string' ||
      r.lastOutput.length > 1500
    )
      throw new Error('知识记录格式无效');
    records[id] = {
      saved: r.saved,
      understood: r.understood,
      practices: r.practices,
      due: r.due,
      interval: r.interval,
      lastOutput: r.lastOutput,
    };
  }
  const words = v.words === undefined ? undefined : v.words;
  if (
    words !== undefined &&
    (!Array.isArray(words) ||
      words.length > 200 ||
      !words.every(
        (w) =>
          w &&
          ['term', 'context', 'zh'].every(
            (k) =>
              typeof w[k as keyof typeof w] === 'string' && w[k as keyof typeof w].length <= 1500,
          ) &&
          w.term.trim(),
      ))
  )
    throw new Error('个人词库格式无效');
  return {
    goal: v.goal,
    records,
    ...(words ? { words: words.map((w) => ({ term: w.term, context: w.context, zh: w.zh })) } : {}),
  };
}
export function recordKnowledge(
  s: KnowledgeState,
  id: string,
  action: 'save' | 'remove' | 'understand' | 'practice' | 'again',
  output = '',
  now = Date.now(),
): KnowledgeState {
  if (!knowledgeEntries.some((e) => e.id === id)) return s;
  const r = s.records[id] || {
    saved: false,
    understood: false,
    practices: 0,
    due: 0,
    interval: 0,
    lastOutput: '',
  };
  const next = { ...r };
  if (action === 'save' || action === 'remove') next.saved = action === 'save';
  if (action === 'understand') {
    next.understood = true;
    next.due = now;
  }
  if (action === 'practice') {
    // A completed application includes the scenario's meaning/listening checks.
    next.understood = true;
    next.practices++;
    next.lastOutput = output.slice(0, 1500);
    next.interval = r.interval === 0 ? 1 : r.interval === 1 ? 3 : r.interval === 3 ? 7 : 14;
    next.due = now + next.interval * 86400000;
  }
  if (action === 'again') {
    next.interval = 0;
    next.due = now;
  }
  return { ...s, records: { ...s.records, [id]: next } };
}
export function knowledgePlan(s: KnowledgeState, advanced = false, now = Date.now()) {
  const pool = knowledgeEntries.filter((e) => e.goals.includes(s.goal));
  const due = pool.filter((e) => s.records[e.id]?.understood && s.records[e.id].due <= now);
  const newUnits = pool
    .filter((e) => !s.records[e.id]?.understood)
    .sort((a, b) =>
      advanced
        ? Number(b.level === 'C1') - Number(a.level === 'C1')
        : Number(a.level === 'C1') - Number(b.level === 'C1'),
    );
  return { due, next: due[0] || newUnits[0], upcoming: [...due, ...newUnits].slice(0, 3) };
}
export function knowledgeToScene(id: string, advanced = false): CommunicationScene {
  const e = knowledgeEntries.find((e) => e.id === id);
  if (!e) throw new Error('知识单元未找到');
  const academic = e.domain === 'academic';
  const daily = e.domain === 'daily';
  const housing = e.scene === 'housing';
  const base = generateScene({
    request: `练习 ${e.term}：${e.zh}`,
    template: e.scene,
    level: advanced ? 'C1' : 'B2',
    product: '',
    facts: '',
  });
  const role = academic ? '研究项目导师' : base.roles[0].job;
  const context = academic
    ? '你在讨论模拟研究。现有样本有限，未证实因果关系；需区分假设、证据与结论。'
    : `${base.context} 本轮围绕 ${e.term} 展开。${daily ? '个人经历与安排按实际情况表达。' : '资源、效果和后续安排尚待核验；不能宣布预算已批准或效果已实现。'}`;
  const samples = [
    e.example,
    `Here, "${e.term}" means "${e.en}". We should clarify how that meaning applies to the situation.`,
    academic
      ? 'Before drawing a conclusion, I would check the evidence and consider limitations because the sample may not represent everyone.'
      : housing
        ? 'I would check the lease and confirm the inspection details before agreeing to any additional charge.'
        : daily
          ? 'Before suggesting a plan, I would ask what you enjoy and when you are available, rather than assume we share the same interests.'
          : 'Before making a commitment, I would verify the requirements and available resources because the proposal still needs approval.',
    housing
      ? 'Could you send the inspection details in writing? I will review them and follow up tomorrow if anything remains unclear.'
      : daily
        ? 'We could check with each other later this week and decide on a plan once we know our availability.'
        : 'We could review the evidence together next week, provided that we agree on the criteria and record any remaining questions.',
  ];
  const lines = [
    daily
      ? 'What would you like to share or ask in this situation?'
      : 'What would you propose or conclude in this situation?',
    `What do you mean by “${e.term}” in this context?`,
    'What would you need to verify before taking action?',
    'How should we follow up, and what should we review?',
  ];
  return {
    ...base,
    title: `${e.term} · 知识应用训练`,
    brief: `从含义与搭配进入沟通：${e.zh}。${e.usage}`,
    goal: `理解并运用 ${e.term}，解释含义、限制和下一步。`,
    context,
    knowledgeIds: [id],
    vocabulary: [{ en: e.term, zh: e.zh }, ...e.collocations.map((en) => ({ en, zh: e.usage }))],
    grammar: [e.usage, e.contrast, '用理由支持观点，保持事实与不确定性'],
    culture: [e.contrast, '先核对对方理解，不用复杂措辞掩盖信息不足。'],
    roles: [{ name: 'Alex', job: role, relationship: '共同讨论，提出追问并核对含义' }],
    listening: {
      line: e.example,
      question: e.question.prompt,
      options: e.question.options,
      answer: e.question.answer,
      explanation: e.question.why,
    },
    analysisQuestion: {
      prompt: `哪种理解更符合 ${e.term} 的使用边界？`,
      options: [e.contrast, '更高级的词能保证事实正确', '只背一句例句就代表完整掌握'],
      answer: e.contrast,
      explanation: e.usage,
    },
    c1Question: {
      prompt: '证据不足时，怎样表达更负责？',
      options: ['说明已知、未知及判断成立的条件', '用绝对语气增强可信度', '隐藏局限'],
      answer: '说明已知、未知及判断成立的条件',
      explanation: e.contrast,
    },
    expressions: [
      {
        basic: e.example,
        natural: e.example,
        fluent: `One point to consider is the meaning of ${e.term} in this context.`,
        explanation: '原句本身可以自然；不为了升级加入事实。第三句用于引入分析，不是同义替换。',
        usage: e.usage,
      },
      {
        basic: `What does ${e.term} mean here?`,
        natural: `Could you clarify how you are using ${e.term} in this situation?`,
        fluent:
          'I may be reading too much into that; could we clarify the meaning before drawing a conclusion?',
        explanation: '直接询问、礼貌澄清及限定自己的解读，适用目的不同。',
        usage: '对方的概念或词语可能有不同含义时。',
      },
      {
        basic: daily ? 'We should confirm the details.' : 'We should check the evidence.',
        natural: daily
          ? 'Could we check the details before agreeing on a plan?'
          : 'Could we review the evidence before making a commitment?',
        fluent: daily
          ? 'Let us clarify what has been agreed and what still needs to be confirmed before making arrangements.'
          : 'The conclusion remains tentative until we have checked the relevant evidence and limitations.',
        explanation: '从行动建议转为不确定性说明，不暗示已经验证结果。',
        usage: daily ? '个人安排或服务条款仍需确认时。' : '学术或项目判断尚不确定时。',
      },
    ],
    turns: base.turns.map((t, i) => ({
      ...t,
      role: `Alex · ${role}`,
      line: lines[i],
      zh: [
        daily ? '在这个情境中，你想分享或询问什么？' : '你的建议或解读是什么？',
        `这里的 ${e.term} 指什么？`,
        '行动前需核验什么？',
        '如何跟进，复审哪些内容？',
      ][i],
      sample: samples[i],
      rubric: {
        minWords: 1,
        criteria: [
          {
            label: [
              '表达具体建议或解读',
              '解释目标知识的场景含义',
              '说明需要核验的事实',
              '明确下一步及复审时间',
            ][i],
            pattern: '.+',
          },
          { label: '保留事实和不确定性边界', pattern: '.+' },
        ],
      },
      advanced: {
        label: '说明条件、理由或限定范围',
        pattern: '.+',
        hint: 'C1：用具体依据支持观点，并限定推断范围；不靠更复杂的词掩盖未知。',
      },
      task: [
        `结合场景表达观点，尝试 ${e.collocations[0]}，重点是意思准确。`,
        `用自己的话解释 ${e.term}；${e.contrast}`,
        '说明核验方法，不编造事实。',
        '约定复审内容和时间。',
      ][i],
      followUp: [
        'Please clarify the meaning behind that expression.',
        'What evidence or conditions would affect your view?',
        'What should our next step be?',
        'Thanks. Please summarize the agreed action and the remaining uncertainty.',
      ][i],
    })),
    environment: {
      ...base.environment,
      heading: academic ? 'ACADEMIC · EVIDENCE & REASONING' : 'KNOWLEDGE · COMMUNICATION',
      stages: [
        'Apply the idea',
        'Explain the meaning',
        daily ? 'Clarify the details' : 'Check the evidence',
        'Agree next steps',
      ],
      objects: ['Meaning', daily ? 'Details' : 'Evidence', 'Action'],
    },
  };
}
