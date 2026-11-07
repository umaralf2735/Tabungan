'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getApiError } from '@/lib/api';
import BackButton from '@/components/BackButton';
import CustomSelect from '@/components/CustomSelect';

const TOOL_LINKS = [
  { href: '/budgets', title: 'Anggaran', desc: 'Tetapkan batas pengeluaran per kategori' },
  { href: '/goals', title: 'Target Tabungan', desc: 'Lacak progres menabung untuk tujuan Anda' },
  { href: '/calculator', title: 'Kalkulator Finansial', desc: 'Hitung rasio 50/30/20 dan dana darurat' },
];

const FOSII_SLOT_DEFS: { key: 'pusat' | 'cabang' | 'pesmi'; title: string; subtitle: string; dotColor: string }[] = [
  { key: 'pusat', title: 'Pesma Pusat', subtitle: 'Pesantren Mahasiswa Pusat (Maks 1 Akun)', dotColor: '#818CF8' },
  { key: 'cabang', title: 'Pesma Cabang', subtitle: 'Pesantren Mahasiswa Cabang (Maks 1 Akun)', dotColor: '#34D399' },
  { key: 'pesmi', title: 'Pesmi', subtitle: 'Pesantren Mahasiswi (Maks 1 Akun)', dotColor: '#F472B6' },
];

export default function MenuPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // State khusus Admin Pengawas FOSII
  const [slots, setSlots] = useState<{ pusat: string; cabang: string; pesmi: string }>({
    pusat: '',
    cabang: '',
    pesmi: '',
  });
  const [candidates, setCandidates] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [savingSlots, setSavingSlots] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      if (parsed?.isAdmin) {
        loadAdminSlots();
      }
    }
  }, []);

  const loadAdminSlots = async () => {
    try {
      const res = await apiFetch('/api/fosii/switch');
      const data = await res.json();
      if (res.ok && data.slots) {
        setSlots({
          pusat: data.slots.pusat || '',
          cabang: data.slots.cabang || '',
          pesmi: data.slots.pesmi || '',
        });
        if (Array.isArray(data.candidates)) {
          setCandidates(data.candidates);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAdminSlots = async () => {
    setError('');
    setStatusMsg('');
    setSavingSlots(true);
    try {
      const res = await apiFetch('/api/fosii/switch', {
        method: 'PUT',
        body: JSON.stringify({
          pusat: slots.pusat || null,
          cabang: slots.cabang || null,
          pesmi: slots.pesmi || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Gagal menyimpan pengaturan 3 akun FOSII.');
        return;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setStatusMsg(data.message || 'Pengaturan 3 Akun Unit FOSII berhasil disimpan!');
      window.dispatchEvent(new Event('financeflow:data-updated'));
      window.dispatchEvent(new Event('financeflow:unit-changed'));
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setSavingSlots(false);
    }
  };

  const handleAdminJumpToUnit = async (unitKey: 'pusat' | 'cabang' | 'pesmi', targetPath = '/transactions') => {
    try {
      const res = await apiFetch('/api/fosii/switch', {
        method: 'POST',
        body: JSON.stringify({ unit: unitKey }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('fosiiUnit', unitKey);
        window.dispatchEvent(new Event('financeflow:data-updated'));
        window.dispatchEvent(new Event('financeflow:unit-changed'));
        router.push(targetPath);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllData = async () => {
    if (user?.isAdmin) return;
    if (
      !confirm(
        'Hapus SEMUA data keuangan di akun ini?\n\nSeluruh dompet, saldo, riwayat transaksi, anggaran, dan target tabungan akan di-reset ke 0 (Akun login Anda TIDAK terhapus).'
      )
    ) {
      return;
    }

    setError('');
    setStatusMsg('');
    setClearingData(true);
    try {
      const res = await apiFetch('/api/backup', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Gagal menghapus data.');
        return;
      }
      setStatusMsg(data.message || 'Semua data keuangan berhasil dihapus bersih.');
      window.dispatchEvent(new Event('financeflow:data-updated'));
      window.dispatchEvent(new Event('financeflow:unit-changed'));
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setClearingData(false);
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

  const isAdmin = Boolean(user?.isAdmin);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BackButton />
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.035em', color: '#FFFFFF' }}>
            {isAdmin ? 'Panel Admin ' : 'Profil & '}
            <span style={{ background: 'linear-gradient(90deg, #E0E7FF 0%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isAdmin ? 'Pengawas FOSII' : 'Alat Keuangan'}
            </span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {isAdmin
              ? 'Pilih maksimal 3 akun unit FOSII dari database untuk dipantau arus kas keluar-masuknya (Read-Only)'
              : 'Kelola data pribadi, anggaran, target, dan kalkulator'}
          </p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* User Card */}
        <div className="card-glass" style={{ padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div aria-hidden="true" style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>
            {isAdmin ? 'F' : user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user?.name || 'User Pengguna'}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{user?.email || 'email@user.com'}</p>
            <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: isAdmin ? 'rgba(99, 102, 241, 0.22)' : 'rgba(52, 211, 153, 0.15)', color: isAdmin ? '#A5B4FC' : 'var(--color-success)', fontWeight: 700 }}>
              {isAdmin ? '👁 Mode Pengawas Read-Only (Tidak Bisa Hapus/Edit)' : '✓ Terverifikasi OTP'}
            </span>
          </div>
        </div>

        {/* PANEL KHUSUS ADMIN FOSII: PEMILIHAN MAKSIMAL 3 AKUN DATABASE (ONLY FOSII) */}
        {isAdmin && (
          <div className="card-glass" style={{ padding: '22px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                Daftar 3 Akun Unit FOSII (Maksimal 3 Akun)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.45 }}>
                Pilih masing-masing 1 akun dari database untuk dijadikan akun resmi <strong style={{ color: '#E0E7FF' }}>Pesma Pusat</strong>, <strong style={{ color: '#E0E7FF' }}>Pesma Cabang</strong>, dan <strong style={{ color: '#E0E7FF' }}>Pesmi</strong>. Akun selain ke-3 unit ini tidak dapat dilihat datanya oleh Admin.
              </p>
            </div>

            {FOSII_SLOT_DEFS.map(slotDef => {
              const selectedId = slots[slotDef.key];
              const assignedUser = candidates.find(c => c.id === selectedId);
              // Sembunyikan akun yang sudah dipakai di slot lain agar tidak dobel
              const usedInOtherSlots = Object.entries(slots)
                .filter(([k, val]) => k !== slotDef.key && Boolean(val))
                .map(([, val]) => val);

              const availableOptions = [
                { value: '', label: '— Belum Dipilih —', sublabel: 'Kosongkan slot ini' },
                ...candidates
                  .filter(c => !usedInOtherSlots.includes(c.id))
                  .map(c => ({
                    value: c.id,
                    label: c.name || c.email,
                    sublabel: c.email,
                    dotColor: slotDef.dotColor,
                  })),
              ];

              return (
                <div
                  key={slotDef.key}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '18px',
                    background: 'rgba(8, 13, 26, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: slotDef.dotColor, boxShadow: `0 0 8px ${slotDef.dotColor}` }} />
                        {slotDef.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{slotDef.subtitle}</span>
                    </div>

                    {assignedUser && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleAdminJumpToUnit(slotDef.key, '/')}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '999px',
                            background: 'rgba(99, 102, 241, 0.18)',
                            border: '1px solid rgba(165, 180, 252, 0.35)',
                            color: '#E0E7FF',
                            fontSize: '0.73rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Lihat Grafik
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminJumpToUnit(slotDef.key, '/transactions')}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '999px',
                            background: 'rgba(52, 211, 153, 0.16)',
                            border: '1px solid rgba(52, 211, 153, 0.35)',
                            color: '#34D399',
                            fontSize: '0.73rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Lihat Keluar-Masuk
                        </button>
                      </div>
                    )}
                  </div>

                  <CustomSelect
                    ariaLabel={`Pilih akun untuk ${slotDef.title}`}
                    placeholder="Pilih akun dari database..."
                    value={selectedId}
                    onChange={val => setSlots(prev => ({ ...prev, [slotDef.key]: val }))}
                    options={availableOptions}
                  />
                </div>
              );
            })}

            {statusMsg && (
              <div role="status" style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: 'var(--color-success)', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                ✓ {statusMsg}
              </div>
            )}
            {error && (
              <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-danger)', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveAdminSlots}
              disabled={savingSlots}
              className="btn-primary tap-target"
              style={{ width: '100%', padding: '12px' }}
            >
              {savingSlots ? 'Menyimpan...' : 'Simpan Pengaturan 3 Akun FOSII'}
            </button>
          </div>
        )}

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

        {/* Reset Data Keuangan (Hanya untuk Pengguna Reguler, disembunyikan untuk Admin Read-Only) */}
        {!isAdmin && (
          <div className="card-glass" style={{ padding: '18px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>Reset Data Keuangan</h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Kosongkan seluruh dompet, saldo, riwayat transaksi, anggaran, dan target tabungan kembali ke 0 tanpa menghapus akun login Anda.
              </p>
            </div>
            {statusMsg && (
              <div role="status" style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: 'var(--color-success)', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                ✓ {statusMsg}
              </div>
            )}
            <button
              type="button"
              onClick={handleClearAllData}
              disabled={clearingData}
              className="tap-target"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '999px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.32)',
                color: 'var(--color-danger)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: clearingData ? 'wait' : 'pointer',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              {clearingData ? 'Menghapus Semua Data...' : 'Hapus Semua Data (Reset Keuangan ke 0)'}
            </button>
          </div>
        )}

        {/* Security & Privacy by Design (W02/W03) */}
        <div className="card-glass" style={{ padding: '18px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-primary-text)' }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Privasi & Keamanan</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
            {isAdmin
              ? 'Akun Admin Pengawas FOSII bersifat Read-Only (Hanya Pantau) dan hanya diizinkan melihat maksimal 3 akun unit FOSII yang ditetapkan.'
              : 'Kata sandi disimpan sebagai hash bcrypt, email diverifikasi dengan OTP, dan setiap permintaan data diperiksa dengan token sesi sehingga data Anda hanya bisa diakses dari akun Anda.'}
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

        {/* Hapus Akun (Hanya untuk akun reguler, tidak untuk akun Admin FOSII) */}
        {!isAdmin && (
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
        )}

      </div>
    </div>
  );
}
