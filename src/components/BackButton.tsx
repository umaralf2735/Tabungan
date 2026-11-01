'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const STACK_KEY = 'ff_nav_history_stack';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/transactions': 'Transaksi',
  '/wallets': 'Dompet',
  '/reports': 'Laporan',
  '/menu': 'Profil',
  '/budgets': 'Anggaran',
  '/goals': 'Target Tabungan',
  '/calculator': 'Kalkulator',
};

function getStack(): string[] {
  if (typeof window === 'undefined') return ['/'];
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    if (!raw) return ['/'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['/'];
  } catch {
    return ['/'];
  }
}

function saveStack(stack: string[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-30)));
  } catch {
    // ignore storage errors
  }
}

/**
 * Dipanggil di TopNav agar setiap perpindahan halaman (termasuk Home '/')
 * selalu tercatat secara berurutan di riwayat navigasi.
 */
export function useTrackNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/auth')) return;

    const stack = getStack();
    if (stack[stack.length - 1] !== pathname) {
      stack.push(pathname);
      saveStack(stack);
    }
  }, [pathname]);
}

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState<string>('/');

  useEffect(() => {
    if (!pathname) return;
    const stack = getStack();
    // Cari halaman terakhir di stack yang berbeda dari halaman saat ini
    let target = '/';
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i] !== pathname && !stack[i].startsWith('/auth')) {
        target = stack[i];
        break;
      }
    }
    setPrevPath(target);
  }, [pathname]);

  // Jangan tampilkan di halaman Home ('/') atau halaman Auth
  if (!pathname || pathname === '/' || pathname.startsWith('/auth')) {
    return null;
  }

  const handleBack = () => {
    const stack = getStack();
    // Hapus halaman saat ini dari ujung stack
    while (stack.length > 0 && stack[stack.length - 1] === pathname) {
      stack.pop();
    }
    const target = stack.length > 0 ? stack[stack.length - 1] : '/';
    saveStack(stack.length > 0 ? stack : ['/']);
    router.push(target);
  };

  const prevLabel = PAGE_LABELS[prevPath] || 'Halaman Sebelumnya';

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={`Kembali ke ${prevLabel}`}
      title={`Kembali ke ${prevLabel}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34px',
        height: '34px',
        minWidth: '34px',
        minHeight: '34px',
        borderRadius: '11px',
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        color: '#F8FAFC',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
        e.currentTarget.style.transform = 'translateX(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
