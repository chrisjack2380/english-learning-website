# 在线交付与发布

关联 REQUIREMENTS.md、RULES.md、HANDOFF.md。用户已明确要求开发者完成发布，用户仅访问在线网址测试；不要再要求用户本机安装或先试玩。

## 托管方案

默认 Vercel 静态托管，站点根路径部署，保留 GitHub 私有仓库。无需后端、AI Key、数据库或付费模型；不为发布把仓库改成公开，也不擅自合并 PR。使用个人免费托管方案的额度范围，若需要升级付费先告知用户。

仓库 `vercel.json` 已声明 Vite、`npm ci`、`npm run build` 和 `dist`。Node 使用 `.node-version` 的 24 系列。首页重新验证缓存，带内容哈希的 assets 长期缓存；audio 的文件名不会随内容自动改变，使用短缓存而非 immutable。权限策略保留同源麦克风，禁用未使用的摄像头与定位。

## 发布权限

GitHub 推送权限不代表 Pages 或 Vercel 部署权限。2026-10-08 检查：仓库为私有、Pages 未启用，读取及创建 Pages 的 API 均返回 `Resource not accessible by integration`（403）。当前仅发现已有 GitHub 凭据，未发现 Vercel/Cloudflare/Netlify 凭据。对 `api.vercel.com` 的请求还被云网络策略阻止。这些是外部前提，不是应用构建问题。

部署操作需要用户授权的 Vercel 账号或安全凭据。可在云环境安全设置中提供 `DEPLOY_VERCEL_TOKEN`，仅用于 `api.vercel.com`；令牌不要发到聊天、写入代码、JSON 配置或 GitHub。优先复用已有项目；新建项目使用 `english-learning-website`，需要团队范围时再补充非敏感团队/项目标识。`.vercel/` 与 `.env*` 已忽略。环境草稿保存不会应用网络、创建令牌或发布网站。

也可由用户在 Vercel 完成一次 GitHub 仓库连接授权，选择 `feat/english-learning-mvp` 作为当前生产分支；正式合并后再切回 main。这一步仅建立托管授权，开发者仍负责验证上线。检查托管端的 Deployment Protection，验收网址必须无需 Vercel 登录即可打开。不要把匿名临时隧道作为稳定交付。

## 发布前后验收

1. `npm test`、`npm run format:check`。
2. `npm run test:production`：构建真实 dist，自动启动 Vite preview，执行全部课程、三场景、存储/复习/声音/多端流程，检查全部 48 个音频地址返回真实音频。CI 同样验收生产版本，通过后上传 `website-dist`。
3. 通过官方 Vercel 工具或 API 发布验证过的版本；不打印或把认证令牌拼进持久日志。记录提交 SHA、部署状态和实际站点地址。
4. 用公开 HTTPS 站点地址设置非敏感 `SITE_URL`，运行 `npm run test:online`。配置不会启动本地服务器，直接测试部署网站；地址必须是无凭据、查询和片段的 HTTPS 根路径。
5. 在线验收检查首次引导 → 第一课与纠错 → 场景应用 → 下一课 → 重载恢复，并跑全部课程、三个场景和 48 音频资源。截图保存 `output/online/`，HTML 报告 `playwright-report/online/`；不影响用户自己的浏览器学习记录。安全上下文与真实网站头信息另用请求核对。机械语音音质、真实麦克风及未测浏览器仍据实标注。
6. 更新 HANDOFF.md、测试报告、PR 描述，只有部署成功且在线流程通过后才交付可点击网址。

## 回滚与持续更新

保留 Vercel 已通过验收的部署和当前 Git 历史。新版本先检查再部署，失败时通过托管平台回滚到已验证版本，不强推、不删除分支、不覆盖历史。固定网站域名有利于保存 localStorage；切换预览域名不会自动同步旧域名记录。学习记录迁移使用导出/导入。
