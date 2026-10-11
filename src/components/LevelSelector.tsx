import type { Profile } from '../learning';
import { trackInfo, type Track } from '../advanced-content';
export function LevelSelector({
  value,
  onChange,
}: {
  value: Profile['level'];
  onChange: (level: Profile['level']) => void;
}) {
  const mapped: Record<Track, Profile['level']> = {
    beginner: 'beginner',
    intermediate: 'basics',
    advanced: 'advanced',
  };
  return (
    <div className="level-selector" role="group" aria-label="选择学习等级">
      {(Object.keys(trackInfo) as Track[]).map((key) => (
        <button
          key={key}
          className={value === mapped[key] ? 'selected' : ''}
          aria-pressed={value === mapped[key]}
          onClick={() => onChange(mapped[key])}
        >
          <strong>
            {trackInfo[key].name} · {trackInfo[key].level}
          </strong>
          <small>{trackInfo[key].description}</small>
        </button>
      ))}
    </div>
  );
}
