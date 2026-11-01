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
    href: '/budgets',
    label: 'Anggaran',
    topIcon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></>,
    bottomIcon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></>,
  },
  {
    href: '/goals',
    label: 'Target',
    topIcon: <><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></>,
    bottomIcon: <><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></>,
  },
  {
    href: '/calculator',
    label: 'Kalkulator',
    topIcon: <><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line><line x1="12" y1="18" x2="16" y2="18"></line></>,
    bottomIcon: <><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line><line x1="12" y1="18" x2="16" y2="18"></line></>,
  },
  {
    href: '/reports',
    label: 'Laporan',
    topIcon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>,
    bottomIcon: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>,
  },
];

export function TopNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className="top-navbar" aria-label="Navigasi utama">
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
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

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama (seluler)">
      <div className="nav-menu">
        {NAV_ITEMS.map(item => {
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
