import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data transaksi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Jika tidak ada walletId, buat transaksi biasa
    if (!data.walletId) {
      const transaction = await prisma.transaction.create({
        data: {
          amount: data.amount,
          type: data.type,
          category: data.category,
          paymentMethod: data.paymentMethod,
          description: data.description,
          userId: data.userId,
        },
      });
      return NextResponse.json(transaction);
    }

    // Jika ada walletId, update saldo dompet sekaligus
    const result = await prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.create({
        data: {
          amount: data.amount,
          type: data.type,
          category: data.category,
          paymentMethod: data.paymentMethod,
          description: data.description,
          userId: data.userId,
          walletId: data.walletId,
        },
      });

      const wallet = await prisma.wallet.findUnique({ where: { id: data.walletId } });
      if (wallet) {
        const newBalance = data.type === 'INCOME' 
          ? wallet.balance + data.amount 
          : wallet.balance - data.amount;
        
        await prisma.wallet.update({
          where: { id: data.walletId },
          data: { balance: newBalance }
        });
      }

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID transaksi tidak ditemukan' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Jika transaksi terhubung ke dompet, kembalikan saldonya
    if (transaction.walletId) {
      const wallet = await prisma.wallet.findUnique({ where: { id: transaction.walletId } });
      if (wallet) {
        const newBalance = transaction.type === 'INCOME' 
          ? wallet.balance - transaction.amount 
          : wallet.balance + transaction.amount;
        
        await prisma.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: newBalance }
        });
      }
    }

    await prisma.transaction.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}

