import { grammarIssues, upgradeExpression } from './communication';
import { knowledgeEntries, relatedKnowledge } from './knowledge';
export function communicationFeedback(text: string, context = '', knowledgeIds: string[] = []) {
  const issues = grammarIssues(text);
  const entries = knowledgeIds.length
    ? knowledgeEntries.filter((e) => knowledgeIds.includes(e.id))
    : relatedKnowledge(text);
  const result = upgradeExpression(text);
  const ongoing = /\bI developed products for (\w+|\d+) years[.!]?$/i.exec(text.trim());
  return {
    issues,
    correctness: issues.length
      ? '发现可确认的用法问题，请先修改。'
      : ongoing
        ? '需先确认：这段经历已结束，还是现在仍在继续？'
        : '未发现当前规则覆盖的错误；完整语义与语法仍需人工或模型核对。',
    naturalness: ongoing
      ? `如果仍在继续：I have been developing products for ${ongoing[1]} years. 如果已经结束，原过去时可能合适。`
      : result.suggestion?.natural ||
        '原句可能已经自然。请检查搭配、指代和信息顺序；没有依据时不强行改写。',
    context: /\b(you are wrong|stupid|guarantee everything)\b/i.test(text)
      ? '当前措辞可能损害合作或超出证据；针对具体观点说明理由，避免攻击人或保证未知结果。'
      : context
        ? '核对你的回应是否解决角色的问题、说明理由，并符合当前关系与事实边界。'
        : '请先说明对象和目的，才能判断语域与意图是否合适。',
    upgrade: ongoing
      ? '持续动作可用现在完成进行时；responsible for 表职责，不能自动替换 developed 改变事实。'
      : result.suggestion?.advanced ||
        entries[0]?.example ||
        '可用观点—理由—限制—下一步组织信息；只添加你确实知道的内容。',
    why: ongoing
      ? 'for 表时长，但时态由是否仍持续决定。'
      : result.suggestion?.why ||
        entries[0]?.contrast ||
        '自然度与语境不能仅凭出现几个词或句子长度推断。',
    canReflect:
      /[a-z]{2}/i.test(text) &&
      text.trim().length >= 4 &&
      !/^(hello|hi|hey)[.!]?$/i.test(text.trim()),
  };
}
