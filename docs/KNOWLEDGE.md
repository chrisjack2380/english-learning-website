# 知识驱动架构与合法来源

src/knowledge.ts 定义32个原创 word/phrase/grammar 单元：id、目标/等级参考、标签、双语含义、音标、搭配、例句、中译、用法、区别、模板场景及理解题。不是 Cambridge/ETS 授权教材、AWL复制、官方六级核心全表或考试成绩预测。

src/knowledge-learning.ts 将知识转成4轮交流，保留自己的任务/表达/理解题/评价依据，不携带原模板不相关的结账或销售任务。知识场景使用已有稳定模板ID保存探索记录，同时单独记录knowledgeIds和应用输出。只理解不授予应用；应用后1/3/7/14天复习，有误/支架回到立即巩固；目标和等级决定建议，原系统课程不被跳过。

src/feedback.ts 展示正确性、自然度、语境、升级。没有本地全文语义评估：已知错误可解释，其他部分显式待核对，参考/自评不是自动认证。I developed products for five years 必须先问是否结束，持续动作可用 have been developing，不能自动把开发动作改成 responsible for 职责。

src/components/KnowledgeContext.tsx 让英文词、选择短语和整句进入原生模态词典，键盘与关闭支持。优先原创精准释义；补充WordNet英文释义，未收录中文/音标提示，不捏造。200条自由摘词/中文笔记+原单元个人词库可备份；原始TXT/MD上传仅页面内存，最多200KB。暂不解析PDF或未经核读教材。

## WordNet许可与获取

实际下载官方NLTK数据仓库 wordnet.zip： https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip ，SHA256 cbda5ea6eef7f36a97a43d4a75f85e07fccbb4f23657d27b4ccbc93e2646ab59。

读取WordNet3.0许可证后，仅选取现有教材/场景出现的1154个英文词，每词至多两个原始释义。未改变释义；没有执行下载代码、安装NLTK或提交整个压缩包。词义顺序不保证场景最佳，应结合上下文核对。没有全量中文翻译。

public/dictionary/wordnet.json 内保留版权、选择说明与完整许可/免责声明；public/dictionary/WORDNET-LICENSE.txt 保留全文。许可允许使用/修改/分发，要求所有副本保留版权和免责声明；出处信用不表示 Princeton 的宣传、授权背书或合作。词典在点击后本地懒加载，不发送查询到第三方。

Cambridge/IELTS/ETS/AWL/OpenStax官方网站在本环境访问被代理限制，未冒称阅读全文、获取官方教材数据或许可证。参考链接仅组织自编训练目标。本次真正采用的数据授权为WordNet，学习单元和英文例句由本站原创。

## 语音与照片风格

AutoDialogue 在提交有效文字后自动播音，原生TTS边界事件突出当前句，备用MP3按整句。重播、0.7×、停止和审核译文可用；浏览器阻止自动播放时提示重播，设备无动态句声音则文本继续。模型要用户启用本场景自动模式才能发送；不得让反复渲染重复计费，下一步清空触发器，导航取消。

public/visuals/learning-atlas.png 是本次用 image_gen 原创生成的两环境/两虚拟人物，无真实人物、影视或品牌素材。CSS分区展示、活动角色轻动效、步骤渐进，保留示意图与减少动画。不是3D骨骼动画、真人录像或嘴形同步。版权出处见 docs/RESEARCH.md。

## 扩展

新增KnowledgeEntry及合法来源→已有domain模板或审核新模板→运行每项理解题/语境/四轮应用验证→生成固定播音→多端/安全/实际线上验收。禁止只增加名词展示、转载版权教材或用规则关键词代替完整表达判断。未知领域要明确边界；专业效果/法律医学不能由措辞推断。
