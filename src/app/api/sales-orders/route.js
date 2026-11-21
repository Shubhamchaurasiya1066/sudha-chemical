import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. GET: Saare sales orders fetch karne ke liye
export async function GET() {
  try {
    const results = await query({
      query: 'SELECT * FROM sales_orders ORDER BY created_at DESC',
    });
    
    const orders = results.map(row => ({
      id: row.id,
      orderNumber: row.order_number,
      companyName: row.company_name,
      manufacturerName: row.manufacturer_name,
      place: row.place,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerNumber: row.customer_number,
      emailId: row.customer_email,
      itemName: row.item_name,
      qty: row.qty,
      qtyUnit: row.qty_unit,
      rate: row.rate,
      freight: row.freight,
      exFor: row.ex_for,
      paymentTerms: row.payment_terms,
      gstExtra: Boolean(row.gst_extra),
      otherPersonName: row.other_person_name,
      brokerName: row.broker_name,
      brokerContactNumber: row.broker_contact,
      brokerEmailId: row.broker_email,
      filledBy: row.filled_by,
      status: row.status,
      orderDate: row.order_date,
    }));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Naya sales order save karne ke liye
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id, orderNumber, companyName, manufacturerName, place,
      customerName, customerAddress, customerNumber, emailId,
      itemName, qty, qtyUnit, rate, freight, exFor, paymentTerms,
      gstExtra, otherPersonName, brokerName, brokerContactNumber,
      brokerEmailId, filledBy, orderDate
    } = body;

    await query({
      query: `INSERT INTO sales_orders 
        (id, order_number, company_name, manufacturer_name, place, 
         customer_name, customer_address, customer_number, customer_email, 
         item_name, qty, qty_unit, rate, freight, ex_for, payment_terms, 
         gst_extra, other_person_name, broker_name, broker_contact, 
         broker_email, filled_by, order_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [
        id, orderNumber, companyName, manufacturerName, place,
        customerName, customerAddress, customerNumber, emailId,
        itemName, qty, qtyUnit, rate, freight, exFor, paymentTerms,
        Boolean(gstExtra), otherPersonName, brokerName, brokerContactNumber,
        brokerEmailId, filledBy, orderDate
      ],
    });

    return NextResponse.json({ message: 'Sales Order saved successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. PUT: Order Edit (Update) karne ke liye
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id, companyName, manufacturerName, place, customerName, customerAddress,
      customerNumber, emailId, itemName, qty, qtyUnit, rate, freight, exFor,
      paymentTerms, gstExtra, otherPersonName, brokerName, brokerContactNumber,
      brokerEmailId, filledBy
    } = body;

    await query({
      query: `UPDATE sales_orders SET 
        company_name = ?, manufacturer_name = ?, place = ?, customer_name = ?, 
        customer_address = ?, customer_number = ?, customer_email = ?, 
        item_name = ?, qty = ?, qty_unit = ?, rate = ?, freight = ?, ex_for = ?, 
        payment_terms = ?, gst_extra = ?, other_person_name = ?, broker_name = ?, 
        broker_contact = ?, broker_email = ?, filled_by = ? 
        WHERE id = ?`,
      values: [
        companyName, manufacturerName, place, customerName, customerAddress,
        customerNumber, emailId, itemName, qty, qtyUnit, rate, freight, exFor,
        paymentTerms, Boolean(gstExtra), otherPersonName, brokerName, brokerContactNumber,
        brokerEmailId, filledBy, id
      ],
    });

    return NextResponse.json({ message: 'Sales Order updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE: Order delete karne ke liye
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await query({
      query: 'DELETE FROM sales_orders WHERE id = ?',
      values: [id],
    });

    return NextResponse.json({ message: 'Sales Order deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
