# Creem.io 支付集成 - 上线配置指南

当 Creem.io 审核通过后，按以下步骤完成支付功能配置。

## 步骤 1：获取 API 凭证

登录 Creem.io Dashboard → Developers（开发者设置）

需要获取 3 个值：

| 变量名 | 获取位置 | 说明 |
|--------|----------|------|
| `CREEM_API_KEY` | Developers → API Keys | API 密钥，格式：`creem_...` |
| `CREEM_PRODUCT_ID` | Products → 你的产品 | 产品 ID，格式：`prod_...` |
| `CREEM_WEBHOOK_SECRET` | Developers → Webhook | Webhook 签名密钥 |

## 步骤 2：配置 Vercel 环境变量

登录 Vercel Dashboard → 你的项目 → Settings → Environment Variables

添加 3 个环境变量：

```
CREEM_API_KEY = creem_your_key_here
CREEM_PRODUCT_ID = prod_your_product_id
CREEM_WEBHOOK_SECRET = your_webhook_secret_here
```

保存后 Vercel 会自动重新部署。

## 步骤 3：配置 Webhook URL

在 Creem Dashboard → Developers → Webhook 中添加：

```
Webhook URL: https://mygeocheck.com/api/webhook
Events: checkout.completed
```

保存后会获得 Webhook Secret，将其填入 Vercel 环境变量 `CREEM_WEBHOOK_SECRET`。

## 步骤 4：测试

1. 打开 https://mygeocheck.com/check
2. 输入任意 Shopify 产品 URL 进行分析
3. 点击 "Unlock Full Report — $29"
4. 应跳转到 Creem Checkout 页面
5. 使用测试卡号 `4111 1111 1111 1111` 完成支付
6. 支付成功后应自动跳转到报告页面

## 当前代码状态

✅ 已完成：
- `/api/payment/route.js` — Creem checkout 创建
- `/api/webhook/route.js` — 支付回调处理 + 报告邮件发送
- `/success/page.js` — 支付成功页面
- `check/page.js` — CTA 按钮已接入 Creem 支付流程
- `report/[id]/page.js` — 支付验证徽章显示

⏳ 待配置（审核通过后）：
- Vercel 环境变量（3 个）
- Webhook URL 注册
- 测试支付流程
