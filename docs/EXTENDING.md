# 扩展场景、课程与动画

先核对 REQUIREMENTS 的输入先行当前基准与 [教学引擎](TEACHING-ENGINE.md)。新增生活过程在 life-content.ts 增加结构化数据，共用 JourneyPlayer；阶段、词语、表达、听力、填空和简单回应须保持连贯。新增知识先有含义、搭配、区别、理解题和应用任务，再进入场景。稳定 ID 关系到已有进度，标题可以改，ID 不随意变。

## 数据驱动场景库

src/scene-schema.ts 定义 CommunicationScene。原 meeting/smalltalk/pitch 在 advanced-content.ts 与 scene-metadata.ts；其余记录在 scene-catalog.ts。communicationScenes 合并为统一数据库。

新增中高级场景只在 scene-catalog.ts 添加一条完整记录，不改页面、路由、SceneId union、播放器或 SVG 条件。填写：

- id、标题、类型、B2/C1 等级、地点、角色（姓名/工作/关系）、brief、沟通目标与事实限制。
- 词汇、语法、文化、B2/C1 难度、练习方式、具体评价标准。
- environment 的 kind、name、heading、objects、stages。现有 office/lounge/demo/service 四种环境共用原创 SVG。三件屏幕物品保持短标签，stage 与 turn 对齐。
- 听力台词、意图选择题、表达分析题，以及不同的 C1 隐含意义/证据题。
- 三组基本/自然/流畅表达，解释实际差异和适用条件。
- 2–8 轮对话，每轮台词/中文/沟通任务/参考/追问/已审核 rubric/C1 额外条件。当前 11 个场景均四轮；参考须由作者核对语义、语域和事实，不能靠关键词规则通过来证明教学质量。

createCommunicationLesson 自动生成 B2 和 C1 系统课、输出题、复习题；学习路径按数据库顺序分别先修。SceneCards、CommunicationPlayer、World 通过注册表渲染，新增记录自动出现。追加保持原顺序；重排或移除先修会影响旧备份，需要迁移方案。

开放沟通不再调用 taskEvidence：feedback.ts 给四层反馈，已知错误要求改正，其他语义由用户对照任务/参考明确自评，或主动使用模型。taskEvidence 只保留历史数据兼容与旧单元检查，不能恢复为开放输出评分。测试短而有效的独立措辞、已知错误和自评门槛。参考/AI 使用须标记 revised。探索只调用 finishScene，不能调用 finishLesson。

## 模板生成与用户场景

scene-generator.ts 的 intents 匹配中文/英文需求，或让用户选明确模板。生成器复制审核内容并附用户背景。pitch 的参数化采购模板生成需求、证据、比较和评估；产品名称及用户资料不会变成已验证技术效果。

新增模板可加审核的参数化策略和匹配词，保持表达、听力、任务及事实一致。未知需求明确不支持，不随机编写假教学。SavedScene 只保存输入与可选白名单 AI 文本，最多 12 个，本地不跨设备同步；练习证据按基础模板保存，不跳过必修。

AI 改写只能返回 title/brief/context、三组 expressions、与原任务同数的文本 turns。applyAIProse 重用可信 ID、环境、任务和 rubric，拒绝模型 regex、未知字段、畸形结构或超限文本；结构有效不代表语义已认证。模型输出不是课程事实，用户须核对。

## 表达与 AI

communication.ts 保留已知语法规则、审核整句示例、四种组合框架（观点/建议/职责/产品目的）。ExpressionCoach 还读取全部场景的基本表达。新增规则需要明确适用范围及误改风险；未知句不声称全文正确。AI 配置/协议/安全扩展见 docs/AI.md。

## 基础课程

六节入门在 content.ts，LessonPlayer/ScenePlayer 独立保留。新增基础课需目标、解释、先修、互动概念、三题及复习；sceneForLesson 只能使用已教表达。不要让有基础用户先完成 Beginner。

## 音频、测试和发布

新增固定播音句运行 npm run audio:generate（需要经过验证的 eSpeak NG/FFmpeg，可用 ESPEAK_BIN），增量保留旧 URL。网站运行不需要合成器。默认采购生成模板的固定台词也有备用 MP3；任意产品名及 AI 动态台词依赖设备 TTS，设备无声音时明确提示并用文本继续。

运行 npm test、npm run format:check、VITE_BASE_PATH=/english-learning-website/ npm run test:production。真正走完新场景/生成输出、保存重载、下一课、错误/支架反馈及多端截图；生产 CSP、隐私配置与资源亦需验证。推送后用现有 Pages 工作流上线，再在真实 HTTPS 运行同一浏览器套件。阶段结束更新四份维护文档，不用静态截图代替学习闭环。
