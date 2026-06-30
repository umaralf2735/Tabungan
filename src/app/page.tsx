'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

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

  if (!user) return <div style={{ padding: '2rem' }}>Memuat Sistem...</div>;

  // Kalkulasi Saldo
  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const currentMonthTransactions = transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth() && new Date(t.date).getFullYear() === new Date().getFullYear());
  const totalIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  // Analisis Insight Otomatis
  let insightMessage = "Belum cukup data transaksi bulan ini untuk dianalisis.";
  let insightColor = "var(--color-primary)";
  
  if (currentMonthTransactions.length > 0) {
    const expensesByCategory = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCategory = Object.keys(expensesByCategory).reduce((a, b) => expensesByCategory[a] > expensesByCategory[b] ? a : b, "");
    
    if (totalExpense > totalIncome && totalIncome > 0) {
      insightMessage = `⚠️ Peringatan: Pengeluaranmu bulan ini (Rp ${totalExpense.toLocaleString('id-ID')}) melebihi pemasukan (Rp ${totalIncome.toLocaleString('id-ID')})! Kategori paling boros adalah "${maxCategory}". Kurangi pengeluaran di sektor ini.`;
      insightColor = "var(--color-danger)";
    } else if (maxCategory) {
      insightMessage = `💡 Insight: Pengeluaran terbesarmu bulan ini ada di kategori "${maxCategory}" (Rp ${expensesByCategory[maxCategory].toLocaleString('id-ID')}). Tetap kontrol pengeluaran agar uangmu bisa ditabung!`;
      insightColor = "var(--color-secondary)";
    } else if (totalIncome > 0 && totalExpense === 0) {
      insightMessage = `🌟 Luar biasa! Bulan ini semua pemasukan utuh dan belum ada pengeluaran. Sempurna untuk ditabung!`;
      insightColor = "var(--color-success)";
    }
  }

  // Siapkan data untuk Pie Chart (Hanya Pengeluaran per Kategori)
  const allExpensesByCategory = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(allExpensesByCategory).map(key => ({
    name: key,
    value: allExpensesByCategory[key]
  }));

  // Data Bar Chart (Bulan per Bulan untuk Pemasukan vs Pengeluaran)
  const monthlyDataMap: Record<string, { name: string, Pemasukan: number, Pengeluaran: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthlyDataMap[key]) {
      monthlyDataMap[key] = { name: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`, Pemasukan: 0, Pengeluaran: 0 };
    }
    if (t.type === 'INCOME') monthlyDataMap[key].Pemasukan += t.amount;
    if (t.type === 'EXPENSE') monthlyDataMap[key].Pengeluaran += t.amount;
  });
  
  // Ambil 6 bulan terakhir
  const barData = Object.values(monthlyDataMap).reverse().slice(0, 6).reverse();

  // Warna Neon untuk grafik
  const COLORS = ['#2563EB', '#8B5CF6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Dashboard</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Selamat datang kembali, {user.name}!</p>
        </div>
        <button onClick={() => router.push('/transactions')} className="btn-primary">+ Tambah Transaksi</button>
      </header>

      {/* AI Insight Box */}
      <div className="card animate-fade-in" style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          border: `1px solid ${insightColor}`,
          boxShadow: `0 0 20px ${insightColor}22`
        }}>
        <div style={{ fontSize: '2rem', padding: '1rem', backgroundColor: `${insightColor}22`, borderRadius: '50%' }}>
          🤖
        </div>
        <div>
          <h4 style={{ color: insightColor, fontWeight: 700, marginBottom: '0.25rem' }}>AI Insight Otomatis</h4>
          <p style={{ color: 'var(--color-text)' }}>{insightMessage}</p>
        </div>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(37,99,235,0.3)' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Total Kekayaan (Dari Dompet)</p>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Rp {totalWalletBalance.toLocaleString('id-ID')}</h3>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Grafik Bar Pemasukan vs Pengeluaran */}
        <section className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Arus Kas (6 Bulan Terakhir)</h3>
          {barData.length > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-base)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'white' }}
                    itemStyle={{ color: 'white' }}
                    formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Pemasukan" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '3rem' }}>Belum ada data untuk grafik arus kas.</p>
          )}
        </section>

        {/* Grafik Pie Alokasi Pengeluaran */}
        <section className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Alokasi Pengeluaran (Total)</h3>
          {pieData.length > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0px 0px 5px ${COLORS[index % COLORS.length]}88)` }} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-base)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'white' }}
                    itemStyle={{ color: 'white' }}
                    formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {pieData.map((entry, index) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 5px ${COLORS[index % COLORS.length]}` }}></div>
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '3rem' }}>Belum ada data pengeluaran.</p>
          )}
        </section>
      </div>

    </div>
  );
}
