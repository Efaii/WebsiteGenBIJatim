# GenBI Jatim - Web Application Architectural Standards 

*As established by Lead Systems Architect & Design System Manager*

Dokumen ini memuat **Standard Operating Procedure (SOP)** definitif untuk pengembangan seluruh antarmuka web, khususnya sebagai pedoman evaluasi (*filter*) selama pembuatan dan refaktorisasi halaman apa pun, seperti Halaman About.

Tujuan utama panduan ini adalah menjamin **Konsistensi Visual 100%** dan **Performa Optimal** di seluruh ekosistem *Frontend*.

---

## 1. UI/UX & Typography Rules (Aturan Visual & Estetika)
Semua komponen antarmuka *Bright Premium* **wajib** memenuhi standar tipografi dan tata letak berikut:

- **Heading (H1, H2, H3, dst.)**:
  - Wajib menggunakan kelas `text-slate-900`.
  - Wajib menggunakan `tracking-tight` dan `font-bold`.
  - Dilarang menggunakan gradient-text yang mendistraksi tanpa persetujuan Lead Design.
- **Body & Description (Paragraf, Teks Biasa)**:
  - Wajib menggunakan `text-slate-600` untuk menjaga estetika *soft* dan berkesan profesional mewah.
  - Dilarang menggunakan `text-slate-900` atau `text-black` untuk deskripsi teks panjang.
- **Spacing System (Jarak, Margin, Padding)**:
  - Seluruh `gap`, `padding`, dan `margin` **harus berbasis kelipatan 4/8** dari sistem Tailwind (contoh: `gap-8`, `py-16`, `mb-6`, `mb-24`).
  - Dilarang menggunakan kelas spacing arbitrer (misal `gap-7` atau `mt-[17px]`) kecuali mutlak untuk *pixel-perfection* ikon.
- **Radius Standard**:
  - Semua elemen kontainer besar (*Card, Section Wrapper, Hero Image*) **wajib** memakai lengkungan `rounded-[2rem]`.
  - Dilarang mencampur lengkungan kaku (`rounded-md`) pada elemen utama tata letak.

---

## 2. Interaction & Animation Rules (Aturan Animasi & Kinetika)
Semua jenis pergerakan dan interaksi pengguna harus diukur presisi agar memberikan kesan "Premium" tanpa *Lag* atau *Jitter*:

- **Button Elevation (Efek Hover)**:
  - Gunakan elevasi translasi sumbu Y: `hover:-translate-y-2` (atau `y: -2` dalam Framer Motion).
  - Kurva transisi bawaan wajib `ease: 'circOut'` dengan durasi pendek (`duration-200` atau 0.2s).
  - **Dilarang keras** menggunakan efek perbesaran (*scaling*) yang berlebihan (contoh `hover:scale-110` untuk tombol teks) atau properti *spring* yang memantul secara liar.
- **Kinetic Signature (Kurva Gerak Primer)**:
  - Seluruh fungsi staggger/slide/fade di komponen `MotionWrapper.tsx` wajib mengacu pada kurva *Cubic Bezier* khusus: `[0.33, 1, 0.68, 1]`.
- **Icon Stability (Stabilitas Rotasi/Gerak Ikon)**:
  - Setiap ikon (khususnya indikator navigasi atau tipe panah) yang bergerak, berotasi, stau berputar **wajib** menyertakan utilitas *GPU Acceleration*: `transform-gpu`, pusat rotasi `origin-center`, dan ketebalan stabil `strokeWidth={2}` untuk membasmi *pixel jitter* atau teks/vektor bergerigi di layar non-Retina.
- **Visibility Strategy (Stabilitas *Scroll*)**:
  - Hapus SEMUA properti `exit={{ opacity: 0 }}` atau sejenisnya pada komponen dekoratif panjang untuk menghindari *layout shifting*/komponen berkedip saat *scroll up*.
  - Gunakan utilitas bawaan Framer Motion `viewport={{ once: true }}` murni agar elemen yang telah dimuat tampil permanen di DOM.

---

## 3. Technical & Architectural Rules (Aturan Infrastruktur Kode)
Pemeliharaan jangka panjang dan sinkronisasi dengan *Backend* bergantung pada ketiga pilar ini:

- **Data Layer Handling**:
  - **DILARANG** melakukan asinkronasi (seperti `fetch` atau `axios.get`) secara manual dan mentah secara `inline` (di dalam komponen `.tsx`).
  - Segala bentuk pengambilan data/mutasi *wajib* disalurkan melalui `src/lib/services/` guna sentralisasi fungsi dan *caching*.
- **Strict Type Safety**:
  - **DILARANG** keras menggunakan deklarasi `any`.
  - Seluruh struktur respons data dari API eksternal wajib dipetakan dan dikunci oleh *interface/type* tunggal yang diimpor dari repositori khusus `@repo/types`.
- **Environment Configuration**:
  - URL yang mengarah kepada infrastruktur *Backend/API* wajib diambil secara dinamis via konfigurasi Node.js lingkungan eksekusi: `process.env.NEXT_PUBLIC_API_URL` (atau `process.env.API_URL` untuk pengolahan SSR tingkat server). 
  - Tidak diperkenankan lagi adanya *hard-coded localhost* (`http://localhost:5000`) pada logika `service`.

---

> [!IMPORTANT]
> Dokumen ini berstatus *Active Constraint*.
> Pedomani aturan-aturan di atas layaknya validasi Linting. Setiap pengembang sistem kecerdasan buatan, maupun *engineer* yang memodifikasi baris kode untuk antarmuka publik, terlebih dahulu menjadikan manifestasi aturan ini sebagai acuan mutlak.
