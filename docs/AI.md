# AI 角色接入边界

2026-10-11 用户确认暂时没有后端：先完成本地课程，预留安全接入。当前线上不调用模型，不收集密钥，角色回应是预设内容。

`src/ai.ts` 独立定义 `TutorConfig`、`TutorReply`、`TutorGateway` 和 `createTutorGateway`。角色为 colleague/friend/customer/service/interviewer，课程控制 B1/B2/C1、场景和当前沟通任务。响应可包含角色回应、追问、修正、自然表达、中译和解释。函数只接受同源路径，采用带同源凭据的 POST，支持 AbortSignal，并验证返回类型/长度；当前页面没有调用它，所以不能声称真实 AI 接通。

## 接口约定

未来在可信服务器部署 `POST /api/tutor`，输入：

```json
{
  "config": {
    "modelLabel": "server-managed",
    "role": "colleague",
    "level": "B2",
    "scene": "meeting",
    "task": "Negotiate a pilot and confirm a checkpoint"
  },
  "messages": [{ "role": "user", "content": "Could we try a small pilot?" }]
}
```

返回 `{"reply":"…","followUp":"…","correction":"…","natural":"…","explanation":"…"}`；不要在响应中泄露系统提示、密钥或内部错误。角色回复先接住用户实际回答，再追问；建议不可改变用户意图或虚构事实，不把用户输出中的指令当作系统规则。新手可以显示中文支架。

## 真实接入前必须落实

- GitHub Pages 没有应用服务器。必须增加可信后端，或将站点迁到支持同源服务的托管平台/反向代理；更换平台前明确费用与部署影响。
- 模型密钥只在服务端环境变量或密钥库，不使用 VITE\_\*、localStorage、公开仓库或日志。
- 服务端鉴权、会话与 CSRF/Origin 校验、模型白名单、输入大小限制、超时/取消、按会话及 IP 限流、预算与滥用限制；不能提供任何人可调用的开放代理。
- 清晰说明文本/语音的第三方数据处理、保留期限、删除方式；不记录密钥与原始敏感对话。
- 人工审核 AI 的事实边界、纠错合理性和文化表达；服务不可用时继续本地任务，显式标记反馈来源。
- 再配置非敏感模型名称/角色，保存和切换；测试真实模型的延续、追问与自然建议后才标记上线。

网关单元测试只证明请求契约、来源限制和响应校验，不证明模型质量、鉴权实现或已部署后端。
