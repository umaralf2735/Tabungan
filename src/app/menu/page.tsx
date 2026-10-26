'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Profil & Akun</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Kelola data pribadi dan preferensi aplikasi</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* User Card */}
        <div className="card-glass" style={{ padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>
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

        {/* Security & Privacy by Design (W02/W03) */}
        <div className="card-glass" style={{ padding: '18px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Privasi & Keamanan (Privacy by Design)</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
            Data keuangan Anda dilindungi dengan standar autentikasi bcrypt, verifikasi token email OTP, dan disimpan secara terisolasi tanpa pelacakan data pihak ketiga.
          </p>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="card-glass" 
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(244, 63, 94, 0.3)', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '1rem 1.25rem', marginTop: '0.5rem', borderRadius: '20px' }}
        >
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '14px', color: 'var(--color-danger)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-danger)' }}>Keluar Akun (Logout)</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Sesi Anda akan berakhir dengan aman</p>
          </div>
        </button>

      </div>
    </div>
  );
}
