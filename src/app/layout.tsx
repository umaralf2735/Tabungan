import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { TopNav, BottomNav } from '@/components/AppNav';

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
          <TopNav />

          {/* MAIN CONTENT */}
          <main className="main-content animate-fade-in">
            {children}
          </main>

          {/* BOTTOM NAV (Mobile Only) */}
          <BottomNav />

        </div>
      </body>
    </html>
  );
}
