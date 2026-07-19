'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // State
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--color-bg-base)' }}>
      <div className="card-glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Abstract Deco */}
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '150px', height: '150px', background: 'var(--color-primary)', filter: 'blur(80px)', opacity: 0.3, zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="font-extrabold text-2xl mb-1">Pulihkan Akses</h1>
          <p className="text-muted text-sm">{step === 1 ? 'Masukkan email Anda untuk menerima kode OTP.' : 'Masukkan kode OTP dan sandi baru Anda.'}</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 600 }}>{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="text-xs text-muted mb-1 block font-bold">Alamat Email</label>
              <input type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={loading} style={{ width: '100%', padding: '14px' }}>
              {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="text-xs text-muted mb-1 block font-bold">Kode OTP 6 Digit</label>
              <input type="text" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }} />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block font-bold">Sandi Baru</label>
              <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={loading} style={{ width: '100%', padding: '14px' }}>
              {loading ? 'Menyimpan...' : 'Ubah Sandi'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p className="text-sm text-muted">
            Ingat kata sandi Anda? <Link href="/auth/login" className="text-primary font-bold">Kembali ke Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
