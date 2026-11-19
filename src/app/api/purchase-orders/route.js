import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

function formatDate(dateString) {
    if (!dateString) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============ 1. GET ============
export async function GET() {
  try {
    const results = await query({
      query: 'SELECT * FROM purchase_orders ORDER BY created_at DESC',
    });
    
    const orders = results.map(row => ({
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
      brokerName: row.broker_name,
      brokerContactNumber: row.broker_contact,
      brokerEmail: row.broker_email,
      exFor: row.ex_for || "",
      orderDate: row.order_date,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============ 2. POST ============
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id, purchaseOrderNumber, manufacturerName, itemName, packaging,
      qty, qtyUnit, actualPrice, discount, discountType, billingPrice,
      place, supplierEmail, brokerName, brokerContactNumber, 
      brokerEmail, orderDate
    } = body;

    if (!manufacturerName || !itemName || !qty || !billingPrice) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    await query({
      query: `INSERT INTO purchase_orders 
        (id, po_number, manufacturer_name, item_name, packaging, qty, qty_unit, 
         actual_price, discount, discount_type, billing_price, 
         place, supplier_email, 
         broker_name, broker_contact, broker_email, order_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [
        id || null, 
        purchaseOrderNumber || null, 
        manufacturerName.trim(), 
        itemName.trim(), 
        packaging || null,
        Number(qty), 
        qtyUnit || 'KG', 
        Number(actualPrice) || 0, 
        Number(discount) || 0, 
        discountType || 'amount', 
        Number(billingPrice),
        place || null,
        supplierEmail || null,
        brokerName || null, 
        brokerContactNumber || null, 
        brokerEmail || null,
        formatDate(orderDate),
      ],
    });

    return NextResponse.json({ message: 'Purchase Order saved successfully' }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============ 3. PUT ============
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id, purchaseOrderNumber, manufacturerName, itemName, packaging, 
      qty, qtyUnit, actualPrice, discount, discountType, billingPrice, 
      place, supplierEmail, brokerName, brokerContactNumber, 
      brokerEmail, orderDate
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    await query({
      query: `UPDATE purchase_orders SET 
        po_number = ?,
        manufacturer_name = ?, 
        item_name = ?, 
        packaging = ?, 
        qty = ?, 
        qty_unit = ?, 
        actual_price = ?, 
        discount = ?, 
        discount_type = ?, 
        billing_price = ?, 
        place = ?,
        supplier_email = ?, 
        broker_name = ?, 
        broker_contact = ?, 
        broker_email = ?,
        order_date = ?
        WHERE id = ?`,
      values: [
        purchaseOrderNumber || null,
        manufacturerName, 
        itemName, 
        packaging || null, 
        Number(qty), 
        qtyUnit || 'KG',
        Number(actualPrice) || 0, 
        Number(discount) || 0, 
        discountType || 'amount', 
        Number(billingPrice), 
        place || null,
        supplierEmail || null, 
        brokerName || null, 
        brokerContactNumber || null, 
        brokerEmail || null,
        formatDate(orderDate), 
        id
      ],
    });

    return NextResponse.json({ message: 'Purchase Order updated successfully' }, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============ 4. DELETE ============
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await query({
      query: 'DELETE FROM purchase_orders WHERE id = ?',
      values: [id],
    });

    return NextResponse.json({ message: 'Purchase Order deleted' }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}