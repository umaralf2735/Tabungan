import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const existing = await prisma.budget.findFirst({ where: { id: params.id, userId } });
    if (!existing) return notFound('Anggaran tidak ditemukan');

    await prisma.budget.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const existing = await prisma.budget.findFirst({ where: { id: params.id, userId } });
    if (!existing) return notFound('Anggaran tidak ditemukan');

    const { category, amount, month, year } = await request.json();
    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: { category, amount: parseFloat(amount), month, year }
    });
    return NextResponse.json(budget);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
