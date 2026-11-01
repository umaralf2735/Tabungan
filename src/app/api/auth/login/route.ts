import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { checkRateLimit, getClientIp, sanitizeEmail } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    
    // LAPIS 1: Proteksi Brute Force IP (Maks 10 percobaan per menit per IP)
    const ipLimit = checkRateLimit(`login-ip-${ip}`, 10, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan dari perangkat ini. Silakan coba lagi dalam ${ipLimit.retryAfterSeconds} detik.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = body.email;
    const password = body.password;

    if (!rawEmail || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // LAPIS 2: Sanitasi Input
    const email = sanitizeEmail(rawEmail);

    // LAPIS 1: Proteksi Brute Force Akun (Maks 5 percobaan gagal per akun per menit)
    const accountLimit = checkRateLimit(`login-acc-${email}`, 5, 60 * 1000);
    if (!accountLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal pada akun ini. Tunggu ${accountLimit.retryAfterSeconds} detik demi keamanan.` },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 400 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: 'Akun belum diverifikasi. Silakan cek email Anda atau daftar ulang.' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 400 });
    }

    const token = signToken(user.id);

    return NextResponse.json({ message: 'Login berhasil', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal melakukan login' }, { status: 500 });
  }
}
