import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const { amountToAdd } = await request.json();

    // Ambil goal saat ini
    const goal = await prisma.goal.findFirst({ where: { id: params.id, userId } });
    if (!goal) return notFound('Goal tidak ditemukan');

    // Update nominal
    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        currentAmount: goal.currentAmount + amountToAdd,
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah saldo target tabungan' }, { status: 500 });
  }
}
