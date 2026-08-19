# TAPS — Deployment Guide (cPanel Shared Hosting)

## Arsitektur Production

```
cPanel
  ├── public_html/          ← React build (static files)
  │     ├── index.html
  │     └── assets/
  └── taps-api/             ← Laravel (di luar public_html)
        ├── app/
        ├── bootstrap/
        ├── config/
        ├── ...
        └── public/         ← symlink atau copy ke subfolder
```

---

## 1. Persiapan Database (Supabase)

1. Buat project baru di https://supabase.com/dashboard
2. Pilih region **Southeast Asia (Singapore)**
3. Catat: Host, Username (postgres.XXXX), Password
4. Pastikan koneksi dari IP hosting diizinkan (Supabase → Settings → Database → Connection Pooling)

---

## 2. Deploy Backend (Laravel)

### Upload via File Manager / FTP

1. Upload seluruh folder `backend/` ke hosting, misal ke `~/taps-api/`
2. **Jangan upload** folder `vendor/` dan `node_modules/` — install via SSH

### Setup via SSH (rekomendasi)

```bash
cd ~/taps-api

# Install dependencies
composer install --optimize-autoloader --no-dev

# Setup environment
cp .env.example .env
# Edit .env dengan credential asli
nano .env

# Generate app key
php artisan key:generate

# Jalankan migration
php artisan migrate --force

# Jalankan seeder (admin + kategori awal)
php artisan db:seed --force

# Optimasi Laravel untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Arahkan document root ke public/

Di cPanel → **Domains** atau **Subdomains**:
- Arahkan `api.yourdomain.com` → `~/taps-api/public`

Atau jika menggunakan subdirectory, buat file `~/taps-api/public/.htaccess` sudah tersedia.

---

## 3. Deploy Frontend (React)

### Build di lokal

```bash
cd frontend

# Update VITE base URL jika API di subdomain berbeda
# Edit vite.config.js bagian proxy atau gunakan env variable

npm run build
```

### Upload

Upload isi folder `frontend/dist/` ke `public_html/` (atau subdirectory yang diinginkan).

### Konfigurasi React Router (SPA)

Buat file `public_html/.htaccess`:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

Ini penting agar refresh halaman `/admin/dashboard` tidak 404.

---

## 4. Konfigurasi CORS & URL

Edit `backend/.env` production:

```env
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
```

Edit `frontend/src/lib/axios.js` jika API beda domain:

```js
const api = axios.create({
  baseURL: 'https://api.yourdomain.com/api',
  ...
})
```

Atau gunakan environment variable Vite:

```env
# frontend/.env.production
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 5. Checklist Pre-Launch

- [ ] `APP_DEBUG=false` di `.env`
- [ ] `APP_ENV=production` di `.env`  
- [ ] Password admin demo diganti
- [ ] Akun `admin` (password: `password`) diubah atau dihapus
- [ ] HTTPS aktif (SSL dari cPanel/Let's Encrypt)
- [ ] Test login admin
- [ ] Test beli tiket end-to-end
- [ ] Test scan QR Code
- [ ] Test kirim WA tiket

---

## 6. Akun Default (HAPUS sebelum production!)

| Username | Password | Keterangan |
|---|---|---|
| `admin` | `password` | Demo — GANTI/HAPUS |
| `MASTER` | `Master123` | GANTI PASSWORD |

Ganti password via tinker:
```bash
php artisan tinker
>>> App\Models\User::where('username','admin')->update(['password'=>bcrypt('PASSWORD_BARU')]);
```
