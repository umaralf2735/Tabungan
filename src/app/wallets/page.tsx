'use client';
import { useEffect, useState } from 'react';
import { apiFetch, getApiError } from '@/lib/api';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', balance: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    const res = await apiFetch('/api/wallets');
    const data = await res.json();
    if(Array.isArray(data)) setWallets(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await apiFetch('/api/wallets', {
      method: 'POST',
      body: JSON.stringify({ ...formData, balance: parseFloat(formData.balance) })
    });
    const apiError = await getApiError(res, 'Dompet gagal disimpan.');
    if (apiError) {
      setError(apiError);
      return;
    }
    setShowForm(false);
    setFormData({ name: '', balance: '' });
    fetchWallets();
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Hapus dompet ini? Seluruh transaksi di dalamnya akan terhapus juga.')) return;
    setError('');
    const res = await apiFetch(`/api/wallets?id=${id}`, { method: 'DELETE' });
    const apiError = await getApiError(res, 'Dompet gagal dihapus.');
    if (apiError) setError(apiError);
    fetchWallets();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* HEADER HERO */}
      <header className="flex-between mb-4 mt-2">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Dompet</h1>
          <p className="text-sm text-muted mt-1">Kelola metode pembayaran Anda</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary tap-target" style={{ padding: '0.6rem 1rem', borderRadius: '16px' }}>
          {showForm ? 'Batal' : '+ Tambah'}
        </button>
      </header>

      {error && (
        <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="card-glass mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', maxWidth: '500px' }}>
          <h3 className="font-bold text-sm mb-2">Dompet Baru</h3>
          <div>
            <label htmlFor="wallet-name" className="text-xs text-muted mb-1" style={{ display: 'block', fontWeight: 600 }}>Nama Dompet / Bank</label>
            <input id="wallet-name" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label htmlFor="wallet-balance" className="text-xs text-muted mb-1" style={{ display: 'block', fontWeight: 600 }}>Saldo Awal (Rp)</label>
            <input id="wallet-balance" type="number" inputMode="numeric" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} required />
          </div>
          <button type="submit" className="btn-primary mt-2" style={{ width: '100%', padding: '14px' }}>Simpan Dompet</button>
        </form>
      )}

      {/* WALLET CARDS LIST (Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '24px' }}>
        {wallets.length === 0 ? (
          <div className="card-glass text-center p-4" style={{ padding: '60px 20px', gridColumn: '1 / -1' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px auto', color: 'var(--color-text-muted)', opacity: 0.5 }}><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            <p className="text-sm font-bold">Belum ada dompet.</p>
            <p className="text-xs text-muted mt-1">Tambahkan rekening atau dompet digital Anda.</p>
          </div>
        ) : (
          wallets.map((w, index) => {
            const colors = [
              'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)', // Midnight Blue
              'linear-gradient(135deg, #064E3B 0%, #022C22 100%)', // Emerald Dark
              'linear-gradient(135deg, #4C1D95 0%, #2E1065 100%)', // Deep Purple
              'linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)', // Ruby Red
              'linear-gradient(135deg, #0F172A 0%, #020617 100%)'  // Titanium Black
            ];
            const bgGradient = colors[index % colors.length];

            return (
              <div key={w.id} style={{ 
                background: bgGradient, 
                borderRadius: '24px', 
                padding: '24px', 
                boxShadow: 'var(--shadow-premium)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)', borderRadius: '50%', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', filter: 'blur(30px)', borderRadius: '50%', zIndex: 0 }}></div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="font-extrabold" style={{ fontSize: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{w.name}</h3>
                  </div>
                  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 4c2.5 0 4.5 2 4.5 4.5S11 13 8.5 13"></path>
                    <path d="M12.5 4c3.5 0 6.5 3 6.5 6.5S16 17 12.5 17"></path>
                    <path d="M16.5 4C21 4 24 7.5 24 12s-3 8-7.5 8"></path>
                    <path d="M4.5 8.5C5.5 8.5 6 9 6 10s-.5 1.5-1.5 1.5S3 11 3 10s.5-1.5 1.5-1.5z"></path>
                  </svg>
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Saldo Aktif</p>
                    <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                      Rp {w.balance.toLocaleString('id-ID')}
                    </h2>
                  </div>
                  <button onClick={() => handleDelete(w.id)} aria-label={`Hapus dompet ${w.name}`} className="tap-target" style={{ 
                    background: 'rgba(239, 68, 68, 0.2)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    color: '#FECDD3', 
                    padding: '8px 12px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                  }}>
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
