import type { JourneyStage } from './journey-schema';
import type { KnowledgeEntry } from './knowledge';

/** Recall an expression inside its original situation, rather than translating an isolated word.
 * A literal gap is used only when the term actually occurs; other forms retain the whole example.
 * These authored lexical tasks do not evaluate the meaning of arbitrary learner output. */
export function contextRecall(
  e: Pick<KnowledgeEntry, 'term' | 'example' | 'collocations' | 'usage'>,
  alternatives: string[],
) {
  const escaped = e.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i');
  const gap =
    pattern.test(e.example) && e.example.trim().toLowerCase() !== e.term.trim().toLowerCase();
  return {
    line: gap
      ? e.example.replace(pattern, '________')
      : e.example.trim().toLowerCase() === e.term.trim().toLowerCase()
        ? e.usage
        : e.example,
    prompt: gap
      ? '读懂这句话的情境，选择最合适的词语补完整。'
      : '在这句表达的情境中，哪一个词语最适合描述当前含义？',
    answer: e.term,
    options: [...new Set([e.term, ...alternatives.filter((t) => t !== e.term)])].slice(0, 3),
    hint: `${e.collocations.join(' · ')}。${e.usage}`,
  };
}
export function stageRecallTerms(stage: JourneyStage) {
  return [
    ...new Set([stage.words[0]?.[0], stage.words[2]?.[0], stage.words[4]?.[0]].filter(Boolean)),
  ];
}
