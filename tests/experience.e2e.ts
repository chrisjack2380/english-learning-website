import { test, expect, type Page } from '@playwright/test';
import { officeLab } from '../src/office-lab';
import { lifeJourneys } from '../src/life-content';
import { stageRecallTerms } from '../src/context-practice';
import { freshState, STORAGE_KEY } from '../src/learning';
import { freshStage } from '../src/journey-learning';
async function enter(page: Page, office = true) {
  await page.goto('./');
  await page.getByRole('button', { name: '开启我的学习旅程' }).click();
  if (office) {
    await page.getByRole('button', { name: '场景探索', exact: true }).click();
    await page.getByRole('button', { name: '进入 3D 办公室' }).click();
  } else await page.getByRole('button', { name: '开始今天的学习' }).click();
}
async function outputStep(page: Page, office = true) {
  const s = (office ? officeLab : lifeJourneys[0]).stages[0];
  const words = page.locator('.world-word-elements');
  for (const [term] of s.words) {
    const b = words.getByRole('button', { name: `+ ${term}`, exact: true });
    if (await b.count()) await b.click();
  }
  await page.getByRole('button', { name: '学习词汇与表达' }).click();
  await page.getByRole('button', { name: '开始情境回忆' }).click();
  for (const term of stageRecallTerms(s)) {
    await page
      .getByRole('group', { name: '情境回忆选项' })
      .getByRole('button', { name: term, exact: true })
      .click();
    await page.getByRole('button', { name: '理解并继续' }).click();
  }
  await page
    .getByRole('group', { name: '听力选项' })
    .getByRole('button', { name: s.listening.answer, exact: true })
    .click();
  await page.getByRole('button', { name: '检查听力' }).click();
  await page.getByLabel('情境填空').fill(s.cloze.answer);
  await page.getByRole('button', { name: '检查填空' }).click();
  await page.getByLabel('我已尝试跟读').check();
}
for (const device of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 360, height: 780 },
])
  test(`real GLB office mesh picking, animation and vocabulary on ${device.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(device);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await enter(page);
    const host = page.locator('.office-canvas');
    await expect(host).toHaveAttribute('data-state', 'ready', { timeout: 20000 });
    const canvas = host.locator('canvas');
    expect(Number(await canvas.getAttribute('data-meshes'))).toBeGreaterThan(40);
    expect(Number(await canvas.getAttribute('data-animations'))).toBeGreaterThan(0);
    const box = (await canvas.boundingBox())!;
    let picked = false;
    for (const x of [0.5, 0.6, 0.7, 0.4]) {
      for (const y of [0.55, 0.65, 0.45, 0.75]) {
        await canvas.click({ position: { x: box.width * x, y: box.height * y } });
        if (await page.getByLabel('发现的英语元素').count()) {
          picked = true;
          break;
        }
      }
      if (picked) break;
    }
    expect(picked).toBe(true);
    await expect(page.locator('.discovered-word')).toContainText(
      /desk|laptop|notebook|whiteboard|calendar|coworker/,
    );
    await page.getByRole('button', { name: '完整释义与个人词库' }).click();
    await page.getByRole('dialog').getByRole('button', { name: '加入个人词库' }).click();
    await page.getByRole('button', { name: '关闭词典' }).click();
    await expect(page.getByRole('button', { name: '完整释义与个人词库' })).toBeFocused();
    const before = Number(await canvas.getAttribute('data-animation-time'));
    await expect
      .poll(async () => Number(await canvas.getAttribute('data-animation-time')))
      .toBeGreaterThan(before + 0.1);
    await page.getByRole('button', { name: '暂停人物动作' }).click();
    await page.waitForTimeout(150);
    const paused = await canvas.getAttribute('data-animation-time');
    await page.waitForTimeout(180);
    expect(await canvas.getAttribute('data-animation-time')).toBe(paused);
    await page.getByRole('button', { name: '与同事打招呼' }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `output/${process.env.SITE_URL ? 'online' : 'playwright'}/experience-office-${device.name}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
    if (device.name === 'desktop') {
      await outputStep(page);
      await page
        .getByRole('group', { name: '简单回应选项' })
        .getByRole('button', { name: officeLab.stages[0].output.answer, exact: true })
        .click();
      await page.getByRole('button', { name: '完成简单回应' }).click();
      await page.reload();
      await page.getByRole('button', { name: '场景探索', exact: true }).click();
      await page.getByRole('button', { name: '进入 3D 办公室' }).click();
      await expect(page.getByRole('heading', { name: '这一小段，已经学进生活。' })).toBeVisible();
    }
  });
test('non-preset semi-open response can continue with explicit self evidence and short review', async ({
  page,
}) => {
  await enter(page, false);
  await outputStep(page, false);
  await page.getByRole('button', { name: '可选：自己输入 / 用语音试一试' }).click();
  await page.getByLabel('我的简单回应').fill('I still need a minute to pack my things.');
  await page.reload();
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await expect(page.getByLabel('我的简单回应')).toHaveValue(
    'I still need a minute to pack my things.',
  );
  await page.getByRole('button', { name: '查看表达反馈' }).click();
  await expect(page.getByRole('button', { name: '完成简单回应' })).toBeDisabled();
  await expect(page.locator('.journey-lesson p[role=status]')).toContainText('不据此判错');
  await page.getByLabel('我已核对：回应符合沟通目标，没有添加未知事实').check();
  await page.getByRole('button', { name: '完成简单回应' }).click();
  await expect(page.locator('.journey-lesson')).toContainText('自主核对，尚未自动验证语义');
  const s = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(s.journeys.commute.stages['leave-home'].outputMode).toBe('self-checked');
  expect(s.journeys.commute.stages['leave-home'].firstChecks.output).toBe(false);
  expect(
    s.knowledge.records[
      lifeJourneys[0].stages[0].expressions[0][0]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    ].interval,
  ).toBe(0);
  expect(s.journeys.commute.stages['leave-home'].recognized).toHaveLength(3);
  expect(s.knowledge.records['get-ready'].understood).toBe(false);
  await page.reload();
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await expect(page.getByRole('heading', { name: '先观察，再认识这里的英语。' })).toBeVisible();
});
test('physical environment changes from home to street and pauses motion', async ({ page }) => {
  await enter(page, false);
  const image = page.locator('.journey-environment img');
  await expect(image).toHaveAttribute('src', /life-atlas/);
  await page.getByRole('button', { name: '切换环境：街道 · 步行进站' }).click();
  await expect(image).toHaveAttribute('src', /process-atlas/);
  await expect
    .poll(() => image.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
    .toBe(true);
  await page.getByRole('button', { name: '暂停场景动效' }).click();
  await expect(page.locator('.journey-environment .journey-world')).toHaveClass(/still/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `output/${process.env.SITE_URL ? 'online' : 'playwright'}/experience-street.png`,
    fullPage: true,
    animations: 'disabled',
  });
});
test('missing GLB and absent WebGL preserve the learning flow', async ({ page }) => {
  await page.route('**/models/office.glb', (r) => r.abort());
  await enter(page);
  await expect(page.locator('.office-canvas')).toHaveAttribute('data-state', 'fallback');
  await outputStep(page);
  await page
    .getByRole('group', { name: '简单回应选项' })
    .getByRole('button', { name: officeLab.stages[0].output.answer, exact: true })
    .click();
  await page.getByRole('button', { name: '完成简单回应' }).click();
  await expect(page.getByRole('heading', { name: '这一小段，已经学进生活。' })).toBeVisible();
  await page.getByRole('button', { name: '返回学习空间' }).click();
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: any,
      ...args: any[]
    ) {
      if (type === 'webgl2') return null;
      return (original as any).apply(this, [type, ...args]);
    } as any;
  });
  await page.reload();
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByRole('button', { name: '进入 3D 办公室' }).click();
  await expect(page.locator('.office-canvas')).toHaveAttribute('data-state', 'fallback');
});
for (const action of ['visible', 'hidden', 'reload'])
  test(`hints retain support evidence when ${action}`, async ({ page }) => {
    await enter(page, false);
    const s = lifeJourneys[0].stages[0];
    for (const [term] of s.words)
      await page
        .locator('.world-word-elements')
        .getByRole('button', { name: `+ ${term}`, exact: true })
        .click();
    await page.getByRole('button', { name: '学习词汇与表达' }).click();
    await page.getByRole('button', { name: '开始情境回忆' }).click();
    await expect(page.locator('.journey-lesson')).toContainText('________');
    await page.getByRole('button', { name: '需要一点提示' }).click();
    if (action === 'hidden') await page.getByRole('button', { name: '收起提示' }).click();
    if (action === 'reload') {
      await page.reload();
      await page.getByRole('button', { name: '开始今天的学习' }).click();
    }
    await page
      .getByRole('group', { name: '情境回忆选项' })
      .getByRole('button', { name: 'wake up', exact: true })
      .click();
    await page.getByRole('button', { name: '理解并继续' }).click();
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
    expect(saved.knowledge.records['wake-up'].understood).toBe(false);
    expect(saved.knowledge.records['wake-up'].due - Date.now()).toBeGreaterThan(500000);
    expect(saved.journeys.commute.stages['leave-home'].firstChecks.vocabulary).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `output/${process.env.SITE_URL ? 'online' : 'playwright'}/experience-context-recall-${action}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  });

test('unfinished response drafts survive stage navigation and changing answer mode', async ({
  page,
}) => {
  const [first, second] = lifeJourneys[0].stages;
  const draft = 'Could you wait a moment while I check the departure board?';
  const ready = (s: typeof first) => ({
    ...freshStage(),
    learningVersion: 2 as const,
    phase: 5,
    seen: s.words.map((w) => w[0]),
    recognized: stageRecallTerms(s),
    listening: true,
    cloze: true,
    imitated: true,
  });
  const state = {
    ...freshState(),
    profile: { level: 'basics' as const, minutes: 10 as const, createdAt: Date.now() },
    journeys: {
      commute: {
        stage: 1,
        at: Date.now(),
        stages: {
          [first.id]: { ...ready(first), phase: 6, output: true, completed: true },
          [second.id]: { ...ready(second), outputText: draft },
        },
      },
    },
  };
  await page.addInitScript(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), {
    key: STORAGE_KEY,
    state,
  });
  await page.goto('./');
  await page.getByRole('button', { name: '开始今天的学习' }).click();
  await expect(page.getByLabel('我的简单回应')).toHaveValue(draft);
  const stages = page.getByLabel('生活过程阶段');
  await stages.getByRole('button', { name: new RegExp(first.title) }).click();
  await stages.getByRole('button', { name: new RegExp(second.title) }).click();
  await expect(page.getByLabel('我的简单回应')).toHaveValue(draft);
  await expect(page.getByRole('button', { name: '完成简单回应' })).toBeDisabled();
  await page.getByRole('button', { name: '使用有支架的选择回答' }).click();
  await page.getByRole('button', { name: '可选：自己输入 / 用语音试一试' }).click();
  await expect(page.getByLabel('我的简单回应')).toHaveValue(draft);
  await expect(page.getByRole('button', { name: '完成简单回应' })).toBeDisabled();
});
test('reduced motion stops exported character animation while preserving discovery', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enter(page);
  const canvas = page.locator('.office-canvas canvas');
  await expect(page.locator('.office-canvas')).toHaveAttribute('data-state', 'ready');
  await page.waitForTimeout(180);
  const time = await canvas.getAttribute('data-animation-time');
  await page.waitForTimeout(180);
  expect(await canvas.getAttribute('data-animation-time')).toBe(time);
  await page
    .getByLabel('办公室物品键盘入口')
    .getByRole('button', { name: '+ whiteboard', exact: true })
    .click();
  await expect(page.getByLabel('发现的英语元素')).toContainText('白板');
});
