import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 1. GET: Saare freights fetch karne ke liye
export async function GET() {
    try {
        const rows = await query({ 
            query: 'SELECT * FROM freights ORDER BY created_at DESC' 
        });
        
        const data = rows.map(row => ({
            id: row.id,
            fromPlace: row.from_place,
            toPlace: row.to_place,
            ratePerTon: Number(row.rate_per_ton),
            transporterName: row.transporter_name,
            itemName: row.item_name,
            contactNumber: row.contact_number || '',
            alternateNumber: row.alternate_number || '',
            createdAt: row.created_at,
        }));
        
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 2. POST: Naya freight add karne ke liye
export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            fromPlace, toPlace, ratePerTon, transporterName, 
            itemName, contactNumber, alternateNumber 
        } = body;

        if (!fromPlace || !toPlace || !ratePerTon || !transporterName || !itemName) {
            return NextResponse.json({ success: false, message: 'Required fields missing.' }, { status: 400 });
        }

        const result = await query({
            query: `INSERT INTO freights 
                (from_place, to_place, rate_per_ton, transporter_name, item_name, contact_number, alternate_number) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
            values: [
                fromPlace.trim(), 
                toPlace.trim(), 
                Number(ratePerTon), 
                transporterName.trim(), 
                itemName.trim(), 
                contactNumber?.trim() || null, 
                alternateNumber?.trim() || null
            ]
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Freight saved successfully.',
            insertedId: result.insertId 
        }, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 3. PUT: Freight update karne ke liye (URL: ?id=5)
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) return NextResponse.json({ success: false, message: 'ID missing' }, { status: 400 });

        const body = await request.json();
        
        await query({
            query: `UPDATE freights SET 
                from_place=?, to_place=?, rate_per_ton=?, transporter_name=?, 
                item_name=?, contact_number=?, alternate_number=? 
                WHERE id=?`,
            values: [
                body.fromPlace, body.toPlace, Number(body.ratePerTon), 
                body.transporterName, body.itemName, 
                body.contactNumber || null, body.alternateNumber || null, 
                id
            ]
        });

        return NextResponse.json({ success: true, message: 'Freight updated.' });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 4. DELETE: Freight delete karne ke liye (URL: ?id=5)
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, message: 'ID missing' }, { status: 400 });

        await query({ query: 'DELETE FROM freights WHERE id = ?', values: [id] });
        
        return NextResponse.json({ success: true, message: 'Freight deleted.' });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}