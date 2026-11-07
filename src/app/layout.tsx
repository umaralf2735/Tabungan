import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { TopNav, BottomNav, MainStage } from '@/components/AppNav';

export const metadata: Metadata = {
  title: 'FinanceFlow Pro - Aplikasi Pengelola Keuangan Pribadi',
  description: 'Catat pemasukan, pengeluaran, kelola multi-wallet, dan atur anggaran bulananmu.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
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
          <MainStage>
            {children}
          </MainStage>

          {/* BOTTOM NAV (Mobile Only) */}
          <BottomNav />

        </div>
      </body>
    </html>
  );
}
