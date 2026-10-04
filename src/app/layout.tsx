import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FinanceFlow Pro - Aplikasi Pengelola Keuangan Pribadi',
  description: 'Catat pemasukan, pengeluaran, kelola multi-wallet, dan atur anggaran bulananmu.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-container">
          
          {/* TOP NAVBAR (Desktop Only) */}
          <nav className="top-navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
              <h1 className="logo-text">FinanceFlow</h1>
              <div className="top-nav-menu">
                <a href="/" className="top-nav-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                  Home
                </a>
                <a href="/transactions" className="top-nav-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21h6M9 17h6M9 13h6M5 6h14M5 10h14M5 14h14M5 18h14"></path></svg>
                  Transaksi
                </a>
                <a href="/wallets" className="top-nav-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  Dompet
                </a>
                <a href="/reports" className="top-nav-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  Laporan
                </a>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--color-danger)', borderRadius: '50%' }}></span>
              </button>
              <a href="/menu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'var(--color-primary)', borderRadius: '50%', color: 'white', overflow: 'hidden' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"></path></svg>
              </a>
            </div>
          </nav>

          {/* MAIN CONTENT */}
          <main className="main-content animate-fade-in">
            {children}
          </main>

          {/* BOTTOM NAV (Mobile Only) */}
          <nav className="bottom-nav">
            <div className="nav-menu">
              <a href="/" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span className="nav-text">Home</span>
              </a>
              <a href="/transactions" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24"><path d="M9 21h6M9 17h6M9 13h6M5 6h14M5 10h14M5 14h14M5 18h14"></path></svg>
                <span className="nav-text">Transaksi</span>
              </a>
              <a href="/wallets" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                <span className="nav-text">Dompet</span>
              </a>
              <a href="/reports" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <span className="nav-text">Laporan</span>
              </a>
              <a href="/menu" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span className="nav-text">Akun</span>
              </a>
            </div>
          </nav>

        </div>
      </body>
    </html>
  );
}
