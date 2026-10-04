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
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* HEADER HERO */}
      <header className="flex-between mb-4 mt-2">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Wallets</h1>
          <p className="text-sm text-muted mt-1">Kelola metode pembayaran Anda</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '16px' }}>
          {showForm ? 'Batal' : '+ Tambah'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSave} className="card-glass mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', maxWidth: '500px' }}>
          <h3 className="font-bold text-sm mb-2">Dompet Baru</h3>
          <div>
            <label className="text-xs text-muted mb-1" style={{ display: 'block', fontWeight: 600 }}>Nama Dompet / Bank</label>
            <input type="text" placeholder="mis: BCA, Mandiri, DANA, Tunai" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs text-muted mb-1" style={{ display: 'block', fontWeight: 600 }}>Saldo Awal (Rp)</label>
            <input type="number" placeholder="0" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} required />
          </div>
          <button type="submit" className="btn-primary mt-2" style={{ width: '100%', padding: '14px' }}>Simpan Dompet</button>
        </form>
      )}

      {/* WALLET CARDS LIST (Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
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
            const fakeLast4 = w.id.substring(w.id.length - 4).toUpperCase();

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
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em' }}>**** **** **** {fakeLast4}</p>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 4c2.5 0 4.5 2 4.5 4.5S11 13 8.5 13"></path>
                    <path d="M12.5 4c3.5 0 6.5 3 6.5 6.5S16 17 12.5 17"></path>
                    <path d="M16.5 4C21 4 24 7.5 24 12s-3 8-7.5 8"></path>
                    <path d="M4.5 8.5C5.5 8.5 6 9 6 10s-.5 1.5-1.5 1.5S3 11 3 10s.5-1.5 1.5-1.5z"></path>
                  </svg>
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Saldo Aktif</p>
                    <h2 className="font-extrabold" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                      Rp {w.balance.toLocaleString('id-ID')}
                    </h2>
                  </div>
                  <button onClick={() => handleDelete(w.id)} style={{ 
                    background: 'rgba(239, 68, 68, 0.2)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    color: 'var(--color-danger)', 
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
