// LemonSqueezy Webhook 回调处理
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 强制使用 Node.js 运行时
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhook
 * 接收 LemonSqueezy 支付成功回调
 */
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');
    const eventName = request.headers.get('x-event-name');

    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(rawBody);
      const computedSignature = hmac.digest('hex');

      if (signature !== computedSignature) {
        console.error('Webhook signature verification failed');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(rawBody);

    if (eventName !== 'order_created') {
      return NextResponse.json({ received: true });
    }

    const orderData = event.data?.attributes;
    const orderEmail = orderData?.user_email || '';
    const customData = event.meta?.custom_data || {};
    const reportId = customData.report_id || orderData?.first_order_item?.product_id;

    console.log('Payment received:', {
      email: orderEmail,
      orderId: orderData?.identifier,
      reportId,
    });

    return NextResponse.json({
      received: true,
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
