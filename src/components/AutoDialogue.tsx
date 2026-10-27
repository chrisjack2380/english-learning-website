import { replyTranslations } from '../translations';
import { useState } from 'react';
import { Speak } from './Speech';
import { LearningText } from './KnowledgeContext';
export function AutoDialogue({
  text,
  zh = '',
  role = '角色',
  auto = true,
}: {
  text: string;
  zh?: string;
  role?: string;
  auto?: boolean;
}) {
  const translation = zh || replyTranslations[text] || '';
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [translate, setTranslate] = useState(false);
  const parts = text.split(/(?<=[.!?])\s+/);
  let offset = 0;
  return (
    <div className={`auto-dialogue ${playing ? 'speaking' : ''}`}>
      <span className="role-caption">{role}</span>
      <p className="synchronized-caption" aria-live="polite">
        {parts.map((p, i) => {
          const start = offset;
          offset += p.length + 1;
          return (
            <span
              className={
                playing && (index === -1 || (index >= start && index < offset)) ? 'spoken-line' : ''
              }
              key={i}
            >
              <LearningText text={p} zh={translation} />{' '}
            </span>
          );
        })}
      </p>
      <Speak text={text} auto={auto} onBoundary={setIndex} onPlaying={setPlaying} />
      <button type="button" className="text-button" onClick={() => setTranslate(!translate)}>
        {translate ? '隐藏翻译' : '查看翻译'}
      </button>
      {translate && (
        <p>{translation || '这段动态回复尚无审核译文；可点击整句请求你的模型解释。'}</p>
      )}
      <small>
        角色自动回复；系统语音可用时同步句子进度，备用音频按整句显示。不支持自动播放时可重播。
      </small>
    </div>
  );
}
