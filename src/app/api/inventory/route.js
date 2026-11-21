import { query } from '@/lib/db';
import { requireAuth } from '@/lib/requireAuth';
import { NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';

export async function GET() {
  try {
    const { error } = await requireAuth();

    if (error) return error;

    const purchases = await query({
      query: 'SELECT * FROM purchase_orders'
    });

    const sales = await query({
      query: 'SELECT * FROM sales_orders'
    });

    const response = NextResponse.json({
      purchases,
      sales
    });

    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    unstable_rethrow(error);
    console.error('Inventory API error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
