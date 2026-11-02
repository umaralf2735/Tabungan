'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { apiFetch } from '@/lib/api';
import { buildInsights } from '@/lib/insight';
import CustomSelect from '@/components/CustomSelect';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [chartRange, setChartRange] = useState<'30d' | '6m'>('30d');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    setDismissedInsights(JSON.parse(localStorage.getItem('dismissedInsights') || '[]'));
    fetchData();
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    apiFetch(`/api/budgets?month=${selectedMonth + 1}&year=${selectedYear}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBudgets(data); })
      .catch(console.error);
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      const [txRes, walletRes] = await Promise.all([
        apiFetch('/api/transactions'),
        apiFetch('/api/wallets')
      ]);
      const txData = await txRes.json();
      const walletData = await walletRes.json();
      
      if(Array.isArray(txData)) setTransactions(txData);
      if(Array.isArray(walletData)) setWallets(walletData);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Mempersiapkan Workspace...</div>;

  const walletBalanceSum = wallets.reduce((sum, w) => sum + w.balance, 0);
  const orphanNet = transactions
    .filter(t => !t.walletId)
    .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
  const totalWalletBalance = walletBalanceSum + orphanNet;
  
  const currentMonthTransactions = transactions.filter(t => 
    new Date(t.date).getMonth() === selectedMonth && 
    new Date(t.date).getFullYear() === selectedYear &&
    !t.category.startsWith('Transfer')
  );
  
  const totalIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  // Kategori Pengeluaran
  const expensesByCategory = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCategories: [string, number][] = (Object.entries(expensesByCategory) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Kalkulasi Tren (Bulan sebelum periode yang dipilih)
  const prevPeriod = new Date(selectedYear, selectedMonth - 1, 1);
  const prevMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === prevPeriod.getMonth() && d.getFullYear() === prevPeriod.getFullYear() && !t.category.startsWith('Transfer');
  });

  // Saldo akhir suatu bulan = saldo sekarang dikurangi mutasi setelah bulan itu.
  // Transfer otomatis saling meniadakan karena dicatat masuk dan keluar.
  const balanceAtEndOf = (year: number, month: number) => {
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
    const netAfter = transactions
      .filter(t => new Date(t.date).getTime() > endOfMonth)
      .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
    return totalWalletBalance - netAfter;
  };

  const prevTotalIncome = prevMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const prevTotalExpense = prevMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const prevNetCashFlow = prevTotalIncome - prevTotalExpense;

  const calcTrend = (current: number, prev: number, invertColor: boolean = false) => {
    if (prev === 0) return { pct: 0, dir: 'none', color: 'var(--color-text-muted)' };
    const pct = ((current - prev) / prev) * 100;
    const dir = pct > 0 ? 'up' : pct < 0 ? 'down' : 'none';
    
    let color = 'var(--color-text-muted)';
    if (dir === 'up') color = invertColor ? 'var(--color-danger)' : 'var(--color-success)';
    if (dir === 'down') color = invertColor ? 'var(--color-success)' : 'var(--color-danger)';
    
    return { pct: Math.abs(pct).toFixed(0), dir, color };
  };

  const trendNW = calcTrend(balanceAtEndOf(selectedYear, selectedMonth), balanceAtEndOf(prevPeriod.getFullYear(), prevPeriod.getMonth()));
  const trendInc = calcTrend(totalIncome, prevTotalIncome);
  const trendExp = calcTrend(totalExpense, prevTotalExpense, true); // Expense up is danger
  const trendCF = calcTrend(netCashFlow, prevNetCashFlow);

  const renderTrend = (trend: any) => {
    if (trend.dir === 'none') return <span style={{ color: trend.color }}>— 0% vs bulan lalu</span>;
    if (trend.dir === 'up') return <span style={{ color: trend.color }}>▲ {trend.pct}% vs bulan lalu</span>;
    return <span style={{ color: trend.color }}>▼ {trend.pct}% vs bulan lalu</span>;
  };

  // Chart Data (Pilihan 1 Bulan Bergulir / 6 Bulan)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const now = new Date();

  // 1. Opsi 1 Bulan Bergulir (selalu mengikuti tanggal terbaru / hari ini, misal 1 Okt s.d. 1 Nov)
  const latestTxTime = transactions.reduce((max, t) => {
    const time = new Date(t.date).getTime();
    return time > max ? time : max;
  }, now.getTime());
  const baseDate = new Date(Math.max(now.getTime(), latestTxTime));

  const rollingStartDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, baseDate.getDate(), 0, 0, 0, 0);
  const rollingEndDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 23, 59, 59, 999);

  const thirtyDaysData: { name: string; fullDate: string; Saldo: number; pemasukan: number; pengeluaran: number }[] = [];
  const dayCursor = new Date(rollingStartDate);
  while (dayCursor.getTime() <= rollingEndDate.getTime()) {
    const startOfDay = new Date(dayCursor.getFullYear(), dayCursor.getMonth(), dayCursor.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(dayCursor.getFullYear(), dayCursor.getMonth(), dayCursor.getDate(), 23, 59, 59, 999).getTime();

    // Hitung akumulasi mutasi yang terjadi setelah akhir hari tersebut
    const netAfter = transactions
      .filter(t => new Date(t.date).getTime() > endOfDay)
      .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0);

    const dayTx = transactions.filter(t => {
      const tt = new Date(t.date).getTime();
      return tt >= startOfDay && tt <= endOfDay && !t.category.startsWith('Transfer');
    });
    const dIncome = dayTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const dExpense = dayTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    thirtyDaysData.push({
      name: `${dayCursor.getDate()} ${monthNames[dayCursor.getMonth()]}`,
      fullDate: `${dayCursor.getDate()} ${monthNames[dayCursor.getMonth()]} ${dayCursor.getFullYear()}`,
      Saldo: totalWalletBalance - netAfter, // Nilai bisa minus jika utang
      pemasukan: dIncome,
      pengeluaran: dExpense
    });

    dayCursor.setDate(dayCursor.getDate() + 1);
  }

  // 2. Opsi 6 Bulan Terakhir (berakhir di bulan yang sedang dipilih user)
  const sixMonthsData = Array.from({ length: 6 }).map((_, idx) => {
    const d = new Date(selectedYear, selectedMonth - (5 - idx), 1);
    const m = d.getMonth();
    const y = d.getFullYear();

    // Rincian transaksi bulan ini untuk transparansi data tooltip
    const monthTx = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === m && td.getFullYear() === y && !t.category.startsWith('Transfer');
    });
    const mIncome = monthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const mExpense = monthTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    return {
      name: `${monthNames[m]} ${y.toString().slice(2)}`,
      fullDate: `${monthNames[m]} ${y}`,
      Saldo: balanceAtEndOf(y, m), // Bisa minus jika utang
      pemasukan: mIncome,
      pengeluaran: mExpense,
      netFlow: mIncome - mExpense
    };
  });

  const areaData = chartRange === '30d' ? thirtyDaysData : sixMonthsData;
  const hasDebt = areaData.some(d => d.Saldo < 0);
  const lastChartPoint = (areaData && areaData.length > 0) ? areaData[areaData.length - 1] : { Saldo: totalWalletBalance };

  const insights = buildInsights(transactions, budgets, selectedMonth, selectedYear);
  const visibleInsights = insights.filter(i => !dismissedInsights.includes(i.id));
  const activeInsight = visibleInsights[0];

  const updateDismissed = (ids: string[]) => {
    setDismissedInsights(ids);
    localStorage.setItem('dismissedInsights', JSON.stringify(ids));
  };

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* HEADER (Editorial Ledger Style) */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="ledger-badge" style={{ marginBottom: '10px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C084FC', boxShadow: '0 0 8px #C084FC' }}></span>
            <span>Ringkasan Keuangan</span>
            <span className="ledger-badge-pill">Real-Time</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.035em', color: '#FFFFFF' }}>
              Arus Kas{' '}
              <span style={{ background: 'linear-gradient(90deg, #E9D5FF 0%, #C084FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Personal
              </span>
            </h1>
            <CustomSelect
              compact
              ariaLabel="Pilih periode"
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(val) => {
                const [y, m] = val.split('-');
                setSelectedYear(parseInt(y));
                setSelectedMonth(parseInt(m));
              }}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              }
              options={Array.from({ length: 12 }).map((_, idx) => {
                const d = new Date(now.getFullYear(), now.getMonth() - idx, 1);
                const m = d.getMonth();
                const y = d.getFullYear();
                return {
                  value: `${y}-${m}`,
                  label: `${monthNames[m]} ${y}`,
                };
              })}
            />
          </div>
        </div>
        <button className="btn-primary desktop-btn" onClick={() => router.push('/transactions')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span className="desktop-only-text">Catat Transaksi</span>
        </button>
      </header>

      {/* INSIGHT BERBASIS ATURAN */}
      <section aria-label="Insight keuangan" style={{ marginBottom: '24px' }}>
        {activeInsight ? (
          <div className="card-glass" style={{
            padding: '18px 22px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(11, 9, 18, 0.92) 70%)',
            border: '1px solid rgba(216, 180, 254, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: '#E9D5FF' }}>
                Analisis Otomatis • {monthNames[selectedMonth]} {selectedYear}
              </span>
              <p style={{ fontSize: '0.92rem', color: '#FAFAFC', marginTop: '4px', fontWeight: 700 }}>{activeInsight.title}</p>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{activeInsight.message}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {activeInsight.action && (
                <button type="button" onClick={() => router.push(activeInsight.action!.href)} className="tap-target" style={{ background: 'rgba(168, 85, 247, 0.18)', border: '1px solid rgba(216, 180, 254, 0.35)', color: '#FAFAFC', padding: '8px 16px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                  {activeInsight.action.label}
                </button>
              )}
              <button type="button" onClick={() => updateDismissed([...dismissedInsights, activeInsight.id])} className="tap-target" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: '8px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                Tutup
              </button>
            </div>
          </div>
        ) : insights.length > 0 && (
          <button type="button" onClick={() => updateDismissed(dismissedInsights.filter(id => !insights.some(i => i.id === id)))} className="tap-target" style={{ background: 'none', border: 'none', color: 'var(--color-primary-text)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            Tampilkan kembali catatan keuangan
          </button>
        )}
      </section>

      {/* TOP 4 CARDS (Ledger Specular Pill Cards with Squircle Icons) */}
      <section className="dashboard-cards" style={{ marginBottom: '24px' }}>
        {/* Card 1: Net Worth */}
        <div
          className="card-full card-mobile-sleek"
          onClick={() => router.push('/wallets')}
          style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
        >
          <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '120px', height: '80px', background: 'rgba(168, 85, 247, 0.28)', filter: 'blur(36px)', pointerEvents: 'none' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div className="squircle-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>Total Kekayaan</p>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.025em', color: totalWalletBalance < 0 ? '#FB7185' : '#FFFFFF', marginTop: '2px' }}>
                {totalWalletBalance < 0 
                  ? `- Rp ${Math.abs(totalWalletBalance).toLocaleString('id-ID')}` 
                  : `Rp ${totalWalletBalance.toLocaleString('id-ID')}`}
              </h2>
            </div>
          </div>
          {totalWalletBalance < 0 && (
            <span style={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(251, 113, 133, 0.16)', border: '1px solid rgba(251, 113, 133, 0.3)', color: '#FB7185', marginBottom: '4px' }}>
              Posisi Defisit / Utang
            </span>
          )}
          <div style={{ fontSize: '0.74rem', fontWeight: 600, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {renderTrend(trendNW)}
          </div>
        </div>

        {/* Card 2: Income */}
        <div className="card-half card-mobile-sleek" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div
              className="squircle-icon"
              style={{
                background: 'linear-gradient(145deg, rgba(52, 211, 153, 0.22) 0%, rgba(16, 36, 30, 0.85) 100%)',
                borderColor: 'rgba(52, 211, 153, 0.3)',
                color: '#6EE7B7',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="19 12 12 19 5 12"></polyline><line x1="12" y1="19" x2="12" y2="5"></line></svg>
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>Pemasukan</p>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#FFFFFF', marginTop: '2px' }}>
                Rp {totalIncome.toLocaleString('id-ID')}
              </h2>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {renderTrend(trendInc)}
          </div>
        </div>

        {/* Card 3: Expenses */}
        <div className="card-half card-mobile-sleek" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div
              className="squircle-icon"
              style={{
                background: 'linear-gradient(145deg, rgba(251, 113, 133, 0.22) 0%, rgba(42, 16, 26, 0.85) 100%)',
                borderColor: 'rgba(251, 113, 133, 0.3)',
                color: '#FDA4AF',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="5 12 12 5 19 12"></polyline><line x1="12" y1="5" x2="12" y2="19"></line></svg>
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>Pengeluaran</p>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#FFFFFF', marginTop: '2px' }}>
                Rp {totalExpense.toLocaleString('id-ID')}
              </h2>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {renderTrend(trendExp)}
          </div>
        </div>

        {/* Card 4: Net Cash Flow */}
        <div className="card-full card-mobile-sleek" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '120px', height: '80px', background: 'rgba(192, 132, 252, 0.22)', filter: 'blur(36px)', pointerEvents: 'none' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div
              className="squircle-icon"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.14) 0%, rgba(24, 22, 34, 0.9) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.22)',
                color: '#F3E8FF',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>Arus Kas Bersih</p>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#FFFFFF', marginTop: '2px' }}>
                Rp {netCashFlow.toLocaleString('id-ID')}
              </h2>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {renderTrend(trendCF)}
          </div>
        </div>
      </section>

      {/* MAIN CHART */}
      <section className="card-mobile-sleek" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {chartRange === '30d' ? 'Tren Kekayaan (1 Bulan Bergulir)' : 'Pertumbuhan Kekayaan (6 Bulan)'}
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
              {chartRange === '30d' && thirtyDaysData.length > 0
                ? `Periode: ${thirtyDaysData[0].fullDate} — ${thirtyDaysData[thirtyDaysData.length - 1].fullDate}`
                : 'Akumulasi saldo bersih akhir bulan'}
            </span>
          </div>

          {/* TOGGLE 1 BULAN / 6 BULAN (Ledger Pill Switcher) */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(10, 8, 18, 0.85)', padding: '4px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => setChartRange('30d')}
              style={{
                background: chartRange === '30d'
                  ? 'radial-gradient(115% 130% at 50% 105%, rgba(168, 85, 247, 0.7) 0%, rgba(88, 28, 135, 0.65) 100%)'
                  : 'transparent',
                color: chartRange === '30d' ? '#fff' : 'var(--color-text-muted)',
                border: chartRange === '30d' ? '1px solid rgba(216, 180, 254, 0.35)' : '1px solid transparent',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              1 Bulan
            </button>
            <button
              type="button"
              onClick={() => setChartRange('6m')}
              style={{
                background: chartRange === '6m'
                  ? 'radial-gradient(115% 130% at 50% 105%, rgba(168, 85, 247, 0.7) 0%, rgba(88, 28, 135, 0.65) 100%)'
                  : 'transparent',
                color: chartRange === '6m' ? '#fff' : 'var(--color-text-muted)',
                border: chartRange === '6m' ? '1px solid rgba(216, 180, 254, 0.35)' : '1px solid transparent',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              6 Bulan
            </button>
          </div>
        </div>

        <div role="img" aria-label={`Grafik saldo ${chartRange === '30d' ? '1 bulan terakhir' : '6 bulan terakhir'}. Saldo terbaru ${lastChartPoint.Saldo < 0 ? `minus ${Math.abs(lastChartPoint.Saldo).toLocaleString('id-ID')}` : lastChartPoint.Saldo.toLocaleString('id-ID')} rupiah.`} style={{ width: '100%', height: '230px' }}>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPro" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E9D5FF" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.95}/>
                  </linearGradient>
                  <linearGradient id="colorProBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#581C87" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  interval={chartRange === '30d' ? Math.floor(thirtyDaysData.length / 6) : 0} 
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  stroke="var(--color-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => {
                    if (val === 0) return '0';
                    const isNeg = val < 0;
                    const abs = Math.abs(val);
                    let str = '';
                    if (abs >= 1000000) str = (abs / 1000000).toFixed(1) + ' jt';
                    else if (abs >= 1000) str = (abs / 1000).toFixed(0) + ' rb';
                    else str = abs.toString();
                    return isNeg ? `-${str}` : str;
                  }} 
                  dx={-10} 
                />
                {hasDebt && (
                  <ReferenceLine y={0} stroke="rgba(251, 113, 133, 0.75)" strokeDasharray="3 3" />
                )}
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(11, 9, 18, 0.96)', border: '1px solid rgba(216, 180, 254, 0.3)', borderRadius: '14px', color: '#fff', fontSize: '0.75rem', padding: '10px 14px', boxShadow: '0 14px 32px rgba(0,0,0,0.75)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(val: any) => {
                    const num = Number(val);
                    const isDebt = num < 0;
                    const formatted = isDebt 
                      ? `- Rp ${Math.abs(num).toLocaleString('id-ID')}` 
                      : `Rp ${num.toLocaleString('id-ID')}`;
                    return [
                      <span key="val" style={{ color: isDebt ? '#FB7185' : '#E9D5FF', fontWeight: 700 }}>
                        {formatted} {isDebt ? '(Utang / Minus)' : ''}
                      </span>,
                      'Saldo Total'
                    ];
                  }}
                  labelFormatter={(label: any, payload: any) => {
                    if (payload && payload[0]?.payload) {
                      const p = payload[0].payload;
                      return (
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: '4px' }}>{p.fullDate || label}</div>
                          {p.pemasukan !== undefined && (p.pemasukan > 0 || p.pengeluaran > 0) && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
                              <span style={{ color: '#34D399' }}>▲ Masuk: Rp {Number(p.pemasukan).toLocaleString('id-ID')}</span>
                              <span style={{ color: '#FB7185' }}>▼ Keluar: Rp {Number(p.pengeluaran).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return label;
                  }}
                />
                <Area type="monotone" dataKey="Saldo" stroke="url(#colorPro)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProBg)" activeDot={{ r: 5, fill: '#E9D5FF', stroke: '#7C3AED', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '8px', opacity: 0.5 }}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <p style={{ fontSize: '0.8rem' }}>Belum ada data riwayat.</p>
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM PANELS */}
      <section className="bottom-panels">
        
        {/* Left: Top Spending */}
        <div className="card-mobile-sleek">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Kategori Pengeluaran</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Distribusi terbesar bulan ini</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            {topCategories.map((cat: any, index: number) => {
              const colors = ['#C084FC', '#FB7185', '#34D399', '#FBBF24'];
              const color = colors[index % colors.length];
              const amount = cat[1] as number;
              const percentage = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
              
              return (
                <div key={cat[0]} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}1F`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"></circle></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.86rem', color: '#FAFAFC' }}>{cat[0]}</p>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E9D5FF' }}>Rp {amount.toLocaleString('id-ID')}</span>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>{percentage}% dari pengeluaran</p>
                  </div>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0', color: 'var(--color-text-muted)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginBottom: '8px', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p className="text-xs">Belum ada data pengeluaran bulan ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="card-mobile-sleek">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Transaksi Terbaru</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Aktivitas mutasi terakhir</p>
            </div>
            <button type="button" className="tap-target" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-text)', cursor: 'pointer', background: 'none', border: 'none' }} onClick={() => router.push('/transactions')}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Lihat Semua</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTransactions.map((tx: any) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isIncome ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)', border: isIncome ? '1px solid rgba(52,211,153,0.28)' : '1px solid rgba(251,113,133,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isIncome ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2.2"><path d="M12 5v14"></path></svg>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.86rem', color: '#FAFAFC' }}>{tx.description || tx.category}</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>{new Date(tx.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: isIncome ? 'var(--color-success)' : '#FAFAFC' }}>
                    {isIncome ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0', gap: '12px' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}><path d="M3 7h18M3 12h18M3 17h18"></path></svg>
                <p className="text-muted text-xs">Belum ada transaksi.</p>
                <button onClick={() => router.push('/transactions')} className="btn-primary tap-target" style={{ padding: '8px 18px', fontSize: '0.78rem', marginTop: '4px' }}>
                  + Catat Transaksi
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
