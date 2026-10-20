# JobMatch — 瑞典 IT 求职工作台

本项目参考 `/Users/cristina/Desktop/app.txt` 的产品方向，提供可独立运行的本地 MVP。原文中针对 Claude Code 的计划模式、清空会话、提交 Git 等操作说明不是本项目的运行要求。项目未部署到外网。

## 本地运行

```bash
cd /Users/cristina/APP
npm install
npm run dev
```

打开 http://localhost:3000 。开发服务器默认仅监听 127.0.0.1。端口被占用时使用 `npm run dev -- --port 3001`。

生产构建和检查：

```bash
npm test
npm run build
npm run start
```

推荐 Node.js 22 LTS 或更新的受支持版本。锁定的依赖见 package-lock.json。

## 已实现

- 中文响应式工作台：概览、职位列表、搜索、城市筛选、收藏、隐藏与恢复、详情抽屉。
- 明确标注的虚构公司、职位和示例匹配分。同步后使用真实职位，不把示例当作招聘信息。
- JobTech / Platsbanken 实时公开职位查询，限定 Data/IT 分类，获取最新 100 条。按公司、标题和城市去重；超时和错误时保留本地数据。不会自动在后台同步，也不会抓取需要登录的网站。
- 手动粘贴职位描述和申请链接。
- 求职档案：目标方向、技能、城市、远程偏好、语言、学历、年限和工作许可。
- 浏览器内读取 `.tex` 和含文本的 PDF（5 MB 上限）；LaTeX 原稿下载。扫描 PDF 暂不支持 OCR，PDF 原文件不会存储。
- 本地技能关键词覆盖分析，与 AI 综合评分明确分开。未核实硬性条件的结果不会作为高分推荐。
- 可选的 Anthropic 综合评分 API：要求有效 Supabase 登录；仅用户主动确认后发送档案和职位。服务端验证输出，不满足硬性条件记 0 分，未知条件不产生推荐。AI 分数需要人工复核。
- 申请看板：已投递、面试中、收到 Offer、已结束；日期、笔记、到期跟进提醒。点击申请链接和「我已完成投递」是两步，以免把打开网页误记为已提交。
- 当前浏览器 localStorage 持久化；JSON 导出、导入和删除本地数据。修改档案会清除旧匹配结果。
- 可选 Supabase 邮箱 Magic Link 注册/登录。登录后仍使用浏览器本地档案，不宣称跨设备同步。

## 可选配置

将 `.env.example` 复制为 `.env.local`，按需填写：

| 变量 | 用途 |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Supabase 项目 URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 公开 anon key；不是 service role 密钥 |
| ANTHROPIC_API_KEY | 服务端 AI 密钥，不可加 NEXT_PUBLIC 前缀 |
| ANTHROPIC_MODEL | 账号可用的 Claude 模型 ID |

没有配置也能使用本地工作台和 JobTech。修改环境变量后重启网站。

Supabase 控制台 Authentication → URL Configuration 中，将 Site URL 设为 `http://localhost:3000` 并将实际开发地址加入 Redirect URLs；开启邮箱登录。首次 Magic Link 登录会注册账号。这里没有云数据库和 Storage 同步，因此不需要创建数据库表。

AI 评分每次调用会产生你账户的 API 费用；尚未加入生产级限流和费用配额，请保持本地个人使用。服务端不保存密钥到业务数据，不在响应中回传密钥。

## 数据与隐私

档案与记录默认仅保存在当前浏览器。localStorage 不加密，同一浏览器配置下有页面访问能力的人可访问。更换浏览器或清除站点数据后不能自动恢复，请先导出备份。请避免在公共设备保存简历。

PDF 仅提取文本，不保存原始 PDF；`.tex` 保留原稿。AI 评分会将保存的档案、简历及职位发送至 Anthropic，操作前会显示确认提示。邮件登录信息由 Supabase 处理。当前版本仅支持删除本地业务数据，Supabase 账号需要项目管理员在控制台删除。未宣称已通过 GDPR 合规审查。

## 与完整产品方案的差距

以下没有实现，不能视为已经上线的能力：

1. Supabase Postgres / Storage 档案同步、RLS 多用户隔离及自助账号删除。
2. Teamtailor、Greenhouse、Lever、Ashby 采集器与公司配置；尚未验证这些源的接口。
3. 真实职位的人工评分基准集及 AI 评分准确性验证。
4. LaTeX AI 定制改写、原稿/改稿差异审核、Tectonic PDF 编译和失败回退。
5. Europe/Stockholm 时区每日 07:00 定时任务、邮件摘要和跨用户推荐。
6. Vercel / Railway 部署、线上限流、监控、隐私政策法律审查。

不建议直接把这个本地 MVP 公开为多人生产服务。完成上述功能需要服务账号配置及后续开发。

## 结构

```
app/                    Next.js App Router 和全局样式
app/api/jobs/           JobTech 公开职位代理
app/api/match/          登录验证后的 Anthropic 评分
components/workspace.tsx 工作台交互
lib/model.ts            数据类型、去重、关键词匹配及推荐规则
lib/demo.ts             明确标注的虚构示例
lib/supabase.ts         可选浏览器登录客户端
tests/                  匹配规则、安全链接、去重和接口失败测试
```

## 接口文档

- [JobTech JobSearch 官方接口](https://jobsearch.api.jobtechdev.se/)
- [Next.js 安装与运行](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase 邮箱登录](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
- [Anthropic Messages API](https://platform.claude.com/docs/en/api/messages)

JobTech 路径和返回字段已在开发过程中实际请求核实；其他需密钥的第三方服务未做真实账户端到端测试。
# Sweden-Job-Hunting
