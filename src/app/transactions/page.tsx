'use client';
import { useEffect, useState } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isTransferMode, setIsTransferMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [formData, setFormData] = useState({ amount: '', type: 'EXPENSE', category: '', description: '', date: '', walletId: '' });
  const [transferData, setTransferData] = useState({ fromWalletId: '', toWalletId: '', amount: '', description: 'Transfer antar dompet' });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
      setUser(userData);
      fetchData(userData.id);
    }
  }, []);

  const fetchData = async (userId: string) => {
    try {
      const [txRes, walletRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch(`/api/wallets?userId=${userId}`)
      ]);
      const txData = await txRes.json();
      const walletData = await walletRes.json();
      if(Array.isArray(txData)) setTransactions(txData);
      if(Array.isArray(walletData)) {
        setWallets(walletData);
        if (walletData.length > 0) {
          setFormData(prev => ({ ...prev, walletId: walletData[0].id }));
          setTransferData(prev => ({ ...prev, fromWalletId: walletData[0].id, toWalletId: walletData.length > 1 ? walletData[1].id : '' }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(isTransferMode) {
      await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...transferData, amount: parseFloat(transferData.amount), userId: user.id })
      });
    } else {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, description: formData.category, amount: parseFloat(formData.amount), userId: user.id, date: formData.date ? new Date(formData.date).toISOString() : undefined })
      });
    }
    setShowForm(false);
    fetchData(user.id);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Hapus transaksi?')) return;
    await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
    fetchData(user.id);
  };

  const filteredTransactions = transactions.filter(t => {
    if(filterType !== 'ALL' && t.type !== filterType && !(filterType === 'TRANSFER' && t.category.startsWith('Transfer'))) return false;
    if(search && !t.description?.toLowerCase().includes(search.toLowerCase()) && !t.category?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      {/* Compact Header */}
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Transaksi</h2>
          <p className="text-xs text-muted">Kelola transaksi keuangan Anda</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Batal' : '+ Tambah'}
        </button>
      </div>

      {/* Form (Compact) */}
      {showForm && (
        <form onSubmit={handleSave} className="card mb-4">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button type="button" onClick={() => setIsTransferMode(false)} style={{ flex: 1, padding: '0.5rem', background: !isTransferMode ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: 'white', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.8rem', fontWeight: 600 }}>Biasa</button>
            <button type="button" onClick={() => setIsTransferMode(true)} style={{ flex: 1, padding: '0.5rem', background: isTransferMode ? 'var(--color-secondary)' : 'rgba(255,255,255,0.05)', color: 'white', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.8rem', fontWeight: 600 }}>Transfer Dompet</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {!isTransferMode ? (
              <>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <option value="EXPENSE">Pengeluaran</option>
                  <option value="INCOME">Pemasukan</option>
                </select>
                <input type="number" placeholder="Nominal (Rp)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Kategori (Misal: Makanan, Bensin)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }} />
                <select value={formData.walletId} onChange={e => setFormData({...formData, walletId: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</option>)}
                </select>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', colorScheme: 'dark' }} />
              </>
            ) : (
              <>
                <select value={transferData.fromWalletId} onChange={e => setTransferData({...transferData, fromWalletId: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <option value="">Dari Dompet...</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select value={transferData.toWalletId} onChange={e => setTransferData({...transferData, toWalletId: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <option value="">Ke Dompet...</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <input type="number" placeholder="Nominal (Rp)" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} required style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }} />
              </>
            )}
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>Simpan</button>
          </div>
        </form>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Cari transaksi..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.6rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '99px', fontSize: '0.8rem' }}
        />
        <select 
          value={filterType} 
          onChange={e => setFilterType(e.target.value)}
          style={{ padding: '0.6rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '99px', fontSize: '0.8rem' }}
        >
          <option value="ALL">Semua</option>
          <option value="INCOME">Masuk</option>
          <option value="EXPENSE">Keluar</option>
          <option value="TRANSFER">Transfer</option>
        </select>
      </div>

      {/* Transaction List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <p className="text-sm">Belum ada transaksi</p>
          </div>
        ) : (
          filteredTransactions.map(tx => {
            const isIncome = tx.type === 'INCOME';
            const isTransfer = tx.category.startsWith('Transfer');
            const walletName = wallets.find(w => w.id === tx.walletId)?.name || '';
            
            return (
              <div key={tx.id} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                <div style={{ background: isIncome ? 'rgba(34, 197, 94, 0.1)' : isTransfer ? 'rgba(139, 92, 246, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: isIncome ? 'var(--color-success)' : isTransfer ? 'var(--color-secondary)' : 'var(--color-danger)', padding: '0.5rem', borderRadius: '50%' }}>
                  {isIncome ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{tx.description || tx.category}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{tx.description !== tx.category ? `${tx.category} • ` : ''}{new Date(tx.date).toLocaleDateString('id-ID')} {walletName && `• ${walletName}`}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isIncome ? 'var(--color-success)' : 'var(--color-text)' }}>
                    {isIncome ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                  </div>
                  <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.7rem', cursor: 'pointer', marginTop: '0.2rem' }}>
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
