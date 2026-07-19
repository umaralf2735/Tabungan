<div align="center">
  <img src="https://img.icons8.com/fluent/96/000000/wallet.png" alt="FinanceFlow Logo" width="80"/>
  <h1>FinanceFlow Pro</h1>
  <p><strong>Premium Personal Finance Dashboard</strong></p>
  
  <p>
    <a href="#fitur-utama">Fitur</a> •
    <a href="#teknologi">Teknologi</a> •
    <a href="#instalasi">Instalasi</a>
  </p>
</div>

---

## 📖 Tentang Aplikasi
**FinanceFlow Pro** adalah aplikasi manajemen keuangan pribadi (*Personal Finance*) yang dirancang dengan **Titanium Design System**—menawarkan antarmuka modern, elegan (berbasis *glassmorphism*), dan pengalaman pengguna kelas atas ala *startup fintech*. 

Aplikasi ini tidak hanya fokus pada pencatatan keuangan, tetapi juga analisis kas bulanan, target tabungan, dan keamanan akun yang ketat (menggunakan validasi OTP via Email).

---

## ✨ Fitur Utama

- 🔐 **Autentikasi Bank-Grade**: 
  - Login dan Registrasi aman dengan enkripsi `Bcrypt`.
  - Pemulihan kata sandi (Lupa Sandi) menggunakan **Kode OTP via Email** (Integrasi *Nodemailer*).
- 💰 **Manajemen Multi-Dompet**: Buat dan pantau saldo dari berbagai dompet (Rekening, E-Wallet, Uang Tunai) secara terpisah.
- 📊 **Analitik & AI Insight**:
  - Grafik Area dinamis (6 bulan terakhir) menggunakan `Recharts`.
  - Peringatan pintar (FinanceFlow AI) jika pengeluaran kategori tertentu melebihi batas wajar.
- 🖨️ **Ekspor Laporan Keuangan**:
  - Unduh data riwayat transaksi dalam format **Excel (CSV)**.
  - Cetak otomatis dalam format **Struk PDF Thermal** elegan (menggunakan `jsPDF`).
- 🎨 **Titanium UI (Premium UX)**: Tema gelap (*Dark Mode*), animasi transisi mulus, dan kartu melayang bergaya *Glassmorphism*.

---

## 🚀 Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur modern (*Fullstack*):

- **Frontend:** Next.js 15 (App Router), React, TypeScript.
- **Styling:** Vanilla CSS (Titanium Design System).
- **Backend/API:** Next.js Route Handlers.
- **Database:** PostgreSQL (Cloud Database by Neon DB).
- **ORM:** Prisma.
- **Lainnya:** Nodemailer (SMTP), jsPDF (PDF Generator), Recharts (Data Visualization).
- **Deployment:** Vercel.

---

## 🛠️ Instalasi (Menjalankan secara Lokal)

Ikuti langkah-langkah berikut untuk menjalankan aplikasi ini di komputer Anda:

1. **Clone repository ini**
   ```bash
   git clone https://github.com/USERNAME_ANDA/financeflow.git
   cd financeflow
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env` di folder utama (root) dan masukkan konfigurasi berikut:
   ```env
   # Koneksi ke PostgreSQL Database (Bisa pakai Neon DB / Supabase)
   DATABASE_URL="postgresql://username:password@host:port/database"
   
   # JWT Secret untuk Autentikasi
   JWT_SECRET="isi_dengan_kunci_rahasia_bebas_yang_panjang"
   
   # Konfigurasi SMTP Nodemailer (Gmail disarankan)
   EMAIL_USER="email.anda@gmail.com"
   EMAIL_PASS="app_password_google_anda"
   ```

4. **Sinkronisasi Database (Prisma)**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

---

<div align="center">
  <i>Dibuat dengan ❤️ untuk Portofolio Profesional</i>
</div>
