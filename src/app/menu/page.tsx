'use client';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Menu Lainnya</h2>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        

        <button 
          onClick={handleLogout}
          className="card" 
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(244, 63, 94, 0.2)', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '1rem 1.25rem', marginTop: '1rem' }}
        >
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-danger)' }}>Keluar Akun (Logout)</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Sesi Anda akan berakhir dengan aman</p>
          </div>
        </button>

      </div>
    </div>
  );
}
