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

> **Batasan produk:** FinanceFlow adalah **buku catatan keuangan pribadi**, bukan dompet digital atau alat pembayaran. Tidak ada koneksi ke bank atau QRIS, dan tidak ada uang yang bergerak. Pemasukan dan pengeluaran dicatat sendiri oleh pengguna, dan "dompet" serta "transfer" hanyalah catatan pembagian dan perpindahan dana.

---

## ✨ Fitur Utama

- 🔐 **Autentikasi & Kontrol Akun**: 
  - Kata sandi disimpan sebagai hash `Bcrypt`, dan setiap permintaan data diverifikasi dengan token sesi (JWT).
  - Verifikasi akun dan pemulihan kata sandi menggunakan **Kode OTP via Email** (Integrasi *Nodemailer*).
  - Hapus akun beserta seluruh datanya dari menu Akun.
- 💰 **Manajemen Multi-Dompet**: Buat dan pantau saldo dari berbagai dompet (Rekening, E-Wallet, Uang Tunai) secara terpisah.
- 🔁 **Transfer Antar-Dompet**: Pindah dana tidak dihitung sebagai pengeluaran pada laporan.
- 📊 **Analitik & AI Insight**:
  - Grafik Area saldo (6 bulan terakhir) menggunakan `Recharts`.
  - Insight berbasis aturan: peringatan defisit, anggaran terlampaui, dan kenaikan kategori minimal 30% dibanding rata-rata 3 bulan sebelumnya, lengkap dengan alasan dan angkanya.
- 🎯 **Anggaran & Target Tabungan**: Tetapkan batas per kategori dan lacak progres menabung dari menu Akun.
- 🖨️ **Ekspor Laporan Keuangan**:
  - Unduh data riwayat transaksi dalam format **Excel (CSV)**.
  - Cetak otomatis dalam format **Struk PDF Thermal** elegan (menggunakan `jsPDF`).
- 🎨 **Titanium UI (Premium UX)**: Tema gelap (*Dark Mode*), animasi transisi mulus, dan kartu melayang bergaya *Glassmorphism*.

---

## 🚀 Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur modern (*Fullstack*):

- **Frontend:** Next.js 14 (App Router), React, TypeScript.
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
   
   # JWT Secret untuk Autentikasi (wajib di production)
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

Dokumentasi ini merangkum proses perancangan interaksi **FinanceFlow Pro** berdasarkan materi **Desain Interaksi (CAK4IBB3) Telkom University, Minggu 1-7**.

**Cara membaca status bukti.** Setiap klaim diberi salah satu tanda berikut agar jelas mana yang sudah terbukti:

| Tanda | Arti |
| :--- | :--- |
| `[Kode]` | Dapat diperiksa langsung di kode aplikasi. |
| `[Hipotesis]` | Hipotesis awal (belum divalidasi). Belum boleh dianggap sebagai temuan. |
| `[PLACEHOLDER - isi dari data riset asli]` | Harus diisi dari data riset asli. Daftarnya ada di bagian akhir. |

---

### 1. Pengantar IxD & Positioning (W01)

#### Tiga Pilar: Easy, Effective, Enjoyable
| Pilar | Bukti Fitur `[Kode]` |
| :--- | :--- |
| **Easy** | Form transaksi satu layar tanpa pindah halaman, chip kategori cepat, label tetap di luar kolom, tanggal otomatis hari ini jika dikosongkan, navigasi bawah pada seluler. |
| **Effective** | Arus kas bersih per bulan, transfer antar-dompet yang tidak dihitung sebagai pengeluaran, grafik saldo 6 bulan, ekspor CSV dan struk PDF. |
| **Enjoyable** | Tema gelap Titanium dengan *glassmorphism*, animasi transisi (mengikuti `prefers-reduced-motion`), struk PDF bergaya nota kasir. |

#### Human-AI Teaming & Intelligence Amplification (IA)
AI Insight saat ini **berbasis aturan**, bukan model bahasa atau *machine learning*, dan label di antarmuka menyatakannya secara terbuka: "AI Insight • Berbasis Aturan". Kerangka IA tetap dipakai sebagai prinsip desain:

* **Sistem:** menghitung pola yang melelahkan jika dihitung manual, yaitu defisit, anggaran terlampaui, dan kenaikan kategori minimal 30% dibanding rata-rata 3 bulan sebelumnya ([insight.ts](src/lib/insight.ts)).
* **Manusia:** menilai konteks dan memutuskan tindakan. Sistem tidak pernah mengubah anggaran atau data secara otomatis.

#### Tiga Prinsip Abadi
| Prinsip | Penerapan `[Kode]` |
| :--- | :--- |
| **Intervention UI** | Banner insight punya dua pilihan: "Atur Anggaran" untuk mengubah batas, atau "Abaikan". Insight yang diabaikan dapat ditampilkan lagi. |
| **Safe Exploration** | Pratinjau saldo sebelum menyimpan, tombol "Batal" pada form, konfirmasi sebelum menghapus, dan "Urungkan" selama 8 detik setelah transaksi dihapus. |
| **Meaningful Mediation** | Peringatan menyebut alasan dan angkanya, misalnya: *"Naik 38% dibanding rata-rata 3 bulan sebelumnya (Rp 100.000 menjadi Rp 138.000)."* |

---

### 2. Emotional Design & Etika UX (W02)

#### Norman's 3 Levels
| Level | Keputusan Desain Konkret |
| :--- | :--- |
| **Visceral** | Latar `#050816`, permukaan `#111C31`, aksen indigo, kartu *glassmorphism* dengan `backdrop-filter`, animasi masuk halus. |
| **Behavioral** | Satu form untuk pemasukan dan pengeluaran, pratinjau saldo saat mengetik, tombol "Menyimpan...", pesan error di form tanpa menghilangkan isian. |
| **Reflective** | Kartu Total Kekayaan dan Arus Kas Bersih serta tren per bulan untuk menumbuhkan rasa "saya mengendalikan keuangan saya". `[Hipotesis]` terhadap dampak emosinya. |

#### Interaction Framework (Abowd & Beale): Mencatat Pengeluaran
```mermaid
sequenceDiagram
    autonumber
    participant U as User (Task)
    participant I as Input (Articulation)
    participant S as System (Performance)
    participant O as Output (Presentation)

    U->>I: Niat: mencatat belanja, memilih Reguler, mengisi nominal dan kategori
    Note over U,I: Failure 1: transfer disangka pengeluaran
    I->>S: POST /api/transactions dengan token sesi
    Note over I,S: Failure 2: permintaan gagal atau jaringan putus
    S->>O: Transaksi tersimpan, saldo dompet diperbarui
    O->>U: Form tertutup, daftar dan saldo terbarui
    Note over O,U: Failure 3: user tidak yakin data tersimpan
```

| Translation Failure | Solusi `[Kode]` |
| :--- | :--- |
| **User → Input:** bingung membedakan pengeluaran dan pindah saldo. | Pilihan `Reguler / Transfer` di bagian atas form, dan pratinjau transfer menyatakan "Tidak dihitung sebagai pengeluaran". |
| **Input → System:** permintaan gagal. | Form tetap terbuka dengan isian utuh dan pesan error dibacakan lewat `role="alert"`. |
| **System → Output:** user ragu data tersimpan. | Tombol berubah menjadi "Menyimpan...", lalu form tertutup hanya jika server menjawab berhasil. |

#### Audit Dark Patterns
| Pola | Status `[Kode]` |
| :--- | :--- |
| **Roach Motel** | Dihindari. Akun dapat dihapus dari menu Akun dengan konfirmasi kata sandi. |
| **Confirmshaming** | Dihindari. Tombol memakai kata netral: "Batal", "Abaikan". |
| **Hidden Costs** | Dihindari. Tidak ada biaya; pratinjau transfer menampilkan saldo kedua dompet sebelum disimpan. |
| **False Urgency** | Dihindari. Tidak ada hitung mundur; notifikasi hanya muncul jika kondisi nyata terpenuhi, dan kosong bila tidak ada. |

#### Checklist WCAG 2.2 (POUR)
Rasio kontras dihitung dari token warna. Pengujian manual dengan *screen reader* belum dilakukan.

| Kriteria | Status | Bukti |
| :--- | :---: | :--- |
| **P - 1.4.3 Contrast** | ✅ | Teks utama 18,2:1; teks sekunder 6,6:1; teks aksen 8,5:1; teks putih pada tombol 6,3:1. |
| **P - 1.4.1 Use of Color** | ✅ | Tren memakai panah `▲ ▼ —`, nominal memakai tanda `+/-`, grafik batang punya legenda. |
| **O - 2.1.1 Keyboard** | ⚠️ Sebagian | Kontrol utama berupa tombol dan tautan asli; notifikasi dapat ditutup dengan `Esc`. Modal Top Up belum punya *focus trap*, dan tooltip grafik hanya untuk pointer. |
| **O - 2.4.7 Focus Visible** | ✅ | Cincin fokus global `:focus-visible`. |
| **O - 2.5.8 Target Size (Minimum)** | ✅ | Tombol aksi minimal 44 × 44 px lewat `.tap-target`, melebihi syarat 24 px. |
| **O - 2.5.5 Target Size (Enhanced)** | ⚠️ Sebagian | Berlaku untuk tombol aksi; beberapa kontrol seperti pemilih periode belum diukur. |
| **U - 3.3.1 Error Identification** | ✅ | Pesan error berbentuk teks, dengan `role="alert"`. |
| **U - 3.3.2 Labels** | ✅ | Setiap kolom punya `<label htmlFor>` atau `aria-label`, tanpa placeholder. |
| **R - 4.1.2 Name, Role, Value** | ⚠️ Sebagian | `aria-label`, `aria-pressed`, `aria-current`, dan `aria-expanded` sudah dipasang; belum diverifikasi dengan *screen reader*. |

#### Recognition over Recall `[Kode]`
* **Kategori:** chip Makanan, Transport, Belanja, dan lainnya, sehingga user memilih alih-alih mengingat atau mengetik.
* **Dompet:** pilihan menampilkan nama dan saldo, misalnya "BCA (Rp 2.450.000)".
* **Navigasi:** menu aktif ditandai warna dan `aria-current`, dan nama menu sama dengan judul halaman: Transaksi, Dompet, Laporan.

---

### 3. Rencana & Hasil User Research (W03-W04)

#### UX Research Plan
| Bagian | Isi |
| :--- | :--- |
| **Background & Goals** | Memahami cara mahasiswa dan pekerja awal mencatat dan memantau uang di banyak dompet digital, serta alasan mereka berhenti mencatat. |
| **Participant Criteria** | Berbasis perilaku: memakai minimal 2 dompet atau rekening aktif, bertransaksi digital beberapa kali seminggu, pernah mencoba mencatat keuangan. Jumlah: 5-8 orang untuk kualitatif. |
| **Methods & Tools** | Wawancara semi-terstruktur dan observasi (kualitatif), kuesioner (kuantitatif), usability test pada prototipe. Alat: perekam, Figma, formulir daring. |
| **Script & Timeline** | Script ada pada bagian W06. Jadwal: `[PLACEHOLDER - isi dari data riset asli]` |

**Partisipan aktual:** `[PLACEHOLDER - isi dari data riset asli]`. Gunakan kode P1-Pn tanpa nama asli.

**Arketipe sementara** `[Hipotesis]`, dipakai sebagai kerangka sampai data asli tersedia:

| Kode | Perilaku yang diasumsikan |
| :--- | :--- |
| P1 | Transaksi mikro e-wallet beberapa kali sehari; sering lupa mencatat nominal kecil. |
| P2 | Rutin memakai spreadsheet, lalu berhenti karena lelah. |
| P3 | Banyak rekening dan e-wallet; catatan sering selisih karena top-up. |
| P4 | Penghasilan tidak tetap; butuh gambaran cepat dana aman. |
| P5 | Pragmatis; hanya mau mencatat jika sangat cepat. |
| P6 | Memisahkan uang pribadi dan uang kelompok. |

#### Opportunity Solution Tree
```mermaid
graph TD
    Outcome["Outcome: lebih banyak user tetap mencatat setiap minggu"]

    O1["O1: Mencatat terasa merepotkan"]
    O2["O2: Saldo catatan selisih karena pindah dana"]
    O3["O3: Laporan terasa rumit dan menghakimi"]

    S11["S1.1: Satu form dengan chip kategori"]
    S12["S1.2: Alur bertahap (wizard)"]
    S21["S2.1: Mode transfer khusus"]
    S22["S2.2: Kategori 'pindah dana' pada form biasa"]
    S31["S3.1: Insight dengan alasan dan angka"]
    S32["S3.2: Struk PDF ala nota kasir"]

    E1["E1: Uji waktu pengisian S1.1 vs S1.2"]
    E2["E2: Tree test mode transfer"]
    E3["E3: Wizard of Oz pesan insight"]
    E4["E4: Fake-door tombol struk PDF"]

    Outcome --> O1 & O2 & O3
    O1 --> S11 & S12
    O2 --> S21 & S22
    O3 --> S31 & S32
    S11 --> E1
    S12 --> E1
    S21 --> E2
    S31 --> E3
    S32 --> E4
```
Target angka outcome: `[PLACEHOLDER - isi dari data riset asli]`

#### Jobs-to-be-Done `[Hipotesis]`
1. **When** saya baru membayar di kasir dan antrean masih panjang, **I want to** mencatat nominal dan kategori dalam beberapa ketukan, **So I can** menjaga catatan tetap benar tanpa merasa terganggu.
2. **When** saya memindahkan saldo dari bank ke e-wallet, **I want to** hal itu tercatat sebagai pindah dana, **So I can** melihat saldo yang benar dan tidak merasa boros padahal tidak belanja.
3. **When** akhir bulan tiba dan saya cemas soal sisa uang, **I want to** membaca ringkasan yang mudah dipahami, **So I can** merencanakan bulan depan tanpa merasa dihakimi.

#### Kualitatif vs Kuantitatif & Triangulasi
| Jenis | Menjawab | Metode | Hasil |
| :--- | :--- | :--- | :--- |
| **Kualitatif** | Why / How (5-8 partisipan) | Wawancara, observasi | `[PLACEHOLDER - isi dari data riset asli]` |
| **Kuantitatif** | What / How many | Kuesioner | `[PLACEHOLDER - isi dari data riset asli]` |

**Triangulasi:** minimal 2 metode dibandingkan untuk setiap temuan. Contoh: wawancara menjelaskan alasan saldo selisih, kuesioner mengukur seberapa umum masalahnya, dan observasi memeriksa apakah perilakunya benar terjadi. Kesimpulan: `[PLACEHOLDER - isi dari data riset asli]`

#### Kuesioner Bebas Bias
| No | Item | Skala | Bias yang dihindari |
| :---: | :--- | :--- | :--- |
| 1 | Seberapa mudah atau sulit Anda mencatat pengeluaran harian dengan cara yang Anda pakai sekarang? | Likert 1-5 (Sangat sulit - Sangat mudah) | Leading |
| 2 | Seberapa mudah mengisi form transaksi? | Likert 1-5 | Double-barreled (dipisah dari item 3) |
| 3 | Seberapa lengkap pilihan kategori yang tersedia menurut Anda? | Likert 1-5 | Double-barreled (dipisah dari item 2) |
| 4 | Dalam 7 hari terakhir, berapa kali pengeluaran Anda tidak sempat tercatat? | 0 / 1-2 / 3-5 / >5 | Social desirability (kata "tidak sempat", bukan "malas") |
| 5 | Secara keseluruhan, seberapa mudah tugas menambah transaksi tadi? | SEQ 1-7 | Diukur tepat setelah tugas, mengurangi bias ingatan |

**Pilot test:** `[PLACEHOLDER - isi dari data riset asli]`, yaitu jumlah pencoba dan item yang direvisi.

#### Eksperimen Validasi Cepat (Rencana)
| Eksperimen | Hipotesis | Metrik & Ambang | Hasil |
| :--- | :--- | :--- | :--- |
| **Wizard of Oz:** pesan insight dikirim manual oleh peneliti | Pesan berisi alasan dan angka lebih dipercaya daripada skor | Rating kepercayaan ≥ 4/5 | `[PLACEHOLDER - isi dari data riset asli]` |
| **Fake-Door:** tombol "Struk PDF" sebelum fiturnya dibuat | User tertarik pada laporan bergaya nota | Rasio klik ≥ 30% | `[PLACEHOLDER - isi dari data riset asli]` |
| **Card Sorting (open):** penamaan menu dan kategori | User mengelompokkan dompet dan transfer dalam satu kelompok | Kesepakatan kelompok ≥ 70% | `[PLACEHOLDER - isi dari data riset asli]` |
| **Tree Testing:** "Pindahkan saldo ke e-wallet" | User menemukan mode transfer tanpa bantuan | Task success ≥ 80%, directness ≥ 70% | `[PLACEHOLDER - isi dari data riset asli]` |

#### Etika Riset
* **Informed consent:** tertulis, menjelaskan tujuan, rekaman, dan pemakaian data.
* **Anonimisasi:** kode P1-Pn, tanpa nama asli. Nominal dan nama bank disamarkan atau dibulatkan.
* **Hak mundur:** partisipan boleh berhenti kapan saja dan meminta datanya dihapus.
* **Privacy by Design `[Kode]`:** setiap permintaan data diverifikasi dengan token sesi, kata sandi disimpan sebagai hash bcrypt, akun dan seluruh datanya dapat dihapus oleh pemiliknya.
* **Dokumen consent:** `[PLACEHOLDER - isi dari data riset asli]`

---

### 4. Design Thinking (W05)

#### 5 Tahap d.school & Loop Iteratif
```mermaid
graph LR
    E[Empathize] --> D[Define]
    D --> I[Ideate]
    I --> P[Prototype]
    P --> T[Test]
    T -.->|Loop 1: placeholder disangka data| I
    T -.->|Loop 2: bentuk laporan| P
    D -.->|Loop 3: kebutuhan transfer| E
```
Loop di atas adalah keputusan yang terlihat pada kode saat ini: form tanpa placeholder, struk nota kasir, dan mode transfer. Sesi yang memicu tiap loop: `[PLACEHOLDER - isi dari data riset asli]`

#### Empathy Map: Dimas `[Hipotesis]`
| Says | Thinks |
| :--- | :--- |
| "Malas kalau catat seribu dua ribu harus isi banyak kolom." | "Kok saldo e-wallet cepat habis, padahal baru isi?" |
| **Does** | **Feels** |
| Mencatat sesekali di chat pribadi; struk dibiarkan menumpuk. | Cemas saat memeriksa saldo akhir bulan; bersalah jika gagal menabung. |
| **Pains** | **Gains** |
| Banyak aplikasi untuk tahu total uang; istilah akuntansi. | Tahu kondisi uang dalam sekali lihat; tidak takut salah pencet. |

#### User Journey Map `[Hipotesis]`
**Persona & Goal:** Dimas ingin mencatat makan siang dan memastikan uangnya masih aman.

| Fase | User Actions | Emosi | Opportunities |
| :--- | :--- | :---: | :--- |
| **1. Pemicu** | Selesai membayar QRIS, ingin mencatat sebelum lupa. | 😐 | Akses cepat dari layar utama. |
| **2. Membuka app** | Membuka FinanceFlow di ponsel. | 🙂 | Muat cepat dan navigasi jelas. |
| **3. Mencatat** | Mengisi nominal, memilih chip kategori dan dompet. | 🙁 | Kolom sesedikit mungkin; chip kategori. |
| **4. Memeriksa** | Melihat pratinjau saldo dan dashboard. | 😊 | Saldo terkini tanpa menghitung. |
| **5. Merefleksi** | Membaca insight. | 😃 / 😟 | Bahasa yang menjelaskan, tidak menghakimi. |

**Kurva emosi:** mulai netral, naik sedikit saat membuka aplikasi, **turun di fase mencatat** karena terasa sebagai pekerjaan, lalu naik saat saldo terlihat benar. Di fase terakhir kurva bercabang: lega jika surplus, cemas jika defisit. Titik terendah di fase 3 menjadi prioritas desain.

#### Assumption Map (Risk × Knowledge)
| Kuadran | Asumsi | Rencana |
| :--- | :--- | :--- |
| **High Risk & Unknown (Prioritas)** | A1. User mau kembali mencatat setiap hari. | Pantau retensi mingguan. |
| **High Risk & Unknown (Prioritas)** | A2. User percaya insight dan tidak merasa dihakimi. | Wizard of Oz. |
| **High Risk & Unknown (Prioritas)** | A3. User bersedia menyimpan data keuangan di aplikasi web. | Wawancara dan kuesioner. |
| **High Risk & Known** | A4. Transfer harus dipisah dari pengeluaran agar laporan benar. | Sudah dibuat sebagai fitur inti. |
| **Low Risk & Unknown** | A5. User butuh ekspor CSV untuk analisis lanjutan. | Pantau pemakaian. |
| **Low Risk & Unknown** | A6. Struk nota kasir terasa lebih akrab daripada tabel. | Fake-door dan preference test. |
| **Low Risk & Known** | A7. Tema gelap diterima untuk aplikasi ini. | Pertahankan dan jaga kontras. |

Semua asumsi berstatus `[Hipotesis]` sampai ada data.

#### User Story Map `[Kode]`
**Backbone:** Daftar akun → Atur dompet → Catat transaksi → Pantau dashboard → Evaluasi laporan

| Slice | Isi |
| :--- | :--- |
| **MVP** | Daftar dengan OTP, kelola dompet, catat pemasukan/pengeluaran/transfer, kartu ringkasan, grafik saldo. |
| **Release 2** | Insight berbasis aturan, struk PDF dan CSV, anggaran, target tabungan, hapus akun, urungkan hapus. |

#### Ideate
**HMW:**
1. HMW membuat pencatatan terasa seringan membalas pesan singkat?
2. HMW membedakan pindah dana dari belanja tanpa istilah akuntansi?
3. HMW menyampaikan kondisi defisit tanpa memicu kepanikan?
4. HMW menyajikan ringkasan keuangan dalam bentuk yang senang disimpan?
5. HMW mencegah contoh isian disangka data yang sudah tersimpan?

**Crazy 8s & Dot Voting:** `[PLACEHOLDER - isi dari data riset asli]`

**Penyaringan ide dari AI:** setiap ide dari AI harus lolos tiga pertanyaan sebelum dipakai:
1. Apakah ide ini menjawab temuan riset tertentu, bukan saran umum aplikasi keuangan?
2. Apakah Dimas dapat memakainya saat berdiri di kasir?
3. Apakah ide ini menghindari dark pattern dan fitur di luar cakupan?

Contoh ide yang disaring: `[PLACEHOLDER - isi dari data riset asli]`

#### Prototype & Test
| Tahap | Tujuan | Artefak |
| :--- | :--- | :--- |
| **Paper** | Menguji alur tambah transaksi dan transfer | `[PLACEHOLDER - isi dari data riset asli]` |
| **Low-Fi** | Menguji struktur menu dan urutan kolom | `[PLACEHOLDER - isi dari data riset asli]` |
| **Hi-Fi (Figma)** | Menguji tampilan dan keterbacaan | `[PLACEHOLDER - isi dari data riset asli]` |

**Rencana test (5 partisipan):** mencatat pengeluaran, memindahkan saldo, membaca kondisi bulan ini, mengekspor struk. Metrik: task success rate, time on task, SEQ, jumlah error, dan SUS.

**Hasil:** `[PLACEHOLDER - isi dari data riset asli]`

**Perubahan setelah test:** `[PLACEHOLDER - isi dari data riset asli]`

---

### 5. Design Research & Problem Framing (W06)

#### Interview Guide 60 Menit
| Menit | Bagian | Contoh Pertanyaan |
| :--- | :--- | :--- |
| **00-05** | Warm-up & Consent | Tujuan, izin rekam, hak mundur. "Apa kesibukan Anda sehari-hari?" |
| **05-15** | Konteks | "Ceritakan bagaimana uang Anda bergerak dalam seminggu terakhir." |
| **15-45** | Core Deep Dive | "Ceritakan terakhir kali saldo Anda tidak sesuai dugaan. Apa yang terjadi?" "Tunjukkan cara Anda mencatat pengeluaran." |
| **45-55** | Wrap-up | "Dari yang sudah kita bicarakan, apa yang paling mengganggu Anda?" |
| **55-60** | Penutup | "Ada yang belum saya tanyakan tetapi menurut Anda penting?" Ucapan terima kasih. |

#### Leading Question yang Dihindari
| Awal (Leading) | Masalah | Perbaikan |
| :--- | :--- | :--- |
| "Spreadsheet terlalu rumit, kan?" | Menggiring opini | "Bagaimana pengalaman Anda memakai spreadsheet untuk mencatat?" |
| "Fitur AI pengingat boros itu penting, bukan?" | Menggiring dan menekan untuk setuju | "Apa yang biasanya Anda lakukan setelah sadar pengeluaran membesar?" |
| "Anda pakai e-wallet karena malas bawa uang tunai?" | Mengasumsikan motif | "Apa yang memengaruhi pilihan cara bayar Anda?" |

#### Teknik Probing (Contoh Format)
Dua contoh di bawah menunjukkan cara bertanya. Jawabannya ilustrasi, bukan data partisipan.

**5 Whys:**
1. Mengapa berhenti memakai aplikasi pencatat? → "Sering lupa buka."
2. Mengapa sering lupa? → "Saat bayar, saya sedang buru-buru."
3. Mengapa saat itu tidak sempat? → "Isiannya banyak."
4. Mengapa banyak isian mengganggu? → "Nominalnya kecil, rasanya tidak sepadan."
5. Mengapa tidak sepadan? → "Saya hanya ingin tahu masih aman atau tidak." → **Akar:** yang dicari kepastian, bukan catatan lengkap.

**Critical Incident Technique:** "Ceritakan satu kejadian ketika Anda kaget melihat sisa saldo. Di mana Anda saat itu? Apa yang Anda lakukan sesaat setelahnya? Apa yang Anda rasakan? Bagaimana akhirnya?"

**Transkrip probing asli:** `[PLACEHOLDER - isi dari data riset asli]`

#### Observasi AEIOU `[Hipotesis]`
| Elemen | Yang akan diamati / dugaan awal |
| :--- | :--- |
| **Activities** | Membuka m-banking, mengecek saldo, berpindah ke aplikasi catatan. |
| **Environments** | Kasir, antrean, kantin; distraksi tinggi. |
| **Interactions** | Satu tangan, ketukan cepat, sering berpindah aplikasi. |
| **Objects** | Ponsel, struk kertas, Notes, spreadsheet, chat ke diri sendiri. |
| **Users** | Mahasiswa dan pekerja awal yang memakai banyak dompet digital. |
| **Unspoken behavior & workaround** | Mencatat "pindah dana" di chat pribadi sebagai pengganti aplikasi. |

**Catatan observasi asli:** `[PLACEHOLDER - isi dari data riset asli]`

#### Saying vs Doing
**Gap yang ditemukan:** `[PLACEHOLDER - isi dari data riset asli]`

Pola yang dicari: user mengaku rutin mencatat, sementara riwayat catatannya menunjukkan jeda berhari-hari.

#### JTBD Forces of Progress `[Hipotesis]`
| Mendorong perubahan | Menghambat perubahan |
| :--- | :--- |
| **Push:** saldo sering selisih, rekap manual melelahkan. | **Anxiety:** takut data keuangan bocor, takut salah catat. |
| **Pull:** tahu saldo semua dompet di satu tempat, pencatatan cepat. | **Habit:** sudah terbiasa dengan Notes atau chat, malas membuka aplikasi lain. |

**Kesimpulan sementara:** (Push + Pull) > (Anxiety + Habit) belum bisa dipastikan tanpa data. Desain mengurangi Anxiety lewat kontrol privasi dan hapus akun, serta mengurangi Habit lewat form yang cepat. Validasi: `[PLACEHOLDER - isi dari data riset asli]`

#### Affinity Diagram & Key Insights `[Hipotesis]`
| Tema | Insight Note | Sumber |
| :--- | :--- | :--- |
| **Friksi saat mencatat** | Banyak kolom membuat transaksi kecil terasa tidak sepadan untuk dicatat. | `[PLACEHOLDER - isi dari data riset asli]` |
| **Ilusi defisit** | Pindah dana yang dihitung sebagai belanja membuat laporan tampak buruk dan menurunkan motivasi. | `[PLACEHOLDER - isi dari data riset asli]` |
| **Umpan balik manusiawi** | Laporan yang mirip benda sehari-hari lebih mudah diterima daripada tabel akuntansi. | `[PLACEHOLDER - isi dari data riset asli]` |

**3 Key Insights:**
1. User tidak mencari catatan yang lengkap; mereka mencari kepastian bahwa uangnya masih aman.
2. Motivasi mencatat runtuh ketika angka di aplikasi tidak cocok dengan kenyataan.
3. Rasa dihakimi membuat user menghindari laporan, justru saat mereka paling membutuhkannya.

#### POV & HMW Sweet Spot `[Hipotesis]`
**POV:** Mahasiswa dan pekerja awal dengan banyak dompet digital **membutuhkan cara untuk** mengetahui posisi uangnya dalam hitungan detik **karena** catatan yang tidak cocok dengan saldo asli membuat mereka cemas lalu berhenti mencatat.

**3 HMW:**
1. HMW membuat pindah dana antar-dompet tercatat benar tanpa langkah akuntansi?
2. HMW membuat transaksi kecil bisa dicatat sebelum user meninggalkan kasir?
3. HMW menyampaikan kondisi keuangan yang buruk tanpa membuat user menghindari aplikasi?

---

### 6. Persona & Mental Model (W07)

Seluruh bagian ini berstatus **proto-persona** `[Hipotesis]`. Posisi P1-P6 harus diganti dari data asli sebelum disebut Behavioral Persona.

#### Variabel Perilaku & Klaster
| Jenis | Variabel | Kiri | Posisi | Kanan |
| :--- | :--- | :---: | :---: | :---: |
| **Activities** | Frekuensi transaksi digital | Jarang | `P2 - P6 --- P1 P4 P5 P3` | Sangat sering |
| **Activities** | Jumlah dompet aktif | Sedikit | `P2 - P6 --- P1 P4 P5 P3` | Banyak |
| **Attitudes** | Sikap terhadap rekap | Santai | `P5 P3 - P1 --- P4 P6 P2` | Terjadwal |
| **Aptitudes** | Literasi akuntansi | Awam | `P1 P5 P3 --- P4 P6 P2` | Mahir |
| **Motivasi** | Kebutuhan evaluasi | Cukup tahu saldo | `P5 P3 - P1 --- P4 P6 P2` | Analisis tren |

**Aturan:** 1 klaster signifikan = 1 persona.
* **Klaster A (P1, P3, P5, cenderung P4):** transaksi sering, banyak dompet, awam akuntansi → **Primary Persona**.
* **Klaster B (P2, P6):** lebih teratur dan butuh laporan → **Secondary Persona**.

#### Behavioral Persona Set

**User Goals vs System/Business Goals.** Persona hanya memuat User Goals, seperti "tahu uang saya aman". System/Business Goals, seperti retensi mingguan atau jumlah transaksi, sengaja ditempatkan di luar persona, yaitu pada Outcome di Opportunity Solution Tree.

##### Primary Persona: Dimas
| Elemen | Isi |
| :--- | :--- |
| **Header** | Dimas, pekerja awal. *"Uang saya nyebar di mana-mana; saya cuma mau tahu hari ini aman atau harus ngerem."* |
| **Behavioral Profile** | Memakai beberapa rekening dan e-wallet; beberapa transaksi digital per hari; awam istilah akuntansi. |
| **Core Goals** | **Behavioral:** mencatat sebelum meninggalkan kasir. **Behavioral:** tahu total uang tanpa membuka banyak aplikasi. **Reflective:** merasa mampu mengendalikan keuangan. |
| **Pain Points** | Saldo catatan selisih karena pindah dana; form panjang; istilah debit/kredit. |
| **Environment** | Ponsel, satu tangan, antrean dan tempat makan, distraction level tinggi. |
| **Key Scenarios** | Memindahkan Rp 100.000 ke e-wallet untuk makan siang, lalu mencatatnya sebagai transfer. |
| **Sumber bukti** | `[PLACEHOLDER - isi dari data riset asli]` |

##### Secondary Persona: Sarah
| Elemen | Isi |
| :--- | :--- |
| **Header** | Sarah, mahasiswa dan pengurus organisasi. *"Uang pribadi jangan sampai kecampur sama uang kas acara."* |
| **Behavioral Profile** | Mencatat lebih teratur; memisahkan beberapa pos uang; rutin merekap setiap bulan. |
| **Core Goals** | **Behavioral:** memisahkan uang pribadi dan uang kegiatan. **Behavioral:** mendapat rekap yang rapi. **Reflective:** merasa dapat dipercaya mengelola uang. |
| **Pain Points** | Ekspor CSV mentah sulit dibaca di ponsel; uang tercampur. |
| **Environment** | Ponsel dan laptop, di rumah atau kampus, distraction level sedang. |
| **Key Scenarios** | Di akhir bulan, memilih rentang tanggal lalu mengunduh struk PDF sebagai arsip. |
| **Sumber bukti** | `[PLACEHOLDER - isi dari data riset asli]` |

##### Anti-Persona: Pak Bambang
| Elemen | Isi |
| :--- | :--- |
| **Header** | Pak Bambang, pemilik usaha grosir. *"Saya butuh pembukuan double-entry dan faktur pajak."* |
| **Kebutuhan** | Jurnal akuntansi, faktur pajak, piutang, depresiasi aset. |
| **Alasan eksklusi** | FinanceFlow hanya mencatat dan tidak memproses pembayaran, jadi bukan alat bayar atau dompet digital. FinanceFlow untuk keuangan pribadi. Memenuhi kebutuhan ini akan membuat form dan istilahnya membebani user utama, sehingga dijadikan batas cakupan untuk mencegah *scope creep*. |

#### Hierarki Tujuan Norman
| Level | Dimas | Sarah |
| :--- | :--- | :--- |
| **Visceral** | "Saya ingin aplikasinya terlihat rapi dan tidak mengintimidasi." | "Saya ingin tampilannya enak dilihat setiap kali dibuka." |
| **Behavioral** | "Saya ingin mencatat es kopi dalam beberapa ketukan." | "Saya ingin rekap bulanan keluar tanpa saya susun manual." |
| **Reflective** | "Saya ingin merasa bertanggung jawab atas uang saya sendiri." | "Saya ingin merasa bisa dipercaya memegang uang." |

#### Mental Model Diagram (Indi Young)
**Bagian atas: tower of behaviors dan motivasi** `[Hipotesis]`

| Memilah Uang | Bertransaksi | Mengecek | Mengevaluasi | Merencanakan |
| :--- | :--- | :--- | :--- | :--- |
| Membayangkan uang di kantong terpisah | Menganggap pindah saldo sebagai "geser uang" | Ingin tahu aman atau tidak | Ingin bukti ringkas | Khawatir pengeluaran sekarang mengganggu rencana |

**Bagian bawah: fitur FinanceFlow yang mendukung** `[Kode]`

| Memilah Uang | Bertransaksi | Mengecek | Mengevaluasi | Merencanakan |
| :--- | :--- | :--- | :--- | :--- |
| Kartu dompet | Form Reguler dan Transfer, chip kategori | Kartu ringkasan, insight | Laporan, struk PDF, CSV | Anggaran, target tabungan |

**Gap Analysis:**
* **Unsupported Mental Model (peluang inovasi):** mengetahui "aman jajan berapa hari ini" dan proyeksi saldo akhir bulan. Saat ini user harus menyimpulkan sendiri.
* **Bloated Features (kandidat ditinjau):** Kalkulator Finansial tidak memakai data user, dan pengisian saldo target tabungan tidak terhubung ke dompet. Keputusan menunggu data pemakaian.

#### Conceptual Model vs Mental Model
| Konflik | Risiko | Solusi `[Kode]` |
| :--- | :--- | :--- |
| Istilah **"dompet"** mencakup rekening bank, sementara user mungkin memisahkan "rekening" dan "e-wallet". | User ragu rekening bank boleh dimasukkan. | Label form "Nama Dompet / Bank". |
| Sistem mencatat transfer sebagai **dua baris** (keluar dan masuk), sementara user melihatnya sebagai **satu tindakan**. | Menghapus satu baris bisa merusak saldo. | Antarmuka memakai "Dari Dompet" dan "Ke Dompet"; menghapus transfer menghapus kedua barisnya. |

#### Persona sebagai Lensa Keputusan
1. **Pertanyaan skenario:** "Apakah Dimas akan mengisi sub-kategori 3 level saat berdiri di kasir?" → Tidak; kategori cukup satu tingkat.
2. **Prioritas fitur:** "Apakah pembuatan faktur membantu Dimas atau Sarah?" → Tidak; itu kebutuhan anti-persona, sehingga ditolak.
3. **Design critique:** "Apakah contoh abu-abu di kolom membantu Sarah atau malah mengecoh Dimas?" → Placeholder dihapus, label tetap dipasang di luar kolom.

---

### 7. Traceability Matrix

Kolom fitur dapat diperiksa di kode. Kolom temuan dan hasil test menunggu data asli.

| Temuan Riset | Insight | Persona / Goal | HMW | Fitur `[Kode]` | Hasil Test |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `[PLACEHOLDER]` Saldo selisih karena pindah dana | Pindah dana bukan belanja | Dimas / saldo benar | HMW pindah dana tercatat benar | Mode Transfer, kategori transfer dikecualikan dari laporan | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` Transaksi kecil tidak dicatat | Mencatat harus sepadan | Dimas / mencatat di kasir | HMW mencatat sebelum meninggalkan kasir | Form satu layar, chip kategori | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` Placeholder disangka data | Contoh isian mengecoh | Dimas, Sarah / mengisi tanpa salah | HMW mencegah contoh disangka data | Label tetap, tanpa placeholder | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` Laporan kaku dihindari | Bentuk akrab lebih diterima | Sarah / rekap rapi | HMW ringkasan yang senang disimpan | Struk PDF | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` Perlu olah data sendiri | Sebagian user ingin data mentah | Sarah / arsip | HMW memberi kontrol atas data | Ekspor CSV | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` Kaget saldo habis | Sinyal awal mencegah kaget | Dimas / tahu kondisi uang | HMW menyampaikan kondisi tanpa panik | AI Insight berbasis aturan, grafik 6 bulan, anggaran | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` Uang tersebar di banyak tempat | Total uang sulit diketahui | Dimas / lihat total | HMW melihat semua uang di satu tempat | Multi-dompet, Total Kekayaan | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` Takut data bocor | Kepercayaan syarat adopsi | Dimas, Sarah / merasa aman | HMW mengurangi kecemasan soal data | OTP email, token sesi, hapus akun | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` Ingin tampilan tidak mengintimidasi | Tampilan memengaruhi kemauan membuka | Sarah / enak dilihat | HMW membuat keuangan tidak menakutkan | Tema gelap Titanium | `[PLACEHOLDER]` |

---

### 8. Checklist Kualitas & Refleksi

#### Checklist Riset W06
- [x] Interview guide 60 menit tersusun, dengan perbaikan leading question.
- [ ] Wawancara minimal 3 partisipan: `[PLACEHOLDER - isi dari data riset asli]`
- [ ] Unspoken behavior teramati dari observasi asli.
- [ ] 3 Key Insights berbukti (saat ini masih hipotesis).
- [x] 1 POV dan 3 HMW sudah dirumuskan (POV masih hipotesis).

#### Checklist Behavioral Persona Set W07
- [ ] Berbasis pola perilaku dari data asli, bukan demografi (saat ini proto-persona).
- [x] Set lengkap: Primary, Secondary, Anti-Persona, masing-masing dengan elemen yang relevan.
- [x] Hanya memuat User Goals, dipisah dari System/Business Goals.
- [x] Tidak memuat detail yang tidak relevan.
- [ ] Setiap poin dapat ditelusuri ke bukti riset.

#### Keterbatasan
* Data riset dalam dokumen ini belum tervalidasi; bagian bertanda hipotesis tidak boleh dibaca sebagai temuan.
* AI Insight berbasis aturan, belum memakai model.
* Aksesibilitas belum diuji dengan *screen reader* dan belum diuji oleh pengguna disabilitas.

#### Continuous Discovery
* Wawancara **2-3 user per minggu**, masing-masing sekitar 30 menit.
* Peninjauan ulang persona setiap akhir fase atau saat muncul pola baru.
* Metrik yang dipantau: retensi pencatatan mingguan dan pemakaian insight.

#### Refleksi Penggunaan AI
| Tahap | Peran AI | Verifikasi Manual |
| :--- | :--- | :--- |
| Drafting dokumentasi | Menyusun kerangka, tabel, dan draf hipotesis | Semua klaim fitur dicocokkan dengan kode; hipotesis ditandai |
| Transkripsi | `[PLACEHOLDER - isi dari data riset asli]` | Cocokkan dengan rekaman |
| Clustering | `[PLACEHOLDER - isi dari data riset asli]` | Tinjau ulang setiap kelompok dengan membaca kutipan asli |

---

### Data yang Masih Perlu Saya Isi

**W03-W04**
- [ ] Jumlah dan profil asli partisipan (kode P1-Pn, tanpa nama asli)
- [ ] Jadwal riset dan target angka outcome
- [ ] Hasil kualitatif, hasil kuantitatif, dan kesimpulan triangulasi
- [ ] Hasil pilot test kuesioner
- [ ] Hasil Wizard of Oz, Fake-Door, Card Sorting, dan Tree Testing (atau hapus yang tidak dilakukan)
- [ ] Dokumen informed consent

**W05**
- [ ] Sesi yang memicu tiap loop iterasi
- [ ] Hasil Crazy 8s dan dot voting
- [ ] Contoh ide AI yang disaring
- [ ] Artefak Paper, Low-Fi, dan Hi-Fi Figma
- [ ] Hasil test 5 partisipan dan perubahan desain setelahnya

**W06**
- [ ] Transkrip probing asli dan catatan observasi AEIOU
- [ ] Gap Saying vs Doing yang ditemukan
- [ ] Validasi Forces of Progress
- [ ] Sumber bukti setiap insight note

**W07**
- [ ] Posisi asli partisipan pada kontinum perilaku
- [ ] Sumber bukti setiap persona

**Penutup**
- [ ] Temuan riset dan hasil test pada Traceability Matrix
- [ ] Peran AI pada transkripsi dan clustering

---

<div align="center">
  <i>Dibuat dengan ❤️ untuk Portofolio Profesional & Tugas Besar Desain Interaksi (CAK4IBB3) Telkom University</i>
</div>

