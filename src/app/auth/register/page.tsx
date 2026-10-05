'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      setStep(2); // Pindah ke form verifikasi OTP
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
      
      // Simpan data login
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--color-bg-base)' }}>
      <div className="card-glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative', overflow: 'hidden', borderRadius: '32px' }}>
        {/* Abstract Deco */}
        <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: '180px', height: '180px', background: 'var(--color-secondary)', filter: 'blur(80px)', opacity: 0.25, zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-40%', left: '-20%', width: '180px', height: '180px', background: 'var(--color-primary)', filter: 'blur(80px)', opacity: 0.2, zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="font-extrabold text-3xl mb-2" style={{ letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #FFFFFF, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FinanceFlow
            </h1>
            <p className="text-muted text-sm font-bold">
              {step === 1 ? 'Mulai perjalanan finansial Anda' : 'Verifikasi email Anda'}
            </p>
          </div>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
              {error}
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem' }} 
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Alamat Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem' }} 
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block font-bold">Kata Sandi</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem' }} 
                />
              </div>
              
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '16px', marginTop: '0.5rem', borderRadius: '16px', fontSize: '0.95rem' }}>
                {loading ? 'Memproses...' : 'Buat Akun'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p className="text-sm text-muted">Kode OTP 6-digit telah dikirim ke:</p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{formData.email}</p>
              </div>
              
              <div>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  required
                  maxLength={6}
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '8px', fontWeight: 'bold' }} 
                />
              </div>
              
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '16px', marginTop: '0.5rem', borderRadius: '16px', fontSize: '0.95rem' }}>
                {loading ? 'Memverifikasi...' : 'Verifikasi Akun'}
              </button>
            </form>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p className="text-sm text-muted">
              Sudah punya akun? <Link href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
