# 项目交接状态

更新：2026-10-11。入口：REQUIREMENTS 的第二阶段基准 → RULES → AGENTS。成人中高级真实沟通为主，简单的是教学方式。

## 当前第二阶段实现

- 数据驱动场景数据库与通用课程工厂。11 个不同中高级场景，22 个 B2/C1 路径任务：会议、深度 Small Talk、产品介绍、面试、汇报、技术讨论、谈判、客户需求、投诉、跨文化、租房维修。另保留六节入门和三个基础场景。C1 变体不是新的独立场景。
- 所有记录含类型、等级、地点、角色、目标、任务、表达、词汇、语法、文化、对话、难度、练法、评价标准。播放器/动画/卡片按注册表渲染，新增只加数据。
- 本地需求匹配及模板生成、B2/C1、产品/事实参数；采购评估不会杜撰设备效果。最多 12 个独立本地用户场景，保存、继续及删除；未知主题须明确选择模板。
- Make My English Natural 支持场景表达库、已知语法和观点/建议/职责/产品目的组合框架。超出覆盖如实提示，无假 AI 全文判断。
- 可选 OpenAI/Claude/Gemini/兼容模型配置、真实连接测试代码、默认切换、重新配置、删除和锁定；默认内存 Key，可选 PBKDF2/AES-GCM 本地保险箱。独立于学习 schema/备份，网页不调用 GitHub 或开发者后台收集 Key。
- 主动 AI 场景改写、表达分析、六轮角色追问；白名单/长度/任务样例校验，不让 AI 定义 regex/评分/ID。请求失败保留本地；使用 AI 支架标 revised，仍依赖核心流程完成必修。
- 原 localStorage v1/稳定 ID/先修/输出/复习兼容；备份导入重建已知 schema。326 段备用音频，旧 URL 保留；动态句依赖设备 TTS。生产 CSP、HTTPS/无 URL Key/无 Cookie/拒绝跳转/超时/错误脱敏和提交扫描。

## 当前验证与发布

39 项单元检查与安全扫描通过；最终生产子路径 45 项真实 Chromium 流程全部通过（约 1.2 分钟），类型与格式检查通过。68 张实际截图已复查，修复下拉框标签、复选框/隐藏输入框溢出及切换输入保留旧 AI 建议的问题。真实供应商仅协议 mock，未用私人 Key 验收。

本次功能与测试即将提交，提交/推送结果由后续实际操作补记。原网站依然是先前验证的三个中高级场景版本： https://chrisjack2380.github.io/english-learning-website/ 。本次发布后会替换该网址。

GitHub API 当前认证返回 HTTP401/Bad credentials，原生 Git 只读 HEAD 已成功；两者权限分别验证，提交后测试原生 Git 推送，不因 CLI 登录失败就认定全部访问丢失。

分支 feat/english-learning-mvp；PR #1 https://github.com/chrisjack2380/english-learning-website/pull/1 仍待用户合并。远程授权允许提交/推送/发布，不能擅自合并或强推。

用户已经将仓库公开、Pages Source 为 GitHub Actions，并允许 main/feat/english-learning-mvp 在 github-pages 环境部署。Codex App contents/actions 可写，pages/administration 不具备；已解决的首次设置无需重问。官方 Actions 最小权限发布，不需要 Vercel 或个人令牌。合并后移除临时开发分支触发。

## 操作与后续入口

Node24；npm ci --cache /tmp/english-npm-cache；本云 Chromium /usr/bin/chromium。npm test、npm run format:check、VITE_BASE_PATH=/english-learning-website/ npm run test:production。上线后 SITE_URL=实际HTTPS npm run test:online，由 GitHub 托管 Chromium 完成同一套真实流程。云浏览器曾缺代理 CA；不关闭 TLS 或修改持久信任。日志/Artifact ZIP 下载域名可能受限，状态及元数据仍可读。

音频生成仅开发需要经审核 eSpeak/FFmpeg，ESPEAK_BIN=/tmp/english-voice/run-espeak npm run audio:generate；临时工具可能随环境重置消失，普通安装无需生成。

架构扩展见 docs/EXTENDING.md，模型安全见 docs/AI.md。用户的新 BYOK 要求覆盖旧“仅预留 AI”边界；不能回退为假 AI 或内置共享 Key。真实个人服务商连接/模型质量尚未用真实 Key 验收；自动化协议 mock 与真实连接务必区分。

下一阶段：完整 C1 学术论证/长观点输出、更复杂生活事务、更多录音和口音、真人麦克风与跨浏览器；可信后端鉴权/预算/隐私；长期规划/能力模型/账号同步/未完成步骤恢复。
