# Task Management System — Setup Guide

> Panduan ini ditujukan untuk pengembang baru yang ingin menjalankan project **Task Management System** di mesin lokal.
>
> **⚠️ Catatan Infrastruktur:** Project ini **TIDAK menggunakan Redis**. Queue menggunakan driver `database`. Konsekuensinya, **Queue Worker harus selalu aktif** di terminal agar background jobs (Bulk Update, Email, Export) dapat diproses.

---

## Daftar Isi

1. [Prerequisites](#1-prerequisites)
2. [Backend Setup](#2-backend-setup)
3. [Frontend Setup](#3-frontend-setup)
4. [Menjalankan Aplikasi (The 4-Terminal Rule)](#4-menjalankan-aplikasi-the-4-terminal-rule)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Prerequisites

Pastikan semua software berikut sudah terinstal sebelum memulai.

| Software | Versi Minimum | Cek Versi            |
| -------- | ------------- | -------------------- |
| PHP      | 8.3+          | `php -v`             |
| Composer | 2.x           | `composer --version` |
| Node.js  | 20+           | `node -v`            |
| npm      | 10+           | `npm -v`             |
| MySQL    | 8.0+          | `mysql --version`    |
| Git      | any           | `git --version`      |

- [ ] PHP 8.3+ terinstal
- [ ] Composer terinstal
- [ ] Node.js v20+ terinstal
- [ ] MySQL berjalan dan dapat diakses
- [ ] Git terinstal

---

## 2. Backend Setup

Semua perintah berikut dijalankan di dalam folder `backend/`.

### 2.1 Clone Repositori

```bash
git clone <repository-url> task-management
cd task-management/backend
```

### 2.2 Instalasi Dependensi PHP

```bash
composer install
```

### 2.3 Konfigurasi Environment

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka file `.env` dan sesuaikan variabel-variabel berikut:

#### Database (MySQL)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_management   # Nama database yang akan dibuat
DB_USERNAME=root               # Username MySQL Anda
DB_PASSWORD=                   # Password MySQL Anda
```

#### Queue & Cache

> **Wajib diset dengan benar.** Karena tidak menggunakan Redis, gunakan driver berikut:

```env
CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
```

#### Reverb (WebSocket Real-time)

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=task-management-app
REVERB_APP_KEY=my-reverb-key
REVERB_APP_SECRET=my-reverb-secret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http
```

> Nilai `REVERB_APP_KEY` dan `REVERB_APP_SECRET` bebas diisi string apa pun untuk lokal, namun harus **sinkron** dengan konfigurasi frontend di langkah §3.

#### Mail (Opsional untuk lokal)

Gunakan [Mailtrap](https://mailtrap.io) atau set `MAIL_MAILER=log` agar email ditulis ke log file tanpa perlu SMTP sungguhan:

```env
MAIL_MAILER=log
```

### 2.4 Generate App Key & JWT Secret

```bash
# Generate application encryption key
php artisan key:generate

# Generate JWT secret key
php artisan jwt:secret
```

### 2.5 Buat Database

Buat database MySQL secara manual terlebih dahulu:

```sql
CREATE DATABASE task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Atau via MySQL CLI:

```bash
mysql -u root -p -e "CREATE DATABASE task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2.6 Buat Tabel Jobs untuk Queue

Karena menggunakan `QUEUE_CONNECTION=database`, tabel `jobs` perlu dibuat terlebih dahulu:

```bash
php artisan queue:table
```

> **Catatan:** Perintah ini hanya perlu dijalankan sekali. Jika file migration `create_jobs_table` sudah ada di folder `database/migrations/`, lewati langkah ini.

### 2.7 Jalankan Migration & Seeder

```bash
php artisan migrate --seed
```

Perintah ini akan:

- Membuat semua tabel (users, tasks, task_attachments, task_comments, jobs, dll.)
- Mengisi data awal: **5 users**, **15+ tasks**, **10+ comments**

### 2.8 Atur Izin Folder Storage

```bash
# Linux / macOS
chmod -R 775 storage bootstrap/cache
chown -R $USER:www-data storage bootstrap/cache

# Windows (jalankan sebagai Administrator, atau cukup pastikan folder writable)
```

---

## 3. Frontend Setup

Semua perintah berikut dijalankan di dalam folder `frontend/`.

```bash
cd ../frontend
```

### 3.1 Instalasi Dependensi Node.js

```bash
npm install
# atau
yarn install
```

### 3.2 Konfigurasi Environment

Buat file `.env.local` di folder `frontend/`:

```bash
cp .env.example .env.local   # jika tersedia
# atau buat manual
```

Isi `.env.local` dengan nilai berikut:

```env
# URL API Backend Laravel
NEXT_PUBLIC_API_URL=http://localhost:8001/api

# Konfigurasi Reverb (harus sinkron dengan REVERB_* di backend/.env)
NEXT_PUBLIC_REVERB_APP_KEY=my-reverb-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

> **Penting:** Nilai `NEXT_PUBLIC_REVERB_APP_KEY`, `HOST`, dan `PORT` harus **identik** dengan yang diset di `backend/.env`. Ketidakcocokan akan menyebabkan koneksi WebSocket gagal.

---

## 4. Menjalankan Aplikasi (The 4-Terminal Rule)

Untuk menjalankan sistem secara penuh, diperlukan **4 terminal yang berjalan secara bersamaan**. Buka 4 jendela terminal/tab baru dan jalankan masing-masing perintah.

```
┌──────────────────┬──────────────────────────────────────────┐
│   Terminal       │   Perintah                               │
├──────────────────┼──────────────────────────────────────────┤
│  1 - Web Server  │  php artisan serve --port=8001           │
│  2 - WebSocket   │  php artisan reverb:start --debug        │
│  3 - Queue Worker│  php artisan queue:work                  │
│  4 - Frontend    │  npm run dev                             │
└──────────────────┴──────────────────────────────────────────┘
```

### Terminal 1 — Web Server (Laravel)

```bash
cd backend
php artisan serve --port=8001
```

API akan tersedia di: `http://localhost:8001/api`

### Terminal 2 — Reverb WebSocket Server

```bash
cd backend
php artisan reverb:start --debug
```

WebSocket akan berjalan di: `ws://localhost:8080`

Flag `--debug` menampilkan log koneksi masuk/keluar, sangat membantu saat development.

### Terminal 3 — Queue Worker

```bash
cd backend
php artisan queue:work
```

> **Mengapa ini wajib?**
>
> Karena project ini **tidak menggunakan Redis**, semua background jobs (Bulk Update status task, pengiriman email notifikasi, export laporan CSV, pemrosesan thumbnail) disimpan di tabel `jobs` pada MySQL dan harus diproses oleh Queue Worker secara aktif.
>
> **Jika Queue Worker tidak berjalan, fitur-fitur berikut tidak akan bekerja:**
>
> - Bulk Update status task
> - Notifikasi email saat task di-assign
> - Export task ke CSV
> - Generate thumbnail file gambar

### Terminal 4 — Frontend (Next.js)

```bash
cd frontend
npm run dev
```

Aplikasi frontend akan tersedia di: `http://localhost:3000`

---

### ✅ Checklist Akhir

Setelah keempat terminal berjalan, verifikasi sistem:

- [ ] `http://localhost:8001/api/auth/login` mengembalikan response JSON (POST dengan email & password)
- [ ] `http://localhost:3000` menampilkan halaman login
- [ ] Login berhasil dan diarahkan ke dashboard
- [ ] Tidak ada error koneksi WebSocket di browser console
- [ ] Queue Worker di Terminal 3 menampilkan `[YYYY-MM-DD] Processing: App\Jobs\...` saat ada job masuk

---

## 5. Troubleshooting

### ❌ Error: WebSocket Connection Failed / Reverb Tidak Terhubung

**Gejala:** Browser console menampilkan `WebSocket connection to 'ws://localhost:8080/...' failed`.

**Solusi:**

1. Pastikan Terminal 2 (Reverb) sedang berjalan.
2. Periksa nilai `NEXT_PUBLIC_REVERB_*` di `frontend/.env.local` sudah sesuai dengan `REVERB_*` di `backend/.env`.
3. Pastikan tidak ada firewall yang memblokir port `8080`.
4. Restart Reverb server:
   ```bash
   php artisan reverb:start --debug
   ```
5. Hard refresh browser (`Ctrl+Shift+R`) untuk memaksa koneksi ulang.

---

### ❌ Error: Data Tidak Sinkron / Cache Lama

**Gejala:** Data yang tampil di UI tidak mencerminkan perubahan terbaru meski sudah dilakukan update.

**Solusi:** Bersihkan cache file Laravel:

```bash
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

### ❌ Error: `SQLSTATE[HY000] [2002] Connection refused`

**Gejala:** Laravel tidak dapat terhubung ke MySQL.

**Solusi:**

1. Pastikan MySQL service sedang berjalan:

   ```bash
   # Linux
   sudo systemctl start mysql

   # macOS (Homebrew)
   brew services start mysql

   # Windows — buka Services dan start MySQL
   ```

2. Verifikasi kredensial `DB_*` di `backend/.env` sudah benar.
3. Pastikan database `task_management` sudah dibuat (lihat §2.5).

---

### ❌ Error: `Permission denied` pada Folder `storage` atau `bootstrap/cache`

**Gejala:** Laravel menampilkan error `Unable to write to storage` atau `The stream or file ... could not be opened`.

**Solusi:**

```bash
# Linux / macOS
cd backend
chmod -R 775 storage bootstrap/cache
chown -R $USER:www-data storage bootstrap/cache
php artisan storage:link

# Jika masih error, paksa permission
sudo chmod -R 777 storage bootstrap/cache
```

---

### ❌ Background Jobs Tidak Diproses (Bulk Update Tidak Jalan)

**Gejala:** Setelah klik "Bulk Update", status task tidak berubah dan tidak ada aktivitas di terminal.

**Penyebab:** Queue Worker (Terminal 3) tidak berjalan.

**Solusi:**

1. Pastikan Terminal 3 aktif dengan perintah:
   ```bash
   cd backend
   php artisan queue:work
   ```
2. Cek apakah tabel `jobs` ada di database:
   ```bash
   php artisan queue:table
   php artisan migrate
   ```
3. Lihat isi tabel `jobs` untuk memeriksa apakah job sudah masuk antrian:
   ```sql
   SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;
   ```
4. Jika terdapat job yang gagal, periksa tabel `failed_jobs`:
   ```bash
   php artisan queue:failed
   ```

---

### ❌ Error: `JWT Secret not set`

**Gejala:** Response API mengembalikan error terkait JWT saat login.

**Solusi:**

```bash
cd backend
php artisan jwt:secret
```

Pastikan `JWT_SECRET` tidak kosong di `backend/.env` setelah perintah ini dijalankan.

---

_Panduan ini berlaku untuk environment **development lokal**. Untuk deployment ke production, diperlukan konfigurasi tambahan (HTTPS, environment variables production, process manager seperti Supervisor untuk Queue Worker)._
