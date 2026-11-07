import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const FOSII_ADMIN_EMAIL = (process.env.FOSII_ADMIN_EMAIL || 'admin@fosii.id').toLowerCase();
export const FOSII_ADMIN_PASSWORD = process.env.FOSII_ADMIN_PASSWORD || 'fosiiadmin123';

export type FosiiUnitId = 'pusat' | 'cabang' | 'pesmi';

export interface FosiiSlots {
  pusat: string | null;
  cabang: string | null;
  pesmi: string | null;
}

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

export function signToken(
  userId: string,
  extra?: { role?: 'FOSII_ADMIN'; targetUserId?: string; unit?: FosiiUnitId }
): string {
  return jwt.sign({ userId, ...extra }, getJwtSecret(), { expiresIn: '7d' });
}

export function getAuthPayload(request: Request): {
  userId: string;
  role?: 'FOSII_ADMIN';
  targetUserId?: string;
  unit?: FosiiUnitId;
} | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;

  try {
    const payload = jwt.verify(header.slice(7), getJwtSecret());
    if (typeof payload === 'object' && payload !== null && typeof (payload as any).userId === 'string') {
      return payload as any;
    }
    return null;
  } catch {
    return null;
  }
}

// Identitas user selalu diambil dari token.
// Jika yang login adalah FOSII_ADMIN:
// - Hanya boleh melakukan request GET (Read-Only) ke data akun FOSII yang sedang dipantau (targetUserId).
// - Segala percobaan POST / PUT / DELETE ke data transaksi, dompet, anggaran, target, atau hapus akun ditolak otomatis.
export function getAuthUserId(request: Request): string | null {
  const payload = getAuthPayload(request);
  if (!payload) return null;

  if (payload.role === 'FOSII_ADMIN') {
    const method = (request.method || 'GET').toUpperCase();
    if (method !== 'GET') {
      return null;
    }
    return payload.targetUserId || 'unassigned-fosii-slot';
  }

  return payload.userId;
}

export function unauthorized(message = 'Sesi berakhir atau akses tidak diizinkan.') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function notFound(message = 'Data tidak ditemukan') {
  return NextResponse.json({ error: message }, { status: 404 });
}
