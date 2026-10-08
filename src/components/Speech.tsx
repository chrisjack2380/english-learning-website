import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';
import clips from '../audio-manifest.json';
let activeAudio: HTMLAudioElement | null = null;

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
function speechConstructor() {
  return (
    (
      window as unknown as {
        SpeechRecognition?: new () => Recognition;
        webkitSpeechRecognition?: new () => Recognition;
      }
    ).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => Recognition })
      .webkitSpeechRecognition
  );
}
export function Speak({ text, compact = false }: { text: string; compact?: boolean }) {
  const [slow, setSlow] = useState(false);
  const [status, setStatus] = useState('');
  const [playing, setPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(
    () => () => {
      if (utteranceRef.current) {
        utteranceRef.current.onerror = null;
        utteranceRef.current.onend = null;
        window.speechSynthesis?.cancel();
      }
      audioRef.current?.pause();
    },
    [],
  );
  function playClip() {
    const file = (clips as Record<string, string>)[text];
    if (!file) {
      setStatus('这段文字没有备用音频，请阅读英文文本。');
      return;
    }
    activeAudio?.pause();
    const a = new Audio(`/audio/${file}`);
    audioRef.current = a;
    activeAudio = a;
    a.playbackRate = slow ? 0.7 : 1;
    a.onplaying = () => {
      setPlaying(true);
      setStatus('正在播放备用英文合成音频');
    };
    a.onended = () => {
      setPlaying(false);
      setStatus('播放结束，可重复收听');
    };
    a.onpause = () => setPlaying(false);
    a.onerror = () => {
      setPlaying(false);
      setStatus('音频加载失败，请阅读英文文本或稍后重试。');
    };
    a.play().catch(() => {
      setPlaying(false);
      setStatus('浏览器暂未允许音频播放，请再次点击或使用文本。');
    });
  }
  function play() {
    audioRef.current?.pause();
    activeAudio?.pause();
    window.speechSynthesis?.cancel();
    const voice = window.speechSynthesis?.getVoices().find((v) => /^en[-_]/i.test(v.lang));
    if (!voice || !('SpeechSynthesisUtterance' in window)) {
      playClip();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = slow ? 0.7 : 0.95;
    u.voice = voice;
    u.onstart = () => {
      setPlaying(true);
      setStatus('正在播放系统英文语音');
    };
    u.onend = () => {
      setPlaying(false);
      setStatus('播放结束，可重复收听');
    };
    u.onerror = (event) => {
      setPlaying(false);
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      playClip();
    };
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setStatus('准备播放');
  }
  return (
    <div className={`speech ${compact ? 'compact' : ''}`}>
      <button
        type="button"
        className="button ghost small"
        onClick={play}
        aria-label={`播放英文 ${text}`}
      >
        <Volume2 size={17} />
        {compact ? '收听' : '播放英文'}
      </button>
      <button
        type="button"
        className={`speed ${slow ? 'active' : ''}`}
        aria-pressed={slow}
        onClick={() => setSlow(!slow)}
        aria-label="切换慢速播放"
      >
        {slow ? '0.7×' : '1×'}
      </button>
      {playing && (
        <button
          type="button"
          className="icon-button"
          aria-label="停止语音"
          onClick={() => {
            window.speechSynthesis?.cancel();
            audioRef.current?.pause();
            setPlaying(false);
            setStatus('已停止');
          }}
        >
          <Square size={14} />
        </button>
      )}
      {status && (
        <span role="status" className="speech-status">
          {status}
        </span>
      )}
    </div>
  );
}
export function VoiceInput({ onText }: { onText: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const recognition = useRef<Recognition | null>(null);
  useEffect(() => () => recognition.current?.abort(), []);
  function start() {
    const Constructor = speechConstructor();
    if (!Constructor) {
      setStatus('此浏览器不支持语音识别，请直接输入英文。');
      return;
    }
    if (!window.isSecureContext) {
      setStatus('语音输入需要 HTTPS 或本机安全环境，请使用文字输入。');
      return;
    }
    const r = new Constructor();
    recognition.current = r;
    r.lang = 'en-US';
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      onText(e.results[0][0].transcript);
      setStatus('识别结果已填入，可修改后提交。识别结果不代表发音评分。');
    };
    r.onerror = (e) => {
      setListening(false);
      setStatus(
        e.error === 'not-allowed'
          ? '麦克风权限被拒绝。请在浏览器站点设置中允许麦克风，或直接输入文字。'
          : e.error === 'no-speech'
            ? '没有识别到语音，请重试或输入文字。'
            : '语音识别暂不可用，请使用文字输入。',
      );
    };
    r.onend = () => setListening(false);
    setListening(true);
    setStatus('请允许浏览器使用麦克风，然后用英语回答。');
    try {
      r.start();
    } catch {
      setListening(false);
      setStatus('麦克风暂不可用，请直接输入文字。');
    }
  }
  return (
    <div className="voice-input">
      <button
        className={`button ghost small ${listening ? 'listening' : ''}`}
        type="button"
        onClick={() => (listening ? recognition.current?.stop() : start())}
      >
        <Mic size={17} />
        {listening ? '停止录音' : '用语音回答'}
      </button>
      {status && (
        <p role="status" className="muted">
          {status}
        </p>
      )}
    </div>
  );
}
