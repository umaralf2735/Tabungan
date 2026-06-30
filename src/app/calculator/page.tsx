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
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Kalkulator AI & Dana Darurat</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Hitung rasio keuangan ideal dan target dana daruratmu.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Kolom Input */}
        <section className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Masukkan Data Bulanan</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Total Pemasukan (Gaji, Bisnis, dll)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>Rp</span>
              <input 
                type="number" 
                value={income} 
                onChange={e => setIncome(e.target.value)} 
                placeholder="0"
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Pengeluaran Tetap/Wajib (Kosan, Listrik, Cicilan)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>Rp</span>
              <input 
                type="number" 
                value={fixedExpense} 
                onChange={e => setFixedExpense(e.target.value)} 
                placeholder="0"
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)' }} 
              />
            </div>
          </div>
          
          {sisa < 0 && (
            <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              ⚠️ Pengeluaran wajibmu lebih besar dari pendapatan!
            </div>
          )}
        </section>

        {/* Kolom Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <section className="card" style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '1rem' }}>Target Dana Darurat (Emergency Fund)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Dana yang harus tersedia (cash/tabungan cair) untuk berjaga-jaga jika terjadi musibah atau kehilangan pekerjaan. Minimal 3-6 kali pengeluaran bulanan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Minimal (3 Bulan)</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>Rp {emergencyMin.toLocaleString('id-ID')}</p>
              </div>
              <div style={{ color: 'var(--color-text-muted)' }}>—</div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Ideal (6 Bulan)</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>Rp {emergencyMax.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </section>

          <section className="card" style={{ border: '1px solid rgba(37, 99, 235, 0.3)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>Rekomendasi Budget (Rule 50/30/20)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Metode penganggaran ideal untuk membagi gajimu berdasarkan persentase.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Kebutuhan Pokok (50%)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Sewa, Makan, Listrik, Transport</div>
                </div>
                <div style={{ fontWeight: 700 }}>Rp {needs.toLocaleString('id-ID')}</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Keinginan (30%)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Hiburan, Jajan, Hobi, Nongkrong</div>
                </div>
                <div style={{ fontWeight: 700 }}>Rp {wants.toLocaleString('id-ID')}</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>Tabungan / Investasi (20%)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Dana Darurat, Saham, Emas</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>Rp {savings.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
