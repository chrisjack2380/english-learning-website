import { test, expect } from '@playwright/test';
import clips from '../src/audio-manifest.json' with { type: 'json' };

test('all bundled audio resources return real audio instead of an HTML fallback', async ({
  request,
}) => {
  for (const file of new Set(Object.values(clips))) {
    const response = await request.get(`/audio/${file}`);
    expect(response.ok(), `Audio resource failed: ${file}`).toBe(true);
    expect(response.headers()['content-type'], file).toMatch(/^audio\//);
    expect((await response.body()).byteLength, file).toBeGreaterThan(32);
  }
});
