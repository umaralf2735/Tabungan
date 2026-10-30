import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';
import { deleteUserTransaction } from '@/lib/transactions';

export async function GET(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data transaksi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const data = await request.json();
    const amount = parseFloat(data.amount);

    if (!(amount > 0) || !data.category || !['INCOME', 'EXPENSE'].includes(data.type)) {
      return NextResponse.json({ error: 'Nominal, jenis, dan kategori wajib diisi dengan benar' }, { status: 400 });
    }

    const date = data.date ? new Date(data.date) : new Date();
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Tanggal tidak valid' }, { status: 400 });
    }

    const record = {
      amount,
      type: data.type,
      category: data.category,
      paymentMethod: data.paymentMethod,
      description: data.description,
      date,
      userId,
    };

    // Jika tidak ada walletId, buat transaksi biasa
    if (!data.walletId) {
      const transaction = await prisma.transaction.create({ data: record });
      return NextResponse.json(transaction);
    }

    const wallet = await prisma.wallet.findFirst({ where: { id: data.walletId, userId } });
    if (!wallet) return notFound('Dompet tidak ditemukan');

    // Jika ada walletId, update saldo dompet sekaligus
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: { ...record, walletId: wallet.id },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: data.type === 'INCOME' ? { increment: amount } : { decrement: amount } },
      });

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID transaksi tidak ditemukan' }, { status: 400 });
    }

    const deleted = await deleteUserTransaction(userId, id);
    if (!deleted) return notFound('Transaksi tidak ditemukan');

    return NextResponse.json({ message: 'Transaksi berhasil dihapus', deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}
