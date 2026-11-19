import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. POST: Naya salary slip save karne ke liye
export async function POST(request) {
  try {
    const body = await request.json();
    
    await query({
      query: `INSERT INTO salary_slips 
        (id, company_name, month, emp_code, emp_name, department, designation, father_name, 
         att_total, att_wd, att_rest, basic_rate, payable, hra, fooding, conv, exp, p_incv, 
         arrear, special, incv, medical, mobile_alw, transport, washing, pf, mobile_ded, esi, 
         lab_wel, shortage, fine, prof_tax, loan, tds, n_sal, s_advance, r_advance, 
         total_allow, total_ded, net_payable) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [
        body.id, body.companyName, body.month, body.code, body.empName, 
        body.department, body.designation, body.fatherName, 
        body.attTotal, body.attWD, body.attRest, body.basicRate, body.payable, 
        body.hra, body.fooding, body.conv, body.exp, body.pIncv, body.arrear, 
        body.special, body.incv, body.medical, body.mobileAlw, body.transport, 
        body.washing, body.pf, body.mobileDed, body.esi, body.labWel, 
        body.shortage, body.fine, body.profTax, body.loan, body.tds, 
        body.nSal, body.sAdvance, body.rAdvance, body.totalAllow, 
        body.totalDed, body.netPayable
      ],
    });

    return NextResponse.json({ message: 'Salary Slip saved successfully' }, { status: 201 });
  } catch (error) {
    console.error("Salary Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}