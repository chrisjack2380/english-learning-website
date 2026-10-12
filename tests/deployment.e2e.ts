import { test, expect } from '@playwright/test';
import clips from '../src/audio-manifest.json' with { type: 'json' };

test('all bundled audio resources return real audio instead of an HTML fallback', async ({
  request,
}) => {
  test.setTimeout(180000);
  const files = [...new Set(Object.values(clips))];
  for (let index = 0; index < files.length; index += 4) {
    await Promise.all(
      files.slice(index, index + 4).map(async (file) => {
        let response = await request.get(`audio/${file}`, { timeout: 15000 });
        for (
          let retry = 0;
          retry < 2 && [429, 500, 502, 503, 504].includes(response.status());
          retry++
        ) {
          console.info(`Transient HTTP ${response.status()} for ${file}; retry ${retry + 1}/2.`);
          await response.dispose();
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** retry));
          response = await request.get(`audio/${file}`, { timeout: 15000 });
        }
        try {
          expect(response.ok(), `Audio resource failed: ${file}, HTTP ${response.status()}`).toBe(
            true,
          );
          expect(response.headers()['content-type'], file).toMatch(/^audio\//);
          expect((await response.body()).byteLength, file).toBeGreaterThan(32);
        } finally {
          await response.dispose();
        }
      }),
    );
    // Public CDN checks should not issue a burst of hundreds of requests.
    if (process.env.SITE_URL) await new Promise((resolve) => setTimeout(resolve, 100));
  }
});
