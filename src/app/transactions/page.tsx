'use client';
import { useEffect, useState } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ description: '', amount: '', type: 'EXPENSE', category: 'Food', paymentMethod: 'Cash', walletId: '' });

  useEffect(() => {
    fetchTransactions();
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    const res = await fetch(`/api/wallets?userId=${user.id}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setWallets(data);
      if (data.length > 0) setFormData(prev => ({ ...prev, walletId: data[0].id }));
    }
  };

  const fetchTransactions = async () => {
    const res = await fetch('/api/transactions');
    const data = await res.json();
    if (Array.isArray(data)) setTransactions(data);
  };

  const handleEdit = (tx: any) => {
    setEditingId(tx.id);
    setFormData({ description: tx.description, amount: tx.amount.toString(), type: tx.type, category: tx.category, paymentMethod: tx.paymentMethod, walletId: tx.walletId || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (editingId) {
      await fetch(`/api/transactions/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
      });
    } else {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount), userId: user.id })
      });
    }
    
    setShowForm(false);
    setEditingId(null);
    setFormData({ description: '', amount: '', type: 'EXPENSE', category: 'Food', paymentMethod: 'Cash', walletId: wallets.length > 0 ? wallets[0].id : '' });
    fetchTransactions();
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Transaksi</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Kelola semua riwayat pemasukan dan pengeluaran kamu.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ description: '', amount: '', type: 'EXPENSE', category: 'Food', paymentMethod: 'Cash', walletId: wallets.length > 0 ? wallets[0].id : '' }); }} className="btn-primary">
          {showForm ? 'Batal' : '+ Tambah Transaksi'}
        </button>
      </header>

      {showForm && (
        <section className="card animate-fade-in" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.25rem' }}>{editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Deskripsi</label>
              <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Jumlah (Rp)</label>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Tipe</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }}>
                <option value="EXPENSE">Pengeluaran</option>
                <option value="INCOME">Pemasukan</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Kategori</label>
              <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Pilih Dompet (Wallet)</label>
              <select required value={formData.walletId} onChange={e => setFormData({...formData, walletId: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text)' }}>
                <option value="" disabled>-- Pilih Dompet --</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">{editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}</button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>Tanggal</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>Deskripsi</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>Kategori</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)', textAlign: 'right' }}>Jumlah</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-muted)', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem 0' }}>{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                <td style={{ padding: '1rem 0', fontWeight: 500 }}>{tx.description}</td>
                <td style={{ padding: '1rem 0' }}>
                  <span style={{ backgroundColor: 'var(--color-bg-base)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.875rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                    {tx.category}
                  </span>
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 700, color: tx.type === 'INCOME' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {tx.type === 'INCOME' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(tx)} className="btn-icon" title="Edit" style={{ marginRight: '0.5rem' }}>✏️</button>
                  <button onClick={() => handleDelete(tx.id)} className="btn-icon" title="Hapus">🗑️</button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>Belum ada data transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}
