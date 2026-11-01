'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import NotificationBell from '@/components/NotificationBell';

const NAV_ITEMS: { href: string; label: string; topIcon: ReactNode; bottomIcon: ReactNode }[] = [
  {
    href: '/transactions',
    label: 'Transaksi',
    topIcon: <path d="M9 21h6M9 17h6M9 13h6M5 6h14M5 10h14M5 14h14M5 18h14"></path>,
    bottomIcon: <path d="M9 21h6M9 17h6M9 13h6M5 6h14M5 10h14M5 14h14M5 18h14"></path>,
  },
  {
    href: '/wallets',
    label: 'Dompet',
    topIcon: <><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></>,
    bottomIcon: <><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></>,
  },
  {
    href: '/reports',
    label: 'Laporan',
    topIcon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>,
    bottomIcon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>,
  },
];

const ACCOUNT_ICON = <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></>;

export function TopNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className="top-navbar" aria-label="Navigasi utama">
      <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
        <a
          href="/"
          className="logo-text"
          aria-label="FinanceFlow — Kembali ke Beranda (Home)"
          title="Kembali ke Home"
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            opacity: isHome ? 1 : 0.9,
            transition: 'opacity 0.2s, transform 0.2s',
          }}
        >
          <img src="/favicon.png" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span>FinanceFlow</span>
        </a>
        <div className="top-nav-menu">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <a key={item.href} href={item.href} className={`top-nav-link${isActive ? ' active' : ''}`} aria-current={isActive ? 'page' : undefined}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{item.topIcon}</svg>
                {item.label}
              </a>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <NotificationBell />
      </div>
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const items = [...NAV_ITEMS, { href: '/menu', label: 'Akun', bottomIcon: ACCOUNT_ICON }];

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama (seluler)">
      <div className="nav-menu">
        {items.map(item => {
          const isActive = pathname === item.href;
          return (
            <a key={item.href} href={item.href} className={`nav-link${isActive ? ' active' : ''}`} aria-current={isActive ? 'page' : undefined}>
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">{item.bottomIcon}</svg>
              <span className="nav-text">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
