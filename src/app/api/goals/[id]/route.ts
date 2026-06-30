import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { amountToAdd } = await request.json();
    
    // Ambil goal saat ini
    const goal = await prisma.goal.findUnique({ where: { id: params.id } });
    if (!goal) return NextResponse.json({ error: 'Goal tidak ditemukan' }, { status: 404 });
    
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
