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
        fetch('/api/transactions'),
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

  // Kalkulasi Target Tabungan
  const savings = totalIncome - totalExpense;
  const savingsTarget = totalIncome * 0.20;
  let savingsProgress = 0;
  if (savingsTarget > 0 && savings > 0) {
    savingsProgress = Math.min((savings / savingsTarget) * 100, 100);
  }

  // AI Insight Logic
  let insightMessage = "Keuangan Anda bulan ini stabil. Pertahankan tren menabung Anda.";
  let insightType = "success"; // success, warning, danger
  
  if (currentMonthTransactions.length > 0) {
    const expensesByCategory = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCategory = Object.keys(expensesByCategory).reduce((a, b) => expensesByCategory[a] > expensesByCategory[b] ? a : b, "");
    
    if (totalExpense > totalIncome && totalIncome > 0) {
      insightMessage = `Peringatan: Pengeluaran bulan ini melebihi batas wajar. Cek kategori ${maxCategory}.`;
      insightType = "danger";
    } else if (maxCategory) {
      insightMessage = `Pengeluaran terbesar ada di kategori ${maxCategory}. Peluang hemat ada di sana.`;
      insightType = "warning";
    }
  }

  // Chart Data (6 Bulan Terakhir)
  const monthlyDataMap: Record<string, { name: string, Saldo: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  let runningBalance = totalWalletBalance;
  
  // Reconstruct simple balance history for area chart
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyDataMap[key] = { name: monthNames[d.getMonth()], Saldo: runningBalance };
    
    // Simulate past balance by subtracting income and adding expense of that month
    const monthTx = transactions.filter(t => new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear());
    const mIncome = monthTx.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const mExpense = monthTx.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    runningBalance = runningBalance - mIncome + mExpense; 
  }
  
  const areaData = Object.values(monthlyDataMap).reverse();
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* HEADER HERO */}
      <header className="mb-4">
        <h2 className="text-muted" style={{ fontSize: '0.95rem', fontWeight: 500 }}>Selamat datang,</h2>
        <h1 className="font-extrabold" style={{ fontSize: '1.5rem', letterSpacing: '-0.03em' }}>{user.name}</h1>
      </header>

      {/* PREMIUM HERO BALANCE CARD */}
      <section className="card-glass mb-4" style={{ position: 'relative', overflow: 'hidden', padding: '2rem' }}>
        {/* Abstract Glow Background */}
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '200px', height: '200px', background: 'var(--color-primary)', filter: 'blur(100px)', opacity: 0.3, borderRadius: '50%', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', left: '-20%', width: '200px', height: '200px', background: 'var(--color-secondary)', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="text-muted mb-1" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Kekayaan (Net Worth)</p>
          <h2 className="font-extrabold" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #FFFFFF, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rp {totalWalletBalance.toLocaleString('id-ID')}
          </h2>
          
          <div className="flex-between mt-4">
            <button className="btn-primary" onClick={() => router.push('/transactions')} style={{ padding: '0.6rem 1.25rem', borderRadius: '16px', fontSize: '0.85rem' }}>
              + Transaksi Baru
            </button>
            <button className="btn-icon" onClick={() => router.push('/wallets')} style={{ borderRadius: '16px', padding: '0.6rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </button>
          </div>
        </div>
      </section>

      {/* SUMMARY STATS (INCOME/EXPENSE) */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-success)', padding: '6px', borderRadius: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="19 12 12 19 5 12"></polyline><line x1="12" y1="19" x2="12" y2="5"></line></svg>
            </div>
            <p className="text-muted text-xs font-bold">Pemasukan Bulan Ini</p>
          </div>
          <h4 className="font-extrabold text-success text-lg">Rp {totalIncome.toLocaleString('id-ID')}</h4>
        </div>
        
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', padding: '6px', borderRadius: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="5 12 12 5 19 12"></polyline><line x1="12" y1="5" x2="12" y2="19"></line></svg>
            </div>
            <p className="text-muted text-xs font-bold">Pengeluaran Bulan Ini</p>
          </div>
          <h4 className="font-extrabold text-danger text-lg">Rp {totalExpense.toLocaleString('id-ID')}</h4>
        </div>
      </section>

      {/* AI INSIGHT */}
      <div className="card-glass mb-4" style={{ padding: '1.25rem', borderLeft: `4px solid var(--color-${insightType})` }}>
        <div className="flex-between mb-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={`var(--color-${insightType})`} strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><path d="M12 10a4 4 0 0 1 4 4v2H8v-2a4 4 0 0 1 4-4z"></path><path d="M5 16h14"></path><path d="M7 16v4"></path><path d="M17 16v4"></path></svg>
            <h4 className="font-bold text-sm">FinanceFlow AI</h4>
          </div>
        </div>
        <p className="text-sm" style={{ lineHeight: 1.6 }}>{insightMessage}</p>
        
        {/* Progress Bar (Tabungan) */}
        <div className="mt-3">
          <div className="flex-between mb-1">
            <span className="text-xs text-muted font-bold">Target Tabungan 20%</span>
            <span className="text-xs font-bold text-primary">{savingsProgress.toFixed(0)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${savingsProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: '99px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <section className="card mb-4" style={{ padding: '1.5rem 1rem' }}>
        <h3 className="font-bold text-sm mb-3 px-2">Tren Saldo (6 Bulan)</h3>
        {areaData.length > 0 ? (
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                />
                <Area type="monotone" dataKey="Saldo" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaldo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted text-center p-3">Belum ada data grafik.</p>
        )}
      </section>

      {/* RECENT TRANSACTIONS */}
      <section>
        <div className="flex-between mb-3 px-1">
          <h3 className="font-bold text-sm">Riwayat Terakhir</h3>
          <button onClick={() => router.push('/transactions')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Lihat Semua</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentTransactions.map(tx => {
            const isIncome = tx.type === 'INCOME';
            const isTransfer = tx.category.startsWith('Transfer');
            return (
              <div key={tx.id} className="card-glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '20px' }}>
                <div style={{ background: isIncome ? 'rgba(34, 197, 94, 0.1)' : isTransfer ? 'rgba(139, 92, 246, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: isIncome ? 'var(--color-success)' : isTransfer ? 'var(--color-secondary)' : 'var(--color-danger)', padding: '12px', borderRadius: '16px' }}>
                  {isIncome ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 className="font-bold text-sm">{tx.description || tx.category}</h4>
                  <p className="text-muted text-xs mt-1">{tx.description !== tx.category ? `${tx.category} • ` : ''}{new Date(tx.date).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="font-extrabold text-sm" style={{ color: isIncome ? 'var(--color-success)' : 'var(--color-text)' }}>
                  {isIncome ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                </div>
              </div>
            );
          })}
          {recentTransactions.length === 0 && (
            <div className="card-glass text-center p-4">
              <p className="text-sm text-muted">Belum ada riwayat transaksi.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
