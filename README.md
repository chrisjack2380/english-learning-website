# 一步英语 · Little by Little

面向中文母语学习者，通过直观教学提升真实交流能力。**B1–B2 是主学习区**，保留 Beginner 入门课程，提供 C1 沟通挑战。等级标签是课程设计参考，三个场景不等于完整等级课程或能力认证。

**在线网站：[打开一步英语](https://chrisjack2380.github.io/english-learning-website/)**。无需注册；已有英语基础默认从美国职场会议开始。升级发布和测试的实际状态见 [HANDOFF.md](HANDOFF.md)。

![B1–B2 学习首页](output/playwright/communication-home.png)

## 使用

首次选择「已有英语基础」进入 B1–B2，「挑战高级表达」进入 C1，或「从零开始」进入基础路径。学习路径/设置可切换等级，保留已有进度。点击「开始今天的学习」，先巩固到期知识，再进入下一任务。

三个主场景：

- 美国职场会议：提出顾虑 → 建议试点 → 回应销售质疑 → 明确负责人和检查节点。
- 社交聊天与 Small Talk：分享与反问 → 接住市集话题 → 协商咖啡邀请 → 尊重收尾信号。
- 商务产品介绍：发现痛点 → 解释功能与收益 → 回应工具负担 → 商定演示与评估。

每个场景包括原创可暂停动画、分步角色示范、正常速度/慢速听力、意图理解、三层表达分析、语气与文化差异、四轮自主文本/语音输出、透明任务反馈、输出历史及复习。C1 在同一场景增加因果、权衡、限定承诺和隐含意义检查，单独记录先修与进度。

「表达升级工作台」位于场景探索和自主沟通页面。输入 `I very like this product.` 可查看语法修正、自然与更丰富的表达、使用情境及差异解释。任意自由文本只有当前支持的规则检查；超出示例库时会说明限制，不凭空生成建议。

**AI 状态：**用户确认暂时没有后端，先完成课程并预留安全接入。当前角色为预设对话，反馈为本地规则与人工编写示例，页面明确标注非 AI。`src/ai.ts` 提供同源服务端网关契约，无模型密钥、付费依赖或虚假 AI 配置按钮。

## 运行和验证

Node.js 24+。

```bash
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
VITE_BASE_PATH=/english-learning-website/ npm run test:production
npm run format:check
npm run preview
```

本云环境缓存可用 `/tmp/english-npm-cache`；浏览器优先 `/usr/bin/chromium`，可设置 `CHROMIUM_PATH`。没有系统浏览器时，按 Playwright 官方指南安装 Chromium。生产/在线测试复用同一实际用户流程。

```bash
SITE_URL=https://chrisjack2380.github.io/english-learning-website/ npm run test:online
```

在线发布使用 GitHub 官方 Pages Actions，验证生产子路径后发布，再在实际 HTTPS 地址运行浏览器验收。不需要 Vercel 凭据或个人 GitHub 令牌。PR 保留用户审核，发布不代表合并。详见 [部署说明](docs/DEPLOYMENT.md)。

## 架构与扩展

```text
src/advanced-content.ts                # 三个真实场景、表达语域、任务与 C1 条件
src/content.ts                         # 保留入门课程、统一内容入口
src/communication.ts                   # 透明任务证据与表达升级规则
src/learning.ts                        # 分路径先修、校验、计划、复习、旧记录兼容
src/components/CommunicationPlayer.tsx # 场景 → 听力 → 分析 → 四轮输出 → 反馈
src/components/CommunicationWorld.tsx  # 原创会议室、聚会与产品演示动画
src/components/ExpressionCoach.tsx     # 本地表达升级
src/ai.ts                              # 未来安全服务端的角色与反馈契约
src/pages/                             # 首页、引导、路径、探索、记录、复习、设置
public/audio/                          # 已提交的备用合成音频
scripts/generate-audio.ts              # 增量生成，不改已有音频 URL
src/*.test.ts                          # 内容与规则验证
tests/*.e2e.ts                         # 开发、生产及真实在线浏览器验收
output/playwright/                     # 实际本机截图
```

维护入口：[AGENTS.md](AGENTS.md)、[REQUIREMENTS.md](REQUIREMENTS.md)、[RULES.md](RULES.md)、[HANDOFF.md](HANDOFF.md)。课程扩展见 [docs/EXTENDING.md](docs/EXTENDING.md)，AI 服务端要求见 [docs/AI.md](docs/AI.md)，教学研究、Skills 与许可证见 [docs/RESEARCH.md](docs/RESEARCH.md)，验证证据见 [docs/TESTING.md](docs/TESTING.md)。使用既有 React/TypeScript/Vite、原创 SVG、Playwright；没有新增框架、远程安装脚本或付费 API。

## 记录与限制

记录保存在当前浏览器，不跨设备同步；设置支持 JSON 备份导出/导入。保留旧版 `little-by-little:v1` 数据，已有基础用户直接推荐 B1–B2，但不删除旧课程。每条路径单独检查先修，自由场景不完成必修课程。初次错误/提示使用安排立即复习；一次通过次日复习，后续正确按 1/3/7/14 天延长，复习错误 10 分钟后再练。

本地输出检查依据词语、长度与有限语法规则，不能完整判断语义、事实、语法或真实口语能力。表达升级只有有限的人工示例库。AI 全文反馈、开放角色追问需要未来真实服务端。高级区不是完整 C1 学术/商务课程；Beginner 当前为六节 Pre-A1 → A1 片段，完整 A2 待扩充。

播放优先系统英文 TTS，新场景备用 eSpeak 音频约 180 词/分钟，支持 0.7×；音色机械，尚非真人自然对话录音。语音识别依赖支持的浏览器、HTTPS、权限及厂商服务，可编辑后提交，不是发音评分。尚未验收真人麦克风、Safari/Firefox。未完成的单课步骤刷新后重来；已提交进度和四轮输出会恢复。学习时长是可见页面停留时间，不代表注意力。
