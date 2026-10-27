'use client';
import { useState, useRef, useEffect } from 'react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'AI Insight Aktif',
      desc: 'Analisis keuangan bulanan otomatis telah diaktifkan untuk akun Anda.',
      time: 'Baru saja',
      type: 'info'
    },
    {
      id: 2,
      title: 'Verifikasi Akun Berhasil',
      desc: 'Email Anda telah terverifikasi aman melalui protokol OTP.',
      time: 'Hari ini',
      type: 'success'
    },
    {
      id: 3,
      title: 'Selamat Datang di FinanceFlow!',
      desc: 'Mulai dengan menambahkan dompet dan mencatat transaksi pertama Anda.',
      time: 'Kemarin',
      type: 'welcome'
    }
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }} ref={dropdownRef}>
      {/* BELL BUTTON */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setUnread(false);
        }}
        aria-label="Notifikasi"
        style={{ 
          background: isOpen ? 'rgba(255,255,255,0.08)' : 'none', 
          border: 'none', 
          color: isOpen ? '#fff' : 'var(--color-text-muted)', 
          cursor: 'pointer', 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '8px',
          borderRadius: '12px',
          transition: 'all 0.2s'
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unread && (
          <span style={{ 
            position: 'absolute', 
            top: '4px', 
            right: '4px', 
            width: '8px', 
            height: '8px', 
            background: 'var(--color-danger)', 
            borderRadius: '50%',
            boxShadow: '0 0 8px var(--color-danger)'
          }}></span>
        )}
      </button>

      {/* AVATAR LINK */}
      <a 
        href="/menu" 
        title="Profil Akun"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '36px', 
          height: '36px', 
          background: 'var(--color-primary)', 
          borderRadius: '50%', 
          color: 'white', 
          overflow: 'hidden',
          textDecoration: 'none'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"></path>
        </svg>
      </a>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: '320px',
          background: 'var(--color-surface-secondary, #111827)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          zIndex: 999,
          padding: '16px',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Notifikasi</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>3 Terkini</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F1F5F9' }}>{n.title}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: '1.3' }}>{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
