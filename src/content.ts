export type SceneId = 'greeting' | 'cafe' | 'directions';
export type Question = {
  prompt: string;
  english?: string;
  listening?: boolean;
  options?: string[];
  answer?: string;
  accept?: string;
  sample: string;
  explanation: string;
};
export type Lesson = {
  id: string;
  title: string;
  english: string;
  level: string;
  minutes: number;
  goal: string;
  skill: string;
  scene: SceneId;
  visual: 'greeting' | 'pronouns' | 'plural' | 'order' | 'position' | 'direction';
  intro: string;
  tip: string;
  examples: { en: string; zh: string }[];
  questions: Question[];
  review: Question;
};
export type Turn = {
  speaker: string;
  line: string;
  zh: string;
  task: string;
  options: string[];
  correct: string;
  accept: string;
  sample: string;
  feedback: string;
};
export type Scene = {
  id: SceneId;
  title: string;
  english: string;
  level: string;
  description: string;
  color: string;
  expressions: { en: string; zh: string }[];
  turns: Turn[];
};

export const lessons: Lesson[] = [
  {
    id: 'hello',
    title: '从一句 Hello 开始',
    english: 'Hello, world',
    level: 'Pre-A1',
    minutes: 8,
    goal: '主动打招呼，回应问候，并礼貌结束对话。',
    skill: '问候与回应',
    scene: 'greeting',
    visual: 'greeting',
    intro: '第一次见面，简单的一句 Hello 就能打开对话。Hi 更随意，Hello 在大多数日常场合都合适。',
    tip: 'Nice to meet you 用于初次见面；回应时可以说 Nice to meet you, too。Goodbye 用于告别。',
    examples: [
      { en: 'Hello!', zh: '你好！' },
      { en: 'Nice to meet you.', zh: '很高兴认识你。' },
      { en: 'Nice to meet you, too.', zh: '我也很高兴认识你。' },
      { en: 'Goodbye!', zh: '再见！' },
    ],
    questions: [
      {
        prompt: '第一次见到邻居，哪一句是打招呼？',
        options: ['Hello!', 'Goodbye!', 'Thank you.'],
        answer: 'Hello!',
        sample: 'Hello!',
        explanation: 'Hello 是问候；Goodbye 是告别，Thank you 表示感谢。',
      },
      {
        prompt: '听一听，对方正在做什么？',
        english: 'Nice to meet you.',
        listening: true,
        options: ['表达初次见面的高兴', '向你告别', '询问价格'],
        answer: '表达初次见面的高兴',
        sample: '表达初次见面的高兴',
        explanation: 'Nice to meet you 是初次见面时的礼貌表达。',
      },
      {
        prompt: '对方说 Nice to meet you. 请用英语回应“我也很高兴认识你”。',
        accept: 'nice to meet you( too)?',
        sample: 'Nice to meet you, too.',
        explanation: '用 Nice to meet you, too. 回应更完整。too 放在句末，表示“也”。',
      },
    ],
    review: {
      prompt: '第一次见面，对方说 Nice to meet you. 你怎样回应？',
      accept: 'nice to meet you( too)?',
      sample: 'Nice to meet you, too.',
      explanation: '回应初次见面的问候，可以加 too 表示“我也一样”。',
    },
  },
  {
    id: 'names',
    title: '介绍你自己',
    english: 'I am, you are',
    level: 'Pre-A1',
    minutes: 10,
    goal: '说出自己的名字，并听懂对方的自我介绍。',
    skill: '自我介绍',
    scene: 'greeting',
    visual: 'pronouns',
    intro: 'I 指说话的人，you 指听话的人。用 I am + 名字介绍自己，I am 在口语中常缩写为 I’m。',
    tip: 'My name is Lin. 与 I’m Lin. 都自然。询问姓名用 What’s your name?；对方的回答不需要逐词翻译。',
    examples: [
      { en: "I'm Lin.", zh: '我是 Lin。' },
      { en: 'My name is Alex.', zh: '我的名字是 Alex。' },
      { en: "What's your name?", zh: '你叫什么名字？' },
      { en: 'You are Alex.', zh: '你是 Alex。' },
    ],
    questions: [
      {
        prompt: '介绍自己的名字，哪一句正确？',
        options: ['I am Lin.', 'I are Lin.', 'You am Lin.'],
        answer: 'I am Lin.',
        sample: 'I am Lin.',
        explanation: 'I 搭配 am，you 搭配 are。',
      },
      {
        prompt: '听一听，说话的人叫什么？',
        english: 'My name is Alex.',
        listening: true,
        options: ['Alex', 'Lin', 'Hello'],
        answer: 'Alex',
        sample: 'Alex',
        explanation: 'My name is 后面的 Alex 就是名字。',
      },
      {
        prompt: '假设你叫 Lin，用英语介绍自己的名字。',
        accept: "(i am|i'm|my name is) lin",
        sample: "I'm Lin.",
        explanation: '可以说 I am Lin.、I’m Lin. 或 My name is Lin.',
      },
    ],
    review: {
      prompt: '假设你叫 Lin，请用一句话介绍自己。',
      accept: "(i am|i'm|my name is) lin",
      sample: "I'm Lin.",
      explanation: '用 I’m + 名字，或者 My name is + 名字。',
    },
  },
  {
    id: 'cups',
    title: '一杯，还是两杯？',
    english: 'One cup, two cups',
    level: 'Pre-A1',
    minutes: 10,
    goal: '理解一到三的数量，以及规则可数名词的单复数。',
    skill: '数量与复数',
    scene: 'cafe',
    visual: 'plural',
    intro:
      'cup 是可数名词。一杯是 one cup，两杯是 two cups，三杯是 three cups。数量超过一时，cup 加 s。',
    tip: '这里练习规则复数，不代表所有名词都加 s。coffee 作为饮品通常不可数；点餐时 a coffee 可表示“一份咖啡”。',
    examples: [
      { en: 'One cup.', zh: '一个杯子。' },
      { en: 'Two cups.', zh: '两个杯子。' },
      { en: 'Three cups.', zh: '三个杯子。' },
      { en: 'Two coffees, please.', zh: '请给我两份咖啡。' },
      { en: 'Thank you.', zh: '谢谢。' },
    ],
    questions: [
      {
        prompt: '桌上有两个杯子，应该说：',
        options: ['Two cups.', 'Two cup.', 'One cups.'],
        answer: 'Two cups.',
        sample: 'Two cups.',
        explanation: '两个杯子用 two cups，cup 加 s。',
      },
      {
        prompt: '听一听，需要几个杯子？',
        english: 'Three cups, please.',
        listening: true,
        options: ['3', '1', '2'],
        answer: '3',
        sample: '3',
        explanation: 'Three 表示三，cups 表示复数杯子。',
      },
      {
        prompt: '用英语写出“三个杯子”。',
        accept: '(three|3) cups',
        sample: 'Three cups.',
        explanation: 'Three 后面需要复数 cups。',
      },
    ],
    review: {
      prompt: '用英语写出“两个杯子”。',
      accept: '(two|2) cups',
      sample: 'Two cups.',
      explanation: 'Two cups，注意 cups 末尾的 s。',
    },
  },
  {
    id: 'order',
    title: '礼貌地来一杯咖啡',
    english: 'A coffee, please',
    level: 'A1 起步',
    minutes: 12,
    goal: '点一杯咖啡，选择大小，确认价格并结束交流。',
    skill: '礼貌点餐',
    scene: 'cafe',
    visual: 'order',
    intro:
      'I’d like … 表示“我想要……”，比直接喊 Coffee! 更礼貌。I’d 是 I would 的缩写。加 please 让请求更友好。',
    tip: '服务员问 Small or large? 时，回答 A small one, please.。价格 It’s three dollars. 指这份饮品三美元。',
    examples: [
      { en: "I'd like a coffee, please.", zh: '我想要一杯咖啡，谢谢。' },
      { en: 'A small one, please.', zh: '请给我小杯。' },
      { en: 'How much is it?', zh: '多少钱？' },
      { en: "Yes, that's fine.", zh: '可以，这个价格没问题。' },
      { en: 'Thank you!', zh: '谢谢！' },
    ],
    questions: [
      {
        prompt: '选出礼貌的点餐表达。',
        options: ['Coffee!', "I'd like a coffee, please.", 'You are coffee.'],
        answer: "I'd like a coffee, please.",
        sample: "I'd like a coffee, please.",
        explanation: 'I’d like …, please. 自然且礼貌；Coffee! 太生硬。',
      },
      {
        prompt: '听一听，价格是多少美元？',
        english: "It's three dollars.",
        listening: true,
        options: ['3', '2', '10'],
        answer: '3',
        sample: '3',
        explanation: 'Three dollars 是三美元。',
      },
      {
        prompt: '用本课句型礼貌地点一杯咖啡。',
        accept:
          "(i'd|i would) like (a|one) coffee( please)?|can i (have|get) (a|one) coffee( please)?|(a|one) coffee please",
        sample: "I'd like a coffee, please.",
        explanation: '例如 I’d like a coffee, please.；Can I have a coffee, please? 也可以。',
      },
    ],
    review: {
      prompt: '你在咖啡店，用一句英语礼貌地点一杯咖啡。',
      accept:
        "(i'd|i would) like (a|one) coffee( please)?|can i (have|get) (a|one) coffee( please)?|(a|one) coffee please",
      sample: "I'd like a coffee, please.",
      explanation: 'I’d like a coffee, please. 是自然的点餐表达。',
    },
  },
  {
    id: 'where',
    title: '它在哪里？',
    english: 'In, on & under',
    level: 'A1 起步',
    minutes: 10,
    goal: '理解 in、on、under 的空间关系，并描述物品位置。',
    skill: '空间位置',
    scene: 'directions',
    visual: 'position',
    intro:
      'In 表示在里面，on 表示在表面上，under 表示在下方。拖动概念不如亲自切换位置：观察杯子和桌子的关系。',
    tip: 'The cup is on the table. 中 is 连接杯子和位置。table 前用 the，指场景中双方都能看到的桌子。',
    examples: [
      { en: 'The cup is on the table.', zh: '杯子在桌子上。' },
      { en: 'The cup is under the table.', zh: '杯子在桌子下面。' },
      { en: 'The cup is in the box.', zh: '杯子在盒子里。' },
      { en: 'Where is the cafe?', zh: '咖啡店在哪里？' },
    ],
    questions: [
      {
        prompt: '杯子在桌子下面，应选择哪个词？',
        options: ['under', 'on', 'in'],
        answer: 'under',
        sample: 'under',
        explanation: 'Under 是在下方；on 是在表面上；in 是在里面。',
      },
      {
        prompt: '听一听，杯子在哪里？',
        english: 'The cup is on the table.',
        listening: true,
        options: ['桌子上', '桌子下', '盒子里'],
        answer: '桌子上',
        sample: '桌子上',
        explanation: 'On the table 指在桌子的表面上。',
      },
      {
        prompt: '用英语写出“杯子在桌子下面”。',
        accept: '(the|a) cup is under (the|a) table',
        sample: 'The cup is under the table.',
        explanation: '使用 The cup is under the table. 描述位置。',
      },
    ],
    review: {
      prompt: '用英语写出“杯子在桌子上”。',
      accept: '(the|a) cup is on (the|a) table',
      sample: 'The cup is on the table.',
      explanation: 'On 指在表面上，The cup is on the table.',
    },
  },
  {
    id: 'directions',
    title: '走进真实的街道',
    english: 'Find your way',
    level: 'A1 起步',
    minutes: 12,
    goal: '礼貌问路，理解直行、左转和右转，并找到咖啡店。',
    skill: '问路与方向',
    scene: 'directions',
    visual: 'direction',
    intro:
      '问陌生人之前用 Excuse me 引起注意。Where is the cafe? 询问咖啡店的位置。Go straight. 是直行，turn left/right 是左转/右转。',
    tip: 'It’s on your right. 表示它在你的右手边。方向相对于行走的人，而不是任意观察者。跟随地图上的前进方向理解。',
    examples: [
      { en: 'Excuse me. Where is the cafe?', zh: '打扰一下，咖啡店在哪里？' },
      { en: 'Go straight.', zh: '直走。' },
      { en: 'Turn right.', zh: '右转。' },
      { en: "It's on your right.", zh: '它在你的右手边。' },
    ],
    questions: [
      {
        prompt: '向陌生人问路，哪一句最合适？',
        options: ['Excuse me. Where is the cafe?', 'Give me cafe.', 'Goodbye, cafe.'],
        answer: 'Excuse me. Where is the cafe?',
        sample: 'Excuse me. Where is the cafe?',
        explanation: 'Excuse me 礼貌地引起注意，再用 Where is …? 提问。',
      },
      {
        prompt: '听一听，下一步应该做什么？',
        english: 'Turn right.',
        listening: true,
        options: ['右转', '左转', '停下'],
        answer: '右转',
        sample: '右转',
        explanation: 'Right 是右，Turn right 是右转。',
      },
      {
        prompt: '用英语写出“直走，然后右转”。',
        accept: 'go straight( ahead)?( and| then| and then)? turn right',
        sample: 'Go straight, then turn right.',
        explanation: 'Go straight, then turn right.；也可以说 Go straight and turn right.',
      },
    ],
    review: {
      prompt: '用英语告诉对方“直走，然后右转”。',
      accept: 'go straight( ahead)?( and| then| and then)? turn right',
      sample: 'Go straight, then turn right.',
      explanation: '先 Go straight，再 Turn right。',
    },
  },
];

export const scenes: Scene[] = [
  {
    id: 'greeting',
    title: '遇见新朋友',
    english: 'A friendly hello',
    level: 'Pre-A1',
    description: '在街角公园认识 Alex，打招呼、介绍自己，再礼貌告别。',
    color: 'sage',
    expressions: [
      { en: 'Hello!', zh: '你好！' },
      { en: "I'm Lin.", zh: '我是 Lin。' },
      { en: 'Nice to meet you, too.', zh: '我也很高兴认识你。' },
      { en: 'Goodbye!', zh: '再见！' },
    ],
    turns: [
      {
        speaker: 'Alex',
        line: 'Hello!',
        zh: '你好！',
        task: '先回应 Alex 的问候。',
        options: ['Hi!', 'Goodbye!', 'Three cups.'],
        correct: 'Hi!',
        accept: 'hi( alex)?|hello( alex)?|hey( alex)?',
        sample: 'Hi!',
        feedback: '这里刚见面，用 Hi 或 Hello 回应，Goodbye 留给告别。',
      },
      {
        speaker: 'Alex',
        line: "I'm Alex. What's your name?",
        zh: '我是 Alex。你叫什么名字？',
        task: '假设你叫 Lin，介绍自己的名字。',
        options: ["I'm Lin.", 'You are Lin.', 'Thank you.'],
        correct: "I'm Lin.",
        accept: "(i'm|i am|my name is) lin",
        sample: "I'm Lin.",
        feedback: 'I’m Lin. 是介绍自己；You are Lin. 指的是对方。',
      },
      {
        speaker: 'Alex',
        line: 'Nice to meet you.',
        zh: '很高兴认识你。',
        task: '回应初次见面的礼貌表达。',
        options: ['Nice to meet you, too.', 'How much is it?', 'Turn right.'],
        correct: 'Nice to meet you, too.',
        accept: 'nice to meet you( too)?',
        sample: 'Nice to meet you, too.',
        feedback: '回应 Nice to meet you, too.，加 too 表示“我也一样”。',
      },
      {
        speaker: 'Alex',
        line: 'See you later!',
        zh: '回头见！',
        task: '结束交流，向 Alex 告别。',
        options: ['Goodbye!', 'I am coffee.', 'Small, please.'],
        correct: 'Goodbye!',
        accept: '(goodbye|bye|see you|see you later)( alex)?',
        sample: 'Goodbye!',
        feedback: '结束对话时用 Goodbye、Bye 或 See you later。',
      },
    ],
  },
  {
    id: 'cafe',
    title: '街角咖啡店',
    english: 'One coffee, please',
    level: 'A1 起步',
    description: '走进 Little Cafe，完成点餐、选择杯型、确认价格和道谢。',
    color: 'peach',
    expressions: [
      { en: "I'd like a coffee, please.", zh: '我想要一杯咖啡，谢谢。' },
      { en: 'A small one, please.', zh: '请给我小杯。' },
      { en: 'Three dollars.', zh: '三美元。' },
      { en: "Yes, that's fine.", zh: '可以，这个价格没问题。' },
      { en: 'Thank you!', zh: '谢谢！' },
    ],
    turns: [
      {
        speaker: 'Jamie · 店员',
        line: 'Hi! What would you like?',
        zh: '你好！你想要什么？',
        task: '今天的任务：礼貌地点一杯咖啡。',
        options: ["I'd like a coffee, please.", 'Coffee!', 'I am a coffee.'],
        correct: "I'd like a coffee, please.",
        accept:
          "(i'd|i would) like (a|one) coffee( please)?|can i (have|get) (a|one) coffee( please)?|(a|one) coffee please",
        sample: "I'd like a coffee, please.",
        feedback: 'Coffee! 能表达物品，却不够礼貌。试试 I’d like a coffee, please.',
      },
      {
        speaker: 'Jamie · 店员',
        line: 'Small or large?',
        zh: '小杯还是大杯？',
        task: '选择小杯。点击场景里的杯子可以查看杯型。',
        options: ['A small one, please.', 'A large one, please.', 'Three dollars.'],
        correct: 'A small one, please.',
        accept: '(a )?small( one| coffee| cup)?( please)?',
        sample: 'A small one, please.',
        feedback: '这次任务需要小杯：A small one, please.。Large 表示大杯。',
      },
      {
        speaker: 'Jamie · 店员',
        line: "It's three dollars. Is that okay?",
        zh: '三美元，可以吗？',
        task: '确认价格为三美元，表示三美元的价格可以接受。',
        options: ["Yes, that's fine.", 'No, ten dollars.', 'Turn left.'],
        correct: "Yes, that's fine.",
        accept:
          "yes( that's fine| that is fine| please)?|that's fine|that is fine|three dollars that's fine|yes three dollars",
        sample: "Yes, that's fine.",
        feedback:
          '价格是 three dollars。接受价格时可以说 Yes, that’s fine.（可以，这个价格没问题。）',
      },
      {
        speaker: 'Jamie · 店员',
        line: 'Here you are. Have a nice day!',
        zh: '给你。祝你今天愉快！',
        task: '拿到咖啡，向店员道谢。',
        options: ['Thank you! You too.', 'Where is the cafe?', 'Two cups.'],
        correct: 'Thank you! You too.',
        accept: '(thank you|thanks)( you too| have a nice day)?',
        sample: 'Thank you! You too.',
        feedback: 'Thank you 表示感谢。You too 回应对方的祝福。',
      },
    ],
  },
  {
    id: 'directions',
    title: '找到你的目的地',
    english: 'Around the corner',
    level: 'A1 起步',
    description: '在小镇街道向 Sam 问路，理解方向，沿路线找到咖啡店。',
    color: 'blue',
    expressions: [
      { en: 'Excuse me. Where is the cafe?', zh: '打扰一下，咖啡店在哪里？' },
      { en: 'Go straight.', zh: '直走。' },
      { en: 'Turn right.', zh: '右转。' },
      { en: 'Thank you for your help.', zh: '谢谢你的帮助。' },
    ],
    turns: [
      {
        speaker: 'Sam · 路人',
        line: 'Hello. Can I help you?',
        zh: '你好，需要帮助吗？',
        task: '礼貌询问咖啡店在哪里。',
        options: ['Excuse me. Where is the cafe?', 'Coffee now!', 'I am Lin.'],
        correct: 'Excuse me. Where is the cafe?',
        accept: '(excuse me )?(where is|where\x27s) (the )?caf[eé]',
        sample: 'Excuse me. Where is the cafe?',
        feedback: '用 Excuse me 引起注意，再问 Where is the cafe?。',
      },
      {
        speaker: 'Sam · 路人',
        line: 'Go straight to the corner.',
        zh: '直走到街角。',
        task: '确认你应该先怎么走，地图上的角色将随正确回答移动。',
        options: ['Go straight.', 'Turn left.', 'Turn right.'],
        correct: 'Go straight.',
        accept: '(go|walk) straight( ahead| to the corner)?',
        sample: 'Go straight.',
        feedback: '先直行 Go straight；还没有到转弯的地方。',
      },
      {
        speaker: 'Sam · 路人',
        line: 'Then turn right. The cafe is on your right.',
        zh: '然后右转。咖啡店在你的右手边。',
        task: '到达街角后应该往哪边转？',
        options: ['Turn right.', 'Turn left.', 'Go back.'],
        correct: 'Turn right.',
        accept: '(then )?turn right',
        sample: 'Turn right.',
        feedback: 'Right 是右，left 是左。按行进方向右转，就会到咖啡店。',
      },
      {
        speaker: 'Sam · 路人',
        line: 'There it is!',
        zh: '就在那里！',
        task: '到达咖啡店，感谢 Sam 的帮助。',
        options: ['Thank you for your help.', 'Good morning, cups.', 'I are Sam.'],
        correct: 'Thank you for your help.',
        accept: '(thank you|thanks)( for your help| so much)?',
        sample: 'Thank you for your help.',
        feedback: '用 Thank you for your help. 感谢对方指路。',
      },
    ],
  },
];

export function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[.,!?，。！？]/g, '')
    .replace(/\s+/g, ' ');
}
export function matches(value: string, question: { answer?: string; accept?: string }) {
  if (!value.trim()) return false;
  if (question.answer) return normalize(value) === normalize(question.answer);
  return question.accept
    ? new RegExp(`^(?:${question.accept})$`, 'i').test(normalize(value))
    : false;
}

/** Course application only uses expressions already taught. Full scenes stay available in exploration. */
export function sceneForLesson(lessonId: string): Scene {
  const lesson = lessons.find((l) => l.id === lessonId)!;
  const base = scenes.find((s) => s.id === lesson.scene)!;
  if (lessonId === 'hello')
    return {
      ...base,
      description: '先打招呼，回应初次见面的问候，再告别。姓名介绍会在下一课学习。',
      turns: [base.turns[0], base.turns[2], base.turns[3]],
      expressions: base.expressions.filter((e) => e.en !== "I'm Lin."),
    };
  if (lessonId === 'cups')
    return {
      ...base,
      title: '咖啡店的杯子',
      description: '先用数量表达领取杯子。礼貌点咖啡和价格确认会在下一课学习。',
      expressions: [
        { en: 'Two cups.', zh: '两个杯子。' },
        { en: 'Three cups.', zh: '三个杯子。' },
        { en: 'Thank you.', zh: '谢谢。' },
      ],
      turns: [
        {
          speaker: 'Jamie · 店员',
          line: 'One cup or two cups?',
          zh: '一个杯子还是两个杯子？',
          task: '领取两个杯子。',
          options: ['Two cups.', 'One cup.', 'Two cup.'],
          correct: 'Two cups.',
          accept: '(two|2) cups( please)?',
          sample: 'Two cups.',
          feedback: '两个杯子是 two cups，需要复数的 s。',
        },
        {
          speaker: 'Jamie · 店员',
          line: 'Two cups or three cups?',
          zh: '两个杯子还是三个杯子？',
          task: '你还需要三个杯子。',
          options: ['Three cups.', 'Two cups.', 'Three cup.'],
          correct: 'Three cups.',
          accept: '(three|3) cups( please)?',
          sample: 'Three cups.',
          feedback: '三个杯子是 three cups，注意三是 three。',
        },
        {
          speaker: 'Jamie · 店员',
          line: 'Here are your cups.',
          zh: '这是你的杯子。',
          task: '收到杯子，用英语道谢。',
          options: ['Thank you.', 'Goodbye, table.', 'Turn right.'],
          correct: 'Thank you.',
          accept: 'thank you|thanks',
          sample: 'Thank you.',
          feedback: 'Thank you. 表示感谢。',
        },
      ],
    };
  if (lessonId === 'where')
    return {
      ...base,
      title: '桌边的位置练习',
      description: '切换动画中的位置，和 Sam 一起描述杯子在哪里。下一课再学习街道方向。',
      expressions: lesson.examples.slice(0, 3),
      turns: [
        {
          speaker: 'Sam',
          line: 'Where is the cup?',
          zh: '杯子在哪里？',
          task: '请先将动画切换到 On，描述杯子在桌子上。',
          options: [
            'The cup is on the table.',
            'The cup is under the table.',
            'The cup is in the box.',
          ],
          correct: 'The cup is on the table.',
          accept: '(the|a) cup is on (the|a) table',
          sample: 'The cup is on the table.',
          feedback: 'On 表示在表面上，杯子在桌子上。',
        },
        {
          speaker: 'Sam',
          line: 'Where is the cup now?',
          zh: '现在杯子在哪里？',
          task: '切换到 Under，描述杯子在桌子下面。',
          options: [
            'The cup is under the table.',
            'The cup is on the table.',
            'The cup is in the box.',
          ],
          correct: 'The cup is under the table.',
          accept: '(the|a) cup is under (the|a) table',
          sample: 'The cup is under the table.',
          feedback: 'Under 表示在下面。',
        },
        {
          speaker: 'Sam',
          line: 'And now?',
          zh: '现在呢？',
          task: '切换到 In，描述杯子在盒子里。',
          options: [
            'The cup is in the box.',
            'The cup is under the table.',
            'The cup is on the table.',
          ],
          correct: 'The cup is in the box.',
          accept: '(the|a) cup is in (the|a) box',
          sample: 'The cup is in the box.',
          feedback: 'In 表示在里面。',
        },
      ],
    };
  return base;
}
