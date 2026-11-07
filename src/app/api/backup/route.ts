import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId, unauthorized } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const [user, wallets, transactions, budgets, goals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
      prisma.wallet.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      prisma.budget.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    ]);

    const walletIdToName: Record<string, string> = {};
    wallets.forEach(w => {
      walletIdToName[w.id] = w.name;
    });

    return NextResponse.json({
      version: 1,
      exportedAt: new Date().toISOString(),
      sourceAccount: {
        name: user?.name || 'User',
        email: (user?.email || '').split('#')[0],
      },
      wallets: wallets.map(w => ({
        name: w.name,
        balance: w.balance,
      })),
      transactions: transactions.map(t => ({
        amount: t.amount,
        type: t.type,
        category: t.category,
        paymentMethod: t.paymentMethod,
        date: t.date,
        description: t.description,
        walletName: t.walletId ? walletIdToName[t.walletId] || null : null,
      })),
      budgets: budgets.map(b => ({
        category: b.category,
        amount: b.amount,
        month: b.month,
        year: b.year,
      })),
      goals: goals.map(g => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal mengekspor data backup' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) return unauthorized();

    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.wallets) || !Array.isArray(body.transactions)) {
      return NextResponse.json(
        { error: 'Format file backup (.json) tidak valid' },
        { status: 400 }
      );
    }

    const replaceExisting = body.mode === 'replace';

    await prisma.$transaction(async tx => {
      if (replaceExisting) {
        await tx.transaction.deleteMany({ where: { userId } });
        await tx.budget.deleteMany({ where: { userId } });
        await tx.goal.deleteMany({ where: { userId } });
        await tx.wallet.deleteMany({ where: { userId } });
      }

      // 1. Impor / petakan Dompet berdasarkan nama
      const existingWallets = await tx.wallet.findMany({ where: { userId } });
      const walletNameMap: Record<string, string> = {};
      existingWallets.forEach(w => {
        walletNameMap[w.name.toUpperCase()] = w.id;
      });

      for (const w of body.wallets) {
        const cleanName = sanitizeString(w.name || 'DOMPET', 50).toUpperCase();
        const bal = Number(w.balance) || 0;
        if (!cleanName) continue;

        if (walletNameMap[cleanName]) {
          // Tambahkan saldo ke dompet yang sudah ada jika mode merge
          await tx.wallet.update({
            where: { id: walletNameMap[cleanName] },
            data: { balance: { increment: bal } },
          });
        } else {
          const created = await tx.wallet.create({
            data: {
              name: cleanName,
              balance: bal,
              userId,
            },
          });
          walletNameMap[cleanName] = created.id;
        }
      }

      // 2. Impor seluruh riwayat transaksi
      for (const t of body.transactions) {
        const amount = Number(t.amount);
        const type = t.type === 'INCOME' ? 'INCOME' : 'EXPENSE';
        const category = sanitizeString(t.category || 'Lainnya', 50);
        const description = sanitizeString(t.description || category, 100);
        const paymentMethod = sanitizeString(t.paymentMethod || 'Manual', 50);
        const date = t.date ? new Date(t.date) : new Date();
        const walletKey = t.walletName ? String(t.walletName).toUpperCase() : '';
        const mappedWalletId = walletKey && walletNameMap[walletKey] ? walletNameMap[walletKey] : null;

        if (!(amount > 0)) continue;

        await tx.transaction.create({
          data: {
            amount,
            type,
            category,
            description,
            paymentMethod,
            date: isNaN(date.getTime()) ? new Date() : date,
            walletId: mappedWalletId,
            userId,
          },
        });
      }

      // 3. Impor Anggaran (Budgets)
      if (Array.isArray(body.budgets)) {
        for (const b of body.budgets) {
          const category = sanitizeString(b.category || '', 50);
          const amount = Number(b.amount) || 0;
          const month = Number(b.month) || new Date().getMonth() + 1;
          const year = Number(b.year) || new Date().getFullYear();
          if (!category || !(amount > 0)) continue;

          const exists = await tx.budget.findFirst({
            where: { userId, category, month, year },
          });
          if (!exists) {
            await tx.budget.create({
              data: { category, amount, month, year, userId },
            });
          }
        }
      }

      // 4. Impor Target Tabungan (Goals)
      if (Array.isArray(body.goals)) {
        for (const g of body.goals) {
          const name = sanitizeString(g.name || '', 60);
          const targetAmount = Number(g.targetAmount) || 0;
          const currentAmount = Number(g.currentAmount) || 0;
          const targetDate = g.targetDate ? new Date(g.targetDate) : null;
          if (!name || !(targetAmount > 0)) continue;

          await tx.goal.create({
            data: {
              name,
              targetAmount,
              currentAmount,
              targetDate: targetDate && !isNaN(targetDate.getTime()) ? targetDate : null,
              userId,
            },
          });
        }
      }
    });

    return NextResponse.json({
      message: `Data berhasil diimpor (${body.wallets.length} dompet, ${body.transactions.length} transaksi).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal mengimpor data backup' },
      { status: 500 }
    );
  }
}
