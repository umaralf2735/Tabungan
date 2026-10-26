'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchData(JSON.parse(userData).id);
  }, [router]);

  const fetchData = async (userId: string) => {
    try {
      const [txRes, walletRes] = await Promise.all([
        fetch(`/api/transactions?userId=${userId}`),
        fetch(`/api/wallets?userId=${userId}`)
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

  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  const currentMonthTransactions = transactions.filter(t => 
    new Date(t.date).getMonth() === new Date().getMonth() && 
    new Date(t.date).getFullYear() === new Date().getFullYear() &&
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
  const topCategories = Object.entries(expensesByCategory).sort((a: any, b: any) => b[1] - a[1]).slice(0, 4);

  // Kalkulasi Tren (Bulan Lalu)
  const prevMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear && !t.category.startsWith('Transfer');
  });

  const prevTotalIncome = prevMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const prevTotalExpense = prevMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const prevNetCashFlow = prevTotalIncome - prevTotalExpense;
  const prevTotalWalletBalance = totalWalletBalance - netCashFlow + prevNetCashFlow;

  const calcTrend = (current: number, prev: number, invertColor: boolean = false) => {
    if (prev === 0) return { pct: 0, dir: 'none', color: 'var(--color-text-muted)' };
    const pct = ((current - prev) / prev) * 100;
    const dir = pct > 0 ? 'up' : pct < 0 ? 'down' : 'none';
    
    let color = 'var(--color-text-muted)';
    if (dir === 'up') color = invertColor ? 'var(--color-danger)' : 'var(--color-success)';
    if (dir === 'down') color = invertColor ? 'var(--color-success)' : 'var(--color-danger)';
    
    return { pct: Math.abs(pct).toFixed(0), dir, color };
  };

  const trendNW = calcTrend(totalWalletBalance, prevTotalWalletBalance);
  const trendInc = calcTrend(totalIncome, prevTotalIncome);
  const trendExp = calcTrend(totalExpense, prevTotalExpense, true); // Expense up is danger
  const trendCF = calcTrend(netCashFlow, prevNetCashFlow);

  const renderTrend = (trend: any) => {
    if (trend.dir === 'none') return <span style={{ color: trend.color }}>— 0% vs bulan lalu</span>;
    if (trend.dir === 'up') return <span style={{ color: trend.color }}>▲ {trend.pct}% vs bulan lalu</span>;
    return <span style={{ color: trend.color }}>▼ {trend.pct}% vs bulan lalu</span>;
  };

  // Chart Data (12 Bulan)
  const monthlyDataMap: Record<string, { name: string, Saldo: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  let runningBalance = totalWalletBalance;
  
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyDataMap[key] = { name: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`, Saldo: runningBalance };
    
    const monthTx = transactions.filter(t => new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear());
    const mIncome = monthTx.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const mExpense = monthTx.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    runningBalance = runningBalance - mIncome + mExpense; 
  }
  
  const areaData = Object.values(monthlyDataMap).reverse();
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
        <button className="btn-primary desktop-btn" onClick={() => router.push('/transactions')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span className="desktop-only-text">Tambah Transaksi</span>
        </button>
      </header>

      {/* AI INSIGHT / FINANCIAL ASSISTANT (Human-AI Teaming W01) */}
      <section style={{ marginBottom: '24px' }}>
        <div className="card-glass" style={{ 
          padding: '18px 22px', 
          borderRadius: '20px', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(17, 24, 39, 0.8) 100%)', 
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6366F1, #A78BFA)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A78BFA' }}>AI Insight • Analis Keuangan</span>
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', color: 'var(--color-success)', fontWeight: 700 }}>Aktif</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#F1F5F9', marginTop: '4px', fontWeight: 500 }}>
                {netCashFlow < 0 ? (
                  <span>⚠️ <strong>Defisit Terdeteksi:</strong> Pengeluaran bulan ini melebihi pemasukan sebesar <span style={{ color: 'var(--color-danger)' }}>Rp {Math.abs(netCashFlow).toLocaleString('id-ID')}</span>. Pertimbangkan rem pos jajan non-esensial.</span>
                ) : topCategories.length > 0 ? (
                  <span>💡 <strong>Pola Sehat:</strong> Arus kas surplus <span style={{ color: 'var(--color-success)' }}>Rp {netCashFlow.toLocaleString('id-ID')}</span>. Alokasi terbesar di <strong>{topCategories[0][0]}</strong> ({topCategories[0][1].toLocaleString('id-ID')}).</span>
                ) : (
                  <span>✨ <strong>Siap Memulai:</strong> Belum ada transaksi bulan ini. Catat transaksi pertama untuk mengaktifkan audit AI otomatis.</span>
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/reports')} 
            style={{ 
              background: 'rgba(255,255,255,0.06)', 
              border: '1px solid rgba(255,255,255,0.15)', 
              color: '#F1F5F9', 
              padding: '8px 14px', 
              borderRadius: '12px', 
              fontSize: '0.75rem', 
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Lihat Laporan Struk
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </section>

      {/* TOP 4 CARDS (CSS Grid) */}
      <section className="dashboard-cards" style={{ marginBottom: '24px' }}>
        {/* Card 1: Net Worth */}
        <div className="card-full card-mobile-sleek" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--color-primary)', filter: 'blur(50px)', opacity: 0.2 }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(99,102,241,0.2)', padding: '6px', borderRadius: '8px', color: 'var(--color-primary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </span>
            TOTAL KEKAYAAN
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Rp {totalWalletBalance.toLocaleString('id-ID')}</h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>{renderTrend(trendNW)}</p>
        </div>

        {/* Card 2: Income */}
        <div className="card-half card-mobile-sleek">
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(52,211,153,0.2)', padding: '6px', borderRadius: '8px', color: 'var(--color-success)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="19 12 12 19 5 12"></polyline><line x1="12" y1="19" x2="12" y2="5"></line></svg>
            </span>
            TOTAL PEMASUKAN
          </p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Rp {totalIncome.toLocaleString('id-ID')}</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>{renderTrend(trendInc)}</p>
        </div>

        {/* Card 3: Expenses */}
        <div className="card-half card-mobile-sleek">
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(251,113,133,0.2)', padding: '6px', borderRadius: '8px', color: 'var(--color-danger)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="5 12 12 5 19 12"></polyline><line x1="12" y1="5" x2="12" y2="19"></line></svg>
            </span>
            TOTAL PENGELUARAN
          </p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Rp {totalExpense.toLocaleString('id-ID')}</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>{renderTrend(trendExp)}</p>
        </div>

        {/* Card 4: Net Cash Flow */}
        <div className="card-full card-mobile-sleek" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#A78BFA', filter: 'blur(50px)', opacity: 0.2 }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(167,139,250,0.2)', padding: '6px', borderRadius: '8px', color: '#A78BFA' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </span>
            ARUS KAS BERSIH
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Rp {netCashFlow.toLocaleString('id-ID')}</h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>{renderTrend(trendCF)}</p>
        </div>
      </section>

      {/* MAIN CHART */}
      <section className="card-mobile-sleek" style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          PERTUMBUHAN KEKAYAAN (12 BULAN)
        </p>
        <div style={{ width: '100%', height: '220px' }}>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPro" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorProBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis 
                  domain={['dataMin', 'dataMax']}
                  stroke="var(--color-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => {
                    if (val === 0) return '0';
                    if (val >= 1000000) return (val / 1000000).toFixed(1) + ' jt';
                    if (val >= 1000) return (val / 1000).toFixed(0) + ' rb';
                    return val.toString();
                  }} 
                  dx={-10} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#fff', fontSize: '0.75rem' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Saldo" stroke="url(#colorPro)" strokeWidth={2} fillOpacity={1} fill="url(#colorProBg)" activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: '#fff', strokeWidth: 2 }} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'rgba(99,102,241,0.2)', padding: '6px', borderRadius: '50%', color: 'var(--color-primary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
              </span>
              KATEGORI PENGELUARAN
            </p>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {topCategories.map((cat: any, index: number) => {
              const colors = ['#FB7185', '#A78BFA', '#34D399', '#FBBF24'];
              const color = colors[index % colors.length];
              const amount = cat[1] as number;
              const percentage = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
              
              return (
                <div key={cat[0]} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cat[0]}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>{percentage}% • Rp {amount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '8px', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p className="text-xs">Belum ada data pengeluaran bulan ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="card-mobile-sleek">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'rgba(99,102,241,0.2)', padding: '6px', borderRadius: '8px', color: 'var(--color-primary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </span>
              TRANSAKSI TERBARU
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => router.push('/transactions')}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Lihat Semua</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentTransactions.map((tx: any) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isIncome ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isIncome ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2"><path d="M12 5v14"></path></svg>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tx.description || tx.category}</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>{new Date(tx.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isIncome ? 'var(--color-success)' : 'var(--color-text)' }}>
                    {isIncome ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '12px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}><path d="M3 7h18M3 12h18M3 17h18"></path></svg>
                <p className="text-muted text-xs">Belum ada transaksi bulan ini.</p>
                <button onClick={() => router.push('/transactions')} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                  + Tambah Transaksi
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
