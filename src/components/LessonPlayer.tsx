import { useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Flag, RotateCcw } from 'lucide-react';
import { lessons, type Lesson } from '../content';
import { Exercise } from './Exercise';
import { ScenePlayer } from './ScenePlayer';
import { Speak } from './Speech';
import { VisualLesson } from './World';
export function LessonPlayer({
  lesson,
  onFinish,
  onExit,
  onNext,
}: {
  lesson: Lesson;
  onFinish: (correct: number, mistakes: number) => void;
  onExit: () => void;
  onNext: (id: string) => void;
}) {
  const [phase, setPhase] = useState(0);
  const [question, setQuestion] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [sceneMistakes, setSceneMistakes] = useState(0);
  const [zh, setZh] = useState(lessons.indexOf(lesson) < 3);
  const next = lessons[lessons.indexOf(lesson) + 1];
  const steps = ['认识与动画', '示例与跟读', '引导练习', '情境应用', '反馈与复习'];
  return (
    <section className="lesson-player">
      <button className="text-button back" onClick={onExit}>
        <ChevronLeft size={17} />
        返回学习首页
      </button>
      <div className="lesson-heading">
        <div>
          <p className="eyebrow">
            LESSON {String(lessons.indexOf(lesson) + 1).padStart(2, '0')} · {lesson.level}
          </p>
          <h1>{lesson.title}</h1>
          <p className="muted">{lesson.goal}</p>
        </div>
        <span className="tag">约 {lesson.minutes} 分钟</span>
      </div>
      <ol className="lesson-steps">
        {steps.map((s, i) => (
          <li className={phase === i ? 'current' : phase > i ? 'done' : ''} key={s}>
            <span>{phase > i ? <Check size={13} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {phase === 0 && (
        <div className="lesson-grid">
          <VisualLesson lesson={lesson} />
          <div className="card lesson-copy">
            <p className="eyebrow">A LITTLE DISCOVERY</p>
            <h2>{lesson.english}</h2>
            <p>{lesson.intro}</p>
            <div className="note">
              <Flag size={18} />
              <p>{lesson.tip}</p>
            </div>
            <p className="muted">
              切换演示步骤，观察动作与英语的关系。观看本身不会授予完成或掌握。
            </p>
            <button className="button primary" onClick={() => setPhase(1)}>
              理解了，看看例句
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
      {phase === 1 && (
        <div className="card lesson-examples">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LISTEN & NOTICE</p>
              <h2>听一听，试着跟读。</h2>
            </div>
            <button className="button ghost small" aria-pressed={zh} onClick={() => setZh(!zh)}>
              {zh ? '隐藏中文' : '显示中文'}
            </button>
          </div>
          {lesson.examples.map((e, i) => (
            <div className="example-row" key={e.en}>
              <span className="example-number">0{i + 1}</span>
              <div>
                <p className="english" lang="en">
                  {e.en}
                </p>
                {zh && <p className="muted">{e.zh}</p>}
              </div>
              <Speak text={e.en} />
            </div>
          ))}
          <p className="note">先听正常语速，再切换慢速。跟读是练习，不会自动评价你的发音。</p>
          <div className="row">
            <button className="button ghost" onClick={() => setPhase(0)}>
              返回讲解
            </button>
            <button className="button primary" onClick={() => setPhase(2)}>
              开始互动练习
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
      {phase === 2 && (
        <div className="card exercise-card">
          <div className="mini-progress">
            <span style={{ width: `${(question / 3) * 100}%` }} />
          </div>
          <Exercise
            key={question}
            number={`PRACTICE ${question + 1} / 3`}
            question={lesson.questions[question]}
            onDone={(first) => {
              if (first) setCorrect((c) => c + 1);
              if (question === 2) setPhase(3);
              else setQuestion(question + 1);
            }}
          />
        </div>
      )}
      {phase === 3 && (
        <ScenePlayer
          id={lesson.scene}
          lessonId={lesson.id}
          embedded
          onExit={onExit}
          onFinish={(mistakes) => {
            setSceneMistakes(mistakes);
            onFinish(correct, mistakes);
            setPhase(4);
          }}
        />
      )}
      {phase === 4 && (
        <div className="card completion">
          <div className="completion-mark">
            <Check size={36} />
          </div>
          <p className="eyebrow">ONE MORE STEP FORWARD</p>
          <h2>你已经迈出了新的一步。</h2>
          <p>{lesson.goal}</p>
          <div className="result-grid">
            <div>
              <strong>{correct} / 3</strong>
              <span>练习首次答对</span>
            </div>
            <div>
              <strong>{sceneMistakes === 0 ? '一次通过' : `${sceneMistakes} 次调整`}</strong>
              <span>情境沟通</span>
            </div>
            <div>
              <strong>{correct === 3 && sceneMistakes === 0 ? '明天' : '现在'}</strong>
              <span>建议复习</span>
            </div>
          </div>
          <p className="note">
            {correct === 3 && sceneMistakes === 0
              ? '已完成本课，初步掌握。明天用主动回忆巩固；完成课程不等于 CEFR 等级认证。'
              : '你已改正答案并完成任务。首次错误仍会保留，首页已安排巩固，不会用改正后的答案冒充首次满分。'}
          </p>
          {next ? (
            <button className="button primary" onClick={() => onNext(next.id)}>
              继续：{next.title}
              <ArrowRight size={18} />
            </button>
          ) : (
            <button className="button primary" onClick={onExit}>
              返回首页，继续复习
              <ArrowRight size={18} />
            </button>
          )}
          <button className="text-button" onClick={onExit}>
            查看学习记录
          </button>
          <button
            className="text-button"
            onClick={() => {
              setPhase(0);
              setQuestion(0);
              setCorrect(0);
              setSceneMistakes(0);
            }}
          >
            <RotateCcw size={15} />
            再学一次
          </button>
        </div>
      )}
    </section>
  );
}
