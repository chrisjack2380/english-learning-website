import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { generateScene } from '../src/scene-generator';
import { communicationScenes } from '../src/advanced-content';
import { STORAGE_KEY } from '../src/learning';
import { MODEL_PREFS_KEY, MODEL_VAULT_KEY } from '../src/model-config';

const request = {
  request: '我想练习向美国客户介绍环保设备。',
  template: 'auto',
  level: 'C1' as const,
  product: '',
  facts: '',
};
const generated = generateScene(request);
const mockedKey = 'testing-only-private-key';
async function onboard(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: '开启我的学习旅程' }).click();
}
async function screenshot(page: Page, name: string) {
  const dir = process.env.SITE_URL ? 'output/online' : 'output/playwright';
  mkdirSync(dir, { recursive: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${dir}/scenes-${name}.png`,
    fullPage: true,
    animations: 'disabled',
  });
}
async function saveModel(page: Page, encrypted = false) {
  await page.getByRole('button', { name: '学习设置', exact: true }).click();
  await page.getByLabel('个人 API Key', { exact: true }).fill(mockedKey);
  await page.getByLabel(/我信任以上模型地址/).check();
  if (encrypted) {
    await page.getByLabel(/用口令加密/).check();
    await page.getByLabel('本地保险箱口令', { exact: true }).fill('browser-test-long-password');
  }
  await page.getByRole('button', { name: '测试连接', exact: true }).click();
  await expect(page.getByText('连接测试通过，可以保存。')).toBeVisible();
  await page.getByRole('button', { name: '保存模型配置' }).click();
  await expect(page.getByLabel('个人 API Key', { exact: true })).toHaveValue('');
}
async function reachOutput(page: Page, scene = generated, advanced = true) {
  if (await page.getByRole('button', { name: '高级自由表达', exact: true }).count())
    await page.getByRole('button', { name: '高级自由表达', exact: true }).click();
  await page.getByRole('button', { name: '开始听力任务' }).click();
  await page.getByRole('radio', { name: scene.listening.answer, exact: true }).check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await page
    .getByRole('radio', {
      name: (advanced ? scene.c1Question : scene.analysisQuestion).answer,
      exact: true,
    })
    .check();
  await page.getByRole('button', { name: '检查答案' }).click();
  await page.getByRole('button', { name: '继续', exact: true }).click();
}
test('offline intent generation produces a full C1 mission, saves custom library and preserves required courses', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByLabel('我想练习的沟通任务').fill(request.request);
  await page.getByLabel('训练难度', { exact: true }).selectOption('C1');
  await page.getByRole('button', { name: '生成本地场景' }).click();
  await expect(page.getByText(/已用本地模板生成/)).toBeVisible();
  await expect(page.getByText(generated.context, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '保存到我的场景库' }).click();
  await screenshot(page, 'generated');
  await page.getByRole('button', { name: '开始生成的训练' }).click();
  await page.getByRole('button', { name: '高级自由表达', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: generated.title + ' · C1 挑战', exact: true }),
  ).toBeVisible();
  await reachOutput(page);
  for (let i = 0; i < generated.turns.length; i++) {
    if (i === 0) {
      await page.getByLabel('你的自主英文回答').fill('Hello');
      await page.getByRole('button', { name: '查看分层反馈' }).click();
      await expect(page.getByText('补充或调整表达后再试。')).toBeVisible();
    }
    await page.getByLabel('你的自主英文回答').fill(generated.turns[i].sample);
    await page.getByRole('button', { name: '查看分层反馈' }).click();
    await expect(page.getByText('分层建议已生成，请对照任务核对。')).toBeVisible();
    if (!(await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').isChecked()))
      await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').check();
    await page
      .getByRole('button', { name: i === 3 ? '完成沟通任务' : '回应追问', exact: true })
      .click();
  }
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), STORAGE_KEY);
  expect(saved.completed).toEqual([]);
  expect(saved.sceneResults[0].scene).toBe('pitch');
  expect(saved.outputs[0].turns).toHaveLength(4);
  await page.reload();
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.locator('.saved-scenes').getByRole('button', { name: '继续练习' }).click();
  await expect(
    page.getByRole('heading', { name: generated.title + ' · C1 挑战', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('scene category and search filters reveal reviewed tasks; unknown requests request an explicit template', async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await expect(page.locator('.scene-card')).toHaveCount(11);
  await page.getByLabel('场景类型', { exact: true }).selectOption('workplace');
  await expect(page.locator('.scene-card')).toHaveCount(4);
  await page.getByLabel('搜索场景').fill('面试');
  await expect(page.locator('.scene-card')).toHaveCount(1);
  await page.getByLabel('我想练习的沟通任务').fill('全新且未审核的主题');
  await page.getByRole('button', { name: '生成本地场景' }).click();
  await expect(page.getByText(/尚未匹配到审核过的模板/)).toBeVisible();
  await page.getByLabel('场景模板', { exact: true }).selectOption('interview');
  await page.getByRole('button', { name: '生成本地场景' }).click();
  await expect(page.locator('.generated-preview h3')).toHaveText('面试：用经历证明优势 · 我的任务');
});
test('owner model protocol drives optional scene, expression and role feedback; keys never enter backups', async ({
  page,
}) => {
  const calls: { url: string; body: string; authorization: string | undefined }[] = [];
  await page.route('https://api.openai.com/v1/chat/completions', async (route) => {
    const req = route.request(),
      body = req.postDataJSON();
    calls.push({
      url: req.url(),
      body: req.postData() || '',
      authorization: req.headers()['authorization'],
    });
    const system = body.messages[0].content as string;
    let output: unknown = 'OK';
    if (system.includes('Personalize this training scene'))
      output = {
        title: '环保设备评估 · AI 改写',
        brief: generated.brief,
        context: generated.context,
        expressions: generated.expressions,
        turns: generated.turns.map(({ line, zh, sample, followUp }) => ({
          line,
          zh,
          sample,
          followUp,
        })),
      };
    else if (system.includes('Analyze the sentence'))
      output = {
        analysis: '表达了产品喜好。',
        grammar: 'very 不能在这里修饰 like。',
        corrected: 'I really like this product.',
        natural: 'I am impressed with this product.',
        advanced: 'What stands out is its fit with our needs.',
        context: '评价产品；需确认需求匹配。',
        why: 'impressed 增加印象这一角度。',
      };
    else if (system.includes('Act as the counterpart')) {
      const input = JSON.parse(body.messages.at(-1).content);
      output = {
        reply:
          input.history.length > 1
            ? 'Your Thursday checkpoint gives us a clear next step.'
            : 'A pilot sounds reasonable.',
        followUp: 'What would you evaluate at the checkpoint?',
        corrected: input.history.at(-1).content,
        natural: 'Could we agree on the pilot criteria?',
        explanation: '先确认标准，再讨论扩大范围。',
      };
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [
          { message: { content: typeof output === 'string' ? output : JSON.stringify(output) } },
        ],
      }),
    });
  });
  await onboard(page);
  await saveModel(page);
  const disk = await page.evaluate(() => Object.values(localStorage).join(' '));
  expect(disk).not.toContain(mockedKey);
  await page.getByRole('button', { name: '场景探索', exact: true }).click();
  await page.getByLabel('我想练习的沟通任务').fill(request.request);
  await page.getByRole('button', { name: '生成本地场景' }).click();
  await page.getByRole('button', { name: '用我的 AI 改写场景' }).click();
  await expect(page.locator('.generated-preview h3')).toHaveText('环保设备评估 · AI 改写');
  await screenshot(page, 'ai-scene-mocked');
  await page.getByLabel('想改进的英文表达').fill('I very like this product.');
  await page.getByRole('button', { name: '用我的 AI 深入分析' }).click();
  await expect(page.getByText('表达了产品喜好。', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '试试：We need more time.', exact: true }).click();
  await expect(page.getByText('表达了产品喜好。', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '分析表达', exact: true }).click();
  await expect(
    page.getByText('Could we give ourselves a little more time?', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '今日学习', exact: true }).click();
  await page.getByRole('button', { name: '继续系统沟通课' }).click();
  await reachOutput(page, communicationScenes[0], false);
  await page.getByLabel('你的自主英文回答').fill(communicationScenes[0].turns[0].sample);
  await page.getByRole('button', { name: '获取 AI 角色反馈' }).click();
  await expect(page.getByText('A pilot sounds reasonable.', { exact: true })).toBeVisible();
  await page
    .getByLabel('回答 AI 的追问')
    .fill('I suggest a Thursday checkpoint to review the results.');
  await page.getByRole('button', { name: '继续 AI 对话' }).click();
  await expect(
    page.getByText('Your Thursday checkpoint gives us a clear next step.', { exact: true }),
  ).toBeVisible();
  await screenshot(page, 'ai-role-mocked');
  for (let i = 0; i < 4; i++) {
    await page.getByLabel('你的自主英文回答').fill(communicationScenes[0].turns[i].sample);
    await page.getByRole('button', { name: '查看分层反馈' }).click();
    if (!(await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').isChecked()))
      await page.getByLabel('我已对照沟通目标、事实和参考核对意思与语气').check();
    await page
      .getByRole('button', { name: i === 3 ? '完成沟通任务' : '回应追问', exact: true })
      .click();
  }
  const state = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), STORAGE_KEY);
  expect(state.outputs[0].turns[0].revised).toBe(true);
  expect(state.skills.meeting.status).toBe('review');
  await page.getByRole('button', { name: '学习设置', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出学习备份' }).click();
  const file = await (await download).path();
  const backup = readFileSync(file!, 'utf8');
  expect(backup).not.toContain(mockedKey);
  expect(backup).not.toContain(MODEL_PREFS_KEY);
  expect(backup).not.toContain('api.openai.com');
  expect(calls.length).toBe(5);
  for (const call of calls) {
    expect(call.authorization).toBe(`Bearer ${mockedKey}`);
    expect(call.body).not.toContain(mockedKey);
    expect(call.url).not.toContain(mockedKey);
  }
});
test('encrypted local vault locks on reload, unlocks with password, and deletion removes configuration', async ({
  page,
}) => {
  await page.route('https://api.openai.com/v1/chat/completions', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ choices: [{ message: { content: 'OK' } }] }),
    }),
  );
  await onboard(page);
  await saveModel(page, true);
  expect(await page.evaluate((k) => localStorage.getItem(k), MODEL_VAULT_KEY)).not.toContain(
    mockedKey,
  );
  await page.reload();
  await page.getByRole('button', { name: '学习设置', exact: true }).click();
  await expect(page.getByText(/保险箱已锁定/)).toBeVisible();
  await page.getByRole('button', { name: '解锁保险箱', exact: true }).click();
  await page.getByLabel('解锁口令', { exact: true }).fill('wrong-long-password');
  await page.getByRole('button', { name: '解锁', exact: true }).click();
  await expect(page.getByText(/无法解锁，请检查口令/)).toBeVisible();
  await page.getByLabel('解锁口令', { exact: true }).fill('browser-test-long-password');
  await page.getByRole('button', { name: '解锁', exact: true }).click();
  await expect(page.getByText(/本次会话可用/)).toBeVisible();
  await screenshot(page, 'encrypted-settings');
  await page.getByRole('button', { name: '删除 OpenAI · gpt-4.1-mini', exact: true }).click();
  await expect(page.getByText('尚未配置，当前使用本地模式。')).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), MODEL_VAULT_KEY)).toBe('{}');
});
test('failed vendor requests show sanitized feedback and leave local learning available', async ({
  page,
}) => {
  await page.route('https://api.openai.com/v1/chat/completions', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: mockedKey } }),
    }),
  );
  await onboard(page);
  await page.getByRole('button', { name: '学习设置', exact: true }).click();
  await page.getByLabel('个人 API Key', { exact: true }).fill(mockedKey);
  await page.getByLabel(/我信任以上模型地址/).check();
  await page.getByRole('button', { name: '测试连接', exact: true }).click();
  await expect(page.getByText(/请求过多或额度不足/)).toBeVisible();
  await expect(page.getByRole('button', { name: '保存模型配置' })).toBeDisabled();
  expect(await page.locator('body').innerText()).not.toContain(mockedKey);
  await page.getByRole('button', { name: '今日学习', exact: true }).click();
  await page.getByRole('button', { name: '继续系统沟通课' }).click();
  await expect(page.getByRole('heading', { name: '美国职场会议交流', exact: true })).toBeVisible();
});
test('two saved providers switch the default while refresh clears session keys', async ({
  page,
}) => {
  await page.route('https://api.openai.com/v1/chat/completions', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ choices: [{ message: { content: 'OK' } }] }),
    }),
  );
  await page.route('https://generativelanguage.googleapis.com/**', async (route) => {
    expect(route.request().url()).not.toContain(mockedKey);
    expect(route.request().headers()['x-goog-api-key']).toBe(mockedKey);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ candidates: [{ content: { parts: [{ text: 'OK' }] } }] }),
    });
  });
  await onboard(page);
  await saveModel(page);
  await page.getByLabel('模型类型', { exact: true }).selectOption('gemini');
  await page.getByLabel('个人 API Key', { exact: true }).fill(mockedKey);
  await page.getByLabel(/我信任以上模型地址/).check();
  await page.getByRole('button', { name: '测试连接', exact: true }).click();
  await expect(page.getByText('连接测试通过，可以保存。')).toBeVisible();
  await page.getByRole('button', { name: '保存模型配置' }).click();
  const row = page.locator('.model-row').filter({ hasText: 'Gemini · gemini-2.5-flash' });
  await row.getByRole('button', { name: '设为默认', exact: true }).click();
  await expect(row.getByText(/默认模型/)).toBeVisible();
  const prefs = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), MODEL_PREFS_KEY);
  expect(prefs.models.find((m: { id: string }) => m.id === prefs.defaultId).provider).toBe(
    'gemini',
  );
  await page.reload();
  await page.getByRole('button', { name: '学习设置', exact: true }).click();
  await expect(page.getByText(/需要重新输入 Key/)).toHaveCount(2);
});
for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
])
  test(`${viewport.name} generator and private model settings are readable without overflow`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await onboard(page);
    await page.getByRole('button', { name: '场景探索', exact: true }).click();
    await page.getByLabel('我想练习的沟通任务').fill(request.request);
    await page.getByRole('button', { name: '生成本地场景' }).click();
    await screenshot(page, `${viewport.name}-generator`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: '学习设置', exact: true }).click();
    await screenshot(page, `${viewport.name}-settings`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
