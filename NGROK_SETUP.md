# Setup Ngrok untuk Development

Panduan lengkap untuk menggunakan ngrok agar aplikasi dapat diakses dari domain publik.

## Prerequisites
- ngrok sudah terinstall ([Download](https://ngrok.com/download))
- ngrok sudah di-authtoken (`ngrok config add-authtoken YOUR_TOKEN`)

## Langkah-Langkah

### 1. Jalankan Backend Laravel dengan Ngrok

Buka terminal baru dan jalankan:
```powershell
ngrok http 8000
```

Setelah ngrok berhasil, Anda akan mendapat output seperti:
```
Forwarding                    https://abc123xyz789.ngrok-free.dev -> http://localhost:8000
```

**Catat URL ngrok backend Anda**: `https://abc123xyz789.ngrok-free.dev`

### 2. Update Frontend Configuration

Edit file `.env.local` di root project:
```dotenv
# Ganti dengan URL ngrok backend Anda (tanpa /api)
NEXT_PUBLIC_API_URL=https://abc123xyz789.ngrok-free.dev
```

Contoh lengkap `.env.local`:
```dotenv
# Development lokal
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Untuk ngrok, uncomment dan ganti:
NEXT_PUBLIC_API_URL=https://abc123xyz789.ngrok-free.dev
```

### 3. Jalankan Frontend Next.js

Buka terminal baru di root project:
```powershell
npm run dev
```

Frontend akan berjalan di `http://localhost:80` (atau cukup `http://localhost`)

### 4. Akses via Ngrok Domain (Opsional)

Jika ingin akses frontend juga via ngrok:
```powershell
ngrok http 80
```

Ini akan memberikan Anda domain ngrok untuk frontend.

## Troubleshooting

### 1. Database Tidak Terhubung
**Masalah**: Data tidak muncul saat akses via ngrok

**Solusi**:
- Pastikan `NEXT_PUBLIC_API_URL` benar di `.env.local`
- Restart frontend (`npm run dev`)
- Check browser console (F12) untuk melihat error API

### 2. CORS Error
**Masalah**: "Access to XMLHttpRequest from origin blocked by CORS policy"

**Solusi**: Backend sudah dikonfigurasi untuk accept ngrok domains:
- File: `backend/config/cors.php` sudah berisi pattern untuk ngrok
- Jika masih error, restart backend Laravel

### 3. Session/Cookie Error
**Masalah**: Login gagal atau session tidak ter-save

**Solusi**: Sudah dikonfigurasi di `backend/.env`:
```
SANCTUM_STATEFUL_DOMAINS=localhost:80,.ngrok-free.dev,.ngrok.io
```

## Konfigurasi yang Sudah Dilakukan

✅ **Frontend (`lib/data.ts`)**:
- Menggunakan `NEXT_PUBLIC_API_URL` dari `.env.local`
- Support untuk localhost dan ngrok

✅ **Backend (`config/cors.php`)**:
- Allowed origins: `localhost:80` + pattern untuk ngrok domains
- Support credentials: true

✅ **Backend (`.env`)**:
- `SANCTUM_STATEFUL_DOMAINS` support ngrok domains

## Tips & Trik

### Auto-restart dengan perubahan .env.local
Setelah update `.env.local`, harus restart `npm run dev` agar perubahan terdeteksi.

### Monitor API Calls
Di ngrok web interface (`http://127.0.0.1:4040`), Anda bisa lihat semua HTTP requests dan responses.

### Gunakan HTTPS
Ngrok otomatis memberikan HTTPS yang aman untuk development.

## Quick Reference

**Local Development**:
```powershell
# Terminal 1 (Backend)
cd backend
php artisan serve

# Terminal 2 (Frontend)
cd ..
npm run dev
```

**Development dengan Ngrok**:
```powershell
# Terminal 1 (Backend + Ngrok)
cd backend
php artisan serve

# Terminal 2 (Ngrok Backend)
ngrok http 8000
# Copy URL dari output

# Terminal 3 (Frontend)
cd ..
# Edit .env.local dengan URL ngrok
npm run dev
```

---

Created: 2026-01-05
