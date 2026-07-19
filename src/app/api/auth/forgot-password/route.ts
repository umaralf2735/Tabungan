import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // Cari pengguna
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email tidak terdaftar di sistem' }, { status: 404 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Simpan ke database
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry }
    });

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Desain Email HTML Profesional
    const mailOptions = {
      from: `"FinanceFlow Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Kode OTP Reset Sandi - FinanceFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #2563eb; text-align: center;">FinanceFlow Pro</h2>
          <p>Halo <b>${user.name || 'Pengguna'}</b>,</p>
          <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Berikut adalah kode OTP Anda:</p>
          <div style="background: #f8fafc; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">Kode ini hanya berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Jika Anda tidak meminta reset sandi, abaikan email ini.</p>
        </div>
      `
    };

    // Kirim Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Kode OTP telah dikirim ke email Anda' }, { status: 200 });
  } catch (error) {
    console.error('Error send OTP:', error);
    return NextResponse.json({ error: 'Gagal memproses permintaan OTP' }, { status: 500 });
  }
}
