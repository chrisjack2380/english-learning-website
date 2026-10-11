# 可选个人模型与安全边界

用户第二阶段明确要求在网页配置自己的模型，允许本地保存并禁止任何私人信息入 Git。此要求覆盖旧版“没有后端，先预留接口”的交付范围。GitHub Pages 仍无应用服务器；本站实现用户主动选择的 BYOK（自带 Key）浏览器连接，不使用或发布网站共享密钥。

## 用户操作与真实数据流

学习设置 → AI 模型配置：选择 OpenAI/Claude/Gemini/兼容接口，填写模型 ID 与个人 Key，确认信任地址及发送说明，测试连接，通过后保存，再选择默认模型。可重新配置、锁定全部、删除。

默认 Key 只在模块内存，页面刷新后清除。模型名称、服务商、请求地址保存在本地非敏感偏好。选中“口令加密”后，Web Crypto 用 PBKDF2-SHA256（210000 次、独立 16 字节 salt）派生 AES-GCM-256 密钥；每次独立 12 字节 IV。密文与模型 ID/服务商/模型/地址绑定，口令不保存。刷新需口令解锁，错误口令不释放密钥，删除清除内存、密文及配置。忘记口令需要删除并重配。

主动测试、表达分析、场景改写或角色互动才发起请求。认证 Key 只发送给用户选定的模型服务商；该请求必然需要认证信息，不能声称“完全不离开设备”。本站没有接收/转发 Key 的后台，不发给 GitHub、开发者或另一模型。练习文本也会给服务商处理，按其政策保留、计费；不能输入身份、账号、商业机密。设置页面说明这些实际行为。

## 协议与隔离

- src/model-config.ts：偏好、默认选择、内存密钥、保险箱。独立存储键，不进入 LearningState。
- src/model-api.ts：直接 REST 适配。OpenAI/兼容 Chat Completions、Claude Messages、Gemini generateContent。不安装供应商 SDK。官方 endpoint 固定；兼容地址需用户明确授权完整公共 HTTPS /chat/completions 地址，拒绝用户凭据、查询、fragment、IP/本地域名与自定义端口。
- Key 只在认证 header，Gemini 用 x-goog-api-key，绝不放 query。credentials omit、redirect error、referrer no-referrer、cache no-store；30 秒超时、取消、输入/输出长度限额。供应商错误仅显示状态类别，不显示错误原文或 header；输出移除与会话 Key 完全相同的字符串。
- Claude 浏览器模式使用官方要求的 anthropic-dangerous-direct-browser-access header。兼容服务及供应商 CORS、地区、权限、模型名称、额度可能导致无法连接；不会以预设内容假装成功。
- src/ai-training.ts：表达/角色/场景任务协议。src/scene-generator.ts 只接收白名单文本；不接收 AI 的 ID、regex、任务评分、链接或工具调用。参考示例必须覆盖审核任务，否则拒绝 AI 场景并保留本地版本。
- React 将返回内容作为文本渲染，不使用 HTML 注入；生产 CSP 禁止第三方脚本与内联脚本、object，接口连接允许 HTTPS。模型不会自动发网络、执行代码或更新学习掌握状态。
- AI 角色针对用户回答接话并追问，最多六轮延伸；过程不自动保存。使用 AI 支架将本轮 revised 标记并安排复习。最终必修完成仍依赖原听力、分析与任务输出。
- 学习备份仅包含学习 schema；导入重建已知字段，未知模型信息被剥离。保险箱与模型配置从不导出到学习备份。自定义场景只保存用户任务及通过验证的场景文本。
- .env* 已忽略，.env.example 只有占位符，禁止 VITE\_* 密钥。npm test 包含已知凭据/私人文件扫描；扫描不能证明不存在所有未知格式的机密，提交前仍应检查 diff。

## 安全与质量限制

浏览器直连会让拥有本设备/开发者工具访问权限的人观察当前会话 Key；恶意扩展、已解锁页面的恶意脚本或被攻陷设备仍能窃取它。保险箱保护静态存储，不能解决解锁时这些风险。仅建议个人专用、额度受限的 Key；更高安全需求使用自己部署的鉴权后端。无任何网站运营者 Key 暴露在站点中。

本次不需要用户提供 Key 给开发者；自动化用明确的 test-only 值和 mock 网络验证接线、安全与降级。真实供应商可达性、模型教学质量及实际费用未用私人 Key 验收。模型可能误改含义或编造事实，页面标记 AI 建议需核对；没有“AI 评分认证”。

## 可信后端扩展

保留 src/ai.ts 同源 TutorGateway 契约，适合后续迁到有服务器的部署。服务端应鉴权、会话/Origin/CSRF 校验、模型白名单、请求限流和预算、加密密钥库、脱敏日志、文本保留/删除策略；不得建立公开无鉴权代理。Pages 不能托管该服务，改变部署及费用前再确认。

官方安全依据：[OpenAI Node SDK browser guidance](https://github.com/openai/openai-node#requirements)、[Claude TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript#requirements)、[Google Gen AI SDK](https://github.com/googleapis/js-genai)。本次实际读取官方 README；三者均建议生产服务端管理运营者密钥，浏览器模式需要明确承担风险。未通过安装 SDK 的方式绕过安全建议。
