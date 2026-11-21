import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ============ 1. GET: Saare customers + unke items fetch karna ============
export async function GET() {
    try {
        const customers = await query({ 
            query: 'SELECT * FROM customers ORDER BY created_at DESC' 
        });

        // Har customer ke items alag se fetch karo
        const data = await Promise.all(
            customers.map(async (c) => {
                const items = await query({
                    query: 'SELECT item_name, qty, unit FROM customer_items WHERE customer_id = ?',
                    values: [c.id]
                });

                return {
                    id: c.id,
                    customerName: c.customer_name,
                    customerType: c.customer_type,
                    storeContact: c.store_contact || '',
                    purchaseContact: c.purchase_contact || '',
                    accountsContact: c.accounts_contact || '',
                    factoryAddress: c.factory_address || '',
                    officeAddress: c.office_address,
                    contactPerson: c.contact_person,
                    contactNumber: c.contact_number,
                    alternateNumber: c.alternate_number || '',
                    emailId: c.email_id,
                    state: c.state,
                    city: c.city,
                    month: c.month,
                    items: items.map(i => ({
                        itemName: i.item_name,
                        qty: i.qty == null ? '' : String(i.qty),
                        unit: i.unit,
                    })),
                    createdAt: c.created_at,
                };
            })
        );

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// ============ 2. POST: Naya customer add karna (items ke saath) ============
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            customerName, customerType, storeContact, purchaseContact, accountsContact,
            factoryAddress, officeAddress, contactPerson, contactNumber, alternateNumber,
            emailId, state, city, month, items
        } = body;

        if (!customerName || !officeAddress || !contactPerson || !contactNumber || !emailId || !state || !city || !month) {
            return NextResponse.json({ success: false, message: 'Required fields missing.' }, { status: 400 });
        }

        // 1. Customer insert
        const result = await query({
            query: `INSERT INTO customers 
                (customer_name, customer_type, store_contact, purchase_contact, accounts_contact, 
                factory_address, office_address, contact_person, contact_number, alternate_number, 
                email_id, state, city, month) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING id`,
            values: [
                customerName.trim(), customerType || 'Manufacturer',
                storeContact || null, purchaseContact || null, accountsContact || null,
                factoryAddress || null, officeAddress.trim(),
                contactPerson.trim(), contactNumber.trim(), alternateNumber || null,
                emailId.trim(), state.trim(), city.trim(), month
            ]
        });

        const customerId = result[0].id;

        // 2. Items insert (agar hain)
        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (!item.itemName) continue;
                await query({
                    query: `INSERT INTO customer_items (customer_id, item_name, qty, unit) VALUES (?, ?, ?, ?)`,
                    values: [
                        customerId,
                        item.itemName,
                        item.qty === "" || item.qty == null ? null : Number(item.qty),
                        item.unit || 'KG'
                    ]
                });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Customer added successfully.',
            insertedId: customerId 
        }, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// ============ 3. PUT: Customer update karna ============
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, message: 'ID missing' }, { status: 400 });

        const body = await request.json();
        const {
            customerName, customerType, storeContact, purchaseContact, accountsContact,
            factoryAddress, officeAddress, contactPerson, contactNumber, alternateNumber,
            emailId, state, city, month, items
        } = body;

        // 1. Customer update
        await query({
            query: `UPDATE customers SET 
                customer_name=?, customer_type=?, store_contact=?, purchase_contact=?, accounts_contact=?, 
                factory_address=?, office_address=?, contact_person=?, contact_number=?, alternate_number=?, 
                email_id=?, state=?, city=?, month=? 
                WHERE id=?`,
            values: [
                customerName, customerType, storeContact || null, purchaseContact || null, 
                accountsContact || null, factoryAddress || null, officeAddress,
                contactPerson, contactNumber, alternateNumber || null,
                emailId, state, city, month, id
            ]
        });

        // 2. Purane items delete karo
        await query({
            query: 'DELETE FROM customer_items WHERE customer_id = ?',
            values: [id]
        });

        // 3. Naye items insert karo
        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (!item.itemName) continue;
                await query({
                    query: `INSERT INTO customer_items (customer_id, item_name, qty, unit) VALUES (?, ?, ?, ?)`,
                    values: [
                        id,
                        item.itemName,
                        item.qty === "" || item.qty == null ? null : Number(item.qty),
                        item.unit || 'KG'
                    ]
                });
            }
        }

        return NextResponse.json({ success: true, message: 'Customer updated.' });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// ============ 4. DELETE: Customer delete karna (items auto delete honge) ============
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, message: 'ID missing' }, { status: 400 });

        // CASCADE ki wajah se items automatically delete ho jayenge
        await query({ query: 'DELETE FROM customers WHERE id = ?', values: [id] });
        
        return NextResponse.json({ success: true, message: 'Customer deleted.' });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
