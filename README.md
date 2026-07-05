<div align="center">
  <img src="public/FinanceFlow.png" alt="FinanceFlow Logo" width="120" />
  <h1>💎 FinanceFlow Pro</h1>
  <p><strong>Aplikasi Pencatat Keuangan Pribadi (PWA) Sekelas Fintech Digital</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite" alt="SQLite" />
    <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa" alt="PWA" />
  </p>
</div>

---

## 🌟 Tentang Proyek Ini

**FinanceFlow Pro** adalah aplikasi manajemen keuangan pribadi berkonsep *Progressive Web App (PWA)* yang didesain khusus mengutamakan tampilan antarmuka *Mobile-First*. Terinspirasi dari estetika aplikasi perbankan digital premium (seperti Jago, Blu, atau DANA), aplikasi ini tidak hanya mencatat transaksi, tetapi memberikan nuansa *fintech* kelas atas di genggaman Anda.

## ✨ Fitur Unggulan

- 📱 **Progressive Web App (PWA)**: Dapat di-*install* langsung ke layar utama Android/iOS tanpa lewat App Store.
- 💳 **Multi-Dompet (Wallets)**: Kelola banyak sumber dana sekaligus (Cash, Rekening BCA, GoPay, dll).
- 📊 **Dashboard & Statistik Interaktif**: Visualisasi arus kas 6 bulan terakhir menggunakan grafik dinamis.
- 🧮 **Kalkulator 50/30/20 & Dana Darurat**: Sistem AI pintar untuk mengatur porsi anggaran ideal dan menghitung target tabungan Anda.
- 🧾 **Cetak Laporan Eksklusif**: Unduh laporan keuangan Anda dalam format file **CSV (Excel)** atau cetak **Struk PDF Premium** layaknya struk belanja sungguhan.
- 🎨 **Desain Glassmorphism**: UI yang elegan, rapi, dan nyaman di mata (mendukung *Dark Mode*).

---

## 🚀 Teknologi yang Digunakan

| Kategori | Teknologi |
| --- | --- |
| **Framework** | Next.js (App Router) / React |
| **Database & ORM** | SQLite & Prisma ORM |
| **Styling** | Vanilla CSS (CSS Variables & Glassmorphism) |
| **Icons & Charts** | Lucide React & Recharts |
| **PDF Engine** | jsPDF |

---

## 💻 Cara Menjalankan Secara Lokal (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan **FinanceFlow Pro** di komputer Anda sendiri:

### 1. Kloning Repositori
```bash
git clone https://github.com/username/FinanceFlow.git
cd FinanceFlow
```

### 2. Install Dependensi
Pastikan Anda sudah menginstal Node.js, lalu jalankan:
```bash
npm install
```

### 3. Setup Database (Prisma)
Aplikasi ini menggunakan SQLite secara bawaan agar mudah dijalankan tanpa *setup* server *database*.
```bash
npx prisma generate
npx prisma db push
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka `http://localhost:3000` di *browser* Anda untuk melihat aplikasinya.

---

## 📸 Panduan Install PWA di Android
1. Akses *link* *deploy* aplikasi https://finance-nu-black.vercel.app/ dari **Google Chrome** di HP Anda.
2. Klik tombol **Titik Tiga (⋮)** di pojok kanan atas.
3. Pilih **"Tambahkan ke Layar Utama" (Add to Homescreen)** atau **"Instal Aplikasi"**.
4. Selesai! FinanceFlow Pro kini terpasang di HP Anda layaknya aplikasi *Native*.

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk pengelolaan keuangan yang lebih cerdas.</p>
</div>
