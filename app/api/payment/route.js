// Creem.io Payment Integration - Checkout Session Creator
import { NextResponse } from 'next/server';
import { recordEvent } from '../../../lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/payment
 * Creates a Creem checkout session for the GEO Visibility Report
 * Body: { report_id: string, email?: string, plan?: 'onetime' | 'sub' }
 *
 * Required env vars:
 *   CREEM_API_KEY              - Creem API key (from Developers section of dashboard)
 *   CREEM_PRODUCT_ID           - Product ID for the $29/month subscription
 *   CREEM_ONETIME_PRODUCT_ID   - (Optional) Product ID for the $19 one-time report
 */
export async function POST(request) {
  try {
    const { report_id, email: rawEmail, plan } = await request.json();
    const email = typeof rawEmail === 'string' && rawEmail.includes('@') ? rawEmail.trim() : null;

    if (!report_id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.CREEM_API_KEY;
    // plan === 'sub' uses subscription product; otherwise one-time.
    //
    // 2026-11-03 修复：原来 one-time 在 CREEM_ONETIME_PRODUCT_ID 缺失时会回落到
    // CREEM_PRODUCT_ID（$29/月订阅），导致点"$19 一次性"的用户被静默升级成订阅。
    // 现在绝不允许跨档位回落：拿不到对应产品 ID 就报错，宁可让用户看到失败，
    // 也不能收错钱。
    const isSubscription = plan === 'sub';
    const productId = isSubscription
      ? (process.env.CREEM_PRODUCT_ID || process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID)
      : process.env.CREEM_ONETIME_PRODUCT_ID;
    const testMode = process.env.CREEM_TEST_MODE === 'true';
    const creemBaseUrl = testMode ? 'https://test-api.creem.io' : 'https://api.creem.io';

    if (!apiKey) {
      console.error('CREEM_API_KEY not configured');
      return NextResponse.json(
        { error: 'Payment service not configured. Please try again later.' },
        { status: 500 }
      );
    }

    if (!productId) {
      console.error(`[payment] missing product id for plan=${isSubscription ? 'sub' : 'onetime'}`);
      return NextResponse.json(
        {
          error: isSubscription
            ? 'This plan is temporarily unavailable. Please contact hello@mygeocheck.com.'
            : 'The one-time report is temporarily unavailable. The monthly plan still works, or email hello@mygeocheck.com.',
          error_type: 'PLAN_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // Derive site URL from the incoming request so post-payment redirect works on any domain
    const reqHost = request.headers.get('host') || '';
    const reqProto = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = reqHost ? `${reqProto}://${reqHost}` : (process.env.NEXT_PUBLIC_BASE_URL || 'https://mygeocheck.com');

    // Build Creem checkout request
    const checkoutPayload = {
      product_id: productId,
      success_url: `${baseUrl}/report/${report_id}?status=success`,
      metadata: {
        report_id: report_id,
        plan: isSubscription ? 'sub' : 'onetime',
        source: 'mygeocheck.com',
      },
    };

    // Add customer email if provided (pre-fills checkout form + ties subscription to customer)
    if (email) {
      checkoutPayload.customer = { email: email };
      checkoutPayload.metadata = { ...checkoutPayload.metadata, email: email };
    }

    const response = await fetch(`${creemBaseUrl}/v1/checkouts`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Creem API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to create checkout. Please try again later.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const checkoutUrl = data.checkout_url;

    if (!checkoutUrl) {
      console.error('Creem response missing checkout_url:', data);
      return NextResponse.json(
        { error: 'Failed to generate checkout URL' },
        { status: 500 }
      );
    }

    recordEvent('payment_created', {
      checkout_id: data.id || null,
      report_id,
      email: email || null,
    });

    return NextResponse.json({
      checkout_url: checkoutUrl,
      checkout_id: data.id,
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
