import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Fallback hanya untuk development; di production JWT_SECRET wajib diisi
// agar token tidak bisa dipalsukan dengan kunci yang tertulis di kode.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET belum dikonfigurasi');
  }
  return 'supersecretjwtkey';
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
}

// Identitas user selalu diambil dari token, bukan dari query atau body request.
export function getAuthUserId(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;

  try {
    const payload = jwt.verify(header.slice(7), getJwtSecret());
    if (typeof payload === 'object' && typeof payload.userId === 'string') {
      return payload.userId;
    }
    return null;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk kembali.' }, { status: 401 });
}

export function notFound(message = 'Data tidak ditemukan') {
  return NextResponse.json({ error: message }, { status: 404 });
}
