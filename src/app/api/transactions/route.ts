import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, notFound, unauthorized } from '@/lib/auth';
import { deleteUserTransaction } from '@/lib/transactions';
import { sanitizeString } from '@/lib/security';

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
    const category = sanitizeString(data.category, 50);
    const description = sanitizeString(data.description || data.category, 100);
    const paymentMethod = sanitizeString(data.paymentMethod || 'Manual', 50);

    if (!(amount > 0) || !category || !['INCOME', 'EXPENSE'].includes(data.type)) {
      return NextResponse.json({ error: 'Nominal, jenis, dan kategori wajib diisi dengan benar' }, { status: 400 });
    }

    const date = data.date ? new Date(data.date) : new Date();
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Tanggal tidak valid' }, { status: 400 });
    }

    const record = {
      amount,
      type: data.type,
      category,
      paymentMethod,
      description,
      date,
      userId,
    };

    // Cari target dompet (berdasarkan walletId atau fallback ke dompet pertama user)
    let targetWallet = null;
    if (data.walletId) {
      targetWallet = await prisma.wallet.findFirst({ where: { id: data.walletId, userId } });
    } else {
      targetWallet = await prisma.wallet.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
    }

    // Jika belum ada dompet sama sekali, simpan transaksi mandiri
    if (!targetWallet) {
      const transaction = await prisma.transaction.create({ data: record });
      return NextResponse.json(transaction);
    }

    // Update saldo dompet sekaligus
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: { ...record, walletId: targetWallet.id },
      });

      await tx.wallet.update({
        where: { id: targetWallet.id },
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
