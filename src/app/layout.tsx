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
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Dashboard</span>
              </a>
              <a href="/wallets" className="nav-link">
                <span className="nav-icon">💳</span>
                <span className="nav-text">Dompet</span>
              </a>
              <a href="/budgets" className="nav-link">
                <span className="nav-icon">🎯</span>
                <span className="nav-text">Anggaran</span>
              </a>
              <a href="/transactions" className="nav-link">
                <span className="nav-icon">💸</span>
                <span className="nav-text">Transaksi</span>
              </a>
              <a href="/reports" className="nav-link">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Laporan</span>
              </a>
              <a href="/calculator" className="nav-link">
                <span className="nav-icon">🧮</span>
                <span className="nav-text">Kalkulator</span>
              </a>
              <a href="/auth/login" className="nav-link logout-link">
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Keluar</span>
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
