# 教学与工具调研记录

调研日期：2026-10-08。以下区分已联网读取的证据、已有教学知识以及被网络策略阻挡的资料，避免把搜索结果描述成已阅读的文献。

## 教学选择

采用能力导向、任务驱动的入门路径：先听懂并完成一小段交流，再用句型和词汇支撑具体任务。示范 → 支架练习 → 应用 → 主动回忆循环覆盖词汇、语法、听说和短句阅读。用 SVG 操作呈现数量、指代和空间关系，减少抽象中文语法术语。文字输出用于检查能否产生表达，正确率只是当前练习证据。

CEFR 用作能力描述参考，而非把六课或选择题分数映射成等级证书。Pre-A1 阶段以图片/中文支架下的短语和程式化问候起步，后半程引入点餐和方向。单词在词表中的 A1 标签并不意味着接触它之前必须取得 A1 等级。

已通过 GitHub 实际读取：

- [Open Language Profiles / CEFR-J](https://github.com/openlanguageprofiles/olp-en-cefrj)：README 以及 vocabulary v1.5、grammar 20180315 CSV。coffee/cup/dollar/name/nice/table/under 的常见用法标 A1，straight 的副词用法标 A1；基础介词和肯定祈使句列为 CEFR-J A1.1。框架间标注有差异，所以不机械按单词等级安排课序。仅用于内容交叉检查，未复制整个数据集。
- 引用：The CEFR-J Wordlist Version 1.5, compiled by Yukio Tono, Tokyo University of Foreign Studies；The CEFR-J Grammar Profile Version 20180315。数据版权属 TUFS Tono Laboratory，仓库声明研究/商业免费使用且须正确引用。C1/C2 的 Octanove 数据采用 CC BY-SA 4.0，本项目没有使用。
- [FSRS4Anki](https://github.com/open-spaced-repetition/fsrs4anki)：实际读取 README 与仓库元数据（MIT，2026-08-14 有更新）。了解其基于历史的调度/优化分离；MVP 没有引入优化器或声称使用 FSRS。采用可解释的固定间隔 1/3/7/14 天，错误立即/10分钟复习，未来有足够历史再评估算法。

计划参考但本次请求被代理 403 阻挡，**未读取全文**：

- [Council of Europe CEFR descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors)
- [CEFR Companion Volume PDF](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2018/1680787989)
- [British Council: A task-based approach](https://www.teachingenglish.org.uk/professional-development/teachers/knowing-subject/articles/task-based-approach)

上述概念设计依据通用教学知识和已读 CEFR-J 校验；不能视为完成官方 CEFR 全文复核。所需域名已保存到环境草稿，运行时权限与保存的草稿是不同状态。

## Skills 与开源工具筛选

- 已安装技能仅 `cloud-environment-onboarding:setup`，实际用于环境检查和可复用安装/启动配置。没有技能委派或并行代理。
- [OpenAI skills](https://github.com/openai/skills)：实际读取 README、Playwright SKILL.md、包装脚本和 LICENSE.txt；README 已明确废弃并指向 plugins。包装脚本会执行 `npx --yes --package @playwright/cli`。来源官方、该技能 Apache-2.0，但无需给已有浏览器再添加旧 CLI，所以没有安装或执行该包装器。
- [OpenAI plugins](https://github.com/openai/plugins)：通过现有 GitHub 认证读取 README、仓库元数据和 build-web-apps 技能目录（2026-10-08 有更新）；阅读 `frontend-testing-debugging/SKILL.md`，参考真实启动、状态断言、控制台和截图循环。当前没有 Browser 插件，用项目自带 Playwright；没有安装该插件、复制技能文件或执行其脚本。插件仓库没有统一的 GitHub 许可证标识，因此不将其代码作为依赖分发。
- [Microsoft Playwright](https://github.com/microsoft/playwright)：实际读取官方 README、Apache-2.0 许可证与维护元数据。选择直接使用官方测试库和已安装 Chromium，便于保留可重复的项目测试。
- GitHub 搜索了 CEFR descriptors 和 CEFR English language。部分示例题库无许可证且不能支撑本项目完整教学闭环，未使用。没有下载来历不明的安装脚本。
- 不引入 Three.js/大型 3D 角色包：本阶段数量、位置、指代及街区路径用原创 2D SVG 更清晰，体积小并兼容移动设备。

## 实际依赖与许可

安装前通过 npm metadata 检查版本、许可证及 Vite 的 Node 要求；锁文件记录实际版本和完整性哈希。保持默认 TLS 与依赖完整性校验。

| 工具                      | 用途                    | 许可证                       |
| ------------------------- | ----------------------- | ---------------------------- |
| React / React DOM 19.3.0  | 页面及交互状态          | MIT                          |
| Vite 8.3.4 / React plugin | 本地开发和构建          | MIT                          |
| TypeScript 5.9 系列       | 严格类型检查            | Apache-2.0                   |
| lucide-react 1.53.0       | 一致的线性图标          | ISC                          |
| Vitest 4 系列             | 纯规则与内容校验        | MIT                          |
| Playwright Test 1.64.0    | Chromium 用户流程与截图 | Apache-2.0                   |
| Prettier 3.8 系列         | 可维护格式与检查        | MIT                          |
| eSpeak NG 1.52.0+dfsg-5   | 开发期生成备用音频      | GPL-3.0-or-later             |
| FFmpeg / libmp3lame       | 开发期压缩 MP3          | 取决于构建配置；未分发二进制 |

eSpeak 来源 [espeak-ng/espeak-ng](https://github.com/espeak-ng/espeak-ng)（读取 README、COPYING 与源码维护状态；2026-09-22 有提交）。实际生成使用 Debian trixie 签名索引中的官方包及其依赖，解包到可写临时目录运行，无 sudo、无全局环境改动。网站只提供原创句子的音频，未捆绑上述合成/转码工具。

系统字体，不请求第三方字体/CDN/图片。SVG 角色、地图、咖啡店及教学图均为本项目原创。基础学习不调用任何付费 API，不含密钥。
