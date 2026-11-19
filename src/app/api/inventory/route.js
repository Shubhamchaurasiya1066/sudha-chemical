import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Database se purchases aur sales fetch karo
    const purchases = await query({ query: 'SELECT * FROM purchase_orders' });
    const sales = await query({ query: 'SELECT * FROM sales_orders' });

    // Frontend ko data bhej do
    return NextResponse.json({ purchases, sales }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}