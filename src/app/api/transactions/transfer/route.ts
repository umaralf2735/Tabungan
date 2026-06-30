import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { fromWalletId, toWalletId, amount, description, userId, date } = await request.json();
    
    if (!fromWalletId || !toWalletId || !amount || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (fromWalletId === toWalletId) {
      return NextResponse.json({ error: 'Dompet asal dan tujuan tidak boleh sama' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);

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
          date: date ? new Date(date) : new Date(),
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
          date: date ? new Date(date) : new Date(),
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
