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
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <aside className="sidebar" style={{ width: '250px', padding: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '2rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FinanceFlow
            </h1>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="/" style={{ fontWeight: 500, padding: '0.75rem', borderRadius: 'var(--radius-md)', transition: 'background 0.2s', ...({':hover': {background: 'rgba(255,255,255,0.1)'}}) }}>Dashboard</a>
              <a href="/transactions" style={{ fontWeight: 500, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>Transaksi</a>
              <a href="/goals" style={{ fontWeight: 500, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>Target Tabungan</a>
              <a href="/auth/login" style={{ fontWeight: 500, padding: '0.75rem', borderRadius: 'var(--radius-md)', marginTop: 'auto', color: 'var(--color-danger)' }}>Keluar</a>
            </nav>
          </aside>
          <main className="animate-fade-in" style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', height: '100vh' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
