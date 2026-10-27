import { useKnowledge } from '../components/KnowledgeContext';
import { goalLabels, type LearningGoal } from '../knowledge';
import { useRef, type Dispatch, type SetStateAction } from 'react';
import { ArrowDownToLine, Upload } from 'lucide-react';
import { ModelSettings } from '../components/ModelSettings';
import { LevelSelector } from '../components/LevelSelector';
import type { LearningState } from '../learning';
export function SettingsPage({
  state,
  setState,
  exportData,
  importData,
  onReset,
}: {
  state: LearningState;
  setState: Dispatch<SetStateAction<LearningState>>;
  exportData: () => void;
  importData: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onReset: () => void;
}) {
  const knowledge = useKnowledge();
  const file = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR PACE, YOUR WAY</p>
          <h1>找到适合你的节奏。</h1>
          <p className="muted">轻松开始，稳定坚持。</p>
        </div>
      </div>
      <section className="card settings-card">
        <h2>个人学习目标</h2>
        <label>
          目标路线
          <select
            aria-label="目标路线"
            value={knowledge.state.goal}
            onChange={(e) =>
              knowledge.update({ ...knowledge.state, goal: e.target.value as LearningGoal })
            }
          >
            {Object.entries(goalLabels).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <p>知识首页根据目标、等级及到期记录推荐，原系统必修课进度不变。</p>
      </section>
      <section className="card settings-card">
        <h2>学习等级与推荐起点</h2>
        <p>已有基础默认进入 B1–B2。切换路径保留所有已完成课程和复习记录。</p>
        <LevelSelector
          value={state.profile!.level}
          onChange={(level) =>
            setState((s) => ({ ...s, profile: s.profile ? { ...s.profile, level } : null }))
          }
        />
      </section>
      <section className="card settings-card">
        <h2>每日学习时长</h2>
        <p>调整后，首页会重新安排课程数量。已学进度不会改变。</p>
        <div className="duration-options">
          {([10, 20, 30] as const).map((n) => (
            <button
              key={n}
              className={state.profile?.minutes === n ? 'selected' : ''}
              aria-pressed={state.profile?.minutes === n}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  profile: s.profile ? { ...s.profile, minutes: n } : null,
                }))
              }
            >
              <strong>{n}</strong> 分钟
              <small>{n === 10 ? '轻松起步' : n === 20 ? '稳步前进' : '沉浸学习'}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="card settings-card">
        <h2>本地记录与备份</h2>
        <p>
          无需账号。记录保存在本设备、当前浏览器中；清除网站数据、无痕模式或更换设备可能丢失记录，不会自动同步。导入备份会替换当前记录。
        </p>
        <div className="row wrap">
          <button className="button primary" onClick={exportData}>
            <ArrowDownToLine size={17} />
            导出学习备份
          </button>
          <button className="button ghost" onClick={() => file.current?.click()}>
            <Upload size={17} />
            导入学习备份
          </button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="导入学习备份文件"
            onChange={importData}
          />
        </div>
      </section>
      <section className="card settings-card">
        <h2>语音与 AI 接入状态</h2>
        <p>
          英文播放优先使用设备的系统语音，没有英文声音时播放网站自带的备用合成音频；语音输入仅在浏览器支持且允许麦克风时启用，也可能需要浏览器厂商的网络服务。你可以随时用文字完成全部学习。
        </p>
        <p className="note">
          默认使用预设角色与本地反馈。可在下方选择自己的模型，主动开启真实 AI
          追问、表达分析和场景改写；反馈会明确标记来源。
        </p>
      </section>
      <ModelSettings />
      <section className="card settings-card reset-card">
        <h2>重新开始</h2>
        <p>清空当前浏览器学习记录并重新选择起点。建议先导出备份。</p>
        <button className="button danger" onClick={onReset}>
          清空记录，重新开始
        </button>
      </section>
    </>
  );
}
