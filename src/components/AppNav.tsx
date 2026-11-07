'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import NotificationBell from '@/components/NotificationBell';
import { useTrackNavigation } from '@/components/BackButton';
import { apiFetch } from '@/lib/api';

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

const FOSII_UNITS = [
  { id: 'pusat', label: 'Pesma Pusat', desc: 'Pesantren Mahasiswa Pusat' },
  { id: 'cabang', label: 'Pesma Cabang', desc: 'Pesantren Mahasiswa Cabang' },
  { id: 'pesmi', label: 'Pesmi', desc: 'Pesantren Mahasiswi' },
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [activeUnit, setActiveUnit] = useState('pusat');
  const [monitoredLabel, setMonitoredLabel] = useState('');
  const [switchingUnit, setSwitchingUnit] = useState(false);

  const activeIdx = NAV_ITEMS.findIndex(item => item.href === pathname);

  useEffect(() => {
    const syncAdminState = () => {
      if (typeof window === 'undefined') return;
      try {
        const rawUser = localStorage.getItem('user');
        const parsedUser = rawUser ? JSON.parse(rawUser) : null;
        setIsAdmin(Boolean(parsedUser?.isAdmin));
        setActiveUnit(localStorage.getItem('fosiiUnit') || parsedUser?.unit || 'pusat');
        setMonitoredLabel(parsedUser?.name || '');
      } catch {
        setIsAdmin(false);
      }
    };

    syncAdminState();
    window.addEventListener('financeflow:unit-changed', syncAdminState);
    return () => window.removeEventListener('financeflow:unit-changed', syncAdminState);
  }, [pathname]);

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

  const handleSwitchUnit = async (unitId: string) => {
    if (switchingUnit) return;
    if (!localStorage.getItem('token')) return;

    setSwitchingUnit(true);
    try {
      const res = await apiFetch('/api/fosii/switch', {
        method: 'POST',
        body: JSON.stringify({ unit: unitId }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('fosiiUnit', unitId);
        setActiveUnit(unitId);
        setMonitoredLabel(data.user?.name || '');
        window.dispatchEvent(new Event('financeflow:data-updated'));
        window.dispatchEvent(new Event('financeflow:unit-changed'));
      }
    } catch (e) {
      console.error('Gagal berpindah unit:', e);
    } finally {
      setSwitchingUnit(false);
    }
  };

  // Halaman Login / Register / Forgot Password murni tanpa navbar
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const isHome = pathname === '/';

  return (
    <>
      <nav className="top-navbar" aria-label="Navigasi utama">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          {isAdmin && (
            <span className="ledger-badge-pill" style={{ fontSize: '0.66rem', padding: '3px 9px', letterSpacing: '0.03em' }}>
              ADMIN FOSII • PANTAU
            </span>
          )}
        </div>

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

      {/* BAR KHUSUS ADMIN PENGAWAS FOSII: SWITCHER 3 AKUN UNIT (Pesma Pusat | Pesma Cabang | Pesmi) */}
      {isAdmin && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 16px 0 16px',
            position: 'relative',
            zIndex: 40,
          }}
        >
          <div
            role="group"
            aria-label="Pantau Unit Keuangan FOSII"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '999px',
              background: 'rgba(12, 19, 36, 0.92)',
              border: '1px solid rgba(165, 180, 252, 0.24)',
              boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(16px)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#A5B4FC',
                padding: '0 6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
              Pantau Kinerja:
            </span>
            {FOSII_UNITS.map(u => {
              const isSelected = activeUnit === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  disabled={switchingUnit}
                  aria-pressed={isSelected}
                  title={u.desc}
                  onClick={() => handleSwitchUnit(u.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: isSelected ? '1px solid rgba(165, 180, 252, 0.48)' : '1px solid transparent',
                    background: isSelected
                      ? 'radial-gradient(120% 120% at 50% 100%, rgba(79, 70, 229, 0.68) 0%, rgba(17, 28, 49, 0.95) 100%)'
                      : 'transparent',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: switchingUnit ? 'wait' : 'pointer',
                    boxShadow: isSelected ? 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {u.label}
                </button>
              );
            })}
            <Link
              href="/menu"
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#E0E7FF',
                padding: '5px 11px',
                borderRadius: '999px',
                background: 'rgba(99, 102, 241, 0.16)',
                border: '1px solid rgba(165, 180, 252, 0.25)',
                marginLeft: '4px',
              }}
              title="Pilih 3 akun database untuk Pesma Pusat, Pesma Cabang, dan Pesmi"
            >
              ⚙ Pilih 3 Akun ({monitoredLabel ? monitoredLabel.split(' (')[0] : 'Atur'})
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export function MainStage({ children }: { children: ReactNode }) {
  const [stageKey, setStageKey] = useState(0);

  useEffect(() => {
    const handleUnitChange = () => {
      setStageKey(prev => prev + 1);
    };
    window.addEventListener('financeflow:unit-changed', handleUnitChange);
    return () => window.removeEventListener('financeflow:unit-changed', handleUnitChange);
  }, []);

  return (
    <main key={stageKey} className="main-content animate-fade-in">
      {children}
    </main>
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
