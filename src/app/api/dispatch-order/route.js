import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// Date ko YYYY-MM-DD format me convert karne ke liye
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

// 1. GET: Saare dispatch orders fetch karne ke liye
export async function GET() {
    try {
        const results = await query({ 
            query: 'SELECT * FROM dispatch_orders ORDER BY created_at DESC' 
        });

        const orders = results.map(row => ({
            id: row.id,
            date: formatDate(row.date),
            godownLocation: row.godown_location,
            customerName: row.customer_name,
            place: row.place,
            itemName: row.item_name,
            rate: Number(row.rate),
            gst: row.gst,
            qty: Number(row.qty),
            qtyUnit: row.qty_unit,
            transportName: row.transport_name,
            totalAmount: Number(row.total_amount),
            createdAt: row.created_at,
        }));

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 2. POST: Naya dispatch order save karne ke liye
export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            date, godownLocation, customerName, place, itemName, 
            rate, gst, qty, qtyUnit, transportName, totalAmount 
        } = body;

        if (!customerName || !itemName || !qty || !rate) {
            return NextResponse.json({ success: false, message: "Required fields missing." }, { status: 400 });
        }

        await query({
            query: `INSERT INTO dispatch_orders 
                (date, godown_location, customer_name, place, item_name, rate, gst, qty, qty_unit, transport_name, total_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            values: [
                formatDate(date), godownLocation, customerName.trim(), place.trim(), 
                itemName, Number(rate), gst, Number(qty), qtyUnit, transportName.trim(), 
                Number(totalAmount)
            ]
        });

        return NextResponse.json({ success: true, message: 'Dispatch Order saved successfully.' }, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 3. PUT: Dispatch order update (edit) karne ke liye
export async function PUT(request) {
    try {
        const body = await request.json();
        const { 
            id, date, godownLocation, customerName, place, itemName, 
            rate, gst, qty, qtyUnit, transportName, totalAmount 
        } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required." }, { status: 400 });
        }

        await query({
            query: `UPDATE dispatch_orders SET 
                date = ?, godown_location = ?, customer_name = ?, place = ?, 
                item_name = ?, rate = ?, gst = ?, qty = ?, qty_unit = ?, 
                transport_name = ?, total_amount = ?
                WHERE id = ?`,
            values: [
                formatDate(date), godownLocation, customerName.trim(), place.trim(), 
                itemName, Number(rate), gst, Number(qty), qtyUnit, transportName.trim(), 
                Number(totalAmount), id
            ]
        });

        return NextResponse.json({ success: true, message: 'Dispatch Order updated successfully.' });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 4. DELETE: Dispatch order delete karne ke liye
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

        await query({
            query: 'DELETE FROM dispatch_orders WHERE id = ?',
            values: [id],
        });

        return NextResponse.json({ success: true, message: 'Dispatch Order deleted.' });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}