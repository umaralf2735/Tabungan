import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Personal Finance Tracker',
  description: 'Manage your daily finances with a clean, minimal, professional interface.',
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
              <a href="/goals" className="nav-link">Target Tabungan</a>
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
