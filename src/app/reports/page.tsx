'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { apiFetch } from '@/lib/api';

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
    const res = await apiFetch('/api/transactions');
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
      
      // Muat logo /favicon.png untuk bagian atas struk
      const loadLogoImage = (): Promise<HTMLImageElement | null> =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = '/favicon.png';
        });

      const logoImg = await loadLogoImage();

      // Hitung tinggi dinamis berdasarkan jumlah transaksi (maksimal 20 item untuk struk)
      const maxItems = 20;
      const txToPrint = currentFilteredTransactions.slice(0, maxItems);
      const baseHeight = 166;
      const itemHeight = txToPrint.length * 6;
      const totalHeight = Math.max(195, baseHeight + itemHeight);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, totalHeight]
      });
      
      let y = 8;
      const pageWidth = 80;
      const margin = 6;

      // Helper function untuk garis putus-putus
      const drawDashedLine = (yPos: number) => {
        doc.setDrawColor(200, 200, 200);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        doc.setLineDashPattern([], 0); // reset
      };

      // LOGO DI ATAS STRUK
      if (logoImg) {
        const logoSize = 12; // 12mm x 12mm (kecil & elegan di tengah atas)
        doc.addImage(logoImg, 'PNG', (pageWidth - logoSize) / 2, y, logoSize, logoSize);
        y += logoSize + 4.5;
      } else {
        y += 4;
      }

      // HEADER
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("FinanceFlow", pageWidth / 2, y, { align: "center" });
      
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("LAPORAN KEUANGAN PRIBADI", pageWidth / 2, y, { align: "center" });
      y += 3;
      doc.text(user?.email || "user@financeflow.com", pageWidth / 2, y, { align: "center" });
      
      y += 6;
      drawDashedLine(y);
      y += 4;

      // INFO PERIODE
      const fmtStart = new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      const fmtEnd = new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(`Periode  : ${fmtStart} - ${fmtEnd}`, margin, y);
      y += 4;
      doc.text(`Kasir    : SYSTEM AUTO`, margin, y);
      
      y += 4;
      drawDashedLine(y);
      y += 6;

      // TRANSACTIONS
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text("RINCIAN TRANSAKSI", margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      txToPrint.forEach((tx) => {
        const isInc = tx.type === 'INCOME';
        const dateStr = new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
        
        // Baris 1: Nama transaksi (Title Case rapi, tidak huruf besar semua)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        const rawLabel = (tx.description || tx.category || 'Transaksi').substring(0, 24);
        const cleanLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
        doc.text(cleanLabel, margin, y);
        
        // Nominal di kanan
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isInc ? 21 : 220, isInc ? 128 : 38, isInc ? 61 : 38); // Hijau / Merah gelap
        const amountPrefix = isInc ? '+' : '-';
        doc.text(`${amountPrefix}${tx.amount.toLocaleString('id-ID')}`, pageWidth - margin, y, { align: "right" });
        
        // Baris 2: Tanggal & Tipe/Kategori (tidak mengulang kata yang sama)
        y += 3.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        const subInfo = (!tx.description || tx.description.toLowerCase() === tx.category.toLowerCase())
          ? (isInc ? 'Pemasukan' : 'Pengeluaran')
          : tx.category;
        doc.text(`${dateStr} • ${subInfo}`, margin, y);
        
        y += 5.5;
      });

      if (currentFilteredTransactions.length > maxItems) {
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(`+ ${currentFilteredTransactions.length - maxItems} transaksi lainnya...`, pageWidth / 2, y, { align: "center" });
        y += 6;
      }

      drawDashedLine(y);
      y += 6;

      // SUMMARY
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      
      doc.text("Total Pemasukan", margin, y);
      doc.text(totalIncome.toLocaleString('id-ID'), pageWidth - margin, y, { align: "right" });
      y += 4;
      
      doc.text("Total Pengeluaran", margin, y);
      doc.text(totalExpense.toLocaleString('id-ID'), pageWidth - margin, y, { align: "right" });
      y += 4;
      
      doc.text("Total Item", margin, y);
      doc.text(currentFilteredTransactions.length.toString(), pageWidth - margin, y, { align: "right" });
      y += 6;
      
      drawDashedLine(y);
      y += 6;

      // NET BALANCE
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Sisa Bersih", margin, y);
      
      doc.setFontSize(10);
      doc.setTextColor(savings < 0 ? 220 : 15, savings < 0 ? 38 : 23, savings < 0 ? 38 : 42);
      const netFormatted = savings < 0
        ? `- Rp ${Math.abs(savings).toLocaleString('id-ID')}`
        : `Rp ${savings.toLocaleString('id-ID')}`;
      doc.text(netFormatted, pageWidth - margin, y, { align: "right" });
      y += 8;

      drawDashedLine(y);
      y += 6;

      // FOOTER
      const printDate = new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text(`Tgl Cetak: ${printDate} WIB`, pageWidth / 2, y, { align: "center" });
      
      if (user?.name) {
        y += 3.5;
        doc.text(`Pengguna: ${user.name}`, pageWidth / 2, y, { align: "center" });
      }
      
      y += 5;
      doc.setFont('helvetica', 'italic');
      doc.text("Simpan struk ini sebagai bukti laporan sah.", pageWidth / 2, y, { align: "center" });
      y += 3;
      doc.text("Terima kasih telah menggunakan FinanceFlow Pro", pageWidth / 2, y, { align: "center" });
      
      // Save
      doc.save(`Struk_Laporan_${startDate}_${endDate}.pdf`);
    } catch (error) {
      alert('Gagal membuat PDF. Pastikan module jspdf sudah terinstall.');
      console.error(error);
    }
  };

  const monthlyDataMap: Record<string, { name: string, order: number, Masuk: number, Keluar: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  realTransactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthlyDataMap[key]) monthlyDataMap[key] = { name: monthNames[d.getMonth()], order: d.getFullYear() * 12 + d.getMonth(), Masuk: 0, Keluar: 0 };
    if (t.type === 'INCOME') monthlyDataMap[key].Masuk += t.amount;
    if (t.type === 'EXPENSE') monthlyDataMap[key].Keluar += t.amount;
  });
  const barData = Object.values(monthlyDataMap).sort((a, b) => a.order - b.order).slice(-6);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* HEADER HERO */}
      <header className="flex-between mb-4 mt-2">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Laporan</h1>
          <p className="text-sm text-muted mt-1">Analisis finansial Anda</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: FILTERS, STATS, EXPORT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* DATE RANGE FILTER */}
          <div className="card-glass" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', borderRadius: '24px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="report-start" className="text-xs text-muted mb-1 block font-bold">Dari Tanggal</label>
              <input id="report-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '12px', background: 'var(--color-surface)', color: 'white', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.05)', colorScheme: 'dark' }} />
            </div>
            <div style={{ color: 'var(--color-text-muted)', paddingTop: '20px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="report-end" className="text-xs text-muted mb-1 block font-bold">Sampai Tanggal</label>
              <input id="report-end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '12px', background: 'var(--color-surface)', color: 'white', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.05)', colorScheme: 'dark' }} />
            </div>
          </div>

          {/* SUMMARY STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={savings >= 0 ? 'var(--color-primary-text)' : 'var(--color-danger)'} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* EXPORT BUTTONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button onClick={handleExportCSV} style={{ padding: '16px', borderRadius: '20px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Export CSV</span>
            </button>
            <button onClick={handleExportPDF} style={{ padding: '16px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(15,23,42,0.6))', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
              <div style={{ background: 'rgba(99,102,241,0.2)', padding: '12px', borderRadius: '50%', marginBottom: '12px', color: 'var(--color-primary-text)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F1F5F9' }}>Struk PDF (Kasir)</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Format Nota Termal</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CHART SECTION */}
        <div className="card-glass" style={{ padding: '24px 16px', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Arus Kas (6 Bulan Terakhir)</h3>
          {barData.length > 0 ? (
            <div role="img" aria-label="Grafik batang pemasukan dan pengeluaran per bulan, maksimal 6 bulan terakhir." style={{ flex: 1, width: '100%', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: '16px', fontSize: '12px', fontWeight: 600, padding: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Masuk" fill="var(--color-success)" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="Keluar" fill="var(--color-danger)" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px auto', color: 'var(--color-text-muted)', opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              <p className="text-sm font-bold text-muted">Belum ada data grafik</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
