'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getApiError } from '@/lib/api';
import BackButton from '@/components/BackButton';

const TOOL_LINKS = [
  { href: '/budgets', title: 'Anggaran', desc: 'Tetapkan batas pengeluaran per kategori' },
  { href: '/goals', title: 'Target Tabungan', desc: 'Lacak progres menabung untuk tujuan Anda' },
  { href: '/calculator', title: 'Kalkulator Finansial', desc: 'Hitung rasio 50/30/20 dan dana darurat' },
];

export default function MenuPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Backup / Migrasi Data & Mode FOSII
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [backupMessage, setBackupMessage] = useState('');
  const [backupError, setBackupError] = useState('');
  const [fosiiMode, setFosiiMode] = useState(false);
  const [isFosiiDomain, setIsFosiiDomain] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const host = window.location.hostname.toLowerCase();
    const onFosiiHost = host.startsWith('fosii.') || host.includes('fosii');
    setIsFosiiDomain(onFosiiHost);
    setFosiiMode(onFosiiHost || localStorage.getItem('fosiiMode') === 'true');
  }, []);

  const handleToggleFosiiMode = () => {
    if (isFosiiDomain) return; // Di domain fosii.* selalu aktif otomatis
    const next = !fosiiMode;
    setFosiiMode(next);
    localStorage.setItem('fosiiMode', next ? 'true' : 'false');
    window.dispatchEvent(new Event('financeflow:fosii-mode-changed'));
  };

  const handleExportBackup = async () => {
    setBackupError('');
    setBackupMessage('');
    setExporting(true);
    try {
      const res = await apiFetch('/api/backup');
      const data = await res.json();
      if (!res.ok) {
        setBackupError(data?.error || 'Gagal mengekspor data.');
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      const safeName = (user?.name || 'Akun').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.href = url;
      a.download = `FinanceFlow_Backup_${safeName}_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupMessage(`Berhasil mengekspor ${data.wallets?.length || 0} dompet & ${data.transactions?.length || 0} transaksi.`);
    } catch {
      setBackupError('Gagal mengunduh file backup.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupError('');
    setBackupMessage('');
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await apiFetch('/api/backup', {
        method: 'POST',
        body: JSON.stringify({ ...parsed, mode: importMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBackupError(data?.error || 'Gagal mengimpor data.');
        return;
      }

      setBackupMessage(data.message || 'Data berhasil diimpor ke akun/unit ini!');
      window.dispatchEvent(new Event('financeflow:data-updated'));
    } catch {
      setBackupError('File tidak valid. Pastikan memilih file .json hasil Export FinanceFlow.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('fosiiUnit');
    router.push('/auth/login');
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDeleting(true);
    try {
      const res = await apiFetch('/api/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password })
      });
      const apiError = await getApiError(res, 'Akun gagal dihapus.');
      if (apiError) {
        setError(apiError);
        return;
      }
      handleLogout();
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Akun belum dihapus.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BackButton />
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.035em', color: '#FFFFFF' }}>
            Profil &{' '}
            <span style={{ background: 'linear-gradient(90deg, #E0E7FF 0%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Alat Keuangan
            </span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Kelola data pribadi, anggaran, target, dan migrasi data antar akun</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* User Card */}
        <div className="card-glass" style={{ padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div aria-hidden="true" style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user?.name || 'User Pengguna'}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{user?.email || 'email@user.com'}</p>
            <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', color: 'var(--color-success)', fontWeight: 700 }}>
              ✓ Terverifikasi OTP
            </span>
          </div>
        </div>

        {/* Alat Keuangan */}
        <nav aria-label="Alat keuangan" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {TOOL_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '20px' }}>
              <span>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{link.title}</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{link.desc}</span>
              </span>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>
          ))}
        </nav>

        {/* BACKUP & PINDAH DATA ANTAR AKUN / DOMAIN */}
        <div className="card-glass" style={{ padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>Export & Import Data Antar Akun</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Pindahkan seluruh dompet, saldo, transaksi, dan anggaran dari akun lama ke akun/unit baru (misal ke <strong style={{ color: '#A5B4FC' }}>fosii.financeflowpro.my.id</strong>)
              </p>
            </div>
          </div>

          <div role="group" aria-label="Mode impor data" style={{ display: 'flex', gap: '6px', background: 'rgba(8, 13, 26, 0.85)', padding: '4px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              onClick={() => setImportMode('merge')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '999px',
                border: importMode === 'merge' ? '1px solid rgba(165, 180, 252, 0.35)' : '1px solid transparent',
                background: importMode === 'merge' ? 'rgba(79, 70, 229, 0.45)' : 'transparent',
                color: importMode === 'merge' ? '#fff' : 'var(--color-text-muted)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Saat Import: Gabungkan Data
            </button>
            <button
              type="button"
              onClick={() => setImportMode('replace')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '999px',
                border: importMode === 'replace' ? '1px solid rgba(165, 180, 252, 0.35)' : '1px solid transparent',
                background: importMode === 'replace' ? 'rgba(79, 70, 229, 0.45)' : 'transparent',
                color: importMode === 'replace' ? '#fff' : 'var(--color-text-muted)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Saat Import: Ganti Semua Data
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={handleExportBackup}
              disabled={exporting}
              className="btn-ghost tap-target"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.82rem', padding: '10px 14px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {exporting ? 'Mengekspor...' : 'Export Data (.json)'}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="btn-primary tap-target"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.82rem', padding: '10px 14px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              {importing ? 'Mengimpor...' : 'Import Data (.json)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              style={{ display: 'none' }}
            />
          </div>

          {backupMessage && (
            <div role="status" style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: 'var(--color-success)', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
              ✓ {backupMessage}
            </div>
          )}
          {backupError && (
            <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-danger)', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
              {backupError}
            </div>
          )}

          {/* Saklar Mode 3 Unit FOSII */}
          <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#F1F5F9' }}>
                Mode 3 Unit FOSII (Pesma Pusat / Cabang / Pesmi)
              </span>
              <span style={{ display: 'block', fontSize: '0.73rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {isFosiiDomain
                  ? 'Aktif otomatis di domain fosii.financeflowpro.my.id'
                  : 'Tampilkan tombol pindah unit (Pesma Pusat, Pesma Cabang, Pesmi) di atas halaman'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleFosiiMode}
              disabled={isFosiiDomain}
              aria-pressed={fosiiMode}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: fosiiMode ? '1px solid rgba(52, 211, 153, 0.45)' : '1px solid rgba(255,255,255,0.15)',
                background: fosiiMode ? 'rgba(52, 211, 153, 0.18)' : 'rgba(255,255,255,0.05)',
                color: fosiiMode ? '#34D399' : 'var(--color-text-muted)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: isFosiiDomain ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {fosiiMode ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        </div>

        {/* Security & Privacy by Design (W02/W03) */}
        <div className="card-glass" style={{ padding: '18px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-primary-text)' }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Privasi & Keamanan</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
            Kata sandi disimpan sebagai hash bcrypt, email diverifikasi dengan OTP, dan setiap permintaan data diperiksa dengan token sesi sehingga data Anda hanya bisa diakses dari akun Anda.
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="card-glass"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(244, 63, 94, 0.3)', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '1rem 1.25rem', marginTop: '0.5rem', borderRadius: '20px' }}
        >
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '14px', color: 'var(--color-danger)' }}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-danger)' }}>Keluar Akun (Logout)</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Sesi Anda akan berakhir dengan aman</p>
          </div>
        </button>

        {/* Hapus Akun (W02: No Roach Motel) */}
        <div className="card-glass" style={{ padding: '18px', borderRadius: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Hapus Akun</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.4', marginTop: '4px' }}>
            Akun beserta seluruh dompet, transaksi, anggaran, dan target tabungan dihapus permanen.
          </p>
          {!showDelete ? (
            <button type="button" onClick={() => setShowDelete(true)} className="tap-target" style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
              Hapus akun saya
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div>
                <label htmlFor="delete-password" className="text-xs text-muted mb-1 block font-bold">Masukkan kata sandi untuk konfirmasi</label>
                <input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && (
                <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" disabled={deleting} className="tap-target" style={{ flex: 1, background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: 'var(--color-danger)', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                  {deleting ? 'Menghapus...' : 'Hapus Permanen'}
                </button>
                <button type="button" onClick={() => { setShowDelete(false); setPassword(''); setError(''); }} className="tap-target btn-ghost" style={{ flex: 1, padding: '0.5rem' }}>
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
