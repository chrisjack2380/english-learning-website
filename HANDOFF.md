# 项目交接状态

更新：2026-10-12。入口 REQUIREMENTS 第三阶段 → RULES → AGENTS → docs/KNOWLEDGE.md。成人中高级知识与实际交流为主；简单的是教学方式。第三阶段本机验收完成，正在提交和发布；实际线上记录将在成功后补充。

## 第三阶段已实现

- 32个原创词/短语/语法单元：双语含义、音标、搭配、例句、用法/区别、等级/目标、来源、理解题。IELTS/TOEFL/六级为学习方向，非官方全量教材或认证。
- Knowledge→Scenario 共用引擎，依据商务/学术/日常角色和原场景生成4轮应用任务，自己的听力、表达、追问及评价标准，不继承无关结账任务。
- 目标知识路线、理解和应用分离、1/3/7/14天复习；错误或支架立即巩固。成人首页默认知识训练，系统课程保留。只探索不跳过必修。
- 原生模态即时词典、词/选择短语/整句查询。1154个合法WordNet英文词条懒加载，完整版权/许可；未审核中文/音标明确缺省。原创单元词库与200条任意摘词/中文笔记可备份。
- 私人TXT/Markdown≤200KB或粘贴，原文仅页面内存发现已收录知识，可清除；不存Git、不自动存本地或发模型。不支持PDF教材解析。
- 开放输出不再用关键词/词数通关。四层本地反馈、已知用法错误、自评确认和可选模型分析；时态/事实区别保留，不擅自改成职责。taskEvidence只留历史兼容，不能恢复为全文评分。
- 提交后预设角色自动播音，重播/慢速/审核中文，原生TTS句子边界与MP3整句提示。604段备用合成音频，旧URL不改；动态句依赖设备声音。
- 原创AI照片风格虚拟角色和两环境、活动角色轻动效、阶段变化，暂停/减少动画/切回SVG。不是真人录像、3D骨骼或嘴形同步。
- 可选已有个人模型协议、安全保险箱、场景改写/查词/表达/角色接话。本场景自动模式需明确开启，提交一次请求一次，关闭/离开取消。无私人Key调用验收，模型协议用mock，不冒充真实连接或质量。
- 原11场景、22B2/C1系统任务、6入门/3基础场景、本地模板生成、原v1数据/备份和先修保留。新增知识不新增独立页面。

## 验证与发布记录

本机最终验证：47项单元（含音频覆盖）与53项真实Chromium生产子路径流程全部通过（约1.8分钟），类型/格式/diff检查通过；75张截图复查，历史11次提交的已知凭据扫描无匹配。首发源码1d3294d已推送；Pages38267793702与CI38267798644的生产套件各52通过/1失败（手机知识页横向溢出），部署因此未执行。已修复原生文件框宽度和fieldset边界，增加实际文本上传验证，正在复验和发布。见docs/TESTING.md。

上次已上线源码847fc2748b0bcf48b2a88442ff682e2a6d4f6b6d，Pages run38110841350。当前分支 feat/english-learning-mvp；PR #1 https://github.com/chrisjack2380/english-learning-website/pull/1 OPEN，第三阶段提交后更新标题/说明，等待用户合并。不能擅自合并、强推或删重要分支。

用户已将仓库公开、Pages Source=GitHub Actions，github-pages环境允许main/feat分支，无需重问设置或私人Token。原生Git及不显式加Authorization的受支持HTTPS使用平台注入身份；CLI旧显式GH_TOKEN401不能判定所有权限失效。

网站固定 https://chrisjack2380.github.io/english-learning-website/ 。Pages工作流生产测试、发布、真实HTTPS同一套在线验收；文档/截图单独提交不会重发应用。合并后移除临时feat发布触发。不能用本机通过替代实际线上证据。

## 操作与下一步

Node24；npm ci --cache /tmp/english-npm-cache；Chromium /usr/bin/chromium。npm test、npm run format:check、VITE_BASE_PATH=/english-learning-website/ npm run test:production。云浏览器可能缺代理CA，不能关闭TLS/持久改信任；线上验收用GitHub托管Chromium。日志/ZIP下载域名可能受限，API元数据可读。

音频增量仅开发需要经审核eSpeak/FFmpeg：ESPEAK_BIN=/tmp/english-voice/run-espeak npm run audio:generate；临时工具随环境重置可能消失，普通运行不需要。

扩展入口 docs/KNOWLEDGE.md、EXTENDING.md；模型安全 docs/AI.md；授权记录 docs/RESEARCH.md。下一阶段：更多原创知识/合法教材解析、更细的领域任务、多口音真人语音、跨浏览器/真实麦克风、可信后端与长期能力规划。未知中文/全文语义/专业事实不伪造。用户新BYOK授权覆盖早期仅预留接口限制，但密钥仍禁止入仓或学习备份。
