'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal mengirim OTP');

      setSuccess('Kode OTP 6 digit telah dikirim ke email Anda.');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal mereset sandi');

      setSuccess('Sandi berhasil diubah! Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
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
        background: '#050408',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 75% 20%, rgba(139, 92, 246, 0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 45% at 20% 85%, rgba(88, 28, 135, 0.2) 0%, transparent 65%)',
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
          background: 'linear-gradient(165deg, rgba(22, 17, 35, 0.92) 0%, rgba(7, 6, 12, 0.98) 65%, rgba(38, 19, 66, 0.55) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9), inset 0 1px 0 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 0 rgba(168, 85, 247, 0.2)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <img src="/favicon.png" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
              FinanceFlow
            </span>
            <span className="ledger-badge-pill" style={{ marginLeft: 'auto' }}>
              Pemulihan Akun
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.035em', color: '#FFFFFF' }}>
            Pulihkan{' '}
            <span style={{ background: 'linear-gradient(90deg, #E9D5FF 0%, #C084FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Akses Anda
            </span>
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: '6px' }}>
            {step === 1 ? 'Masukkan email Anda untuk menerima kode OTP.' : 'Masukkan kode OTP dan sandi baru Anda.'}
          </p>
        </div>

        {error && <div role="alert" style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.28)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: '14px', fontSize: '0.84rem', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}
        {success && <div role="status" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.28)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: '14px', fontSize: '0.84rem', marginBottom: '1rem', fontWeight: 600 }}>{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="forgot-email" className="text-xs text-muted mb-1 block" style={{ fontWeight: 600 }}>Alamat Email</label>
              <input id="forgot-email" autoComplete="email" type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={loading} style={{ width: '100%', padding: '14px' }}>
              {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="forgot-otp" className="text-xs text-muted mb-1 block" style={{ fontWeight: 600 }}>Kode OTP 6 Digit</label>
              <input id="forgot-otp" autoComplete="one-time-code" inputMode="numeric" type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required style={{ letterSpacing: '6px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }} />
            </div>
            <div>
              <label htmlFor="forgot-password" className="text-xs text-muted mb-1 block" style={{ fontWeight: 600 }}>Sandi Baru</label>
              <input id="forgot-password" autoComplete="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={loading} style={{ width: '100%', padding: '14px' }}>
              {loading ? 'Menyimpan...' : 'Ubah Sandi'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <p className="text-sm text-muted">
            Ingat kata sandi Anda?{' '}
            <Link href="/auth/login" style={{ color: '#E9D5FF', fontWeight: 600 }}>
              Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
