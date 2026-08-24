// LemonSqueezy 支付创建 API
import { NextResponse } from 'next/server';

// 强制使用 Node.js 运行时
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/payment
 * 创建 LemonSqueezy checkout 链接
 * Body: { report_id: string, email?: string }
 */
export async function POST(request) {
  try {
    const { report_id, email } = await request.json();

    if (!report_id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 构建 LemonSqueezy checkout 请求
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom_price: 2900,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMONSQUEEZY_STORE_ID || '',
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: process.env.LEMONSQUEEZY_PRODUCT_ID || '',
            },
          },
        },
      },
    };

    if (report_id) {
      checkoutData.data.attributes.custom_price = 2900;
      checkoutData.data.attributes.product_options = {
        redirect_url: `${baseUrl}/report/${report_id}`,
        receipt_button_text: 'View My Report',
        receipt_link_url: `${baseUrl}/report/${report_id}`,
        receipt_thank_you_note: `Your full GEO report for report ID: ${report_id}`,
      };
    }

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LemonSqueezy API error:', errorText);

      const storeId = process.env.LEMONSQUEEZY_STORE_ID;
      const productId = process.env.LEMONSQUEEZY_PRODUCT_ID;
      if (storeId && productId) {
        const fallbackUrl = `https://store.lemonsqueezy.com/checkout/buy/${storeId}-${productId}`;
        return NextResponse.json({
          checkout_url: fallbackUrl,
          report_id,
          note: 'Using fallback checkout URL',
        });
      }

      return NextResponse.json(
        { error: 'Failed to create checkout. Please try again later.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const checkoutUrl = data.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to generate checkout URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkout_url: checkoutUrl,
      report_id,
    });
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { error: 'Payment service unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
