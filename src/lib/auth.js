import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

function getKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must contain at least 32 characters'
    );
  }

  return new TextEncoder().encode(secret);
}

export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getKey());
}

export async function decrypt(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      getKey(),
      { algorithms: ['HS256'] }
    );

    if (
      !payload.userId ||
      !payload.username ||
      !['admin', 'staff'].includes(payload.role)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}