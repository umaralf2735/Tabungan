'use client';
import { useState } from 'react';

export default function CalculatorPage() {
  const [income, setIncome] = useState<string>('');
  const [fixedExpense, setFixedExpense] = useState<string>('');
  
  // Perhitungan
  const inc = parseFloat(income) || 0;
  const exp = parseFloat(fixedExpense) || 0;
  const sisa = inc - exp;

  // 50/30/20 Rule
  const needs = inc * 0.50;
  const wants = inc * 0.30;
  const savings = inc * 0.20;

  // Dana Darurat (3 - 6 bulan pengeluaran rutin)
  const emergencyMin = exp * 3;
  const emergencyMax = exp * 6;

  return (
    <div className="animate-fade-in">
      <header className="mb-4">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Kalkulator Finansial</h2>
        <p className="text-xs text-muted">Hitung rasio ideal & dana darurat</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Kolom Input */}
        <section className="card-glass" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Data Bulanan</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Pemasukan (Gaji, Bisnis, dll)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Rp</span>
              <input 
                type="number" 
                value={income} 
                onChange={e => setIncome(e.target.value)} 
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', fontSize: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Pengeluaran Wajib (Kosan, Cicilan)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Rp</span>
              <input 
                type="number" 
                value={fixedExpense} 
                onChange={e => setFixedExpense(e.target.value)} 
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', fontSize: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)' }} 
              />
            </div>
          </div>
          
          {sisa < 0 && (
            <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.3)', fontSize: '0.75rem' }}>
              ⚠️ Pengeluaran wajibmu lebih besar dari pendapatan!
            </div>
          )}
        </section>

        {/* Target Dana Darurat */}
        <section className="card-glass" style={{ border: '1px solid rgba(139, 92, 246, 0.3)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-secondary)' }}>Target Dana Darurat</h3>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Tabungan proteksi minimal 3x - 6x pengeluaran wajib bulanan.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Min (3x)</p>
              <p style={{ fontSize: '1rem', fontWeight: 700 }}>Rp {emergencyMin.toLocaleString('id-ID')}</p>
            </div>
            <div style={{ color: 'var(--color-text-muted)' }}>—</div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Ideal (6x)</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>Rp {emergencyMax.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </section>

        {/* Rule 50/30/20 */}
        <section className="card-glass" style={{ border: '1px solid rgba(37, 99, 235, 0.3)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>Rekomendasi 50/30/20</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pokok (50%)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Sewa, Makan, Listrik</div>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Rp {needs.toLocaleString('id-ID')}</div>
            </div>
            
            <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Keinginan (30%)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Hiburan, Jajan, Hobi</div>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Rp {wants.toLocaleString('id-ID')}</div>
            </div>
            
            <div className="flex-between">
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)' }}>Tabungan (20%)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Investasi, Dana Darurat</div>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)' }}>Rp {savings.toLocaleString('id-ID')}</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
