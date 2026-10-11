// Build-time only. The site distributes generated audio, not eSpeak binaries.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { build } from 'vite';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Lesson, Scene } from '../src/content';
const bundleTemp = mkdtempSync(join(tmpdir(), 'english-content-'));
await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    ssr: 'src/content.ts',
    outDir: bundleTemp,
    rollupOptions: { output: { entryFileNames: 'content.mjs' } },
  },
});
const { lessons, scenes, sceneForLesson, communicationScenes, upgradeExpression } = (await import(
  pathToFileURL(join(bundleTemp, 'content.mjs')).href
)) as {
  lessons: Lesson[];
  scenes: Scene[];
  sceneForLesson: (id: string) => Scene;
  communicationScenes: import('../src/advanced-content').CommunicationScene[];
  upgradeExpression: typeof import('../src/communication').upgradeExpression;
};
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
for (const s of communicationScenes) s.turns.forEach((t) => phrases.add(t.followUp));
for (const input of [
  'I really like this product.',
  "I don't agree.",
  'What do you do?',
  'We need more time.',
  'Our product is good.',
]) {
  const result = upgradeExpression(input);
  if (result.suggestion) {
    phrases.add(result.suggestion.natural);
    phrases.add(result.suggestion.advanced);
  }
}
const manifest: Record<string, string> = JSON.parse(
  readFileSync('src/audio-manifest.json', 'utf8'),
);
const taskTemp = mkdtempSync(join(tmpdir(), 'english-audio-'));
mkdirSync('public/audio', { recursive: true });
try {
  let count = 0;
  for (const phrase of [...phrases].sort()) {
    if (manifest[phrase] && !process.env.REGENERATE_AUDIO) continue;
    count++;
    const filename =
      manifest[phrase] ||
      `task-${createHash('sha256').update(phrase).digest('hex').slice(0, 12)}.mp3`;
    const wav = join(taskTemp, 'phrase.wav');
    execFileSync(
      process.env.ESPEAK_BIN || 'espeak-ng',
      [
        '-D',
        '-v',
        'en-us',
        '-s',
        lessons.filter((l) => !l.track).some((l) => l.examples.some((e) => e.en === phrase))
          ? '145'
          : '180',
        '-w',
        wav,
        phrase,
      ],
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
  console.log(
    `Generated ${Object.keys(manifest).length} English audio clips (${count} new or regenerated).`,
  );
} finally {
  rmSync(taskTemp, { recursive: true, force: true });
  rmSync(bundleTemp, { recursive: true, force: true });
}
