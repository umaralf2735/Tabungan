import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email dan OTP wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 400 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Akun sudah diverifikasi sebelumnya' }, { status: 400 });
    }

    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: 'Kode OTP salah atau sudah kedaluwarsa' }, { status: 400 });
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
