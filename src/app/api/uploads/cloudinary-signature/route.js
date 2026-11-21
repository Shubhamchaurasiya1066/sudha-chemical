import { v2 as cloudinary } from 'cloudinary';
import { unstable_rethrow } from 'next/navigation';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import { verifyOrigin } from '@/lib/verifyOrigin';

export async function POST(request) {
  try {
    const { error } = await requireAuth(['admin']);
    if (error) return error;

    const originError = verifyOrigin(request);
    if (originError) return originError;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folder = process.env.CLOUDINARY_FOLDER || 'sudha-chemicals/employees';

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured' },
        { status: 503 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret
    );

    return NextResponse.json(
      { apiKey, cloudName, folder, signature, timestamp },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { error: 'Unable to prepare image upload' },
      { status: 500 }
    );
  }
}
