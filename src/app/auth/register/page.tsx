'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>FinanceFlow</h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Buat akun baru</p>
        
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nama Lengkap</label>
            <input type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email</label>
            <input type="email" placeholder="nama@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
            <input type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} required />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Daftar</button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
          Sudah punya akun? <a href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Masuk di sini</a>
        </p>
      </div>
    </div>
  );
}
