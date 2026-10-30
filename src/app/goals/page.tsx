'use client';
import { useEffect, useState } from 'react';
import { apiFetch, getApiError } from '@/lib/api';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', targetAmount: '', targetDate: '' });
  
  // State untuk modal top-up
  const [topUpId, setTopUpId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const res = await apiFetch('/api/goals');
    const data = await res.json();
    if (Array.isArray(data)) setGoals(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const res = await apiFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount)
      })
    });
    const apiError = await getApiError(res, 'Target gagal disimpan.');
    if (apiError) {
      setError(apiError);
      return;
    }
    
    setShowForm(false);
    setFormData({ name: '', targetAmount: '', targetDate: '' });
    fetchGoals();
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpId) return;
    
    setError('');
    const res = await apiFetch(`/api/goals/${topUpId}`, {
      method: 'PATCH',
      body: JSON.stringify({ amountToAdd: parseFloat(topUpAmount) })
    });
    const apiError = await getApiError(res, 'Saldo target gagal ditambah.');
    if (apiError) setError(apiError);
    
    setTopUpId(null);
    setTopUpAmount('');
    fetchGoals();
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Target Tabungan</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Lacak progres menabungmu untuk mencapai tujuan finansial.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Batal' : '+ Buat Target Baru'}
        </button>
      </header>

      {error && (
        <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {showForm && (
        <section className="card animate-fade-in" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.25rem' }}>Tambah Target Tabungan</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="goal-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nama Target</label>
              <input id="goal-name" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }} />
            </div>
            <div>
              <label htmlFor="goal-amount" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Jumlah Target (Rp)</label>
              <input id="goal-amount" type="number" min="1" inputMode="numeric" required value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }} />
            </div>
            <div>
              <label htmlFor="goal-date" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Tenggat Waktu</label>
              <input id="goal-date" type="date" required value={formData.targetDate} onChange={e => setFormData({...formData, targetDate: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">Simpan Target</button>
            </div>
          </form>
        </section>
      )}

      {/* Modal Top Up */}
      {topUpId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div role="dialog" aria-modal="true" aria-labelledby="goal-topup-title" className="card animate-fade-in" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 id="goal-topup-title" style={{ marginBottom: '1rem', fontWeight: 700 }}>Tambah Saldo Tabungan</h3>
            <form onSubmit={handleTopUp}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="goal-topup" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nominal (Rp)</label>
                <input id="goal-topup" type="number" min="1" inputMode="numeric" required value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }} autoFocus />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setTopUpId(null)} className="tap-target" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Batal</button>
                <button type="submit" className="btn-primary">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(350px, 100%), 1fr))', gap: '1.5rem' }}>
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <div key={goal.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{goal.name}</h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-base)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                  {new Date(goal.targetDate).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-primary-text)' }}>
                  Rp {goal.currentAmount.toLocaleString('id-ID')}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  dari Rp {goal.targetAmount.toLocaleString('id-ID')}
                </p>
              </div>
              
              <div style={{ backgroundColor: 'var(--color-bg-base)', height: '12px', borderRadius: '999px', overflow: 'hidden', marginBottom: '1rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ width: `${progress}%`, background: progress >= 100 ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', height: '100%', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: progress >= 100 ? 'var(--color-success)' : 'inherit' }}>
                  {progress.toFixed(1)}% Terkumpul {progress >= 100 && '🎉'}
                </p>
                {progress < 100 && (
                  <button onClick={() => setTopUpId(goal.id)} className="btn-primary tap-target" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    + Top Up
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Belum ada target tabungan.</p>
        )}
      </section>
    </div>
  );
}
