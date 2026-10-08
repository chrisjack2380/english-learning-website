# MVP 验收与证据

执行日期：2026-10-08。实际环境 Node.js 24.19.0、Debian 13、系统 Chromium；Playwright 1.64.0。当前没有 Browser 插件，使用项目的 Playwright 流程。

## 结果

| 检查                 | 实际结果                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| 冻结依赖安装         | `npm ci --cache /tmp/english-npm-cache` 成功；锁文件不随安装改写                                |
| 规则与内容           | `npm test`：18 项全部通过                                                                       |
| 构建                 | `npm run build`：严格 TypeScript（含未使用变量检查）与 Vite 生产构建通过                        |
| 格式                 | `npm run format:check` 通过                                                                     |
| 开发版浏览器流程     | 初次 `npm run test:e2e`：16 项全部通过，无 skipped / disabled / expected-failure                |
| 生产版完整浏览器验收 | 本次 `npm run test:production`：17 项全部通过，自动构建并测试 dist，含全部 48 个音频资源        |
| 页面身份/非空/覆盖层 | 正确标题，关键内容和操作可见，无框架错误覆盖层                                                  |
| 控制台/资源          | 关键流程未出现应用控制台 error/warning、未捕获异常或失败资源                                    |
| 音频                 | 随站提供的 MP3 可用 FFprobe 解码；真实浏览器媒体播放时间前进，支持 0.7 倍速和停止               |
| 生产构建预览         | 实际打开 dist 预览，走通新手引导 → 第一课 → 备用音频 → 正确答题；所有音频资源返回成功且类型正确 |
| 依赖审计             | 本次 `npm audit` 与运行依赖审计均报告 0 个已知漏洞；不等于未来持续安全保证                      |

## 实际走通的完整路径

清空浏览器上下文 → 新手起点及学习时长 → 首页推荐第一课 → 动画暂停/重播/分步 → 示例中译切换 → 故意答错并查看解释 → 改正 → 听力理解 → 输入英文回应 → 课内情境任务 → 完成页保留首次 2/3 分数和待复习状态 → 继续第二课 → 回首页 → 刷新恢复 → 复习 → 查看真实记录。

另一个用例走完六课的全部教学、三题与课内应用流程，并在刷新后验证六课完成和知识状态。三种完整自由场景均测试了错误反馈及四步文字回答，确认没有因此解锁必修课程。

测试还覆盖：学习时长修改、备份下载和合法导入、非法备份不替换记录、本地数据损坏、存储配额失败仍可学习与导出、360px 小手机键盘操作。

## 视口与截图

实际打开运行网站，分别使用 1440×1000（桌面）、820×1180（平板）、390×844（手机），检查页面水平溢出、主要控件及状态；另以 360×780 验证小屏与键盘。截图前回到页面顶部，避免整页截图把固定导航拼接到错误位置。

| 证据               | 文件                                                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 首次引导           | [desktop-onboarding.png](../output/playwright/desktop-onboarding.png)                                                                                                                         |
| 桌面首页           | [desktop-dashboard.png](../output/playwright/desktop-dashboard.png)                                                                                                                           |
| 路径与课程         | [desktop-path.png](../output/playwright/desktop-path.png)、[desktop-animation.png](../output/playwright/desktop-animation.png)                                                                |
| 错题反馈及完成结果 | [desktop-correction.png](../output/playwright/desktop-correction.png)、[desktop-completion.png](../output/playwright/desktop-completion.png)                                                  |
| 真实学习记录       | [desktop-progress.png](../output/playwright/desktop-progress.png)                                                                                                                             |
| 三种场景           | [问候](../output/playwright/scene-greeting.png)、[咖啡店](../output/playwright/scene-cafe.png)、[问路](../output/playwright/scene-directions.png)                                             |
| 平板               | [tablet-dashboard.png](../output/playwright/tablet-dashboard.png)、[tablet-cafe.png](../output/playwright/tablet-cafe.png)                                                                    |
| 手机               | [mobile-dashboard.png](../output/playwright/mobile-dashboard.png)、[mobile-animation.png](../output/playwright/mobile-animation.png)、[mobile-cafe.png](../output/playwright/mobile-cafe.png) |
| 生产构建答题       | [production-practice.png](../output/playwright/production-practice.png)                                                                                                                       |

已实际读取桌面首页/引导/完成反馈、平板咖啡场景、手机首页/教学动画截图，修复了手机引导后的滚动恢复及标题断行问题。其余截图也由浏览器生成，供后续复核。没有把自动截图生成等同于所有设备上的人工体验验收。

## 故障与修复

- 初次测试的两项失败来自过于宽泛的文本定位（答案与反馈重复、数字与步骤重复），改用语义/分组定位后复验通过。
- 重装依赖时，之前 npm 服务的 Vite 子进程仍存活，旧预构建缓存返回 `504 Outdated Optimize Dep`，造成空页面。已根据 trace 确认，停止自己启动的进程、用新服务器重跑后 16/16 通过。不是忽略空页或把端口开放当作成功。
- 教学内容审查将第一/三/五课的应用任务收窄到已教表达；价格接受用更自然的 `Yes, that's fine.`；位置表达要求冠词，避免把缺少冠词的句子评为正确。
- 复核并修正问候动画气泡，使见面、介绍、初次认识和告别与当前对话步骤一致，补充了对应浏览器断言并回归验证。
- 系统 Chromium 英文语音列表为空，已增加网站自带音频，实际验证媒体解码和播放，而非仅验证 TTS 函数被调用。

## 验证边界

- 系统 TTS 调用参数、语音识别结果可编辑、权限拒绝和能力缺失分支使用能力 mock 测试；备用 MP3 播放使用真实媒体对象。二者不能混称为真实麦克风验收。
- 云环境没有进行真人麦克风录音、扬声器听感、真实发音质量评估，也没有验证浏览器厂商识别服务。需在用户设备上继续检查；网站从不将识别准确率当作发音评分。
- 未验证 Safari/Firefox、真实平板手机、账号同步、完整 A1/A2 或 AI 自由对话；这些没有报告为已实现。
- 课程英文与讲解已逐项检查并用 CEFR-J 数据交叉核对；官方 CEFR 全文仍受网络策略限制，未宣称其全文调研已完成。
- GitHub Actions 工作流已配置；远程运行状态以 PR 检查为准，本文件记录当前机器实际执行的结果。
- 在线网站尚未部署，未执行实际 HTTPS 在线验收。新增 `npm run test:online` 已通过测试枚举（17 项）并验证缺少 SITE_URL 时会报错；仅用保留的 `.example` 域名做配置加载，未向它发出网络请求。枚举和本地生产验收不能证明公开站点已经上线。

## 发布前补充验收

2026-10-08 已用生产配置完整运行 17 项 Chromium 用例（28 秒）；与初次开发版相比，新增 48 个 MP3 的 HTTP 状态、audio MIME 和非空内容检查。严格构建包含新 Playwright 配置。CI 运行相同生产验收并生成可发布的 website-dist。

新增音频资源用例初次在测试发现阶段因 Node.js 24 的 JSON import 属性要求而失败，已补上 `with { type: 'json' }` 并完整复跑 17/17 通过；未把零用例运行视作成功。发布权限与后续线上步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。

## GitHub Pages 子路径验收

用户选择 Pages 并将仓库公开后，设置 `VITE_BASE_PATH=/english-learning-website/` 实际构建生产版本，并在相同子路径的预览服务器完整复跑 17 项用例，全部通过（29.7 秒）；18 项单元测试和严格构建通过。产物中的 JS、CSS、favicon 均指向项目子路径，实际媒体对象可加载、播放、慢速与停止；48 个音频请求均返回正确资源。测试的导航和请求不再跳回站点根路径。

此结果仅证明 Pages 路径适配正确；首次开通、官方 Actions 发布、实际 HTTPS 在线验收以远程工作流结果为准。具体权限证据和账号持有人一次性操作见部署文档。
