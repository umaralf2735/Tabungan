import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';

// Hapus akun beserta seluruh data keuangan milik user.
export async function DELETE(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Kata sandi wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return notFound('Akun tidak ditemukan');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Kata sandi salah' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.wallet.deleteMany({ where: { userId } }),
      prisma.goal.deleteMany({ where: { userId } }),
      prisma.budget.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({ message: 'Akun berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus akun' }, { status: 500 });
  }
}
