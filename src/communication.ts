/** Transparent task evidence, not a semantic or CEFR assessment. */
export type Criterion = { label: string; pattern: string };
export type TaskSpec = { minWords: number; criteria: Criterion[] };
export function taskEvidence(text: string, task: TaskSpec) {
  const words = text.trim().match(/[a-z]+(?:['’][a-z]+)?/gi) || [];
  const enough = words.length >= task.minWords;
  const checks = task.criteria.map((c) => ({
    label: c.label,
    met: new RegExp(c.pattern, 'i').test(text),
  }));
  const issues = grammarIssues(text);
  return {
    words: words.length,
    enough,
    checks,
    issues,
    passed: enough && checks.every((c) => c.met) && issues.length === 0,
  };
}
export type GrammarIssue = { before: string; after: string; why: string };
const rules = [
  {
    pattern: /\bvery like\b/gi,
    replacement: 'really like',
    why: 'very 通常修饰形容词或副词；修饰 like 用 really 或 like … very much。',
  },
  {
    pattern: /\bdiscuss about\b/gi,
    replacement: 'discuss',
    why: 'discuss 是及物动词，直接接话题；talk about 才需要 about。',
  },
  {
    pattern: /\bmore better\b/gi,
    replacement: 'better',
    why: 'better 已经是比较级，不再加 more。',
  },
  {
    pattern: /\bI am agree\b/gi,
    replacement: 'I agree',
    why: 'agree 是动词；可以说 I agree，不能说 I am agree。',
  },
  {
    pattern: /\baccording to me\b/gi,
    replacement: 'In my view',
    why: '表达自己的看法用 In my view；according to 更适合引述其他来源。',
  },
  {
    pattern: /\bexplain me\b/gi,
    replacement: 'explain to me',
    why: 'explain something to someone；当问题是 explain me this 时，建议改成 explain this to me。',
  },
  {
    pattern: /\bdespite of\b/gi,
    replacement: 'despite',
    why: 'despite 直接接名词或动名词；也可使用 in spite of。',
  },
  {
    pattern: /\binformations\b/gi,
    replacement: 'information',
    why: '日常英语中的 information 是不可数名词；多条信息可说 pieces of information。',
  },
  {
    pattern: /\bequipments\b/gi,
    replacement: 'equipment',
    why: '通常用不可数名词 equipment；单件设备可说 a piece of equipment。',
  },
  {
    pattern: /\bdid not went\b/gi,
    replacement: 'did not go',
    why: 'did 已表示过去时，后接动词原形 go。',
  },
];
export function grammarIssues(text: string): GrammarIssue[] {
  return rules.flatMap((r) => {
    const found = [...text.matchAll(new RegExp(r.pattern))];
    return found.map((m) => ({ before: m[0], after: r.replacement, why: r.why }));
  });
}
export function upgradeExpression(
  text: string,
  expressions: {
    basic: string;
    natural: string;
    fluent: string;
    usage: string;
    explanation: string;
  }[] = [],
) {
  const issues = grammarIssues(text);
  let corrected = text.trim();
  for (const r of rules) corrected = corrected.replace(new RegExp(r.pattern), r.replacement);
  // This word-order case needs a full phrase rather than a token substitution.
  corrected = corrected.replace(/explain to me (this|that|the problem)\b/gi, 'explain $1 to me');
  const catalog = [
    {
      pattern: /^I (?:really )?like this product[.!]?$/i,
      natural: "I'm really impressed with this product.",
      advanced: 'What stands out to me is how well this product addresses our needs.',
      context:
        '评价产品时。really like 是个人喜好；impressed 强调留下深刻印象；addresses our needs 强调需求匹配。',
      why: '后两句增加了原句没有明确说出的评价角度，只在确实符合你的意思时使用；更长的句子不一定更好。',
    },
    {
      pattern: /^I (?:don't|do not) agree[.!]?$/i,
      natural: 'I see your point, but I have a different perspective.',
      advanced:
        "I understand the reasoning, though I'm not convinced the benefits outweigh the risks.",
      context: '讨论分歧。先承认对方的观点再提出异议；和朋友直说 I don’t agree 也可以。',
      why: '高级版本增加了风险与收益的判断，不能代替所有不同意的情况。委婉程度取决于关系和场合。',
    },
    {
      pattern: /^What do you do[?!.]?$/i,
      natural: 'What kind of work do you do?',
      advanced: 'What drew you to that line of work?',
      context: '社交聊天。前两句问职业；第三句追问进入这个行业的动机。',
      why: '第三句改变了问题目的，应在知道对方职业之后使用，不能作为同义替换。',
    },
    {
      pattern: /^We need more time[.!]?$/i,
      natural: 'Could we give ourselves a little more time?',
      advanced:
        'Extending the timeline would allow us to address the remaining issues before launch.',
      context: '工作会议。第一句直接说明需求；第二句协商；第三句提供延长时间的理由。',
      why: '延长周期需有事实依据。before launch 仅在讨论发布时适用。',
    },
    {
      pattern: /^Our product is good[.!]?$/i,
      natural: 'Our product makes it easier for teams to work together.',
      advanced: 'It helps teams coordinate their work with less manual follow-up.',
      context: '介绍协作产品，用具体用户收益代替空泛的 good。',
      why: '示例假设产品用于团队协作；不能给其他产品添加未经证实的功能或效果。',
    },
  ];
  const sceneMatch = expressions.find(
    (e) =>
      e.basic.replace(/[.!?]/g, '').toLowerCase() === corrected.replace(/[.!?]/g, '').toLowerCase(),
  );
  const known = catalog.find((entry) => entry.pattern.test(corrected));
  let composed: { natural: string; advanced: string; context: string; why: string } | undefined;
  const opinion = corrected.match(/^I think (?:that )?(.+?)[.!]?$/i);
  const suggestionTask = corrected.match(/^We should (.+?)[.!]?$/i);
  const responsibility = corrected.match(/^I am responsible for (.+?)[.!]?$/i);
  const capability = corrected.match(/^Our product can (.+?)[.!]?$/i);
  if (opinion)
    composed = {
      natural: `My view is that ${opinion[1]}.`,
      advanced: `I would argue that ${opinion[1]}.`,
      context:
        '讨论观点。I think 很自然；My view 标记个人立场，I would argue 更适合需要论证的讨论。',
      why: '复用你原句的命题，不补证据。高级版语气更有论证意味，仍需要实际理由支持。',
    };
  else if (suggestionTask)
    composed = {
      natural: `One option would be to ${suggestionTask[1]}.`,
      advanced: `One approach we could consider is to ${suggestionTask[1]}.`,
      context: '团队协商。should 建议较直接；option / could 留出其他方案的讨论空间。',
      why: '仅改变提案框架，保留动作。缓和语气不代表更合适；紧急行动可能需要直接表达。',
    };
  else if (responsibility)
    composed = {
      natural: `I handle ${responsibility[1]}.`,
      advanced: `My role involves ${responsibility[1]}.`,
      context: '介绍工作职责。handle 简洁口语化，role involves 适合面试或正式介绍。',
      why: '保留职责，不添加成就或数字。若原句对象不是工作活动，请核对 handle / involves 的搭配。',
    };
  else if (capability)
    composed = {
      natural: `Our product is designed to ${capability[1]}.`,
      advanced: `The purpose of our solution is to ${capability[1]}.`,
      context:
        '产品介绍。can 表能力，designed to / purpose 表设计目的，两者不是已验证性能的同义表达。',
      why: '只复用你提供的主张，尚未核验事实。不能据此推断分子级原理、百分比、认证或实际效果。',
    };
  const suggestion =
    known ||
    (sceneMatch
      ? {
          natural: sceneMatch.natural,
          advanced: sceneMatch.fluent,
          context: sceneMatch.usage,
          why: sceneMatch.explanation,
        }
      : composed);
  return { issues, corrected, suggestion };
}
