# 当前阶段：情境学习体验与 Blender 办公室（2026-10-13）

最高优先级：REQUIREMENTS.md首节。已实现情境回忆替代逐词翻译；35段的表达选择有明确意图和同领域合理对比；车站真实延误广播要求理解行动；半开放非预设表达通过自评可继续，保存自评来源并短复习，不给自动语义满分；只记录实际检查的3个关键词语，其余探索不是掌握。原ID、旧完成和高级课程保留。

过程动态在stage-visuals：家/街道/站内/站台/列车/办公室；其他7个过程阶段使用两个共享原创照片图集、轻量角色动作、状态和暂停。没有批量新页面。

3D实验：scripts/build-office.py→public/models/office.glb（402172字节，81网格，1段人物动画）；src/office-lab.ts与OfficeWorld提供相同词典/回忆/听力/回应流程；真实Raycaster点击、OrbitControls视角、AnimationMixer动画，六键盘入口，模型失败/无WebGL回退和减少动画。Three.js0.186.1 MIT许可附完整副本，3D按需加载。新增备用音频，当前1480段，旧URL保留。详见docs/BLENDER.md。

Windows E:\Blender没有挂载，无本机版本/安装操作。scripts/windows-blender.ps1默认只查版本，-Download解析官网最新x64便携版并SHA256验证，保留旧文件，不执行远程脚本。未在Windows执行测试，官网下载查询在云端403，不能声称已下载/安装最新。候选Skills/MCP仅调研未安装。

当前验证：59项单元与安全扫描通过；最终78项完整生产子路径浏览器全部通过（5.6分钟），含1480段真实音频及三端实际GLB/网格点击、动画、减弱动画、回退、提示证据、非预设输出与草稿重载；类型构建、格式、diff检查通过。此前复习fixture时序已修复；一次产物基础路径混用复测被中止，不作为通过证据。源码最终固定后全量重跑通过。线上验收等待本次提交发布。

当前代码尚未提交/部署本阶段；下面保留上一阶段验收和发布历史，不能当作本轮结果。分支feat/english-learning-mvp、PR1保持待合并，在线发布仍用现有GitHub Pages；不强推或擅自合并。

---

# 项目交接状态

更新：2026-10-13（Asia/Shanghai）。当前最高优先级是 REQUIREMENTS 的输入先行教学引擎重构。入口：[教学引擎](docs/TEACHING-ENGINE.md) → RULES → AGENTS。用户授权自主实现、测试、推送与GitHub Pages发布，不授权合并PR、强推、删除重要分支。

## 本阶段实现

- 七个生活过程（通勤、超市、餐厅、机场、酒店、看病、办公室），每个五阶段/30词语/10表达，共35阶段与280个场景教学元素。数据/引擎/播放器分离，新增过程不开发独立页面。
- 所有场景默认观察→词汇/表达输入→辨认→听力→填空→跟读/简单回应→反馈复习。复杂自由表达显式可选；原11成人场景、22B2/C1课程、6入门、3基础场景和先修保留。
- 388原创单元与1154合法WordNet英文补充；词/短语/整句词典、个人收藏/摘词、今日新增与学习证据。check-in名词与check in动词分ID，不冒用词义/音标。
- 看过/收藏不授予掌握。含义辨认与自主实践分离；首次正确1天，到期正确3/7/14天，同日未到期重复不延长；错误10分钟，立即改正不擦除短复习。
- 当前过程/步骤与练习证据本地保存、刷新恢复、下一段和下一过程推荐；10/20/30分钟1/2/3小段。旧v1数据和核心32个ID保留，备份剥离未知/私人模型字段。
- 简单审核同义回应可用，不要求目标词；未知自由句不自动判错。join/attend按语境解释。首次辨认/听力/回应表现分别记录，不把改正后结果算首次满分。跟读只记尝试，有支架输出明确标注，不算独立口语。咖啡等短回应依据完整审核同义句认可；保留的基础文字模式遇未覆盖表达时不判语义错误。
- 自动语音/字幕、关闭/重播/0.7倍/中文，1394段固定备用MP3，旧URL保留。虚拟照片九环境共用2.6MB原创AI图集，Pages同源CDN缓存，懒加载/失败文字回退/暂停/减少动画。不是录像、嘴形同步或3D。
- 无AI完整可学，本地需求生成可用默认引导流程；个人模型的安全内存/加密保险箱与高级模式保留，未调用私人Key或付费服务。私人资料不是前提。

## 当前验证状态

54项单元与安全扫描通过；本地70项完整生产子路径浏览器通过（2.5分钟），最终受影响的25项复测（1.3分钟）、咖啡修复4项及图片修复5项复测通过。最终GitHub生产70项（4.2分钟）与实际公开HTTPS同一70项（4.3分钟）全部通过，包含1394段音频。类型构建、格式、diff检查通过。

已部署源码 `1edff3901b64ee71ed76207373cea9c581a815ef`：[Pages run38409978927](https://github.com/chrisjack2380/english-learning-website/actions/runs/38409978927) build/deploy/verify-online全成功；[CI38409991470](https://github.com/chrisjack2380/english-learning-website/actions/runs/38409991470)成功。部署2026-10-13 14:07:56–14:08:02 UTC，线上验收14:08:44–14:13:01 UTC（北京时间22:08–22:13）。公开页面、index-Bt8x02ik.js、index-BO43nWgD.css、life-atlas.png及WordNet JSON均200且字节与验收构建一致。

实际HTTPS证据 pages-online-evidence artifact11822155872（62114007字节，96张截图）已下载并复查；生产证据11820747976，发布产物11820707941。本轮全量语音未发生临时错误重试。上一修复run的1次HTTP503曾按现有有界重试成功，未删检查/绕过TLS。六张文档精选图已替换为该run真实线上截图，不能误标为仅本地。

代码已提交并推送（9644641主重构、4d5e2db咖啡语义修复、1edff39图片优先/加载提示/完整截图修复）；最终文档/证据提交不重发应用，部署源码以以上sha为准。PR仍OPEN待用户合并。

Git仅保留文档引用的六张真实线上精选图（目录output/playwright，来源为上述HTTPS run）；完整96张截图、报告和三端状态保留Actions产物。新生成截图默认忽略，已有历史图不自动替换；新增精选图用git add -f。

## 操作与下一步

Node24/npm、现有React19/TypeScript/Vite/Vitest/Playwright/Lucide，无新增框架或付费依赖。唯一采用Skill为cloud-environment-onboarding:setup。npm test、npm run format:check、VITE_BASE_PATH=/english-learning-website/ npm run test:production；发布后实际公开HTTPS同一套npm run test:online。

临时经核验的eSpeak NG在/tmp/english-voice/run-espeak；新增固定内容运行ESPEAK_BIN=该路径 npm run audio:generate，仅开发需要。Debian官方InRelease/Packages/SHA256已核验，无未知脚本、sudo、TLS绕过或全局修改。重置环境可能需重新取工具；网站运行不需要它。

分支feat/english-learning-mvp，PR #1 https://github.com/chrisjack2380/english-learning-website/pull/1 OPEN，等待用户合并。网站固定 https://chrisjack2380.github.io/english-learning-website/ 。仓库公开，Pages Source=Actions，github-pages允许main与feat分支，无需重问设置/Token。原生Git及无显式Authorization的受支持HTTPS使用平台注入身份；旧CLI显式凭据401不代表全部权限丢失。合并后移除临时feat部署触发。

本阶段核心与线上验收已完成，后续入口是下面列出的扩展。PR由用户决定合并；不得自动合并或强推。

后续：更多原创/合法领域知识、多义词中文覆盖与上下文消歧、真人多口音音频、更多动画、真实麦克风和跨浏览器、可信后端与个性化长期能力路线。当前开放全文语义、发音、模型质量与实机触屏未认证；具体限制见TESTING与AI文档。

## 上一阶段发布历史（不是本轮验收）

## 验证与发布记录

47项单元与安全扫描通过；最终GitHub生产子路径53项（2.3分钟）及实际公开HTTPS同一53项（2.2分钟）全部成功，包含全部604段音频与完整知识学习闭环。类型、格式、diff检查通过。本机保留75张含历史截图，本轮线上73张/HTML报告独立保存在Actions产物；已复查三端效果。

已部署源码93ea6ab62c12ae49d8550fe6a82ee6148b5986b0：[Pages run38315384715](https://github.com/chrisjack2380/english-learning-website/actions/runs/38315384715)的build/deploy/verify-online全成功，常规CI38315391237成功。部署步骤2026-10-12 22:18:27–22:18:33 UTC；实际HTTPS53项步骤22:19:13–22:21:27 UTC（北京时间10月13日06:19–06:21）。页面/JS/CSS均200，index-Y2N-MzLM.js与index-DR5_7zpz.css字节匹配本机dist；WordNet JSON、原创图片和失败过的音频均200且字节匹配。

线上证据pages-online-evidence artifact11776790691（44680916字节）；生产证据11776598301，发布产物11776543511。后续文档/截图提交不会重发应用。

已修复：译文按钮误提交、原生文件框因系统字体变化溢出、直接应用后下一知识衔接、生成场景人物身份一致、动词变形/派生名词的释义边界。早期在线音频检查的503由trace确认来自Varnish/CDN；资源完整，验收保留604段并加入2次临时状态重试及节流，最终完整通过。Codex对话文件加载503经用户重试恢复，未取得具体下载服务日志，不能归因TUN；没有重置代理或索取私人令牌。

分支feat/english-learning-mvp；PR #1 https://github.com/chrisjack2380/english-learning-website/pull/1 OPEN，标题/说明已围绕知识驱动平台更新，等待用户合并；不能擅自合并、强推或删重要分支。

用户已将仓库公开、Pages Source=GitHub Actions，github-pages环境允许main/feat分支，无需重问设置或私人Token。原生Git及不显式加Authorization的受支持HTTPS使用平台注入身份；CLI旧显式GH_TOKEN401不能判定所有权限失效。

网站固定 https://chrisjack2380.github.io/english-learning-website/ 。Pages工作流生产测试、发布、真实HTTPS同一套在线验收；文档/截图单独提交不会重发应用。合并后移除临时feat发布触发。不能用本机通过替代实际线上证据。
