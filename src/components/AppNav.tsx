'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import NotificationBell from '@/components/NotificationBell';
import { useTrackNavigation } from '@/components/BackButton';

const NAV_ITEMS: { href: string; label: string; topIcon: ReactNode; bottomIcon: ReactNode }[] = [
  {
    href: '/transactions',
    label: 'Transaksi',
    topIcon: <><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></>,
    bottomIcon: <><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></>,
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
  useTrackNavigation();
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });

  const activeIdx = NAV_ITEMS.findIndex(item => item.href === pathname);

  useEffect(() => {
    const updatePill = () => {
      if (activeIdx === -1) {
        setPillStyle(prev => ({ ...prev, visible: false }));
        return;
      }
      const el = linkRefs.current[activeIdx];
      if (el) {
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          visible: true,
        });
      }
    };
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [activeIdx, pathname]);

  // Halaman Login / Register / Forgot Password murni tanpa navbar
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const isHome = pathname === '/';

  return (
    <nav className="top-navbar" aria-label="Navigasi utama">
      <Link
        href="/"
        className="logo-text"
        aria-label="FinanceFlow — Kembali ke Beranda (Home)"
        title="Kembali ke Home"
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          opacity: isHome ? 1 : 0.92,
          transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <img src="/favicon.png" alt="" width={26} height={26} style={{ objectFit: 'contain' }} />
        <span>FinanceFlow</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="top-nav-menu">
          <span
            aria-hidden="true"
            className="top-nav-pill-indicator"
            style={{
              width: `${pillStyle.width}px`,
              transform: `translate3d(${pillStyle.left}px, 0, 0)`,
              opacity: pillStyle.visible ? 1 : 0,
            }}
          />
          {NAV_ITEMS.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={el => { linkRefs.current[idx] = el; }}
                className={`top-nav-link${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.topIcon}</svg>
                {item.label}
              </Link>
            );
          })}
        </div>

        <NotificationBell />
      </div>
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  // Halaman Login / Register / Forgot Password murni tanpa bottom navbar
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const items = [...NAV_ITEMS, { href: '/menu', label: 'Akun', bottomIcon: ACCOUNT_ICON }];

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama (seluler)">
      <div className="nav-menu">
        {items.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`nav-link${isActive ? ' active' : ''}`} aria-current={isActive ? 'page' : undefined}>
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">{item.bottomIcon}</svg>
              <span className="nav-text">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
