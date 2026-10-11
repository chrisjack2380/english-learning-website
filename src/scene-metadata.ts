import type { SceneMetadata } from './scene-schema';

/** Original scenes remain stable IDs so existing progress and backups still work. */
export const originalMetadata: Record<string, SceneMetadata> = {
  meeting: {
    category: 'workplace',
    levels: ['B1', 'B2', 'C1'],
    location: '美国产品团队会议室',
    roles: [{ name: 'Maya', job: '项目负责人', relationship: '同事；你负责提出风险及行动方案' }],
    vocabulary: [
      { en: 'phased rollout', zh: '分阶段发布' },
      { en: 'trade-off', zh: '权衡' },
      { en: 'checkpoint', zh: '进度检查节点' },
    ],
    grammar: ['情态动词 could / might 限定承诺', 'while 对比收益与成本', '条件句说明发布前提'],
    culture: ['承认对方观点不等于同意结论。', '会议结束明确负责人及节点，不能只说以后再谈。'],
    difficulty: {
      b2: '有理由地提出异议、回应反对并约定行动',
      c1: '区分证据与假设，协商权衡及条件',
    },
    practice: ['听力意图', '语域比较', '四轮自主输出', '行动总结'],
    evaluation: [
      '是否说明具体风险',
      '是否提出替代方案',
      '是否回应对方顾虑',
      '是否明确负责人和时间',
    ],
    environment: {
      kind: 'office',
      name: '职场会议室',
      heading: 'TUESDAY · LAUNCH PLANNING',
      objects: ['Validation', 'Pilot', 'Checkpoint'],
      stages: ['Raise a concern', 'Suggest a pilot', 'Handle pushback', 'Confirm ownership'],
    },
    c1Question: {
      prompt: '同事说 Friday might be a bit ambitious. 此处更可能是什么意图？',
      options: ['委婉质疑时间表，应核对未完成的验证工作', '已经保证周五上线', '只在夸奖你有雄心'],
      answer: '委婉质疑时间表，应核对未完成的验证工作',
      explanation: '结合未完成测试，ambitious 在这里是缓和的质疑；不能脱离上下文推断。',
    },
  },
  smalltalk: {
    category: 'social',
    levels: ['B1', 'B2', 'C1'],
    location: '波特兰朋友的屋顶聚会',
    roles: [{ name: 'Jordan', job: '刚搬来的新朋友', relationship: '初次认识；尊重私人边界' }],
    vocabulary: [
      { en: 'find my feet', zh: '逐渐适应' },
      { en: 'go-to', zh: '常选的' },
      { en: 'mingle', zh: '与聚会中的人交流' },
    ],
    grammar: ['现在完成时分享体验', '开放式问题延续对话', 'would / could 给邀请留出余地'],
    culture: [
      '邀请意向不等于确定安排。',
      '先分享自己的细节再追问，避免连续采访；收入等私事需尊重边界。',
    ],
    difficulty: {
      b2: '分享细节、接住话题、协商邀请及自然收尾',
      c1: '根据上下文判断暗示并控制深入程度',
    },
    practice: ['听力意图', '兴趣追问', '边界与语气', '四轮自主输出'],
    evaluation: ['是否接住上一话题', '是否双向分享', '是否保留协商空间', '是否尊重结束信号'],
    environment: {
      kind: 'lounge',
      name: '屋顶聚会',
      heading: 'WEEKEND AT THE ROOFTOP',
      objects: ['Market', 'Trails', 'Coffee'],
      stages: ['Connect', 'Follow up', 'Make plans', 'Wrap up'],
    },
    c1Question: {
      prompt: '对方说 We should grab coffee sometime. 你能可靠判断什么？',
      options: ['表达友好意向，仍需协商具体时间', '已经定好周六见面', '一定不想与你见面'],
      answer: '表达友好意向，仍需协商具体时间',
      explanation: 'sometime 没有约定具体时间，不能据此保证邀约或断言对方无兴趣。',
    },
  },
  pitch: {
    category: 'business',
    levels: ['B1', 'B2', 'C1'],
    location: '美国客户的产品演示室',
    roles: [{ name: 'Alex', job: '运营经理', relationship: '潜在客户；你介绍方案并核对需求' }],
    vocabulary: [
      { en: 'workflow', zh: '工作流程' },
      { en: 'limited pilot', zh: '有限范围试用' },
      { en: 'commit', zh: '作出承诺' },
    ],
    grammar: ['so 解释功能与收益的联系', 'would 限定预期结果', 'before + 动名词表达评估顺序'],
    culture: ['可信的具体说明优于空泛赞美。', '询问产品适配不代表同意购买；不能编造 ROI 或功能。'],
    difficulty: { b2: '需求—收益—限制—试用的完整介绍', c1: '回应质疑，区分已验证事实和预期价值' },
    practice: ['听力需求识别', '表达分析', '四轮产品任务', '试用方案'],
    evaluation: ['是否先确认需求', '是否用事实解释价值', '是否坦诚限制', '是否约定可评估的下一步'],
    environment: {
      kind: 'demo',
      name: '产品演示室',
      heading: 'FLOWBOARD · TEAM WORKSPACE',
      objects: ['Tasks', 'In progress', 'Review'],
      stages: ['Discover', 'Explain value', 'Address concerns', 'Agree next steps'],
    },
    c1Question: {
      prompt: '客户说 Interesting, but how would it fit our workflow? 你该如何回应？',
      options: [
        '了解具体流程与适配要求，避免虚构集成承诺',
        '视为已成交，直接发账单',
        '保证支持所有工具',
      ],
      answer: '了解具体流程与适配要求，避免虚构集成承诺',
      explanation: '客户正在核对适配，尚未成交。',
    },
  },
};
