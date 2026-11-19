import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const purchases = await query({ query: 'SELECT * FROM purchase_orders ORDER BY created_at DESC' });
    const sales = await query({ query: 'SELECT * FROM sales_orders ORDER BY created_at DESC' });

    // ✅ PURCHASE DATA (Added missing broker fields)
    const formattedPurchases = purchases.map(row => ({
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
      brokerName: row.broker_name || "",         // ✅ Added
      brokerContact: row.broker_contact || "",   // ✅ Added
      brokerEmail: row.broker_email || "",       // ✅ Added
      exFor: row.ex_for || "",
      orderDate: row.order_date || row.created_at, // ✅ Fallback date
      createdAt: row.created_at,
      status: "Completed",
    }));

    // ✅ SALES DATA (Added missing broker fields)
    const formattedSales = sales.map(row => ({
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
      orderDate: row.order_date || row.created_at, // ✅ Fallback date
      brokerName: row.broker_name || "",           // ✅ Added
      brokerContact: row.broker_contact || "",     // ✅ Added
      brokerEmail: row.broker_email || "",         // ✅ Added
      filledBy: row.filled_by || "",               // ✅ Added
      paymentTerms: row.payment_terms || "",       // ✅ Added
      exFor: row.ex_for || "",                     // ✅ Added
    }));

    return NextResponse.json({ purchases: formattedPurchases, sales: formattedSales }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}