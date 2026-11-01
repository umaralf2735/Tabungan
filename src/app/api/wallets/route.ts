import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(wallets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const body = await request.json();
    const cleanName = sanitizeString(body.name, 50);

    if (!cleanName) {
      return NextResponse.json({ error: 'Nama dompet wajib diisi' }, { status: 400 });
    }

    const wallet = await prisma.wallet.create({
      data: {
        name: cleanName,
        balance: parseFloat(body.balance) || 0,
        userId
      }
    });

    return NextResponse.json(wallet);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID dompet tidak ditemukan' }, { status: 400 });
    }

    const wallet = await prisma.wallet.findFirst({ where: { id, userId } });
    if (!wallet) return notFound('Dompet tidak ditemukan');

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { walletId: id, userId } }),
      prisma.wallet.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Wallet deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
