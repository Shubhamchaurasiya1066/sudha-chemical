import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. GET: Saare payment advices fetch karo (bills ke saath)
export async function GET() {
  try {
    const advices = await query({ query: 'SELECT * FROM payment_advices ORDER BY created_at DESC' });
    
    // Har advice ke liye uske bills fetch karo
    const formattedAdvices = await Promise.all(
      advices.map(async (advice) => {
        const bills = await query({
          query: 'SELECT * FROM payment_bills WHERE advice_id = ?',
          values: [advice.id],
        });
        
        return {
          ...advice,
          bills: bills.map(b => ({
            billNo: b.bill_no,
            billDate: b.bill_date,
            billAmount: b.bill_amount,
            adjustedAmount: b.adjusted_amount,
            tds: b.tds,
            tcs: b.tcs,
          })),
        };
      })
    );

    return NextResponse.json({ advices: formattedAdvices }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Naya payment advice save karo (bills ke saath)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id, adviceNumber, partyName, totalAmount, paymentMode,
      bankName, transactionRef, adviceDate, remarks, bills
    } = body;

    // 1. Main advice save karo
    await query({
      query: `INSERT INTO payment_advices 
        (id, advice_number, party_name, total_amount, payment_mode, bank_name, transaction_ref, advice_date, remarks) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [id, adviceNumber, partyName, totalAmount, paymentMode, bankName, transactionRef, adviceDate, remarks],
    });

    // 2. Bills save karo (agar hain to)
    if (bills && bills.length > 0) {
      for (const bill of bills) {
        await query({
          query: `INSERT INTO payment_bills 
            (advice_id, bill_no, bill_date, bill_amount, adjusted_amount, tds, tcs) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
          values: [
            id, 
            bill.billNo, 
            bill.billDate || null, 
            Number(bill.billAmount) || 0, 
            Number(bill.adjustedAmount) || 0, 
            Number(bill.tds) || 0, 
            Number(bill.tcs) || 0
          ],
        });
      }
    }

    return NextResponse.json({ message: 'Payment Advice saved successfully' }, { status: 201 });
  } catch (error) {
    console.error("Payment Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. DELETE: Advice aur uske bills delete karo
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // ON DELETE CASCADE ki wajah se bills apne aap delete ho jayenge
    await query({
      query: 'DELETE FROM payment_advices WHERE id = ?',
      values: [id],
    });

    return NextResponse.json({ message: 'Payment Advice deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}