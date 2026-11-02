'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
        background: '#050408',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 75% 20%, rgba(139, 92, 246, 0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 45% at 20% 85%, rgba(88, 28, 135, 0.2) 0%, transparent 65%)',
        zIndex: 60,
      }}
    >
      {/* Subtle Architectural Diagonal Ray */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-20%',
          right: '12%',
          width: '2px',
          height: '140vh',
          background: 'linear-gradient(180deg, transparent 0%, rgba(216, 180, 254, 0.22) 50%, transparent 100%)',
          transform: 'rotate(-32deg)',
          pointerEvents: 'none',
        }}
      />

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
        {/* Top Amethyst Specular Glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-40px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img src="/favicon.png" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
                FinanceFlow
              </span>
              <span className="ledger-badge-pill" style={{ marginLeft: 'auto' }}>
                Personal Ledger
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#FFFFFF',
              }}
            >
              Selamat datang{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #E9D5FF 0%, #C084FC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                kembali.
              </span>
            </h1>
            <p className="text-muted text-sm" style={{ marginTop: '6px' }}>
              Masuk untuk mengelola arus kas, dompet, dan laporan Anda.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                background: 'rgba(251, 113, 133, 0.1)',
                border: '1px solid rgba(251, 113, 133, 0.28)',
                color: 'var(--color-danger)',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label htmlFor="login-email" className="text-xs text-muted mb-1 block" style={{ fontWeight: 600 }}>
                Alamat Email
              </label>
              <input
                id="login-email"
                autoComplete="email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex-between mb-1">
                <label htmlFor="login-password" className="text-xs text-muted block" style={{ fontWeight: 600 }}>
                  Kata Sandi
                </label>
                <Link
                  href="/auth/forgot-password"
                  style={{ fontSize: '0.75rem', color: 'var(--color-primary-text)', fontWeight: 600, textDecoration: 'none' }}
                >
                  Lupa sandi?
                </Link>
              </div>
              <input
                id="login-password"
                autoComplete="current-password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', marginTop: '0.5rem', fontSize: '0.92rem' }}
            >
              {loading ? 'Memproses...' : 'Masuk ke Akun'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <p className="text-sm text-muted">
              Belum punya akun?{' '}
              <Link href="/auth/register" style={{ color: '#E9D5FF', fontWeight: 600, textDecoration: 'none' }}>
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
