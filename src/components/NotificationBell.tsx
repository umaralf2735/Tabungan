'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { buildInsights, Insight } from '@/lib/insight';

const SEEN_KEY = 'seenNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Insight[]>([]);
  const [unread, setUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Notifikasi dihitung dari data user pada bulan berjalan; tanpa kondisi nyata, daftarnya kosong.
  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    const load = async () => {
      try {
        const now = new Date();
        const [txRes, budgetRes] = await Promise.all([
          apiFetch('/api/transactions'),
          apiFetch(`/api/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
        ]);
        const transactions = await txRes.json();
        const budgets = await budgetRes.json();
        if (!Array.isArray(transactions) || !Array.isArray(budgets)) return;

        const warnings = buildInsights(transactions, budgets, now.getMonth(), now.getFullYear()).filter(n => n.tone === 'warning');
        const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
        setNotifications(warnings);
        setUnread(warnings.some(n => !seen.includes(n.id)));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setUnread(false);
    localStorage.setItem(SEEN_KEY, JSON.stringify(notifications.map(n => n.id)));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }} ref={dropdownRef}>
      {/* BELL BUTTON */}
      <button
        onClick={handleToggle}
        className="tap-target"
        aria-label={unread ? 'Notifikasi, ada yang belum dibaca' : 'Notifikasi'}
        aria-expanded={isOpen}
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unread && (
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            background: 'var(--color-danger)',
            borderRadius: '50%'
          }}></span>
        )}
      </button>

      {/* AVATAR / PROFIL PILL LINK */}
      <Link
        href="/menu"
        aria-label="Profil Akun"
        title="Profil & Alat Keuangan"
        className="tap-target"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '7px 14px',
          background: 'radial-gradient(115% 130% at 50% 105%, rgba(99, 102, 241, 0.75) 0%, rgba(79, 70, 229, 0.48) 50%, rgba(12, 19, 36, 0.96) 100%)',
          border: '1px solid rgba(165, 180, 252, 0.4)',
          boxShadow: '0 8px 22px -6px rgba(79, 70, 229, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          borderRadius: '999px',
          color: '#F8FAFC',
          fontSize: '0.82rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span style={{ letterSpacing: '-0.01em' }}>Profil</span>
      </Link>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: '320px',
          maxWidth: 'calc(100vw - 32px)',
          background: 'rgba(12, 19, 36, 0.98)',
          border: '1px solid rgba(165, 180, 252, 0.28)',
          borderRadius: '20px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)',
          zIndex: 999,
          padding: '16px',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Notifikasi</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Bulan ini</span>
          </div>

          {notifications.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', padding: '12px 4px', textAlign: 'center' }}>Tidak ada yang perlu diperhatikan bulan ini.</p>
          ) : (
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
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F1F5F9' }}>{n.title}</span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: '1.3' }}>{n.message}</p>
                  {n.action && (
                    <Link href={n.action.href} onClick={() => setIsOpen(false)} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary-text)', marginTop: '4px' }}>{n.action.label}</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
