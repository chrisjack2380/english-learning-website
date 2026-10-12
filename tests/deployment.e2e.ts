import { test, expect } from '@playwright/test';
import clips from '../src/audio-manifest.json' with { type: 'json' };

test('all bundled audio resources return real audio instead of an HTML fallback', async ({
  request,
}) => {
  test.setTimeout(90000);
  const files = [...new Set(Object.values(clips))];
  for (let index = 0; index < files.length; index += 4)
    await Promise.all(
      files.slice(index, index + 4).map(async (file) => {
        const response = await request.get(`audio/${file}`);
        expect(response.ok(), `Audio resource failed: ${file}`).toBe(true);
        expect(response.headers()['content-type'], file).toMatch(/^audio\//);
        expect((await response.body()).byteLength, file).toBeGreaterThan(32);
      }),
    );
});
