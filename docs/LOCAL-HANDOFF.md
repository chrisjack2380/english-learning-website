# 本机与其他智能体接手指南

更新：2026-10-27（Asia/Shanghai）。用户选择离开当前 Codex 云开发环境；GitHub 是代码交接来源，GitHub Pages 继续托管现有网站。

## 必须选对分支

- 仓库：https://github.com/chrisjack2380/english-learning-website
- 完整代码分支：`feat/english-learning-mvp`。
- 已发布应用源码：`13a5c146fc276b072728c9c32e2dda60ed461e9b`；此后的交接文档提交不会改变该部署来源。
- `main` 目前只有初始 README；直接下载默认分支会拿不到网站代码。
- [PR #1](https://github.com/chrisjack2380/english-learning-website/pull/1) 尚未合并。接手不需要先合并；不得自动合并、强推或删除重要分支。
- 网站：https://chrisjack2380.github.io/english-learning-website/

## 在本机建立项目

在自己选择的开发目录执行，Git 和 Node.js 24 需在本机可用：

```sh
git clone --branch feat/english-learning-mvp https://github.com/chrisjack2380/english-learning-website.git
cd english-learning-website
npm ci
npm run dev
```

以终端实际输出的网址为准，默认 `http://localhost:5173/`。在本地智能体应用中打开这个项目文件夹，并选择本地执行环境。已有同名 checkout 时先检查 `git status`、保存个人修改，再获取开发分支；不要覆盖已有目录。

仓库公开，克隆不需要云环境凭据；推送时在本机使用自己的 GitHub 登录。不要复制云端 Token、私人模型配置或缓存。无需提供 Vercel 凭据、网站模型 Key 或其他付费服务才能运行基础教学功能。

网站学习进度存在浏览器本地，同一个线上网址与本地开发网址的存储不共享。需要转移学习进度时，使用网站学习数据导出/导入；个人模型配置不包含在学习备份中，也不要放进 Git。

## 接手阅读与测试

依次读 `AGENTS.md`、`REQUIREMENTS.md`、`RULES.md`、`HANDOFF.md`，再查 `README.md`、`docs/TEACHING-ENGINE.md`、`docs/EXTENDING.md`、`docs/TESTING.md`、`docs/BLENDER.md`。需求文件首节为当前优先级，后面的历史范围不能覆盖最新输入先行流程。

日常修改验证：

```sh
npm test
npm run format:check
npm run build
npx playwright install chromium
```

Windows PowerShell 的生产子路径与线上验收命令：

```powershell
$env:VITE_BASE_PATH = '/english-learning-website/'
npm run test:production
Remove-Item Env:VITE_BASE_PATH
$env:SITE_URL = 'https://chrisjack2380.github.io/english-learning-website/'
npm run test:online
Remove-Item Env:SITE_URL
```

macOS/Linux shell：

```sh
VITE_BASE_PATH=/english-learning-website/ npm run test:production
SITE_URL=https://chrisjack2380.github.io/english-learning-website/ npm run test:online
```

生产浏览器测试使用 `dist` 和 4173 端口，测试期间不要同时执行其他构建覆盖产物。新环境的实际测试结果需自行核实；历史云端通过不代表 Windows 已验收。

## 已核实的发布与交接边界

2026-10-27 核实 [Pages run 38422813178](https://github.com/chrisjack2380/english-learning-website/actions/runs/38422813178) 的 build、deploy、verify-online 均成功，[CI run 38422825649](https://github.com/chrisjack2380/english-learning-website/actions/runs/38422825649) 成功，来源均为 `13a5c14`；公开网站返回 HTTP 200。此次交接没有重跑浏览器或下载复查最新线上截图。线上截图/报告在 Pages run 的 `pages-online-evidence`，历史文档截图有独立来源，不要混用。

代码已包含七个生活过程、情境练习、个人词库/复习、自动语音、可选半开放输出和原创 Blender 办公室 Demo。办公室入口在场景探索中的“进入 3D 办公室”。无需重新从零开发或把未覆盖的自由表达改为关键词通关。

普通网站启动无需安装 Blender：`public/models/office.glb` 已随仓库提供。需要改资产时使用 `scripts/build-office.py`，具体流程见 `docs/BLENDER.md`。当前云端验证使用 Blender 4.3.2，不代表用户 Windows 安装版本。

用户曾授权检查 `E:\Blender`，并在旧版本不适用时更新到该文件夹。云端无法访问它，检查、删除、下载、安装均未执行。接手本机智能体应先读版本、确认实际目录和个人资产，再决定是否需要更新；不得删除个人 `.blend`、资产、插件或设置。`scripts/windows-blender.ps1` 提供默认只检查和可选下载逻辑，但尚未经 Windows 实机验证，执行前需审阅；不要把它当作已验证的安装器。

生成新增固定语音所需的临时 eSpeak 路径可能不存在于本机；已提交的 1480 段 MP3 可直接使用，新增语音工具步骤见项目文档。云端 `/tmp`、依赖目录和进程不属于迁移前提。

开发与发布继续沿用当前分支和 PR，验证后普通提交/推送；现有 Actions 会负责代码变更的 Pages 发布和线上验收。仅文档变更不触发 Pages 重发。后续用户明确同意合并时，再处理 PR 与临时开发分支的发布规则。

## 可直接转发给接手智能体

> 请接手本地 `english-learning-website` 项目，不使用原 Codex 云开发环境。仓库为 `chrisjack2380/english-learning-website`，完整代码在 `feat/english-learning-mvp`，不要使用目前只有 README 的 `main`。先读取 AGENTS.md、REQUIREMENTS.md、RULES.md、HANDOFF.md 和 docs/LOCAL-HANDOFF.md，检查 Git 状态并保留个人修改。使用 Node.js 24 安装依赖、启动网站并验证本机环境。保持当前输入先行的教学流程、旧学习记录、词库与复习，继续按我的需求迭代。需要处理 Blender 时先检查本机 E:\Blender 的真实版本与文件，不把云端记录当作本机安装结果。保持 GitHub Pages 原网址，测试后提交推送并更新 PR #1，未经我确认不得合并、强推或删除重要分支。明确区分实际验证、历史结果和未完成事项。
