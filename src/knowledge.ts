import { officeLab } from './office-lab';
/** Original teaching units; reference links describe frameworks, never reproduced textbook material. */
import { lifeJourneys } from './life-content';
import { adultVocabulary, adultTranslations } from './legacy-teaching';
import { communicationScenes } from './advanced-content';
import { beginnerVocabulary } from './beginner-teaching';
import basicExpressions from './basic-expressions.json' with { type: 'json' };
export type LearningGoal = 'ielts' | 'toefl' | 'business' | 'work' | 'daily';
export const goalLabels: Record<LearningGoal, string> = {
  ielts: 'IELTS',
  toefl: 'TOEFL',
  business: '商务英语',
  work: '工作英语',
  daily: '日常交流',
};
export type KnowledgeEntry = {
  id: string;
  term: string;
  aliases: string[];
  kind: 'word' | 'phrase' | 'grammar';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  tags: string[];
  goals: LearningGoal[];
  zh: string;
  en: string;
  ipa: string;
  collocations: string[];
  example: string;
  translation: string;
  usage: string;
  contrast: string;
  scene: string;
  domain: 'business' | 'academic' | 'daily';
  source: string;
  question: { prompt: string; options: string[]; answer: string; why: string };
};
export const knowledgeSources = [
  {
    id: 'original',
    name: '本站原创教学单元',
    url: '',
    rights: '释义、例句、练习和场景为原创；非官方词表、教材或考试认证。',
  },
  {
    id: 'awl',
    name: 'Academic Word List · 框架参考',
    url: 'https://www.wgtn.ac.nz/lals/resources/academicwordlist',
    rights: '仅参考学术词汇学习方向；未整批复制 AWL 数据或例句。',
  },
  {
    id: 'ielts',
    name: 'IELTS Academic · 能力方向参考',
    url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test',
    rights: '原创训练单元；未复制 Cambridge IELTS 教材、真题或受保护解释。',
  },
  {
    id: 'toefl',
    name: 'TOEFL Academic English · 能力方向参考',
    url: 'https://www.ets.org/toefl/test-takers/ibt/about/content.html',
    rights: '原创学术交流练习；非 ETS 官方教材或评分。',
  },
  {
    id: 'cambridge',
    name: 'Cambridge English · 课程方向参考',
    url: 'https://www.cambridgeenglish.org/learning-english/',
    rights: '参考等级/用法学习方向；不表示授权、合作或复制教材。',
  },
];
type Seed = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  'business' | 'academic' | 'daily',
  string,
];
const seeds: Seed[] = [
  [
    'allocate',
    '分配资源或时间',
    'to assign available resources to a purpose',
    '/ˈæləkeɪt/',
    'allocate resources;allocate a budget;allocate time',
    'We should allocate more resources to this project because the validation work needs additional support.',
    '应增加这个项目的资源，因为验证工作需要额外支持。',
    'allocate something to something；预算仍须审批。',
    '分配已有资源，不等于已经批准额外资金。',
    'business',
    'meeting',
  ],
  [
    'assess',
    '评估价值、风险或证据',
    'to examine something carefully and form a judgment',
    '/əˈses/',
    'assess the evidence;assess the risk;assess the impact',
    'We need to assess the evidence before drawing a conclusion because the sample is limited.',
    '样本有限，应先评估证据再下结论。',
    'assess + 名词，说明评价依据。',
    'assess 形成判断；measure 更侧重测量。',
    'academic',
    'presentation',
  ],
  [
    'evidence',
    '支持判断的证据',
    'information that supports or challenges a claim',
    '/ˈevɪdəns/',
    'supporting evidence;limited evidence;provide evidence',
    'The evidence suggests a possible improvement, but it does not establish a causal relationship.',
    '证据暗示可能改善，但未确立因果关系。',
    '通常不可数，a piece of evidence。',
    '证据并非确定结论，需说明局限。',
    'academic',
    'technical',
  ],
  [
    'constraint',
    '限制条件',
    'a limit that affects what is possible',
    '/kənˈstreɪnt/',
    'budget constraint;time constraint;within constraints',
    'Given the budget constraint, we should compare the options before committing to additional work.',
    '预算受限，应先比较方案再承诺额外工作。',
    'constraint on something；given 交代依据。',
    '约束不等于无法采取任何行动。',
    'business',
    'negotiation',
  ],
  [
    'sustainable',
    '可持续的',
    'able to continue without exhausting necessary resources',
    '/səˈsteɪnəbl/',
    'sustainable approach;sustainable growth;financially sustainable',
    'We need a sustainable approach that meets current needs without creating unmanageable maintenance costs.',
    '需要满足当前需求、且维护成本可承受的持续方案。',
    '可说明环境、财务或运营维度。',
    'sustainable 不自动表示经环保认证。',
    'business',
    'pitch',
  ],
  [
    'mitigate',
    '减轻风险或影响',
    'to make a risk or harmful effect less severe',
    '/ˈmɪtɪɡeɪt/',
    'mitigate risk;mitigate the impact;mitigate potential harm',
    'A limited pilot may mitigate the risk, although it cannot eliminate every possible failure.',
    '有限试点可能降低风险，但无法消除所有故障。',
    'mitigate + risk/impact，搭配 may 限定。',
    '减轻，不是 eliminate 消除。',
    'business',
    'meeting',
  ],
  [
    'implement',
    '实施方案',
    'to put a plan or decision into practice',
    '/ˈɪmplɪment/',
    'implement a plan;implement changes;implement a policy',
    'Before we implement the changes, we should confirm ownership and agree on a review date.',
    '实施前应确定责任归属和复审日期。',
    '动词后接具体计划或变更。',
    '实施不等于效果已经得到验证。',
    'business',
    'presentation',
  ],
  [
    'evaluate',
    '评价适配或效果',
    'to judge something against stated criteria',
    '/ɪˈvæljueɪt/',
    'evaluate performance;evaluate the fit;evaluation criteria',
    'A controlled test would let us evaluate the fit against criteria agreed with the customer.',
    '可通过受控测试按双方标准评价适配。',
    '说明 evaluate 的对象和标准。',
    '评价标准可不同，不是普遍优劣排序。',
    'academic',
    'pitch',
  ],
  [
    'justify',
    '给出合理依据',
    'to provide a reason or evidence for a decision',
    '/ˈdʒʌstɪfaɪ/',
    'justify a decision;justify the cost;justify a claim',
    'To justify the additional cost, we need evidence that the proposed change addresses the actual problem.',
    '增加费用需要能回应实际问题的证据支持。',
    'justify something by/with evidence。',
    'justify 说明依据，不是自动证明正确。',
    'academic',
    'negotiation',
  ],
  [
    'infer',
    '根据证据推断',
    'to reach a tentative conclusion from information',
    '/ɪnˈfɜːr/',
    'infer from evidence;infer meaning;infer a relationship',
    'We cannot infer causation from this association without considering other explanations for the pattern.',
    '不考虑其他解释，不能从关联推出因果。',
    'infer something from something。',
    '说话人 imply 暗示，听者 infer 推断。',
    'academic',
    'culture',
  ],
  [
    'coherent',
    '连贯、逻辑清晰的',
    'organized so that the parts connect logically',
    '/koʊˈhɪrənt/',
    'coherent argument;coherent explanation;coherent structure',
    'A coherent explanation connects the claim to evidence and addresses the most relevant limitations.',
    '连贯解释应将主张与证据相连并回应局限。',
    '说明段落如何衔接。',
    '语言流利不等于论证连贯。',
    'academic',
    'presentation',
  ],
  [
    'significant',
    '值得关注或具有统计意义的',
    'important in context, or meeting a stated statistical test',
    '/sɪɡˈnɪfɪkənt/',
    'significant difference;statistically significant;significant impact',
    'A statistically significant result does not necessarily imply a large or practically useful effect.',
    '统计显著不一定效果大或实用。',
    '需明确统计或日常意义。',
    '不能把 significant 一律译成效果巨大。',
    'academic',
    'technical',
  ],
  [
    'reliable',
    '可靠的',
    'consistent enough to be depended on for a stated purpose',
    '/rɪˈlaɪəbl/',
    'reliable evidence;reliable estimate;reliable information',
    'We need a reliable estimate before confirming the schedule, so I will verify the missing details.',
    '确认安排前要有可靠估计，需核验缺失信息。',
    '说明可靠到什么程度。',
    '可靠不等于绝对准确或无条件保证。',
    'business',
    'complaint',
  ],
  [
    'perspective',
    '看问题的角度',
    'a particular way of understanding a situation',
    '/pərˈspektɪv/',
    'different perspective;from my perspective;broader perspective',
    'From my perspective, a smaller pilot gives us a useful way to test the assumptions.',
    '我认为小范围试点有助检验假设。',
    '标记个人立场，不装成客观事实。',
    'different perspective 不等于攻击对方。',
    'daily',
    'smalltalk',
  ],
  [
    'clarify',
    '澄清含义或要求',
    'to make something easier to understand precisely',
    '/ˈklærəfaɪ/',
    'clarify the requirements;clarify the meaning;clarify responsibilities',
    'Could you clarify which requirements matter most before we recommend a solution for your team?',
    '推荐方案前能澄清哪些要求最重要吗？',
    'clarify + 对象；间接问句不倒装。',
    '澄清是邀请修正理解，不是责怪对方。',
    'business',
    'customer',
  ],
  [
    'negotiate',
    '协商条件',
    'to discuss terms in order to reach an agreement',
    '/nɪˈɡoʊʃieɪt/',
    'negotiate terms;negotiate a contract;negotiate an agreement',
    'We can negotiate the scope, but any revised price remains subject to internal approval.',
    '范围可以协商，但新价格仍需审批。',
    'negotiate with someone about terms。',
    '讨论不等于已达成协议。',
    'business',
    'negotiation',
  ],
  [
    'prioritize',
    '确定优先级',
    'to decide what should receive attention first',
    '/praɪˈɔːrətaɪz/',
    'prioritize tasks;prioritize safety;prioritize requirements',
    'We should prioritize the safety checks before expanding the pilot to a wider group.',
    '扩大试点前应优先进行安全检查。',
    '说清被优先考虑的对象与理由。',
    '优先某项不表示删除其他需求。',
    'business',
    'meeting',
  ],
  [
    'trade-off',
    '收益与代价的权衡',
    'a choice in which a benefit comes with a cost',
    '/ˈtreɪd ɔːf/',
    'a trade-off between;manage a trade-off;make trade-offs',
    'The trade-off is faster response time at the cost of less immediate completion.',
    '权衡是响应更快，但任务完成不再即时。',
    'a trade-off between A and B。',
    '不同指标要分开比较。',
    'business',
    'technical',
  ],
  [
    'follow up',
    '继续跟进',
    'to take another action after an earlier conversation',
    '/ˈfɑːloʊ ʌp/',
    'follow up on a request;follow up with someone;follow-up email',
    'I will follow up with the carrier tomorrow and send you a written status update.',
    '明天会向承运方跟进并发送书面更新。',
    '动词 follow up；名词/形容词 follow-up。',
    '承诺自己可控制的动作。',
    'business',
    'complaint',
  ],
  [
    'subject to approval',
    '须经批准',
    'dependent on a decision by the authorized person',
    '/ˈsʌbdʒekt tə əˈpruːvəl/',
    'subject to approval;subject to review;subject to confirmation',
    'The revised proposal is subject to approval, so we should not describe it as a confirmed agreement.',
    '修订方案待批，不能说成已确认协议。',
    'subject to + 名词，不是无条件承诺。',
    'consider 与 approve 不同。',
    'business',
    'negotiation',
  ],
  [
    'provided that',
    '条件是、只要',
    'on the condition that something is true',
    '/prəˈvaɪdɪd ðæt/',
    'provided that we review;provided that it meets;provided that funding is available',
    'We could extend the pilot, provided that we review the evidence before committing further resources.',
    '可以延长试点，条件是投入更多资源前复审证据。',
    '引导条件从句。',
    '条件未满足时提议不自动成立。',
    'business',
    'meeting',
  ],
  [
    'whereas',
    '而、相较之下',
    'used to contrast two facts or approaches',
    '/werˈæz/',
    'whereas the alternative;whereas this approach;whereas others',
    'Reducing scope protects the milestone, whereas extending the schedule preserves the full deliverable.',
    '缩小范围保住节点，延长时间保留完整交付。',
    '两边比较维度要清楚。',
    'whereas 对比，不等于 because 因果。',
    'academic',
    'presentation',
  ],
  [
    'causal relationship',
    '因果关系',
    'a connection in which one factor contributes to an effect',
    '/ˈkɔːzəl rɪˈleɪʃənʃɪp/',
    'establish a causal relationship;causal relationship between;possible causal relationship',
    'The study shows an association, but further evidence is needed to establish a causal relationship.',
    '研究显示关联，但确立因果仍需证据。',
    'association 与 causation 分开。',
    '关联不能独自证明因果。',
    'academic',
    'technical',
  ],
  [
    'hypothesis',
    '可检验的假设',
    'a proposed explanation that can be tested',
    '/haɪˈpɑːθəsɪs/',
    'test a hypothesis;working hypothesis;support a hypothesis',
    'Our hypothesis is that clearer ownership may reduce delays, but we need to test it.',
    '假设责任更明确可能减少延期，但需检验。',
    '复数 hypotheses；表述可验证条件。',
    '假设不是已证实事实。',
    'academic',
    'technical',
  ],
  [
    'synthesize',
    '综合不同信息形成整体理解',
    'to combine ideas from sources into a connected account',
    '/ˈsɪnθəsaɪz/',
    'synthesize information;synthesize findings;synthesize ideas',
    'We should synthesize the findings from both sources while keeping their different limitations visible.',
    '综合两份资料时仍应呈现不同局限。',
    '说明来源之间如何关联。',
    '综合不是复制拼接全文。',
    'academic',
    'presentation',
  ],
  [
    'acknowledge',
    '承认观点、事实或影响',
    'to recognize that something exists or matters',
    '/əkˈnɑːlɪdʒ/',
    'acknowledge a concern;acknowledge the impact;acknowledge limitations',
    'I acknowledge the timing pressure, but we still need to validate the remaining risks.',
    '承认时间压力，但仍要验证风险。',
    'acknowledge 不一定意味着同意结论。',
    '承认客户感受不等于认定法律责任。',
    'business',
    'complaint',
  ],
  [
    'hedging',
    '用限定语表达不确定性',
    'using cautious language when evidence does not justify certainty',
    '/ˈhedʒɪŋ/',
    'may suggest;could indicate;appears to',
    'The findings may suggest a trend, although the limited sample prevents a firm conclusion.',
    '结果可能显示趋势，但样本有限不能下确定结论。',
    '按证据强度用 may/could/appears。',
    '不能用委婉表达掩盖已确认的严重风险。',
    'academic',
    'presentation',
  ],
  [
    'present perfect continuous',
    '现在完成进行时',
    'a form linking an ongoing activity with the present',
    '/ˈprezənt ˈpɜːrfɪkt kənˈtɪnjuəs/',
    'have been developing;has been working;for five years',
    'I have been developing products for five years, and I am still doing that work.',
    '我研发产品五年了，现在仍从事这项工作。',
    'have/has been + 动词-ing；for 表持续时长。',
    '如果工作已经结束，过去时可能更准确；不能自动改成 responsible for 改变职责含义。',
    'business',
    'interview',
  ],
  [
    'get into',
    '开始对某事感兴趣',
    'to develop an interest in an activity',
    '/ɡet ˈɪntuː/',
    'get into hiking;get into reading;get into a hobby',
    'I have been getting into hiking lately because it helps me unwind after work.',
    '最近开始喜欢徒步，因为下班后能放松。',
    'get into + 名词或活动。',
    '不等于一贯很熟练。',
    'daily',
    'smalltalk',
  ],
  [
    'find my feet',
    '逐渐适应新环境',
    'to become more confident in a new situation',
    '/faɪnd maɪ fiːt/',
    'still finding my feet;find your feet;find their feet',
    'I am still finding my feet here, but the neighborhood has made me feel welcome.',
    '还在适应，但社区让我感觉被欢迎。',
    '常用于新工作或新城市。',
    '是习语，不是身体动作。',
    'daily',
    'smalltalk',
  ],
  [
    'written confirmation',
    '书面确认',
    'a written record of what has been agreed or stated',
    '/ˈrɪtn ˌkɑːnfərˈmeɪʃən/',
    'request written confirmation;send written confirmation;written confirmation of the terms',
    'Could you send written confirmation of the inspection and clarify whether any additional charge applies?',
    '能书面确认检查并说明是否另收费吗？',
    '确认的是安排或条款，仍需核对实际内容。',
    '书面确认不自动替代合同或法律意见。',
    'daily',
    'housing',
  ],
  [
    'on the other hand',
    '从另一角度看',
    'used to introduce a different side of a comparison',
    '/ɑːn ði ˈʌðər hænd/',
    'on the one hand;on the other hand;consider both sides',
    'The proposal may save time. On the other hand, it could increase the maintenance workload.',
    '方案可能省时，另一方面也可能增加维护工作。',
    '应给出真正相关的另一面。',
    '不是每句话都需要连接词。',
    'academic',
    'presentation',
  ],
];
export const coreKnowledgeEntries: KnowledgeEntry[] = seeds.map(
  ([term, zh, en, ipa, collocations, example, translation, usage, contrast, domain, scene]) => ({
    id: term.replaceAll(' ', '-'),
    term,
    aliases:
      term === 'allocate'
        ? ['allocated', 'allocating']
        : term === 'assess'
          ? ['assessed', 'assessing']
          : [],
    kind:
      term === 'present perfect continuous' || term === 'hedging'
        ? 'grammar'
        : term.includes(' ')
          ? 'phrase'
          : 'word',
    level: [
      'mitigate',
      'synthesize',
      'causal relationship',
      'hedging',
      'infer',
      'coherent',
    ].includes(term)
      ? 'C1'
      : ['get into', 'find my feet', 'follow up', 'present perfect continuous'].includes(term)
        ? 'B1'
        : 'B2',
    tags:
      domain === 'academic'
        ? ['学术词汇', 'IELTS', 'TOEFL', '六级方向']
        : domain === 'business'
          ? ['商务表达', '职场词汇', '六级方向']
          : ['高频口语', '日常交流'],
    goals:
      domain === 'academic'
        ? ['ielts', 'toefl', 'work']
        : domain === 'business'
          ? ['business', 'work', 'ielts']
          : ['daily', 'work'],
    zh,
    en,
    ipa,
    collocations: collocations.split(';'),
    example,
    translation,
    usage,
    contrast,
    scene,
    domain,
    source: domain === 'academic' ? 'awl' : 'original',
    question: {
      prompt: `在这个例句中，${term} 表示什么？`,
      options: [zh, '无需证据即可保证结果', '与当前任务无关的个人信息'],
      answer: zh,
      why: contrast,
    },
  }),
);
export const wordId = (term: string) =>
  term.toLowerCase() === 'check-in'
    ? 'brief-check-in'
    : term
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
const lifeEntries: KnowledgeEntry[] = [...lifeJourneys, officeLab].flatMap((j) =>
  j.stages.flatMap((s) => [
    ...s.words.map(
      ([term, zh, en, example, translation, collocations]): KnowledgeEntry => ({
        id: wordId(term),
        term,
        zh,
        en,
        example,
        translation,
        collocations: collocations.split(';'),
        aliases: [],
        kind: term.includes(' ') ? 'phrase' : 'word',
        level: j.id === 'office-day' ? 'B2' : 'B1',
        tags: ['生活过程', j.title],
        goals: j.id === 'office-day' ? ['work', 'business'] : ['daily', 'work'],
        ipa: '',
        usage: `${s.title}：${en}。`,
        contrast: '按当前情境理解；简单的同义表达也可以准确传达意思。',
        scene: j.id,
        domain: 'daily',
        source: 'original',
        question: {
          prompt: `在这个场景中，${term} 表示什么？`,
          options: [
            zh,
            ...s.words
              .filter((w) => w[0] !== term)
              .slice(0, 2)
              .map((w) => w[1]),
          ],
          answer: zh,
          why: translation,
        },
      }),
    ),
    ...s.expressions.map(
      ([term, zh, explanation]): KnowledgeEntry => ({
        id: wordId(term),
        term,
        zh,
        en: 'An expression used to carry out the communication task shown in the example.',
        example: term,
        translation: zh,
        collocations: s.words.slice(0, 2).map((w) => w[0]),
        aliases: [],
        kind: 'phrase',
        level: 'B1',
        tags: ['真实表达', j.title],
        goals: j.id === 'office-day' ? ['work', 'business'] : ['daily', 'work'],
        ipa: '',
        usage: explanation,
        contrast: explanation,
        scene: j.id,
        domain: 'daily',
        source: 'original',
        question: {
          prompt: `这句话在${s.title}中想表达什么？`,
          options: [
            zh,
            ...s.expressions.filter((e) => e[0] !== term).map((e) => e[1]),
            '拒绝参与当前活动',
          ],
          answer: zh,
          why: explanation,
        },
      }),
    ),
  ]),
);
const legacyEntries: KnowledgeEntry[] = [
  ...adultVocabulary.map(
    ([term, zh, en, example, translation, collocations]): KnowledgeEntry => ({
      id: wordId(term),
      term,
      zh,
      en,
      example,
      translation,
      collocations: collocations.split(';'),
      aliases: [],
      kind: term.includes(' ') ? 'phrase' : 'word',
      level: 'B2',
      tags: ['职场与社交'],
      goals: ['business', 'work'],
      ipa: '',
      usage: en,
      contrast: '依据场景事实使用，不为了复杂措辞增加未经核实的信息。',
      scene:
        communicationScenes.find((s) => s.vocabulary.some((v) => v.en === term))?.id || 'meeting',
      domain: 'business',
      source: 'original',
      question: {
        prompt: `这里的 ${term} 表示什么？`,
        options: [zh, '去机场办理登机', '选择水果的成熟程度'],
        answer: zh,
        why: translation,
      },
    }),
  ),
  ...communicationScenes.flatMap((s) =>
    s.expressions.slice(0, 2).map((e) => ({
      id: wordId(e.natural),
      term: e.natural,
      zh: adultTranslations[e.natural] || e.usage,
      en: 'An expression used for the situation described in the usage note.',
      example: e.natural,
      translation: adultTranslations[e.natural] || e.usage,
      collocations: s.vocabulary.map((v) => v.en),
      aliases: [],
      kind: 'phrase' as const,
      level: 'B2' as const,
      tags: [s.title, '自然表达'],
      goals: ['work', 'business'] as LearningGoal[],
      ipa: '',
      usage: e.usage,
      contrast: e.explanation,
      scene: s.id,
      domain: 'business' as const,
      source: 'original',
      question: {
        prompt: '这句表达想传递什么？',
        options: [adultTranslations[e.natural] || e.usage, '要求购买一张机票', '询问水果价格'],
        answer: adultTranslations[e.natural] || e.usage,
        why: e.explanation,
      },
    })),
  ),
];
const basicEntries: KnowledgeEntry[] = [
  ...Object.entries(beginnerVocabulary).flatMap(([scene, words]) =>
    words.map(
      ([term, zh, en, example, translation, collocations]): KnowledgeEntry => ({
        id: wordId(term),
        term,
        zh,
        en,
        example,
        translation,
        collocations: collocations.split(';'),
        aliases: [],
        kind: term.includes(' ') ? 'phrase' : 'word',
        level: 'A1',
        tags: ['入门', scene],
        goals: ['daily', 'work'],
        ipa: '',
        usage: translation,
        contrast: '基础表达可以自然且准确；需结合上下文使用。',
        scene,
        domain: 'daily',
        source: 'original',
        question: {
          prompt: `这里的 ${term} 表示什么？`,
          options: [
            zh,
            ...words
              .filter((w) => w[0] !== term)
              .slice(0, 2)
              .map((w) => w[1]),
          ],
          answer: zh,
          why: translation,
        },
      }),
    ),
  ),
  ...basicExpressions.map((e) => ({
    id: wordId(e.en),
    term: e.en,
    zh: e.zh,
    en: 'A basic expression with the meaning shown by its Chinese explanation.',
    example: e.en,
    translation: e.zh,
    collocations: [],
    aliases: [],
    kind: 'phrase' as const,
    level: 'A1' as const,
    tags: ['入门表达'],
    goals: ['daily', 'work'] as LearningGoal[],
    ipa: '',
    usage: e.zh,
    contrast: '简单表达同样可以完成任务。',
    scene: 'greeting',
    domain: 'daily' as const,
    source: 'original',
    question: {
      prompt: '这句表达是什么意思？',
      options: [
        e.zh,
        ...basicExpressions
          .filter((x) => x.zh !== e.zh)
          .slice(0, 2)
          .map((x) => x.zh),
      ],
      answer: e.zh,
      why: e.zh,
    },
  })),
];
export const knowledgeEntries: KnowledgeEntry[] = [
  ...new Map(
    [...coreKnowledgeEntries, ...lifeEntries, ...legacyEntries, ...basicEntries].map((e) => [
      e.id,
      e,
    ]),
  ).values(),
].map((e) => coreKnowledgeEntries.find((c) => c.id === e.id) || e);
export function lookupKnowledge(text: string) {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]+$/, '');
  return knowledgeEntries.find(
    (e) =>
      e.term.toLowerCase().replace(/[.,!?;:]+$/, '') === normalized ||
      e.aliases.includes(normalized),
  );
}
export function relatedKnowledge(text: string) {
  const lowered = text.toLowerCase();
  return knowledgeEntries.filter((e) =>
    [e.term, ...e.aliases].some((t) =>
      new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lowered),
    ),
  );
}
