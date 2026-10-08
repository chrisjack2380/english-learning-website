import { useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import type { Lesson, SceneId } from '../content';

function Person({
  x,
  y,
  color = '#476d60',
  wave = false,
  flip = false,
}: {
  x: number;
  y: number;
  color?: string;
  wave?: boolean;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}`}>
      <ellipse cx="0" cy="112" rx="33" ry="9" fill="#283f3520" />
      <path
        d="M-17 62L-18 104M16 62L23 104"
        stroke="#3d4545"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path d="M-22 108h16M15 108h17" stroke="#eee8de" strokeWidth="11" strokeLinecap="round" />
      <path d="M-25 27Q0 15 25 27L23 68H-23Z" fill={color} />
      <path d="M-24 31L-36 65" stroke={color} strokeWidth="13" strokeLinecap="round" />
      <g className={wave ? 'waving-arm' : ''} style={{ transformOrigin: '23px 29px' }}>
        <path d="M23 29L39 7" stroke={color} strokeWidth="13" strokeLinecap="round" />
        <circle cx="42" cy="0" r="7" fill="#dda77e" />
      </g>
      <rect x="-7" y="10" width="14" height="17" rx="5" fill="#dda77e" />
      <ellipse cy="-5" rx="23" ry="27" fill="#e7b990" />
      <path d="M-23-5Q-26-40 8-34Q31-27 23-7L16-19Q-9-13-17-20L-19-3Z" fill="#373937" />
      <circle cx="-8" cy="-5" r="2" fill="#353937" />
      <circle cx="9" cy="-5" r="2" fill="#353937" />
      <path d="M-5 6Q0 12 7 6" stroke="#a5664e" fill="none" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}
function Cup({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M17-14H26Q43-12 35 4Q31 12 21 8" stroke="#d97853" fill="none" strokeWidth="5" />
      <path d="M-21-19H23L18 15Q0 23-16 15Z" fill="#fff8ec" stroke="#d97853" strokeWidth="3" />
      <ellipse cy="-19" rx="22" ry="5" fill="#976b4a" />
      <path
        className="steam"
        d="M-9-29q-6-9 0-15M4-28q7-9 0-16"
        stroke="#c58868"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}
export function World({
  scene = 'greeting',
  step = 0,
  playing = true,
  hero = false,
  onInspect,
  greetingMode,
}: {
  scene?: SceneId;
  greetingMode?: 'hello' | 'name' | 'meet' | 'bye';
  step?: number;
  playing?: boolean;
  hero?: boolean;
  onInspect?: (item: string) => void;
}) {
  const greeting = greetingMode || (step > 1 ? 'meet' : 'hello');
  const labels = {
    hello: ['Hello!', 'Hi!'],
    name: ["I'm Lin.", "I'm Alex."],
    meet: ['Nice to meet you.', 'Nice to meet you, too.'],
    bye: ['Goodbye!', 'See you later!'],
  }[greeting];
  const wideLeft = labels[0].length > 11;
  const wideRight = labels[1].length > 11;
  return (
    <div className={`world ${scene} ${playing ? '' : 'paused'} ${hero ? 'hero-world' : ''}`}>
      <svg
        viewBox="0 0 540 310"
        role="img"
        aria-label={
          scene === 'greeting'
            ? '原创公园场景，两位角色正在打招呼'
            : scene === 'cafe'
              ? '原创咖啡店场景，杯型、菜单和店员'
              : '原创街区地图，角色直行后右转到咖啡店'
        }
      >
        {scene === 'greeting' && (
          <>
            <rect width="540" height="310" fill="#e6eadb" />
            <circle cx="444" cy="57" r="27" fill="#f3c979" />
            <path d="M0 209Q116 159 236 207T540 185V310H0Z" fill="#cdd7bb" />
            <path d="M0 267Q120 222 290 266T540 260V310H0Z" fill="#dce1ca" />
            <path d="M56 149V244" stroke="#ab9371" strokeWidth="11" />
            <ellipse cx="55" cy="111" rx="42" ry="61" fill="#8fa47c" />
            <path d="M476 155V231" stroke="#ab9371" strokeWidth="9" />
            <ellipse cx="476" cy="116" rx="35" ry="51" fill="#9caa81" />
            <path
              d="M354 206H447M368 188H438M369 185V227M432 185V227"
              stroke="#a59476"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <Person x={205} y={138} wave color="#d97756" />
            <Person x={318} y={144} flip wave={step > 0} color="#547364" />
            <g className="speech-bubble">
              <rect
                x={wideLeft ? 85 : 125}
                y="40"
                width={wideLeft ? 202 : 122}
                height="48"
                rx="16"
                fill="#fffaf1"
              />
              <path d="M190 85l14 16 3-16" fill="#fffaf1" />
              <text
                x="186"
                y="70"
                textAnchor="middle"
                fontSize={wideLeft ? 15 : 22}
                fontWeight="600"
                fill="#3e5347"
              >
                {labels[0]}
              </text>
            </g>
            <g className="speech-bubble second">
              <rect
                x="302"
                y="61"
                width={wideRight ? 190 : 90}
                height="41"
                rx="14"
                fill="#fffaf1"
              />
              <path d="M326 100l-5 12 19-12" fill="#fffaf1" />
              <text
                x={wideRight ? 397 : 347}
                y="88"
                textAnchor="middle"
                fontSize={wideRight ? 14 : 17}
                fill="#3e5347"
              >
                {labels[1]}
              </text>
            </g>
            <path
              d="M111 244l7-17 8 17M452 265l5-13 6 13"
              stroke="#91a479"
              fill="none"
              strokeWidth="3"
            />
            <circle cx="89" cy="207" r="5" fill="#fff7e8" />
            <circle cx="99" cy="200" r="4" fill="#e9ad8e" />
          </>
        )}
        {scene === 'cafe' && (
          <>
            <rect width="540" height="310" fill="#f4deca" />
            <rect x="26" y="25" width="113" height="132" rx="55" fill="#d2dfd8" />
            <path d="M83 28v126M29 89h106" stroke="#fff4e3" strokeWidth="6" />
            <rect x="191" y="25" width="135" height="91" rx="5" fill="#4b6259" />
            <text x="258" y="53" textAnchor="middle" fill="#f8e4c0" fontSize="18">
              LITTLE CAFE
            </text>
            <text x="258" y="82" textAnchor="middle" fill="#fff8eb" fontSize="14">
              SMALL $3 · LARGE $4
            </text>
            <path d="M431 0v46" stroke="#685d4e" strokeWidth="4" />
            <path d="M412 43h38l13 22h-64Z" fill="#cc885f" />
            <Person x={364} y={157} color="#628171" wave={step === 0} />
            <rect x="154" y="204" width="368" height="106" rx="5" fill="#b98364" />
            <rect x="145" y="190" width="386" height="18" rx="7" fill="#82573f" />
            <path d="M171 227h334M171 247h334M171 267h334" stroke="#ad7658" strokeWidth="2" />
            <Cup x={240} y={173} scale={0.65} />
            <Cup x={290} y={169} scale={1} />
            <Person x={83} y={182} color="#dc7859" />
            <path d="M425 131h55v55h-55z" fill="#ece5d4" />
            <circle cx="451" cy="148" r="9" fill="#8b9e85" />
            <path d="M436 165h31" stroke="#8b9e85" strokeWidth="3" />
            {step >= 3 && (
              <g className="delivered">
                <Cup x={183} y={236} />
                <text x="187" y="279" textAnchor="middle" fontSize="12" fill="#fff9eb">
                  YOUR COFFEE
                </text>
              </g>
            )}
          </>
        )}
        {scene === 'directions' && (
          <>
            <rect width="540" height="310" fill="#dfe8df" />
            <rect x="219" y="0" width="77" height="310" fill="#faf4e5" />
            <rect y="97" width="540" height="65" fill="#faf4e5" />
            <path
              d="M258 283V130H435"
              stroke="#bdc7b6"
              fill="none"
              strokeWidth="3"
              strokeDasharray="7 8"
            />
            <rect x="32" y="32" width="153" height="55" rx="10" fill="#98b0bd" />
            <text x="109" y="66" textAnchor="middle" fill="#fff" fontSize="19">
              BOOKSHOP
            </text>
            <rect x="330" y="184" width="172" height="82" rx="9" fill="#d49671" />
            <path d="M323 179h184l-13-22H337Z" fill="#b77957" />
            <text x="416" y="218" textAnchor="middle" fill="#fff8ed" fontSize="22">
              CAFE
            </text>
            <path d="M395 234h35v32h-35" fill="#fff0d5" />
            <rect x="31" y="197" width="146" height="87" rx="16" fill="#b6c7a8" />
            <circle cx="67" cy="224" r="20" fill="#7e9d78" />
            <circle cx="133" cy="251" r="22" fill="#8ca882" />
            <text x="102" y="272" textAnchor="middle" fill="#526c50" fontSize="14">
              PARK
            </text>
            <circle cx="378" cy="52" r="21" fill="#91ac84" />
            <circle cx="448" cy="48" r="27" fill="#a4b893" />
            <g
              className="map-person"
              style={{
                transform:
                  step >= 3
                    ? 'translate(160px, -125px)'
                    : step >= 2
                      ? 'translate(0px, -125px)'
                      : 'translate(0px, 0px)',
              }}
            >
              <circle cx="257" cy="267" r="14" fill="#d36445" />
              <path d="M250 270l7-8 7 8" stroke="#fff" fill="none" strokeWidth="3" />
            </g>
            <text x="303" y="293" fill="#55634e" fontSize="13">
              ↑ 行进方向
            </text>
            {step >= 3 && (
              <text x="415" y="117" textAnchor="middle" fontSize="15" fill="#486246">
                You made it!
              </text>
            )}
          </>
        )}
      </svg>
      {onInspect && (
        <div className="world-hotspots">
          {(scene === 'greeting'
            ? ['Hello', 'Alex']
            : scene === 'cafe'
              ? ['Small cup', 'Large cup', 'Menu']
              : ['Cafe', 'Go straight', 'Turn right']
          ).map((item) => (
            <button key={item} type="button" onClick={() => onInspect(item)}>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function VisualLesson({ lesson }: { lesson: Lesson }) {
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState(0);
  const [inspect, setInspect] = useState('');
  const descriptions: Record<Lesson['visual'], string[]> = {
    greeting: ['见面 → Hello!', '回应 → Hi!', '初次认识 → Nice to meet you.'],
    pronouns: ['Lin 说话：I am Lin.', 'Alex 说话：I am Alex.', 'You 指向听话的人。'],
    plural: ['One cup · 一个杯子', 'Two cups · 两个杯子，加 s', 'Three cups · 三个杯子，加 s'],
    order: ['I’d like … · 我想要……', 'a coffee · 一份咖啡', 'please · 礼貌请求'],
    position: ['On · 在表面上', 'Under · 在下面', 'In · 在里面'],
    direction: ['从箭头处出发', 'Go straight · 直走到街角', 'Turn right · 右转到咖啡店'],
  };
  return (
    <div className="visual-lesson">
      {lesson.visual === 'pronouns' ? (
        <div className={`world ${playing ? '' : 'paused'}`}>
          <svg viewBox="0 0 540 310" role="img" aria-label={descriptions.pronouns[step]}>
            <rect width="540" height="310" fill="#e6eadb" />
            <path d="M0 257H540V310H0Z" fill="#d3dcc2" />
            <Person x={150} y={146} color="#d97756" wave={step !== 1} />
            <Person x={390} y={146} color="#547364" wave={step === 1} />
            <rect x="36" y="26" width="226" height="73" rx="18" fill="#fffaf1" />
            <rect x="277" y="26" width="226" height="73" rx="18" fill="#fffaf1" />
            <text x="149" y="57" textAnchor="middle" fontSize="16" fill="#788268">
              Lin {step === 1 ? '· 听话的人' : '· 说话的人'}
            </text>
            <text x="149" y="84" textAnchor="middle" fontSize="20" fill="#3e5347">
              {step === 2 ? 'You are Alex.' : step === 1 ? '← You: Lin' : 'I am Lin.'}
            </text>
            <text x="390" y="57" textAnchor="middle" fontSize="16" fill="#788268">
              Alex {step === 1 ? '· 说话的人' : '· 听话的人'}
            </text>
            <text x="390" y="84" textAnchor="middle" fontSize="20" fill="#3e5347">
              {step === 1 ? 'I am Alex.' : step === 2 ? '← You: Alex' : '← You: Alex'}
            </text>
            <text x="270" y="294" textAnchor="middle" fontSize="15" fill="#67785b">
              I = 当前说话的人 · you = 听话的人
            </text>
          </svg>
        </div>
      ) : lesson.visual === 'plural' || lesson.visual === 'position' ? (
        <div className={`world teaching-world ${playing ? '' : 'paused'}`}>
          <svg viewBox="0 0 540 310" role="img" aria-label={descriptions[lesson.visual][step]}>
            <rect width="540" height="310" fill="#f1e6d6" />
            <rect x="112" y="145" width="320" height="18" rx="9" fill="#937257" />
            <path d="M141 164v114M405 164v114" stroke="#a98769" strokeWidth="14" />
            {lesson.visual === 'plural' ? (
              Array.from({ length: step + 1 }, (_, i) => <Cup key={i} x={190 + i * 85} y={126} />)
            ) : (
              <>
                <path d="M220 103h101v42H220Z" fill="#c99b73" />
                <path d="M220 103l-16-13h100l17 13" fill="#dcb38a" />
                <g
                  className="moving-cup"
                  style={{
                    transform: `translate(${step === 2 ? 0 : -110}px, ${step === 1 ? 114 : step === 2 ? -1 : 0}px)`,
                  }}
                >
                  <Cup x={270} y={126} />
                </g>
                {step === 2 && <path d="M220 126H321V145H220Z" fill="#c99b73" />}
              </>
            )}
            <text x="270" y="48" textAnchor="middle" fill="#586247" fontSize="25">
              {descriptions[lesson.visual][step]}
            </text>
          </svg>
        </div>
      ) : (
        <World scene={lesson.scene} step={step} playing={playing} onInspect={setInspect} />
      )}
      <div className="animation-controls">
        <button
          type="button"
          className="icon-button"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? '暂停动画' : '播放动画'}
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => {
            setStep(0);
            setPlaying(true);
            setInspect('');
          }}
          aria-label="重播动画"
        >
          <RotateCcw size={17} />
        </button>
        <span aria-live="polite">{descriptions[lesson.visual][step]}</span>
        <button
          type="button"
          className="button ghost small"
          onClick={() => setStep((step + 1) % 3)}
        >
          <SkipForward size={16} />
          下一步演示
        </button>
      </div>
      {lesson.visual === 'order' && (
        <div className="sentence-builder" aria-label="礼貌点餐句型组成">
          {['I’d like', 'a coffee', 'please'].map((piece, i) => (
            <span key={piece} className={i === step ? 'active' : ''}>
              {piece}
              {i === 1 ? ',' : ''}
              {i === 2 ? '.' : ''}
            </span>
          ))}
        </div>
      )}
      <div className="concept-tabs">
        {descriptions[lesson.visual].map((text, i) => (
          <button
            className={i === step ? 'selected' : ''}
            aria-pressed={i === step}
            type="button"
            onClick={() => setStep(i)}
            key={text}
          >
            {text}
          </button>
        ))}
      </div>
      {inspect && (
        <p role="status" className="note">
          {inspect}：
          {inspect === 'Hello'
            ? '见面时的友好问候。'
            : inspect === 'Alex'
              ? '这是听话的人，可以说 You are Alex.'
              : inspect === 'Small cup'
                ? '小杯，small；咖啡三美元。'
                : inspect === 'Large cup'
                  ? '大杯，large；咖啡四美元。'
                  : inspect === 'Menu'
                    ? '菜单：small $3 / large $4。'
                    : inspect === 'Cafe'
                      ? '咖啡店位于街角右侧。'
                      : inspect === 'Go straight'
                        ? '沿当前前进方向直行。'
                        : '相对于前进方向右转。'}
        </p>
      )}
    </div>
  );
}
