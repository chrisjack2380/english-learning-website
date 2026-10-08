import { useEffect, useRef, useState } from 'react';
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
  const learningActive = Boolean((lessonId || sceneId || page === 'review') && state.profile);
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
  }, [page, lessonId, sceneId, Boolean(state.profile)]);
  const current = nextLesson(state);
  const due = dueLessons(state);
  const lesson = lessons.find((l) => l.id === lessonId);
  function navigate(to: Page) {
    setPage(to);
    setLessonId(null);
    setSceneId(null);
    setNotice('');
  }
  function openLesson(id: string) {
    if (canOpen(state, id)) {
      setPage('home');
      setSceneId(null);
      setLessonId(id);
    } else setNotice('先完成前面的必修课，再继续这一步。');
  }
  function startToday() {
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
        <Onboarding onStart={(profile) => setState((s) => ({ ...s, profile }))} />
        {storageIssue && (
          <div className="storage-banner" role="alert">
            {storageIssue}
          </div>
        )}
      </>
    );
  return (
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
              className={`nav-item ${page === n.id && !lessonId && !sceneId ? 'active' : ''}`}
              aria-current={page === n.id && !lessonId && !sceneId ? 'page' : undefined}
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
              {state.profile.level === 'beginner' ? '零基础起步' : '基础巩固'} · 每日{' '}
              {state.profile.minutes} 分钟
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
                每天先复习，再学习推荐课程。完成练习和场景后解锁下一课。所有数据只保存在当前浏览器，可在设置导出备份。语音能力取决于浏览器，不作为发音评分。
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
          {lesson ? (
            <LessonPlayer
              key={lesson.id}
              lesson={lesson}
              onExit={() => navigate('home')}
              onNext={openLesson}
              onFinish={(correct, mistakes) =>
                setState((s) => finishLesson(s, lesson.id, correct, mistakes))
              }
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
                  setSceneId={setSceneId}
                  startToday={startToday}
                />
              )}
              {page === 'path' && <PathPage state={state} openLesson={openLesson} />}
              {page === 'explore' && <ExplorePage state={state} setSceneId={setSceneId} />}
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
  );
}
