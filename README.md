# TAPS - Ticket Access Payment System

Sistem tiket event yang terdiri dari frontend React + Vite dan backend Laravel. Project ini dirancang untuk proses pembelian tiket, pembayaran lokal, e-ticket, dan pengecekan kehadiran.

## Fitur utama

- Pembelian tiket secara online
- Checkout dan pembayaran lokal/dummy mode untuk testing
- Halaman pembayaran sukses dan e-ticket
- Admin panel untuk melihat order dan melakukan scan kehadiran
- API Laravel untuk order, payment, dan tiket
- Mode lokal untuk testing di jaringan LAN / perangkat lain

## Struktur project

- `backend/` - API Laravel
- `frontend/` - Frontend React + Vite
- `DEPLOYMENT.md` - Panduan deployment
- `PANDUAN.md` - Panduan penggunaan dan konfigurasi
- `PRD.md` - Product requirements document

## Teknologi

- Laravel 12
- PHP 8.2+
- PostgreSQL / Supabase
- React 19
- Vite
- Tailwind CSS

## Cara menjalankan lokal

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

### 3. Akses lokal

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Untuk akses dari perangkat lain di jaringan lokal: http://192.168.18.136:5173

## Konfigurasi penting

Pastikan file environment menggunakan URL lokal saat testing:

- Backend `.env`:
  - `APP_URL=http://192.168.18.136:8000`
  - `FRONTEND_URL=http://192.168.18.136:5173`
  - `PAYMENT_GATEWAY_ENABLED=false`

- Frontend `.env.production`:
  - `VITE_API_URL=http://192.168.18.136:8000/api`

## Catatan

Project ini dibuat untuk kebutuhan testing lokal sebelum mengaktifkan payment gateway secara live. Jika `PAYMENT_GATEWAY_ENABLED=false`, sistem akan menggunakan mode demo yang langsung mensimulasikan pembayaran berhasil.

## Git

Branch utama project saat ini disimpan pada `master`.

## Lisensi

Project ini digunakan untuk kebutuhan internal/testing dan pengembangan aplikasi tiket event.
