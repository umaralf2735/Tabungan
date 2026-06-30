'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setTransactions(data);
      });
  }, [router]);

  if (!user) return <div style={{ padding: '2rem' }}>Memuat...</div>;

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Siapkan data untuk Pie Chart (Hanya Pengeluaran per Kategori)
  const expensesByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  // Peringatan budget sederhana
  const isBudgetWarning = totalExpense > totalIncome * 0.8 && totalIncome > 0;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Overview</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Selamat datang kembali, {user.name}!</p>
        </div>
        <button onClick={() => router.push('/transactions')} className="btn-primary">+ Tambah Transaksi</button>
      </header>

      {isBudgetWarning && (
        <div className="card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', marginBottom: '2rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Peringatan: Pengeluaran Anda sudah melebihi 80% dari pemasukan bulan ini. Yuk hemat!</p>
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Total Saldo</p>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Rp {balance.toLocaleString('id-ID')}</h3>
        </div>
        <div className="card">
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Pemasukan (Bulan Ini)</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)' }}>+Rp {totalIncome.toLocaleString('id-ID')}</h3>
        </div>
        <div className="card">
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Pengeluaran (Bulan Ini)</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>-Rp {totalExpense.toLocaleString('id-ID')}</h3>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <section className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Alokasi Pengeluaran</h3>
          {pieData.length > 0 ? (
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {pieData.map((entry, index) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '3rem' }}>Belum ada data pengeluaran.</p>
          )}
        </section>

        <section className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Transaksi Terbaru</h3>
          {transactions.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada transaksi.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', transition: 'background 0.2s', ...({':hover': {background: 'rgba(0,0,0,0.02)'}}) }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: tx.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      {tx.type === 'INCOME' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600 }}>{tx.description}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{tx.category} • {new Date(tx.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 700, color: tx.type === 'INCOME' ? 'var(--color-success)' : 'var(--color-text)' }}>
                    {tx.type === 'INCOME' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
