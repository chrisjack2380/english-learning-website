import { test, expect, type Page } from '@playwright/test';
import { lessons, scenes, sceneForLesson } from '../src/content';
async function screenshot(page: Page, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `output/${process.env.SITE_URL ? 'online' : 'playwright'}/${name}.png`,
    fullPage: true,
    animations: 'disabled',
  });
}
async function onboard(page: Page, level = '从零开始') {
  await page.goto('./');
  await page.getByText(level, { exact: true }).click();
  await page.getByRole('button', { name: '开启我的学习旅程' }).click();
  await expect(page.getByRole('heading', { name: /今天，也向前/ })).toBeVisible();
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}
async function practiceScene(
  page: Page,
  id: string,
  wrong = false,
  text = false,
  lessonId?: string,
) {
  const s = lessonId ? sceneForLesson(lessonId) : scenes.find((s) => s.id === id)!;
  await page.getByRole('button', { name: '准备好了，直接练习' }).click();
  for (let i = 0; i < s.turns.length; i++) {
    const t = s.turns[i];
    if (wrong && i === 0) {
      await page
        .getByText(t.options.find((o) => o !== t.correct)!, { exact: true })
        .last()
        .click();
      await page.getByRole('button', { name: '发送回答' }).click();
      await expect(page.getByText('对方还没有理解你的任务，试着换个表达。')).toBeVisible();
    }
    if (text) {
      await page.getByRole('button', { name: '文字 / 语音' }).click();
      await page.getByLabel('你的英文回答').fill(t.sample);
    } else await page.getByText(t.correct, { exact: true }).last().click();
    await page.getByRole('button', { name: '发送回答' }).click();
    await expect(page.getByText('沟通成功，继续对话。')).toBeVisible();
    await page
      .getByRole('button', { name: i === s.turns.length - 1 ? '完成场景任务' : '继续对话' })
      .click();
  }
}
test('first visit through a full lesson, corrected error, next lesson and reload recovery', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) errors.push(msg.text());
  });
  await page.goto('./');
  await screenshot(page, 'desktop-onboarding');
  await page.getByRole('button', { name: '开启我的学习旅程' }).click();
  await screenshot(page, 'desktop-home');
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await screenshot(page, 'desktop-lesson');
  await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  await expect(page.locator('.world').first()).toHaveClass(/paused/);
  await page.getByRole('button', { name: '下一步演示' }).click();
  await expect(page.getByRole('button', { name: '回应 → Hi!' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: '下一步演示' }).click();
  await expect(
    page.locator('.visual-lesson svg').getByText('Nice to meet you.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '重播动画' }).click();
  await page.getByRole('button', { name: '理解了，看看例句' }).click();
  await page.getByRole('button', { name: '隐藏中文', exact: true }).click();
  await expect(page.getByText('我也很高兴认识你。', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '开始互动练习' }).click();
  await page.getByText('Goodbye!', { exact: true }).click();
  await page.getByRole('button', { name: '检查答案' }).click();
  await expect(page.getByText('再想一想，可以改正后继续。')).toBeVisible();
  await screenshot(page, 'desktop-correction');
  await page.getByRole('radio', { name: /Hello!/ }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page.getByText('表达初次见面的高兴', { exact: true }).click();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page.getByLabel('你的英文回答').fill('Nice to meet you, too.');
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await practiceScene(page, 'greeting', false, false, 'hello');
  await expect(page.getByText('2 / 3', { exact: true })).toBeVisible();
  await screenshot(page, 'desktop-completion');
  await page.getByRole('button', { name: '继续：介绍你自己' }).click();
  await expect(page.getByRole('heading', { name: '介绍你自己', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '今日学习', exact: true }).click();
  await expect(page.getByText('把旧知识再唤醒', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('把旧知识再唤醒', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '温故知新', exact: false }).click();
  await page.getByLabel('你的英文回答').fill('Nice to meet you, too.');
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await expect(page.getByText('本轮复习完成', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '学习记录', exact: true }).click();
  await expect(page.getByText('首次 2 / 3 正确')).toBeVisible();
  await screenshot(page, 'desktop-progress');
  expect(errors).toEqual([]);
});
for (const scene of scenes) {
  test(`complete ${scene.id} scene with wrong branch and typed responses, without skipping courses`, async ({
    page,
  }) => {
    await onboard(page);
    await page.getByRole('button', { name: '场景探索', exact: true }).click();
    await page.getByRole('button', { name: `进入${scene.title}`, exact: true }).click();
    await page
      .getByRole('button', {
        name: scene.id === 'cafe' ? 'Small cup' : scene.id === 'directions' ? 'Cafe' : 'Hello',
        exact: true,
      })
      .click();
    await expect(page.locator('.scene-grid .note').first()).toBeVisible();
    await screenshot(page, `scene-${scene.id}`);
    await practiceScene(page, scene.id, true, true);
    await expect(page.getByText('这一次，你做到了。')).toBeVisible();
    await page.getByRole('button', { name: '学习路径', exact: true }).click();
    await expect(page.getByRole('button', { name: '待解锁' })).toHaveCount(5);
    await page.getByRole('button', { name: '学习记录', exact: true }).click();
    await expect(page.getByText('1 次调整', { exact: true })).toBeVisible();
  });
}
test('all six sequential lessons execute their teaching and assessment flows', async ({ page }) => {
  await onboard(page, '有一点基础');
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  for (const l of lessons) {
    await expect(page.getByRole('heading', { name: l.title, exact: true })).toBeVisible();
    await page.getByRole('button', { name: '下一步演示' }).click();
    await page.getByRole('button', { name: '下一步演示' }).click();
    await page.getByRole('button', { name: '理解了，看看例句' }).click();
    await page.getByRole('button', { name: '开始互动练习' }).click();
    for (const q of l.questions) {
      if (q.options) await page.getByRole('group').getByText(q.answer!, { exact: true }).click();
      else await page.getByLabel('你的英文回答').fill(q.sample);
      await page.getByRole('button', { name: '检查答案' }).click();
      await page.getByRole('button', { name: '继续', exact: true }).click();
    }
    await practiceScene(page, l.scene, false, false, l.id);
    await expect(page.getByText('3 / 3', { exact: true })).toBeVisible();
    const next = lessons[lessons.indexOf(l) + 1];
    if (next) await page.getByRole('button', { name: `继续：${next.title}` }).click();
    else await page.getByRole('button', { name: '返回首页，继续复习' }).click();
  }
  await page.reload();
  await page.getByRole('button', { name: '学习路径', exact: true }).click();
  await expect(page.getByRole('button', { name: '再次学习' })).toHaveCount(6);
  await page.getByRole('button', { name: '学习记录', exact: true }).click();
  await expect(page.getByText('初步掌握', { exact: true })).toHaveCount(6);
});
for (const device of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`${device.name} responsive pages, resources and scene controls`, async ({ page }) => {
    await page.setViewportSize(device);
    const errors: string[] = [];
    const failed: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) errors.push(msg.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) failed.push(r.url());
    });
    await onboard(page);
    await expect(page).toHaveTitle('一步英语 · Little by Little');
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    await noOverflow(page);
    await screenshot(page, `${device.name}-dashboard`);
    await page.getByRole('button', { name: '学习路径', exact: true }).click();
    await noOverflow(page);
    await screenshot(page, `${device.name}-path`);
    await page.getByRole('button', { name: '开始学习', exact: true }).click();
    await noOverflow(page);
    await screenshot(page, `${device.name}-animation`);
    await page.getByRole('button', { name: '场景探索', exact: true }).click();
    await page.getByRole('button', { name: '进入街角咖啡店' }).click();
    await noOverflow(page);
    await screenshot(page, `${device.name}-cafe`);
    await page.getByRole('button', { name: '观看对话示范' }).click();
    for (let i = 0; i < 3; i++)
      await page.getByRole('button', { name: '下一句', exact: true }).click();
    await page.getByRole('button', { name: '开始角色练习' }).click();
    await noOverflow(page);
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  });
}
test('speech synthesis and editable recognition wiring with browser capability mocks', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.__spoken = [];
    w.SpeechSynthesisUtterance = class {
      text: string;
      lang = '';
      rate = 1;
      onstart?: () => void;
      onend?: () => void;
      constructor(text: string) {
        this.text = text;
      }
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel() {},
        getVoices() {
          return [{ lang: 'en-US', name: 'Test' }];
        },
        speak(u: any) {
          w.__spoken.push({ text: u.text, lang: u.lang, rate: u.rate });
          u.onstart?.();
          u.onend?.();
        },
      },
    });
    w.SpeechRecognition = class {
      onresult: any;
      onend: any;
      start() {
        this.onresult({ results: [[{ transcript: 'wrong transcript' }]] });
        this.onend?.();
      }
      stop() {}
      abort() {}
    };
  });
  await onboard(page);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByRole('button', { name: '进入遇见新朋友' }).click();
  await page.getByRole('button', { name: '准备好了，直接练习' }).click();
  const dialogue = page.locator('.scene-dialogue');
  await dialogue.getByRole('button', { name: '切换慢速播放' }).click();
  await dialogue.getByRole('button', { name: '播放英文 Hello!' }).click();
  expect(await page.evaluate(() => (window as any).__spoken)).toContainEqual({
    text: 'Hello!',
    lang: 'en-US',
    rate: 0.7,
  });
  await page.getByRole('button', { name: '文字 / 语音' }).click();
  await page.getByRole('button', { name: '用语音回答' }).click();
  await expect(page.getByLabel('你的英文回答')).toHaveValue('wrong transcript');
  await page.getByLabel('你的英文回答').fill('Hi!');
  await page.getByRole('button', { name: '发送回答' }).click();
  await expect(page.getByText('沟通成功，继续对话。')).toBeVisible();
});
test('unavailable recognition falls back to text', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.SpeechRecognition = undefined;
    w.webkitSpeechRecognition = undefined;
  });
  await onboard(page);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByRole('button', { name: '进入遇见新朋友' }).click();
  await page.getByRole('button', { name: '准备好了，直接练习' }).click();
  await page.getByRole('button', { name: '文字 / 语音' }).click();
  await page.getByRole('button', { name: '用语音回答' }).click();
  await expect(page.getByText('此浏览器不支持语音识别，请直接输入英文。')).toBeVisible();
  await page.getByLabel('你的英文回答').fill('Hello!');
  await page.getByRole('button', { name: '发送回答' }).click();
  await expect(page.getByText('沟通成功，继续对话。')).toBeVisible();
});
test('backup export/import, goal changes, and invalid backup rejection', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: '学习设置', exact: true }).click();
  await page.getByRole('button', { name: '30 分钟 沉浸学习' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出学习备份' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/little-by-little-.*\.json/);
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  await expect(page.getByText(/无法导入/)).toBeVisible();
  const backup = await page.evaluate(() => localStorage.getItem('little-by-little:v1')!);
  await page.locator('input[type=file]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(backup),
  });
  await expect(page.getByText('备份已导入，学习进度已恢复。')).toBeVisible();
  await page.getByRole('button', { name: '今日学习', exact: true }).click();
  await expect(page.getByText('30 分钟计划', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('30 分钟计划', { exact: true })).toBeVisible();
});

test('real bundled audio decodes, advances playback, slows down and stops', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as any;
    const NativeAudio = window.Audio;
    w.__audio = [];
    w.Audio = function (src: string) {
      const a = new NativeAudio(src);
      w.__audio.push(a);
      return a;
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel() {},
        getVoices() {
          return [];
        },
      },
    });
  });
  await onboard(page);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByRole('button', { name: '进入遇见新朋友' }).click();
  await page.getByRole('button', { name: '准备好了，直接练习' }).click();
  const dialogue = page.locator('.scene-dialogue');
  await dialogue.getByRole('button', { name: '切换慢速播放' }).click();
  await dialogue.getByRole('button', { name: '播放英文 Hello!' }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const a = (window as any).__audio.at(-1);
        return !!a && a.readyState >= 2 && a.currentTime > 0 && a.duration > 0;
      }),
    )
    .toBe(true);
  expect(await page.evaluate(() => (window as any).__audio.at(-1).playbackRate)).toBe(0.7);
  await dialogue.getByRole('button', { name: '停止语音' }).click();
  expect(await page.evaluate(() => (window as any).__audio.at(-1).paused)).toBe(true);
});
test('microphone denial feedback keeps text participation usable', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).SpeechRecognition = class {
      onerror: any;
      onend: any;
      start() {
        this.onerror({ error: 'not-allowed' });
        this.onend?.();
      }
      stop() {}
      abort() {}
    };
  });
  await onboard(page);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByRole('button', { name: '进入遇见新朋友' }).click();
  await page.getByRole('button', { name: '准备好了，直接练习' }).click();
  await page.getByRole('button', { name: '文字 / 语音' }).click();
  await page.getByRole('button', { name: '用语音回答' }).click();
  await expect(page.getByText(/麦克风权限被拒绝/)).toBeVisible();
  await expect(page.getByRole('button', { name: '用语音回答' })).toBeVisible();
  await page.getByLabel('你的英文回答').fill('Hi!');
  await page.getByRole('button', { name: '发送回答' }).click();
  await expect(page.getByText('沟通成功，继续对话。')).toBeVisible();
});
test('corrupt and unavailable storage is reported without blocking learning', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('little-by-little:v1', '{broken');
  });
  await page.goto('./');
  await expect(page.getByRole('alert')).toContainText('本地记录无法读取');
  expect(await page.evaluate(() => localStorage.getItem('little-by-little:v1'))).toBe('{broken');
  await page.getByRole('button', { name: '开启我的学习旅程' }).click();
  await expect(page.getByRole('heading', { name: /今天，也向前/ })).toBeVisible();
});
test('storage write failure preserves the current session and offers backup', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await onboard(page);
  await expect(page.getByRole('alert')).toContainText('浏览器未能保存数据');
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await expect(page.getByRole('heading', { name: '从一句 Hello 开始', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '学习设置', exact: true }).click();
  await expect(page.getByRole('button', { name: '导出学习备份' })).toBeVisible();
});
test('small mobile layout and keyboard navigation remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await onboard(page);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await noOverflow(page);
  await page.getByRole('button', { name: '开始今天的学习' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '从一句 Hello 开始', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '下一步演示' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '回应 → Hi!' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await noOverflow(page);
});
