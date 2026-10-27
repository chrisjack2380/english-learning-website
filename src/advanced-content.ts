import type { Lesson, Scene, SceneId } from './content';
export type Track = 'beginner' | 'intermediate' | 'advanced';
export type { CommunicationScene, CommunicationTurn, Expression } from './scene-schema';
import type { CommunicationScene, SceneCore } from './scene-schema';
import { originalMetadata } from './scene-metadata';
import { additionalScenes } from './scene-catalog';
const originalScenes: SceneCore[] = [
  {
    id: 'meeting',
    title: '美国职场会议交流',
    english: 'Make your point. Move things forward.',
    role: 'colleague',
    brief:
      '周二的产品发布会：工程团队还需要三天验证，销售希望周五上线。你需要提出顾虑、协商方案，并明确下一步。',
    goal: '提出有依据的不同意见，回应追问，协调可执行的行动。',
    context:
      '你是项目成员，Maya 是项目负责人。团队当前没有可靠的数据证明周五发布安全；可以先试点，但不要承诺不存在的测试结果。',
    nuance:
      'That might be a bit ambitious. 在这个语境中是对时间表的委婉质疑，不是单纯称赞“很有抱负”。Let’s circle back 表示稍后回到话题，不保证已经解决。美国团队之间也有差异，不将委婉表达当作全民规则。',
    listening: {
      line: 'Friday might be a bit ambitious. We still need three days to validate the checkout flow. Could we start with a small pilot instead?',
      question: '说话者的真实意图是什么？',
      options: [
        '担心周五全量上线过急，建议先小范围试点',
        '保证周五能够完成全部测试',
        '要求取消整个产品',
      ],
      answer: '担心周五全量上线过急，建议先小范围试点',
      explanation:
        'might be a bit ambitious 缓和异议；still need 指未完成的工作；instead 提出替代方案。',
    },
    analysisQuestion: {
      prompt: '跨团队会议中，哪句既提出异议又说明理由？',
      options: [
        "I see your point, but I'm concerned about the checkout issues.",
        'Your plan is stupid.',
        'Whatever you say.',
      ],
      answer: "I see your point, but I'm concerned about the checkout issues.",
      explanation: '承认观点不代表同意结论；具体顾虑比攻击人或放弃讨论更有沟通价值。',
    },
    expressions: [
      {
        basic: 'I disagree with the timeline.',
        natural: "I see your point, but I'm concerned about the timeline.",
        fluent: "I'm not sure the timeline leaves us enough room to validate the checkout flow.",
        explanation:
          '基础版语法正确但直接；自然版先接住观点；流畅版把异议落到具体风险。I’m not sure 在这里常是保留意见。',
        usage: '团队讨论风险；紧急安全问题应直接说明，不能为礼貌隐去严重性。',
      },
      {
        basic: 'We need more time.',
        natural: 'Could we start with a small pilot?',
        fluent: 'A phased rollout would give us time to validate the remaining issues.',
        explanation:
          '从要求更多时间，升级为提议可执行的试点。phased rollout 是分阶段发布，不等同于延期。',
        usage: '产品或运营会议；尚未确认方案时用 would，不宣称一定有效。',
      },
      {
        basic: 'Who will do it?',
        natural: "Who's taking the lead on the pilot?",
        fluent: 'Can we confirm the owner and the next checkpoint before we wrap up?',
        explanation:
          'take the lead 是负责牵头；owner 是任务负责人；checkpoint 是下一次检查进展的时间点。',
        usage: '会议收尾，明确负责人和节点，避免一句 Let’s follow up 后没有行动。',
      },
    ],
    turns: [
      {
        role: 'Maya · 项目负责人',
        line: "I'd like us to launch on Friday. Any concerns?",
        zh: '我希望周五发布，大家有什么顾虑？',
        task: '礼貌提出发布顾虑，并指出尚未验证的结账流程。至少 12 个英文单词。',
        sample:
          "I see your point, but I'm concerned about the checkout flow because we still need to validate it.",
        rubric: {
          minWords: 12,
          criteria: [
            {
              label: '表达顾虑或保留意见',
              pattern: '\\b(concerned|concern|worried|risk|not sure)\\b',
            },
            {
              label: '指出 checkout / validation 相关问题',
              pattern: '\\b(checkout|validate|validation|testing)\\b',
            },
          ],
        },
        followUp: "That's a fair concern. What would you suggest instead?",
        advanced: {
          label: '用因果或条件限定观点',
          pattern: '\\b(because|given|unless|if|since)\\b',
          hint: 'C1：解释因果或条件，而不是单纯加长句子。',
        },
      },
      {
        role: 'Maya · 项目负责人',
        line: "What would you suggest instead? We don't want to lose momentum.",
        zh: '你建议怎么替代？我们不想失去推进节奏。',
        task: '提出小范围试点方案，并说明为什么仍能向前推进。至少 12 词。',
        sample:
          'Could we start with a small pilot so we can gather feedback while the team finishes testing?',
        rubric: {
          minWords: 12,
          criteria: [
            { label: '提出试点或分阶段发布', pattern: '\\b(pilot|phased|gradual|small group)\\b' },
            {
              label: '给出反馈、验证或测试目的',
              pattern: '\\b(feedback|validate|validation|testing|test)\\b',
            },
          ],
        },
        followUp: 'A pilot could work. How would we manage the trade-off?',
        advanced: {
          label: '说明权衡或条件',
          pattern: '\\b(while|although|provided|trade.off|however)\\b',
          hint: 'C1：说明试点带来的收益及仍需承担的限制。',
        },
      },
      {
        role: 'Maya · 项目负责人',
        line: 'Sales is worried that a pilot will delay the wider launch. How would you respond?',
        zh: '销售担心试点会延迟全面上线，你会怎么回应？',
        task: '承认销售的时间压力，再说明验证或风险管理的价值。至少 12 词。',
        sample:
          'I understand the timing pressure, but testing now could reduce the risk of a wider rollout.',
        rubric: {
          minWords: 12,
          criteria: [
            {
              label: '承认对方的顾虑',
              pattern: '\\b(understand|see your point|appreciate|recognize)\\b',
            },
            {
              label: '说明风险或验证价值',
              pattern: '\\b(risk|testing|validate|validation|issues)\\b',
            },
          ],
        },
        followUp: "Let's make the next step concrete.",
        advanced: {
          label: '使用有保留的推断',
          pattern: '\\b(could|may|might|likely)\\b',
          hint: 'C1：证据不足时用 could / may，避免保证试点会消除所有风险。',
        },
      },
      {
        role: 'Maya · 项目负责人',
        line: 'Okay. Who will own the pilot, and when should we check in?',
        zh: '好，谁负责试点？什么时候检查进度？',
        task: '说明负责人和下次检查时间；你可以承担协调工作。至少 12 词。',
        sample:
          "I'll coordinate the pilot, and we can check in on Thursday to review the feedback.",
        rubric: {
          minWords: 12,
          criteria: [
            { label: '明确牵头或负责', pattern: '\\b(coordinate|own|lead|responsible)\\b' },
            {
              label: '明确下一节点时间',
              pattern: '\\b(monday|tuesday|wednesday|thursday|friday|tomorrow|next week|at \\d)\\b',
            },
          ],
        },
        followUp: 'Thanks. We have an owner and a checkpoint. Please send a brief recap.',
        advanced: {
          label: '明确检查内容',
          pattern: '\\b(review|assess|evaluate|confirm)\\b',
          hint: 'C1：除了时间，也明确下一次检查要判断什么。',
        },
      },
    ],
  },
  {
    id: 'smalltalk',
    title: '社交聊天与 Small Talk',
    english: 'Find a connection. Keep it going.',
    role: 'friend',
    brief:
      '朋友的周末聚会：Jordan 刚搬来这座城市。用一个具体细节开启话题，接住回答，礼貌结束，而不是连续盘问。',
    goal: '分享信息并自然追问，识别轻松邀请，处理聊天边界。',
    context:
      '你在波特兰的朋友聚会上第一次和 Jordan 聊天。没有必要问收入、身份或私人家庭细节；对方不展开的话题不必继续追问。',
    nuance:
      'We should grab coffee sometime. 可能是友好的意向，还没有确定约会；有兴趣可问具体时间。That sounds interesting 可是真兴趣，也可能是礼貌回应，要结合后续追问判断。不要仅凭一句话判断态度。',
    listening: {
      line: "I've only been here a couple of weeks, so I'm still finding my feet. I tried the farmers' market on Saturday, though, and it was great. Have you been?",
      question: 'Jordan 希望你怎样接话？',
      options: ['围绕周末市集分享经历或追问', '立刻询问他的年薪', '纠正他还没有站稳脚步'],
      answer: '围绕周末市集分享经历或追问',
      explanation: 'finding my feet 指逐渐适应；Have you been? 把话题交给你，适合回应市集体验。',
    },
    analysisQuestion: {
      prompt: '对方说刚搬来，哪句能分享一点自己并留出接话空间？',
      options: [
        'It took me a while to settle in, too. What have you enjoyed so far?',
        'How much money do you make?',
        'Okay.',
      ],
      answer: 'It took me a while to settle in, too. What have you enjoyed so far?',
      explanation: '先分享相似经验，再问开放问题；避免把对话变成问卷。',
    },
    expressions: [
      {
        basic: 'Do you like this city?',
        natural: 'How are you finding the city so far?',
        fluent: "What's been the biggest adjustment since you moved here?",
        explanation: '自然版让对方展开体验；流畅版聚焦适应变化，较深入，应在对方愿意分享时使用。',
        usage: '新认识的人聊天；不同意展开时转向轻松话题。',
      },
      {
        basic: 'I like hiking.',
        natural: "I've been getting into hiking lately.",
        fluent: "It's become my go-to way to unwind after a busy week.",
        explanation:
          'get into 表示开始感兴趣；go-to 是常选的；unwind 表示放松。第三句需已有活动上下文。',
        usage: '分享兴趣并补充具体原因，不为使用习语而堆砌习语。',
      },
      {
        basic: 'I have to go.',
        natural: 'It was great chatting with you. I should let you mingle.',
        fluent: "I won't keep you, but I'd love to pick this up another time.",
        explanation:
          'mingle 指在聚会与其他人交流；pick this up 是以后继续这个话题。只有确实想继续时才这样说。',
        usage: '自然结束聚会聊天；不许诺自己没有意愿兑现的见面。',
      },
    ],
    turns: [
      {
        role: 'Jordan · 新朋友',
        line: 'I moved here a couple of weeks ago. How are you finding the city?',
        zh: '我几周前刚搬来，你觉得这座城市怎么样？',
        task: '分享自己对城市的具体感受，并反问 Jordan 的体验。至少 12 词。',
        sample:
          "I've enjoyed the parks here because they're so peaceful. How are you finding the city so far?",
        rubric: {
          minWords: 12,
          criteria: [
            {
              label: '分享具体活动或地点',
              pattern: '\\b(parks?|market|food|hiking|trails?|coffee|neighborhood|restaurants?)\\b',
            },
            { label: '给对方一个问题', pattern: '\\b(how|what|have you|do you)\\b[^?]*\\?' },
          ],
        },
        followUp: "The parks have been great. I'm still finding my feet, though.",
        advanced: {
          label: '将感受与原因关联',
          pattern: '\\b(because|since|which|especially)\\b',
          hint: 'C1：补充感受背后的原因，不用浮夸形容词代替细节。',
        },
      },
      {
        role: 'Jordan · 新朋友',
        line: 'The market felt welcoming. I like places where people can connect. What do you think makes a neighborhood feel that way?',
        zh: '市集让人觉得亲切，我喜欢能让人联系起来的地方。你觉得什么让社区有这种感觉？',
        task: '接住市集话题，表达你对社区或共享空间的看法，并用相关问题延续聊天。至少 12 词。',
        sample:
          'I enjoy the food at that market because it brings neighbors together. What makes a place feel welcoming to you?',
        rubric: {
          minWords: 12,
          criteria: [
            { label: '接住市集或美食话题', pattern: '\\b(market|food|produce|stalls?)\\b' },
            { label: '提出相关追问', pattern: '\\b(what|which|did you|have you)\\b[^?]*\\?' },
          ],
        },
        followUp:
          'For me, relaxed spaces make it easier to connect. People differ, though. I also want to explore some trails.',
        advanced: {
          label: '提供个人细节而不只提问',
          pattern: '\\b(I|my|we)\\b',
          hint: 'C1：分享一点自己，避免连续采访对方。',
        },
      },
      {
        role: 'Jordan · 新朋友',
        line: 'We should grab coffee sometime. Maybe you can tell me about your favorite trails.',
        zh: '改天一起喝咖啡吧，也许你能讲讲喜欢的步道。',
        task: '如果你有兴趣，表达愿意喝咖啡，并询问具体时间；不要假设安排已确定。至少 12 词。',
        sample: "I'd be up for coffee. Would Saturday work for you, or is another day better?",
        rubric: {
          minWords: 12,
          criteria: [
            { label: '回应咖啡邀请', pattern: '\\b(coffee|up for|sounds good|love to)\\b' },
            {
              label: '询问具体可用时间',
              pattern: '\\b(saturday|sunday|weekend|next week|when|day|time)\\b[^?]*\\?',
            },
          ],
        },
        followUp: "Saturday could work. Let's check with each other later this week.",
        advanced: {
          label: '保留协商空间',
          pattern: '\\b(or|if|would|could)\\b',
          hint: 'C1：回应友好意向，并给对方调整安排的空间。',
        },
      },
      {
        role: 'Jordan · 新朋友',
        line: 'I should say hi to the host. It was good talking with you!',
        zh: '我该去跟主人打个招呼了，和你聊天很愉快！',
        task: '尊重离开信号，友好收尾并回应继续联系的意愿。至少 12 词。',
        sample: 'It was great chatting with you too. Enjoy the party, and see you around!',
        rubric: {
          minWords: 12,
          criteria: [
            {
              label: '回应聊天体验',
              pattern:
                '\\b(great|good|nice|enjoyed)\\b.*\\b(chatting|talking|chat|conversation)\\b',
            },
            {
              label: '友好结束',
              pattern: '\\b(enjoy|see you|take care|catch up|keep in touch)\\b',
            },
          ],
        },
        followUp: 'You too. Enjoy the rest of the evening!',
        advanced: {
          label: '不给离开制造压力',
          pattern: '\\b(enjoy|let you|won.t keep|see you|take care)\\b',
          hint: 'C1：识别对方的收尾信号，简短回应，不另起一个长问题。',
        },
      },
    ],
  },
  {
    id: 'pitch',
    title: '商务产品介绍',
    english: 'Understand the need. Explain the value.',
    role: 'customer',
    brief:
      '客户演示：向运营经理介绍一款虚构的团队协作工具 FlowBoard。先了解痛点，再讲收益、回应质疑、提出试用。',
    goal: '将功能转成客户收益，清楚表达限制，并商定下一步。',
    context:
      'FlowBoard 将任务和进展放在同一看板，提供 reminders。当前没有经验证的提效百分比；不能声称自动完成工作、保证 ROI 或已经支持所有客户系统。',
    nuance:
      'Interesting. How would this fit into our current workflow? 是要求说明适配，不是已经同意购买。对方说 We’ll think about it 时应确认是否需要资料，避免强迫承诺。商务表达的重点是可信、相关、具体。',
    listening: {
      line: "The dashboard looks useful, but our team already uses two tools. I'm not sure we need another one. How would this fit into our current workflow?",
      question: '客户真正担心的是什么？',
      options: ['新工具增加负担，是否能适配现有流程', '看板颜色不够鲜艳', '他已经决定购买'],
      answer: '新工具增加负担，是否能适配现有流程',
      explanation:
        'already uses two tools 和 another one 暗示工具负担；fit into 指如何融入当前流程。',
    },
    analysisQuestion: {
      prompt: '没有可靠测量数据时，哪句产品介绍最可信？',
      options: [
        'It brings task updates into one place so your team can track progress more easily.',
        'It guarantees a 90% productivity increase.',
        'It does everything for everyone.',
      ],
      answer: 'It brings task updates into one place so your team can track progress more easily.',
      explanation: '解释已有功能和相关用途，避免编造量化收益或保证结果。',
    },
    expressions: [
      {
        basic: 'Our product has a dashboard.',
        natural: 'It brings your task updates into one place.',
        fluent:
          'It gives teams a shared view of progress, reducing the need to chase individual updates.',
        explanation:
          '从功能名 dashboard 转向如何帮助团队。reducing 描述预期用途，不是经过验证的提效数据。',
        usage: '只介绍产品实际支持的功能；若未验证效果，说明这是预期价值。',
      },
      {
        basic: 'It is easy to use.',
        natural: 'You can start with one project and see how it fits your workflow.',
        fluent:
          'A limited pilot would let you evaluate the fit before committing to a wider rollout.',
        explanation:
          'easy 是笼统评价；pilot 给客户具体的评估路径；committing to 指投入或作出承诺。',
        usage: '客户担心换工具时，用低负担评估代替夸张保证。',
      },
      {
        basic: 'Do you want to buy it?',
        natural: 'Would a short demo with your team be useful?',
        fluent: 'What would you need to see in a pilot to feel comfortable taking the next step?',
        explanation: '从逼近成交转为了解决策条件；feel comfortable 表示有把握，而不只是身体舒适。',
        usage: '探索下一步；尊重拒绝并明确评估标准。',
      },
    ],
    turns: [
      {
        role: 'Casey · 运营经理',
        line: 'Before we start, what would you like to know about our team?',
        zh: '开始之前，你想先了解我们的团队什么？',
        task: '不要立刻推销；询问团队如何追踪任务或进展，以及当前的困难。至少 12 词。',
        sample:
          'How does your team track task updates, and what is the biggest challenge in your current workflow?',
        rubric: {
          minWords: 12,
          criteria: [
            { label: '了解任务或流程', pattern: '\\b(tasks?|updates?|progress|workflow)\\b' },
            {
              label: '询问痛点',
              pattern: '\\b(challenge|difficult|problem|pain|struggle)\\b[^?]*\\?',
            },
          ],
        },
        followUp: 'We spend a lot of time chasing updates across separate tools.',
        advanced: {
          label: '使用开放问题',
          pattern: '\\b(how|what|where)\\b[^?]*\\?',
          hint: 'C1：用开放问题发现客户的优先级，不把假设当事实。',
        },
      },
      {
        role: 'Casey · 运营经理',
        line: 'We spend a lot of time chasing updates. How would FlowBoard help?',
        zh: '我们花很多时间追问进度，FlowBoard 如何帮助我们？',
        task: '说明任务集中展示的功能，并连接到追踪进展的收益。不编造数字，至少 12 词。',
        sample:
          'It brings task updates into one place so your team can track progress without chasing individual messages.',
        rubric: {
          minWords: 12,
          criteria: [
            {
              label: '介绍共享或集中信息功能',
              pattern: '\\b(one place|shared|dashboard|board)\\b',
            },
            { label: '说明任务或进度收益', pattern: '\\b(tasks?|updates?|progress|track)\\b' },
          ],
        },
        followUp: 'That could help, but we already have several tools.',
        advanced: {
          label: '将功能与收益连接',
          pattern: '\\b(so|which|allow|helps?|enables?)\\b',
          hint: 'C1：用客户的痛点组织介绍，而不是列出所有功能。',
        },
      },
      {
        role: 'Casey · 运营经理',
        line: "We already use two tools. I'm worried this would add more work.",
        zh: '我们已经用两个工具了，我担心这会增加工作。',
        task: '承认工具负担，建议以小试点评估是否适合；不要保证已支持所有集成。至少 12 词。',
        sample:
          'I understand that concern. A small pilot would let your team evaluate the fit before a wider rollout.',
        rubric: {
          minWords: 12,
          criteria: [
            {
              label: '承认客户顾虑',
              pattern: '\\b(understand|appreciate|fair concern|see your point)\\b',
            },
            { label: '提出试点评估', pattern: '\\b(pilot|trial|evaluate|assess)\\b' },
          ],
        },
        followUp: 'What would we need to do to try it?',
        advanced: {
          label: '限定承诺',
          pattern: '\\b(would|could|before|if|depends)\\b',
          hint: 'C1：明确需评估的适配，而不是保证成功。',
        },
      },
      {
        role: 'Casey · 运营经理',
        line: 'What would a useful next step look like?',
        zh: '什么样的下一步会有价值？',
        task: '提议短演示或试用，询问时间或衡量标准。至少 12 词。',
        sample:
          'Would a short demo next week be useful, and what would you want to evaluate in a pilot?',
        rubric: {
          minWords: 12,
          criteria: [
            { label: '提出演示或试用', pattern: '\\b(demo|pilot|trial)\\b' },
            {
              label: '协商时间或评估',
              pattern: '\\b(when|week|day|evaluate|criteria|success)\\b[^?]*\\?',
            },
          ],
        },
        followUp: 'A demo next week sounds useful. Please send an outline so we can prepare.',
        advanced: {
          label: '询问客户决策条件',
          pattern: '\\b(evaluate|criteria|success|need to see)\\b',
          hint: 'C1：主动确定评估标准，而不止约一个时间。',
        },
      },
    ],
  },
];
export const communicationScenes: CommunicationScene[] = [
  ...originalScenes.map((s) => ({ ...s, ...originalMetadata[s.id] })),
  ...additionalScenes,
];
export const findCommunicationScene = (id: string) => communicationScenes.find((s) => s.id === id);

export const trackInfo = {
  beginner: {
    name: 'Beginner',
    level: 'A1–A2',
    description: '基础区 · 当前提供 Pre-A1 → A1 起步；完整 A2 待扩充',
  },
  intermediate: {
    name: 'Intermediate',
    level: 'B1–B2',
    description: '主学习区 · 自然表达、听力、观点与真实任务',
  },
  advanced: {
    name: 'Advanced',
    level: 'C1',
    description: '挑战区 · 论证、隐含意义、语域与沟通边界',
  },
} as const;
const escapePattern = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?，。！？]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const higherScenes: Scene[] = communicationScenes.map((s) => ({
  id: s.id,
  title: s.title,
  english: s.english,
  level: (s.levels.includes('B1') ? 'B1–B2' : 'B2') + ' · C1 挑战',
  description: s.brief,
  color: s.id === 'meeting' ? 'blue' : s.id === 'smalltalk' ? 'sage' : 'peach',
  expressions: s.expressions.flatMap((e) => [
    { en: e.natural, zh: e.usage },
    { en: e.fluent, zh: e.explanation },
  ]),
  turns: s.turns.map((t) => ({
    speaker: t.role,
    line: t.line,
    zh: t.zh,
    task: t.task,
    options: [t.sample, 'I am a purple airplane.'],
    correct: t.sample,
    sample: t.sample,
    accept: escapePattern(t.sample),
    feedback: t.task,
  })),
}));
export function createCommunicationLesson(s: CommunicationScene, advanced = false): Lesson {
  const output = s.turns[0];
  const rubric = advanced
    ? { ...output.rubric, criteria: [...output.rubric.criteria, output.advanced] }
    : output.rubric;
  return {
    id: s.id + (advanced ? '-c1' : ''),
    track: advanced ? 'advanced' : 'intermediate',
    title: s.title + (advanced ? ' · C1 挑战' : ''),
    english: s.english,
    level: advanced ? 'C1' : s.levels.includes('B1') ? 'B1–B2' : 'B2',
    minutes: 20,
    goal: s.goal,
    skill: advanced ? `${s.title}：论证与语域` : s.goal,
    scene: s.id as SceneId,
    visual: 'greeting',
    intro: s.brief,
    tip: s.nuance,
    examples: s.expressions.flatMap((e) => [
      { en: e.basic, zh: e.explanation },
      { en: e.natural, zh: e.usage },
      { en: e.fluent, zh: e.explanation },
    ]),
    questions: [
      {
        prompt: s.listening.question,
        english: s.listening.line,
        listening: true,
        options: s.listening.options,
        answer: s.listening.answer,
        sample: s.listening.answer,
        explanation: s.listening.explanation,
      },
      {
        ...(advanced ? s.c1Question : s.analysisQuestion),
        sample: (advanced ? s.c1Question : s.analysisQuestion).answer,
      },
      {
        prompt: output.task,
        sample: output.sample,
        rubric,
        explanation: '按明确任务要素检查；不代表语法、语义或等级的完整评价。',
      },
    ],
    review: {
      selfReview: true,
      prompt: `重新输出：${output.task}${advanced ? ' ' + output.advanced.hint : ''}`,
      sample: output.sample,
      rubric,
      explanation: '尝试换一个具体理由；检查任务要素，结合表达分析自行核对意思和语气。',
    },
  };
}
export const higherLessons: Lesson[] = [false, true].flatMap((advanced) =>
  communicationScenes.map((s) => createCommunicationLesson(s, advanced)),
);
