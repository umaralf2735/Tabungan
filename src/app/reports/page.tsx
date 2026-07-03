'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

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

  const realTransactions = transactions.filter(t => !t.category.startsWith('Transfer'));
  
  const currentFilteredTransactions = realTransactions.filter(t => {
    const tTime = new Date(t.date).getTime();
    const sTime = new Date(startDate).getTime();
    const eTime = new Date(endDate).getTime() + 86399999;
    return tTime >= sTime && tTime <= eTime;
  });
  
  const totalIncome = currentFilteredTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentFilteredTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpense;

  const handleExportCSV = () => {
    if (currentFilteredTransactions.length === 0) return alert('Tidak ada data di rentang tanggal ini.');
    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah (Rp)'];
    const rows = currentFilteredTransactions.map(tx => {
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
    link.setAttribute("download", `Laporan_${startDate}_sampai_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    if (currentFilteredTransactions.length === 0) return alert('Tidak ada transaksi di rentang tanggal ini.');
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 230] // Kertas struk panjang
      });
      
      let y = 15;

      // =========================
      // HEADER
      // =========================
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39); // Dark Gray / Black
      doc.text("FINANCEFLOW", 40, y, { align: "center" });
      
      y += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // Light Gray
      doc.text("Financial Report", 40, y, { align: "center" });
      
      y += 8;
      doc.setFontSize(8);
      doc.text("Report Period", 40, y, { align: "center" });
      
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      const fmtStart = new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      const fmtEnd = new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      doc.text(`${fmtStart} - ${fmtEnd}`, 40, y, { align: "center" });
      
      y += 8;
      doc.setDrawColor(226, 232, 240); // Divider color
      doc.line(10, y, 70, y);
      
      // =========================
      // SUMMARY
      // =========================
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Total Income", 10, y);
      
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94); // Green
      doc.text(`Rp ${totalIncome.toLocaleString('id-ID')}`, 10, y);
      
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Total Expense", 10, y);
      
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(244, 63, 94); // Red
      doc.text(`Rp ${totalExpense.toLocaleString('id-ID')}`, 10, y);
      
      y += 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(10, y, 70, y);
      
      // =========================
      // BALANCE
      // =========================
      y += 10;
      // Draw rounded rectangle
      doc.setDrawColor(226, 232, 240); // Border
      doc.setFillColor(248, 250, 252); // Soft gray background
      doc.roundedRect(10, y, 60, 30, 3, 3, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("NET BALANCE", 40, y + 8, { align: "center" });
      
      // Balance Amount
      const isNegative = savings < 0;
      doc.setFontSize(16);
      doc.setTextColor(isNegative ? 244 : 34, isNegative ? 63 : 197, isNegative ? 94 : 94);
      doc.text(`Rp ${savings.toLocaleString('id-ID')}`, 40, y + 20, { align: "center" });
      
      y += 38;
      doc.setDrawColor(226, 232, 240);
      doc.line(10, y, 70, y);
      
      // =========================
      // STATISTICS
      // =========================
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text("Summary", 10, y);
      
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`• Total Transactions: ${currentFilteredTransactions.length}`, 10, y);
      y += 5;
      doc.text(`• Total Income: Rp ${totalIncome.toLocaleString('id-ID')}`, 10, y);
      y += 5;
      doc.text(`• Total Expense: Rp ${totalExpense.toLocaleString('id-ID')}`, 10, y);
      
      y += 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(10, y, 70, y);
      
      // =========================
      // RECENT TRANSACTIONS
      // =========================
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text("Recent Transactions", 10, y);
      
      y += 8;
      
      // Ambil maksimal 5 transaksi
      const top5 = currentFilteredTransactions.slice(0, 5);
      
      top5.forEach((tx) => {
        const isInc = tx.type === 'INCOME';
        
        // Draw icon background (circle)
        doc.setFillColor(isInc ? 220 : 254, isInc ? 252 : 226, isInc ? 231 : 226); 
        doc.circle(13, y, 3, 'F');
        
        // Icon character (+ or -)
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isInc ? 34 : 244, isInc ? 197 : 63, isInc ? 94 : 94);
        doc.text(isInc ? "+" : "-", 13, y + 1, { align: "center", baseline: "middle" });
        
        // Transaction Desc & Date
        doc.setFontSize(9);
        doc.setTextColor(17, 24, 39);
        const desc = tx.description.length > 15 ? tx.description.substring(0, 15) + "..." : tx.description;
        doc.text(desc, 18, y + 1);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), 18, y + 5);
        
        // Amount
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(isInc ? 34 : 244, isInc ? 197 : 63, isInc ? 94 : 94);
        const prefix = isInc ? "+" : "-";
        doc.text(`${prefix}Rp ${tx.amount.toLocaleString('id-ID')}`, 70, y + 1, { align: "right" });
        
        y += 12;
      });
      
      if (currentFilteredTransactions.length > 5) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`+ ${currentFilteredTransactions.length - 5} more transactions`, 40, y, { align: "center" });
        y += 6;
      }
      
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(10, y, 70, y);
      
      // =========================
      // FOOTER
      // =========================
      y += 8;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Generated by FinanceFlow Pro", 40, y, { align: "center" });
      
      y += 4;
      const printDate = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      doc.text(`Print Date: ${printDate} WIB`, 40, y, { align: "center" });
      
      y += 6;
      doc.setFont('helvetica', 'italic');
      doc.text("Thank you for using FinanceFlow", 40, y, { align: "center" });
      
      doc.save(`FinanceFlow_Report_${startDate}_to_${endDate}.pdf`);
    } catch (error) {
      alert('Gagal membuat PDF. Pastikan module jspdf sudah terinstall.');
      console.error(error);
    }
  };

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
          <p className="text-xs text-muted">Ringkasan keuangan Anda</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card-glass mb-4" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Dari Tanggal</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.75rem', colorScheme: 'dark' }} />
        </div>
        <div style={{ color: 'var(--color-text-muted)' }}>-</div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Sampai Tanggal</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.75rem', colorScheme: 'dark' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div className="card-glass" style={{ padding: '1rem' }}>
          <p className="text-xs text-muted mb-1">Total Pemasukan</p>
          <h3 className="text-success" style={{ fontSize: '1.1rem', fontWeight: 700 }}>+Rp {totalIncome.toLocaleString('id-ID')}</h3>
        </div>
        <div className="card-glass" style={{ padding: '1rem' }}>
          <p className="text-xs text-muted mb-1">Total Pengeluaran</p>
          <h3 className="text-danger" style={{ fontSize: '1.1rem', fontWeight: 700 }}>-Rp {totalExpense.toLocaleString('id-ID')}</h3>
        </div>
        <div className="card-glass" style={{ gridColumn: '1 / -1', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="text-xs text-muted">Sisa Saldo (Netto)</p>
          <h3 className="text-primary" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Rp {savings.toLocaleString('id-ID')}</h3>
        </div>
      </div>

      {/* Export Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button onClick={handleExportCSV} className="card-glass" style={{ padding: '0.75rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2" style={{ marginBottom: '0.25rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text)' }}>Data Excel (CSV)</span>
        </button>
        <button onClick={handleExportPDF} className="card-glass" style={{ padding: '0.75rem', border: '1px solid var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(37,99,235,0.1)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ marginBottom: '0.25rem' }}><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-primary)' }}>Cetak Laporan PDF</span>
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
