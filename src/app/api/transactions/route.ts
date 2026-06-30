import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data transaksi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        paymentMethod: data.paymentMethod,
        description: data.description,
        userId: data.userId, // Pastikan user sudah login
      },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 });
  }
}
