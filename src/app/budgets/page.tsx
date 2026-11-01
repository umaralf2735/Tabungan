'use client';
import { useEffect, useState } from 'react';
import { apiFetch, getApiError } from '@/lib/api';
import CustomSelect from '@/components/CustomSelect';
import BackButton from '@/components/BackButton';

const QUICK_CATEGORIES = ['Makanan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan'];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [formData, setFormData] = useState({ category: '', amount: '', month: selectedMonth, year: selectedYear });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const fetchBudgets = async () => {
    const res = await apiFetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`);
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
      const res = await apiFetch(`/api/budgets/${id}`, { method: 'DELETE' });
      const apiError = await getApiError(res, 'Anggaran gagal dihapus.');
      if (apiError) setError(apiError);
      fetchBudgets();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      let res;
      if (editingId) {
        res = await apiFetch(`/api/budgets/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
        });
      } else {
        res = await apiFetch('/api/budgets', {
          method: 'POST',
          body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
        });
      }
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Anggaran gagal disimpan.');
        return;
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ category: '', amount: '', month: selectedMonth, year: selectedYear });
      fetchBudgets();
    } catch (error) {
      setError('Tidak dapat terhubung ke server. Data belum tersimpan.');
    }
  };

  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="animate-fade-in">
      {/* Header Compact */}
      <div className="flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Anggaran</h2>
            <p className="text-xs text-muted">Pantau batas pengeluaran</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ category: '', amount: '', month: selectedMonth, year: selectedYear }); }} className="btn-primary tap-target">
          {showForm ? 'Batal' : '+ Buat Budget'}
        </button>
      </div>

      {/* Filter Compact */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
        <CustomSelect
          ariaLabel="Bulan"
          value={selectedMonth.toString()}
          onChange={val => setSelectedMonth(parseInt(val))}
          style={{ flex: 1 }}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          }
          options={MONTHS.map((m, i) => ({
            value: (i + 1).toString(),
            label: m,
          }))}
        />
        <input aria-label="Tahun" type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ width: '92px', padding: '12px 10px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(6, 10, 25, 0.55)', color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }} />
      </div>

      {error && (
        <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{editingId ? 'Edit Anggaran' : 'Buat Anggaran Baru'}</h3>
          <label htmlFor="budget-category" className="text-xs text-muted block font-bold">Kategori</label>
          <input id="budget-category" type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)', fontSize: '0.85rem' }} />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {QUICK_CATEGORIES.map(chip => (
              <button key={chip} type="button" aria-pressed={formData.category === chip} onClick={() => setFormData({...formData, category: chip})} className="tap-target" style={{ background: formData.category === chip ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)', color: formData.category === chip ? '#fff' : 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{chip}</button>
            ))}
          </div>
          <label htmlFor="budget-amount" className="text-xs text-muted block font-bold">Batas Maksimal (Rp)</label>
          <input id="budget-amount" type="number" min="1" inputMode="numeric" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)', fontSize: '0.85rem' }} />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>{editingId ? 'Simpan' : 'Buat Anggaran'}</button>
        </form>
      )}

      {/* List Card Anggaran */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {budgets.map(b => {
          const percentage = Math.min((b.spent / b.amount) * 100, 100);
          let statusColor = 'var(--color-primary-text)';
          let statusGlow = 'rgba(37, 99, 235, 0.4)';
          let statusText = 'Aman';
          
          if (percentage >= 100) {
            statusColor = 'var(--color-danger)';
            statusGlow = 'rgba(244, 63, 94, 0.4)';
            statusText = 'Batas tercapai';
          } else if (percentage >= 80) {
            statusColor = '#f59e0b';
            statusGlow = 'rgba(245, 158, 11, 0.4)';
            statusText = 'Mendekati batas';
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
                  <button onClick={() => handleEdit(b)} aria-label={`Edit anggaran ${b.category}`} className="tap-target" style={{ background: 'none', border: 'none', color: 'var(--color-primary-text)', fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(b.id)} aria-label={`Hapus anggaran ${b.category}`} className="tap-target" style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.8rem', cursor: 'pointer' }}>Hapus</button>
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
