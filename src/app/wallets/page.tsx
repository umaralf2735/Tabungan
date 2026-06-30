'use client';
import { useEffect, useState } from 'react';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', balance: '' });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
      setUser(userData);
      fetchWallets(userData.id);
    }
  }, []);

  const fetchWallets = async (userId: string) => {
    const res = await fetch(`/api/wallets?userId=${userId}`);
    const data = await res.json();
    if(Array.isArray(data)) setWallets(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, balance: parseFloat(formData.balance), userId: user.id })
    });
    setShowForm(false);
    setFormData({ name: '', balance: '' });
    fetchWallets(user.id);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Hapus dompet ini? Seluruh transaksi di dalamnya akan terhapus juga.')) return;
    await fetch(`/api/wallets?id=${id}`, { method: 'DELETE' });
    fetchWallets(user.id);
  };

  return (
    <div className="animate-fade-in">
      {/* Header Compact */}
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Dompet Anda</h2>
          <p className="text-xs text-muted">Kelola saldo berbagai rekening</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Batal' : '+ Tambah'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input type="text" placeholder="Nama Dompet (mis: BCA, Cash, DANA)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }} />
          <input type="number" placeholder="Saldo Awal (Rp)" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }} />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>Simpan Dompet</button>
        </form>
      )}

      {/* Wallet Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {wallets.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            <p className="text-sm">Belum ada dompet.</p>
          </div>
        ) : (
          wallets.map((w, index) => {
            // Memberikan variasi warna untuk masing-masing dompet
            const colors = [
              'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(15,23,42,0.9))', // Blue
              'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(15,23,42,0.9))', // Purple
              'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(15,23,42,0.9))', // Green
              'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(15,23,42,0.9))'  // Red
            ];
            const bgGradient = colors[index % colors.length];

            return (
              <div key={w.id} className="card-glass" style={{ background: bgGradient, position: 'relative', overflow: 'hidden', padding: '1.25rem' }}>
                <div className="flex-between mb-2">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{w.name}</h3>
                  <button onClick={() => handleDelete(w.id)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}>Hapus</button>
                </div>
                <p className="text-xs text-muted mb-1">Total Saldo</p>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  Rp {w.balance.toLocaleString('id-ID')}
                </h2>
                
                {/* Dekorasi chip ala kartu fisik */}
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', opacity: 0.5 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
