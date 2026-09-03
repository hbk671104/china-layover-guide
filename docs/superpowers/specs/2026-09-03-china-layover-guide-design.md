# China Layover Guide — Design Spec

- Date: 2026-09-03
- Status: approved design, awaiting user spec review
- Path: Architectural

## 1. Overview

面向在中国过境的外国旅客的纯内容站 + 少量交互小组件。帮助这类旅客利用过境免签政策，在短暂停留期间尽可能多地探索中国。网站是 SEO 友好的内容站，首版 English only。

Working title: **China Layover Guide**（占位名，可改）。

## 2. Goals / Non-goals

### Goals
- 内容站，SEO 友好（sitemap、canonical、JSON-LD、OG、`lastUpdated`、来源标注）
- 四大内容支柱：过境免签政策、eSIM 设置、支付攻略（含 TenPayGo）、城市快游路线
- 两个交互小组件：过境免签资格自查、支付方案推荐
- 全静态数据驱动，规则数据可版本化、可审计、可单测
- 部署到 Cloudflare Pages

### Non-goals（首版明确不做）
- 多语言（English only）
- affiliate 链接（架构预留，不实现）
- Headless CMS、评论、用户系统、订票/地图集成
- 后端 / 边缘函数（小组件不需要）

## 3. Decisions（已与用户确认）

| 决策 | 结论 |
| --- | --- |
| 形态 | 纯内容站 + 少量交互小组件 |
| 语言 | English only |
| 框架 | Astro + React islands |
| 内容管理 | 仓库内 Markdown/MDX + Content Collections |
| 部署 | Cloudflare Pages |
| 商业 | 首版纯信息，预留 affiliate 能力 |
| 内容支柱 | 过境免签 / eSIM / 支付 / 城市快游 |
| 小组件 | 过境免签资格自查、支付方案推荐 |
| 内容分工 | 我先起草，用户校对；事实信息标注来源 |
| 架构方案 | 方案 A：全静态数据驱动 |

## 4. Information Architecture

- `/` — 首页：价值主张 + 四大支柱入口 + 免签自查 CTA
- `/transit-visa/` — 过境免签政策 hub：240 小时过境免签规则、资格条件、常见误区、FAQ
- `/esim/` — eSIM 落地前设置指南：行前步骤、套餐选择、落地切换、FAQ
- `/payments/` — 支付攻略：Visa/Mastercard 与 Apple/Google Pay 接受度、Alipay/WeChat Pay 绑外卡、TenPayGo 专题、支付方案推荐组件
- `/cities/` — 城市快游：Beijing、Shanghai、Guangzhou/Shenzhen、Chengdu、Xi'an 等，每城一篇 layover 路线
- `/about/`、`/privacy/`、`/terms/` — 信任页（SEO + 合规）
- `sitemap.xml`；RSS 可选

## 5. Tech Architecture

- Astro 5 + TypeScript，strict mode
- `@astrojs/mdx`、`@astrojs/react`、`@astrojs/sitemap`、`@astrojs/rss`（可选）、`@astrojs/cloudflare` adapter
- Tailwind CSS，移动优先
- 全站 SSG；两个 React islands 客户端激活（`client:visible` / `client:load`）
- 规则数据：`src/data/visa-rules.ts`、`src/data/payment-matrix.ts`
- SEO：每页 meta/canonical、JSON-LD（`Article` / `FAQPage` / `HowTo`）、OG/Twitter 卡片

## 6. Content Model（Content Collections）

- `guides` 集合（四大支柱共用，`category` 区分）：
  - `title`、`description`、`category`、`updated`、`sources[]`、MDX 正文
- `cities` 集合：
  - `city`、`region`、`bestFor`、`layoverWindow`、`attractions[]`、`route`、`transportTips`、`eSimTip`、`paymentTip`、`mapLink`

规则数据（TS 类型约束）：
- `visa-rules.ts`：国家/地区 → 是否符合 240h 过境免签、口岸列表、附加条件（下一程目的地要求、护照要求等）
- `payment-matrix.ts`：持卡类型 × 手机系统 × 落地城市 → 推荐路径与步骤

## 7. Components & Data Flow

### EligibilityChecker（React island）
- 输入：nationality / 入境口岸 / 下一程目的地 / 是否持有效签证
- 查 `visa-rules.ts` → 输出：符合 / 不符合 / 需人工确认 + 理由与注意事项
- 纯函数，可单测

### PaymentRecommender（React island）
- 输入：持卡类型 / 手机系统 / 落地城市
- 查 `payment-matrix.ts` → 输出推荐路径（如“绑外卡到 Alipay → 开通 TenPayGo → 备少量现金”）+ 步骤链接
- 纯函数，可单测

两个组件底部都带官方来源与“以官方最新政策为准”免责声明。

## 8. Error Handling & Fact Accuracy

- 所有事实页面带 `Last updated` + `Sources`
- 政策页顶部“信息可能变化”提示
- 小组件对未知输入给出保守结论（“需人工确认”），不做误导性判断
- 自定义 404；canonical 防重复内容；链接失效由构建期检查兜底

## 9. Testing

- Vitest 单测两个规则引擎（边界 case：非免签国、陆路口岸、24h 内转机等）
- `astro check` + `astro build` 作为 CI 门槛
- 首版手动跑一次 Lighthouse + 关键路径点检

## 10. Project Structure

```
prc-travel/
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
├─ tailwind.config.mjs
├─ public/            # favicon、OG 图、robots.txt
└─ src/
   ├─ content/
   │  ├─ guides/*.mdx
   │  └─ cities/*.mdx
   ├─ data/           # visa-rules.ts、payment-matrix.ts
   ├─ components/     # React islands + Astro 组件
   ├─ layouts/
   ├─ pages/          # 路由页面
   └─ styles/
```

## 11. Risks

- **政策时效性**：240h 过境免签与 TenPayGo 规则会变 → 内容带日期 + 来源，规则数据易改
- **事实准确性**：每篇事实文章标注来源，最终由用户校对
- **Astro × React islands 兼容性**：用 Astro 官方 React integration，锁版本

## 12. Rollout Order（implementation plan 阶段再细化）

1. 脚手架：Astro + TS + Tailwind + React + MDX + sitemap + Cloudflare adapter
2. 布局与样式系统、SEO 组件（meta/JSON-LD/OG）
3. Content Collections 与首篇示例内容
4. 规则数据 + 两个 React islands + Vitest 单测
5. 四大支柱初始内容（起草 + 校对）
6. 404/robots/sitemap、Lighthouse 点检
7. Cloudflare Pages 部署配置
