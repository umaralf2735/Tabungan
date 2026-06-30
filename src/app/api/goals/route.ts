import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data target tabungan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const goal = await prisma.goal.create({
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: new Date(data.targetDate),
        userId: data.userId, // Pastikan user sudah login
      },
    });
    return NextResponse.json(goal);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat target tabungan' }, { status: 500 });
  }
}
