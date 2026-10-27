import { test, expect, type Page } from '@playwright/test';
import { lifeJourneys } from '../src/life-content';
import { stageRecallTerms } from '../src/context-practice';
import type { JourneyStage } from '../src/journey-schema';
import { STORAGE_KEY } from '../src/learning';
import { communicationJourney, basicJourney } from '../src/journey-adapters';
import { communicationScenes } from '../src/advanced-content';
import { scenes } from '../src/content';
import { generateScene } from '../src/scene-generator';
async function onboard(page: Page) {
  await page.goto('./');
  await expect(page.getByRole('button', { name: '开启我的学习旅程' })).toBeVisible();
  await page.getByRole('button', { name: '开启我的学习旅程' }).click();
}
async function shot(page: Page, name: string) {
  // Full-page captures include cards below the viewport: load their shared atlas first.
  const pictures = page.locator('.journey-world img');
  await pictures.evaluateAll((imgs) =>
    imgs.forEach((img) => ((img as HTMLImageElement).loading = 'eager')),
  );
  await expect
    .poll(() =>
      pictures.evaluateAll((imgs) =>
        imgs.every(
          (img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: `output/${process.env.SITE_URL ? 'online' : 'playwright'}/journey-${name}.png`,
    fullPage: !(await page.getByRole('dialog').count()),
    animations: 'disabled',
  });
}
async function discover(page: Page, s: JourneyStage) {
  for (const [term] of s.words)
    await page
      .locator('.world-word-elements')
      .getByRole('button', { name: `+ ${term}`, exact: true })
      .click();
}
async function recognition(page: Page, s: JourneyStage) {
  await page.getByRole('button', { name: '开始情境回忆', exact: true }).click();
  for (const term of stageRecallTerms(s)) {
    await page
      .getByRole('group', { name: '情境回忆选项' })
      .getByRole('button', {
        name: term,
        exact: true,
      })
      .click();
    await page.getByRole('button', { name: '理解并继续', exact: true }).click();
  }
}
async function finishStage(page: Page, s: JourneyStage, typed = false, wrong = false) {
  await discover(page, s);
  await page.getByRole('button', { name: '学习词汇与表达', exact: false }).click();
  await recognition(page, s);
  if (wrong) {
    await page
      .getByRole('group', { name: '听力选项' })
      .getByRole('button', {
        name: s.listening.options.find((o) => o !== s.listening.answer)!,
        exact: true,
      })
      .click();
    await page.getByRole('button', { name: '检查听力', exact: true }).click();
  }
  await page
    .getByRole('group', { name: '听力选项' })
    .getByRole('button', { name: s.listening.answer, exact: true })
    .click();
  await page.getByRole('button', { name: '检查听力', exact: true }).click();
  if (wrong) {
    await page.getByLabel('情境填空').fill('unrelated');
    await page.getByRole('button', { name: '检查填空', exact: true }).click();
  }
  await page.getByLabel('情境填空').fill(s.cloze.answer);
  await page.getByRole('button', { name: '检查填空', exact: true }).click();
  await page.getByLabel('我已尝试跟读').check();
  if (typed) {
    await page.getByRole('button', { name: '可选：自己输入 / 用语音试一试', exact: true }).click();
    await page.getByLabel('我的简单回应').fill(s.output.equivalents[0] || s.output.answer);
    await page.getByRole('button', { name: '查看表达反馈', exact: true }).click();
    await expect(page.locator('.journey-lesson p.note[role=status]')).toContainText('意思正确');
  } else
    await page
      .getByRole('group', { name: '简单回应选项' })
      .getByRole('button', { name: s.output.answer, exact: true })
      .click();
  await page.getByRole('button', { name: '完成简单回应', exact: true }).click();
  await expect(page.getByRole('heading', { name: '这一小段，已经学进生活。' })).toBeVisible();
}
for (const j of lifeJourneys)
  test(`complete life process ${j.id} with real vocabulary, listening and simple output`, async ({
    page,
  }) => {
    test.setTimeout(150000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await onboard(page);
    await page.getByRole('button', { name: '场景探索', exact: true }).click();
    await page.getByRole('button', { name: `学习${j.title}`, exact: true }).click();
    await expect(page.getByLabel('我的简单回应')).toHaveCount(0);
    await shot(page, `${j.id}-observe`);
    for (let i = 0; i < j.stages.length; i++) {
      await finishStage(page, j.stages[i], i === 4);
      if (i < 4)
        await page
          .getByRole('button', { name: `继续：${j.stages[i + 1].title}`, exact: false })
          .click();
    }
    await shot(page, `${j.id}-complete`);
    await page.getByRole('button', { name: '回到学习空间，继续下一步' }).click();
    await page.reload();
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
    expect(Object.values(saved.journeys[j.id].stages).filter((s: any) => s.completed)).toHaveLength(
      5,
    );
    expect(saved.completed).toEqual([]);
    expect(errors).toEqual([]);
  });
test('first visit input-first route saves discovery separately, restores current step and recommends next segment', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: '开始今天的学习', exact: true }).click();
  const s = lifeJourneys[0].stages[0];
  await expect(page.getByRole('heading', { name: '先观察，再认识这里的英语。' })).toBeVisible();
  await page
    .locator('.world-word-elements')
    .getByRole('button', { name: '+ wake up', exact: true })
    .click();
  await page.getByRole('button', { name: '完整释义与个人词库', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('醒来');
  await page.getByRole('dialog').getByRole('button', { name: '加入个人词库', exact: true }).click();
  await page.getByRole('button', { name: '关闭词典', exact: true }).click();
  let saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.knowledge.records['wake-up'].understood).toBe(false);
  expect(saved.journeys.commute.stages['leave-home'].completed).toBe(false);
  for (const [term] of s.words.slice(1))
    await page
      .locator('.world-word-elements')
      .getByRole('button', { name: `+ ${term}`, exact: true })
      .click();
  await page.getByRole('button', { name: '学习词汇与表达', exact: false }).click();
  await page.reload();
  await page.getByRole('button', { name: '开始今天的学习', exact: true }).click();
  await expect(page.getByRole('heading', { name: '理解词语怎样组成表达。' })).toBeVisible();
  await recognition(page, s);
  await page
    .getByRole('group', { name: '听力选项' })
    .getByRole('button', { name: s.listening.answer, exact: true })
    .click();
  await page.getByRole('button', { name: '检查听力' }).click();
  await page.getByLabel('情境填空').fill(s.cloze.answer);
  await page.getByRole('button', { name: '检查填空' }).click();
  await page.getByLabel('我已尝试跟读').check();
  await page
    .getByRole('group', { name: '简单回应选项' })
    .getByRole('button', { name: s.output.answer, exact: true })
    .click();
  await page.getByRole('button', { name: '完成简单回应' }).click();
  await page.getByRole('button', { name: '返回学习空间' }).click();
  await page.reload();
  await expect(page.locator('.hero-copy h2')).toContainText('进入地铁站');
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await expect(page.getByText('阶段 2 / 5', { exact: true })).toBeVisible();
  saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.knowledge.records['wake-up'].recognitions).toBe(1);
  expect(saved.knowledge.records['wake-up'].practices).toBe(0);
});
test('wrong recognition retains a short review and unknown paraphrases are not labeled incorrect', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  const s = lifeJourneys[0].stages[0];
  await discover(page, s);
  await page.getByRole('button', { name: '学习词汇与表达' }).click();
  await page.getByRole('button', { name: '开始情境回忆' }).click();
  const q = { answer: s.words[0][0], options: s.words.map((w) => w[0]) };
  await page
    .getByRole('group', { name: '情境回忆选项' })
    .getByRole('button', { name: q.options.find((o) => o !== q.answer)!, exact: true })
    .click();
  await page.getByRole('button', { name: '理解并继续', exact: true }).click();
  await expect(page.locator('.journey-lesson p.note[role=status]')).toContainText('再读一次');
  for (const term of stageRecallTerms(s)) {
    await page
      .getByRole('group', { name: '情境回忆选项' })
      .getByRole('button', { name: term, exact: true })
      .click();
    await page.getByRole('button', { name: '理解并继续', exact: true }).click();
  }
  await page
    .getByRole('group', { name: '听力选项' })
    .getByRole('button', { name: s.listening.answer, exact: true })
    .click();
  await page.getByRole('button', { name: '检查听力' }).click();
  await page.getByLabel('情境填空').fill(s.cloze.answer);
  await page.getByRole('button', { name: '检查填空' }).click();
  await page.getByLabel('我已尝试跟读').check();
  await page.getByRole('button', { name: '可选：自己输入 / 用语音试一试' }).click();
  await page.getByLabel('我的简单回应').fill('I need a moment to find my things.');
  await page.getByRole('button', { name: '查看表达反馈' }).click();
  await expect(page.locator('.journey-lesson p.note[role=status]')).toContainText('不据此判错');
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.knowledge.records['wake-up'].lapses).toBe(1);
  expect(saved.knowledge.records['wake-up'].interval).toBe(0);
  expect(saved.knowledge.records['wake-up'].due - Date.now()).toBeGreaterThan(500000);
});
test('due word recall updates the word bank and learning backup excludes private extras', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  const s = lifeJourneys[0].stages[0];
  await finishStage(page, s);
  await page.getByRole('button', { name: '返回学习空间' }).click();
  // Apply the due-date fixture before App mounts; React's activity cleanup may otherwise
  // overwrite an out-of-band localStorage edit made immediately after navigation.
  await page.addInitScript((key) => {
    const s = JSON.parse(localStorage.getItem(key)!);
    s.knowledge.records['wake-up'].due = Date.now() - 1000;
    localStorage.setItem(key, JSON.stringify(s));
  }, STORAGE_KEY);
  await page.reload();
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await expect(page.getByRole('heading', { name: '场景词语复习' })).toBeVisible();
  await page
    .getByRole('group', { name: '词语复习选项' })
    .getByRole('button', { name: 'wake up', exact: true })
    .click();
  await page.getByRole('button', { name: '检查词语回忆' }).click();
  await page.getByRole('button', { name: '继续词语复习' }).click();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.knowledge.records['wake-up'].interval).toBe(3);
});
for (const device of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 360, height: 780 },
])
  test(`${device.name} input-first layouts and dictionary remain usable`, async ({ page }) => {
    await page.setViewportSize(device);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await onboard(page);
    const copy = await page.locator('.life-hero .hero-copy').boundingBox();
    const start = await page.getByRole('button', { name: '开始今天的学习' }).boundingBox();
    // A grid can fit the viewport while still crushing text into a vertical strip.
    expect(copy!.width).toBeGreaterThan(250);
    expect(start!.height).toBeLessThan(70);
    await shot(page, `${device.name}-home`);
    await page.getByRole('button', { name: '开始今天的学习' }).click();
    await shot(page, `${device.name}-discovery`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page
      .locator('.world-word-elements')
      .getByRole('button', { name: '+ get ready', exact: true })
      .focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('发现的英语元素')).toContainText('做好准备');
    await page.getByRole('button', { name: '完整释义与个人词库' }).click();
    await shot(page, `${device.name}-dictionary`);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
test('automatic role speech runs after operations and replay/translation do not submit exercises', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.spoken = [];
    w.SpeechSynthesisUtterance = class {
      constructor(public text: string) {}
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [{ lang: 'en-US' }],
        cancel() {},
        speak(u: any) {
          w.spoken.push(u.text);
          u.onstart?.();
          u.onboundary?.({ charIndex: 0 });
          u.onend?.();
        },
      },
    });
  });
  await onboard(page);
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).spoken))
    .toContain(lifeJourneys[0].stages[0].intro);
  await page
    .locator('.world-word-elements')
    .getByRole('button', { name: '+ wake up', exact: true })
    .click();
  await expect.poll(() => page.evaluate(() => (window as any).spoken)).toContain('wake up');
  await page.locator('.auto-dialogue').getByRole('button', { name: '查看翻译' }).click();
  await expect(page.locator('.auto-dialogue')).toContainText('拿好包');
  await expect(page.getByRole('heading', { name: '先观察，再认识这里的英语。' })).toBeVisible();
});
test('existing adult and beginner scenarios complete the default guided flow and preserve course boundaries', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: '继续系统沟通课', exact: true }).click();
  const adult = communicationJourney(communicationScenes[0], 'course-meeting');
  await finishStage(page, adult.stages[0], false, true);
  await page
    .getByRole('button', { name: `继续：${communicationScenes[1].title}`, exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: communicationScenes[1].title, exact: true }),
  ).toBeVisible();
  let saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.completed).toEqual(['meeting']);
  expect(saved.attempts[0].correct).toBe(1);
  expect(saved.outputs[0].turns[0].guided).toBe(true);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByRole('button', { name: /Beginner · A1–A2/ }).click();
  const cafe = scenes.find((s) => s.id === 'cafe')!;
  await page.getByRole('button', { name: `进入${cafe.title}`, exact: true }).click();
  await finishStage(page, basicJourney(cafe, 'scene-cafe').stages[0], true);
  saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.completed).toEqual(['meeting']);
});
test('generated product scene remains teachable without AI or free writing', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  const request = {
    request: '向美国客户介绍环保设备',
    template: 'pitch',
    level: 'B2' as const,
    product: '',
    facts: '',
  };
  await page.getByLabel('我想练习的沟通任务').fill(request.request);
  await page.getByRole('button', { name: '生成本地场景' }).click();
  await page.getByRole('button', { name: '开始生成的训练' }).click();
  const scene = generateScene(request);
  await finishStage(page, communicationJourney(scene, 'scene-pitch').stages[0]);
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.completed).toEqual([]);
  await expect(page.getByRole('heading', { name: '这一小段，已经学进生活。' })).toBeVisible();
});
test('unavailable scene image keeps vocabulary and exercises accessible', async ({ page }) => {
  await page.route('**/visuals/life-atlas.png', (route) => route.abort());
  await onboard(page);
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await expect(
    page.getByText('环境图片暂未加载；可继续点击下面的英语元素学习。', { exact: true }),
  ).toBeVisible();
  await finishStage(page, lifeJourneys[0].stages[0]);
});
