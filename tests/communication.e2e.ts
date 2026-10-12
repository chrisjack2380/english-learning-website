import { test, expect, type Page } from '@playwright/test';
import { communicationScenes, higherLessons } from '../src/advanced-content';
import { STORAGE_KEY } from '../src/learning';
async function shot(page: Page, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `output/${process.env.SITE_URL ? 'online' : 'playwright'}/communication-${name}.png`,
    fullPage: true,
    animations: 'disabled',
  });
}
async function onboard(page: Page, advanced = false) {
  await page.goto('./');
  if (advanced) await page.getByText('挑战高级表达', { exact: true }).click();
  await page.getByRole('button', { name: '开启我的学习旅程' }).click();
  await expect(page.getByRole('heading', { name: /今天，也向前/ })).toBeVisible();
}
async function execute(page: Page, id: string, wrong = false, advanced = false) {
  const s = communicationScenes.find((s) => s.id === id)!;
  const lesson = higherLessons.find((l) => l.id === id + (advanced ? '-c1' : ''))!;
  await expect(page.getByRole('heading', { name: lesson.title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: '查看情境信息' }).click();
  await expect(page.getByText(s.context, { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  await expect(page.locator('.communication-world')).toHaveClass(/paused/);
  await page.getByRole('button', { name: '下一步示范' }).click();
  await expect(page.getByRole('heading', { name: '角色示范 · 2 / 4' })).toBeVisible();
  await page.getByRole('button', { name: '开始听力任务' }).click();
  await page.getByRole('radio', { name: s.listening.answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await expect(page.getByRole('heading', { name: '同一个意图，怎样说更合适？' })).toBeVisible();
  await page.getByRole('radio', { name: lesson.questions[1].answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  for (let i = 0; i < 4; i++) {
    if (wrong && i === 0) {
      await page.getByLabel('你的自主英文回答').fill('Hello!');
      await page.getByRole('button', { name: '查看分层反馈' }).click();
      await expect(page.getByText('补充或调整表达后再试。')).toBeVisible();
      await shot(page, `${id}-correction`);
    }
    await page
      .getByLabel('你的自主英文回答')
      .fill(
        wrong && i === 0 && id === 'meeting'
          ? 'My concern is the checkout flow; it needs another round of careful testing.'
          : s.turns[i].sample,
      );
    await page.getByRole('button', { name: '查看分层反馈' }).click();
    await expect(page.getByText('分层建议已生成，请对照任务核对。')).toBeVisible();
    await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').check();
    await expect(page.getByText('预设角色回应 · 非 AI', { exact: true })).toBeVisible();
    if (i === 0) await shot(page, `${id}${advanced ? '-c1' : ''}-output`);
    if (!(await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').isChecked()))
      await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').check();
    await page
      .getByRole('button', { name: i === 3 ? '完成沟通任务' : '回应追问', exact: true })
      .click();
  }
  await expect(page.getByRole('heading', { name: '你完成了一次有目的的交流。' })).toBeVisible();
}
test('foundations default to B1–B2, all three courses save output and continue after reload', async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page);
  await shot(page, 'home');
  await expect(
    page.locator('.hero-copy').getByRole('heading', { name: 'allocate · 理解与交流', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('从一句 Hello 开始', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '继续系统沟通课' }).click();
  for (let i = 0; i < 3; i++) {
    await execute(page, communicationScenes[i].id, i === 0);
    if (i === 0) {
      const saved = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        STORAGE_KEY,
      );
      expect(saved.completed).toEqual(['meeting']);
      expect(saved.outputs[0].turns).toHaveLength(4);
      expect(saved.skills.meeting.status).toBe('review');
      await page.reload();
      await page.getByRole('button', { name: '学习路径', exact: true }).click();
      await page.getByRole('button', { name: '开始学习', exact: true }).click();
    } else if (i === 1) await page.getByRole('button', { name: '继续：商务产品介绍' }).click();
  }
  await page.reload();
  await page.getByRole('button', { name: '学习记录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '自主表达记录' })).toBeVisible();
  const data = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(data.completed).toEqual(['meeting', 'smalltalk', 'pitch']);
  expect(data.outputs).toHaveLength(3);
  expect(errors).toEqual([]);
  await shot(page, 'progress');
});
for (const s of communicationScenes)
  test(`explore ${s.id} with independent written output without unlocking courses`, async ({
    page,
  }) => {
    await onboard(page);
    await page.getByRole('button', { name: '场景探索', exact: true }).click();
    await page.getByRole('button', { name: `进入${s.title}`, exact: true }).click();
    await execute(page, s.id);
    const data = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
    expect(data.completed).toEqual([]);
    expect(data.sceneResults[0].scene).toBe(s.id);
    expect(data.outputs[0].turns).toHaveLength(4);
  });
test('all C1 task extensions execute with independent prerequisites and saved progress', async ({
  page,
}) => {
  test.setTimeout(240000);
  await onboard(page, true);
  await page.getByRole('button', { name: '继续系统沟通课' }).click();
  for (let i = 0; i < communicationScenes.length; i++) {
    await execute(page, communicationScenes[i].id, false, true);
    if (i < communicationScenes.length - 1)
      await page
        .getByRole('button', { name: `继续：${communicationScenes[i + 1].title} · C1 挑战` })
        .click();
  }
  await page.reload();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(saved.completed).toEqual(communicationScenes.map((s) => s.id + '-c1'));
  await page.getByRole('button', { name: '学习路径', exact: true }).click();
  await page.getByRole('button', { name: /Beginner · A1–A2/ }).click();
  await expect(page.getByRole('button', { name: '待解锁' })).toHaveCount(5);
  await page.getByRole('button', { name: /Intermediate · B1–B2/ }).click();
  await expect(page.getByRole('button', { name: '待解锁' })).toHaveCount(
    communicationScenes.length - 1,
  );
});
test('expression upgrades explain grammar, register and unsupported free-text limits', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByLabel('想改进的英文表达').fill('I very like this product.');
  await page.getByRole('button', { name: '分析表达', exact: true }).click();
  await expect(page.getByText('I really like this product.', { exact: true })).toBeVisible();
  await expect(
    page.getByText("I'm really impressed with this product.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/增加了原句没有明确说出的评价角度/)).toBeVisible();
  await shot(page, 'expression-upgrade');
  await page.getByLabel('想改进的英文表达').fill('This arbitrary sentence needs advice.');
  await page.getByRole('button', { name: '分析表达', exact: true }).click();
  await expect(page.getByText(/尚无经过审核的整句升级示例/)).toBeVisible();
});
for (const device of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
])
  test(`${device.name} communication layout and analysis have no overflow or console errors`, async ({
    page,
  }) => {
    await page.setViewportSize(device);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await onboard(page);
    await shot(page, `${device.name}-home`);
    await page.getByRole('button', { name: '继续系统沟通课' }).click();
    await shot(page, `${device.name}-scene`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole('button', { name: '开始听力任务' }).click();
    await page.getByRole('radio', { name: communicationScenes[0].listening.answer }).check();
    await page.getByRole('button', { name: '检查答案' }).click();
    await page.getByRole('button', { name: '继续', exact: true }).click();
    await shot(page, `${device.name}-analysis`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(errors).toEqual([]);
  });

test('legacy foundations records retain beginner mistakes but recommend only the active B1–B2 path', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key }) => {
      const now = Date.now();
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          profile: { level: 'basics', minutes: 20, createdAt: now },
          completed: ['hello'],
          skills: { hello: { status: 'review', due: now - 1000, interval: 0, correctReviews: 0 } },
          attempts: [{ lessonId: 'hello', correct: 2, total: 3, at: now }],
          sceneResults: [],
          activity: {},
        }),
      );
    },
    { key: STORAGE_KEY },
  );
  await page.goto('./');
  await page.getByRole('button', { name: '继续系统沟通课' }).click();
  await expect(page.getByRole('heading', { name: '美国职场会议交流', exact: true })).toBeVisible();
  const record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(record.completed).toEqual(['hello']);
  expect(record.skills.hello.status).toBe('review');
});

test('using a reference retains scaffolding evidence and schedules review instead of first-time mastery', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: '继续系统沟通课' }).click();
  await page.getByRole('button', { name: '开始听力任务' }).click();
  await page.getByRole('radio', { name: communicationScenes[0].listening.answer }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page.getByRole('radio', { name: communicationScenes[0].analysisQuestion.answer }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  for (let i = 0; i < 4; i++) {
    if (i === 0) await page.getByText('需要支架？查看一种参考回应', { exact: true }).click();
    await page.getByLabel('你的自主英文回答').fill(communicationScenes[0].turns[i].sample);
    await page.getByRole('button', { name: '查看分层反馈' }).click();
    if (!(await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').isChecked()))
      await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').check();
    await page
      .getByRole('button', { name: i === 3 ? '完成沟通任务' : '回应追问', exact: true })
      .click();
  }
  const s = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
  expect(s.attempts[0].correct).toBe(2);
  expect(s.outputs[0].turns[0].revised).toBe(true);
  expect(s.skills.meeting.status).toBe('review');
});
