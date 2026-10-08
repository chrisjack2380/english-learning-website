import { useRef, type Dispatch, type SetStateAction } from 'react';
import { ArrowDownToLine, Upload } from 'lucide-react';
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
        <h2>语音与未来 AI 教学</h2>
        <p>
          英文播放优先使用设备的系统语音，没有英文声音时播放网站自带的备用合成音频；语音输入仅在浏览器支持且允许麦克风时启用，也可能需要浏览器厂商的网络服务。你可以随时用文字完成全部学习。
        </p>
        <p className="note">
          本阶段不对发音打分，不包含付费模型自由对话。已预留安全服务端接口；未来密钥由服务端保管，不在浏览器中收集或保存
          API Key。
        </p>
      </section>
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
