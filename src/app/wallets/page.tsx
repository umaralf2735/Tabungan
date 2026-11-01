'use client';
import { useEffect, useState } from 'react';
import { apiFetch, getApiError } from '@/lib/api';
import { WALLET_PRESETS, getWalletStyle } from '@/lib/walletStyles';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('bca');
  const [formData, setFormData] = useState({ name: 'BCA', balance: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    const res = await apiFetch('/api/wallets');
    const data = await res.json();
    if (Array.isArray(data)) setWallets(data);
  };

  const handleToggleForm = () => {
    const nextState = !showForm;
    setShowForm(nextState);
    if (nextState) {
      setSelectedPreset('bca');
      setFormData({ name: 'BCA', balance: '' });
      setError('');
    }
  };

  const handleSelectPreset = (presetId: string, presetName: string) => {
    setSelectedPreset(presetId);
    if (presetId === 'custom') {
      setFormData(prev => ({ ...prev, name: '' }));
    } else {
      setFormData(prev => ({ ...prev, name: presetName }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetName = formData.name.trim();
    if (!targetName) {
      setError('Silakan pilih atau ketik nama dompet.');
      return;
    }

    const parsedBalance = parseFloat(formData.balance) || 0;

    const res = await apiFetch('/api/wallets', {
      method: 'POST',
      body: JSON.stringify({ name: targetName, balance: parsedBalance })
    });
    const apiError = await getApiError(res, 'Dompet gagal disimpan.');
    if (apiError) {
      setError(apiError);
      return;
    }
    setShowForm(false);
    setFormData({ name: 'BCA', balance: '' });
    setSelectedPreset('bca');
    fetchWallets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dompet ini? Seluruh transaksi di dalamnya akan terhapus juga.')) return;
    setError('');
    const res = await apiFetch(`/api/wallets?id=${id}`, { method: 'DELETE' });
    const apiError = await getApiError(res, 'Dompet gagal dihapus.');
    if (apiError) setError(apiError);
    fetchWallets();
  };

  // Preview dinamis untuk form
  const previewStyle = getWalletStyle(formData.name || 'Dompet Baru');
  const previewBalance = parseFloat(formData.balance) || 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* HEADER HERO */}
      <header className="flex-between mb-4 mt-2">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Dompet</h1>
          <p className="text-sm text-muted mt-1">Kelola metode pembayaran dan rekening bank Anda</p>
        </div>
        <button 
          onClick={handleToggleForm} 
          className="btn-primary tap-target" 
          style={{ padding: '0.6rem 1.2rem', borderRadius: '16px', fontWeight: 600 }}
        >
          {showForm ? 'Tutup' : '+ Tambah Dompet'}
        </button>
      </header>

      {error && (
        <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* FORM TAMBAH DOMPET BARU DENGAN PRESET BANK & E-WALLET */}
      {showForm && (
        <div className="card-glass mb-5" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
            
            {/* Form Controls */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 className="font-bold text-base mb-1">Tambah Dompet Baru</h3>
                <p className="text-xs text-muted">Pilih cepat bank/e-wallet atau gunakan mode ketik sendiri</p>
              </div>

              {/* Preset Selector Chips */}
              <div>
                <label className="text-xs text-muted mb-2" style={{ display: 'block', fontWeight: 600 }}>
                  Pilih Bank / Dompet Digital:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
                  {WALLET_PRESETS.map(preset => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id, preset.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? '1.5px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#93C5FD' : '#E2E8F0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: preset.colorDot }} />
                        {preset.name}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('custom', '')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: selectedPreset === 'custom' ? 700 : 500,
                      background: selectedPreset === 'custom' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: selectedPreset === 'custom' ? '1.5px solid #3B82F6' : '1px dashed rgba(255,255,255,0.2)',
                      color: selectedPreset === 'custom' ? '#93C5FD' : '#CBD5E1',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Ketik Sendiri
                  </button>
                </div>
              </div>

              {/* Mode Ketik Sendiri Field */}
              {selectedPreset === 'custom' && (
                <div className="animate-fade-in">
                  <label htmlFor="custom-wallet-name" className="text-xs text-muted mb-1" style={{ display: 'block', fontWeight: 600 }}>
                    Nama Dompet Kustom
                  </label>
                  <input
                    id="custom-wallet-name"
                    type="text"
                    placeholder="Contoh: Tabungan Haji, Dompet Fisik, Jenius..."
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px' }}
                  />
                </div>
              )}

              {/* Saldo Awal */}
              <div>
                <label htmlFor="wallet-balance" className="text-xs text-muted mb-1" style={{ display: 'block', fontWeight: 600 }}>
                  Saldo Awal (Rp)
                </label>
                <input
                  id="wallet-balance"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={formData.balance}
                  onChange={e => setFormData({ ...formData, balance: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px' }}
                />
                {/* Saldo shortcut chips */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {[0, 50000, 100000, 500000, 1000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFormData({ ...formData, balance: amt.toString() })}
                      style={{
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {amt === 0 ? 'Rp 0' : `+${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary mt-2" style={{ width: '100%', padding: '12px', borderRadius: '14px', fontWeight: 600 }}>
                Simpan Dompet
              </button>
            </form>

            {/* Live Preview Card */}
            <div>
              <p className="text-xs text-muted mb-2 font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Preview Tampilan Kartu:
              </p>
              <div style={{
                background: previewStyle.gradient,
                borderRadius: '24px',
                padding: '24px',
                boxShadow: 'var(--shadow-premium)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.15)',
                minHeight: '210px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'background 0.3s ease'
              }}>
                <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '180px', height: '180px', background: 'rgba(255,255,255,0.12)', filter: 'blur(40px)', borderRadius: '50%', zIndex: 0 }}></div>

                {/* Top Card Bar */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff'
                  }}>
                    {previewStyle.badge}
                  </span>
                  {/* Contactless Icon */}
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 4c2.5 0 4.5 2 4.5 4.5S11 13 8.5 13"></path>
                    <path d="M12.5 4c3.5 0 6.5 3 6.5 6.5S16 17 12.5 17"></path>
                    <path d="M16.5 4C21 4 24 7.5 24 12s-3 8-7.5 8"></path>
                    <path d="M4.5 8.5C5.5 8.5 6 9 6 10s-.5 1.5-1.5 1.5S3 11 3 10s.5-1.5 1.5-1.5z"></path>
                  </svg>
                </div>

                {/* Chip EMV Metallic */}
                <div style={{ position: 'relative', zIndex: 1, margin: '14px 0 8px 0' }}>
                  <div style={{
                    width: '36px',
                    height: '26px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #FFE082 0%, #FFB300 50%, #FFA000 100%)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.25)' }}></div>
                    <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.25)' }}></div>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '45%', width: '1px', background: 'rgba(0,0,0,0.25)' }}></div>
                  </div>
                  <h3 className="font-extrabold mt-2 text-white" style={{ fontSize: '1.15rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {formData.name || 'NAMA DOMPET'}
                  </h3>
                </div>

                {/* Bottom Card Bar */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                    Saldo Aktif
                  </p>
                  <h2 className="font-extrabold text-white" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                    Rp {previewBalance.toLocaleString('id-ID')}
                  </h2>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* WALLET CARDS LIST (Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '24px' }}>
        {wallets.length === 0 ? (
          <div className="card-glass text-center p-4" style={{ padding: '60px 20px', gridColumn: '1 / -1' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px auto', color: 'var(--color-text-muted)', opacity: 0.5 }}><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            <p className="text-sm font-bold">Belum ada dompet.</p>
            <p className="text-xs text-muted mt-1">Tambahkan rekening bank atau dompet digital Anda.</p>
          </div>
        ) : (
          wallets.map((w) => {
            // Dapatkan warna otentik dan badge sesuai nama dompet
            const style = getWalletStyle(w.name);

            return (
              <div 
                key={w.id} 
                style={{ 
                  background: style.gradient, 
                  borderRadius: '24px', 
                  padding: '24px', 
                  boxShadow: 'var(--shadow-premium)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.12)',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)', borderRadius: '50%', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', filter: 'blur(30px)', borderRadius: '50%', zIndex: 0 }}></div>

                {/* Card Top: Badge Brand & Contactless Icon */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff'
                  }}>
                    {style.badge}
                  </span>

                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 4c2.5 0 4.5 2 4.5 4.5S11 13 8.5 13"></path>
                    <path d="M12.5 4c3.5 0 6.5 3 6.5 6.5S16 17 12.5 17"></path>
                    <path d="M16.5 4C21 4 24 7.5 24 12s-3 8-7.5 8"></path>
                    <path d="M4.5 8.5C5.5 8.5 6 9 6 10s-.5 1.5-1.5 1.5S3 11 3 10s.5-1.5 1.5-1.5z"></path>
                  </svg>
                </div>

                {/* Card Middle: EMV Chip & Wallet Name */}
                <div style={{ position: 'relative', zIndex: 1, margin: '12px 0 6px 0' }}>
                  <div style={{
                    width: '36px',
                    height: '26px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #FFE082 0%, #FFB300 50%, #FFA000 100%)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.25)' }}></div>
                    <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.25)' }}></div>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '45%', width: '1px', background: 'rgba(0,0,0,0.25)' }}></div>
                  </div>
                  <h3 className="font-extrabold mt-2 text-white" style={{ fontSize: '1.25rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {w.name}
                  </h3>
                </div>

                {/* Card Bottom: Balance & Delete Button */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                      Saldo Aktif
                    </p>
                    <h2 className="font-extrabold text-white" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>
                      Rp {w.balance.toLocaleString('id-ID')}
                    </h2>
                  </div>
                  <button 
                    onClick={() => handleDelete(w.id)} 
                    aria-label={`Hapus dompet ${w.name}`} 
                    className="tap-target" 
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.25)', 
                      border: '1px solid rgba(239, 68, 68, 0.4)', 
                      color: '#FECDD3', 
                      padding: '8px 12px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                      transition: 'background 0.15s ease'
                    }}
                  >
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
