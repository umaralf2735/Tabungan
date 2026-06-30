import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.$transaction(async (prisma) => {
      const tx = await prisma.transaction.findUnique({ where: { id: params.id } });
      if (!tx) return;
      
      await prisma.transaction.delete({ where: { id: params.id } });
      
      if (tx.walletId) {
        if (tx.type === 'INCOME') {
          await prisma.wallet.update({ where: { id: tx.walletId }, data: { balance: { decrement: tx.amount } } });
        } else {
          await prisma.wallet.update({ where: { id: tx.walletId }, data: { balance: { increment: tx.amount } } });
        }
      }
    });
    return NextResponse.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const result = await prisma.$transaction(async (prisma) => {
      const oldTx = await prisma.transaction.findUnique({ where: { id: params.id } });
      if (!oldTx) throw new Error("Not found");
      
      // 1. Revert efek transaksi lama dari dompet lama
      if (oldTx.walletId) {
        if (oldTx.type === 'INCOME') {
          await prisma.wallet.update({ where: { id: oldTx.walletId }, data: { balance: { decrement: oldTx.amount } } });
        } else {
          await prisma.wallet.update({ where: { id: oldTx.walletId }, data: { balance: { increment: oldTx.amount } } });
        }
      }
      
      // 2. Update data transaksi itu sendiri
      const updatedTx = await prisma.transaction.update({
        where: { id: params.id },
        data: {
          amount: data.amount,
          type: data.type,
          category: data.category,
          paymentMethod: data.paymentMethod,
          description: data.description,
          walletId: data.walletId || null,
        },
      });
      
      // 3. Aplikasikan efek transaksi baru ke dompet baru
      if (updatedTx.walletId) {
        if (updatedTx.type === 'INCOME') {
          await prisma.wallet.update({ where: { id: updatedTx.walletId }, data: { balance: { increment: updatedTx.amount } } });
        } else {
          await prisma.wallet.update({ where: { id: updatedTx.walletId }, data: { balance: { decrement: updatedTx.amount } } });
        }
      }
      
      return updatedTx;
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate transaksi' }, { status: 500 });
  }
}
