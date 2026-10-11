# 教学升级验收报告

日期：2026-10-11。实际使用运行网站与系统 Chromium；截图由 Playwright 生成，未用静态设计稿代替页面。

## 本机验证

- 25 项单元/内容测试：旧备份恢复、三路径独立先修、已有基础直接 B1–B2、保留旧弱项但推荐当前路径、参考回答的 B1–B2/C1 任务要素、独立措辞/无关/不足回答、已知语法错误、表达意义差异、备用音频文件，以及未来 AI 请求契约/来源和返回校验。
- 开发版本 26 项浏览器流程通过（48.4 秒）；初次新增测试发现重复标题定位和答案选项字母的无障碍名称影响，已用语义范围/隐藏装饰字母修正并复验。
- `/english-learning-website/` 最终生产版 28 项流程全部通过（43.6 秒），包含额外的旧弱项推荐与提示使用证据检查。
- 严格 TypeScript/Vite 构建通过；格式检查与 git diff --check 在发布前通过。

浏览器流程覆盖：

1. 已有基础默认会议；听力意图、三层表达、错误反馈、四轮自组织输入、完成后下一课、重载后路径与输出恢复，走完三组主课程。
2. 三个 C1 挑战全部执行额外条件与隐含意义题，切换 Beginner/Intermediate 不授予尚未学的课程。
3. 三个中级探索任务记录输出但不完成系统必修课；入门六课与原三个生活场景仍完整运行。
4. 表达升级的用户示例与未知自由文本限制。旧版进度兼容、备份导入/导出、目标设置、存储异常和损坏数据反馈。
5. 桌面 1440×1000、平板 820×1180、手机 390×844 截图、页面无横向溢出及控制台异常；另有 360px 键盘流程。
6. 实际备用 MP3 HTTP 内容类型/非空数据、浏览器解码与时间推进、0.7×、停止。当前映射 125 段，原 48 段 URL 保留。
7. 语音识别/系统 TTS 使用能力 mock 检查接线，可编辑识别结果；不支持或权限拒绝时文字回退。mock 不证明真人识别质量或真实麦克风授权。

## 截图

- [B1–B2 首页](../output/playwright/communication-home.png)
- [会议自主输出](../output/playwright/communication-meeting-output.png)
- [Small Talk 输出](../output/playwright/communication-smalltalk-output.png)
- [产品介绍输出](../output/playwright/communication-pitch-output.png)
- [表达升级](../output/playwright/communication-expression-upgrade.png)
- [平板表达分析](../output/playwright/communication-tablet-analysis.png)
- [手机表达分析](../output/playwright/communication-mobile-analysis.png)
- [输出历史](../output/playwright/communication-progress.png)

复核截图后已调整新工作台/表达卡片内边距和角色回应分行；最终生产截图会覆盖本机证据。在线运行截图保存为 Actions 的 pages-online-evidence，与本机截图分开。

## 线上验收

在线地址为 `https://chrisjack2380.github.io/english-learning-website/`，本次升级已发布。源码 `58cb8b8`，[Pages run 38107449994](https://github.com/chrisjack2380/english-learning-website/actions/runs/38107449994) 的 build/deploy/verify-online 全部成功；在 GitHub 托管 Chromium 上针对真实 HTTPS 执行全部 28 项流程，线上验收步骤 03:11:48–03:13:05 UTC 成功。在线配置未启动本地服务。

真实线上截图与报告为该 run 的 `pages-online-evidence`，artifact `11689834665`（约 8.75MB）；本机截图不是线上截图的替代。额外实际 HTTPS 请求确认页面200、JS文件与已验收 dist 一致、新会议音频200且为 audio/mp3（60120字节）。常规 CI38107452064也成功。本云容器曾缺代理 CA 的浏览器信任；不关闭 TLS 或修改持久信任以冒充测试。

## 已知验证边界

- 本地任务要素来自词语/长度/有限规则，不能完整判断语义、事实、语法或英语等级；C1 标签不是能力认证。
- 用户确认暂未接入真实 AI：只验证未来网关契约，未测试任何模型，也未声称 AI 反馈上线。
- 新音频是约 180 词/分钟的合成朗读，声音较机械；未进行真人自然对话/多口音、真实麦克风、Safari/Firefox 与真实触屏设备验收。
- 未完成单课步骤不会恢复；只有完成的课程、场景与四轮输出恢复。不会把页面停留时间当作注意力。
