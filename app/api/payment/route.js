// Creem.io Payment Integration - Checkout Session Creator
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/payment
 * Creates a Creem checkout session for the GEO Visibility Report
 * Body: { report_id: string, email?: string }
 *
 * Required env vars:
 *   CREEM_API_KEY     - Creem API key (from Developers section of dashboard)
 *   CREEM_PRODUCT_ID  - Product ID for the $29 GEO report
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

    const apiKey = process.env.CREEM_API_KEY;
    const productId = process.env.CREEM_PRODUCT_ID;

    if (!apiKey) {
      console.error('CREEM_API_KEY not configured');
      return NextResponse.json(
        { error: 'Payment service not configured. Please try again later.' },
        { status: 500 }
      );
    }

    if (!productId) {
      console.error('CREEM_PRODUCT_ID not configured');
      return NextResponse.json(
        { error: 'Product not found. Please try again later.' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mygeocheck.com';

    // Build Creem checkout request
    const checkoutPayload = {
      product_id: productId,
      success_url: `${baseUrl}/report/${report_id}?checkout_id={CHECKOUT_ID}&order_id={ORDER_ID}&status=success`,
      metadata: {
        report_id: report_id,
        source: 'mygeocheck.com',
      },
    };

    // Add customer email if provided (pre-fills checkout form)
    if (email) {
      checkoutPayload.customer = { email: email };
    }

    const response = await fetch('https://api.creem.io/v1/checkouts', {
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
