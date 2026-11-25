import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/requireAuth';
import bcrypt from 'bcryptjs';

function json(message, status = 200) {
    return NextResponse.json(message, { status });
}

async function verifyAdminCredentials(user, body) {
    const adminId = typeof body?.adminId === 'string' ? body.adminId.trim() : '';
    const adminPassword = typeof body?.adminPassword === 'string' ? body.adminPassword : '';

    if (!adminId || !adminPassword) {
        return { error: json({ success: false, message: 'Admin ID and password are required.' }, 400) };
    }

    const rows = await query({
        query: 'SELECT username, password FROM users WHERE id = ? AND role = ?',
        values: [user.id, 'admin']
    });
    const admin = rows[0];
    const passwordMatches = admin?.password && await bcrypt.compare(adminPassword, admin.password);

    if (!admin || admin.username !== adminId || !passwordMatches) {
        return { error: json({ success: false, message: 'Invalid admin ID or password.' }, 401) };
    }

    return { error: null };
}

// 1. GET: Saare freights fetch karne ke liye
export async function GET() {
    try {
        const { user, error } = await requireAuth(['admin', 'staff']);
        if (error) return error;

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
        
        return NextResponse.json({ success: true, data, canManage: user.role === 'admin' });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 2. POST: Naya freight add karne ke liye
export async function POST(request) {
    try {
        const { error } = await requireAuth(['admin', 'staff']);
        if (error) return error;

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
                VALUES (?, ?, ?, ?, ?, ?, ?)
                RETURNING id`,
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
            insertedId: result[0].id
        }, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// Admin credentials verify before showing an editable form.
export async function PATCH(request) {
    try {
        const { user, error } = await requireAuth(['admin']);
        if (error) return error;

        const body = await request.json();
        const verification = await verifyAdminCredentials(user, body);
        if (verification.error) return verification.error;

        return json({ success: true, message: 'Admin verified.' });
    } catch (error) {
        console.error('PATCH Error:', error);
        return json({ success: false, message: 'Unable to verify admin.' }, 500);
    }
}

// 3. PUT: Freight update karne ke liye (URL: ?id=5)
export async function PUT(request) {
    try {
        const { user, error } = await requireAuth(['admin']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) return NextResponse.json({ success: false, message: 'ID missing' }, { status: 400 });

        const body = await request.json();
        const verification = await verifyAdminCredentials(user, body);
        if (verification.error) return verification.error;
        
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
        const { user, error } = await requireAuth(['admin']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, message: 'ID missing' }, { status: 400 });

        const body = await request.json().catch(() => ({}));
        const verification = await verifyAdminCredentials(user, body);
        if (verification.error) return verification.error;

        await query({ query: 'DELETE FROM freights WHERE id = ?', values: [id] });
        
        return NextResponse.json({ success: true, message: 'Freight deleted.' });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
