# GitHub Pages 在线交付

关联 REQUIREMENTS.md、RULES.md、HANDOFF.md。用户要求开发者完成发布与在线验收，并选择 GitHub Pages；用户只在在线网站测试。

## 已确定的方案

用户使用 GitHub Free，并已自行把 `chrisjack2380/english-learning-website` 从私有改为公开。API 已核验公开状态。GitHub Free 可用于公开仓库的 Pages；保留私有仓库需要支持该能力的付费套餐，这不是添加 Actions 权限就能绕过的限制。本项目无需付费模型、后端或额外托管账号。

预期使用项目站点 `/english-learning-website/`，实际在线地址以 `actions/deploy-pages` 成功返回的 `page_url` 为准。Vite 通过 `VITE_BASE_PATH` 构建资源路径，音频通过 `import.meta.env.BASE_URL` 加载；浏览器测试也使用同一子路径。不要只验证根路径开发服务器。

## 权限原因及一次性开通

已读取当前 Codex GitHub App 安装元数据：`chatgpt-codex-connector` 有 `contents: write` 和 `actions: write`，`pages` 和 `administration` 未授予。因此可以推送工作流、读 Actions 日志和重跑任务，但不能直接启用 Pages 或给自己扩展 App 权限。仓库 API 的 `permissions.admin: true` 描述用户仓库角色，不代表集成凭据拥有该权限。

GitHub 官方 `actions/configure-pages` 的 `enablement` 输入明确要求 `GITHUB_TOKEN` 以外的令牌；App 需要 `administration: write` 和 `pages: write`。本工作流不假装添加 YAML 权限就可以首次开通站点，也不要求用户提供个人令牌。

账号持有人只需到 [仓库 Pages 设置](https://github.com/chrisjack2380/english-learning-website/settings/pages)，在 **Build and deployment → Source** 选择 **GitHub Actions**。如果账号政策要求确认创建公开站点，按 GitHub 提示完成开通。无需先合并 PR，也无需本机运行代码。

启用后开发者重跑 `Publish GitHub Pages` 工作流。构建任务声明 `pages: read`；部署任务声明 `pages: write` 和 `id-token: write`，使用 GitHub 自动发放、仅作用于本仓库和任务的 `GITHUB_TOKEN`。首次开通和日常自动发布是两项不同操作。

如果部署明确提示 `github-pages` 环境拒绝当前分支，则账号持有人需在 Settings → Environments → github-pages 的分支规则中允许 `feat/english-learning-mvp`；只在实际遇到该限制时调整，不关闭其他保护规则。

## 自动发布与验收

`.github/workflows/pages.yml` 在 main 和当前开发分支推送时运行，亦支持手动触发。允许当前分支是为了在 PR 合并前交付真实网站；用户合并后移除该临时分支触发，正式发布只跟随 main。PR 本身不会触发发布。

1. 读取实际 Pages 配置及 `base_path`。
2. 冻结安装、格式、18 项规则/内容测试，并按 Pages 子路径构建真实 dist 和执行 17 项生产浏览器测试。
3. 官方 `upload-pages-artifact` 上传构建产物；`deploy-pages` 发布，并输出真实站点地址。
4. 使用输出的 `SITE_URL` 在独立 GitHub Actions Chromium 上执行全部 17 项在线测试。配置不启动本地服务器，直接请求公开 HTTPS 站点，允许根路径或项目子路径。
5. 上传 `pages-build-evidence` 和 `pages-online-evidence`，包括桌面、平板、手机截图和测试报告。在线测试只写独立测试浏览器的 localStorage，不影响用户的学习记录。
6. 确认在线完整学习闭环、三场景及全部 48 音频通过后，更新交接文档和交付实际网址。生产构建通过不等于网站已上线；部署失败或在线测试失败应如实报告。

常规 CI 同样按仓库项目子路径验收生产版本，并上传 website-dist；即使 Pages 尚未启用也能独立验证代码。

## 本地及云环境维护入口

在项目目录设置非敏感变量 `VITE_BASE_PATH=/english-learning-website/`，运行 `npm run test:production` 可验证与 Pages 相同的子路径。根路径版本不设置该变量即可。上线后设置非敏感 `SITE_URL` 为实际 HTTPS 地址，再运行 `npm run test:online`；地址末尾斜杠会规范化，无查询参数或认证信息。

云执行环境若尚不允许访问 `chrisjack2380.github.io`，开发者须保存对应域名到环境草稿；保存不会应用或发布环境。GitHub Actions 在线验收在 GitHub 托管机器执行，不依赖云环境网络放行。原 Vercel 凭据草稿已不用于本方案，用户无需填写。

## 更新与回滚

先验证再发布，保留已有 Git 历史、部署记录和 PR 审核；不强推、不擅自合并。GitHub Pages 的基础缓存策略由平台管理，本仓库不再宣称 Vercel 的自定义缓存头或权限头生效。站点保持固定域名与项目路径；迁移学习记录使用导出/导入。真实麦克风、合成声音听感和未测试浏览器仍据实标注限制。
