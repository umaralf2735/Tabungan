import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data target tabungan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const data = await request.json();
    const goal = await prisma.goal.create({
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: new Date(data.targetDate),
        userId,
      },
    });
    return NextResponse.json(goal);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat target tabungan' }, { status: 500 });
  }
}
