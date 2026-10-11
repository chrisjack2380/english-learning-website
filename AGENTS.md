# 开发与协作约定

先读 REQUIREMENTS.md、RULES.md、HANDOFF.md。当前用户授权持续开发并在线发布，普通技术选择自主决定；不擅自合并 PR、强推、删除重要分支或覆盖用户修改。

- 使用现有 checkout，无明确需要不建额外 worktree。先用 rg 查找，依赖优先已有成熟工具，不执行未知远程安装脚本。
- 成人中高级真实沟通为主。已有基础默认 B1–B2，保留入门区和全部旧进度。简单指教学方式，不能降低内容难度。
- 场景模型在 src/scene-schema.ts，原场景数据/工厂在 src/advanced-content.ts，新场景在 src/scene-catalog.ts。新增场景只加数据，禁止在页面按 id 增加特殊判断。角色、环境、任务、C1 意图题和评价标准应完整。
- 输出先明确沟通任务、事实和边界。动画不授予掌握；词语规则不是语义评估。自由/生成/AI 练习不得跳过系统必修课。使用支架或 AI 建议记录 revised 并安排复习。
- 本地生成在 src/scene-generator.ts，必须使用审核模板；AI 只能改写受校验的文本，不允许模型定义 regex、ID、评分或执行代码。不编造产品效果、法律/医疗结论、经历或文化定律。
- 用户第二阶段要求授权网页配置个人模型，覆盖旧版“只预留服务端、不做配置”的限制。配置在 src/model-config.ts，接口在 src/model-api.ts；默认内存 Key，可选 AES-GCM 本地保险箱。密钥只在用户主动操作时发给其选定服务商，不写入源码、Git、环境前端变量、日志、URL、错误或学习备份。见 docs/AI.md。
- AI 配置与本地学习记录严格分开；学习备份进口只重建已知字段。私人模型配置、.env、密钥文件不可入仓，.env.example 只用占位符。AI 网络请求不自动启动，失败保留本地功能。
- 关键改变运行 npm test（含安全扫描）、npm run build、npm run format:check；学习/UI 用 VITE_BASE_PATH=/english-learning-website/ npm run test:production。新内容补备用音频；已审核 eSpeak/FFmpeg 工具只在开发生成时需要，不改变旧音频 URL。
- 测试实际网站，截图覆盖桌面/平板/手机、状态和控制台。模型协议 mock 不等于真实连接或质量；真实麦克风、跨浏览器和真人发音未验收须注明。
- 用户已选择公开 GitHub Pages，并允许 main 与 feat/english-learning-mvp 部署。发布后用 SITE_URL 与 npm run test:online 验收实际 HTTPS，不用本机通过代替线上证据。不要要求 Vercel 凭据或声称 YAML 提升 Codex App 权限。
- 每个明确任务验证后 commit/push，更新 PR 等用户合并；阶段结束同步需求、规则、交接、扩展、测试文档。合并后移除 Pages 临时开发分支触发。
