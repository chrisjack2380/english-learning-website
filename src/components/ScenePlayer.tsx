import { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { matches, scenes, sceneForLesson, lessons, type SceneId } from '../content';
import { VisualLesson, World } from './World';
import { Speak, VoiceInput } from './Speech';
export function ScenePlayer({
  id,
  embedded = false,
  lessonId,
  onFinish,
  onExit,
}: {
  id: SceneId;
  embedded?: boolean;
  lessonId?: string;
  onFinish: (mistakes: number) => void;
  onExit: () => void;
}) {
  const scene = lessonId ? sceneForLesson(lessonId) : scenes.find((s) => s.id === id)!;
  const [mode, setMode] = useState<'intro' | 'demo' | 'practice' | 'done'>('intro');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [zh, setZh] = useState(!lessonId || lessons.findIndex((l) => l.id === lessonId) < 3);
  const [textMode, setTextMode] = useState(false);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [inspect, setInspect] = useState('');
  const turn = scene.turns[Math.min(step, scene.turns.length - 1)];
  function next() {
    if (step === scene.turns.length - 1) {
      setMode('done');
      onFinish(mistakes);
    } else {
      setStep(step + 1);
      setAnswer('');
      setResult(null);
    }
  }
  const inspection: Record<string, string> = {
    Hello: 'Hello · 初次见面先打招呼。',
    Alex: 'Alex 是你的新邻居。',
    'Small cup': 'Small cup · 小杯，$3。',
    'Large cup': 'Large cup · 大杯，$4。',
    Menu: '菜单：Small $3 / Large $4。',
    Cafe: 'Cafe · 咖啡店：到街角后右转。',
    'Go straight': 'Go straight · 沿箭头直行。',
    'Turn right': 'Turn right · 按前进方向右转。',
  };
  return (
    <section className={`scene-player ${embedded ? 'embedded' : ''}`}>
      {!embedded && (
        <button type="button" className="text-button back" onClick={onExit}>
          <ChevronLeft size={17} />
          返回场景探索
        </button>
      )}
      <div className="section-heading">
        <div>
          <p className="eyebrow">REAL-LIFE PRACTICE · 生活英语</p>
          <h1>{scene.title}</h1>
          <p className="muted">{scene.description}</p>
        </div>
        <span className="tag">{scene.level}</span>
      </div>
      <div className="scene-grid">
        <div>
          {lessonId === 'where' ? (
            <VisualLesson lesson={lessons.find((l) => l.id === lessonId)!} />
          ) : (
            <World
              scene={id}
              step={step}
              playing={playing}
              onInspect={(item) => setInspect(inspection[item])}
            />
          )}
          <div className="animation-controls">
            <button
              className="icon-button"
              aria-label={playing ? '暂停动画' : '播放动画'}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              className="icon-button"
              aria-label="重播场景演示"
              onClick={() => {
                if (mode === 'done') setMistakes(0);
                setStep(0);
                setMode('demo');
                setAnswer('');
                setResult(null);
                setPlaying(true);
              }}
            >
              <RotateCcw size={16} />
            </button>
            <span>点击场景词语，观察与学习</span>
          </div>
          {inspect && (
            <p className="note" role="status">
              {inspect}
            </p>
          )}
          <div className="expressions">
            <h3>口袋表达</h3>
            {scene.expressions.map((e) => (
              <div key={e.en}>
                <span lang="en">{e.en}</span>
                {zh && <small>{e.zh}</small>}
                <Speak text={e.en} compact />
              </div>
            ))}
          </div>
        </div>
        <div className="scene-dialogue card">
          <div className="row spread">
            <span className="eyebrow">
              {mode === 'practice' ? `对话 ${step + 1} / ${scene.turns.length}` : 'SCENE GUIDE'}
            </span>
            <button className="text-button" aria-pressed={zh} onClick={() => setZh(!zh)}>
              {zh ? '隐藏中文' : '显示中文'}
            </button>
          </div>
          {mode === 'intro' && (
            <>
              <div className="round-icon sage">
                <MessageCircle size={25} />
              </div>
              <h2>
                把学过的英语，
                <br />
                带到生活里。
              </h2>
              <p>先看一遍对话，再扮演学习者完成任务。你可以选择句子，也可以输入或说出回答。</p>
              <ol className="scene-goals">
                {scene.turns.map((t) => (
                  <li key={t.line}>{t.task}</li>
                ))}
              </ol>
              <button
                className="button primary"
                onClick={() => {
                  setMode('demo');
                  setStep(0);
                }}
              >
                观看对话示范
                <Play size={17} />
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setMode('practice');
                  setStep(0);
                }}
              >
                准备好了，直接练习
                <ArrowRight size={16} />
              </button>
            </>
          )}
          {mode === 'demo' && (
            <>
              <p className="muted">
                对话示范 · {step + 1} / {scene.turns.length}
              </p>
              <div className="dialogue-line">
                <span>{turn.speaker}</span>
                <p lang="en">{turn.line}</p>
                {zh && <small>{turn.zh}</small>}
                <Speak text={turn.line} />
              </div>
              <div className="dialogue-line user-line">
                <span>Lin · 你</span>
                <p lang="en">{turn.sample}</p>
                <Speak text={turn.sample} />
              </div>
              <div className="row">
                <button
                  className="button ghost small"
                  disabled={step === 0}
                  onClick={() => setStep(step - 1)}
                >
                  <ChevronLeft size={16} />
                  上一句
                </button>
                {step < scene.turns.length - 1 ? (
                  <button className="button primary" onClick={() => setStep(step + 1)}>
                    下一句
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    className="button primary"
                    onClick={() => {
                      setMode('practice');
                      setStep(0);
                    }}
                  >
                    开始角色练习
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </>
          )}
          {mode === 'practice' && (
            <>
              <div className="dialogue-line">
                <span>{turn.speaker}</span>
                <p lang="en">{turn.line}</p>
                {zh && <small>{turn.zh}</small>}
                <Speak text={turn.line} />
              </div>
              <p className="task-line">{turn.task}</p>
              <div className="segmented">
                <button
                  className={!textMode ? 'selected' : ''}
                  aria-pressed={!textMode}
                  onClick={() => {
                    setTextMode(false);
                    setAnswer('');
                    setResult(null);
                  }}
                >
                  选择回答
                </button>
                <button
                  className={textMode ? 'selected' : ''}
                  aria-pressed={textMode}
                  onClick={() => {
                    setTextMode(true);
                    setAnswer('');
                    setResult(null);
                  }}
                >
                  文字 / 语音
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const correct = matches(
                    answer,
                    textMode ? { accept: turn.accept } : { answer: turn.correct },
                  );
                  setResult(correct ? 'correct' : 'wrong');
                  if (!correct) setMistakes(mistakes + 1);
                }}
              >
                {textMode ? (
                  <>
                    <label className="field-label" htmlFor="scene-answer">
                      你的英文回答
                    </label>
                    <input
                      id="scene-answer"
                      value={answer}
                      disabled={result === 'correct'}
                      onChange={(e) => {
                        setAnswer(e.target.value);
                        setResult(null);
                      }}
                      placeholder="试着说出本场景的表达…"
                      autoComplete="off"
                    />
                    <VoiceInput
                      onText={(text) => {
                        setAnswer(text);
                        setResult(null);
                      }}
                    />
                    <p className="small-text muted">支持本场景的预设常用句型；识别结果可编辑。</p>
                  </>
                ) : (
                  <fieldset className="answer-options" disabled={result === 'correct'}>
                    <legend className="sr-only">选择对话回答</legend>
                    {turn.options.map((o, i) => (
                      <label className={`answer-option ${answer === o ? 'chosen' : ''}`} key={o}>
                        <input
                          type="radio"
                          name="scene-response"
                          checked={answer === o}
                          onChange={() => {
                            setAnswer(o);
                            setResult(null);
                          }}
                        />
                        <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                        <span lang="en">{o}</span>
                      </label>
                    ))}
                  </fieldset>
                )}
                {result && (
                  <div role="status" className={`feedback ${result}`}>
                    <strong>
                      {result === 'correct'
                        ? '沟通成功，继续对话。'
                        : '对方还没有理解你的任务，试着换个表达。'}
                    </strong>
                    <p>{result === 'correct' ? `你说：${answer}` : turn.feedback}</p>
                    {result === 'wrong' && <small>参考：{turn.sample}</small>}
                  </div>
                )}
                {result === 'correct' ? (
                  <button type="button" className="button primary" onClick={next}>
                    {step === scene.turns.length - 1 ? '完成场景任务' : '继续对话'}
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <button className="button primary" type="submit" disabled={!answer.trim()}>
                    发送回答
                    <ArrowRight size={17} />
                  </button>
                )}
              </form>
            </>
          )}
          {mode === 'done' && (
            <>
              <div className="round-icon sage">
                <Check size={30} />
              </div>
              <h2>这一次，你做到了。</h2>
              <p>
                你已完成{scene.title}的 {scene.turns.length} 步沟通任务。
              </p>
              <p className="note">
                {mistakes
                  ? `有 ${mistakes} 次需要调整的表达。建议再看口袋表达，巩固后重试。`
                  : '所有回答一次通过。下次试试文字或语音回答，减少选项提示。'}
              </p>
              <p className="muted">自由场景记录已保存；系统必修课程的完成情况由课程练习决定。</p>
              <button
                className="button primary"
                onClick={() => {
                  setMode('practice');
                  setStep(0);
                  setMistakes(0);
                  setAnswer('');
                  setResult(null);
                }}
              >
                再练一次
                <RotateCcw size={17} />
              </button>
              <button className="text-button" onClick={onExit}>
                返回场景探索
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
