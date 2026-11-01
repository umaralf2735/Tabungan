'use client';
import { useEffect, useState } from 'react';
import { apiFetch, getApiError } from '@/lib/api';
import CustomSelect from '@/components/CustomSelect';
import BackButton from '@/components/BackButton';

const QUICK_CATEGORIES = ['Makanan', 'Transport', 'Belanja', 'Tagihan', 'Gaji', 'Hiburan'];
const UNDO_DURATION_MS = 8000;

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isTransferMode, setIsTransferMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [undoItems, setUndoItems] = useState<any[] | null>(null);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [formData, setFormData] = useState({ amount: '', type: 'EXPENSE', category: '', description: '', date: '', walletId: '' });
  const [transferData, setTransferData] = useState({ fromWalletId: '', toWalletId: '', amount: '', description: 'Transfer antar dompet' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!undoItems) return;
    const timer = setTimeout(() => setUndoItems(null), UNDO_DURATION_MS);
    return () => clearTimeout(timer);
  }, [undoItems]);

  const fetchData = async () => {
    try {
      const [txRes, walletRes] = await Promise.all([
        apiFetch('/api/transactions'),
        apiFetch('/api/wallets')
      ]);
      const txData = await txRes.json();
      const walletData = await walletRes.json();
      if(Array.isArray(txData)) setTransactions(txData);
      if(Array.isArray(walletData)) {
        setWallets(walletData);
        if (walletData.length > 0) {
          setFormData(prev => ({ ...prev, walletId: prev.walletId || walletData[0].id }));
          setTransferData(prev => ({
            ...prev,
            fromWalletId: prev.fromWalletId || walletData[0].id,
            toWalletId: prev.toWalletId || (walletData.length > 1 ? walletData[1].id : '')
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isTransferMode && transferData.fromWalletId === transferData.toWalletId) {
      setError('Dompet asal dan tujuan tidak boleh sama.');
      return;
    }

    setSaving(true);
    try {
      const res = isTransferMode
        ? await apiFetch('/api/transactions/transfer', {
            method: 'POST',
            body: JSON.stringify({ ...transferData, amount: parseFloat(transferData.amount) })
          })
        : await apiFetch('/api/transactions', {
            method: 'POST',
            body: JSON.stringify({ ...formData, description: formData.category, amount: parseFloat(formData.amount), date: formData.date ? new Date(formData.date).toISOString() : undefined })
          });

      const apiError = await getApiError(res, 'Transaksi gagal disimpan. Coba lagi.');
      if (apiError) {
        setError(apiError);
        return;
      }

      setShowForm(false);
      setFormData(prev => ({ ...prev, amount: '', category: '', description: '', date: '' }));
      setTransferData(prev => ({ ...prev, amount: '' }));
      fetchData();
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Data belum tersimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tx: any) => {
    const message = tx.category.startsWith('Transfer')
      ? 'Hapus transfer ini? Catatan di kedua dompet dihapus dan saldonya dikembalikan.'
      : `Hapus transaksi "${tx.description || tx.category}"? Saldo dompet akan dikembalikan.`;
    if(!confirm(message)) return;

    const res = await apiFetch(`/api/transactions?id=${tx.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error || 'Transaksi gagal dihapus.');
      return;
    }
    setUndoItems(data.deleted);
    fetchData();
  };

  const handleUndo = async () => {
    if (!undoItems) return;
    const items = undoItems;
    setUndoItems(null);

    const expenseLeg = items.find(t => t.type === 'EXPENSE');
    const incomeLeg = items.find(t => t.type === 'INCOME');
    const res = items.length === 2
      ? await apiFetch('/api/transactions/transfer', {
          method: 'POST',
          body: JSON.stringify({ fromWalletId: expenseLeg.walletId, toWalletId: incomeLeg.walletId, amount: expenseLeg.amount, description: expenseLeg.description, date: expenseLeg.date })
        })
      : await apiFetch('/api/transactions', { method: 'POST', body: JSON.stringify(items[0]) });

    const apiError = await getApiError(res, 'Transaksi gagal dikembalikan.');
    if (apiError) setError(apiError);
    fetchData();
  };

  const filteredTransactions = transactions.filter(t => {
    const isTransfer = t.category?.startsWith('Transfer');
    if(filterType === 'TRANSFER' && !isTransfer) return false;
    if((filterType === 'INCOME' || filterType === 'EXPENSE') && (t.type !== filterType || isTransfer)) return false;
    if(search && !t.category?.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedWallet = wallets.find(w => w.id === formData.walletId);
  const fromWallet = wallets.find(w => w.id === transferData.fromWalletId);
  const toWallet = wallets.find(w => w.id === transferData.toWalletId);
  const regularAmount = parseFloat(formData.amount) || 0;
  const transferAmount = parseFloat(transferData.amount) || 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

      {/* HEADER HERO */}
      <header className="flex-between mb-4 mt-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton />
          <div>
            <h1 className="font-extrabold text-2xl" style={{ letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Transaksi</h1>
            <p className="text-sm text-muted mt-1">Pantau semua arus kas Anda</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn-primary tap-target" style={{ padding: '0.6rem 1rem', borderRadius: '16px' }}>
          {showForm ? 'Batal' : '+ Tambah'}
        </button>
      </header>

      {/* Toast Urungkan (Safe Exploration W01) */}
      {undoItems && (
        <div role="status" className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '16px', marginBottom: '16px' }}>
          <span className="text-sm">{undoItems.length === 2 ? 'Transfer dihapus.' : 'Transaksi dihapus.'}</span>
          <button type="button" onClick={handleUndo} className="tap-target" style={{ background: 'none', border: 'none', color: 'var(--color-primary-text)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Urungkan
          </button>
        </div>
      )}

      {error && !showForm && (
        <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '24px', alignItems: 'start' }}>

        {/* LEFT COLUMN: FORM & FILTER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* FLOATING FORM */}
          {showForm && (
            <form onSubmit={handleSave} className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div role="group" aria-label="Jenis pencatatan" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '20px' }}>
                <button type="button" aria-pressed={!isTransferMode} onClick={() => { setIsTransferMode(false); setError(''); }} className="tap-target" style={{ flex: 1, padding: '8px', background: !isTransferMode ? 'var(--color-surface)' : 'transparent', color: !isTransferMode ? 'white' : 'var(--color-text-muted)', borderRadius: '14px', border: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s' }}>Reguler</button>
                <button type="button" aria-pressed={isTransferMode} onClick={() => { setIsTransferMode(true); setError(''); }} className="tap-target" style={{ flex: 1, padding: '8px', background: isTransferMode ? 'var(--color-surface)' : 'transparent', color: isTransferMode ? 'white' : 'var(--color-text-muted)', borderRadius: '14px', border: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s' }}>Transfer</button>
              </div>

              {!isTransferMode ? (
                <>
                  <div>
                    <label htmlFor="tx-type" className="text-xs text-muted mb-1 block font-bold">Jenis</label>
                    <CustomSelect
                      id="tx-type"
                      ariaLabel="Jenis transaksi"
                      value={formData.type}
                      onChange={val => setFormData({ ...formData, type: val })}
                      options={[
                        { value: 'EXPENSE', label: 'Pengeluaran', dotColor: '#FB7185' },
                        { value: 'INCOME', label: 'Pemasukan', dotColor: '#34D399' },
                      ]}
                    />
                  </div>
                  <div>
                    <label htmlFor="tx-amount" className="text-xs text-muted mb-1 block font-bold">Nominal (Rp)</label>
                    <input id="tx-amount" type="number" min="1" inputMode="numeric" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                  </div>
                  <div>
                    <label htmlFor="tx-category" className="text-xs text-muted mb-1 block font-bold">Kategori</label>
                    <input id="tx-category" type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />

                    {/* QUICK CATEGORY CHIPS (Recognition over Recall W02 & JTBD 1) */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {QUICK_CATEGORIES.map(chip => (
                        <button
                          key={chip}
                          type="button"
                          aria-pressed={formData.category === chip}
                          onClick={() => setFormData(prev => ({ ...prev, category: chip }))}
                          className="tap-target"
                          style={{
                            background: formData.category === chip ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                            color: formData.category === chip ? '#fff' : 'var(--color-text-muted)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="tx-wallet" className="text-xs text-muted mb-1 block font-bold">Sumber Dana</label>
                    <CustomSelect
                      id="tx-wallet"
                      ariaLabel="Sumber Dana"
                      placeholder="Pilih Dompet..."
                      value={formData.walletId}
                      onChange={val => setFormData({ ...formData, walletId: val })}
                      options={wallets.map(w => ({
                        value: w.id,
                        label: w.name,
                        sublabel: rupiah(w.balance),
                        dotColor: '#818CF8',
                      }))}
                    />
                    {wallets.length === 0 && (
                      <p className="text-xs text-muted mt-1">Belum ada dompet. <a href="/wallets" className="text-primary font-bold">Buat dompet dulu</a>.</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="tx-date" className="text-xs text-muted mb-1 block font-bold">Tanggal (kosongkan untuk hari ini)</label>
                    <input id="tx-date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  {selectedWallet && regularAmount > 0 && (
                    <p className="text-xs text-muted" aria-live="polite">
                      Saldo {selectedWallet.name} setelah dicatat: <strong>{rupiah(formData.type === 'INCOME' ? selectedWallet.balance + regularAmount : selectedWallet.balance - regularAmount)}</strong>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="tf-from" className="text-xs text-muted mb-1 block font-bold">Dari Dompet</label>
                    <CustomSelect
                      id="tf-from"
                      ariaLabel="Dari Dompet"
                      placeholder="Pilih Sumber..."
                      value={transferData.fromWalletId}
                      onChange={val => setTransferData({ ...transferData, fromWalletId: val })}
                      options={wallets.map(w => ({
                        value: w.id,
                        label: w.name,
                        sublabel: rupiah(w.balance),
                        dotColor: '#FB7185',
                      }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="tf-to" className="text-xs text-muted mb-1 block font-bold">Ke Dompet</label>
                    <CustomSelect
                      id="tf-to"
                      ariaLabel="Ke Dompet"
                      placeholder="Pilih Tujuan..."
                      value={transferData.toWalletId}
                      onChange={val => setTransferData({ ...transferData, toWalletId: val })}
                      options={wallets.map(w => ({
                        value: w.id,
                        label: w.name,
                        sublabel: rupiah(w.balance),
                        dotColor: '#34D399',
                      }))}
                    />
                    {wallets.length < 2 && (
                      <p className="text-xs text-muted mt-1">Transfer butuh minimal dua dompet. <a href="/wallets" className="text-primary font-bold">Tambah dompet</a>.</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="tf-amount" className="text-xs text-muted mb-1 block font-bold">Nominal (Rp)</label>
                    <input id="tf-amount" type="number" min="1" inputMode="numeric" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} required />
                  </div>
                  {fromWallet && toWallet && fromWallet.id !== toWallet.id && transferAmount > 0 && (
                    <p className="text-xs text-muted" aria-live="polite">
                      Setelah transfer: {fromWallet.name} <strong>{rupiah(fromWallet.balance - transferAmount)}</strong>, {toWallet.name} <strong>{rupiah(toWallet.balance + transferAmount)}</strong>. Tidak dihitung sebagai pengeluaran.
                    </p>
                  )}
                </>
              )}

              {error && (
                <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-primary mt-2" style={{ width: '100%', padding: '14px' }}>{saving ? 'Menyimpan...' : 'Simpan Transaksi'}</button>
            </form>
          )}

      {/* FILTER & SEARCH */}
      <div className="card-glass tx-filter-container" style={{ padding: '16px', borderRadius: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <label htmlFor="tx-search" className="visually-hidden">Cari transaksi</label>
          <svg aria-hidden="true" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            id="tx-search"
            type="search"
            placeholder="Cari kategori atau catatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '40px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', width: '100%' }}
          />
        </div>
        <label htmlFor="tx-filter" className="visually-hidden">Filter jenis transaksi</label>
        <CustomSelect
          id="tx-filter"
          ariaLabel="Filter jenis transaksi"
          value={filterType}
          onChange={val => setFilterType(val)}
          options={[
            { value: 'ALL', label: 'Semua', dotColor: '#818CF8' },
            { value: 'INCOME', label: 'Masuk', dotColor: '#34D399' },
            { value: 'EXPENSE', label: 'Keluar', dotColor: '#FB7185' },
            { value: 'TRANSFER', label: 'Transfer', dotColor: '#A78BFA' },
          ]}
        />
      </div>
        </div>

        {/* RIGHT COLUMN: TRANSACTION LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTransactions.length === 0 ? (
            <div className="card-glass text-center p-4" style={{ padding: '80px 20px', borderRadius: '24px', textAlign: 'center' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>Tidak ada transaksi ditemukan.</p>
            </div>
          ) : (
            filteredTransactions.map(tx => {
              const isIncome = tx.type === 'INCOME';
              const isTransfer = tx.category.startsWith('Transfer');
              const walletName = wallets.find(w => w.id === tx.walletId)?.name || '';

              const initial = tx.category ? tx.category.charAt(0).toUpperCase() : '?';

              return (
                <div key={tx.id} className="card-glass" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '24px' }}>
                  <div aria-hidden="true" style={{
                    width: '48px',
                    height: '48px',
                    flexShrink: 0,
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{tx.category}</span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        {walletName && ` • ${walletName}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div className="font-extrabold" style={{ fontSize: '0.95rem', color: isIncome ? 'var(--color-success)' : 'var(--color-text)' }}>
                      {isIncome ? '+' : '-'}{rupiah(tx.amount)}
                    </div>
                    <button onClick={() => handleDelete(tx)} aria-label={`Hapus ${tx.description || tx.category}`} className="tap-target" style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: 'none',
                      color: 'var(--color-danger)',
                      fontSize: '0.75rem',
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
    </div>
  );
}
