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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Anggaran Bulanan</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Pantau batas pengeluaranmu agar tidak over-budget.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', width: '100px' }} />
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ category: 'Food', amount: '', month: selectedMonth, year: selectedYear }); }} className="btn-primary">
            {showForm ? 'Batal' : '+ Buat Budget'}
          </button>
        </div>
      </header>

      {showForm && (
        <section className="card animate-fade-in" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.25rem' }}>{editingId ? 'Edit Anggaran' : 'Buat Anggaran Baru'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Kategori Pengeluaran</label>
              <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} placeholder="Cth: Food, Transport" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Batas Maksimal (Rp)</label>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">{editingId ? 'Simpan Perubahan' : 'Simpan Anggaran'}</button>
            </div>
          </form>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {budgets.map(b => {
          const percentage = Math.min((b.spent / b.amount) * 100, 100);
          let statusColor = 'var(--color-primary)';
          let statusGlow = 'rgba(37, 99, 235, 0.5)';
          let statusText = 'Aman';
          
          if (percentage >= 100) {
            statusColor = 'var(--color-danger)';
            statusGlow = 'rgba(244, 63, 94, 0.5)';
            statusText = 'Over Budget!';
          } else if (percentage >= 80) {
            statusColor = '#f59e0b'; // Warning Orange
            statusGlow = 'rgba(245, 158, 11, 0.5)';
            statusText = 'Hati-hati (Mendekati Limit)';
          }

          return (
            <div key={b.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{b.category}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(b)} className="btn-icon" title="Edit">✏️</button>
                  <button onClick={() => handleDelete(b.id)} className="btn-icon" style={{ color: 'var(--color-danger)' }} title="Hapus">🗑️</button>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Terpakai: <strong style={{ color: 'var(--color-text)' }}>Rp {b.spent.toLocaleString('id-ID')}</strong></span>
                  <span style={{ color: 'var(--color-text-muted)' }}>Batas: <strong>Rp {b.amount.toLocaleString('id-ID')}</strong></span>
                </div>
                
                {/* Progress Bar Container */}
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    backgroundColor: statusColor,
                    boxShadow: `0 0 10px ${statusGlow}`,
                    borderRadius: '999px',
                    transition: 'width 0.5s ease-in-out, background-color 0.3s ease'
                  }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ color: statusColor, fontWeight: 600 }}>{statusText}</span>
                  <span style={{ fontWeight: 700 }}>{percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada anggaran untuk bulan ini. Yuk, buat batas anggaran barumu!</p>
          </div>
        )}
      </div>
    </div>
  );
}
