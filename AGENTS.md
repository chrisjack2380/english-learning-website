# 开发与协作约定

先读 REQUIREMENTS.md、RULES.md、HANDOFF.md。当前仓库已从环境初始化转为用户授权的应用开发，可以修改源代码、依赖和测试。

- 使用现有 checkout。每个云任务已隔离，无明确要求不创建 Git worktree。
- 普通技术选择自行决策；敏感信息、额外付费、不可逆操作、重大需求变更须用户确认。
- 课程先保证自然语言、先修顺序、目标与练习对应；不得把播放完成视为掌握，不得让自由场景跳过系统课。
- 课程/场景结构见 src/content.ts，调度与记录见 src/learning.ts。新增内容须同时检查语义判定的误接受/误拒绝、复习与连续学习。
- 关键改变运行 npm test、npm run build、npm run format:check；UI 和学习流程运行 npm run test:e2e。本环境用 /usr/bin/chromium；npm 缓存可指定 /tmp/english-npm-cache。
- 测试须真实使用运行网站；不要虚构截图/语音质量/测试结果。语音 mock 只证明接线，真实发音和权限另标限制。
- 不把密钥放到浏览器、源码、日志、文档或 Git。AI 自由对话须经过安全服务端。
- 保留用户更改。验证通过后分任务提交，推送新分支或创建 PR；不强推、不删除重要分支、不擅自合并。
- 阶段完成更新维护文档。交付说明实际执行的测试、提交、远程同步和待合并状态。
- 在线交付见 docs/DEPLOYMENT.md。发布前运行 npm run test:production 验证 dist；部署后用 SITE_URL 配合 npm run test:online 验证真实 HTTPS 网站，不能用本地通过替代在线验收。在线测试仅改动独立测试浏览器的数据。
- 按用户选择使用 GitHub Pages，用户已自行公开仓库。Pages 项目构建/生产验收设置 VITE_BASE_PATH=/english-learning-website/；保留资源、音频和测试的子路径。不要再要求 Vercel 凭据，也不要声称 YAML 能给 Codex App 提权。合并后移除发布工作流中临时开发分支触发。

- 播音文本扩充后，用已审核的本地 eSpeak/FFmpeg 生成工具更新备用音频映射，验证浏览器真实解码与播放；普通环境安装无需重新生成。不要为合成器关闭 TLS/签名/哈希校验。
