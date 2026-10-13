# 一步英语 · Little by Little

**[打开在线网站](https://chrisjack2380.github.io/english-learning-website/)**。面向中文母语成人，以生活场景承载词汇、短语与表达学习：观察 → 学词 → 理解 → 听力 → 模仿 → 简单回应 → 反馈复习。已有基础仍可学习B1–B2与C1内容；复杂自由回答为可选高级模式，等级不是认证。

![输入先行的生活学习](output/playwright/journey-desktop-home.png)

## 如何学习

首次选择水平、每天时长与目标。首页“开始今天的学习”安排到期词语复习或最近未完成的生活阶段；10/20/30分钟建议1/2/3小段。退出后点击今日学习恢复步骤，完成后推荐下一段和下一个过程。“继续入门课程 / 继续系统沟通课”保留原连续课程。

七个完整生活过程：**通勤、超市、餐厅、机场、酒店、看病、办公室**。每个五阶段，共30个词语和10句表达。环境中点标签查看双语含义、发音、搭配、例句，先理解再做选择、听力匹配、填空、跟读和简单回应。麦克风与自主输入可选，没有AI或麦克风也能完成全部学习。医疗场景只练沟通，不提供诊断或用药建议。

知识库有 **388个原创词语、短语、表达与语法单元**，包含原32个学术/商务核心单元；IELTS、TOEFL、六级为原创选编方向，不是完整官方词表或教材。场景用词共享个人词库，单词、选中的短语与整句可查；补充1154个合法WordNet英文词条按需加载。没有审核中文或音标时如实说明；多义词需核对上下文。

今日新词、收藏、含义辨认与自主应用分别记录。浏览与收藏不授予掌握；首次辨认正确次日复习，到期正确按1/3/7/14天延长，同日未到期重复不延长，答错10分钟后再练，立即改正不抹去短复习。跟读勾选只记录尝试，不是发音评分。数据保存在本浏览器，可导出/导入备份，更换设备不自动同步。

原11个职场/社交/商务场景、22个B2/C1系统任务、6节入门与3个基础场景均保留。默认先词汇输入与引导练习；“高级自由表达”与“对话专项训练”进入原模式。自由探索不会解锁必修。本地需求生成使用审核模板与用户事实，未知主题需选模板；新增生活过程只添加数据。

开放表达提供正确性、自然度、语境与升级四层建议。已审核完整同义简单回应可被认可，不要求目标术语；未知说法不自动判错，可对照参考或回到选择回答。Make My English Natural与可选模型分析保留；不以关键词、词数或长度评估自由语义。私人TXT/Markdown≤200KB仅页面内存处理，不必上传资料才能学习，不支持PDF教材解析。

角色输入/回应自动播音，支持关闭、重播、0.7×与查看中文；设备TTS同步句子边界，1394段备用合成MP3按整句提示，非真人录音。原创AI九环境图集由Pages同源CDN缓存，七个过程共用一张约2.6MB图片，支持加载失败、暂停和减少动画。照片轻动效不是真人视频、嘴形同步或3D。

## 可选个人 AI

设置 → AI 模型配置，选择 OpenAI/Claude/Gemini/兼容服务，填个人 Key、模型 ID，确认信任地址，测试后保存/设默认。可用于场景改写、表达分析、即时词典解释和动态角色接话。场景内明确开启“提交后使用我的 AI”才在回答后自动请求，随时关闭；失败仍保留本地学习。

Key 默认仅会话内存，可选口令加密本地保险箱，支持锁定/删除；不会进入 Git 或学习备份。本站没有收集 Key 的后台，主动使用时浏览器向选定供应商发送认证及练习文字，可能计费并受 CORS/权限限制。真实供应商连接/模型质量未用私人 Key 验收，协议测试使用明确 mock。详见 [AI 安全说明](docs/AI.md)。

## 运行与验证

Node.js 24+：

```bash
npm ci
npm run dev
npm test
npm run format:check
VITE_BASE_PATH=/english-learning-website/ npm run test:production
npm run preview
```

Chromium 优先 /usr/bin/chromium，可设 CHROMIUM_PATH；没有浏览器时按 Playwright 官方方式安装。Pages Actions 验证生产子路径并发布，再在 GitHub 托管 Chromium 验收实际公开 HTTPS：

```bash
SITE_URL=https://chrisjack2380.github.io/english-learning-website/ npm run test:online
```

测试结果、真实截图与部署记录见 [docs/TESTING.md](docs/TESTING.md)、[HANDOFF.md](HANDOFF.md)。

## 架构与扩展

```text
src/journey-schema.ts / life-content.ts # 生活过程、词语、表达与受控练习
src/journey-learning.ts               # 步骤恢复、先修、首次成绩与每日小段
src/journey-adapters.ts               # 旧场景/课程转为默认输入先行
src/components/JourneyPlayer.tsx       # 环境发现、学习、听力与简单输出
src/components/WordReview.tsx          # 词语主动回忆与短间隔复习
src/knowledge.ts                       # 原创知识和合法出处
src/knowledge-learning.ts              # 目标路线、理解/应用/复习、知识→场景
src/feedback.ts                        # 开放输出四层反馈，明确能力边界
src/scene-schema.ts / scene-catalog.ts  # 结构化场景数据库
src/advanced-content.ts / content.ts    # 通用系统课程工厂、入门内容
src/scene-generator.ts                 # 模板生成、用户场景、AI文本白名单
src/learning.ts                        # 本地进度和备份校验，兼容原v1记录
src/model-config.ts / model-api.ts     # 独立模型配置、安全协议、保险箱
src/ai-training.ts / ai.ts             # AI任务与未来可信后端契约
src/components/KnowledgeContext.tsx    # 查词、个人摘词与选择短语
src/components/CommunicationPlayer.tsx # 通用教学与角色互动
src/components/AutoDialogue.tsx        # 自动语音和字幕状态
src/pages/Knowledge.tsx                # 知识路线与私人阅读入口
public/dictionary/                    # WordNet子集与完整许可证
public/visuals/                        # 原创虚拟角色/环境素材
public/audio/                         # 1394段备用合成音频，保留旧URL
src/*.test.ts / tests/*.e2e.ts          # 单元及真实浏览器流程
output/playwright/                    # 本机实际截图；mock文件明确标记
```

教学引擎与生活过程见 [docs/TEACHING-ENGINE.md](docs/TEACHING-ENGINE.md)。扩展知识见 [docs/KNOWLEDGE.md](docs/KNOWLEDGE.md)，场景/课程见 [docs/EXTENDING.md](docs/EXTENDING.md)。长期维护入口：[REQUIREMENTS](REQUIREMENTS.md)、[RULES](RULES.md)、[AGENTS](AGENTS.md)、[HANDOFF](HANDOFF.md)。

实际采用 React19、TypeScript、Vite、Lucide、SVG/CSS、Web Crypto、浏览器语音与备用 MP3，Vitest/Playwright/Prettier。无新框架、供应商 SDK 或付费依赖。应用 cloud-environment-onboarding:setup 核对环境；未新增其他 Skills。研究、授权数据与素材出处见 [docs/RESEARCH.md](docs/RESEARCH.md)。

## 当前边界

388 个单元为原创选编，不是 Cambridge/ETS 授权教材、官方六级/AWL全表、完整备考体系或考试分数预测。未收录知识不能任意生成专业课程；本地反馈不完整判断语义、事实、发音或 CEFR，模型建议亦需核对。

数据在当前浏览器保存；设置可导出/导入学习和个人词库，模型配置、自定义场景库不含在学习备份。换设备、清理数据或无痕模式不会自动同步。生活过程的已保存步骤可恢复；原高级自由对话/基础课程中未完成的教学步骤刷新后重来，已完成记录保留。

固定语音为合成声音，动态 AI 句子需设备 TTS；自动播放受浏览器限制，阻止时可重播。原生 TTS 边界突出当前句，MP3用整句提示，不宣称精准逐词时间轴。真人麦克风、真实供应商、Safari/Firefox和实机触屏未验收。后续扩展合法教材解析、更多知识、长篇论证、真人语音、更复杂动画、可信后端和长期能力模型。

新增学习体验：完整例句里的情境回忆、提示后巩固、允许非预设表达的半开放自评、按阶段变化的环境。场景探索 → **进入 3D 办公室** 可转动视角、点击实物、听同事、完成任务；与词库和复习共用本地记录。3D由现有Blender4.3.2制作，Three.js按需加载，无模型/API配置也可用。详见 [Blender制作、工具研究及Windows版本助手](docs/BLENDER.md)；本机E盘未由云环境更改。
