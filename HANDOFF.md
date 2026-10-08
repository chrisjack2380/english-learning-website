# 开发交接

新任务先读 [REQUIREMENTS.md](REQUIREMENTS.md)、[RULES.md](RULES.md)、[AGENTS.md](AGENTS.md)。

## 当前状态：第一阶段 MVP 已上线 GitHub Pages，生产及线上验收通过

在线网站：https://chrisjack2380.github.io/english-learning-website/

- React/TypeScript/Vite 静态应用，现有 checkout 在 `/workspace/english-learning-website`。
- 新手引导、10/20/30 分钟计划、六课连续路径、每日推荐、下一课衔接、错题复习与真实记录。
- 分步 SVG 教学动画、每课听力/选择/生产性文字练习与已教知识范围内的情境应用。
- 三个四步完整自由场景（问候、点餐、问路），含示范、语音、核心表达、场景操作、错误反馈和任务记录；自由探索不解锁课程。
- 优先系统 TTS，48 段随站备用 MP3，慢速/重复/停止；支持语音识别结果修改及文字回退。
- 本地 schema 校验、导入/导出、存储损坏/写入失败提示；可见学习页面停留时间记录。
- 页面、教学组件、课程与调度逻辑已分离；未来 AI 接口仅为安全服务端契约。

## 验证及文档

- 冻结安装、18 项单元/内容测试、17 项生产版及17项真实HTTPS线上Chromium用例通过；严格类型构建、格式及初次npm audit通过，具体运行和边界见测试报告。
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

用户后续选择 GitHub Pages，确认使用 GitHub Free，并自行将原仓库公开；API 已确认 `private: false`。已删除 Vercel 发布配置，改为 `.github/workflows/pages.yml`，使用官方 configure-pages v6、upload-pages-artifact v5、deploy-pages v5。工作流在 main/当前开发分支 push 后构建、发布，并用实际输出网址执行在线验收，不等待 PR 合并、不擅自合并。

Vite 使用 VITE_BASE_PATH，备用音频使用 import.meta.env.BASE_URL，测试导航/音频请求均保留基址；在线配置允许 HTTPS 项目子路径。最新本机校验：18 项单元测试通过，按 `/english-learning-website/` 构建的严格类型检查和 17 项真实 Chromium 生产用例全部通过（29.7 秒），包含全部 48 音频资源。常规 CI 也按项目子路径验收。新增在线配置此前已验证能列出 17 项测试且缺少 SITE_URL 时拒绝运行；枚举不能当作在线通过。

用户已将 Pages 的 Source 设为 GitHub Actions；公开 API 确认 build_type=workflow、https_enforced=true。已查询当前 App 安装元数据：chatgpt-codex-connector 的 contents/actions 有 write，而 pages/administration 未授予；因此不能直接开通站点或修改环境分支规则。GitHub 官方明确 GITHUB_TOKEN 不负责首次启用；日常发布通过工作流的 pages:write/id-token:write，不要求个人令牌。

发布工作流 37804509674 的第二次尝试通过 build，但 github-pages 环境当时仅允许 main，拒绝当前分支；新增规则 API 被 App 权限拒绝（403）。用户已保留 main 并新增 feat/english-learning-mvp，规则已重读确认。第三次尝试仅重跑失败任务，复用成功构建，deploy 与 verify-online 全部成功；18 项单元、17 项子路径生产用例和17项实际 HTTPS 线上用例通过。部署6940501125的状态 success、environment_url 为上述网址，部署源码提交93d551b。常规CI37804521593成功。

默认分支尚无发布文件时，不依赖 workflow_dispatch 触发，采用重跑已存在的推送任务。在线证据保存在该 run 的 pages-online-evidence（artifact11562094113，约3.46MB）中，包含真实在线桌面/平板/手机截图和HTML报告。云容器的curl也确认HTTPS200、正确页面标题及项目资源路径。额外本容器Chromium视觉访问因代理根证书信任问题报ERR_CERT_AUTHORITY_INVALID，未忽略HTTPS校验；不能冒充该次复核成功。实际HTTPS浏览器验收由GitHub托管Chromium完成，步骤与产物均成功。

CI 收集证据前清空 checkout 中保留的旧截图，Pages 在生产测试确实运行后才上传证据；文档/历史截图更新不触发重新发布，应用或工作流变动仍会验证及发布。新增这些证据隔离规则会触发一次正常验证发布，最终状态以最新Actions运行为准。后续合并仍等待用户，不擅自合并。

云配置草稿新增 chrisjack2380.github.io，更新启动说明为 Pages；移除旧 \*.vercel.app 自定义网络条目，但旧可选 Vercel 凭据绑定使工具自动保留 api.vercel.com。用户无需填写旧 DEPLOY_VERCEL_TOKEN；当前工具无法删除已有凭据声明，若需要清理可在环境设置移除。草稿保存不应用、不发布环境。远程在线验收在 GitHub 托管机器执行，不依赖云环境放行；本云环境直接访问在线网站需相应网络规则生效。
