import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { checkRateLimit, getClientIp, sanitizeEmail, sanitizeString } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    
    // LAPIS 1: Proteksi Brute Force IP (Maks 10 percobaan per menit)
    const ipLimit = checkRateLimit(`otp-ip-${ip}`, 10, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan dari perangkat ini. Tunggu ${ipLimit.retryAfterSeconds} detik.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = body.email;
    const rawOtp = body.otp;

    if (!rawEmail || !rawOtp) {
      return NextResponse.json({ error: 'Email dan OTP wajib diisi' }, { status: 400 });
    }

    // LAPIS 2: Sanitasi Input
    const email = sanitizeEmail(rawEmail);
    const otp = sanitizeString(rawOtp, 10);

    // LAPIS 1: Proteksi Brute Force Tebak 6-Digit OTP (Maks 5 tebakan per akun per 5 menit)
    const otpLimit = checkRateLimit(`otp-guess-${email}`, 5, 5 * 60 * 1000);
    if (!otpLimit.allowed) {
      return NextResponse.json(
        { error: `Percobaan OTP salah melebihi batas (5 kali). Kode diblokir sementara selama ${Math.ceil(otpLimit.retryAfterSeconds / 60)} menit demi keamanan.` },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 400 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Akun sudah diverifikasi sebelumnya' }, { status: 400 });
    }

    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: `Kode OTP salah atau sudah kedaluwarsa. Sisa kesempatan: ${otpLimit.remaining} kali.` }, { status: 400 });
    }

    // Verifikasi berhasil
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      }
    });

    // Otomatis login
    const token = signToken(user.id);

    return NextResponse.json({ message: 'Verifikasi berhasil', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    return NextResponse.json({ error: `Gagal verifikasi OTP: ${error.message}` }, { status: 500 });
  }
}
