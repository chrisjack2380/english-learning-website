# Blender 办公室教学实验

本阶段使用云环境现有 **Blender 4.3.2**，实际建模/GLB导出/渲染成功。原生 `bpy` 脚本不需 MCP、付费服务或第三方素材；旧版本对本次功能可用，不以更新版本作为网站前提。原始模型脚本在 `scripts/build-office.py`，模型在 `public/models/office.glb`，网页按需加载 `OfficeWorld.tsx`。Three.js 0.186.1 / @types 0.186.0 使用 MIT 许可，新增依赖锁定版本，Three.js许可完整保存在public/licenses/three.txt；Blender 工具使用 GPL，原创导出资产不因建模工具变成 GPL。

## 实际生产方式

```sh
blender -b --python scripts/build-office.py
# 可选独立渲染，图片写入 /tmp，不影响网页加载
blender -b --python scripts/build-office.py -- --render
```

脚本只重建自己的空场景并写入指定模型及清单，不读取用户 .blend，不联网、不安装插件。软边、PBR材质、办公室切面、白板/日历/电脑/笔记本和原创简化角色；导出 Y-up、物体 extras.term、人物关键帧。GLB 内嵌几何与动画，无纹理外链；构建末尾验证实际文件头、物品集合、动画、2MB预算。本次约393KiB、81网格、83节点、一段动画。

`GLTFLoader` → 语义 mesh → Raycaster → 当前词语 → 同一词典/个人词库。OrbitControls 支持鼠标/触控转动；六个 DOM 物品按钮提供键盘入口；AnimationMixer 播放导出动画，支持招手、暂停和减少动画偏好。离开页面释放几何、材质、WebGL、观察器和事件。场景使用同一教学播放器和 `office-lab` 记录；不完成其他系统课。

首页普通流程不加载 Three.js。进入3D才加载约164KB gzip模块及GLB。此模块已有GLB加载错误、无WebGL回退，可继续文字学习。自动化使用软件 WebGL，不能据此宣称低端真机GPU性能已测。当前是简化人物与单房间技术实验，不是真人、口型同步、复杂骨骼或生产级建筑写实。

## GitHub工具研究（2026-10-13）

- [RobLe3/cc-blender-skill](https://github.com/RobLe3/cc-blender-skill)：MIT，90 stars，最近推送2026-10-12；README、许可及建模/动画/导出 Skill 原文已查看。当前指南优先Blender Lab MCP（其声明需要5.1+），也支持社区MCP；4.x兼容尚有未验证部分。可借鉴格式选择、关键帧和导出检查，但本次**未安装、未启用这些Skills**，没有运行其脚本。
- [arjun988/blender-skills](https://github.com/arjun988/blender-skills)：MIT，296 stars，最近推送2026-07-10；查看仓库元数据、README、许可和目录。大量专题/MCP工作流超出一个教学Demo所需；没有完整审查全部脚本，未安装。
- [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender)：MIT，30626 stars，最近推送2026-10-06；查看README/许可、pyproject、server.py与addon.py相关实现。社区项目，非Blender Foundation官方；本地socket与Python执行/可选外部生成服务增加权限和依赖。本次无需常驻服务或模型密钥，未安装/运行安装脚本。

结果：AI辅助生成并复查原创 `bpy` 脚本已完成小规模模型、动画、导出和网页交互闭环。适合复用规则明确的教学物件；真实人物、资产美术和复杂空间仍需人工设计、更多设备验证。没有通过运行候选MCP来测量效率提升，不能把文档研究称为MCP实测。

## Windows E:\Blender

2026-10-27 已在 Windows 本机实际读取 `E:\Blender` 并运行助手的默认检查。目录有 `blender-4.0.2-windows-x64.msi`（333684736 字节）及 `4.0\python`、`4.0\scripts`，递归文件统计为 211 个 `.pyc` 和该 MSI；没有找到 `blender.exe` 或 `.blend`，PATH 也未解析到 Blender 命令。目录内不存在可运行安装，不能把 MSI 文件名当作已安装程序版本。这个结论限于已检查的目录和 PATH，不代表扫描了整台电脑。

本轮只读取目录及运行默认检查，没有删除、下载、安装或更新。网站直接使用仓库的 GLB，不需要先安装 Blender。后续改动模型时再确定可用的本机程序；历史云端 4.3.2 不能作为 Windows 版本证明。

提供 `scripts/windows-blender.ps1`，在你的Windows环境运行默认只检查E目录的程序版本；加 `-Download` 才从Blender官网下载页解析最新稳定Windows x64便携版，并验证官网SHA256，下载/解压到 `E:\Blender\versions`。不执行下载程序，不删除旧版本、项目、素材、插件或设置，不执行远程安装脚本。目录已经存在则不覆盖；官网格式改变或无法取校验值则停止。

```powershell
# 仅检查；在脚本所在目录运行
.\windows-blender.ps1
# 下载最新版，保留原安装
.\windows-blender.ps1 -Download
```

助手的默认检查现已在 Windows PowerShell 实际运行，输出 `No Blender executable found in this folder.`；`-Download` 下载与解压流程仍未实测，本轮没有查询最新版本。历史云端官网请求曾返回403，不能据此推断本机网络或最新版本，不绕过TLS、使用未经验证镜像或盲删E目录。
