import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 400 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: 'Akun belum diverifikasi. Silakan cek email Anda atau daftar ulang.' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Password salah' }, { status: 400 });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({ message: 'Login berhasil', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal melakukan login' }, { status: 500 });
  }
}
