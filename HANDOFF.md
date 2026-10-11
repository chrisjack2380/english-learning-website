# 项目交接状态

更新：2026-10-11。先读 REQUIREMENTS 当前升级基准、RULES、AGENTS；简单的是教学方法，B1–B2 真实交流是主定位。

## 当前升级

已提交、推送并发布，生产与真实 HTTPS 验收通过：

- Beginner / Intermediate / Advanced 独立分区；新用户默认已有基础 B1–B2，从美国职场会议起步。C1 独立先修和实际的推理/隐含意义要求；保留六节 Pre-A1 → A1 入门课和原三个生活场景。
- 会议、Small Talk、产品介绍三场景：原创环境与分步角色示范，听力意图、三层表达与差异、语域/文化含义，四轮自主输入/可用条件下语音、透明任务要素反馈、参考支架、输出历史、下一课及间隔复习。
- 表达升级：有限本地语法规则、五类人工整句示例、自然/更丰富表达、场合和意思变化解释；未知文本如实标记限制。
- 保留旧 localStorage v1、旧备份和基础弱项；切到已有基础后推荐与复习使用当前路径，不继续要求 Hello。自主输出可选字段，最多 100 组四轮结果，随备份恢复。
- 125 段备用合成音频，新增场景约 180 词/分钟，原 48 URL 不变。系统 TTS 正常速度 1×、慢速 0.7×；音色自然度有限。
- 用户确认：“暂时没有，先完成课程并预留安全 AI 接入”。目前预设角色和规则反馈明确非 AI；未来同事/朋友/客户等安全同源接口在 src/ai.ts，服务端要求见 docs/AI.md。没有后端/模型密钥/真实 AI 对话。

## 验证状态

25 项单元测试通过；开发浏览器 26 项通过（48.4 秒），最终生产子路径 28 项全部通过（43.6 秒），真实 HTTPS 的同一 28 项流程全部通过，类型构建与格式检查通过。

测试范围、截图和边界见 [docs/TESTING.md](docs/TESTING.md)。本云 `/usr/bin/chromium`，Node24；`npm ci --cache /tmp/english-npm-cache`。备用音频生成需要本地 eSpeak NG/FFmpeg，普通安装不要生成。已审核工具解包在 `/tmp/english-voice`，临时目录可能随环境重置丢失。

## 发布与 Git

网站：[一步英语](https://chrisjack2380.github.io/english-learning-website/)。本次 B1–B2/C1 升级已在该地址上线。无需清空旧记录；旧用户可在学习路径/设置切换 Intermediate。

分支 `feat/english-learning-mvp`，现有 [PR #1](https://github.com/chrisjack2380/english-learning-website/pull/1) OPEN，等待用户审核，不擅自合并。

用户已把仓库公开、Pages Source 设为 GitHub Actions，并允许 github-pages 环境的 main 与 feat/english-learning-mvp 部署。当前 App contents/actions 可写，pages/administration 不具备；自动发布使用 Actions GITHUB_TOKEN 最小权限。无需 Vercel 或个人令牌；合并后移除临时开发分支触发。

基线已发布提交 4ded787（2026-10-08），Pages run 37806879992 的 build/deploy/verify-online 全成功、常规 CI37806891139成功，原18单元/17生产/17真实线上测试通过。历史权限拒绝已由用户设置解决，与本次升级无关。

本次上线源码提交 `58cb8b84755289225a773da8fa3f064fdb8e976b` 已推送。Pages [run 38107449994](https://github.com/chrisjack2380/english-learning-website/actions/runs/38107449994) 的 build/deploy/verify-online 全成功；常规 CI [38107452064](https://github.com/chrisjack2380/english-learning-website/actions/runs/38107452064) 成功。部署 `6990259934` 状态 success，环境网址为上述 Pages 地址。实际 HTTPS 页面 200，JS 文件 `index-D76EuYXM.js` 与本机已验收构建一致，新会议音频 HTTP200 / audio/mp3 / 60120 字节。

线上验收步骤 2026-10-11 03:11:48–03:13:05 UTC 成功。在线截图/报告为 `pages-online-evidence` artifact `11689834665`（约 8.75MB）；生产证据 `11690094172`，发布产物 `11689914316`。线上 Playwright 配置不启动本地服务，直接访问真实 GitHub Pages。交付记录后续文档提交不重新部署；站点运行上述已验证源码。

本云 Chrome 访问外部 HTTPS 曾因代理 CA 信任报 ERR_CERT_AUTHORITY_INVALID；没有忽略 TLS，也没有获准修改持久 NSS。线上浏览器验收使用 GitHub 托管 Chromium。此环境可能限制日志/Artifact ZIP 下载，但 Actions 状态、检查与产物元数据可读取；不要把未下载 ZIP 当本机截图。

## 后续入口

1. 完整 B1/B2/C1 体系，面试/技术/冲突/学术场景；基础区完整 A2。现有三场景与 C1 挑战是能力训练片段，非完整等级课程。
2. 真实 AI 服务端部署、鉴权/限流/预算、隐私和反馈质量；非敏感配置切换。遵循 docs/AI.md，不能在 GitHub Pages 前端存密钥。
3. 更自然语音/真人录音、多口音与真实设备麦克风；Safari/Firefox/触屏与无障碍扩大验收。
4. 更深入语义评价、未完成步骤恢复、账号同步。词语检查的限制须保留可见，不以标签暗示已掌握完整能力。
5. 允许网络域名后复核 CoE/British Council 官方资料；本次请求被代理403，未假称阅读全文。

内容扩展见 docs/EXTENDING；框架与许可证见 docs/RESEARCH。没有新增 Skills 或依赖；之前 onboarding setup 技能用于环境。环境配置草稿需用户审阅/保存/发布才生效，不能把保存草稿当环境已发布。
