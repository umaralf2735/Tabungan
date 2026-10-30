import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';
import { deleteUserTransaction, isTransferCategory } from '@/lib/transactions';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const deleted = await deleteUserTransaction(userId, params.id);
    if (!deleted) return notFound('Transaksi tidak ditemukan');

    return NextResponse.json({ message: 'Transaksi berhasil dihapus', deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const data = await request.json();

    const oldTx = await prisma.transaction.findFirst({ where: { id: params.id, userId } });
    if (!oldTx) return notFound('Transaksi tidak ditemukan');

    if (isTransferCategory(oldTx.category)) {
      return NextResponse.json({ error: 'Transaksi transfer tidak bisa diedit. Hapus lalu catat ulang.' }, { status: 400 });
    }

    if (data.walletId) {
      const wallet = await prisma.wallet.findFirst({ where: { id: data.walletId, userId } });
      if (!wallet) return notFound('Dompet tidak ditemukan');
    }

    const result = await prisma.$transaction(async (prisma) => {
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
