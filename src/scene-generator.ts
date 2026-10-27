import { communicationScenes } from './advanced-content';
import type { CommunicationScene } from './scene-schema';

export type SceneRequest = {
  request: string;
  template: string;
  level: 'B2' | 'C1';
  product: string;
  facts: string;
};
export const CUSTOM_SCENES_KEY = 'little-by-little:custom-scenes:v1';
const intents: [string, RegExp][] = [
  ['interview', /面试|interview/i],
  ['presentation', /汇报|演讲|presentation/i],
  ['technical', /技术|架构|technical/i],
  ['negotiation', /谈判|议价|negotiat/i],
  ['complaint', /投诉|售后|complaint/i],
  ['housing', /租房|公寓|维修|housing|rent/i],
  ['culture', /跨文化|文化差异|时区|cross.cultur/i],
  ['smalltalk', /聊天|社交|small.?talk/i],
  ['meeting', /会议|meeting/i],
  ['pitch', /介绍|产品|设备|展示|pitch|product/i],
  ['customer', /客户|需求|customer/i],
];
const clean = (value: string, max: number) =>
  value
    .trim()
    .replace(/[\u0000-\u001f]/g, ' ')
    .slice(0, max);
export function generateScene(input: SceneRequest): CommunicationScene {
  const request = clean(input.request, 500);
  if (!request) throw new Error('请描述你想完成的沟通任务。');
  const id =
    input.template === 'auto'
      ? intents.find(([, pattern]) => pattern.test(request))?.[0]
      : input.template;
  const base = communicationScenes.find((s) => s.id === id);
  if (!base) throw new Error('尚未匹配到审核过的模板，请选择最接近的场景类型。');
  if (!['B2', 'C1'].includes(input.level)) throw new Error('请选择 B2 或 C1。');
  const scene = structuredClone(base);
  const environmental = /环保|除臭|environment|odor/i.test(request);
  const product =
    clean(input.product, 80) || (environmental ? 'environmental equipment' : 'a workflow tool');
  const facts = clean(input.facts, 700);
  scene.source = 'template';
  scene.customization = { request, level: input.level, product, facts };
  scene.title = `${base.title} · 我的任务`;
  scene.brief = `你的需求：${request}。使用「${base.title}」审核模板；以下是练习设定，不代表真实产品、合同或个人经历。`;
  scene.context = `${base.context} 自定义背景：${request}。${facts ? `用户提供的待核实资料：${facts}。` : '没有提供可验证事实，请用澄清问题和评估方案，不添加效果保证。'}`;
  if (id === 'pitch') {
    scene.roles = [
      {
        name: 'Alex',
        job: '美国客户采购经理',
        relationship: '潜在客户；先确认需求，再介绍设备或产品',
      },
    ];
    scene.location = '美国客户产品评估会议';
    scene.environment.heading = 'PRODUCT REVIEW · YOUR SOLUTION';
    scene.environment.objects = ['Need', 'Evidence', 'Pilot'];
    scene.turns.forEach((t) => {
      t.role = 'Alex · 采购经理';
    });
    scene.goal = '确认客户问题，用已知事实介绍价值，回应证据追问并约定评估。';
    scene.context = `你介绍 ${product}。${facts ? `用户提供、尚未独立核实的资料：${facts}。` : '尚无已验证的产品功能或测量数据。'} 不得添加分子级原理、效率百分比、认证、集成或效果保证。示范回答使用评估性表达；有真实资料后再具体说明。`;
    scene.listening = {
      line: 'Before we discuss your solution, I would like to understand how it fits our requirements. What evidence do you have, and could we evaluate it in a limited pilot?',
      question: '采购经理希望先确认什么？',
      options: ['需求适配、证据及有限评估', '产品一定能消除所有问题', '直接接受所有销售承诺'],
      answer: '需求适配、证据及有限评估',
      explanation: 'requirements / evidence / evaluate 表示评估要求，不是购买承诺。',
    };
    scene.analysisQuestion = {
      prompt: '没有验证数据时，哪句最可信？',
      options: [
        'We should evaluate the fit before making a performance claim.',
        'It guarantees perfect results.',
        'It works for every customer.',
      ],
      answer: 'We should evaluate the fit before making a performance claim.',
      explanation: '先核对资料和测试，不把行业标签转成技术能力。',
    };
    scene.c1Question = {
      prompt: '客户要求 evidence，应如何回答？',
      options: [
        '区分用户提供的资料与已验证结果，并说明如何核验',
        '行业名称足以证明效果',
        '高级措辞可以替代数据',
      ],
      answer: '区分用户提供的资料与已验证结果，并说明如何核验',
      explanation: '表达升级不能替代证据，也不能制造事实。',
    };
    scene.expressions = [
      {
        basic: `We offer ${product}.`,
        natural: 'Let us first clarify the problem you need to solve.',
        fluent:
          'Before recommending a solution, I would like to understand your operating requirements.',
        explanation: '从产品标签转向客户需求；未给事实时不生成效果主张。',
        usage: '首次与采购经理交流。',
      },
      {
        basic: 'We need to test it.',
        natural: 'A limited pilot could help us assess the fit.',
        fluent: 'A controlled evaluation would let us compare the results against agreed criteria.',
        explanation: '从试一试升级为约定评价标准的核验；could / would 不保证结果。',
        usage: '技术功能与效果尚待确认。',
      },
      {
        basic: 'We do not know the result yet.',
        natural: 'We have not verified the performance in your environment.',
        fluent:
          'I would distinguish the supplied specifications from results independently verified under your conditions.',
        explanation: '区分资料与证据，不把更高级表达当技术保证。',
        usage: '回应效果或技术原理追问。',
      },
    ];
    scene.turns = [
      {
        ...scene.turns[0],
        line: 'What problem would your solution help us address?',
        zh: '你的方案针对什么问题？',
        task: '先询问客户的具体要求，而不是编造产品效果。',
        sample:
          'Before I recommend a solution, could you describe your current requirements and the main problem you need to address?',
        rubric: {
          minWords: 12,
          criteria: [
            { label: '澄清要求', pattern: '\\b(requirements?|needs?|problem)\\b' },
            { label: '提出问题', pattern: '\\b(could you|what|how)\\b[^?]*\\?' },
          ],
        },
        advanced: {
          label: '先诊断后建议',
          pattern: '\\b(before|first|rather than)\\b',
          hint: 'C1：说明先确认需求再推荐的顺序。',
        },
      },
      {
        ...scene.turns[1],
        line: 'How is your product different from other solutions?',
        zh: '你的产品与其他方案有什么不同？',
        task: '说明要比较哪些要求或标准，没有数据时不编造优势。',
        sample:
          'I would compare the available specifications against your requirements, rather than claim an advantage that we have not verified.',
        rubric: {
          minWords: 12,
          criteria: [
            { label: '明确比较依据', pattern: '\\b(compare|specifications|criteria)\\b' },
            { label: '承认证据边界', pattern: '\\b(not verified|verify|evidence|data)\\b' },
          ],
        },
        advanced: {
          label: '区分比较与主张',
          pattern: '\\b(rather than|before|whereas)\\b',
          hint: 'C1：比较资料不等于证明产品优越。',
        },
      },
      {
        ...scene.turns[2],
        line: 'What evidence supports the performance claims?',
        zh: '性能主张有什么证据？',
        task: '承认缺少已验证结果，并提出测试或核验。',
        sample:
          'We have not verified performance in your environment yet, so I suggest a controlled test before making a claim.',
        rubric: {
          minWords: 12,
          criteria: [
            { label: '说明验证边界', pattern: '\\b(not verified|unverified|not yet|no data)\\b' },
            { label: '提出核验', pattern: '\\b(test|evaluate|evaluation|pilot)\\b' },
          ],
        },
        advanced: {
          label: '证据先于承诺',
          pattern: '\\b(before|until|subject to)\\b',
          hint: 'C1：说明何时才可以作出性能主张。',
        },
      },
      {
        ...scene.turns[3],
        line: 'What would the next step be?',
        zh: '下一步如何进行？',
        task: '提出有限评估，并约定标准和复核节点。',
        sample:
          'We could arrange a limited pilot and agree on evaluation criteria, provided that we review the results together next week.',
        rubric: {
          minWords: 12,
          criteria: [
            { label: '有限评估', pattern: '\\b(pilot|evaluation|test)\\b' },
            { label: '评价及节点', pattern: '\\b(criteria|review|next week)\\b' },
          ],
        },
        advanced: {
          label: '条件式安排',
          pattern: '\\b(provided|if|subject to)\\b',
          hint: 'C1：明确评估安排的条件。',
        },
      },
    ];
    scene.turns.forEach((t, i) => {
      t.followUp = [
        'Which requirements should we prioritize?',
        'Please explain what still needs to be verified.',
        'How would you design the evaluation?',
        'Send a brief outline of the pilot and the review criteria.',
      ][i];
    });
  }
  return scene;
}

const text = (v: unknown, max = 1500): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[\u0000-\u0008]/.test(v);
/** Only editable prose crosses the AI boundary. IDs, rubrics, regexes and environment come from trusted templates. */
export function applyAIProse(base: CommunicationScene, value: unknown): CommunicationScene {
  if (!value || typeof value !== 'object') throw new Error('AI 场景格式不正确。');
  const v = value as Record<string, unknown>;
  const allowed = ['title', 'brief', 'context', 'expressions', 'turns'];
  if (
    Object.keys(v).some((k) => !allowed.includes(k)) ||
    !text(v.title, 100) ||
    !text(v.brief) ||
    !text(v.context)
  )
    throw new Error('AI 场景字段不受支持。');
  if (
    !Array.isArray(v.expressions) ||
    v.expressions.length !== 3 ||
    !Array.isArray(v.turns) ||
    v.turns.length !== base.turns.length
  )
    throw new Error('AI 场景缺少完整表达或对话。');
  const expressions = v.expressions.map((e) => {
    if (
      !e ||
      typeof e !== 'object' ||
      Object.keys(e).some(
        (k) => !['basic', 'natural', 'fluent', 'explanation', 'usage'].includes(k),
      ) ||
      !['basic', 'natural', 'fluent', 'explanation', 'usage'].every((k) => text(e[k]))
    )
      throw new Error('AI 表达格式错误。');
    return {
      basic: e.basic,
      natural: e.natural,
      fluent: e.fluent,
      explanation: e.explanation,
      usage: e.usage,
    };
  });
  const turns = v.turns.map((t, i) => {
    if (
      !t ||
      typeof t !== 'object' ||
      Object.keys(t).some((k) => !['line', 'zh', 'sample', 'followUp'].includes(k)) ||
      !['line', 'zh', 'sample', 'followUp'].every((k) => text(t[k]))
    )
      throw new Error('AI 对话格式错误。');
    if ((t.sample.match(/[a-z]+/gi) || []).length < 4) throw new Error('AI 示例必须提供英文输出。');
    return { ...base.turns[i], line: t.line, zh: t.zh, sample: t.sample, followUp: t.followUp };
  });
  return {
    ...base,
    title: v.title,
    brief: v.brief,
    context: v.context,
    expressions,
    turns,
    source: 'ai',
  };
}

export type SavedScene = { savedAt: number; input: SceneRequest; prose?: unknown };
export function loadCustomScenes(): SavedScene[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(CUSTOM_SCENES_KEY) || '[]');
    if (!Array.isArray(list) || list.length > 12) return [];
    return list.filter((item) => {
      try {
        if (!item || !Number.isFinite(item.savedAt) || item.savedAt < 0) return false;
        const base = generateScene(item.input);
        if (item.prose) applyAIProse(base, item.prose);
        return true;
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}
export function restoreCustomScene(item: SavedScene) {
  const base = generateScene(item.input);
  return item.prose ? applyAIProse(base, item.prose) : base;
}
