import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. GET: Saare employees fetch karne ke liye
export async function GET() {
  try {
    const employees = await query({
      query: 'SELECT * FROM employees ORDER BY created_at DESC',
    });
    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Naya employee add karne ke liye
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      empId, empName, empNumber, laptopNumber, fatherName, designation,
      department, aadharNo, panNo, pfNo, esiNo, bankName, accountNo,
      ifscCode, photo, cvFileName, cvFileData
    } = body;

    await query({
      query: `INSERT INTO employees 
        (emp_id, emp_name, emp_number, laptop_number, father_name, designation, department, aadhar_no, pan_no, pf_no, esi_no, bank_name, account_no, ifsc_code, photo, cv_file_name, cv_file_data) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [
        empId, empName, empNumber, laptopNumber, fatherName, designation,
        department, aadharNo, panNo, pfNo, esiNo, bankName, accountNo,
        ifscCode, photo, cvFileName, cvFileData
      ],
    });

    return NextResponse.json({ message: 'Employee added successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. PUT: Existing employee update karne ke liye
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      empId, empName, empNumber, laptopNumber, fatherName, designation,
      department, aadharNo, panNo, pfNo, esiNo, bankName, accountNo,
      ifscCode, photo, cvFileName, cvFileData
    } = body;

    await query({
      query: `UPDATE employees SET 
        emp_name = ?, emp_number = ?, laptop_number = ?, father_name = ?, 
        designation = ?, department = ?, aadhar_no = ?, pan_no = ?, pf_no = ?, 
        esi_no = ?, bank_name = ?, account_no = ?, ifsc_code = ?, photo = ?, 
        cv_file_name = ?, cv_file_data = ? 
        WHERE emp_id = ?`,
      values: [
        empName, empNumber, laptopNumber, fatherName, designation,
        department, aadharNo, panNo, pfNo, esiNo, bankName, accountNo,
        ifscCode, photo, cvFileName, cvFileData, empId
      ],
    });

    return NextResponse.json({ message: 'Employee updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}