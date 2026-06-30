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
          <aside className="sidebar">
            <h1 className="logo-text">FinanceFlow</h1>
            <nav className="nav-menu">
              <a href="/" className="nav-link">Dashboard</a>
              <a href="/wallets" className="nav-link">Dompet (Wallet)</a>
              <a href="/budgets" className="nav-link">Anggaran (Budget)</a>
              <a href="/transactions" className="nav-link">Transaksi</a>
              <a href="/reports" className="nav-link">Laporan (Export)</a>
              <a href="/calculator" className="nav-link">Kalkulator AI</a>
              <a href="/auth/login" className="nav-link logout-link">Keluar</a>
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
