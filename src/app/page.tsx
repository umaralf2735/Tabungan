'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

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

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat Sistem...</div>;

  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  const currentMonthTransactions = transactions.filter(t => 
    new Date(t.date).getMonth() === new Date().getMonth() && 
    new Date(t.date).getFullYear() === new Date().getFullYear() &&
    !t.category.startsWith('Transfer')
  );
  
  const totalIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  // Kalkulasi Target Tabungan (20% dari Pemasukan sesuai Rule 50/30/20)
  const savings = totalIncome - totalExpense;
  const savingsTarget = totalIncome * 0.20;
  let savingsProgress = 0;
  if (savingsTarget > 0 && savings > 0) {
    savingsProgress = Math.min((savings / savingsTarget) * 100, 100);
  }

  // AI Insight
  let insightMessage = "Anda masih bisa menabung Rp300.000 bulan ini.";
  
  if (currentMonthTransactions.length > 0) {
    const expensesByCategory = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCategory = Object.keys(expensesByCategory).reduce((a, b) => expensesByCategory[a] > expensesByCategory[b] ? a : b, "");
    
    if (totalExpense > totalIncome && totalIncome > 0) {
      insightMessage = `Pengeluaran kategori ${maxCategory.toLowerCase()} naik tajam minggu ini.`;
    } else if (maxCategory) {
      insightMessage = `Pengeluaran terbesar ada di kategori ${maxCategory.toLowerCase()}.`;
    }
  }

  // Bar Chart Data (3 Bulan Terakhir)
  const monthlyDataMap: Record<string, { name: string, Masuk: number, Keluar: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  transactions.forEach(t => {
    if (t.category.startsWith('Transfer')) return;
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthlyDataMap[key]) monthlyDataMap[key] = { name: monthNames[d.getMonth()], Masuk: 0, Keluar: 0 };
    if (t.type === 'INCOME') monthlyDataMap[key].Masuk += t.amount;
    if (t.type === 'EXPENSE') monthlyDataMap[key].Keluar += t.amount;
  });
  const barData = Object.values(monthlyDataMap).reverse().slice(0, 3).reverse();

  // Recent 3 Transactions
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '0.5rem' }}>
      
      {/* 1. Header Section */}
      <header className="mb-4">
        <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Halo, {user.name} 👋</h2>
      </header>

      {/* 2. Summary Cards Section */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div className="card-glass" style={{ gridColumn: '1 / -1', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(17,24,39,0.9))' }}>
          <p className="text-xs text-muted mb-1">Total Saldo</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Rp {totalWalletBalance.toLocaleString('id-ID')}</h3>
        </div>
        <div className="card-glass" style={{ padding: '0.85rem' }}>
          <p className="text-xs text-muted mb-1">Pemasukan</p>
          <h4 className="font-bold text-success" style={{ fontSize: '1rem' }}>+Rp {totalIncome.toLocaleString('id-ID')}</h4>
        </div>
        <div className="card-glass" style={{ padding: '0.85rem' }}>
          <p className="text-xs text-muted mb-1">Pengeluaran</p>
          <h4 className="font-bold text-danger" style={{ fontSize: '1rem' }}>-Rp {totalExpense.toLocaleString('id-ID')}</h4>
        </div>
        
        {/* Progress Target Tabungan */}
        <div className="card-glass" style={{ gridColumn: '1 / -1', padding: '1rem' }}>
          <div className="flex-between mb-2">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>Target Tabungan (20% Pemasukan)</h4>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>{savingsProgress.toFixed(0)}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${savingsProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: '99px', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>
      </section>

      {/* 4. AI Insight Card (Compact) */}
      <div className="card-glass" style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: `1px solid rgba(37, 99, 235, 0.4)` }}>
        <div style={{ color: 'var(--color-primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><path d="M12 10a4 4 0 0 1 4 4v2H8v-2a4 4 0 0 1 4-4z"></path><path d="M5 16h14"></path><path d="M7 16v4"></path><path d="M17 16v4"></path></svg>
        </div>
        <div>
          <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>AI Insight Otomatis</h4>
          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{insightMessage}</p>
        </div>
      </div>

      {/* 5. Financial Chart Section */}
      <section className="card-glass" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>Arus Kas (Masuk & Keluar)</h3>
        {barData.length > 0 ? (
          <div style={{ width: '100%', height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Bar dataKey="Masuk" fill="var(--color-success)" radius={[2, 2, 0, 0]} barSize={12} />
                <Bar dataKey="Keluar" fill="var(--color-danger)" radius={[2, 2, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted" style={{ textAlign: 'center', padding: '1rem 0' }}>Belum ada data grafik.</p>
        )}
      </section>

      {/* 6. Recent Transaction Section */}
      <section>
        <div className="flex-between mb-3">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Transaksi Terbaru</h3>
          <button onClick={() => router.push('/transactions')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Lihat Semua</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recentTransactions.map(tx => {
            const isIncome = tx.type === 'INCOME';
            const isTransfer = tx.category.startsWith('Transfer');
            return (
              <div key={tx.id} className="card-glass" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: isIncome ? 'rgba(34, 197, 94, 0.1)' : isTransfer ? 'rgba(139, 92, 246, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: isIncome ? 'var(--color-success)' : isTransfer ? 'var(--color-secondary)' : 'var(--color-danger)', padding: '0.4rem', borderRadius: '50%' }}>
                  {isIncome ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tx.description}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{tx.category}</p>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isIncome ? 'var(--color-success)' : 'var(--color-text)' }}>
                  {isIncome ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                </div>
              </div>
            );
          })}
          {recentTransactions.length === 0 && (
            <p className="text-xs text-muted" style={{ textAlign: 'center', padding: '1rem 0' }}>Belum ada riwayat.</p>
          )}
        </div>
      </section>

    </div>
  );
}
