'use client';
import { useEffect, useState } from 'react';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [formData, setFormData] = useState({ category: 'Food', amount: '', month: selectedMonth, year: selectedYear });

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const fetchBudgets = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    const res = await fetch(`/api/budgets?userId=${user.id}&month=${selectedMonth}&year=${selectedYear}`);
    const data = await res.json();
    if (Array.isArray(data)) setBudgets(data);
  };

  const handleEdit = (b: any) => {
    setEditingId(b.id);
    setFormData({ category: b.category, amount: b.amount.toString(), month: b.month, year: b.year });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus budget ini?')) {
      await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      fetchBudgets();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/budgets/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
        });
      } else {
        res = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount), userId: user.id })
        });
      }
      
      const data = await res.json();
      if (!res.ok) {
        alert('Gagal: ' + (data.error || 'Terjadi kesalahan'));
        return;
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ category: 'Food', amount: '', month: selectedMonth, year: selectedYear });
      fetchBudgets();
    } catch (error) {
      alert('Terjadi kesalahan jaringan atau server.');
    }
  };

  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="animate-fade-in">
      {/* Header Compact */}
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Anggaran</h2>
          <p className="text-xs text-muted">Pantau batas pengeluaran</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ category: 'Food', amount: '', month: selectedMonth, year: selectedYear }); }} className="btn-primary">
          {showForm ? 'Batal' : '+ Buat Budget'}
        </button>
      </div>

      {/* Filter Compact */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.8rem' }}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ width: '80px', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.8rem', textAlign: 'center' }} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{editingId ? 'Edit Anggaran' : 'Buat Anggaran Baru'}</h3>
          <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)', fontSize: '0.85rem' }} placeholder="Kategori (Cth: Makanan, Transport)" />
          <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)', fontSize: '0.85rem' }} placeholder="Batas Maksimal (Rp)" />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>{editingId ? 'Simpan' : 'Buat Anggaran'}</button>
        </form>
      )}

      {/* List Card Anggaran */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {budgets.map(b => {
          const percentage = Math.min((b.spent / b.amount) * 100, 100);
          let statusColor = 'var(--color-primary)';
          let statusGlow = 'rgba(37, 99, 235, 0.4)';
          let statusText = 'Aman';
          
          if (percentage >= 100) {
            statusColor = 'var(--color-danger)';
            statusGlow = 'rgba(244, 63, 94, 0.4)';
            statusText = 'Over Budget!';
          } else if (percentage >= 80) {
            statusColor = '#f59e0b';
            statusGlow = 'rgba(245, 158, 11, 0.4)';
            statusText = 'Hati-hati (Mendekati Limit)';
          }

          return (
            <div key={b.id} className="card-glass" style={{ padding: '1rem' }}>
              <div className="flex-between mb-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '50%', color: 'var(--color-text)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{b.category}</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(b)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.8rem', cursor: 'pointer' }}>Hapus</button>
                </div>
              </div>
              
              <div>
                <div className="flex-between mb-2 text-xs">
                  <span className="text-muted">Terpakai: <strong className="text-white">Rp {b.spent.toLocaleString('id-ID')}</strong></span>
                  <span className="text-muted">Batas: <strong>Rp {b.amount.toLocaleString('id-ID')}</strong></span>
                </div>
                
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: statusColor, boxShadow: `0 0 8px ${statusGlow}`, borderRadius: '99px', transition: 'width 0.5s ease' }}></div>
                </div>
                
                <div className="flex-between" style={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>
                  <span style={{ color: statusColor, fontWeight: 600 }}>{statusText}</span>
                  <span style={{ fontWeight: 700 }}>{percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <p className="text-sm">Belum ada anggaran.</p>
          </div>
        )}
      </div>
    </div>
  );
}
