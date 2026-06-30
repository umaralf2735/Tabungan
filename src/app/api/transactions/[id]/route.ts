import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.transaction.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        paymentMethod: data.paymentMethod,
        description: data.description,
      },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate transaksi' }, { status: 500 });
  }
}
