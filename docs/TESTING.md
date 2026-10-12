# 验证与截图

2026-10-13（Asia/Shanghai）第三阶段知识驱动升级。实际运行生产构建，使用 /english-learning-website/ 子路径；47项单元及最终53项真实浏览器流程全部通过（约1.8分钟）；类型构建、格式及diff检查通过。新版已部署，52项实际HTTPS流程通过；全量音频CDN临时503正在做最终复验。

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

本机75张PNG在output/playwright，保留原流程并加入知识/词典/照片风格三端。模型截图mocked文件名明确表示模拟响应。线上截图单独在Actions产物，不用本机图冒充线上证据。

- [桌面知识库](../output/playwright/knowledge-desktop-library.png)
- [手机知识库](../output/playwright/knowledge-mobile-library.png)
- [即时词典](../output/playwright/knowledge-dictionary.png)
- [桌面照片场景](../output/playwright/knowledge-desktop-scene.png)
- [手机照片场景](../output/playwright/knowledge-mobile-scene.png)
- [无AI场景生成](../output/playwright/scenes-desktop-generator.png)
- [C1技术讨论](../output/playwright/communication-technical-c1-output.png)
- [模型协议mock](../output/playwright/scenes-ai-role-mocked.png)

## 当前线上状态

源码fb9eaaed604d63c86d40cca1ae19c9363d8abf9b的[Pages run38269749151](https://github.com/chrisjack2380/english-learning-website/actions/runs/38269749151)构建53项与部署成功，CI38269755859成功。实际HTTPS52项通过，全量音频请求之一失败：原trace明确记录HTTP503、Server=Varnish、Retry-After=0。该文件和前一run另一个失败音频现在均200、audio/mp3，字节与仓库一致，说明CDN临时服务不可用；不能用缺失文件诊断或删除资源检查来解决。

增加对429/500/502/503/504最多2次延迟重试（1/2秒），公开批次100ms节流，超限/404/错误类型/空文件仍失败，全部604段保留检查。修改后本机资源定向验收与47项单元通过，正在重新发布及全套HTTPS验收。之前1d3294d首发的手机溢出已修复（原生文件框按容器宽度缩放、fieldset最小宽度），8项知识定向含真实TXT上传与直接应用的下一单元衔接通过。

本次失败但有效的线上证据artifact11757276357（pages-online-evidence，54732304字节）；52项功能证据与失败trace不冒称53项全通过。最终成功记录随后补充。

云浏览器可能缺代理CA，不关闭TLS或修改持久信任。实际HTTPS套件由GitHub托管Chromium执行，在线配置不启动本地服务器。平台原生Git/HTTPS身份可用，不必索取用户Token。

## 未验证及边界

没有真实私人模型Key，供应商可达性/CORS/费用/教学质量未验收。WordNet许可已读取，原32单元由本站自编，不是官方考试教材；官方参考网站网络受限不冒称已全文调研。真人麦克风/识别质量、Safari/Firefox、多口音、实机触屏尚未验收；TTS边界和识别权限用mock验证接线。没有本地全文语义认证或发音评分。照片为虚拟人物轻动效，无真人视频/嘴形同步。未完成课程步骤刷新重来，设备无动态声音可文本继续。
