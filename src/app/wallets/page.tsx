'use client';
import { useEffect, useState } from 'react';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', balance: '' });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    const res = await fetch(`/api/wallets?userId=${user.id}`);
    const data = await res.json();
    if (Array.isArray(data)) setWallets(data);
  };

  const handleEdit = (w: any) => {
    setEditingId(w.id);
    setFormData({ name: w.name, balance: w.balance.toString() });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus dompet ini? Transaksi di dalamnya mungkin terpengaruh.')) {
      await fetch(`/api/wallets/${id}`, { method: 'DELETE' });
      fetchWallets();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/wallets/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, balance: parseFloat(formData.balance) })
        });
      } else {
        res = await fetch('/api/wallets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, balance: parseFloat(formData.balance), userId: user.id })
        });
      }
      
      const data = await res.json();
      if (!res.ok) {
        alert('Gagal: ' + (data.error || 'Terjadi kesalahan'));
        return;
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', balance: '' });
      fetchWallets();
    } catch (error) {
      alert('Terjadi kesalahan jaringan atau server.');
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Multi Wallet</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Pisahkan saldo kas, bank, dan e-wallet Anda.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', balance: '' }); }} className="btn-primary">
          {showForm ? 'Batal' : '+ Tambah Dompet'}
        </button>
      </header>

      {showForm && (
        <section className="card animate-fade-in" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.25rem' }}>{editingId ? 'Edit Dompet' : 'Tambah Dompet Baru'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nama Dompet (cth: BCA, GoPay)</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Saldo Awal (Rp)</label>
              <input type="number" required value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">{editingId ? 'Simpan Perubahan' : 'Buat Dompet'}</button>
            </div>
          </form>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {wallets.map(w => (
          <div key={w.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{w.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Saldo Saat Ini</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>Rp {w.balance.toLocaleString('id-ID')}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <button onClick={() => handleEdit(w)} className="btn-icon" title="Edit">✏️</button>
              <button onClick={() => handleDelete(w.id)} className="btn-icon" style={{ color: 'var(--color-danger)' }} title="Hapus">🗑️</button>
            </div>
          </div>
        ))}
        {wallets.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada dompet yang dibuat. Yuk, buat dompet pertamamu!</p>
          </div>
        )}
      </div>
    </div>
  );
}
