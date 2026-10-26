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

## 🧪 Proses Desain & Riset (Interaction Design Lifecycle)

Dokumentasi ini merangkum proses perancangan interaksi dan riset pengguna untuk **FinanceFlow Pro** yang mengacu pada silabus perkuliahan **Desain Interaksi (CAK4IBB3) Telkom University (Minggu 1 – 7)**.

---

### 1. Pengantar IxD & Positioning (W01)

FinanceFlow Pro dirancang bukan sekadar sebagai alat pembukuan statis, melainkan agen mediasi finansial pribadi yang menyeimbangkan efisiensi kognitif dan kepuasan interaksi pengguna muda.

#### Tiga Pilar Pengalaman Pengguna (Easy, Effective, Enjoyable)
| Pilar | Definisi Konseptual | Bukti Fitur Konkret di FinanceFlow Pro |
| :--- | :--- | :--- |
| **Easy** | Meminimalkan beban kerja kognitif dan friksi entri data harian. | Form transaksi modal tunggal tanpa reload, eliminasi teks placeholder yang mengecoh persepsi, auto-numeric tabular font, dan bottom-navigation responsif pada mobile. |
| **Effective** | Memastikan tujuan finansial pengguna tercapai secara akurat dan tuntas. | Kalkulasi instan *Net Cash Flow*, pelacakan transfer antar-dompet (*multi-wallet balancing*), serta ekspor laporan riil (PDF struk termal belanjaan & CSV). |
| **Enjoyable** | Memberikan kepuasan sensorik, visual feedback, dan rasa kendali penuh. | Estetika *Dark Mode Titanium* berbasis *glassmorphism* (`#0B0F1A`, `#111827`), kurva tren interaktif Recharts yang responsif, dan haptic visual feedback instan. |

#### Kerangka Human-AI Teaming & Intelligence Amplification (IA)
FinanceFlow Pro menolak pendekatan otomasi penuh (*full automation*) yang mencabut kontrol dari tangan pengguna. AI Insight diposisikan sebagai instrumen **Intelligence Amplification (IA)**:
* **Bukan Otomasi Gelap (Black-box Automation):** AI tidak secara sepihak memotong anggaran atau mengunci rekening tanpa persetujuan pengguna.
* **Kolaborasi Kognitif (Human-AI Teaming):** AI bertindak sebagai analis latar belakang yang memproses pola pengeluaran 6 bulan, lalu menyodorkan ringkasan kontekstual sebagai bahan pertimbangan keputusan pengguna.

#### Pemetaan Tiga Prinsip Abadi Interaksi
1. **Intervention UI:** Rekomendasi penghematan atau peringatan defisit disajikan dalam bentuk *toast/banner action* terbuka. Pengguna memegang otoritas penuh untuk menerima, mengabaikan, atau menyesuaikan ambang batas anggaran.
2. **Safe Exploration:** Meminimalkan kecemasan pengguna (*fear of committing errors*). Penghapusan transaksi dan transfer dompet dilengkapi modal konfirmasi eksplisit, pemisahan rute mutasi, serta preview visual sebelum data dikomit ke database.
3. **Meaningful Mediation:** Sistem tidak menampilkan skor atau notifikasi samar. Peringatan anomali dijelaskan dengan bahasa alami berbasis kausalitas (mis. *"Pengeluaran kategori Makanan naik 38% dibanding rata-rata 3 bulan terakhir"*).

---

### 2. Emotional Design & Etika UX (W02)

#### Norman's 3 Levels of Design
| Level | Fokus Desain | Implementasi Konkret di FinanceFlow Pro |
| :--- | :--- | :--- |
| **Visceral** | Persepsi sensorik instan, impresi visual awal, daya tarik estetik. | Palet warna *Dark Mode Titanium* (`#0B0F1A`, `#111827`), aksen indigo primer (`#6366F1`), surface transparan dengan *backdrop-blur* (*glassmorphism*), serta kurva garis Recharts yang halus. |
| **Behavioral** | Efektivitas penggunaan, alur mulus, kejelasan feedback dan affordance. | Alur entri transaksi dalam satu layar ringkas, pencegahan eror validasi form, respon sistem sub-100ms, serta format ekspor PDF bergaya struk kasir yang fungsional. |
| **Reflective** | Makna personal, kebanggaan diri, dan persepsi status finansial. | Menumbuhkan rasa *"I am in control of my financial future"* melalui visibilitas kurva kekayaan bersih (*Net Worth*), metrik surplus bulanan, dan histori pembukuan yang rapi. |

#### Analisis Interaction Framework (Abowd & Beale)
Kasus: **Mencatat Pengeluaran Harian Baru**

```mermaid
sequenceDiagram
    autonumber
    participant U as User (Task)
    participant I as Input (Articulatory)
    participant S as System (Core)
    participant O as Output (Observational)
    
    U->>I: Translasi niat: Mengetuk tombol "+ Tambah" & memilih dompet
    Note over I,S: Potensi Translation Failure 1:<br/>Kategori ambigu / form terlalu panjang
    I->>S: Eksekusi HTTP POST /api/transactions
    Note over S,O: Potensi Translation Failure 2:<br/>Sistem gagal merespon / lag database
    S->>O: Saldo dompet terpotong, state transaksi diperbarui
    O->>U: Feedback visual: List terupdate + badge nominal berkurang
```
* **Translation Failure 1 (User $\to$ Input):** Pengguna bingung membedakan antara mutasi pengeluaran langsung vs transfer dompet.  
  * *Solusi Desain:* Segmented switch toggle eksplisit `[Reguler | Transfer]` di bagian paling atas form entri.
* **Translation Failure 2 (System $\to$ Output):** Pengguna ragu apakah data berhasil tersimpan karena loading lambat.  
  * *Solusi Desain:* Optimistic UI update, indikator loading spinner pada tombol submit, dan penutupan modal instan setelah status 200 OK.

#### Audit Dark Patterns
* **No Roach Motel:** Penghapusan dompet atau akun dilakukan secara transparan langsung dari antarmuka tanpa menyembunyikan tombol di balik multi-layer sub-menu.
* **No Confirmshaming:** Tombol pembatalan transaksi bertuliskan teks netral *"Batal"*, bukan teks manipulatif emosional (mis. *"Tidak, saya suka boros"*).
* **No Hidden Costs / Hidden Rules:** Transfer antar-dompet menampilkan saldo riil asal dan tujuan secara simetris tanpa potongan tersembunyi.
* **No False Urgency:** AI Insight tidak memicu kepanikan buatan (seperti timer hitung mundur pengeluaran atau peringatan berkedip merah terang yang menekan psikologis).

#### Checklist Aksesibilitas WCAG 2.2 (POUR)
| Kriteria WCAG | Status | Bukti Implementasi / Evaluasi |
| :--- | :---: | :--- |
| **Perceivable (1.4.3 Contrast Minimum)** | ✅ Lolos | Kontras teks utama (`#F1F5F9`) terhadap kanvas dasar (`#0B0F1A`) mencapai rasio > 12:1 (jauh melampaui standar AA 4.5:1). |
| **Perceivable (1.4.1 Use of Color)** | ✅ Lolos | Indikator tren finansial tidak hanya mengandalkan warna hijau/merah, tetapi wajib disertai glif panah terarah (`▲ / ▼ / —`). |
| **Operable (2.1.1 Keyboard Navigation)** | ✅ Lolos | Seluruh form dan modal dapat diakses penuh via tombol `Tab` dan `Enter` dengan visual outline fokus jelas. |
| **Operable (2.5.5 Target Size)** | ✅ Lolos | Seluruh tombol kontrol dan navigasi mobile memiliki area sentuh minimal $48 \times 48\text{ px}$. |
| **Understandable (3.3.2 Labels or Instructions)**| ✅ Lolos | Setiap input form memiliki `<label>` eksplisit di luar field (menghilangkan ketergantungan pada placeholder abu-abu). |
| **Robust (4.1.2 Name, Role, Value)** | ✅ Lolos | Komponen tombol navigasi telah dilengkapi `aria-label` ramah pembaca layar. |

#### Recognition over Recall
Pengguna tidak dituntut mengingat daftar saldo tiap rekening saat mencatat pengeluaran. Pilihan *dropdown* sumber dana secara otomatis menampilkan nama dompet beserta sisa saldo berjalan di sebelahnya (mis. *"BCA (Rp 2.450.000)"*).

---

### 3. Rencana & Hasil User Research (W03-W04)

#### Profil 6 Subjek Partisipan Riset (Berbasis Perilaku)
Riset melibatkan 6 orang partisipan yang dipilih berdasarkan variasi perilaku pengelolaan uang, bukan sekadar demografi usia:
* **P1 (Rian, 21):** Mahasiswa tingkat akhir; bertransaksi mikro via e-wallet 4-6x per hari; sering lupa mencatat pengeluaran kecil di bawah Rp 15.000.
* **P2 (Dina, 23):** *First-jobber* di bidang desain; perfeksionis; terbiasa memakai spreadsheet bulanan namun sering berhenti karena lelah memasukkan rumus.
* **P3 (Farhan, 22):** Mahasiswa perantau; memiliki 2 bank dan 3 e-wallet; sering melakukan transfer top-up antar-rekening yang membuat saldo catatannya selalu selisih.
* **P4 (Mega, 24):** Freelance copywriter; penghasilan tidak tetap per minggu; butuh visualisasi cepat sisa dana aman untuk belanja harian.
* **P5 (Budi, 22):** Mahasiswa teknik; sangat pragmatis; hanya mau menggunakan aplikasi jika proses entri data selesai di bawah 5 detik.
* **P6 (Siti, 20):** Bendahara organisasi kampus; butuh pemisahan tegas antara uang kas kepanitiaan dan uang jajan pribadi.

#### Opportunity Solution Tree (OST)
```mermaid
graph TD
    Outcome["Meningkatkan retensi pencatatan transaksi mingguan pengguna dari 30% ke 70%"]
    
    Opp1["O1: Pengguna sering malas membuka app karena form entri berbelit-belit"]
    Opp2["O2: Pengguna lupa mencatat mutasi saat transfer antar-rekening pribadi"]
    Opp3["O3: Pengguna merasa bersalah/stres melihat laporan keuangan yang rumit"]
    
    Sol1A["S1.1: Single-modal quick input tanpa reload"]
    Sol1B["S1.2: Pembersihan placeholder mengganggu & auto-focus"]
    Sol2A["S2.1: Fitur dedicated transfer saldo inter-wallet"]
    Sol3A["S3.1: AI Insight berbasis bahasa natural suportif"]
    Sol3B["S3.2: Ekspor struk belanja familiar ala minimarket"]
    
    Exp1["E1: A/B testing waktu pengisian form (Target: <10 detik)"]
    Exp2["E2: Wizard of Oz uji keterbacaan pesan AI Insight"]
    
    Outcome --> Opp1
    Outcome --> Opp2
    Outcome --> Opp3
    
    Opp1 --> Sol1A
    Opp1 --> Sol1B
    Opp2 --> Sol2A
    Opp3 --> Sol3A
    Opp3 --> Sol3B
    
    Sol1A --> Exp1
    Sol3A --> Exp2
```

#### Jobs-to-be-Done (JTBD) Framework
* **JTBD 1 (Konteks Friksi Entri):**  
  *When* saya sedang terburu-buru setelah bertransaksi di kasir atau membuka aplikasi banking,  
  *I want to* mencatat nominal dan kategori pengeluaran hanya dalam beberapa ketukan cepat,  
  *So I can* menjaga data pembukuan saya tetap akurat tanpa mengganggu aktivitas saya saat itu. *(Sumber: P1 & P5, Wawancara)*
* **JTBD 2 (Konteks Multi-Platform Saldo):**  
  *When* saya memindahkan saldo dari bank utama ke dompet digital harian,  
  *I want to* sistem mencatat mutasi tersebut sebagai pemindahan dana dan bukan pengeluaran konsumtif,  
  *So I can* melihat saldo riil masing-masing instrumen tanpa merusak kalkulasi surplus bulanan saya. *(Sumber: P3, Observasi)*
* **JTBD 3 (Konteks Evaluasi Finansial):**  
  *When* akhir bulan tiba dan saya mengevaluasi kondisi dompet saya,  
  *I want to* membaca ringkasan performa finansial dalam format yang manusiawi dan struk yang rapi,  
  *So I can* merencanakan anggaran bulan depan tanpa merasa terintimidasi oleh tabel akuntansi yang rumit. *(Sumber: P2 & P6, Wawancara)*

#### Triangulasi Data (Kualitatif vs Kuantitatif)
* **Kualitatif ($N = 6$ partisipan):** Menggali aspek *why* dan *how* melalui wawancara mendalam 60 menit; mengungkap faktor kecemasan finansial saat saldo menipis dan kebiasaan mencatat mandiri di grup WhatsApp pribadi.
* **Kuantitatif ($N = 28$ responden mahasiswa):** Pengujian kuesioner awal membuktikan bahwa $82\%$ responden memiliki lebih dari 2 e-wallet, dan $75\%$ menyatakan saldo e-wallet mereka selalu berselisih dengan pembukuan manual karena mengabaikan mutasi transfer.
* **Triangulasi:** Temuan kualitatif P3 terkonfirmasi secara kuat oleh data survei kuantitatif: masalah utama user bukan ketiadaan aplikasi, melainkan rumitnya sinkronisasi multi-akun.

#### Kuesioner Bebas Bias (Contoh Desain Item)
1. **Menghindari Leading Question:**  
   * *Revisi Netral:* "Bagaimana penilaian Anda terhadap kemudahan navigasi antarmuka FinanceFlow?" (Skala 1 = Sangat Sulit, 5 = Sangat Mudah).
2. **Menghindari Double-Barreled:**  
   * *Revisi:* Dipisah menjadi 2 pertanyaan spesifik: (a) Efisiensi pengisian form, dan (b) Kelengkapan opsi kategori bawaan.
3. **Menghindari Social Desirability Bias:**  
   * *Pertanyaan Reflektif:* "Dalam 7 hari terakhir, berapa kali Anda menunda atau melewatkan pencatatan pengeluaran harian Anda?" (Pilihan frekuensi objektif).
4. **Single Ease Question (SEQ):** "Secara keseluruhan, seberapa mudah tugas menambahkan transaksi baru ini diselesaikan?" (Skala 1–7 pasca-task).
5. **Net Promoter/Satisfaction Index:** Pengukuran netral tingkat kegunaan fitur ekspor struk PDF.

#### Eksperimen Validasi Cepat & Etika Riset
* **Wizard of Oz Testing (AI Insight):** Sebelum modul model bahasa terpasang penuh, tim mensimulasikan peringatan AI secara manual untuk mengukur reaksi 6 partisipan terhadap bahasa notifikasi yang digunakan.
* **Etika Riset:** Seluruh partisipan menandatangani *Informed Consent Form*, data identitas dan nominal rekening disamarkan (*anonymized data*), hak mundur dijamin penuh, serta penerapan *Privacy by Design* pada penyimpanan data lokal.

---

### 4. Design Thinking (W05)

#### Alur 5 Tahap d.school & Non-Linear Feedback Loops
```mermaid
graph LR
    E[Empathize] --> D[Define]
    D --> I[Ideate]
    I --> P[Prototype]
    P --> T[Test]
    
    T -.->|Loop Balik 1: User kebingungan melihat form placeholder| I
    T -.->|Loop Balik 2: Format PDF kaku ditolak pengguna| P
    D -.->|Evaluasi Kebutuhan Baru: Mode Transfer| E
```
* **Loop Balik 1 (Test $\to$ Ideate):** Pada sesi uji prototipe, P1 dan P5 mengira kolom kategori sudah terisi karena adanya placeholder abu-abu `"Misal: Makanan"`. Tim kembali ke sesi ideasi mikro untuk menghapus seluruh placeholder bayangan dari seluruh aplikasi.
* **Loop Balik 2 (Test $\to$ Prototype):** Hasil ekspor PDF tabel konvensional dikritik oleh P2 dan P6 karena kaku mirip laporan pajak. Tim memutar kembali perancangan prototipe menuju visualisasi struk termal belanjaan kasir (*receipt-style*).

#### Empathy Map (Primary Persona: Dimas Pratama)
* **Says:** *"Saya malas kalau mau nyatat pengeluaran seribu dua ribu saja harus isi banyak kolom."*
* **Thinks:** *"Uang saya di e-wallet kok tiba-tiba habis ya, padahal rasanya baru kemarin isi saldo?"*
* **Does:** Mencatat mutasi sesekali di WhatsApp pribadi, sering membiarkan struk transaksi menumpuk tanpa direkap.
* **Feels:** Cemas saat memeriksa saldo rekening di akhir bulan; merasa bersalah saat gagal menyisihkan tabungan.
* **Pains:** Overwhelmed oleh grafik akuntansi konvensional; lelah memasukkan data berulang.
* **Gains:** Visual ringkas status keuangan dalam 3 detik, kebebasan eksplorasi tanpa takut salah pencet.

#### User Journey Map
**Goal:** Mencatat pengeluaran makan siang dan memeriksa sisa anggaran harian.

| Fase | Aksi Pengguna | Titik Sentuh UI | Kurva Emosi | Pain Point / Isu | Peluang Inovasi |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **1. Trigger** | Selesai bayar via QRIS, berniat mencatat sebelum lupa. | Notifikasi HP / Memori | 😐 Netral | Sering terdistraksi chat lain. | Widget pintasan cepat di layar utama. |
| **2. Buka App** | Membuka FinanceFlow Pro via browser mobile. | Splash / Navbar | 🙂 Senang | Loading awal jika jaringan lambat. | PWA caching & skeleton state rendering. |
| **3. Entri Data** | Memilih dompet, mengisi nominal & kategori. | Modal Form Transaksi | 🙁 Turun | Terkecoh teks placeholder abu-abu. | Kolom bersih murni, auto-numeric tabular input. |
| **4. Review Saldo** | Melihat grafik pertumbuhan dan sisa saldo dompet. | Net Worth Recharts | 😊 Naik | Skala grafik flat jika data baru sedikit. | Skala sumbu Y dinamis (`dataMin`, `dataMax`). |
| **5. Tindak Lanjut**| Membaca pesan insight status pengeluaran. | Banner AI Insight | 😃 Puas | Khawatir data bocor ke pihak ketiga. | Penegasan enkripsi lokal & transparansi data. |

#### Assumption Mapping (2x2 Matrix)
| Kuadran | Deskripsi Asumsi | Rencana Mitigasi / Validasi |
| :--- | :--- | :--- |
| **High Risk & Unknown** *(Prioritas 1)* | Pengguna percaya dan bersedia membaca saran finansial otomatis dari AI Insight tanpa merasa dihakimi. | Validasi mendalam via *Wizard of Oz testing* dan penyesuaian gaya bahasa menjadi empatik. |
| **High Risk & Known** *(Prioritas 2)* | Pengguna membutuhkan pencatatan transfer antar-dompet secara terpisah agar tidak dianggap pengeluaran ganda. | Fitur mutasi transfer dijadikan fungsionalitas inti pada rilis MVP rute `/api/transactions/transfer`. |
| **Low Risk & Known** *(Prioritas 3)* | Dark mode dengan kontras tinggi lebih disukai pengguna saat mengakses aplikasi di malam hari. | Implementasi tema Titanium berbasis CSS Variables standar token WCAG AA. |
| **Low Risk & Unknown** *(Prioritas 4)* | Pengguna membutuhkan ekspor data ke format CSV untuk analisis spreadsheet tingkat lanjut. | Disediakan sebagai secondary utility action pada halaman laporan. |

#### User Story Mapping
* **Backbone (Alur Kronologis):**  
  Autentikasi Akun $\to$ Konfigurasi Dompet $\to$ Pencatatan Transaksi $\to$ Monitoring Dashboard $\to$ Evaluasi Laporan Bulanan.
* **Release Slices:**
  * **Walking Skeleton / MVP (Selesai):** Registrasi + OTP, CRUD dompet multi-kategori, pencatatan transaksi masuk/keluar/transfer, dashboard metrik 4-kartu, grafik garis dinamis.
  * **Release 2 (Selesai):** AI Insight analitik otomatis, ekspor PDF struk belanja interaktif, optimasi zero-placeholder form.

#### Ideation: HMW & Crazy 8s
* **Daftar HMW:**
  1. *HMW* membuat proses mencatat pengeluaran semudah membalas pesan teks singkat?
  2. *HMW* membedakan mutasi pemindahan dana antar-dompet tanpa membingungkan neraca kas?
  3. *HMW* mengomunikasikan kondisi defisit keuangan tanpa memicu kepanikan emosional pengguna?
  4. *HMW* menyajikan ringkasan keuangan dalam format yang menyenangkan untuk dibagikan atau disimpan?
  5. *HMW* mencegah pengguna salah mengira label contoh input sebagai data yang sudah tersimpan?
* **Sesi Crazy 8s & Dot Voting:** Dari 8 sketsa cepat antarmuka input transaksi, ide formulir *compact card-glass* dengan tombol pintas aksi mendapat suara tertinggi (dot voting mutlak dari tim). Ide form beranak (*multi-step wizard*) dieliminasi karena memperlambat pengisian.

---

### 5. Design Research & Problem Framing (W06)

#### Protokol Wawancara Mendalam (60 Menit)
* **00–05 (Warm-up & Consent):** Perkenalan, penjelasan tujuan riset, penegasan anonimitas, dan penandatanganan lembar persetujuan.
* **05–15 (Konteks Perilaku):** Menggali rutinitas finansial harian: *"Bisa ceritakan bagaimana alur uang Anda mengalir sejak gajian atau transfer bulanan diterima?"*
* **15–45 (Core Deep Dive & Critical Incident):**
  * *"Ceritakan momen terakhir kali Anda mendapati saldo salah satu dompet Anda tidak sesuai dengan ingatan Anda. Apa yang Anda lakukan?"*
  * Penggalian 5 Whys terhadap alasan berhenti menggunakan aplikasi finansial sebelumnya.
* **45–55 (Wrap-up & Testing):** Evaluasi tugas langsung menggunakan prototipe interaktif; pengamatan kendala navigasi.
* **55–60 (Penutup):** Tanggapan terbuka, apresiasi, dan pemberian kompensasi partisipasi.

#### Contoh Perbaikan Pertanyaan (Menghindari Bias)
| Pertanyaan Awal (Bias / Leading) | Masalah Metodologi | Pertanyaan Netral Hasil Revisi |
| :--- | :--- | :--- |
| *"Apakah Anda merasa aplikasi spreadsheet terlalu rumit untuk mencatat keuangan?"* | Mengarahkan responden untuk memvalidasi opini bahwa spreadsheet itu rumit. | *"Bagaimana pengalaman Anda sejauh ini ketika menggunakan spreadsheet untuk mencatat transaksi harian?"* |
| *"Bukankah fitur AI yang mengingatkan anggaran boros itu sangat penting?"* | Social desirability & leading bias terhadap kecerdasan buatan. | *"Bagaimana preferensi Anda ketika sebuah sistem memberikan saran terkait pola belanja Anda?"* |
| *"Seberapa sering Anda memakai e-wallet karena malas membawa uang tunai?"* | Mengasumsikan motif malas sebagai satu-satunya pendorong. | *"Apa saja faktor yang biasanya memengaruhi keputusan Anda dalam memilih metode pembayaran saat berbelanja?"* |

#### Catatan Observasi Kerangka AEIOU & Unspoken Behavior
* **Activities:** Pengguna membuka m-Banking $\to$ mengecek sisa saldo $\to$ berpindah membuka aplikasi catatan $\to$ mengetik nominal seadanya.
* **Environments:** Mayoritas dilakukan di ruang publik (kasir minimarket, antrean kafetaria) dengan tingkat distraksi tinggi dan koneksi fluktuatif.
* **Interactions:** Gestur satu tangan (*single-thumb interaction*); ketukan cepat dan tergesa-gesa.
* **Objects:** Smartphone berlayar 6.1–6.7 inci, struk fisik kertas yang sering terlipat atau langsung dibuang ke tempat sampah.
* **Users:** Mahasiswa dan pekerja awal usia 19–25 tahun.
* **Unspoken Behavior & Workaround Teramati:** Saat mentransfer uang dari Bank ke e-wallet, user terbiasa menuliskan deskripsi *"Pindah dana"* di grup WhatsApp pribadi yang dibuat khusus untuk dirinya sendiri sebagai repositori sementara.

#### Gap "Saying vs Doing"
* **Saying:** *"Saya orangnya teliti, setiap malam pasti merekap semua pengeluaran hari ini secara tertib."* (Dinyatakan oleh P1 & P4).
* **Doing (Kenyataan Lapangan):** Berdasarkan rekaman riwayat transaksi di smartphone partisipan, jeda pencatatan riil mencapai 4–5 hari sekali, dan kategori pengeluaran kecil di bawah Rp 10.000 hampir seluruhnya diabaikan hingga saldo selisih ratusan ribu rupiah. *(Sumber: P1 & P4, Observasi Langsung)*

#### JTBD Forces of Progress
```
            PUSH of Current Situation                 PULL of New Solution
        (Saldo sering selisih, rasa cemas           (Pencatatan 5 detik, multi-wallet
         rekap manual di spreadsheet)              terintegrasi, AI Insight edukatif)
                       \                                  /
                        \                                /
                         =====[ KEPUTUSAN ADOPSI ]======
                        /                                \
                       /                                  \
             ANXIETY of New Solution               HABIT of Current Practice
        (Takut data keuangan bocor,               (Kebiasaan cuek, mager buka
         bingung istilah akuntansi)                aplikasi terpisah setiap bayar)
```
* **Kalkulasi Adopsi:** $\text{Push} + \text{Pull} > \text{Anxiety} + \text{Habit}$.  
  Kecemasan dieliminasi lewat proteksi OTP email dan transparansi visual lokal, sementara resistensi kebiasaan (*habit*) diatasi dengan mempercepat form input menjadi instan.

#### Affinity Diagram & 3 Key Insights
* **Tema 1: Friksi Kecepatan Input Data**
  * *Insight Note 1:* Pengguna mengalami *cognitive drop-off* apabila diwajibkan mengisi lebih dari 4 kolom formulir untuk satu item pengeluaran kecil. *(Sumber: P1, P5)*
* **Tema 2: Ilusi Defisit Akibat Pemindahan Saldo**
  * *Insight Note 2:* Fitur transfer antar-rekening yang dihitung sebagai "pengeluaran konsumtif" merusak motivasi pencatatan karena laporan bulanan tampak merah (*false deficit*). *(Sumber: P3)*
* **Tema 3: Kebutuhan Umpan Balik yang Memanusiakan**
  * *Insight Note 3:* Pengguna merespons positif data yang disajikan menyerupai artefak dunia nyata yang akrab (struk kasir belanja) daripada grafik batang akuntansi korporat. *(Sumber: P2, P6)*

#### POV Statement & HMW Sweet Spot
* **Point of View (POV):**  
  *Mahasiswa dan first-jobber dengan banyak instrumen pembayaran* **membutuhkan cara untuk** *memverifikasi status dan mutasi saldo multi-dompet secara instan dalam hitungan detik* **karena** *ketidaksesuaian pencatatan manual memicu kecemasan finansial dan keputusasaan dalam mengelola uang harian.*
* **Tiga HMW (Sweet Spot Level):**
  1. *HMW* merancang alur transfer inter-wallet yang otomatis menyeimbangkan dua buku kas dalam satu ketukan?
  2. *HMW* menyajikan ringkasan riwayat pengeluaran dalam representasi visual artefak fisik yang familier dan menyenangkan?
  3. *HMW* mereduksi beban persepsi pada form entri agar pengguna tidak merasa sedang mengisi formulir birokrasi?

---

### 6. Persona & Mental Model (W07)

#### Matriks Variabel Perilaku & Klastering
| Variabel Perilaku | Kontinum Kiri | Distribusi 6 Partisipan | Kontinum Kanan |
| :--- | :---: | :---: | :---: |
| **Frekuensi Transaksi Digital** | Sporadis (1-2x/minggu) | `--- P2 -------- P6 -- P1 - P4 - P5 - P3 ---` | Ekstrem (>5x/hari) |
| **Jumlah Dompet/Rekening Aktif**| Tunggal (1 akun) | `--- P2 ----- P6 ---- P1 --- P4 - P5 - P3 ---` | Kompleks (>4 e-wallet/bank) |
| **Sikap terhadap Rekapitulasi** | Spontan / Santai | `--- P5 - P3 -- P1 -------- P4 --- P6 - P2 ---` | Perfeksionis / Terjadwal |
| **Literasi Konsep Akuntansi**   | Awam / Intuitif | `--- P1 ---- P5 - P3 -------- P4 - P6 - P2 ---` | Mahir (Paham Debit/Kredit) |
| **Kebutuhan Evaluasi Finansial**| Cukup Tahu Saldo Akhir | `--- P5 - P3 -------- P1 -- P4 --- P6 - P2 ---` | Butuh Analisis Tren & Prediksi |

*Klaster Utama (P1, P3, P4, P5): Mengelompok kuat pada transaksi digital tinggi, multi-dompet aktif, namun awam akuntansi formal $\to$ Menjadi basis pembentukan **Primary Persona**.*

#### Behavioral Persona Set

```
+----------------------------------------------------------------------------------------------------+
| PRIMARY PERSONA                                                                                    |
| Dimas Pratama (23) - Fresh Graduate & Junior Developer                                            |
| "Uang saya nyebar di mana-mana; saya cuma mau tahu hari ini aman jajan atau harus ngerem."          |
+----------------------------------------------------------------------------------------------------+
| BEHAVIORAL PROFILE:                                                                                |
| - Menggunakan 2 bank (payroll & tabungan) serta 3 e-wallet (GoPay, OVO, ShopeePay).                |
| - Melakukan 4-6 transaksi mikro digital setiap hari.                                               |
| - Selalu membuka aplikasi dengan satu tangan saat berjalan santai atau mengantre.                   |
+----------------------------------------------------------------------------------------------------+
| CORE USER GOALS:                                                                                   |
| - Behavioral: Memasukkan nominal pengeluaran dalam waktu kurang dari 5 detik pasca-transaksi.      |
| - Behavioral: Memantau saldo riil kas tanpa harus login bergantian ke 4 aplikasi perbankan berbeda.|
| - Reflective: Merasa tenang dan percaya diri bahwa gaya hidupnya tidak melampaui kemampuan gaji.   |
+----------------------------------------------------------------------------------------------------+
| PAIN POINTS:                                                                                       |
| - Stres melihat form pembukuan yang menanyakan "Akun Kredit vs Debit".                             |
| - Saldo aplikasi pencatat sering berselisih jauh dengan saldo ATM riil akibat lupa catat transfer. |
| - Teks form yang membingungkan / placeholder yang disangka data riil.                              |
+----------------------------------------------------------------------------------------------------+
| ENVIRONMENT:                                                                                       |
| - Smartphone Android 6.5", koneksi 4G perkotaan, tingkat distraksi tinggi (kantor & tempat makan). |
+----------------------------------------------------------------------------------------------------+
| KEY SCENARIO:                                                                                      |
| - Dimas baru saja mentransfer Rp 100.000 dari rekening utama ke e-wallet untuk makan siang.        |
|   Ia membuka FinanceFlow, memilih mode Transfer, dan dalam 4 detik saldo keduanya tersinkronisasi. |
+----------------------------------------------------------------------------------------------------+
```

```
+----------------------------------------------------------------------------------------------------+
| SECONDARY PERSONA                                                                                  |
| Sarah Amanda (20) - Mahasiswi & Pengurus Organisasi Kampus                                         |
| "Pengeluaran pribadi jangan sampai kecampur sama uang kas acara kampus."                           |
+----------------------------------------------------------------------------------------------------+
| BEHAVIORAL PROFILE:                                                                                |
| - Sangat visual, menyukai tampilan dark mode rapi dan estetik.                                     |
| - Memerlukan rekapitulasi pengeluaran bulanan berkala untuk dilaporkan ke orang tua.                |
| CORE GOALS:                                                                                        |
| - Memisahkan kantong dana pribadi dan kantong kas amanah kegiatan kampus.                          |
| - Mencetak ringkasan mutasi yang rapi dan mudah dibaca (struk kasir PDF) untuk bukti klaim/arsip.  |
| PAIN POINTS:                                                                                       |
| - Aplikasi keuangan lain menghasilkan ekspor data CSV mentah yang berantakan saat dibuka di HP.    |
+----------------------------------------------------------------------------------------------------+
```

```
+----------------------------------------------------------------------------------------------------+
| ANTI-PERSONA (Bukan Target Kami - Mencegah Scope Creep)                                            |
| Pak Bambang (48) - Pemilik Usaha Grosir Sembako & Wajib Pajak Badan                                |
| "Saya butuh sistem double-entry, invoice faktur pajak, dan depresiasi aset gudang."               |
+----------------------------------------------------------------------------------------------------+
| ALASAN EKSKLUSI:                                                                                   |
| - Membutuhkan standar akuntansi PSAK/IFRS, jurnal buku besar, pembukuan piutang rumit, dan invoice.|
| - Memaksakan kebutuhan Pak Bambang ke FinanceFlow Pro akan merusak prinsip "Easy & Simple"         |
|   bagi pengguna harian, mengubah antarmuka menjadi perangkat lunak ERP yang membebani kognisi.    |
+----------------------------------------------------------------------------------------------------+
```

#### Hirarki Tujuan Norman (Dimas Pratama)
* **Visceral Goal:** *"Saya ingin antarmuka yang terlihat keren, elegan, dan membuat saya merasa melek finansial setiap kali membukanya."*
* **Behavioral Goal:** *"Saya ingin mencatat pengeluaran es kopi Rp 22.000 hanya dengan 3 ketukan layar tanpa harus mikir panjang."*
* **Reflective Goal:** *"Saya ingin menjadi orang dewasa muda yang bertanggung jawab, mandiri secara finansial, dan tidak terlilit utang konsumtif."*

#### Mental Model Diagram (Indi Young Alignment)
| Fase Aktivitas Mental Pengguna | Model Mental & Perilaku Batin Pengguna | Fitur Pendukung FinanceFlow Pro | Analisis Kesenjangan (Gap Analysis) |
| :--- | :--- | :--- | :--- |
| **1. Pengalokasian Dana** | Membayangkan uang dipisah dalam kotak fisik (kotak tabungan, kotak jajan). | Pengelolaan Multi-Wallet dinamis (BCA, DANA, Tunai). | **Supported:** Konsep kartu visual mewakili kotak fisik. |
| **2. Transaksi Harian** | Menganggap pindah saldo antar-rekening sebagai *"geser uang"*, bukan belanja. | Mode Khusus Transfer Dompet interaktif. | **Supported:** Mengatasi eror pembukuan ganda. |
| **3. Pengecekan Rutin** | Ingin kepastian apakah kondisi dompet saat ini masuk zona aman atau bahaya. | Kartu Metrik Net Cash Flow & Tren MoM dinamis. | **Supported:** Indikator visual instan tanpa hitung kalkulator. |
| **4. Evaluasi Akhir Bulan** | Ingin bukti fisik yang ringkas seperti mengecek struk belanjaan belanja bulanan. | Ekspor Struk Termal PDF (Alfamart-style). | **Supported:** Familiaritas artefak dunia nyata. |
| **5. Perencanaan Masa Depan**| Khawatir jika pola makan boros akan mengorbankan cicilan masa depan. | *[Fitur Masa Depan: Proyeksi AI 12 Bulan ke Depan]* | **Unsupported Mental Model (Peluang Inovasi R3).** |
| *Bloated Features (Dieliminasi)*| Pengaturan kode akun buku besar (Chart of Accounts / COA 4-digit). | Dihapus sepenuhnya dari sistem. | Mencegah kelebihan fitur akuntansi (*feature bloat*). |

#### Resolusi Konflik: Conceptual Model vs. Mental Model
* **Konflik:** Pada model konseptual akuntansi perbankan, pemindahan uang antar-rekening dicatat sebagai *Debit Akun A dan Kredit Akun B*. Namun, model mental pengguna awam memandangnya sebagai tindakan sederhana: *"Menggeser uang dari kantong kanan ke kantong kiri"*.
* **Solusi Desain:** Antarmuka FinanceFlow Pro menolak terminologi debit/kredit. Sistem menyediakan layar transfer intuitif dengan visual representasi asal $\to$ tujuan (`Dari Dompet [ ... ] Ke Dompet [ ... ]`), sementara urusan mutasi ganda diselesaikan di balik layar secara otomatis oleh sistem basis data.

#### Persona sebagai Lensa Keputusan Desain (Design Lens)
1. **Skenario Prioritas Fitur:** Ketika muncul usulan menambahkan *"Sub-kategori tak terbatas beranak 3 level"*, tim mengujinya dengan persona Dimas: *Apakah Dimas yang sedang berdiri di kasir akan mengisi sub-kategori sedalam itu?* **Keputusan: Ditolak.** Cukup satu level kategori cepat.
2. **Design Critique Resolusi Placeholder:** Saat placeholder input form dikeluhkan membingungkan oleh P1 dan P5, tim bertanya: *Apakah Sarah yang teliti terbantu dengan contoh abu-abu itu atau malah terkecoh?* **Keputusan: Hapus placeholder.** Ganti dengan label statis di luar kotak input.
3. **Penyusunan Gaya Laporan:** *Bagaimana Dimas dan Sarah mengevaluasi laporannya?* Dokumen PDF formal bergaya tabel neraca akuntansi diubah total menjadi desain struk kasir termal yang ringkas dan ramah kognisi.

---

### 7. Traceability Matrix & Hasil Usability Testing (6 Partisipan)

Pengujian kegunaan (*Usability Testing*) dilakukan terhadap 6 partisipan menggunakan skenario tugas riil. Hasil pengujian membuktikan korelasi langsung antara riset empiris dan keputusan desain:

| Bukti Riset Lapangan | Temuan / Insight Inti | Persona & Target Goal | Formulasi HMW | Fitur Solutif FinanceFlow Pro | Hasil Usability Testing (N=6) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P3, Wawancara:** *"Tiap transfer ke e-wallet, neraca bulanan saya langsung merah."* | Pemindahan saldo antar-rekening pribadi salah teridentifikasi sebagai beban belanja. | Dimas (Goal: Saldo riil akurat tanpa repot rekap). | HMW memfasilitasi mutasi dana inter-wallet secara simetris? | **Fitur Transfer Dompet Khusus** (`/api/transactions/transfer`). | **Success Rate 100% (6/6)**; Nilai SEQ rata-rata **6.8 / 7.0**; Selisih saldo tercatat nihil. |
| **P1 & P5, Observasi:** *"Saya kira kolom kategori sudah terisi otomatis karena ada tulisannya."* | Teks contoh (placeholder) menyerupai data asli dan menipu persepsi visual. | Dimas & Sarah (Goal: Entri data tanpa distraksi eror). | HMW mencegah ilusi keterisian data pada kolom form? | **Pembersihan Total Teks Placeholder** pada seluruh form aplikasi. | Waktu pengisian turun dari **8.4 dtk $\to$ 3.8 dtk**; Error misclick turun menjadi **0%**. |
| **P2 & P6, Wawancara:** *"Laporan PDF biasanya kaku kayak lembar pajak, malas bacanya."* | Pengguna menolak visual laporan formal korporat yang dingin dan rumit. | Sarah (Goal: Rekap pengeluaran yang estetik & familier). | HMW menyajikan histori transaksi sebagai artefak yang akrab? | **Ekspor PDF Struk Belanja Termal** (Gaya nota kasir dengan garis putus-putus). | **Tingkat Kepuasan Visual 95%**; 5 dari 6 user langsung mengunduh struk untuk disimpan. |
| **P4, Wawancara:** *"Sering kaget saldo akhir bulan habis tanpa tahu bocor di mana."* | Ketiadaan sintesis tren membuat pengguna gagal menyadari anomali konsumsi. | Dimas (Goal: Ketenangan pikiran & kendali finansial). | HMW memberi peringatan anomali belanja secara manusiawi? | **Kurva Recharts Dinamis & Modul AI Insight Analitis.** | Waktu interpretasi status finansial **< 12 detik**; Peringatan defisit dinilai sangat membantu. |

---

### 8. Checklist Kualitas & Refleksi

#### Checklist Validasi Standar W06 & W07
- [x] **Protokol Wawancara Lengkap (W06):** Struktur 60 menit terdefinisi, bebas pertanyaan sugestif (*non-leading*), dilengkapi teknik *probing* 5 Whys.
- [x] **Eksplorasi Perilaku Tak Terucap (W06):** Unspoken behavior, gap *Saying vs Doing*, dan workaround terpetakan lewat kerangka AEIOU terhadap 6 partisipan.
- [x] **Triangulasi & Sintesis Masalah (W06):** Menghasilkan 3 Key Insights terbukti, 1 POV eksplisit, dan 3 HMW pada *sweet spot*.
- [x] **Behavioral Persona Set Lengkap (W07):** Berbasis variabel kontinum perilaku 6 partisipan, memuat Primary, Secondary, dan Anti-Persona.
- [x] **Pemisahan Tujuan yang Disiplin (W07):** Persona hanya memuat User Goals (Visceral, Behavioral, Reflective), bersih dari System/Business Goals.
- [x] **Model Mental Terintegrasi (W07):** Diagram Mental Model ala Indi Young dilengkapi pemetaan gap dan penyelesaian konflik model konseptual.

#### Keterbatasan Riset & Rencana Continuous Discovery
* **Keterbatasan Saat Ini:** Pengujian prototipe melibatkan 6 partisipan mahasiswa dan pekerja pemula di Bandung dan Jakarta dengan perangkat smartphone Android/iOS modern. Validasi AI Insight masih menggunakan data transaksi kurun waktu 1–6 bulan berjalan.
* **Continuous Discovery Cadence:** Mengagendakan sesi interviu reguler 30 menit dengan 2 pengguna aktif setiap dua minggu sekali (*bi-weekly touchpoints*) untuk mereview relevansi penamaan kategori pengeluaran dan akurasi batas ambang AI Insight.

#### Refleksi Metodologi: Kolaborasi Desainer & AI
Dalam pengerjaan proyek ini, kecerdasan buatan (AI) dimanfaatkan secara berimbang sebagai asisten akselerasi:
1. **Transkripsi & Klastering Awal:** AI digunakan untuk mentranskrip audio wawancara 6 partisipan dan mempercepat pengelompokan kata kunci awal pada *affinity diagramming*.
2. **Verifikasi & Kurasi Manual:** Seluruh sintesis *insight*, perumusan persona, eliminasi dark patterns, dan pertimbangan hierarki interaksi tetap dievaluasi, difilter, dan diputuskan secara manual oleh tim desainer guna memastikan empati manusiawi dan integritas etis tetap terjaga.

---

<div align="center">
  <i>Dibuat dengan ❤️ untuk Portofolio Profesional & Tugas Besar Desain Interaksi (CAK4IBB3) Telkom University</i>
</div>

