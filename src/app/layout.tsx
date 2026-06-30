import './globals.css';
import { ReactNode } from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FinanceFlow Pro - Aplikasi Pengelola Keuangan Pribadi Terbaik',
  description: 'Catat pemasukan, pengeluaran, kelola multi-wallet, dan atur anggaran bulananmu dengan mudah menggunakan FinanceFlow Pro. Dilengkapi dengan AI Insight untuk menganalisis keuanganmu secara otomatis.',
  keywords: ['pengelola keuangan', 'catat keuangan', 'budgeting', 'finance tracker', 'aplikasi keuangan pribadi', 'AI insight keuangan', 'finance flow'],
  openGraph: {
    title: 'FinanceFlow Pro - Kelola Keuangan dengan Cerdas',
    description: 'Catat keuangan harian dan capai target tabunganmu dengan fitur AI canggih dari FinanceFlow Pro.',
    type: 'website',
  },
  verification: {
    google: 'pGRIr8dxnh_eP78K4ztKMPZaFxnyRNMEhKW573z4TrE',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-container">
          {/* Mobile Header (Hanya muncul di HP) */}
          <header className="mobile-header">
            <h1 className="logo-text" style={{ marginBottom: 0 }}>FinanceFlow</h1>
          </header>

          <aside className="sidebar">
            <h1 className="logo-text desktop-logo">FinanceFlow</h1>
            <nav className="nav-menu">
              <a href="/" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span className="nav-text">Home</span>
              </a>
              <a href="/transactions" className="nav-link">
                <svg className="nav-icon" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
                <svg className="nav-icon" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                <span className="nav-text">Menu</span>
              </a>
            </nav>
          </aside>
          <main className="main-content animate-fade-in">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
