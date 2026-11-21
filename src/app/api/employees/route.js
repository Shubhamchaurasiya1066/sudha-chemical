
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import { verifyOrigin } from '@/lib/verifyOrigin';

// Common error response
function handleError(error) {
  console.error('Employees API Error:', error);

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// MySQL execute() mein undefined values avoid karo
function safe(value) {
  return value === undefined ? null : value;
}

// 1. GET: Only Admin can view employees
export async function GET() {
  try {
    const { error } = await requireAuth(['admin']);
    if (error) return error;

    const employees = await query({
      query: `
        SELECT *
        FROM employees
        ORDER BY created_at DESC
      `
    });

    return NextResponse.json(
      { employees },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } catch (error) {
    return handleError(error);
  }
}

// 2. POST: Only Admin can add employees
export async function POST(request) {
  try {
    const { error } = await requireAuth(['admin']);
    if (error) return error;

    const originError = verifyOrigin(request);
    if (originError) return originError;

    const body = await request.json();

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      empId, empName, empNumber, laptopNumber,
      fatherName, designation, department,
      aadharNo, panNo, pfNo, esiNo,
      bankName, accountNo, ifscCode,
      photo, cvFileName, cvFileData
    } = body;

    if (
      typeof empId !== 'string' ||
      !empId.trim() ||
      typeof empName !== 'string' ||
      !empName.trim()
    ) {
      return NextResponse.json(
        { error: 'Employee ID and Name are required' },
        { status: 400 }
      );
    }

    const existing = await query({
      query: `
        SELECT emp_id
        FROM employees
        WHERE emp_id = ?
        LIMIT 1
      `,
      values: [empId.trim()]
    });

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 409 }
      );
    }

    await query({
      query: `
        INSERT INTO employees (
          emp_id, emp_name, emp_number, laptop_number,
          father_name, designation, department,
          aadhar_no, pan_no, pf_no, esi_no,
          bank_name, account_no, ifsc_code,
          photo, cv_file_name, cv_file_data
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        empId.trim(),
        empName.trim(),
        safe(empNumber),
        safe(laptopNumber),
        safe(fatherName),
        safe(designation),
        safe(department),
        safe(aadharNo),
        safe(panNo),
        safe(pfNo),
        safe(esiNo),
        safe(bankName),
        safe(accountNo),
        safe(ifscCode),
        safe(photo),
        safe(cvFileName),
        safe(cvFileData)
      ]
    });

    return NextResponse.json(
      { message: 'Employee added successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 409 }
      );
    }

    return handleError(error);
  }
}

// 3. PUT: Only Admin can update employees
export async function PUT(request) {
  try {
    const { error } = await requireAuth(['admin']);
    if (error) return error;

    const originError = verifyOrigin(request);
    if (originError) return originError;

    const body = await request.json();

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      empId, empName, empNumber, laptopNumber,
      fatherName, designation, department,
      aadharNo, panNo, pfNo, esiNo,
      bankName, accountNo, ifscCode,
      photo, cvFileName, cvFileData
    } = body;

    if (
      typeof empId !== 'string' ||
      !empId.trim() ||
      typeof empName !== 'string' ||
      !empName.trim()
    ) {
      return NextResponse.json(
        { error: 'Employee ID and Name are required' },
        { status: 400 }
      );
    }

    const existing = await query({
      query: `
        SELECT emp_id
        FROM employees
        WHERE emp_id = ?
        LIMIT 1
      `,
      values: [empId.trim()]
    });

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    await query({
      query: `
        UPDATE employees SET
          emp_name = ?,
          emp_number = ?,
          laptop_number = ?,
          father_name = ?,
          designation = ?,
          department = ?,
          aadhar_no = ?,
          pan_no = ?,
          pf_no = ?,
          esi_no = ?,
          bank_name = ?,
          account_no = ?,
          ifsc_code = ?,
          photo = ?,
          cv_file_name = ?,
          cv_file_data = ?
        WHERE emp_id = ?
      `,
      values: [
        empName.trim(),
        safe(empNumber),
        safe(laptopNumber),
        safe(fatherName),
        safe(designation),
        safe(department),
        safe(aadharNo),
        safe(panNo),
        safe(pfNo),
        safe(esiNo),
        safe(bankName),
        safe(accountNo),
        safe(ifscCode),
        safe(photo),
        safe(cvFileName),
        safe(cvFileData),
        empId.trim()
      ]
    });

    return NextResponse.json(
      { message: 'Employee updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
