# 输入先行阶段验证入口

2026-10-13（Asia/Shanghai）。54项单元与安全扫描、本地70项完整生产浏览器及最终25项受影响流程/咖啡修复4项复测和图片修复5项复测通过。最终GitHub生产70项（4.2分钟）与实际公开HTTPS同一70项（4.3分钟）全部通过，类型构建/格式/diff通过。下文53项等为上一阶段历史，不能混为本轮数量。

本轮新增验收：七个五阶段生活流程完整完成；首次打开→发现/收藏不授予掌握→辨认→听力→填空→简单回应→短复习→刷新→下一段；两种错误分类首次成绩；无AI生成产品场景默认引导可完成；保留原课程/高级输出/安全模型流程；全1394个备用音频HTTP与音频类型检查；真实图片失败回退、键盘/自动语音和三端无溢出。

## 本轮真实线上精选截图

- [桌面首页](../output/playwright/journey-desktop-home.png)
- [平板首页](../output/playwright/journey-tablet-home.png)
- [手机默认学习](../output/playwright/journey-mobile-discovery.png)
- [桌面即时词典](../output/playwright/journey-desktop-dictionary.png)
- [通勤全部完成](../output/playwright/journey-commute-complete.png)
- [办公室输入](../output/playwright/journey-office-day-observe.png)

以上六图来自最终真实HTTPS run38409978927；96张线上截图/HTML报告完整保存在Actions产物，已下载复查。Git只保留六图，其余本地重放截图默认忽略。模型连接/语音识别mock保持明确标签；真人发音、私人服务商Key、实机触屏、Safari/Firefox未验收。图片为原创合成环境，非视频或嘴形同步；未知开放表达不进行可靠语义认证。

## 本轮发布证据

最终源码 `1edff3901b64ee71ed76207373cea9c581a815ef`：[Pages38409978927](https://github.com/chrisjack2380/english-learning-website/actions/runs/38409978927)构建/部署/verify-online成功；[CI38409991470](https://github.com/chrisjack2380/english-learning-website/actions/runs/38409991470)成功。原始日志确认生产70 passed (4.2m)、线上70 passed (4.3m)。生产验证14:03:19–14:07:41 UTC，部署14:07:56–14:08:02，线上14:08:44–14:13:01 UTC（北京时间2026-10-13 22:08–22:13）。在线配置不启动本地服务器。

pages-online-evidence：artifact11822155872 / 62114007字节 / 96张截图；生产证据11820747976，发布产物11820707941。已下载线上证据并复查手机、词典和场景；公开HTML、index-Bt8x02ik.js、index-BO43nWgD.css、life-atlas.png、WordNet JSON均200且与验收构建字节一致。

1394个语音文件全部非空且MIME正确。本轮未记录临时重试；前一修复run的1次HTTP503经有界重试成功。没有删除检查、忽略404/类型错误或关闭TLS。没有证据将CDN503归因于用户TUN。本阶段未调用真人模型Key或认证发音。

## 上一阶段历史（不是本轮通过依据）

# 验证与截图

2026-10-13（Asia/Shanghai）第三阶段知识驱动升级。实际运行生产构建，使用 /english-learning-website/ 子路径；47项单元及最终GitHub生产/实际HTTPS各53项真实浏览器流程全部通过；类型构建、格式及diff检查通过。最终GitHub生产53项与实际公开HTTPS同一53项全部通过。

## 验收覆盖

1. 首次成人选择目标 → 首页知识推荐 → 含义/搭配/理解题 → 场景听力/表达分析 → 四轮自主输出/反馈/自评 → 保存应用与复习 → 重载恢复；自由知识应用不完成必修课。
2. 32个知识模型、5目标路线、记录校验、理解/应用分离、错误/支架复习、领域一致性和604段音频覆盖。
3. 已知词完整双语词典、WordNet实际懒加载英文释义、未知词提示、个人摘词/中文笔记及学习备份；私人文本不写localStorage、可清除，改变目标改变真实推荐。
4. 提交后自动语音，无点击播放前置；模拟原生TTS边界突出当前句、重播/译文；真实MP3解码、播放推进、0.7×、停止。所有604个文件HTTP非空/音频类型检查分批执行，未跳过。
5. 分层反馈、自评门槛、短而有效独立措辞、已知错误修正、持续/结束时态区别。去掉重复解释和修复表单内译文按钮误提交；不使用关键词或篇幅进行开放语义通关。
6. 桌面1440×1000、平板820×1180、手机390×844与360px键盘流程；知识/词典/照片场景实际截图、无横向溢出和页面/控制台错误。复查照片比例和移动排版。
7. 保留原11中高级场景全部B2/C1连续流程、6入门课、3基础场景、下一课、错误/支架、复习、备份、损坏/不可写存储和刷新恢复。
8. 无AI环保设备需求匹配→本地任务生成→四轮练习→保存/重载、未知主题选模板；安全白名单不接收模型ID/regex/执行代码。
9. 四供应商协议认证header、无URL Key/Cookie、拒绝跳转、限额/超时/脱敏；默认切换、刷新清内存Key、AES-GCM保险箱错误口令/解锁/删除；学习备份剥离私密配置。
10. 真实UI连接模型协议mock：场景/表达/词典接口及角色回答上下文，明确启用后一次提交一次请求，关闭后返回本地；不把mock认作供应商质量。

npm test还执行已知凭据与私密文件扫描，类型构建、Prettier、git diff --check亦需通过。新增没有SDK/框架依赖。

## 实际截图

本机保留75张PNG（包含历史证据）在output/playwright；当前实际线上完整收集73张，保留原流程并加入知识/词典/照片风格三端。模型截图mocked文件名明确表示模拟响应。线上截图单独在Actions产物，不用本机图冒充线上证据。

- [桌面知识库](../output/playwright/knowledge-desktop-library.png)
- [手机知识库](../output/playwright/knowledge-mobile-library.png)
- [即时词典](../output/playwright/knowledge-dictionary.png)
- [桌面照片场景](../output/playwright/knowledge-desktop-scene.png)
- [手机照片场景](../output/playwright/knowledge-mobile-scene.png)
- [无AI场景生成](../output/playwright/scenes-desktop-generator.png)
- [C1技术讨论](../output/playwright/communication-technical-c1-output.png)
- [模型协议mock](../output/playwright/scenes-ai-role-mocked.png)

## 当前线上状态

最终源提交93ea6ab62c12ae49d8550fe6a82ee6148b5986b0：[Pages run38315384715](https://github.com/chrisjack2380/english-learning-website/actions/runs/38315384715)的构建、部署、verify-online全部成功；常规CI38315391237成功。原始日志分别记录生产53 passed (2.3m)、真实HTTPS53 passed (2.2m)。生产步骤2026-10-12 22:15:50–22:18:14 UTC；线上步骤22:19:13–22:21:27 UTC（北京时间10月13日06:19–06:21）。线上配置没有启动本地服务器。

实际线上73张截图/HTML报告：pages-online-evidence artifact11776790691，44680916字节；生产证据11776598301，发布产物11776543511。页面、index-Y2N-MzLM.js、index-DR5_7zpz.css均200，JS/CSS字节与验收dist一致。字典JSON、图片和先前失败过的两段音频亦200、与public字节一致。

修复记录：手机文件选择框固有宽度依赖系统字体，现按容器收缩；fieldset最小宽度约束，实际TXT上传/长文件名和边界验证通过。直接进入场景完成理解题与应用后会记录理解，下一知识正确衔接。角色姓名与原情境一致；allocated明确显示原形，allocation/assessment不错误使用动词释义和音标。

前次在线52通过/1失败的trace确认音频HTTP503、Server=Varnish、Retry-After=0，文件本身完整。全量检查对429/500/502/503/504最多重试2次（1/2秒）、批次100ms节流；持续错误/404/错误类型/空数据仍失败，所有604段保持检查。最终成功run没有记录临时重试。没有删除检查或把失败描述为成功。

云浏览器可能缺代理CA，不关闭TLS或修改持久信任。实际HTTPS套件由GitHub托管Chromium执行，在线配置不启动本地服务器。平台原生Git/HTTPS身份可用，不必索取用户Token。

## 未验证及边界

没有真实私人模型Key，供应商可达性/CORS/费用/教学质量未验收。WordNet许可已读取，原32单元由本站自编，不是官方考试教材；官方参考网站网络受限不冒称已全文调研。真人麦克风/识别质量、Safari/Firefox、多口音、实机触屏尚未验收；TTS边界和识别权限用mock验证接线。没有本地全文语义认证或发音评分。照片为虚拟人物轻动效，无真人视频/嘴形同步。未完成课程步骤刷新重来，设备无动态声音可文本继续。
