import { Prisma, Transaction } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const TRANSFER_PAIR_WINDOW_MS = 5000;

export const isTransferCategory = (category: string) => category.startsWith('Transfer');

// Transfer dicatat sebagai dua baris tanpa kolom penghubung, jadi pasangannya
// dicari dari pemilik, nominal, deskripsi, dan waktu pencatatan yang berdekatan.
async function findTransferPair(tx: Prisma.TransactionClient, record: Transaction) {
  const candidates = await tx.transaction.findMany({
    where: {
      userId: record.userId,
      amount: record.amount,
      description: record.description,
      paymentMethod: 'Transfer',
      category: record.category === 'Transfer Keluar' ? 'Transfer Masuk' : 'Transfer Keluar',
      date: {
        gte: new Date(record.date.getTime() - TRANSFER_PAIR_WINDOW_MS),
        lte: new Date(record.date.getTime() + TRANSFER_PAIR_WINDOW_MS),
      },
    },
  });

  const distance = (t: Transaction) => Math.abs(t.date.getTime() - record.date.getTime());
  return candidates.sort((a, b) => distance(a) - distance(b))[0] ?? null;
}

async function revertAndDelete(tx: Prisma.TransactionClient, record: Transaction) {
  if (record.walletId) {
    await tx.wallet.update({
      where: { id: record.walletId },
      data: {
        balance: record.type === 'INCOME' ? { decrement: record.amount } : { increment: record.amount },
      },
    });
  }
  await tx.transaction.delete({ where: { id: record.id } });
}

// Menghapus transaksi milik user dan mengembalikan saldo dompet.
// Untuk transfer, kedua baris dihapus agar saldo kedua dompet kembali seimbang.
// Hasilnya berisi baris yang terhapus sehingga client bisa menawarkan "Urungkan".
export async function deleteUserTransaction(userId: string, id: string): Promise<Transaction[] | null> {
  return prisma.$transaction(async (tx) => {
    const record = await tx.transaction.findFirst({ where: { id, userId } });
    if (!record) return null;

    const pair = isTransferCategory(record.category) ? await findTransferPair(tx, record) : null;
    const deleted = pair ? [record, pair] : [record];

    for (const item of deleted) {
      await revertAndDelete(tx, item);
    }
    return deleted;
  });
}
