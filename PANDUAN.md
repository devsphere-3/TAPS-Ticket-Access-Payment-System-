# TAPS — Ticket Access & Payment System
## Panduan Lengkap: Menjalankan Lokal & Deploy ke cPanel

---

## Daftar Isi

1. [Gambaran Sistem](#1-gambaran-sistem)
2. [Prasyarat](#2-prasyarat)
3. [Menjalankan di Lokal (Development)](#3-menjalankan-di-lokal-development)
4. [Konfigurasi Payment Gateway](#4-konfigurasi-payment-gateway)
5. [Deploy ke cPanel (badangperkasa.com)](#5-deploy-ke-cpanel-badangperkasacom)
6. [Referensi API Endpoint](#6-referensi-api-endpoint)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Gambaran Sistem

TAPS adalah sistem tiket berbasis web yang terintegrasi di dalam website utama Pramuka Badang Perkasa.

### Arsitektur

```
badangperkasa.com/              → Website utama (Tanjak Emas / voting) 
badangperkasa.com/tiket/        → Frontend sistem tiket (React + Vite)
badangperkasa.com/tiket-api/    → Backend API (Laravel 13)
```

### Komponen

| Komponen | Teknologi | Lokasi |
|---|---|---|
| Frontend | React 19, Tailwind CSS, Vite 8 | `SistemPembayaran/frontend/` |
| Backend | Laravel 13, PHP 8.3+ | `SistemPembayaran/backend/` |
| Database | PostgreSQL (Supabase) | Remote |
| Payment | QRIS Invoice API (store.ku.anjay.fun) | Remote |

### Alur Pembayaran

```
User beli tiket → POST /orders → POST /payment/checkout
→ Redirect ke paymentUrl (halaman QRIS)
→ User bayar → Gateway kirim webhook → POST /payment/webhook
→ Order jadi PAID → Tiket di-generate otomatis
```

---

## 2. Prasyarat

### Lokal
- **PHP** 8.3 atau lebih baru
- **Composer** 2.x
- **Node.js** 20+ dan **npm**
- **PostgreSQL** atau akses ke Supabase

### cPanel Hosting
- PHP 8.3+ (aktifkan di cPanel > Select PHP Version)
- `mod_rewrite` aktif
- Akses ke Terminal / SSH cPanel
- Database: PostgreSQL (Supabase) atau MySQL cPanel

---

## 3. Menjalankan di Lokal (Development)

### 3.1 Setup Backend

```bash
cd SistemPembayaran/backend
```

**Install dependencies:**
```bash
composer install
```

**Salin dan isi file environment:**
```bash
cp .env.example .env
```

Edit `.env` — bagian yang wajib diisi:
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (Supabase)
DB_CONNECTION=pgsql
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.YOUR_PROJECT_REF
DB_PASSWORD=YOUR_SUPABASE_PASSWORD

# Payment Gateway
PAYMENT_API_KEY=pk_live_xxxx
PAYMENT_API_URL=https://store.ku.anjay.fun/api/v1
PAYMENT_SECRET_KEY=sk_live_xxxx

# URL frontend lokal
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5174
```

**Generate key, migrate, dan seed:**
```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
```

> `db:seed` akan membuat akun admin default. Cek file `database/seeders/AdminSeeder.php` untuk kredensialnya.

**Jalankan server:**
```bash
php artisan serve
# Backend berjalan di: http://localhost:8000
```

---

### 3.2 Setup Frontend

```bash
cd SistemPembayaran/frontend
```

**Install dependencies:**
```bash
npm install
```

**Salin file environment:**
```bash
cp .env.example .env.local
```

Isi `.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

**Jalankan dev server:**
```bash
npm run dev
# Frontend berjalan di: https://localhost:5173
```

> Dev server menggunakan HTTPS self-signed (untuk akses kamera QR scanner dari HP).
> Browser akan memberi peringatan "Not Secure" — klik **Advanced > Proceed** untuk lanjut.

---

### 3.3 Akun Admin Default

Setelah `db:seed`, login di `https://localhost:5173/admin/login` menggunakan kredensial dari `AdminSeeder.php`.

---

## 4. Konfigurasi Payment Gateway

Payment gateway yang digunakan adalah **QRIS Invoice API** di `https://store.ku.anjay.fun/api/v1`.

### 4.1 Autentikasi

API menggunakan `x-api-key` di header request. Nilai diambil dari `PAYMENT_SECRET_KEY` di `.env`.

### 4.2 Alur Invoice

1. Backend hit `POST https://store.ku.anjay.fun/api/v1/invoices`
2. Response berisi `paymentUrl` → dikirim ke frontend
3. Frontend redirect user ke `paymentUrl`
4. User scan QRIS dan bayar
5. Gateway kirim `POST` ke webhook URL backend
6. Backend update order jadi `PAID` dan generate tiket

### 4.3 Format Webhook yang Diterima

Gateway mengirim payload berikut ke endpoint webhook:

```json
{
  "invoiceCode": "INV-xxx",
  "externalId": "ORD-xxx",
  "paymentStatus": "PAID",
  "paymentMethod": "QRIS",
  "amount": 150000,
  "paidAt": "2025-07-31T15:30:00.000Z"
}
```

### 4.4 Daftarkan Webhook URL

Di dashboard payment gateway, daftarkan URL berikut sebagai Webhook URL:

**Production:**
```
https://badangperkasa.com/tiket-api/api/payment/webhook
```

**Lokal (untuk testing dengan ngrok):**
```
https://xxxx.ngrok.io/api/payment/webhook
```

---

## 5. Deploy ke cPanel (badangperkasa.com)

### 5.1 Struktur Folder di cPanel

```
/home/username/
├── public_html/                    ← badangperkasa.com
│   ├── index.html                  ← website utama (sudah ada)
│   ├── tiket/                      ← badangperkasa.com/tiket
│   │   ├── .htaccess               ← dari deploy/htaccess/tiket.htaccess
│   │   ├── index.html              ← hasil build React
│   │   └── assets/
│   └── tiket-api/                  ← badangperkasa.com/tiket-api
│       └── .htaccess               ← dari deploy/htaccess/tiket-api.htaccess
│
└── tiket-api-core/                 ← Laravel app (DI LUAR public_html)
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/
    ├── routes/
    ├── vendor/
    ├── .env
    └── artisan
```

> **Keamanan:** `tiket-api-core` wajib di luar `public_html`. Ini mencegah
> file `.env`, `vendor/`, dan source code diakses langsung lewat browser.

---

### 5.2 Langkah Deploy Frontend

**Build di lokal:**
```bash
cd SistemPembayaran/frontend
npm run build
# Output: frontend/dist/
```

> Build production otomatis menggunakan `.env.production` sehingga
> `VITE_API_URL` mengarah ke `https://badangperkasa.com/tiket-api/api`.

**Upload via cPanel File Manager atau FTP:**

1. Upload **isi** folder `frontend/dist/` ke `public_html/tiket/`
   - Yang diupload: `index.html`, folder `assets/`, dan file lainnya di dalam `dist/`
2. Buat file `.htaccess` di `public_html/tiket/` dengan isi dari `deploy/htaccess/tiket.htaccess`

---

### 5.3 Langkah Deploy Backend

**Upload file Laravel:**

Upload seluruh folder `SistemPembayaran/backend/` ke `/home/username/tiket-api-core/`.

Yang perlu diupload:
```
app/         bootstrap/    config/      database/
public/      resources/    routes/      storage/
vendor/      .env          artisan      composer.json
```

> **Tip:** Zip dulu foldernya, upload 1 file, lalu extract di cPanel.
> Pastikan folder `vendor/` ikut terupload agar tidak perlu jalankan `composer install` di server.

**Buat folder bridge:**

Buat folder `public_html/tiket-api/` dan buat file `.htaccess` di dalamnya
dengan isi dari `deploy/htaccess/tiket-api.htaccess`.

---

### 5.4 Konfigurasi .env Backend di Server

Edit file `/home/username/tiket-api-core/.env`:

```env
APP_NAME="TAPS"
APP_ENV=production
APP_KEY=                          # akan di-generate di langkah selanjutnya
APP_DEBUG=false
APP_URL=https://badangperkasa.com/tiket-api

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database
DB_CONNECTION=pgsql
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.YOUR_PROJECT_REF
DB_PASSWORD=YOUR_SUPABASE_PASSWORD

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

# Payment Gateway
PAYMENT_API_KEY=pk_live_4b10443180570b2fb6146df8882c4508
PAYMENT_API_URL=https://store.ku.anjay.fun/api/v1
PAYMENT_SECRET_KEY=sk_live_xxxx        # ← isi dengan secret key

# URL
FRONTEND_URL=https://badangperkasa.com/tiket
SANCTUM_STATEFUL_DOMAINS=badangperkasa.com
CORS_ALLOWED_ORIGINS=https://badangperkasa.com,https://badangperkasa.com/tiket
```

---

### 5.5 Jalankan Perintah Artisan di Terminal cPanel

Buka **cPanel > Terminal**, lalu:

```bash
cd ~/tiket-api-core

# Generate app key
php artisan key:generate

# Jalankan migrasi database
php artisan migrate --force

# Buat akun admin
php artisan db:seed --class=AdminSeeder

# Cache konfigurasi untuk performa (wajib di production)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Pastikan storage bisa ditulis
chmod -R 775 storage bootstrap/cache
```

---

### 5.6 Verifikasi Deploy

Test endpoint health check:
```
GET https://badangperkasa.com/tiket-api/up
```
Harus return HTTP 200.

Test API publik:
```
GET https://badangperkasa.com/tiket-api/api/ticket-categories
```
Harus return JSON list kategori tiket.

Buka frontend di browser:
```
https://badangperkasa.com/tiket
```

---

## 6. Referensi API Endpoint

Base URL lokal: `http://localhost:8000/api`
Base URL production: `https://badangperkasa.com/tiket-api/api`

### Public (tanpa auth)

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/ticket-categories` | Daftar kategori tiket aktif |
| `POST` | `/orders` | Buat order baru |
| `GET` | `/orders/{orderNumber}` | Detail order |
| `POST` | `/payment/checkout` | Buat invoice, return `paymentUrl` |
| `GET` | `/payment/status/{orderNumber}` | Cek status pembayaran |
| `POST` | `/payment/webhook` | Terima notifikasi dari gateway |
| `GET` | `/tickets/{ticketUuid}` | Detail tiket |
| `POST` | `/auth/login` | Login admin |

### Auth (butuh Bearer token Sanctum)

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/auth/logout` | Logout |
| `GET` | `/auth/me` | Data user login |

### Admin (butuh Bearer token + role admin)

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/admin/dashboard` | Statistik dashboard |
| `GET` | `/admin/customers` | Daftar pembeli |
| `DELETE` | `/admin/customers/{orderNumber}` | Hapus order |
| `GET` | `/admin/orders` | Semua order |
| `GET` | `/admin/ticket-categories` | Semua kategori (termasuk nonaktif) |
| `POST` | `/admin/ticket-categories` | Buat kategori baru |
| `PUT` | `/admin/ticket-categories/{id}` | Update kategori |
| `PATCH` | `/admin/ticket-categories/{id}/status` | Toggle aktif/nonaktif |
| `POST` | `/admin/tickets/scan` | Scan QR tiket (check-in) |

---

## 7. Troubleshooting

### Error 500 saat checkout

Cek log di `tiket-api-core/storage/logs/laravel.log`.
Kemungkinan penyebab:
- `PAYMENT_SECRET_KEY` kosong atau salah
- `PAYMENT_API_URL` tidak bisa diakses dari server hosting

### Halaman `/tiket` muncul 404 saat refresh

Pastikan file `.htaccess` di `public_html/tiket/` sudah ter-upload dengan benar
dan `mod_rewrite` aktif di cPanel.

### API return 404 semua endpoint

Pastikan `.htaccess` di `public_html/tiket-api/` sudah benar dan path ke
`tiket-api-core/public/` tepat relatif terhadap lokasi file `.htaccess`.

### Webhook tidak diterima

1. Pastikan URL webhook sudah didaftarkan di dashboard payment gateway
2. Pastikan `APP_DEBUG=false` di production (beberapa hosting block debug output)
3. Cek log: `storage/logs/laravel.log`
4. Test manual via Postman dengan kirim POST ke `/api/payment/webhook`

### Storage permission error

```bash
cd ~/tiket-api-core
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Config lama masih terbaca setelah update .env

```bash
cd ~/tiket-api-core
php artisan config:clear
php artisan config:cache
```
