# 验证与截图

2026-10-11 第二阶段升级。所有本机测试打开实际运行的 Vite 生产构建，使用 /english-learning-website/ 子路径。在线版尚未发布此次升级，原因见下方，不将旧版本测试当成本次线上验收。

## 本机验证

- npm test：39 项单元/内容/调度/模型安全检查通过，并扫描源码、文档及构建的已知凭据/私人文件模式。
- 类型构建及 Prettier 格式检查通过。
- VITE_BASE_PATH=/english-learning-website/ npm run test:production：45 项真实 Chromium 浏览器流程通过。最终复验45项全部成功（约1.2分钟）；AI 请求通过明确 test-only Key 和网络 mock 验证，未调用真实私人模型。

覆盖：

1. 首次已有基础默认 B1–B2；原 beginner 六课闭环、先修、纠错、复习、下一课、备份、损坏/不可写存储、重载恢复。旧入门薄弱知识保留但不接管中级推荐。
2. 11 个中高级场景全部完成听力、意图/表达分析和四轮自主输出；完整 11 课 C1 路径，实际额外条件与隐含意义题。探索不完成必修，输出历史与提示使用可恢复。
3. 无 AI 需求匹配 → 环保设备采购任务 → C1 → 错误输出 → 修改完成四轮 → 本地保存 → 重载再次进入。未知请求需选模板；分类与搜索真实可用。
4. 官方四种协议的认证 header、无 URL Key、无 Cookie、拒绝跳转、长度限制、错误脱敏；恶意/缺失 AI 场景拒绝 ID/regex/非任务样例。
5. 模型设置测试/保存、失败不能保存、两供应商默认切换、刷新清会话密钥；本地 AES-GCM 密文、错误口令、解锁和删除，绑定模型/地址。
6. 可选 AI 场景改写、表达分析、实际传递回答上下文的角色追问；模拟响应来源明确，使用支架安排复习。改换表达示例后清除旧 AI 建议。
7. 学习备份无模型 Key/地址/保险箱；导入剥离未知私密配置，不影响现有课程 schema。截图无可见 Key。
8. 桌面1440×1000、平板820×1180、手机390×844以及360px键盘流程；生成/设置/场景/表达页面无横向溢出、控制台异常。实际截图复查。
9. 326 段 MP3 的 HTTP 内容类型/非空数据，以及真实浏览器解码、播放时间推进、0.7×和停止；原 URL 保留。系统 TTS/语音识别接线与拒绝权限使用能力 mock，不代表真人识别质量。

## 截图

本机共 68 张 PNG，位于 output/playwright；新增场景/生成/C1/AI安全状态与原基础流程均保留。较长页面用 full-page，固定侧栏以顶部状态截图；复查修复了复选框及隐藏备份输入框被通用 input 样式撑宽的问题，以及下拉框无障碍名称混入选项文字。

- [桌面生成场景](../output/playwright/scenes-desktop-generator.png)
- [手机生成场景](../output/playwright/scenes-mobile-generator.png)
- [平板模型设置](../output/playwright/scenes-tablet-settings.png)
- [手机模型设置](../output/playwright/scenes-mobile-settings.png)
- [加密保险箱设置（测试值）](../output/playwright/scenes-encrypted-settings.png)
- [AI 角色协议 mock 状态](../output/playwright/scenes-ai-role-mocked.png)
- [AI 场景协议 mock 状态](../output/playwright/scenes-ai-scene-mocked.png)
- [面试自主输出](../output/playwright/communication-interview-output.png)
- [技术讨论 C1 输出](../output/playwright/communication-technical-c1-output.png)
- [谈判自主输出](../output/playwright/communication-negotiation-output.png)
- [租房问题 C1 输出](../output/playwright/communication-housing-c1-output.png)

AI 截图的 mocked 文件名表示协议测试响应，不是私人模型或真实供应商质量证据。

## 本次线上状态

当前云会话的 GitHub 认证 GET /user 返回 HTTP401 / Bad credentials；匿名读取确认仓库仍公开、远程 feat/english-learning-mvp 为 f0f767f、PR #1 OPEN。是当前凭据失效，不是 Pages Source 或 deployment branch 再次缺权限。原生 Git HEAD 只读已成功，Git 与 API 权限分别验证；提交后测试原生 Git 推送，不能仅据 CLI401推断全部写入权限。当前不能声称本次部署或线上45项已通过。

原网址 https://chrisjack2380.github.io/english-learning-website/ 仍为此前三场景版本；以前 Pages run 38107449994 的28项真实HTTPS测试不是此次45项验收证据。

授权刷新后先推送本地提交，更新现有 PR，再读取 Pages build/deploy/verify-online 结果；真实 HTTPS 用相同45项流程，截图/报告在 pages-online-evidence。当前云浏览器代理 CA 曾影响外部 HTTPS，不关闭 TLS，不改持久信任；用 GitHub 托管浏览器验收。

## 未验证及产品边界

真实个人供应商连接、模型质量、费用/CORS/地区权限未用真实 Key 验收；保险箱不抵御已解锁设备恶意脚本/扩展。凭据模式扫描不能发现所有未知格式机密，仍需人工 diff 检查。词语任务规则不是完整语义/事实/语法/CEFR评估。合成音频非真人对话；真人麦克风、Safari/Firefox、实机触屏、多口音尚未验收。未完成课程步骤刷新重来，动态 AI 语句需设备 TTS。
