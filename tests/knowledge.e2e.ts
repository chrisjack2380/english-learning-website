import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { knowledgeEntries } from '../src/knowledge';
import { knowledgeToScene } from '../src/knowledge-learning';
import { STORAGE_KEY } from '../src/learning';
async function onboard(page: Page, goal = 'business') {
  await page.goto('./');
  await page.getByLabel('新手学习目标').selectOption(goal);
  await page.getByRole('button', { name: '开启我的学习旅程' }).click();
  await page.getByRole('button', { name: '开始今天的学习', exact: true }).click();
  await expect(page.getByRole('heading', { name: '让知识，真正用得出来。' })).toBeVisible();
}
async function shot(page: Page, name: string) {
  const dir = process.env.SITE_URL ? 'output/online' : 'output/playwright';
  mkdirSync(dir, { recursive: true });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `${dir}/knowledge-${name}.png`,
    fullPage: true,
    animations: 'disabled',
  });
}
async function application(page: Page, id: string) {
  const scene = knowledgeToScene(id);
  await page.getByRole('button', { name: `把 ${id} 用到场景里`, exact: true }).click();
  await expect(page.getByRole('heading', { name: scene.title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: '开始听力任务' }).click();
  await page.getByRole('radio', { name: scene.listening.answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page.getByRole('radio', { name: scene.analysisQuestion.answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByLabel('你的自主英文回答').fill(scene.turns[i].sample);
    await page.getByRole('button', { name: '查看分层反馈' }).click();
    await expect(page.getByText('3 · 当前语境', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: i === 3 ? '完成沟通任务' : '回应追问', exact: true }),
    ).toHaveCount(0);
    await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').check();
    await expect(page.locator('.auto-dialogue')).toBeVisible();
    await page
      .getByRole('button', { name: i === 3 ? '完成沟通任务' : '回应追问', exact: true })
      .click();
  }
  await expect(page.getByRole('heading', { name: '你完成了一次有目的的交流。' })).toBeVisible();
}
test('knowledge meaning, dictionary, saved vocabulary, scenario output and next recommendation survive reload', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page);
  await page.getByRole('button', { name: 'allocate 分配资源或时间 · B2', exact: true }).click();
  await page
    .locator('.knowledge-unit')
    .getByRole('button', { name: '查词 allocate', exact: true })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page
      .getByRole('dialog')
      .getByText('to assign available resources to a purpose', { exact: true }),
  ).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: '加入个人词库' }).click();
  await shot(page, 'dictionary');
  await page.getByRole('button', { name: '关闭词典' }).click();
  await page.getByRole('radio', { name: knowledgeEntries[0].zh, exact: true }).check();
  await page.getByRole('button', { name: '检查理解' }).click();
  await application(page, 'allocate');
  let data = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), STORAGE_KEY);
  expect(data.completed).toEqual([]);
  expect(data.knowledge.records.allocate.practices).toBe(1);
  expect(data.knowledge.records.allocate.interval).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: '知识与词库', exact: true }).click();
  await page.getByLabel('只看个人词库').check();
  await expect(page.getByRole('button', { name: /allocate.*已理解/ })).toBeVisible();
  expect(errors).toEqual([]);
});
test('supplementary licensed dictionary and arbitrary personal vocabulary work without an AI provider', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: '把 allocate 用到场景里', exact: true }).click();
  await page.getByRole('button', { name: '查词 project', exact: true }).first().click();
  await expect(
    page.getByRole('dialog').getByText('a planned undertaking', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭词典' }).click();
  await page.getByRole('button', { name: '查词 What', exact: true }).first().click();
  await expect(
    page.getByRole('dialog').getByText('这个词或短语尚无本站审核的中文单独释义。'),
  ).toBeVisible();
  await page.getByLabel('我的中文笔记').fill('疑问词，用来询问内容');
  await page.getByRole('dialog').getByRole('button', { name: '加入个人词库' }).click();
  await page.getByRole('button', { name: '关闭词典' }).click();
  await page.getByRole('button', { name: '返回知识路线', exact: true }).click();
  await page.getByLabel('只看个人词库').check();
  await expect(
    page.getByRole('button', { name: 'What 疑问词，用来询问内容 · 我的摘词' }),
  ).toBeVisible();
});
test('private reading remains in page memory and target selection changes the actual knowledge route', async ({
  page,
}) => {
  await onboard(page, 'toefl');
  await expect(page.getByLabel('我的学习目标')).toHaveValue('toefl');
  await expect(page.locator('.knowledge-unit h2')).toHaveText('assess');
  await page
    .getByLabel('私人学习资料')
    .fill('PRIVATE SAMPLE: We need to allocate resources and assess evidence.');
  await expect(page.getByRole('button', { name: '学习 allocate', exact: true })).toBeVisible();
  expect(await page.evaluate(() => Object.values(localStorage).join(' '))).not.toContain(
    'PRIVATE SAMPLE',
  );
  await page.getByRole('button', { name: '清除私人资料' }).click();
  await expect(page.getByLabel('私人学习资料')).toHaveValue('');
  await page.getByLabel('我的学习目标').selectOption('daily');
  await expect(page.locator('.knowledge-unit h2')).toHaveText('perspective');
});
test('answering automatically triggers speech and exposes sentence synchronization without a play click', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [{ lang: 'en-US' }],
        cancel: () => {},
        speak: (u: SpeechSynthesisUtterance) => {
          (window as unknown as { spoken: string[] }).spoken = (
            (window as unknown as { spoken: string[] }).spoken || []
          ).concat(u.text);
          u.onstart?.({} as SpeechSynthesisEvent);
          u.onboundary?.({ charIndex: 0 } as SpeechSynthesisEvent);
        },
      },
    });
    window.SpeechSynthesisUtterance = class {
      constructor(public text: string) {}
    } as unknown as typeof SpeechSynthesisUtterance;
  });
  await onboard(page);
  await page.getByRole('button', { name: '把 allocate 用到场景里' }).click();
  const s = knowledgeToScene('allocate');
  await page.getByRole('button', { name: '开始听力任务' }).click();
  await page.getByRole('radio', { name: s.listening.answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page.getByRole('radio', { name: s.analysisQuestion.answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page.getByLabel('你的自主英文回答').fill(s.turns[0].sample);
  await page.getByRole('button', { name: '查看分层反馈' }).click();
  await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').check();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken))
    .toContain(s.turns[0].followUp);
  await expect(page.locator('.spoken-line')).toBeVisible();
  await page
    .locator('.auto-dialogue')
    .getByRole('button', { name: '查看翻译', exact: true })
    .click();
  await expect(page.locator('.auto-dialogue')).toContainText('请澄清这个表达背后的含义。');
});
for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
])
  test(`${viewport.name} knowledge, dictionary and photographic scene are readable`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await onboard(page);
    await shot(page, `${viewport.name}-library`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: '把 allocate 用到场景里', exact: true }).click();
    await shot(page, `${viewport.name}-scene`);
    await expect(page.locator('.realistic-stage')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
test('explicit scene AI mode sends the submitted answer automatically and preserves local practice on model failure', async ({
  page,
}) => {
  let replies = 0;
  await page.route('https://api.openai.com/v1/chat/completions', async (route) => {
    const data = route.request().postDataJSON();
    const system = data.messages[0].content;
    const output = system.includes('Reply briefly with OK')
      ? 'OK'
      : JSON.stringify({
          reply: 'Let us review the resource request together.',
          followUp: 'What evidence supports the request?',
          corrected: 'We should allocate resources after reviewing the need.',
          natural: 'Could we review the resource needs first?',
          explanation: '先说明需求再核对证据。',
        });
    if (!system.includes('Reply briefly with OK')) replies++;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ choices: [{ message: { content: output } }] }),
    });
  });
  await onboard(page);
  await page.getByRole('button', { name: '学习设置', exact: true }).click();
  await page.getByLabel('个人 API Key', { exact: true }).fill('testing-only-private-key');
  await page.getByLabel(/我信任以上模型地址/).check();
  await page.getByRole('button', { name: '测试连接', exact: true }).click();
  await expect(page.getByText('连接测试通过，可以保存。')).toBeVisible();
  await page.getByRole('button', { name: '保存模型配置' }).click();
  await page.getByRole('button', { name: '知识与词库', exact: true }).click();
  await page.getByRole('button', { name: '把 allocate 用到场景里', exact: true }).click();
  const s = knowledgeToScene('allocate');
  await page.getByRole('button', { name: '开始听力任务' }).click();
  await page.getByRole('radio', { name: s.listening.answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page.getByRole('radio', { name: s.analysisQuestion.answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page.getByLabel(/本场景提交回答后使用我的 AI/).check();
  await page.getByLabel('你的自主英文回答').fill(s.turns[0].sample);
  await page.getByRole('button', { name: '查看分层反馈' }).click();
  await expect(
    page.getByText('Let us review the resource request together.', { exact: true }),
  ).toBeVisible();
  expect(replies).toBe(1);
  await page.getByLabel(/本场景提交回答后使用我的 AI/).uncheck();
  await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').check();
  await page.getByRole('button', { name: '回应追问', exact: true }).click();
  expect(replies).toBe(1);
  await expect(page.getByLabel('你的自主英文回答')).toHaveValue('');
});
