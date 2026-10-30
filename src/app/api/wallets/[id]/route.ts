import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const wallet = await prisma.wallet.findFirst({ where: { id: params.id, userId } });
    if (!wallet) return notFound('Dompet tidak ditemukan');

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { walletId: params.id, userId } }),
      prisma.wallet.delete({ where: { id: params.id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const existing = await prisma.wallet.findFirst({ where: { id: params.id, userId } });
    if (!existing) return notFound('Dompet tidak ditemukan');

    const { name, balance } = await request.json();
    const wallet = await prisma.wallet.update({
      where: { id: params.id },
      data: { name, balance: parseFloat(balance) }
    });
    return NextResponse.json(wallet);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
