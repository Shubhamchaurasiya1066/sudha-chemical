import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/requireAuth';
import { unstable_rethrow } from 'next/navigation';

const json = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
const fail = (error) => { unstable_rethrow(error); console.error('Customers API:', error); return json({ success: false, message: 'Customer operation failed.' }, 500); };
const auth = () => requireAuth(['admin', 'staff']);

export async function GET() {
  try {
    const { error } = await auth(); if (error) return error;
    const customers = await query({ query: `SELECT c.*, COALESCE((SELECT jsonb_agg(jsonb_build_object('itemName', i.item_name, 'qty', COALESCE(i.qty::text, ''), 'unit', i.unit)) FROM customer_items i WHERE i.customer_id = c.id), '[]'::jsonb) AS items FROM customers c ORDER BY c.created_at DESC` });
    return json({ success: true, data: customers.map(c => ({
      id: c.id, customerName: c.customer_name, customerType: c.customer_type,
      storeContact: c.store_contact || '', purchaseContact: c.purchase_contact || '', accountsContact: c.accounts_contact || '',
      factoryAddress: c.factory_address || '', officeAddress: c.office_address,
      contactPerson: c.contact_person, otherContactPerson: c.other_contact_person || '',
      contactNumber: c.contact_number, alternateNumber: c.alternate_number || '',
      emailId: c.email_id, emailIds: c.email_ids?.length ? c.email_ids : [c.email_id],
      state: c.state, city: c.city, month: c.month, items: c.items, createdAt: c.created_at
    })) });
  } catch (e) { return fail(e); }
}

function validate(b) {
  const text = v => typeof v === 'string' ? v.trim() : '';
  const type = text(b.customerType) || 'Enduser';
  const emails = Array.isArray(b.emailIds) ? b.emailIds.map(text) : [text(b.emailId)];
  if (!['Enduser','Trader','Manufacturer'].includes(type) || !['customerName','officeAddress','contactPerson','contactNumber','state','city','month'].every(k => text(b[k])) || !emails.length || emails.some(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) return null;
  if (!/^\d{10}$/.test(text(b.contactNumber)) || (type === 'Enduser' && !text(b.factoryAddress))) return null;
  for (const k of ['alternateNumber','storeContact','purchaseContact','accountsContact']) if (text(b[k]) && !/^\d{10}$/.test(text(b[k]))) return null;
  if (!Array.isArray(b.items) || !b.items.length) return null;
  const items = b.items.map(i => ({ item_name: text(i.itemName), qty: type === 'Trader' || i.qty === '' || i.qty == null ? null : Number(i.qty), unit: text(i.unit) || 'KG' }));
  if (items.some(i => !i.item_name || !['KG','MT','L','BAG'].includes(i.unit) || (i.qty !== null && (!Number.isFinite(i.qty) || i.qty <= 0)) || (type === 'Enduser' && i.qty === null))) return null;
  return { values: [text(b.customerName), type, text(b.storeContact)||null, text(b.purchaseContact)||null, text(b.accountsContact)||null, text(b.factoryAddress)||null, text(b.officeAddress), text(b.contactPerson), text(b.contactNumber), text(b.alternateNumber)||null, emails[0], text(b.state), text(b.city), text(b.month), text(b.otherContactPerson)||null, emails], items: JSON.stringify(items) };
}
const columns = 'customer_name, customer_type, store_contact, purchase_contact, accounts_contact, factory_address, office_address, contact_person, contact_number, alternate_number, email_id, state, city, month, other_contact_person, email_ids';
const itemInsert = `INSERT INTO customer_items (customer_id, item_name, qty, unit) SELECT c.id, i.item_name, i.qty, i.unit FROM changed c CROSS JOIN jsonb_to_recordset($17::jsonb) AS i(item_name text, qty numeric, unit text)`;
function getId(request) { const id = new URL(request.url).searchParams.get('id'); return id && /^\d+$/.test(id) && Number(id) > 0 && Number(id) <= 2147483647 ? Number(id) : null; }

export async function POST(request) {
  try {
    const { error } = await auth(); if (error) return error;
    const data = validate(await request.json()); if (!data) return json({ success: false, message: 'Invalid customer details or email IDs.' }, 400);
    const rows = await query({ query: `WITH changed AS (INSERT INTO customers (${columns}) VALUES (${data.values.map((_,i) => `$${i+1}`).join(', ')}) RETURNING id), inserted AS (${itemInsert} RETURNING customer_id) SELECT id FROM changed`, values: [...data.values, data.items] });
    return json({ success: true, message: 'Customer added successfully.', insertedId: rows[0].id }, 201);
  } catch (e) { return fail(e); }
}

export async function PUT(request) {
  try {
    const { error } = await auth(); if (error) return error;
    const id = getId(request); if (!id) return json({ success: false, message: 'Invalid ID' }, 400);
    const data = validate(await request.json()); if (!data) return json({ success: false, message: 'Invalid customer details or email IDs.' }, 400);
    const rows = await query({ query: `WITH changed AS (UPDATE customers SET ${columns.split(', ').map((c,i) => `${c}=$${i+1}`).join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id=$18 RETURNING id), removed AS (DELETE FROM customer_items WHERE customer_id IN (SELECT id FROM changed) RETURNING customer_id), inserted AS (${itemInsert} CROSS JOIN (SELECT count(*) FROM removed) AS dependency RETURNING customer_id) SELECT id FROM changed`, values: [...data.values, data.items, id] });
    return rows.length ? json({ success: true, message: 'Customer updated.' }) : json({ success: false, message: 'Customer not found.' }, 404);
  } catch (e) { return fail(e); }
}

export async function DELETE(request) {
  try {
    const { error } = await auth(); if (error) return error;
    const id = getId(request); if (!id) return json({ success: false, message: 'Invalid ID' }, 400);
    const rows = await query({ query: 'DELETE FROM customers WHERE id = ? RETURNING id', values: [id] });
    return rows.length ? json({ success: true, message: 'Customer deleted.' }) : json({ success: false, message: 'Customer not found.' }, 404);
  } catch (e) { return fail(e); }
}