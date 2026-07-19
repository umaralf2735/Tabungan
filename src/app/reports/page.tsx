'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

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
    const res = await fetch(`/api/transactions?userId=${user.id}`);
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

      // HEADER
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text("FINANCEFLOW", 40, y, { align: "center" });
      
      y += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
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
      doc.setDrawColor(226, 232, 240);
      doc.line(10, y, 70, y);
      
      // SUMMARY
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
      
      // BALANCE
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(10, y, 60, 30, 3, 3, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("NET BALANCE", 40, y + 8, { align: "center" });
      
      const isNegative = savings < 0;
      doc.setFontSize(16);
      doc.setTextColor(isNegative ? 244 : 34, isNegative ? 63 : 197, isNegative ? 94 : 94);
      doc.text(`Rp ${savings.toLocaleString('id-ID')}`, 40, y + 20, { align: "center" });
      
      y += 38;
      doc.setDrawColor(226, 232, 240);
      doc.line(10, y, 70, y);
      
      // STATISTICS
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
      
      // RECENT TRANSACTIONS
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text("Recent Transactions", 10, y);
      
      y += 8;
      const top5 = currentFilteredTransactions.slice(0, 5);
      
      top5.forEach((tx) => {
        const isInc = tx.type === 'INCOME';
        doc.setFillColor(isInc ? 220 : 254, isInc ? 252 : 226, isInc ? 231 : 226); 
        doc.circle(13, y, 3, 'F');
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isInc ? 34 : 244, isInc ? 197 : 63, isInc ? 94 : 94);
        doc.text(isInc ? "+" : "-", 13, y + 1, { align: "center", baseline: "middle" });
        
        doc.setFontSize(9);
        doc.setTextColor(17, 24, 39);
        const desc = tx.description.length > 15 ? tx.description.substring(0, 15) + "..." : tx.description;
        doc.text(desc, 18, y + 1);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), 18, y + 5);
        
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
      
      // FOOTER
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
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      {/* HEADER HERO */}
      <header className="flex-between mb-4 mt-2">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ letterSpacing: '-0.03em' }}>Laporan</h1>
          <p className="text-sm text-muted mt-1">Analisis finansial bulanan</p>
        </div>
      </header>

      {/* DATE RANGE FILTER */}
      <div className="card-glass mb-4" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', borderRadius: '24px' }}>
        <div style={{ flex: 1 }}>
          <label className="text-xs text-muted mb-1 block font-bold">Dari Tanggal</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '12px', background: 'var(--color-surface)', color: 'white', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.05)', colorScheme: 'dark' }} />
        </div>
        <div style={{ color: 'var(--color-text-muted)', paddingTop: '20px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
        </div>
        <div style={{ flex: 1 }}>
          <label className="text-xs text-muted mb-1 block font-bold">Sampai Tanggal</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '12px', background: 'var(--color-surface)', color: 'white', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.05)', colorScheme: 'dark' }} />
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-success)', padding: '8px', borderRadius: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="19 12 12 19 5 12"></polyline><line x1="12" y1="19" x2="12" y2="5"></line></svg>
            </div>
            <p className="text-muted text-xs font-bold">Pemasukan</p>
          </div>
          <h4 className="font-extrabold text-success text-lg">Rp {totalIncome.toLocaleString('id-ID')}</h4>
        </div>
        
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', padding: '8px', borderRadius: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="5 12 12 5 19 12"></polyline><line x1="12" y1="5" x2="12" y2="19"></line></svg>
            </div>
            <p className="text-muted text-xs font-bold">Pengeluaran</p>
          </div>
          <h4 className="font-extrabold text-danger text-lg">Rp {totalExpense.toLocaleString('id-ID')}</h4>
        </div>

        {/* NET BALANCE CARD */}
        <div className="card-glass" style={{ gridColumn: '1 / -1', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '150px', height: '150px', background: 'var(--color-primary)', filter: 'blur(60px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }}></div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="text-sm text-muted font-bold mb-1">Sisa Bersih (Netto)</p>
              <h3 className="font-extrabold text-2xl" style={{ color: savings >= 0 ? 'var(--color-text)' : 'var(--color-danger)' }}>
                Rp {savings.toLocaleString('id-ID')}
              </h3>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={savings >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* EXPORT BUTTONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <button onClick={handleExportCSV} style={{ padding: '16px', borderRadius: '20px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Data Excel (CSV)</span>
        </button>
        <button onClick={handleExportPDF} style={{ padding: '16px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(15,23,42,0.5))', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
          <div style={{ background: 'rgba(37,99,235,0.2)', padding: '12px', borderRadius: '50%', marginBottom: '12px', color: 'var(--color-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>Cetak Laporan PDF</span>
        </button>
      </div>

      {/* CHART SECTION */}
      <div className="card-glass" style={{ padding: '24px 16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center', letterSpacing: '-0.02em' }}>Arus Kas (6 Bulan Terakhir)</h3>
        {barData.length > 0 ? (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', fontSize: '12px', fontWeight: 600, padding: '12px' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                />
                <Bar dataKey="Masuk" fill="var(--color-success)" radius={[6, 6, 0, 0]} barSize={16} />
                <Bar dataKey="Keluar" fill="var(--color-danger)" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px auto', color: 'var(--color-text-muted)', opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <p className="text-sm font-bold text-muted">Belum ada data grafik</p>
          </div>
        )}
      </div>
    </div>
  );
}
