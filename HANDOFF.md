# 项目交接状态

更新：2026-10-13（Asia/Shanghai）。入口 REQUIREMENTS 第三阶段 → RULES → AGENTS → docs/KNOWLEDGE.md。成人中高级知识与实际交流为主；简单的是教学方式。第三阶段已上线并完成实际HTTPS验收，代码和文档已同步GitHub；PR待用户合并。

## 第三阶段已实现

- 32个原创词/短语/语法单元：双语含义、音标、搭配、例句、用法/区别、等级/目标、来源、理解题。IELTS/TOEFL/六级为学习方向，非官方全量教材或认证。
- Knowledge→Scenario 共用引擎，依据商务/学术/日常角色和原场景生成4轮应用任务，自己的听力、表达、追问及评价标准，不继承无关结账任务。
- 目标知识路线、理解和应用分离、1/3/7/14天复习；错误或支架立即巩固。成人首页默认知识训练，系统课程保留。只探索不跳过必修。
- 原生模态即时词典、词/选择短语/整句查询。1154个合法WordNet英文词条懒加载，完整版权/许可；未审核中文/音标明确缺省。原创单元词库与200条任意摘词/中文笔记可备份。
- 私人TXT/Markdown≤200KB或粘贴，原文仅页面内存发现已收录知识，可清除；不存Git、不自动存本地或发模型。不支持PDF教材解析。
- 开放输出不再用关键词/词数通关。四层本地反馈、已知用法错误、自评确认和可选模型分析；时态/事实区别保留，不擅自改成职责。taskEvidence只留历史兼容，不能恢复为全文评分。
- 提交后预设角色自动播音，重播/慢速/审核中文，原生TTS句子边界与MP3整句提示。604段备用合成音频，旧URL不改；动态句依赖设备声音。
- 原创AI照片风格虚拟角色和两环境、活动角色轻动效、阶段变化，暂停/减少动画/切回SVG。不是真人录像、3D骨骼或嘴形同步。
- 可选已有个人模型协议、安全保险箱、场景改写/查词/表达/角色接话。本场景自动模式需明确开启，提交一次请求一次，关闭停止后续自动请求，离开取消未完成请求。无私人Key调用验收，模型协议用mock，不冒充真实连接或质量。
- 原11场景、22B2/C1系统任务、6入门/3基础场景、本地模板生成、原v1数据/备份和先修保留。新增知识不新增独立页面。

## 验证与发布记录

47项单元与安全扫描通过；最终GitHub生产子路径53项（2.3分钟）及实际公开HTTPS同一53项（2.2分钟）全部成功，包含全部604段音频与完整知识学习闭环。类型、格式、diff检查通过。本机保留75张含历史截图，本轮线上73张/HTML报告独立保存在Actions产物；已复查三端效果。

已部署源码93ea6ab62c12ae49d8550fe6a82ee6148b5986b0：[Pages run38315384715](https://github.com/chrisjack2380/english-learning-website/actions/runs/38315384715)的build/deploy/verify-online全成功，常规CI38315391237成功。部署步骤2026-10-12 22:18:27–22:18:33 UTC；实际HTTPS53项步骤22:19:13–22:21:27 UTC（北京时间10月13日06:19–06:21）。页面/JS/CSS均200，index-Y2N-MzLM.js与index-DR5_7zpz.css字节匹配本机dist；WordNet JSON、原创图片和失败过的音频均200且字节匹配。

线上证据pages-online-evidence artifact11776790691（44680916字节）；生产证据11776598301，发布产物11776543511。后续文档/截图提交不会重发应用。

已修复：译文按钮误提交、原生文件框因系统字体变化溢出、直接应用后下一知识衔接、生成场景人物身份一致、动词变形/派生名词的释义边界。早期在线音频检查的503由trace确认来自Varnish/CDN；资源完整，验收保留604段并加入2次临时状态重试及节流，最终完整通过。Codex对话文件加载503经用户重试恢复，未取得具体下载服务日志，不能归因TUN；没有重置代理或索取私人令牌。

分支feat/english-learning-mvp；PR #1 https://github.com/chrisjack2380/english-learning-website/pull/1 OPEN，标题/说明已围绕知识驱动平台更新，等待用户合并；不能擅自合并、强推或删重要分支。

用户已将仓库公开、Pages Source=GitHub Actions，github-pages环境允许main/feat分支，无需重问设置或私人Token。原生Git及不显式加Authorization的受支持HTTPS使用平台注入身份；CLI旧显式GH_TOKEN401不能判定所有权限失效。

网站固定 https://chrisjack2380.github.io/english-learning-website/ 。Pages工作流生产测试、发布、真实HTTPS同一套在线验收；文档/截图单独提交不会重发应用。合并后移除临时feat发布触发。不能用本机通过替代实际线上证据。

## 操作与下一步

Node24；npm ci --cache /tmp/english-npm-cache；Chromium /usr/bin/chromium。npm test、npm run format:check、VITE_BASE_PATH=/english-learning-website/ npm run test:production。云浏览器可能缺代理CA，不能关闭TLS/持久改信任；线上验收用GitHub托管Chromium。日志/ZIP下载域名可能受限，API元数据可读。

音频增量仅开发需要经审核eSpeak/FFmpeg：ESPEAK_BIN=/tmp/english-voice/run-espeak npm run audio:generate；临时工具随环境重置可能消失，普通运行不需要。

扩展入口 docs/KNOWLEDGE.md、EXTENDING.md；模型安全 docs/AI.md；授权记录 docs/RESEARCH.md。下一阶段：更多原创知识/合法教材解析、更细的领域任务、多口音真人语音、跨浏览器/真实麦克风、可信后端与长期能力规划。未知中文/全文语义/专业事实不伪造。用户新BYOK授权覆盖早期仅预留接口限制，但密钥仍禁止入仓或学习备份。
