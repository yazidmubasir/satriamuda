# SIM SATRIA MUDA

Backend + frontend Google Apps Script untuk kegiatan siswa, dengan arsitektur multi-kelas dan Write Gateway.

Tagline: **Mulia . Berakhlak | Hebat . Berkarya**

## Peran
- OWNER: `yazid.mubasir12@admin.sma.belajar.id`
- ADMIN_KELAS: pengelola satu kelas dan user siswa kelas tersebut.
- SISWA: input, baca, dan hapus data miliknya pada modul siswa.

## Struktur data
- `MASTER_SIM`: satu spreadsheet pusat berisi `id_kelas`, `nama_kelas`, `spreadsheet_id`, `folder_id`, `admin_email`, `status`.
- Setiap `spreadsheet_id` kelas berfungsi sebagai `MASTER_KELAS` dan otomatis dibuatkan sheet `USERS` serta sheet transaksi modul siswa.
- `USERS`: identitas siswa/admin kelas.
- Data transaksi siswa disimpan pada spreadsheet kelas dan diakses melalui Write Gateway.

## Alur OWNER
1. Buka deployment web app.
2. Masuk sebagai OWNER.
3. Buka **Pengaturan OWNER**.
4. Isi ID Spreadsheet MASTER_SIM.
5. Isi URL Gateway dan Token Gateway.
6. Klik **RUN — Simpan & Inisialisasi MASTER_SIM**.
7. Isi ID kelas, nama kelas, ID Spreadsheet MASTER_KELAS, ID Folder, dan email ADMIN_KELAS.
8. Klik **RUN — Simpan Kelas & Buat Sheet**.

RUN konfigurasi Gateway juga mengirim token ke Gateway melalui endpoint setup OWNER. Nilai token aplikasi disimpan di Script Properties, bukan HTML browser.

## Alur ADMIN_KELAS
Admin masuk dengan email yang terdaftar pada `USERS`, kemudian mengelola siswa melalui menu **User Siswa**.

## Alur SISWA
Siswa masuk dengan email yang terdaftar pada `USERS`, kemudian menggunakan modul di bawah empat induk **MULIA, BERAKHLAK, HEBAT, BERKARYA** untuk input/read/delete data miliknya.

## Modul
- Kegiatan 7KAIH
- Kegiatan Belajar Mandiri
- Jurnal/Refleksi Belajar
- Prestasi Siswa
- Kegiatan Literasi
- Kegiatan Organisasi
- Agenda/Kegiatan Siswa
- Agenda Belajar

## Deployment
Web app utama menggunakan identitas user yang mengakses agar email Google dapat dipakai untuk menentukan role. Apps Script mendukung konfigurasi web app `USER_ACCESSING` dan pembatasan akses `DOMAIN`. URL Fetch digunakan untuk komunikasi server-to-server dengan Gateway.
