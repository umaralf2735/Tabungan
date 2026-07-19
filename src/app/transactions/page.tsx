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
        fetch(`/api/transactions?userId=${userId}`),
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
    if(search && !t.category?.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      {/* HEADER HERO */}
      <header className="flex-between mb-4 mt-2">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ letterSpacing: '-0.03em' }}>Aktivitas</h1>
          <p className="text-sm text-muted mt-1">Pantau semua arus kas Anda</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '16px' }}>
          {showForm ? 'Batal' : '+ Tambah'}
        </button>
      </header>

      {/* FLOATING FORM */}
      {showForm && (
        <form onSubmit={handleSave} className="card-glass mb-4" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '20px' }}>
            <button type="button" onClick={() => setIsTransferMode(false)} style={{ flex: 1, padding: '8px', background: !isTransferMode ? 'var(--color-surface)' : 'transparent', color: !isTransferMode ? 'white' : 'var(--color-text-muted)', borderRadius: '14px', border: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s' }}>Reguler</button>
            <button type="button" onClick={() => setIsTransferMode(true)} style={{ flex: 1, padding: '8px', background: isTransferMode ? 'var(--color-surface)' : 'transparent', color: isTransferMode ? 'white' : 'var(--color-text-muted)', borderRadius: '14px', border: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s' }}>Transfer</button>
          </div>
          
          {!isTransferMode ? (
            <>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Jenis</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                  <option value="EXPENSE">Pengeluaran</option>
                  <option value="INCOME">Pemasukan</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Nominal (Rp)</label>
                <input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Kategori</label>
                <input type="text" placeholder="Misal: Makanan, Gaji, Bensin" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Sumber Dana</label>
                <select value={formData.walletId} onChange={e => setFormData({...formData, walletId: e.target.value})} required>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Tanggal</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Dari Dompet</label>
                <select value={transferData.fromWalletId} onChange={e => setTransferData({...transferData, fromWalletId: e.target.value})} required>
                  <option value="">Pilih Sumber...</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Ke Dompet</label>
                <select value={transferData.toWalletId} onChange={e => setTransferData({...transferData, toWalletId: e.target.value})} required>
                  <option value="">Pilih Tujuan...</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Nominal (Rp)</label>
                <input type="number" placeholder="0" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} required />
              </div>
            </>
          )}
          <button type="submit" className="btn-primary mt-2" style={{ width: '100%', padding: '14px' }}>Simpan Transaksi</button>
        </form>
      )}

      {/* FILTER & SEARCH (Floating style) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '40px', borderRadius: '20px', background: 'var(--color-surface)' }}
          />
        </div>
        <select 
          value={filterType} 
          onChange={e => setFilterType(e.target.value)}
          style={{ width: '120px', borderRadius: '20px', background: 'var(--color-surface)', fontSize: '0.85rem' }}
        >
          <option value="ALL">Semua</option>
          <option value="INCOME">Masuk</option>
          <option value="EXPENSE">Keluar</option>
          <option value="TRANSFER">Transfer</option>
        </select>
      </div>

      {/* TRANSACTION LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTransactions.length === 0 ? (
          <div className="card-glass text-center p-4" style={{ padding: '60px 20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px auto', color: 'var(--color-text-muted)', opacity: 0.5 }}><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <p className="text-sm font-bold">Tidak ada transaksi ditemukan.</p>
          </div>
        ) : (
          filteredTransactions.map(tx => {
            const isIncome = tx.type === 'INCOME';
            const isTransfer = tx.category.startsWith('Transfer');
            const walletName = wallets.find(w => w.id === tx.walletId)?.name || '';
            
            // Get first letter of category for merchant icon
            const initial = tx.category ? tx.category.charAt(0).toUpperCase() : '?';
            
            return (
              <div key={tx.id} className="card-glass" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '24px' }}>
                {/* Premium Initial/Icon Box */}
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: isIncome ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))' : isTransfer ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))' : 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.05))', 
                  color: isIncome ? 'var(--color-success)' : isTransfer ? 'var(--color-secondary)' : 'var(--color-danger)',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  border: `1px solid ${isIncome ? 'rgba(34, 197, 94, 0.2)' : isTransfer ? 'rgba(139, 92, 246, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
                }}>
                  {initial}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 className="font-bold" style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.description || tx.category}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {tx.description !== tx.category && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{tx.category}</span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} 
                      {walletName && ` • ${walletName}`}
                    </span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div className="font-extrabold" style={{ fontSize: '0.95rem', color: isIncome ? 'var(--color-success)' : 'var(--color-text)' }}>
                    {isIncome ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                  </div>
                  <button onClick={() => handleDelete(tx.id)} style={{ 
                    background: 'rgba(244, 63, 94, 0.1)', 
                    border: 'none', 
                    color: 'var(--color-danger)', 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '4px 10px',
                    borderRadius: '8px'
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
