import { KnowledgeProvider } from './components/KnowledgeContext';
const KnowledgePage = lazy(() =>
  import('./pages/Knowledge').then((m) => ({ default: m.KnowledgePage })),
);
import { freshKnowledge, recordKnowledge } from './knowledge-learning';
import { TeachingProvider } from './components/TeachingContext';
import { JourneyPlayer } from './components/JourneyPlayer';
import { lifeJourneys } from './life-content';
import { officeLab } from './office-lab';
import { journeyPlan } from './journey-learning';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  Compass,
  Home,
  Leaf,
  RotateCcw,
  Settings2,
  TrendingUp,
  X,
} from 'lucide-react';
import { CommunicationPlayer, type OutputEvidence } from './components/CommunicationPlayer';
import { findCommunicationScene } from './advanced-content';
import type { CommunicationScene } from './scene-schema';
import { lessons, type SceneId } from './content';
import {
  addTime,
  canOpen,
  dayKey,
  dueLessons,
  finishLesson,
  finishScene,
  freshState,
  nextLesson,
  parseState,
  reviewSkill,
  STORAGE_KEY,
  type LearningState,
} from './learning';
import type { Page } from './types';
import { Brand } from './components/Brand';
import { LessonPlayer } from './components/LessonPlayer';
import { ScenePlayer } from './components/ScenePlayer';
import { Onboarding } from './pages/Onboarding';
import { ReviewPanel } from './pages/Review';
import { HomePage } from './pages/Home';
import { PathPage } from './pages/Path';
import { ExplorePage } from './pages/Explore';
import { ProgressPage } from './pages/Progress';
import { SettingsPage } from './pages/Settings';
const navigation = [
  { id: 'home', label: '今日学习', icon: Home },
  { id: 'path', label: '学习路径', icon: BookOpen },
  { id: 'knowledge', label: '知识与词库', icon: BookOpen },
  { id: 'explore', label: '场景探索', icon: Compass },
  { id: 'review', label: '温故知新', icon: RotateCcw },
  { id: 'progress', label: '学习记录', icon: TrendingUp },
] as const;
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { state: raw ? parseState(raw) : freshState(), issue: '' };
  } catch {
    return {
      state: freshState(),
      issue: '本地记录无法读取。原有数据未主动删除；可在设置中导入备份。当前记录暂从新开始。',
    };
  }
}
export default function App() {
  const [initial] = useState(load);
  const [state, setState] = useState<LearningState>(initial.state);
  const [storageIssue, setStorageIssue] = useState(initial.issue);
  const [page, setPage] = useState<Page>('home');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [sceneId, setSceneId] = useState<SceneId | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  function openJourney(id: string) {
    setLessonId(null);
    setSceneId(null);
    setJourneyId(id);
    setNotice('');
  }
  const [customScene, setCustomScene] = useState<CommunicationScene | undefined>();
  function selectScene(id: SceneId) {
    setJourneyId(null);
    setCustomScene(undefined);
    setSceneId(id);
  }
  function openCustom(scene: CommunicationScene) {
    setJourneyId(null);
    setCustomScene(scene);
    setSceneId(scene.id);
  }
  const [notice, setNotice] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    if (initial.issue && state === initial.state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageIssue('');
    } catch {
      setStorageIssue(
        '浏览器未能保存数据。当前会话仍可学习，请到设置中导出备份；刷新后可能丢失进度。',
      );
    }
  }, [state, initial]);
  const learningActive = Boolean(
    (lessonId || sceneId || journeyId || page === 'review' || page === 'knowledge') &&
    state.profile,
  );
  useEffect(() => {
    if (!learningActive) return;
    let last = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === 'visible')
        setState((s) => addTime(s, (now - last) / 1000, now));
      last = now;
    }, 15000);
    const reset = () => {
      last = Date.now();
    };
    document.addEventListener('visibilitychange', reset);
    return () => {
      window.clearInterval(timer);
      if (document.visibilityState === 'visible')
        setState((s) => addTime(s, (Date.now() - last) / 1000));
      document.removeEventListener('visibilitychange', reset);
    };
  }, [learningActive]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
    window.speechSynthesis?.cancel();
  }, [page, lessonId, sceneId, journeyId, Boolean(state.profile)]);
  function saveOutputs(scene: SceneId, outputs: OutputEvidence[], courseId?: string) {
    setState((s) => ({
      ...s,
      outputs: [...(s.outputs || []), { scene, courseId, at: Date.now(), turns: outputs }].slice(
        -100,
      ),
    }));
  }
  const current = nextLesson(state);
  const due = dueLessons(state);
  const lesson = lessons.find((l) => l.id === lessonId);
  function navigate(to: Page) {
    setJourneyId(null);
    setPage(to);
    setLessonId(null);
    setSceneId(null);
    setNotice('');
  }
  function openLesson(id: string) {
    setJourneyId(null);
    if (canOpen(state, id)) {
      setPage('home');
      setSceneId(null);
      setLessonId(id);
    } else setNotice('先完成前面的必修课，再继续这一步。');
  }
  function startToday() {
    const words = state.knowledge?.records || {};
    if (
      Object.values(words).some(
        (r) => (r.understood || r.introducedAt) && r.due > 0 && r.due <= Date.now(),
      )
    )
      navigate('review');
    else
      openJourney(
        journeyPlan(
          state.journeys || {},
          state.knowledge?.goal || 'work',
          state.profile?.minutes || 20,
        ).journey.id,
      );
  }
  function continueCourse() {
    if (due.length) navigate('review');
    else if (current) openLesson(current.id);
    else navigate('explore');
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `little-by-little-${dayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice('学习记录已导出。请妥善保管备份文件。');
  }
  async function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      if (f.size > 2000000) throw new Error('备份文件过大');
      const imported = parseState(await f.text());
      setState(imported);
      setNotice('备份已导入，学习进度已恢复。');
    } catch {
      setNotice('无法导入：文件不是有效的一步英语备份，现有数据未改变。');
    }
    e.target.value = '';
  }
  if (!state.profile)
    return (
      <>
        <Onboarding
          onStart={(profile) =>
            setState((s) => ({
              ...s,
              profile,
              knowledge: { ...freshKnowledge(), goal: profile.goal || 'work' },
            }))
          }
        />
        {storageIssue && (
          <div className="storage-banner" role="alert">
            {storageIssue}
          </div>
        )}
      </>
    );
  return (
    <TeachingProvider
      records={state.journeys || {}}
      update={(journeys) => setState((s) => ({ ...s, journeys }))}
    >
      <KnowledgeProvider
        state={state.knowledge || freshKnowledge()}
        update={(knowledge) => setState((s) => ({ ...s, knowledge }))}
      >
        <div className="app-shell">
          <a className="skip-link" href="#main">
            跳到主内容
          </a>
          <aside className="sidebar">
            <Brand />
            <div className="nav-group-title">你的学习空间</div>
            <nav aria-label="主导航">
              {navigation.map((n) => (
                <button
                  key={n.id}
                  className={`nav-item ${page === n.id && !lessonId && !sceneId && !journeyId ? 'active' : ''}`}
                  aria-current={
                    page === n.id && !lessonId && !sceneId && !journeyId ? 'page' : undefined
                  }
                  onClick={() => navigate(n.id)}
                >
                  <n.icon size={20} />
                  <span>{n.label}</span>
                  {n.id === 'review' && due.length > 0 && <b>{due.length}</b>}
                </button>
              ))}
            </nav>
            <div className="sidebar-note">
              <span className="plant-icon">
                <Leaf size={32} />
              </span>
              <strong>
                每天一点，
                <br />
                离世界近一点。
              </strong>
              <p>Every little step counts.</p>
            </div>
            <button
              className={`nav-item settings-nav ${page === 'settings' ? 'active' : ''}`}
              onClick={() => navigate('settings')}
            >
              <Settings2 size={20} />
              <span>学习设置</span>
            </button>
            <div className="sidebar-footer">
              <span className="avatar">L</span>
              <div>
                英语学习者
                <small>
                  {state.profile.level === 'beginner'
                    ? 'Beginner'
                    : state.profile.level === 'advanced'
                      ? 'C1 挑战'
                      : 'B1–B2 主路径'}{' '}
                  · 每日 {state.profile.minutes} 分钟
                </small>
              </div>
            </div>
          </aside>
          <main id="main" tabIndex={-1} ref={main}>
            <header className="topbar">
              <div className="breadcrumb">
                <span>我的学习空间</span>
                <ChevronRight size={14} />
                {lesson
                  ? '课程学习'
                  : sceneId
                    ? '生活英语'
                    : page === 'settings'
                      ? '学习设置'
                      : navigation.find((n) => n.id === page)?.label}
              </div>
              <div className="topbar-right">
                <span className="local-label">
                  <span />
                  {storageIssue ? '本地记录未能保存' : '本地记录已保存'}
                </span>
                <button
                  className="icon-button"
                  aria-label="学习帮助"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <CircleHelp size={20} />
                </button>
                <span className="avatar small-avatar">L</span>
              </div>
            </header>
            {storageIssue && (
              <div className="notice warning" role="alert">
                {storageIssue}
              </div>
            )}
            {notice && (
              <div className="notice" role="status">
                {notice}
              </div>
            )}
            {showHelp && (
              <div className="notice help">
                <div>
                  <strong>一步英语如何帮助你？</strong>
                  <p>
                    首页安排一个生活阶段：观察、学词、理解、听力、模仿和简单回应。高级自由表达可选。数据只保存在当前浏览器，可导出学习和词库备份；更换设备不会自动同步。语音不作为发音评分。
                  </p>
                </div>
                <button
                  className="icon-button"
                  aria-label="关闭帮助"
                  onClick={() => setShowHelp(false)}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="page-content">
              {journeyId ? (
                <JourneyPlayer
                  key={journeyId}
                  journey={[...lifeJourneys, officeLab].find((j) => j.id === journeyId)!}
                  office3d={journeyId === officeLab.id}
                  onExit={() => navigate('home')}
                />
              ) : lesson?.track ? (
                <CommunicationPlayer
                  key={lesson.id}
                  id={lesson.scene}
                  lesson={lesson}
                  onExit={() => navigate('home')}
                  onNext={openLesson}
                  onFinish={(correct, mistakes, outputs) => {
                    setState((s) => finishLesson(s, lesson.id, correct, mistakes));
                    saveOutputs(lesson.scene, outputs, lesson.id);
                  }}
                />
              ) : lesson ? (
                <LessonPlayer
                  key={lesson.id}
                  lesson={lesson}
                  onExit={() => navigate('home')}
                  onNext={openLesson}
                  onFinish={(correct, mistakes) =>
                    setState((s) => finishLesson(s, lesson.id, correct, mistakes))
                  }
                />
              ) : sceneId && findCommunicationScene(sceneId) ? (
                <CommunicationPlayer
                  key={sceneId}
                  id={sceneId}
                  definition={customScene}
                  challenge={
                    customScene
                      ? customScene.customization?.level === 'C1'
                      : state.profile.level === 'advanced'
                  }
                  onExit={() => navigate(customScene?.knowledgeIds ? 'knowledge' : 'explore')}
                  onFinish={(_correct, mistakes, outputs) => {
                    setState((s) => {
                      let knowledge = s.knowledge || freshKnowledge();
                      for (const id of customScene?.knowledgeIds || [])
                        knowledge = recordKnowledge(
                          knowledge,
                          id,
                          outputs.some((o) => o.guided) ? 'recognize' : 'practice',
                          outputs.map((o) => o.text).join(' '),
                        );
                      if (
                        _correct !== 3 ||
                        mistakes > 0 ||
                        outputs.some((o) => o.revised && !o.guided)
                      )
                        for (const id of customScene?.knowledgeIds || [])
                          knowledge = recordKnowledge(
                            knowledge,
                            id,
                            outputs.some((o) => o.guided) ? 'miss' : 'again',
                          );
                      return {
                        ...finishScene(s, sceneId, mistakes),
                        ...(customScene?.knowledgeIds ? { knowledge } : {}),
                      };
                    });
                    saveOutputs(sceneId, outputs);
                  }}
                />
              ) : sceneId ? (
                <ScenePlayer
                  key={sceneId}
                  id={sceneId}
                  onExit={() => navigate('explore')}
                  onFinish={(mistakes) => setState((s) => finishScene(s, sceneId, mistakes))}
                />
              ) : (
                <>
                  {page === 'home' && (
                    <HomePage
                      state={state}
                      navigate={navigate}
                      openLesson={openLesson}
                      setSceneId={selectScene}
                      startToday={startToday}
                      continueCourse={continueCourse}
                      onJourney={openJourney}
                    />
                  )}
                  {page === 'knowledge' && (
                    <Suspense fallback={<p role="status">正在加载知识路线…</p>}>
                      <KnowledgePage
                        onOpen={openCustom}
                        advanced={state.profile.level === 'advanced'}
                        onJourney={openJourney}
                        onBasic={selectScene}
                      />
                    </Suspense>
                  )}
                  {page === 'path' && (
                    <PathPage
                      state={state}
                      openLesson={openLesson}
                      onLevel={(level) =>
                        setState((s) => ({
                          ...s,
                          profile: s.profile ? { ...s.profile, level } : null,
                        }))
                      }
                    />
                  )}
                  {page === 'explore' && (
                    <ExplorePage
                      onCustom={openCustom}
                      state={state}
                      setSceneId={selectScene}
                      onJourney={openJourney}
                      onLevel={(level) =>
                        setState((s) => ({
                          ...s,
                          profile: s.profile ? { ...s.profile, level } : null,
                        }))
                      }
                    />
                  )}
                  {page === 'review' && (
                    <ReviewPanel
                      state={state}
                      onExit={() => navigate('home')}
                      onReview={(id, correct) => setState((s) => reviewSkill(s, id, correct))}
                    />
                  )}
                  {page === 'progress' && (
                    <ProgressPage state={state} navigate={navigate} exportData={exportData} />
                  )}
                  {page === 'settings' && (
                    <SettingsPage
                      state={state}
                      setState={setState}
                      exportData={exportData}
                      importData={importData}
                      onReset={() => {
                        if (
                          window.confirm(
                            '确定清空本浏览器的学习记录吗？请先导出备份。此操作不会影响其他设备。',
                          )
                        ) {
                          setLessonId(null);
                          setSceneId(null);
                          setJourneyId(null);
                          setPage('home');
                          setState(freshState());
                        }
                      }}
                    />
                  )}
                </>
              )}
              <footer className="page-footer">
                <span>
                  <Leaf size={14} />
                  Little by little, a little becomes a lot.
                </span>
                <span>一步英语 · 本地学习，轻松开始</span>
              </footer>
            </div>
          </main>
        </div>
      </KnowledgeProvider>
    </TeachingProvider>
  );
}
