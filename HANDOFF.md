# 开发交接

新任务先读 [REQUIREMENTS.md](REQUIREMENTS.md)、[RULES.md](RULES.md)、[AGENTS.md](AGENTS.md)。

## 当前状态：第一阶段 MVP 已实现；生产验收通过，在线部署受权限阻塞

- React/TypeScript/Vite 静态应用，现有 checkout 在 `/workspace/english-learning-website`。
- 新手引导、10/20/30 分钟计划、六课连续路径、每日推荐、下一课衔接、错题复习与真实记录。
- 分步 SVG 教学动画、每课听力/选择/生产性文字练习与已教知识范围内的情境应用。
- 三个四步完整自由场景（问候、点餐、问路），含示范、语音、核心表达、场景操作、错误反馈和任务记录；自由探索不解锁课程。
- 优先系统 TTS，48 段随站备用 MP3，慢速/重复/停止；支持语音识别结果修改及文字回退。
- 本地 schema 校验、导入/导出、存储损坏/写入失败提示；可见学习页面停留时间记录。
- 页面、教学组件、课程与调度逻辑已分离；未来 AI 接口仅为安全服务端契约。

## 验证及文档

- 冻结安装、18 项单元/内容测试、16 项真实 Chromium 流程全部通过；严格类型构建、格式及 npm audit 通过。
- 已实际走完首次打开 → 第一课 → 错题改正与复习 → 下一课 → 刷新恢复；另走完全部六课和三个自由场景。
- 桌面/平板/手机截图在 `output/playwright`，验收细节与真实语音限制见 [docs/TESTING.md](docs/TESTING.md)。
- 教学/Skills/许可证调研见 [docs/RESEARCH.md](docs/RESEARCH.md)，课程和安全服务扩展见 [docs/EXTENDING.md](docs/EXTENDING.md)。
- 使用了已安装的 onboarding setup 技能；参考官方前端测试指南，未安装废弃技能脚本或额外插件。
- 环境 install_script、start_skill 与调研域名已保存为草稿；保存不执行/应用/发布。需用户在环境设置审阅、保存并发布后才能声称新环境已恢复验证。

## 开发入口

`npm ci`、`npm run dev`；本云环境用 `npm ci --cache /tmp/english-npm-cache`。测试命令见 README。系统浏览器 `/usr/bin/chromium`；可配置 CHROMIUM_PATH。环境快照不保留运行进程，后续任务须重启服务。

重装依赖前停止自己启动的开发服务器，并确认子进程退出；旧 Vite 缓存会返回 `Outdated Optimize Dep`。不要杀死未知用户进程。当前 Git 分支 `feat/english-learning-mvp`，不擅自合并 main、不强推。

## 明确未实现 / 下一阶段

1. 完整 A1、A2 及更多级别，正式起点测评；当前是入门片段，基础选择不是认证。
2. 专业真人/更自然合成录音与真实设备麦克风验收；目前备用音色机械，语音识别依赖浏览器厂商能力和用户许可。
3. 更多生产性表达、语义评估和复杂对话分支；当前判定是有限预设句型。
4. Safari/Firefox、真实触屏设备及更全面无障碍验收。
5. 未完成课步骤自动恢复、账号和安全跨设备同步。
6. 经过认证、限流、隐私设计的 AI 后端，以及非敏感模型配置管理；不能在前端放密钥或冒充已上线 AI。
7. 允许网络域名后复核 Council of Europe 与 British Council 正式资料；当前已实际读取 CEFR-J、FSRS 和官方工具材料，不假称受限资料已阅读。

交付 [PR #1](https://github.com/chrisjack2380/english-learning-website/pull/1) 待用户审核；初次完整 GitHub Actions 检查通过。最终复核已修正问候气泡与当前步骤的对应，并补充断言；远程检查和 PR 状态以 GitHub 为准。不得仅依据本文件宣称后续提交已推送或 PR 已合并。

## 在线交付任务（2026-10-08 补充）

用户明确要求开发者完善功能并交付在线网址，用户只在在线网站验收。此要求已写入 REQUIREMENTS.md、RULES.md；发布网站已有授权，不再询问是否部署。

已准备 `vercel.json` 的 Vite 根路径部署、缓存/安全/麦克风策略；新增生产版与在线版 Playwright 配置。最新本机校验：18 项单元测试通过，严格构建通过，生产 dist 的 17 项真实 Chromium 测试全部通过，包括全部 48 音频资源。CI 改为验收实际生产构建，通过后上传 `website-dist`。新增在线配置已验证能列出 17 项测试且缺少 SITE_URL 时拒绝运行；没有访问示例域名，不把测试列表当作在线通过。

部署仍未执行，尚无公开站点：GitHub Pages 读取与创建均被集成权限拒绝（403）；没有 Vercel/Cloudflare/Netlify 部署凭据；`api.vercel.com` 当前被代理网络策略拒绝。已保存云配置草稿，保留原网络条目并新增 `api.vercel.com`、`*.vercel.app`；声明仅用于 `api.vercel.com` 的安全凭据 `DEPLOY_VERCEL_TOKEN`，未保存秘密值。保存不会应用、注入凭据或发布。

下一入口：用户在环境安全设置提供部署令牌并审阅、保存、发布配置后，重新检查运行时绑定和 API 访问。按 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) 通过官方托管流程发布当前已验证分支，确认公开 HTTPS 地址无登录保护，再用 SITE_URL 执行 `npm run test:online`，补齐在线资源/完整学习闭环证据及最终网址。令牌可能是代理替换的占位绑定，只按允许的 HTTPS 路由使用，不提取凭据。不要将仓库改为公开、擅自合并 PR 或把临时隧道当稳定交付。在线任务未完成前保持“待部署”状态。
