// Insight berbasis aturan: tidak memakai model AI, dan setiap pesan menjelaskan
// angka yang menjadi alasannya agar user bisa menilai sendiri lalu memutuskan.

export type Insight = {
  id: string;
  tone: 'warning' | 'positive' | 'neutral';
  title: string;
  message: string;
  action?: { label: string; href: string };
};

const CATEGORY_RISE_THRESHOLD_PCT = 30;
const COMPARISON_MONTHS = 3;

const rupiah = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;

const expensesInMonth = (transactions: any[], month: number, year: number) =>
  transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'EXPENSE' && !t.category.startsWith('Transfer') && d.getMonth() === month && d.getFullYear() === year;
  });

const totalByCategory = (expenses: any[]) =>
  expenses.reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

// month memakai indeks 0-11. Urutan hasil: peringatan dulu, lalu ringkasan.
export function buildInsights(transactions: any[], budgets: any[], month: number, year: number): Insight[] {
  const period = `${year}-${month}`;
  const insights: Insight[] = [];

  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return !t.category.startsWith('Transfer') && d.getMonth() === month && d.getFullYear() === year;
  });
  const income = monthTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = monthTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  if (net < 0) {
    insights.push({
      id: `deficit-${period}`,
      tone: 'warning',
      title: 'Pengeluaran lebih besar dari pemasukan',
      message: `Pada periode ini pengeluaran ${rupiah(expense)} dan pemasukan ${rupiah(income)}, selisih ${rupiah(-net)}.`,
      action: { label: 'Atur Anggaran', href: '/budgets' },
    });
  }

  budgets.filter(b => b.amount > 0 && b.spent >= b.amount).forEach(b => {
    insights.push({
      id: `budget-${b.id}-${period}`,
      tone: 'warning',
      title: `Anggaran ${b.category} sudah terpakai penuh`,
      message: `Terpakai ${rupiah(b.spent)} dari batas ${rupiah(b.amount)} yang Anda tetapkan.`,
      action: { label: 'Ubah Batas', href: '/budgets' },
    });
  });

  const current = totalByCategory(expensesInMonth(transactions, month, year));
  const previous: Record<string, number> = {};
  for (let i = 1; i <= COMPARISON_MONTHS; i++) {
    const d = new Date(year, month - i, 1);
    const totals = totalByCategory(expensesInMonth(transactions, d.getMonth(), d.getFullYear()));
    Object.entries(totals).forEach(([category, amount]) => {
      previous[category] = (previous[category] || 0) + amount;
    });
  }

  Object.entries(current).forEach(([category, amount]) => {
    if (!previous[category]) return;
    const average = previous[category] / COMPARISON_MONTHS;
    const risePct = ((amount - average) / average) * 100;
    if (risePct < CATEGORY_RISE_THRESHOLD_PCT) return;
    insights.push({
      id: `rise-${category}-${period}`,
      tone: 'warning',
      title: `Pengeluaran ${category} naik`,
      message: `Naik ${Math.round(risePct)}% dibanding rata-rata ${COMPARISON_MONTHS} bulan sebelumnya (${rupiah(average)} menjadi ${rupiah(amount)}).`,
      action: { label: 'Atur Anggaran', href: '/budgets' },
    });
  });

  if (monthTransactions.length === 0) {
    insights.push({
      id: `empty-${period}`,
      tone: 'neutral',
      title: 'Belum ada transaksi',
      message: 'Belum ada transaksi pada periode ini. Catat transaksi agar ringkasan bisa dihitung.',
      action: { label: 'Tambah Transaksi', href: '/transactions' },
    });
  } else if (net >= 0) {
    const [topCategory, topAmount] = Object.entries(current).sort((a, b) => b[1] - a[1])[0] ?? [];
    insights.push({
      id: `surplus-${period}`,
      tone: 'positive',
      title: 'Arus kas surplus',
      message: topCategory
        ? `Surplus ${rupiah(net)}. Pengeluaran terbesar ada di ${topCategory} (${rupiah(topAmount)}).`
        : `Surplus ${rupiah(net)} pada periode ini.`,
    });
  }

  return insights;
}
