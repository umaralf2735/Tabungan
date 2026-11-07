'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Di domain fosii.financeflowpro.my.id tidak ada fitur daftar akun / OTP
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.toLowerCase().startsWith('fosii.')) {
      router.replace('/auth/login');
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--color-bg-base)',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 75% 20%, rgba(79, 70, 229, 0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 45% at 20% 85%, rgba(30, 58, 138, 0.22) 0%, transparent 65%)',
        zIndex: 60,
      }}
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '26px',
          background: 'linear-gradient(165deg, rgba(17, 28, 49, 0.92) 0%, rgba(8, 13, 26, 0.98) 65%, rgba(30, 41, 82, 0.55) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 0 rgba(99, 102, 241, 0.2)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img src="/favicon.png" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
                FinanceFlow
              </span>
              <span className="ledger-badge-pill" style={{ marginLeft: 'auto' }}>
                {step === 1 ? 'Buat Akun' : 'Verifikasi OTP'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.15, color: '#FFFFFF' }}>
              {step === 1 ? (
                <>
                  Mulai kendalikan{' '}
                  <span style={{ background: 'linear-gradient(90deg, #E0E7FF 0%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    keuanganmu.
                  </span>
                </>
              ) : (
                'Verifikasi email Anda'
              )}
            </h1>
            <p className="text-muted text-sm" style={{ marginTop: '6px' }}>
              {step === 1 ? 'Daftar dalam hitungan detik dengan proteksi OTP.' : 'Masukkan 6 digit kode yang dikirim ke email Anda.'}
            </p>
          </div>

          {error && (
            <div role="alert" style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.28)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: '14px', fontSize: '0.84rem', marginBottom: '1.25rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label htmlFor="register-name" className="text-xs text-muted mb-1 block" style={{ fontWeight: 600 }}>Nama Lengkap</label>
                <input
                  id="register-name"
                  autoComplete="name"
                  type="text"
                  placeholder="Nama Anda"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="register-email" className="text-xs text-muted mb-1 block" style={{ fontWeight: 600 }}>Alamat Email</label>
                <input
                  id="register-email"
                  autoComplete="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="register-password" className="text-xs text-muted mb-1 block" style={{ fontWeight: 600 }}>Kata Sandi</label>
                <input
                  id="register-password"
                  autoComplete="new-password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '0.5rem', fontSize: '0.92rem' }}>
                {loading ? 'Memproses...' : 'Buat Akun'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ padding: '12px 14px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.14)', border: '1px solid rgba(165, 180, 252, 0.22)' }}>
                <p className="text-xs text-muted">Kode OTP 6-digit telah dikirim ke:</p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-primary-text)', marginTop: '2px' }}>{formData.email}</p>
              </div>

              <div>
                <label htmlFor="register-otp" className="text-xs text-muted mb-1 block" style={{ fontWeight: 600 }}>Kode OTP</label>
                <input
                  id="register-otp"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  style={{ fontSize: '1.25rem', textAlign: 'center', letterSpacing: '8px', fontWeight: 700 }}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '0.5rem', fontSize: '0.92rem' }}>
                {loading ? 'Memverifikasi...' : 'Verifikasi Akun'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <p className="text-sm text-muted">
              Sudah punya akun?{' '}
              <Link href="/auth/login" style={{ color: 'var(--color-primary-text)', fontWeight: 600, textDecoration: 'none' }}>
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
