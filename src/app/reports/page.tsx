'use client';
import { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
      setUser(userData);
      fetchTransactions();
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter out transfers for the general reports, or keep them for full audit
        setTransactions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("Tidak ada data untuk diexport.");
      return;
    }

    // 1. Buat header CSV
    let csvContent = "Tanggal,Deskripsi,Kategori,Tipe,Nominal (Rp)\n";

    // 2. Loop data transaksi
    transactions.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('id-ID');
      const desc = `"${(tx.description || '').replace(/"/g, '""')}"`; // Handle commas in description
      const cat = `"${tx.category}"`;
      const type = tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran';
      const amount = tx.amount;
      
      csvContent += `${date},${desc},${cat},${type},${amount}\n`;
    });

    // 3. Buat file Blob dan picu download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Keuangan_${user?.name || 'FinanceFlow'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Kalkulasi Summary
  const realTransactions = transactions.filter(t => !t.category.startsWith('Transfer'));
  const totalIncome = realTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = realTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const totalSaved = totalIncome - totalExpense;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Laporan & Export</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Unduh riwayat transaksi Anda ke format CSV (Excel).</p>
        </div>
        <button onClick={handleExportCSV} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📥</span> Download Laporan CSV
        </button>
      </header>

      {isLoading ? (
        <p>Memuat data...</p>
      ) : (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card">
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Total Pemasukan (All Time)</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)' }}>+Rp {totalIncome.toLocaleString('id-ID')}</h3>
            </div>
            <div className="card">
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Total Pengeluaran (All Time)</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>-Rp {totalExpense.toLocaleString('id-ID')}</h3>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Total Uang Terselamatkan</p>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Rp {totalSaved.toLocaleString('id-ID')}</h3>
            </div>
          </section>

          <section className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Siap untuk di-Audit?</h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
              Semua data transaksi Anda ({transactions.length} transaksi) tersimpan dengan aman di database. 
              Gunakan tombol di atas untuk mengunduh data dalam format CSV. 
              File CSV dapat dibuka menggunakan Microsoft Excel, Google Sheets, atau Apple Numbers untuk analisis lebih mendalam.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
