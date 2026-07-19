import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 404 });
    }

    // Validasi OTP
    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Kode OTP tidak valid' }, { status: 400 });
    }

    // Validasi Kedaluwarsa OTP
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: 'Kode OTP sudah kedaluwarsa' }, { status: 400 });
    }

    // Enkripsi kata sandi baru
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update sandi dan hapus OTP dari database
    await prisma.user.update({
      where: { email },
      data: { 
        passwordHash,
        otp: null,
        otpExpiry: null
      }
    });

    return NextResponse.json({ message: 'Kata sandi berhasil diubah' }, { status: 200 });
  } catch (error) {
    console.error('Error reset password:', error);
    return NextResponse.json({ error: 'Gagal mereset kata sandi' }, { status: 500 });
  }
}
