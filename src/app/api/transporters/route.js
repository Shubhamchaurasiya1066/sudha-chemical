import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Helper function: ISO string ya date ko YYYY-MM-DD me convert karne ke liye
function formatDate(dateString) {
    if (!dateString) return null;
    // Agar pehle se YYYY-MM-DD hai
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    // ISO string (e.g. 2026-11-06T18:30:00.000Z) ko convert karo
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    
    // Local date string YYYY-MM-DD nikalne ke liye
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 1. GET: Saare transporters fetch karne ke liye
export async function GET() {
    try {
        const rows = await query({ query: 'SELECT * FROM transporters ORDER BY created_at DESC' });
        
        const data = rows.map(row => ({
            id: row.id, 
            shipmentNumber: row.shipment_number, 
            transporterCode: row.transporter_code,
            transporterName: row.transporter_name, 
            contactPerson: row.contact_person,
            mobile: row.mobile, 
            email: row.email || '', 
            vehicleType: row.vehicle_type,
            vehicleNumber: row.vehicle_number, 
            fromCompany: row.from_company, 
            toCompany: row.to_company,
            pickupLocation: row.pickup_location, 
            deliveryLocation: row.delivery_location,
            itemName: row.item_name, 
            qty: Number(row.qty), 
            qtyUnit: row.qty_unit,
            freight: Number(row.freight), 
            paymentTerms: row.payment_terms,
            dispatchDate: row.dispatch_date || '', 
            expectedDelivery: row.expected_delivery || '',
            status: row.status, 
            remarks: row.remarks || '', 
            createdAt: row.created_at,
        }));
        
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 2. POST: Naya transporter add karne ke liye
export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            transporterCode, transporterName, contactPerson, mobile, email, 
            vehicleType, vehicleNumber, fromCompany, toCompany, pickupLocation, 
            deliveryLocation, itemName, qty, qtyUnit, freight, paymentTerms, 
            dispatchDate, expectedDelivery, status, remarks 
        } = body;

        const existing = await query({ 
            query: 'SELECT id FROM transporters WHERE LOWER(transporter_code) = LOWER(?) LIMIT 1', 
            values: [transporterCode.trim()] 
        });
        
        if (existing.length > 0) {
            return NextResponse.json({ success: false, message: 'This transporter code already exists.' }, { status: 409 });
        }

        const countRows = await query({ query: 'SELECT COUNT(*) AS total FROM transporters WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)' });
        const year = new Date().getFullYear();
        const shipmentNumber = `SH-${year}-${String(countRows[0].total + 1).padStart(4, '0')}`;

        const result = await query({
            query: `INSERT INTO transporters (shipment_number, transporter_code, transporter_name, contact_person, mobile, email, vehicle_type, vehicle_number, from_company, to_company, pickup_location, delivery_location, item_name, qty, qty_unit, freight, payment_terms, dispatch_date, expected_delivery, status, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            values: [
                shipmentNumber, transporterCode.trim(), transporterName.trim(), contactPerson.trim(), 
                mobile.trim(), email?.trim() || null, vehicleType || 'Truck', vehicleNumber.trim(), 
                fromCompany, toCompany, pickupLocation.trim(), deliveryLocation.trim(), itemName, 
                Number(qty), qtyUnit || 'KG', Number(freight), paymentTerms || 'To Pay', 
                formatDate(dispatchDate), formatDate(expectedDelivery), status || 'Pending', remarks?.trim() || null
            ]
        });

        return NextResponse.json({ success: true, message: `${shipmentNumber} saved successfully.`, insertedId: result[0].id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 3. PUT: Transporter update karne ke liye
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) return NextResponse.json({ success: false, message: 'ID missing' }, { status: 400 });

        const body = await request.json();
        
        await query({
            query: `UPDATE transporters SET transporter_code=?, transporter_name=?, contact_person=?, mobile=?, email=?, vehicle_type=?, vehicle_number=?, from_company=?, to_company=?, pickup_location=?, delivery_location=?, item_name=?, qty=?, qty_unit=?, freight=?, payment_terms=?, dispatch_date=?, expected_delivery=?, status=?, remarks=? WHERE id=?`,
            values: [
                body.transporterCode, body.transporterName, body.contactPerson, body.mobile, 
                body.email || null, body.vehicleType, body.vehicleNumber, body.fromCompany, 
                body.toCompany, body.pickupLocation, body.deliveryLocation, body.itemName, 
                Number(body.qty), body.qtyUnit, Number(body.freight), body.paymentTerms, 
                formatDate(body.dispatchDate), formatDate(body.expectedDelivery), 
                body.status, body.remarks || null, id
            ]
        });

        return NextResponse.json({ success: true, message: 'Updated successfully.' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 4. DELETE: Transporter delete karne ke liye
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, message: 'ID missing' }, { status: 400 });

        await query({ query: 'DELETE FROM transporters WHERE id = ?', values: [id] });
        
        return NextResponse.json({ success: true, message: 'Deleted successfully.' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
