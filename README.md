# Shopify GEO Check - AI Search Visibility Analyzer

面向 Shopify 商家的 AI 搜索可见度检测工具。帮助商家了解产品在 ChatGPT、Perplexity、Google AI Overviews 等 AI 搜索引擎中的表现。

## ✨ 功能特性

- 🆓 **免费分析**：输入 Shopify 产品 URL，即时获取 AI 搜索可见度评分
- 🔍 **22+ 维度检测**：涵盖标题优化、结构化数据、描述质量、图片 Alt 文本等
- 💰 **付费完整报告**：$29 解锁 22+ 详细检查项、具体修复方案、竞品对比
- ⚡ **即时出结果**：30 秒内完成分析，无需注册
- 📱 **响应式设计**：完美适配手机、平板、桌面端

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **支付**: LemonSqueezy
- **部署**: Vercel

## 📋 前置要求

- Node.js 18+ 
- OpenAI API Key
- LemonSqueezy 账户（用于收款）
- Vercel 账户（用于部署）

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd shopify-geocheck
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入你的 API 密钥：

```env
# OpenAI API Key（必需）
OPENAI_API_KEY=sk-your-openai-api-key

# LemonSqueezy 支付配置
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_PRODUCT_ID=your_product_id
LEMONSQUEEZY_STORE_ID=your_store_id

# 网站 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. 本地开发

```bash
npm run dev
```

打开浏览器访问 `http://localhost:3000`

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 🌐 部署到 Vercel

### 方式一：Vercel Dashboard 部署（推荐）

1. 将代码推送到 GitHub/GitLab
2. 访问 [vercel.com](https://vercel.com)，导入项目
3. 在 Settings > Environment Variables 中配置所有环境变量
4. 点击 Deploy

### 方式二：Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 配置自定义域名

1. 在 Vercel Dashboard 中进入项目 > Settings > Domains
2. 添加你的域名
3. 按提示配置 DNS 记录

## 💳 配置 LemonSqueezy 支付

1. 注册 [LemonSqueezy](https://lemonsqueezy.com) 账户
2. 创建一个产品（价格设为 $29）
3. 获取 API Key：Settings > API Keys
4. 获取 Store ID 和 Product ID
5. 配置 Webhook：
   - 进入 Products > 你的产品 > Webhooks
   - 添加 Webhook URL: `https://yourdomain.com/api/webhook`
   - 选择事件：`order_created`
   - 复制 Webhook Secret

## 🔑 配置 OpenAI API

1. 访问 [OpenAI Platform](https://platform.openai.com)
2. 创建 API Key
3. 本项目使用 `gpt-4o-mini` 模型，每次分析成本约 $0.001-0.005
4. 建议设置使用额度限制，避免意外超额

## 📁 项目结构

```
shopify-geocheck/
├── app/                    # Next.js App Router 页面
│   ├── page.js             # 首页
│   ├── layout.js           # 根布局
│   ├── globals.css         # 全局样式
│   ├── check/page.js       # 检测页面（输入URL、显示免费结果）
│   ├── report/[id]/page.js # 付费报告页面
│   ├── thankyou/page.js    # 支付成功页
│   └── api/
│       ├── analyze/route.js    # AI 分析 API
│       ├── payment/route.js    # 创建支付链接
│       └── webhook/route.js    # 支付回调
├── components/             # React 组件
│   ├── Header.js           # 导航栏
│   ├── Footer.js           # 页脚
│   ├── HeroSection.js      # Hero 区域
│   ├── HowItWorks.js       # 工作流程
│   ├── PricingSection.js   # 定价
│   ├── FAQ.js              # 常见问题
│   ├── ResultsCard.js      # 结果卡片
│   └── LoadingSpinner.js   # 加载动画
├── lib/                    # 核心逻辑
│   ├── openai.js           # OpenAI API 封装
│   ├── scraper.js          # 网页内容抓取
│   └── prompts.js          # AI 分析提示词
└── public/                 # 静态资源
```

## ⚙️ 关键说明

### 报告存储

当前版本使用内存存储分析报告（`Map` 对象），适合开发和低流量场景。

**生产环境建议**：
- 使用 Redis 存储报告（设置 24h 过期）
- 或使用数据库（PostgreSQL / MongoDB）
- 或使用 Vercel KV / Upstash

### 成本控制

- GPT-4o-mini 每次调用约 $0.001-0.005
- 建议设置 OpenAI 使用额度告警
- 免费分析不返回完整报告数据给前端（完整数据仅付费后展示）

### 安全注意

- `.env.local` 文件已自动被 Git 忽略
- Webhook 端点验证请求签名
- 不要在客户端暴露 API Key

## 📄 License

MIT
