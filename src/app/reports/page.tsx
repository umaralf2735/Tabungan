'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
      setUser(userData);
      fetchTransactions();
    }
  }, []);

  const fetchTransactions = async () => {
    const res = await fetch('/api/transactions');
    const data = await res.json();
    if (Array.isArray(data)) setTransactions(data);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return alert('Tidak ada data untuk diexport.');
    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah (Rp)'];
    const rows = transactions.map(tx => {
      const date = new Date(tx.date).toLocaleDateString('id-ID');
      const desc = `"${(tx.description || '').replace(/"/g, '""')}"`;
      const cat = `"${tx.category}"`;
      const type = tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran';
      const amount = tx.amount;
      return [date, desc, cat, type, amount].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_${user?.name || 'FinanceFlow'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const realTransactions = transactions.filter(t => !t.category.startsWith('Transfer'));
  const currentMonthTransactions = realTransactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth());
  
  const totalIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpense;

  const monthlyDataMap: Record<string, { name: string, Masuk: number, Keluar: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  realTransactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthlyDataMap[key]) monthlyDataMap[key] = { name: monthNames[d.getMonth()], Masuk: 0, Keluar: 0 };
    if (t.type === 'INCOME') monthlyDataMap[key].Masuk += t.amount;
    if (t.type === 'EXPENSE') monthlyDataMap[key].Keluar += t.amount;
  });
  const barData = Object.values(monthlyDataMap).slice(-6);

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Laporan</h2>
          <p className="text-xs text-muted">Ringkasan bulan ini</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="card-glass" style={{ padding: '1rem' }}>
          <p className="text-xs text-muted mb-1">Total Pemasukan</p>
          <h3 className="text-success" style={{ fontSize: '1.1rem', fontWeight: 700 }}>+Rp {totalIncome.toLocaleString('id-ID')}</h3>
        </div>
        <div className="card-glass" style={{ padding: '1rem' }}>
          <p className="text-xs text-muted mb-1">Total Pengeluaran</p>
          <h3 className="text-danger" style={{ fontSize: '1.1rem', fontWeight: 700 }}>-Rp {totalExpense.toLocaleString('id-ID')}</h3>
        </div>
        <div className="card-glass" style={{ padding: '1rem' }}>
          <p className="text-xs text-muted mb-1">Terselamatkan</p>
          <h3 className="text-primary" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Rp {savings.toLocaleString('id-ID')}</h3>
        </div>
        <button onClick={handleExportCSV} className="card-glass" style={{ padding: '1rem', border: '1px solid var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(37,99,235,0.1)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary)', marginBottom: '0.25rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>Export CSV</span>
        </button>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>Arus Kas (6 Bulan Terakhir)</h3>
        {barData.length > 0 ? (
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Bar dataKey="Masuk" fill="var(--color-success)" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="Keluar" fill="var(--color-danger)" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>Belum ada data grafik.</p>
        )}
      </div>
    </div>
  );
}
