import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, signToken, unauthorized } from '@/lib/auth';

const UNIT_LABELS: Record<string, string> = {
  pusat: 'Pesma Pusat',
  cabang: 'Pesma Cabang',
  pesmi: 'Pesmi',
};

export async function POST(request: Request) {
  try {
    const currentUserId = getAuthUserId(request);
    if (!currentUserId) return unauthorized();

    const body = await request.json().catch(() => ({}));
    const unit = typeof body.unit === 'string' ? body.unit.toLowerCase() : '';

    if (!UNIT_LABELS[unit]) {
      return NextResponse.json({ error: 'Unit FOSII tidak valid' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser) return unauthorized();

    const baseEmail = currentUser.email.split('#')[0];
    const rootUser =
      currentUser.email === baseEmail
        ? currentUser
        : await prisma.user.findUnique({ where: { email: baseEmail } });

    if (!rootUser) {
      return NextResponse.json({ error: 'Akun induk tidak ditemukan' }, { status: 404 });
    }

    const baseName = (rootUser.name || 'FOSII').split(' — ')[0];
    const unitLabel = UNIT_LABELS[unit];
    const targetEmail = unit === 'pusat' ? baseEmail : `${baseEmail}#${unit}`;

    let targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email: targetEmail,
          name: `${baseName} — ${unitLabel}`,
          passwordHash: rootUser.passwordHash,
          isVerified: true,
        },
      });
    }

    const token = signToken(targetUser.id);

    return NextResponse.json({
      message: `Berhasil beralih ke ${unitLabel}`,
      token,
      unit,
      user: {
        id: targetUser.id,
        name: `${baseName} — ${unitLabel}`,
        email: baseEmail,
        unit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal berpindah unit keuangan' },
      { status: 500 }
    );
  }
}
