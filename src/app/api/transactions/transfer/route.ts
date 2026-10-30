import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const { fromWalletId, toWalletId, amount, description, date } = await request.json();
    const parsedAmount = parseFloat(amount);

    if (!fromWalletId || !toWalletId || !(parsedAmount > 0)) {
      return NextResponse.json({ error: 'Dompet asal, dompet tujuan, dan nominal wajib diisi' }, { status: 400 });
    }

    if (fromWalletId === toWalletId) {
      return NextResponse.json({ error: 'Dompet asal dan tujuan tidak boleh sama' }, { status: 400 });
    }

    const ownedWallets = await prisma.wallet.count({
      where: { id: { in: [fromWalletId, toWalletId] }, userId },
    });
    if (ownedWallets !== 2) return notFound('Dompet tidak ditemukan');

    // Satu waktu untuk kedua baris agar keduanya bisa dikenali sebagai pasangan
    const transferDate = date ? new Date(date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Kurangi saldo dompet asal
      await tx.wallet.update({
        where: { id: fromWalletId },
        data: { balance: { decrement: parsedAmount } }
      });

      // 2. Tambah saldo dompet tujuan
      await tx.wallet.update({
        where: { id: toWalletId },
        data: { balance: { increment: parsedAmount } }
      });

      // 3. Catat transaksi keluar (EXPENSE)
      const expenseTx = await tx.transaction.create({
        data: {
          amount: parsedAmount,
          type: 'EXPENSE',
          category: 'Transfer Keluar',
          paymentMethod: 'Transfer',
          description: description || 'Transfer antar dompet',
          date: transferDate,
          userId,
          walletId: fromWalletId
        }
      });

      // 4. Catat transaksi masuk (INCOME)
      const incomeTx = await tx.transaction.create({
        data: {
          amount: parsedAmount,
          type: 'INCOME',
          category: 'Transfer Masuk',
          paymentMethod: 'Transfer',
          description: description || 'Transfer antar dompet',
          date: transferDate,
          userId,
          walletId: toWalletId
        }
      });

      return { expenseTx, incomeTx };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
