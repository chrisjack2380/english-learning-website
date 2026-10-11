import { Person } from './World';
import type { CommunicationScene } from '../advanced-content';
import { findCommunicationScene } from '../advanced-content';
export function CommunicationWorld({
  scene,
  step = 0,
  playing = true,
  hero = false,
  onInspect,
  definition,
}: {
  scene: CommunicationScene['id'];
  step?: number;
  playing?: boolean;
  hero?: boolean;
  onInspect?: (item: string) => void;
  definition?: CommunicationScene;
}) {
  const data = definition || findCommunicationScene(scene)!;
  const social = data.environment.kind === 'lounge';
  const service = data.environment.kind === 'service';
  const stages = data.environment.stages;
  return (
    <div
      className={`world communication-world ${playing ? '' : 'paused'} ${hero ? 'hero-world' : ''}`}
    >
      <svg
        viewBox="0 0 540 310"
        role="img"
        aria-label={`${data.environment.name}：角色互动与任务进展`}
      >
        <rect width="540" height="310" fill={social ? '#e9eee5' : '#e5eaee'} />
        <rect x="22" y="25" width="175" height="134" rx="6" fill="#f6f3e9" />
        <path d="M22 122h175M110 25v134" stroke="#fff" strokeWidth="7" />
        <path d="M34 122V91h27v31m9 0V65h25v57m28 0V83h30v39m8 0V54h25v68" fill="#bccbc4" />
        <circle cx="54" cy="51" r="15" fill="#efc476" />
        <path d="M0 211h540v99H0Z" fill={social ? '#d6dcca' : '#d9d1c4'} />
        <path d="M0 264h540M95 211v99M295 211v99M495 211v99" stroke="#c2beaf" strokeWidth="2" />
        <rect x="221" y="25" width="294" height="141" rx="10" fill="#304d49" />
        <text x="242" y="49" fill="#c7ddd2" fontSize="11" letterSpacing="2">
          {data.environment.heading.slice(0, 38)}
        </text>
        <text x="242" y="75" fill="white" fontSize="15">
          {stages[Math.min(step, stages.length - 1)]}
        </text>
        {data.environment.objects.slice(0, 3).map((label, i) => (
          <g key={label}>
            <rect
              x={241 + i * 87}
              y="92"
              width="76"
              height="48"
              rx="5"
              fill={i === step % 3 ? '#e4b178' : '#5e7870'}
            />
            <text x={247 + i * 87} y="112" fontSize="10" fill={i === step % 3 ? '#304d49' : '#fff'}>
              {label}
            </text>
            <path d={`M${249 + i * 87} 122h46`} stroke="#ffffff88" strokeWidth="3" />
          </g>
        ))}
        <Person x={social ? 163 : 126} y={173} color="#587b72" wave={step % 2 === 0} />
        <Person x={social ? 373 : 419} y={173} color="#c98061" wave={step % 2 === 1} flip />
        <ellipse cx="276" cy="230" rx={social ? 60 : service ? 120 : 154} ry="20" fill="#a48262" />
        <path d="M163 235v63M389 235v63" stroke="#776450" strokeWidth="7" />
        {!social && (
          <>
            <rect x="226" y="187" width="74" height="42" rx="4" fill="#556963" />
            <path d="M221 230h86" stroke="#475c54" strokeWidth="5" />
            <rect x="235" y="195" width="56" height="25" rx="2" fill="#dce5d9" />
          </>
        )}
        <rect x="344" y="215" width="16" height="18" rx="3" fill="#f6eddc" />
        <path d="M48 241q-29-20-17-48q22 7 17 48m0 0q31-17 22-44q-25 6-22 44" fill="#6b8870" />
        <path d="M31 241h34l-4 47H36Z" fill="#d7b69b" />
        <g className="task-signal">
          <circle cx="272" cy="177" r="6" fill="#d9895f" />
        </g>
      </svg>
      {onInspect && (
        <div className="world-hotspots">
          <button onClick={() => onInspect('context')}>查看情境信息</button>
          <button onClick={() => onInspect('goal')}>查看沟通目标</button>
        </div>
      )}
    </div>
  );
}
