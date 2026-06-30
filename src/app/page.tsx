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

  // AI Insight
  let insightMessage = "Anda masih bisa menabung bulan ini. Pertahankan!";
  let insightColor = "var(--color-primary)";
  
  if (currentMonthTransactions.length > 0) {
    const expensesByCategory = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCategory = Object.keys(expensesByCategory).reduce((a, b) => expensesByCategory[a] > expensesByCategory[b] ? a : b, "");
    
    if (totalExpense > totalIncome && totalIncome > 0) {
      insightMessage = `Pengeluaran "${maxCategory}" cukup tinggi minggu ini.`;
      insightColor = "var(--color-danger)";
    } else if (maxCategory) {
      insightMessage = `Pengeluaran terbesar di "${maxCategory}". Tetap kontrol ya.`;
      insightColor = "var(--color-primary)";
    }
  }

  // Bar Chart Data (3 Bulan Terakhir agar compact)
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
    <div className="animate-fade-in" style={{ paddingBottom: '1rem' }}>
      
      {/* Header & Quick Action */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Selamat datang,</h2>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.name} 👋</h1>
        </div>
        <button onClick={() => router.push('/transactions')} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          + Transaksi
        </button>
      </header>

      {/* Summary Cards Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="card-glass" style={{ gridColumn: '1 / -1', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(15,23,42,0.9))' }}>
          <p className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Total Saldo Tersedia</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Rp {totalWalletBalance.toLocaleString('id-ID')}</h3>
        </div>
        <div className="card-glass" style={{ padding: '1rem' }}>
          <p className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Pemasukan</p>
          <h4 className="font-bold text-success" style={{ fontSize: '1.1rem' }}>+Rp {(totalIncome/1000).toFixed(0)}k</h4>
        </div>
        <div className="card-glass" style={{ padding: '1rem' }}>
          <p className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Pengeluaran</p>
          <h4 className="font-bold text-danger" style={{ fontSize: '1.1rem' }}>-Rp {(totalExpense/1000).toFixed(0)}k</h4>
        </div>
      </section>

      {/* AI Insight Compact */}
      <div className="card-glass animate-fade-in" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid rgba(37, 99, 235, 0.3)`, boxShadow: `0 0 15px rgba(37, 99, 235, 0.1)` }}>
        <div style={{ color: 'var(--color-primary)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        </div>
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>AI Insight</h4>
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{insightMessage}</p>
        </div>
      </div>

      {/* Arus Kas Chart */}
      <section className="card-glass" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Arus Kas</h3>
        {barData.length > 0 ? (
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Bar dataKey="Masuk" fill="var(--color-success)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Keluar" fill="var(--color-danger)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>Belum ada data grafik.</p>
        )}
      </section>

      {/* Recent Transactions */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Transaksi Terakhir</h3>
          <button onClick={() => router.push('/transactions')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}>Lihat Semua</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recentTransactions.map(tx => {
            const isIncome = tx.type === 'INCOME';
            const isTransfer = tx.category.startsWith('Transfer');
            return (
              <div key={tx.id} className="card-glass" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: isIncome ? 'rgba(34, 197, 94, 0.1)' : isTransfer ? 'rgba(139, 92, 246, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: isIncome ? 'var(--color-success)' : isTransfer ? 'var(--color-secondary)' : 'var(--color-danger)', padding: '0.5rem', borderRadius: '50%' }}>
                  {isIncome ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{tx.description}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{tx.category} • {new Date(tx.date).toLocaleDateString('id-ID')}</p>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isIncome ? 'var(--color-success)' : 'var(--color-text)' }}>
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
