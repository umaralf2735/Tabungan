import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        otp,
        otpExpiry,
        isVerified: false,
      },
    });

    // Kirim email OTP
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"FinanceFlow Pro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Kode Verifikasi Akun FinanceFlow Anda',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a;">Verifikasi Akun Baru</h2>
          <p>Halo ${name},</p>
          <p>Terima kasih telah mendaftar di FinanceFlow Pro. Berikut adalah kode OTP Anda untuk mengaktifkan akun:</p>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2563eb; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>Kode ini hanya berlaku selama 10 menit.</p>
          <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Registrasi berhasil, periksa email untuk OTP', email: user.email });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal melakukan registrasi' }, { status: 500 });
  }
}
