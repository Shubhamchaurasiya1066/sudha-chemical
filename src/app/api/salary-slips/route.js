
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import { verifyOrigin } from '@/lib/verifyOrigin';

// Existing database columns and frontend field names
const fields = [
  ['id', 'id'],
  ['company_name', 'companyName'],
  ['month', 'month'],
  ['emp_code', 'code'],
  ['emp_name', 'empName'],
  ['department', 'department'],
  ['designation', 'designation'],
  ['father_name', 'fatherName'],
  ['att_total', 'attTotal'],
  ['att_wd', 'attWD'],
  ['att_rest', 'attRest'],
  ['basic_rate', 'basicRate'],
  ['payable', 'payable'],
  ['hra', 'hra'],
  ['fooding', 'fooding'],
  ['conv', 'conv'],
  ['exp', 'exp'],
  ['p_incv', 'pIncv'],
  ['arrear', 'arrear'],
  ['special', 'special'],
  ['incv', 'incv'],
  ['medical', 'medical'],
  ['mobile_alw', 'mobileAlw'],
  ['transport', 'transport'],
  ['washing', 'washing'],
  ['pf', 'pf'],
  ['mobile_ded', 'mobileDed'],
  ['esi', 'esi'],
  ['lab_wel', 'labWel'],
  ['shortage', 'shortage'],
  ['fine', 'fine'],
  ['prof_tax', 'profTax'],
  ['loan', 'loan'],
  ['tds', 'tds'],
  ['n_sal', 'nSal'],
  ['s_advance', 'sAdvance'],
  ['r_advance', 'rAdvance'],
  ['total_allow', 'totalAllow'],
  ['total_ded', 'totalDed'],
  ['net_payable', 'netPayable']
];

export async function POST(request) {
  try {
    // 1. Only Admin can save salary slips
    const { error } = await requireAuth(['admin']);
    if (error) return error;

    // 2. Protect against cross-origin requests
    const originError = verifyOrigin(request);
    if (originError) return originError;

    // 3. Limit request size before parsing JSON
    const contentLength = Number(
      request.headers.get('content-length')
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > 100000
    ) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

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

    // 4. Validate required fields
    const requiredFields = [
      'id',
      'companyName',
      'month',
      'code',
      'empName'
    ];

    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        String(body[field]).trim() === ''
      ) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // 5. Reject unsupported value types
    for (const [, field] of fields) {
      const value = body[field];

      if (
        value !== undefined &&
        value !== null &&
        typeof value !== 'string' &&
        typeof value !== 'number'
      ) {
        return NextResponse.json(
          { error: `Invalid value for ${field}` },
          { status: 400 }
        );
      }

      if (
        typeof value === 'string' &&
        value.length > 1000
      ) {
        return NextResponse.json(
          { error: `${field} is too long` },
          { status: 400 }
        );
      }
    }

    // 6. Preserve existing field mapping
    const columns = fields.map(([column]) => column);
    const values = fields.map(
      ([, field]) => body[field] ?? null
    );

    const placeholders = fields.map(() => '?').join(', ');

    await query({
      query: `
        INSERT INTO salary_slips
        (${columns.join(', ')})
        VALUES (${placeholders})
      `,
      values
    });

    return NextResponse.json(
      { message: 'Salary Slip saved successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Salary Save Error:', error);

    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Salary slip already exists' },
        { status: 409 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON request' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
