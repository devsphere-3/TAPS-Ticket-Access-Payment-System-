# PRD — Sistem Pembelian dan Validasi Tiket Online (TAPS)

**Versi:** 1.0 Final  
**Status:** Development  
**Backend:** Laravel  
**Frontend:** React + Vite  
**Database:** Supabase PostgreSQL  
**Authentication:** Laravel Sanctum  
**Payment:** Demo Payment pada tahap awal  
**Production Payment:** Payment Gateway  
**Ticket Validation:** QR Code / Barcode Scanner  
**Deployment:** Shared Hosting cPanel  
**Target:** Sistem ringan, aman, dan mudah dikembangkan

---

# 1. Ringkasan Project

Sistem ini merupakan aplikasi web untuk pembelian tiket secara online dan validasi tiket pada saat customer memasuki event.

Sistem memiliki dua role utama:

1. Customer
2. Admin

Customer dapat memilih kategori tiket, mengisi data, melakukan pemesanan, melakukan pembayaran, dan mendapatkan e-ticket berupa QR Code.

Admin dapat mengelola kategori dan harga tiket, melihat daftar customer, memonitor penjualan, serta melakukan scan QR Code untuk memvalidasi tiket dan mencatat kehadiran.

Pada tahap awal, payment gateway asli belum digunakan. Sistem menggunakan **Demo Payment** yang dapat langsung diselesaikan untuk melakukan simulasi proses pembayaran.

Arsitektur aplikasi menggunakan:

```text
React
   ↓
Laravel API
   ↓
Supabase PostgreSQL
```

React berfungsi sebagai frontend, Laravel sebagai backend/API dan business logic, sedangkan Supabase digunakan sebagai database PostgreSQL.

---

# 2. Tujuan Sistem

Sistem dibuat dengan tujuan:

1. Mempermudah customer membeli tiket secara online.
2. Mengurangi pencatatan tiket secara manual.
3. Menghasilkan e-ticket otomatis setelah pembayaran berhasil.
4. Menggunakan QR Code sebagai identitas tiket.
5. Mempermudah admin melakukan validasi tiket.
6. Mencegah tiket digunakan lebih dari satu kali.
7. Menampilkan status kehadiran customer.
8. Mempermudah admin mengelola harga tiket.
9. Menampilkan data customer berdasarkan kategori.
10. Menyiapkan sistem agar payment gateway asli dapat ditambahkan di kemudian hari.
11. Mengurangi beban server hosting dengan menggunakan Supabase sebagai database.

---

# 3. Arsitektur Sistem

Arsitektur utama:

```text
                         INTERNET
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      Customer Browser               Admin Browser
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                  React + Vite Frontend
                            │
                       HTTP / HTTPS
                            │
                            ▼
                    Laravel REST API
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
          Orders        Tickets        Payments
             │              │              │
             └──────────────┴──────────────┘
                            │
                            ▼
                   Supabase PostgreSQL
```

---

# 4. Teknologi

## 4.1 Frontend

Menggunakan:

- React
- Vite
- React Router
- Axios atau Fetch API
- Tailwind CSS
- QR Code Scanner Library
- QR Code Generator

React hanya digunakan sebagai frontend.

Pada production, React akan di-build menjadi static files.

```bash
npm run build
```

Hasil build kemudian dapat ditempatkan di hosting.

---

# 5. Backend

Backend menggunakan:

- Laravel
- PHP
- Laravel Sanctum
- Laravel Eloquent
- Laravel API Resources
- Laravel Validation
- Laravel Middleware
- Laravel Database Transactions

Laravel bertanggung jawab terhadap:

- Authentication
- Authorization
- Order
- Payment
- Ticket
- QR validation
- Check-in
- Business logic
- Database access
- Security

---

# 6. Database

Database menggunakan:

**Supabase PostgreSQL**

Supabase hanya digunakan sebagai database PostgreSQL pada versi pertama.

Arsitektur:

```text
React
  ↓
Laravel
  ↓
Supabase PostgreSQL
```

React tidak mengakses database secara langsung untuk proses utama.

---

# 7. Prinsip Database

Laravel menjadi satu-satunya backend yang berkomunikasi dengan database untuk operasi utama.

Customer tidak boleh:

```text
React → Supabase
```

untuk membuat order atau memvalidasi tiket.

Sebaliknya:

```text
React
  ↓
Laravel API
  ↓
Supabase PostgreSQL
```

Tujuannya:

- Menjaga business logic di backend.
- Mengamankan database.
- Mencegah manipulasi harga.
- Mencegah manipulasi status tiket.
- Mencegah customer membuat tiket secara ilegal.
- Mempermudah integrasi payment gateway.

---

# 8. User Role

## 8.1 Customer

Customer dapat:

- Melihat kategori tiket.
- Melihat harga tiket.
- Membeli tiket.
- Mengisi nama.
- Mengisi nomor telepon.
- Memilih kategori tiket.
- Memilih jumlah tiket.
- Membuat order.
- Melakukan Demo Payment.
- Melihat status pembayaran.
- Mendapatkan e-ticket.
- Melihat QR Code.
- Menampilkan tiket kepada admin.

Customer tidak memiliki akses ke dashboard admin.

---

# 9. Admin

Admin dapat:

- Login.
- Melihat dashboard.
- Melihat statistik tiket.
- Melihat customer.
- Melihat order.
- Mengelola kategori tiket.
- Membuat kategori.
- Mengubah harga.
- Mengaktifkan/nonaktifkan kategori.
- Melakukan scan tiket.
- Melihat status kehadiran.
- Melihat waktu check-in.
- Melihat admin yang melakukan check-in.

---

# 10. Kategori Tiket

Sistem menyediakan tiga kategori awal:

```text
Siswa
Umum
VIP
```

Kategori dibuat dinamis agar admin dapat mengubahnya.

Data kategori:

```text
id
name
slug
description
price
is_active
created_at
updated_at
```

Contoh:

```text
Siswa
Rp25.000

Umum
Rp50.000

VIP
Rp100.000
```

Harga hanya contoh.

---

# 11. Pengelolaan Harga

Admin dapat:

- Menambah kategori.
- Mengubah nama kategori.
- Mengubah harga.
- Mengubah deskripsi.
- Mengaktifkan kategori.
- Menonaktifkan kategori.

Harga baru hanya berlaku untuk order baru.

Contoh:

Customer membeli:

```text
VIP
Rp100.000
```

Kemudian admin mengubah:

```text
VIP
Rp150.000
```

Order lama tetap:

```text
Rp100.000
```

Karena harga disimpan sebagai snapshot pada order item.

---

# 12. Customer Purchase Flow

Alur pembelian:

```text
Customer membuka website
        ↓
Melihat tiket
        ↓
Memilih kategori
        ↓
Mengisi nama
        ↓
Mengisi nomor telepon
        ↓
Memilih jumlah
        ↓
Konfirmasi
        ↓
Create Order
        ↓
Demo Payment
        ↓
Payment Success
        ↓
Generate Ticket
        ↓
Generate QR Code
        ↓
E-Ticket tersedia
```

---

# 13. Customer Form

Form pembelian:

```text
Nama Lengkap
Nomor Telepon
Kategori Tiket
Jumlah Tiket
```

Validasi nama:

- Wajib.
- Minimal 3 karakter.

Validasi nomor telepon:

- Wajib.
- Format nomor harus valid.

Validasi kategori:

- Wajib.
- Harus aktif.
- Harus tersedia di database.

Validasi jumlah:

- Minimal 1.
- Maksimal mengikuti konfigurasi sistem.

---

# 14. Order

Setelah form dikirim, Laravel membuat order.

Contoh:

```text
Order ID:
ORD-20260819-0001

Nama:
Wahyu

No. Telepon:
08xxxxxxxxxx

Kategori:
VIP

Jumlah:
2

Harga:
Rp100.000

Total:
Rp200.000

Status:
UNPAID
```

---

# 15. Order Status

Order memiliki status:

```text
UNPAID
PAID
CANCELLED
EXPIRED
```

Alur normal:

```text
UNPAID
   ↓
PAID
```

Jika pembayaran dibatalkan:

```text
UNPAID
   ↓
CANCELLED
```

---

# 16. Demo Payment

Pada tahap development belum ada payment gateway asli.

Sistem menyediakan:

```text
Demo Payment
```

Halaman:

```text
PEMBAYARAN DEMO

Order:
ORD-20260819-0001

Total:
Rp200.000

Status:
Menunggu Pembayaran

[ BAYAR SEKARANG ]
```

Ketika tombol ditekan:

```text
UNPAID
   ↓
PAID
```

Kemudian sistem membuat ticket.

---

# 17. Payment Service Architecture

Payment harus menggunakan abstraction/service.

Struktur:

```text
PaymentService
       │
       ├── DemoPaymentService
       │
       └── ProductionPaymentService
                  │
                  └── Payment Gateway
```

Versi pertama:

```text
DemoPaymentService
```

Versi production dapat menggunakan:

```text
Midtrans
Xendit
Tripay
Payment Gateway lainnya
```

Dengan pendekatan ini, sistem tidak perlu mengubah seluruh logic order ketika payment gateway asli ditambahkan.

---

# 18. Payment Security

Secret key payment gateway tidak boleh disimpan di React.

Jangan:

```text
React
  ↓
Payment Gateway Secret Key
```

Yang benar:

```text
React
  ↓
Laravel
  ↓
Payment Gateway
```

Secret key berada pada `.env` Laravel.

---

# 19. Ticket Generation

Ticket dibuat setelah pembayaran berhasil.

Setiap ticket memiliki:

```text
Ticket UUID
Order ID
Customer Name
Customer Phone
Category
Status
QR Code
Used At
Created At
```

Contoh:

```text
E-TICKET

Ticket ID:
TKT-8F2A91

Nama:
Wahyu

No. Telepon:
08xxxxxxxxxx

Kategori:
VIP

Status:
BELUM HADIR

[ QR CODE ]
```

---

# 20. Ticket UUID

QR Code tidak menyimpan seluruh data customer.

QR Code hanya menyimpan identifier unik.

Contoh:

```text
TKT-8F2A91
```

atau UUID:

```text
8c8d8f8e-xxxx-xxxx-xxxx-xxxxxxxx
```

Ketika QR Code di-scan:

```text
QR Code
   ↓
Ticket UUID
   ↓
Laravel API
   ↓
Database
   ↓
Ticket Validation
```

---

# 21. Ticket Status

Ticket memiliki:

```text
UNUSED
USED
CANCELLED
```

UI:

```text
UNUSED
□ Belum Hadir
```

```text
USED
✓ Hadir
```

```text
CANCELLED
× Dibatalkan
```

---

# 22. Attendance

Attendance memiliki:

```text
NOT_PRESENT
PRESENT
```

Ketika ticket belum digunakan:

```text
□
NOT_PRESENT
```

Ketika berhasil di-scan:

```text
✓
PRESENT
```

Data:

```text
ticket_id
status
checked_in_at
checked_in_by
```

---

# 23. Admin Dashboard

Dashboard admin menampilkan:

```text
Total Customer
Total Tiket
Total Terjual
Total Hadir
Belum Hadir
```

Contoh:

```text
TOTAL CUSTOMER
500

TIKET TERJUAL
450

SUDAH HADIR
320

BELUM HADIR
130
```

---

# 24. Statistik Kategori

Dashboard menampilkan:

```text
Siswa
150

Umum
220

VIP
80
```

Statistik dapat berupa:

- Card.
- Bar chart.
- Pie/donut chart.

Untuk versi awal, gunakan visualisasi yang ringan.

---

# 25. Customer Management

Admin memiliki tabel:

| Nama | No. Telepon | Kategori | Order | Pembayaran | Kehadiran | Waktu |
|---|---|---|---|---|---|---|

Contoh:

```text
Wahyu
08xxxxxxxx
VIP
ORD001
PAID
✓
19:20

Andi
08xxxxxxxx
Umum
ORD002
PAID
□
-

Budi
08xxxxxxxx
Siswa
ORD003
PAID
✓
19:30
```

---

# 26. Customer Filter

Admin dapat filter:

## Kategori

```text
Semua
Siswa
Umum
VIP
```

## Payment

```text
Semua
PAID
UNPAID
CANCELLED
```

## Attendance

```text
Semua
Hadir
Belum Hadir
```

---

# 27. Search

Admin dapat melakukan pencarian:

```text
Nama
Nomor Telepon
Order ID
Ticket ID
```

Contoh:

```text
Search:
[ Wahyu ]
```

---

# 28. Pagination

Customer table menggunakan pagination.

Contoh:

```text
Showing 1–20 of 500

[Previous]
[1]
[2]
[3]
[Next]
```

Laravel menggunakan pagination database.

React hanya menerima data yang diperlukan.

---

# 29. Ticket Scanner

Admin memiliki menu:

```text
Scan Tiket
```

Scanner menggunakan kamera perangkat.

Alur:

```text
Admin membuka scanner
        ↓
Browser meminta permission kamera
        ↓
Kamera aktif
        ↓
QR Code diarahkan
        ↓
QR Code terbaca
        ↓
Ticket UUID dikirim ke Laravel
        ↓
Laravel melakukan validasi
```

---

# 30. Validasi Ticket

Backend memeriksa:

```text
Apakah ticket ada?
        │
        ├── Tidak → INVALID
        │
        └── Ya
             ↓
      Apakah CANCELLED?
             │
             ├── Ya → CANCELLED
             │
             └── Tidak
                   ↓
             Apakah USED?
                   │
                   ├── Ya → ALREADY USED
                   │
                   └── Tidak
                         ↓
                       VALID
                         ↓
                    CHECK-IN
```

---

# 31. Successful Scan

Jika valid:

```text
✓ TIKET VALID

Nama:
Wahyu

No. Telepon:
08xxxxxxxx

Kategori:
VIP

Status:
BERHASIL MASUK

Waktu:
19:20:32
```

Database:

```text
ticket.status = USED

attendance.status = PRESENT

attendance.checked_in_at = current_time

attendance.checked_in_by = admin_id
```

---

# 32. Duplicate Scan

Jika ticket sudah digunakan:

```text
⚠ TIKET SUDAH DIGUNAKAN

Nama:
Wahyu

Kategori:
VIP

Waktu Check-in:
19:20:32

Tiket tidak dapat digunakan kembali.
```

Backend mengembalikan:

```text
HTTP 409 Conflict
```

---

# 33. Invalid Ticket

Jika ticket tidak ditemukan:

```text
✕ TIKET TIDAK VALID

QR Code tidak terdaftar.
```

Tidak ada perubahan database.

---

# 34. Double Scan Protection

Proses check-in wajib menggunakan database transaction.

Konsep:

```text
BEGIN TRANSACTION

Lock ticket

Check status

Jika UNUSED:
    Update USED
    Create Attendance

Jika USED:
    Reject

COMMIT
```

PostgreSQL transaction digunakan untuk mencegah dua scanner menggunakan ticket yang sama secara bersamaan.

---

# 35. Authentication

## Admin

Admin wajib login.

```text
Email
Password
```

Laravel Sanctum digunakan untuk authentication API.

---

# 36. Customer Authentication

Pada versi pertama, customer tidak perlu membuat akun.

Customer cukup mengisi:

```text
Nama
Nomor Telepon
```

Setelah pembayaran berhasil, customer mendapatkan ticket.

Customer dapat membuka ticket menggunakan:

```text
Ticket ID
```

atau melalui halaman sukses setelah pembayaran.

Authentication customer dapat ditambahkan pada versi berikutnya jika diperlukan.

---

# 37. Demo Account

Akun development:

```text
Email:
admin@demo.test

Password:
password
```

Akun ini hanya digunakan pada development/testing.

Sebelum production:

- Password harus diganti.
- Akun demo harus dihapus atau dinonaktifkan.

---

# 38. Database Schema

Database menggunakan Supabase PostgreSQL.

## users

```text
id
name
email
password
role
created_at
updated_at
```

Role:

```text
admin
customer
```

---

# 39. ticket_categories

```text
id
name
slug
description
price
is_active
created_at
updated_at
```

Index:

```text
slug
is_active
```

---

# 40. orders

```text
id
order_number
customer_name
customer_phone
total_amount
payment_status
payment_method
paid_at
created_at
updated_at
```

Index:

```text
order_number
customer_phone
payment_status
```

---

# 41. order_items

```text
id
order_id
ticket_category_id
ticket_category_name
unit_price
quantity
subtotal
created_at
updated_at
```

`ticket_category_name` dan `unit_price` merupakan snapshot.

Tujuannya agar perubahan harga tidak mengubah order lama.

---

# 42. tickets

```text
id
order_id
ticket_category_id
ticket_uuid
customer_name
customer_phone
category_name
status
used_at
created_at
updated_at
```

Index:

```text
ticket_uuid
order_id
status
```

`ticket_uuid` harus UNIQUE.

---

# 43. attendances

```text
id
ticket_id
status
checked_in_at
checked_in_by
created_at
updated_at
```

Index:

```text
ticket_id
checked_in_by
```

---

# 44. Database Relationship

```text
users
 │
 └──── attendances.checked_in_by


ticket_categories
 │
 ├──── order_items
 │
 └──── tickets


orders
 │
 ├──── order_items
 │
 └──── tickets


tickets
 │
 └──── attendances
```

---

# 45. API Structure

## Public API

```http
GET /api/ticket-categories
```

Mengambil kategori aktif.

```http
POST /api/orders
```

Membuat order.

```http
GET /api/orders/{orderNumber}
```

Mengambil detail order.

```http
POST /api/payment/demo
```

Melakukan Demo Payment.

```http
GET /api/tickets/{ticketUuid}
```

Mengambil detail ticket.

---

# 46. Admin API

Endpoint admin membutuhkan authentication.

```http
GET /api/admin/dashboard
```

```http
GET /api/admin/customers
```

```http
GET /api/admin/orders
```

```http
GET /api/admin/ticket-categories
```

```http
POST /api/admin/ticket-categories
```

```http
PUT /api/admin/ticket-categories/{id}
```

```http
PATCH /api/admin/ticket-categories/{id}/status
```

```http
POST /api/admin/tickets/scan
```

---

# 47. Scanner Request

Request:

```json
{
  "ticket_uuid": "TKT-8F2A91"
}
```

Response sukses:

```json
{
  "success": true,
  "message": "Ticket berhasil digunakan",
  "ticket": {
    "ticket_uuid": "TKT-8F2A91",
    "name": "Wahyu",
    "phone": "08xxxxxxxx",
    "category": "VIP",
    "status": "USED"
  }
}
```

---

# 48. React Pages

Struktur:

```text
/
├── Home
├── Tickets
├── Checkout
├── Payment
├── PaymentSuccess
├── Ticket
│
└── Admin
    ├── Login
    ├── Dashboard
    ├── Customers
    ├── Categories
    └── Scanner
```

---

# 49. Customer Homepage

Halaman:

```text
Header
Hero Event
Informasi Event
Kategori Tiket
Cara Pembelian
FAQ
Footer
```

Kategori:

```text
SISWA
Rp25.000
[Beli]

UMUM
Rp50.000
[Beli]

VIP
Rp100.000
[Beli]
```

---

# 50. Checkout Page

Tampilan:

```text
Data Customer

Nama
[________________]

Nomor Telepon
[________________]

Kategori
[ VIP ]

Jumlah
[ 2 ]

Harga
Rp100.000

Total
Rp200.000

[ Lanjutkan Pembayaran ]
```

---

# 51. Payment Page

```text
PEMBAYARAN

Order:
ORD-20260819-0001

Total:
Rp200.000

Status:
Menunggu Pembayaran

[ BAYAR SEKARANG ]
```

---

# 52. Payment Success

```text
✓ PEMBAYARAN BERHASIL

Order:
ORD-20260819-0001

Pembayaran:
PAID

Tiket berhasil dibuat.

[ LIHAT E-TICKET ]
```

---

# 53. E-Ticket Page

Tampilan harus mobile-friendly.

```text
------------------------------
          E-TICKET

         [ QR CODE ]

Nama:
Wahyu

No. Telepon:
08xxxxxxxx

Kategori:
VIP

Ticket ID:
TKT-8F2A91

Status:
BELUM DIGUNAKAN
------------------------------
```

---

# 54. Admin Layout

Sidebar:

```text
Dashboard
Customer
Order
Kategori Tiket
Scan Tiket
Logout
```

Dashboard menggunakan layout responsive.

---

# 55. Admin Dashboard

Card:

```text
Total Customer
Total Tiket
Total Terjual
Total Hadir
Belum Hadir
```

Kemudian statistik:

```text
Siswa
Umum
VIP
```

---

# 56. Admin Category Management

Tabel:

```text
Kategori
Harga
Status
Action
```

Contoh:

```text
Siswa
Rp25.000
Aktif
Edit

Umum
Rp50.000
Aktif
Edit

VIP
Rp100.000
Aktif
Edit
```

---

# 57. Responsive Scanner

Scanner harus mendukung:

- Smartphone.
- Tablet.
- Laptop dengan webcam.

Browser akan meminta:

```text
Allow Camera
```

Scanner harus menyediakan fallback jika kamera tidak tersedia.

Fallback dapat berupa input manual:

```text
Ticket ID

[________________]

[ VALIDASI ]
```

Fitur ini berguna jika kamera bermasalah.

---

# 58. Security

Sistem wajib:

- HTTPS.
- Password hashing.
- Authentication.
- Authorization.
- Input validation.
- API rate limiting.
- UUID ticket.
- Database transaction.
- Double scan protection.
- Server-side price validation.
- Tidak mempercayai harga dari frontend.
- Tidak menyimpan secret key di React.
- Tidak menyimpan data sensitif dalam QR Code.

---

# 59. Price Security

Frontend tidak boleh menentukan harga.

Contoh request:

```json
{
  "category_id": 3,
  "quantity": 2
}
```

Laravel mengambil harga dari database:

```text
category_id
     ↓
Supabase
     ↓
price
     ↓
Laravel menghitung total
```

Bukan:

```json
{
  "price": 1
}
```

Harga yang dikirim frontend harus diabaikan.

---

# 60. QR Security

QR Code hanya menyimpan:

```text
ticket_uuid
```

Jangan menyimpan:

```text
Nama
Nomor Telepon
Harga
Status
```

secara langsung di QR Code.

Semua informasi diambil dari backend.

---

# 61. Realtime

Realtime **tidak wajib pada versi 1**.

Setelah scan:

```text
Scanner
   ↓
Laravel API
   ↓
Supabase
```

Admin dashboard dapat melakukan refresh data atau request ulang API.

Supabase Realtime dapat ditambahkan jika nantinya diperlukan.

Namun untuk menjaga hosting tetap ringan, realtime tidak digunakan terlebih dahulu.

---

# 62. Supabase Configuration

Laravel menggunakan koneksi PostgreSQL ke Supabase.

Konfigurasi berada pada:

```text
.env
```

Contoh konsep:

```text
DB_CONNECTION=pgsql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=...
```

Credential tidak boleh dimasukkan ke React.

---

# 63. Supabase Security

Karena Laravel menjadi backend utama:

```text
React
 ↓
Laravel
 ↓
Supabase
```

Credential database hanya berada pada Laravel.

Supabase tidak diekspos langsung kepada public frontend untuk operasi database utama.

---

# 64. Laravel Environment

Contoh:

```text
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain.com

DB_CONNECTION=pgsql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=...
DB_PASSWORD=...

SANCTUM_STATEFUL_DOMAINS=domain.com
```

Secret tidak boleh dimasukkan ke repository public.

---

# 65. Hosting Architecture

Karena hosting menggunakan shared hosting cPanel, aplikasi dibuat tanpa proses Node.js yang berjalan terus-menerus.

Production:

```text
React
    ↓
npm run build
    ↓
Static Files
    ↓
cPanel
```

Laravel:

```text
Laravel
    ↓
PHP
    ↓
cPanel
```

Database:

```text
Laravel
    ↓
Internet
    ↓
Supabase PostgreSQL
```

---

# 66. Kenapa Arsitektur Ini Ringan

Frontend React tidak menjalankan server Node.js.

React hanya menghasilkan:

```text
HTML
CSS
JavaScript
Assets
```

Setelah build:

```bash
npm run build
```

Frontend menjadi static.

Laravel hanya menangani API dan business logic.

Database berada di Supabase.

Sehingga hosting tidak perlu menjalankan:

- Node.js server.
- PostgreSQL server.
- Redis.
- WebSocket server.

---

# 67. Hosting Resource Optimization

Prioritas optimasi:

## React

- Production build.
- Lazy loading.
- Code splitting.
- Compress assets.
- WebP.
- Hindari library besar.
- Jangan menggunakan development server.

## Laravel

Gunakan:

```text
APP_DEBUG=false
```

Gunakan pagination.

Gunakan eager loading jika diperlukan.

Gunakan database index.

Gunakan cache jika diperlukan.

---

# 68. Database Optimization

Index utama:

```text
ticket_categories.slug
ticket_categories.is_active

orders.order_number
orders.customer_phone
orders.payment_status

tickets.ticket_uuid
tickets.order_id
tickets.status

attendances.ticket_id
attendances.checked_in_by
```

Tujuannya mempercepat:

- Search.
- Scanner.
- Dashboard.
- Customer table.

---

# 69. Dashboard Query Optimization

Dashboard tidak boleh mengambil seluruh tabel.

Hindari:

```text
SELECT * FROM tickets
```

untuk statistik.

Gunakan aggregate query:

```text
COUNT
SUM
GROUP BY
```

Contoh:

```text
COUNT(total tickets)
COUNT(used tickets)
COUNT(unused tickets)
GROUP BY category
```

---

# 70. Pagination API

Gunakan:

```text
GET /api/admin/customers?page=1
```

Contoh response:

```json
{
  "data": [],
  "current_page": 1,
  "last_page": 10,
  "per_page": 20,
  "total": 200
}
```

---

# 71. Error Handling

HTTP status:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
500 Server Error
```

Frontend harus memberikan pesan yang mudah dipahami.

---

# 72. Customer Error

Contoh:

```text
Nomor telepon wajib diisi.
```

```text
Kategori tiket sudah tidak tersedia.
```

```text
Pembayaran gagal.
```

---

# 73. Scanner Error

```text
QR Code tidak valid.
```

```text
Tiket tidak ditemukan.
```

```text
Tiket sudah digunakan.
```

```text
Tiket telah dibatalkan.
```

---

# 74. Audit

Setiap check-in mencatat:

```text
Ticket
Admin
Tanggal
Waktu
```

Contoh:

```text
Ticket:
TKT-8F2A91

Admin:
admin@demo.test

Check-in:
19 Agustus 2026
19:20:32
```

---

# 75. Future Payment Gateway

Setelah sistem stabil, Demo Payment diganti payment gateway.

Contoh:

```text
React
  ↓
Laravel
  ↓
Create Order
  ↓
Payment Gateway
  ↓
Customer Payment
  ↓
Webhook
  ↓
Laravel
  ↓
Update PAID
  ↓
Generate Ticket
```

Webhook harus diproses oleh Laravel.

React tidak boleh menjadi sumber kebenaran status pembayaran.

---

# 76. Future Notification

Dapat dikembangkan:

```text
Payment Success
      ↓
Generate Ticket
      ↓
Send WhatsApp
      ↓
Customer menerima E-Ticket
```

atau:

```text
Payment Success
      ↓
Email
      ↓
E-Ticket
```

---

# 77. Future Features

Fitur yang dapat ditambahkan:

- Payment gateway.
- WhatsApp notification.
- Email notification.
- PDF ticket.
- Download ticket.
- Export Excel.
- Export CSV.
- Export PDF.
- Multiple event.
- Multiple admin.
- Role staff scanner.
- Super admin.
- Ticket quota.
- Ticket sales deadline.
- Promo code.
- Discount.
- Refund.
- Realtime dashboard.
- Attendance report.
- Revenue report.

---

# 78. Multi-Event Future Architecture

Jika nantinya sistem digunakan untuk banyak event:

```text
events
 │
 ├── ticket_categories
 │       │
 │       └── tickets
 │
 ├── orders
 │
 └── attendances
```

Struktur ini memungkinkan:

```text
Event A
 ├── Siswa
 ├── Umum
 └── VIP

Event B
 ├── Siswa
 ├── Umum
 └── VIP
```

Untuk versi 1, `events` belum wajib dibuat jika sistem hanya digunakan untuk satu event.

---

# 79. Development Phase

## Phase 1 — Project Setup

- [ ] Setup Laravel.
- [ ] Setup React + Vite.
- [ ] Setup Supabase.
- [ ] Connect Laravel ke PostgreSQL Supabase.
- [ ] Setup Sanctum.
- [ ] Setup API.
- [ ] Setup CORS.

---

## Phase 2 — Database

- [ ] Users.
- [ ] Ticket categories.
- [ ] Orders.
- [ ] Order items.
- [ ] Tickets.
- [ ] Attendances.
- [ ] Foreign keys.
- [ ] Unique constraints.
- [ ] Indexes.

---

## Phase 3 — Customer

- [ ] Homepage.
- [ ] Ticket categories.
- [ ] Checkout.
- [ ] Customer form.
- [ ] Order creation.
- [ ] Order detail.

---

## Phase 4 — Demo Payment

- [ ] Payment service.
- [ ] Demo payment page.
- [ ] Payment success.
- [ ] Payment status.
- [ ] Ticket generation.

---

## Phase 5 — E-Ticket

- [ ] QR Code.
- [ ] Ticket page.
- [ ] Ticket status.
- [ ] Ticket detail.

---

## Phase 6 — Admin

- [ ] Admin login.
- [ ] Dashboard.
- [ ] Statistics.
- [ ] Customer table.
- [ ] Search.
- [ ] Filter.
- [ ] Pagination.
- [ ] Category management.
- [ ] Price management.

---

## Phase 7 — Scanner

- [ ] Camera permission.
- [ ] QR scanner.
- [ ] Ticket validation.
- [ ] Check-in.
- [ ] Duplicate scan protection.
- [ ] Manual ticket ID fallback.

---

## Phase 8 — Security

- [ ] Authentication.
- [ ] Authorization.
- [ ] Validation.
- [ ] Rate limiting.
- [ ] Transaction.
- [ ] Database constraints.
- [ ] Production environment.

---

## Phase 9 — Optimization

- [ ] React production build.
- [ ] Laravel optimization.
- [ ] Database indexing.
- [ ] API pagination.
- [ ] Image compression.
- [ ] Remove unused dependencies.

---

## Phase 10 — Deployment

- [ ] Configure cPanel.
- [ ] Upload Laravel.
- [ ] Upload React build.
- [ ] Configure `.env`.
- [ ] Configure Supabase.
- [ ] Configure domain.
- [ ] Configure SSL.
- [ ] Production testing.

---

# 80. Acceptance Criteria

## Customer

- [ ] Customer dapat melihat tiket.
- [ ] Customer dapat melihat harga.
- [ ] Customer dapat memilih kategori.
- [ ] Customer dapat mengisi nama.
- [ ] Customer dapat mengisi nomor telepon.
- [ ] Customer dapat memilih jumlah.
- [ ] Customer dapat membuat order.
- [ ] Customer dapat melakukan Demo Payment.
- [ ] Order berubah menjadi PAID.
- [ ] Ticket otomatis dibuat.
- [ ] QR Code otomatis dibuat.
- [ ] Customer dapat melihat e-ticket.

---

## Admin

- [ ] Admin dapat login.
- [ ] Admin dapat melihat dashboard.
- [ ] Admin dapat melihat statistik.
- [ ] Admin dapat melihat customer.
- [ ] Admin dapat search customer.
- [ ] Admin dapat filter customer.
- [ ] Admin dapat mengelola kategori.
- [ ] Admin dapat mengubah harga.
- [ ] Admin dapat mengaktifkan/nonaktifkan kategori.
- [ ] Admin dapat membuka scanner.
- [ ] Admin dapat scan QR Code.
- [ ] Ticket valid berubah menjadi USED.
- [ ] Attendance berubah menjadi PRESENT.
- [ ] Ticket yang sudah digunakan tidak dapat digunakan kembali.
- [ ] Waktu check-in tercatat.
- [ ] Admin yang melakukan check-in tercatat.

---

# 81. Definition of Done

Project versi 1 dianggap selesai jika:

```text
Customer
   ↓
Pilih Tiket
   ↓
Isi Data
   ↓
Order
   ↓
Demo Payment
   ↓
PAID
   ↓
E-Ticket
   ↓
QR Code
   ↓
Admin Scanner
   ↓
Validasi
   ↓
✓ HADIR
```

Seluruh proses tersebut harus berjalan tanpa error pada environment production.

---

# 82. Final Technology Architecture

```text
┌─────────────────────────────┐
│          CUSTOMER           │
│         Smartphone          │
└──────────────┬──────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────┐
│       REACT + VITE          │
│      Static Production      │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│          LARAVEL            │
│                             │
│ Authentication              │
│ Order Management            │
│ Payment Service              │
│ Ticket Management            │
│ QR Validation                │
│ Attendance                   │
│ Admin API                    │
└──────────────┬──────────────┘
               │
               │ PostgreSQL
               ▼
┌─────────────────────────────┐
│    SUPABASE POSTGRESQL      │
│                             │
│ users                       │
│ ticket_categories           │
│ orders                      │
│ order_items                 │
│ tickets                     │
│ attendances                 │
└─────────────────────────────┘
```

---

# 83. Final Hosting Architecture

```text
                  INTERNET
                     │
                     ▼
              ┌─────────────┐
              │   cPanel    │
              │             │
              │ React Build │
              │     +       │
              │   Laravel   │
              │     PHP     │
              └──────┬──────┘
                     │
                     │ HTTPS
                     ▼
              ┌─────────────┐
              │  Supabase   │
              │ PostgreSQL  │
              └─────────────┘
```

Tidak diperlukan:

```text
Node.js server
Redis server
WebSocket server
PostgreSQL server di hosting
Docker
```

untuk versi pertama.

---

# 84. Prinsip Utama Project

Sistem harus mengikuti prinsip:

```text
React = UI
Laravel = Business Logic
Supabase = Database
Demo Payment = Development
Payment Gateway = Production
QR Code = Ticket Identifier
Laravel = Ticket Validator
```

Dengan arsitektur tersebut, aplikasi tetap ringan untuk shared hosting dan memiliki struktur yang cukup fleksibel untuk dikembangkan menjadi sistem ticketing production.