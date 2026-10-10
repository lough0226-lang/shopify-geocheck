import { NextResponse } from 'next/server';
import { ensureFoundingSchema, countFoundingCustomers } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

const FOUNDING_LIMIT = 30;

export async function GET() {
  try {
    await ensureFoundingSchema().catch(function () {});
    var count = await countFoundingCustomers();
    if (typeof count !== 'number' || isNaN(count)) count = 0;
    var slotsLeft = Math.max(0, FOUNDING_LIMIT - count);
    return NextResponse.json({
      success: true,
      total: FOUNDING_LIMIT,
      claimed: count,
      slots_left: slotsLeft,
      open: slotsLeft > 0,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Unable to load program status', total: FOUNDING_LIMIT },
      { status: 200 }
    );
  }
}
