// Build-time only. The site distributes generated audio, not eSpeak binaries.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { lessons, scenes, sceneForLesson } from '../src/content.ts';
const phrases = new Set<string>();
for (const l of lessons) {
  l.examples.forEach((e) => phrases.add(e.en));
  l.questions.forEach((q) => {
    if (q.english) phrases.add(q.english);
  });
}
for (const s of [...scenes, ...lessons.map((l) => sceneForLesson(l.id))]) {
  s.expressions.forEach((e) => phrases.add(e.en));
  s.turns.forEach((t) => {
    phrases.add(t.line);
    phrases.add(t.sample);
  });
}
const manifest: Record<string, string> = {};
const taskTemp = mkdtempSync(join(tmpdir(), 'english-audio-'));
mkdirSync('public/audio', { recursive: true });
try {
  let i = 0;
  for (const phrase of [...phrases].sort()) {
    const filename = `phrase-${String(++i).padStart(3, '0')}.mp3`;
    const wav = join(taskTemp, 'phrase.wav');
    execFileSync(
      process.env.ESPEAK_BIN || 'espeak-ng',
      ['-D', '-v', 'en-us', '-s', '145', '-w', wav, phrase],
      { stdio: 'pipe' },
    );
    if (statSync(wav).size < 100) throw new Error('Invalid generated waveform');
    execFileSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        wav,
        '-codec:a',
        'libmp3lame',
        '-q:a',
        '5',
        resolve('public/audio', filename),
      ],
      { stdio: 'pipe' },
    );
    manifest[phrase] = filename;
  }
  writeFileSync('src/audio-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Generated ${Object.keys(manifest).length} English audio clips.`);
} finally {
  rmSync(taskTemp, { recursive: true, force: true });
}
