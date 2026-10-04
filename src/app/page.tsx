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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Financial Overview</h1>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
          {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
        </div>
      </header>

      {/* TOP 4 CARDS (CSS Grid) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: Net Worth */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.4)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--color-primary)', filter: 'blur(50px)', opacity: 0.2 }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>1. TOTAL NET WORTH</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Rp {totalWalletBalance.toLocaleString('id-ID')}</h2>
          <p style={{ color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>+ Aktif</p>
        </div>

        {/* Card 2: Income */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>2. TOTAL INCOME</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Rp {totalIncome.toLocaleString('id-ID')}</h2>
          <p style={{ color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>Bulan ini</p>
        </div>

        {/* Card 3: Expenses */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>3. TOTAL EXPENSES</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Rp {totalExpense.toLocaleString('id-ID')}</h2>
          <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>Bulan ini</p>
        </div>

        {/* Card 4: Net Cash Flow */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(168, 85, 247, 0.4)', boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#A855F7', filter: 'blur(50px)', opacity: 0.2 }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>4. NET CASH FLOW</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Rp {netCashFlow.toLocaleString('id-ID')}</h2>
          <p style={{ color: netCashFlow >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>{netCashFlow >= 0 ? '+' : ''} Surplus / Defisit</p>
        </div>
      </section>

      {/* MAIN CHART */}
      <section style={{ background: 'var(--color-surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '24px', textTransform: 'uppercase' }}>Net Worth Growth (12 Months)</h3>
        <div style={{ width: '100%', height: '300px' }}>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPro" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorProBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Saldo" stroke="url(#colorPro)" strokeWidth={4} fillOpacity={1} fill="url(#colorProBg)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-center" style={{ marginTop: '100px' }}>Belum ada data riwayat.</p>
          )}
        </div>
      </section>

      {/* BOTTOM PANELS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left: Top Spending */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '20px', textTransform: 'uppercase' }}>Top Spending Categories</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {topCategories.map((cat: any, index: number) => {
              const colors = ['#EF4444', '#8B5CF6', '#3B82F6', '#22C55E']; // Red, Purple, Blue, Green
              const color = colors[index % colors.length];
              const amount = cat[1] as number;
              const percentage = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
              
              return (
                <div key={cat[0]} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle></svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat[0]}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{percentage}% • Rp {amount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              );
            })}
            {topCategories.length === 0 && <p className="text-muted text-sm">Belum ada pengeluaran bulan ini.</p>}
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Recent Transactions</h3>
            <button onClick={() => router.push('/transactions')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>View All</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentTransactions.map((tx: any) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isIncome ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.description || tx.category}</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{tx.category} • {new Date(tx.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isIncome ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {isIncome ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}
            {recentTransactions.length === 0 && <p className="text-muted text-sm">Tidak ada transaksi terbaru.</p>}
          </div>
        </div>

      </section>

    </div>
  );
}
