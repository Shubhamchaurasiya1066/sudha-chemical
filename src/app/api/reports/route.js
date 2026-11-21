
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import { unstable_rethrow } from 'next/navigation';

// GET: Secure purchase and sales reports
export async function GET() {
  try {
    // 1. Authentication and role verification
    const { error } = await requireAuth(['admin']);

    if (error) return error;

    // 2. Fetch purchase orders
    const purchases = await query({
      query: `
        SELECT *
        FROM purchase_orders
        ORDER BY created_at DESC
      `
    });

    // 3. Fetch sales orders
    const sales = await query({
      query: `
        SELECT *
        FROM sales_orders
        ORDER BY created_at DESC
      `
    });

    // 4. Format purchase data
    const formattedPurchases = purchases.map((row) => ({
      id: row.id,
      purchaseOrderNumber: row.po_number,
      manufacturerName: row.manufacturer_name,
      itemName: row.item_name,
      packaging: row.packaging,
      qty: Number(row.qty),
      qtyUnit: row.qty_unit,
      actualPrice: Number(row.actual_price),
      discount: Number(row.discount || 0),
      discountType: row.discount_type,
      billingPrice: Number(row.billing_price),
      place: row.place || '',
      supplierEmail: row.supplier_email,

      brokerName: row.broker_name || '',
      brokerContact: row.broker_contact || '',
      brokerEmail: row.broker_email || '',

      exFor: row.ex_for || '',
      orderDate: row.order_date || row.created_at,
      createdAt: row.created_at,
      status: 'Completed'
    }));

    // 5. Format sales data
    const formattedSales = sales.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      companyName: row.company_name,
      manufacturerName: row.manufacturer_name,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerNumber: row.customer_number,
      emailId: row.customer_email,
      itemName: row.item_name,
      qty: Number(row.qty),
      qtyUnit: row.qty_unit,
      rate: Number(row.rate),
      freight: Number(row.freight),
      place: row.place || '',
      status: row.status,
      orderDate: row.order_date || row.created_at,

      brokerName: row.broker_name || '',
      brokerContact: row.broker_contact || '',
      brokerEmail: row.broker_email || '',

      filledBy: row.filled_by || '',
      paymentTerms: row.payment_terms || '',
      exFor: row.ex_for || ''
    }));

    // 6. Prevent caching of sensitive reports
    return NextResponse.json(
      {
        purchases: formattedPurchases,
        sales: formattedSales
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-store, max-age=0',
          'Pragma': 'no-cache'
        }
      }
    );

  } catch (error) {
    unstable_rethrow(error);
    // Log error on server only
    console.error('Reports API Error:', error);

    // Do not expose database details
    return NextResponse.json(
      {
        error: 'Internal server error'
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}
