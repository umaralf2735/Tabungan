import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const url = new URL(request.url);
    const monthParam = url.searchParams.get('month');
    const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;
    const yearParam = url.searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    // Ambil daftar budget
    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      orderBy: { createdAt: 'desc' }
    });

    // Ambil semua transaksi pengeluaran bulan tersebut
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    // Hitung pengeluaran per kategori
    const spentByCategory = expenses.reduce((acc: any, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    // Gabungkan data budget dengan pengeluaran
    const budgetsWithSpent = budgets.map(b => ({
      ...b,
      spent: spentByCategory[b.category] || 0
    }));

    return NextResponse.json(budgetsWithSpent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const { category, amount, month, year } = await request.json();

    if (!category) {
      return NextResponse.json({ error: 'Kategori wajib diisi' }, { status: 400 });
    }

    // Cek apakah budget untuk kategori dan bulan ini sudah ada
    const existingBudget = await prisma.budget.findFirst({
      where: { userId, category, month, year }
    });

    if (existingBudget) {
      return NextResponse.json({ error: 'Budget untuk kategori ini sudah ada di bulan yang dipilih.' }, { status: 400 });
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        amount: parseFloat(amount) || 0,
        month,
        year,
        userId
      }
    });

    return NextResponse.json(budget);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
