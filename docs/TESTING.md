# 验证与截图

2026-10-11 第二阶段升级。所有本机测试打开实际运行的 Vite 生产构建，使用 /english-learning-website/ 子路径。新版已发布，且针对真实公开 HTTPS 的同一45项套件验收成功，记录见下方。

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

本次已部署源码 `847fc2748b0bcf48b2a88442ff682e2a6d4f6b6d`：[Pages run 38110841350](https://github.com/chrisjack2380/english-learning-website/actions/runs/38110841350) 的 build/deploy/verify-online 全部成功。生产子路径步骤2026-10-11 04:13:10–04:15:06 UTC；实际公开 HTTPS 45项套件步骤04:16:22–04:18:21 UTC成功，在线配置没有启动本地服务。常规CI38110843075也成功。

线上截图和HTML报告为该run的 `pages-online-evidence`（artifact11690888877，21645426字节）；生产证据11692030160。没有将本机PNG冒充线上文件。额外真实HTTPS请求确认页面及新JS200、生产CSP存在；`index-CZvrUfje.js` 与本机生产资产一致，默认生成采购任务听力MP3为200 / audio/mp3 / 72087字节。

认证排查：CLI显式GH_TOKEN请求曾401；原生Git和受支持HTTPS的平台注入身份正常，已推送、更新现有PR并触发部署。没有要求私人Token或重复Pages设置。当前云浏览器代理CA曾影响外部HTTPS，不关闭TLS或改持久信任，线上套件使用GitHub托管Chromium。

## 未验证及产品边界

真实个人供应商连接、模型质量、费用/CORS/地区权限未用真实 Key 验收；保险箱不抵御已解锁设备恶意脚本/扩展。凭据模式扫描不能发现所有未知格式机密，仍需人工 diff 检查。词语任务规则不是完整语义/事实/语法/CEFR评估。合成音频非真人对话；真人麦克风、Safari/Firefox、实机触屏、多口音尚未验收。未完成课程步骤刷新重来，动态 AI 语句需设备 TTS。
