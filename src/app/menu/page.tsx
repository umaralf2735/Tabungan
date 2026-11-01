'use client';
import { useEffect, useState } from 'react';
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

  const [user, setUser] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Profil & Akun</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Kelola data pribadi dan preferensi aplikasi</p>
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
            <a key={link.href} href={link.href} className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '20px' }}>
              <span>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{link.title}</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{link.desc}</span>
              </span>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          ))}
        </nav>

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
