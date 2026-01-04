# Setup Ngrok Lengkap - Database Terdeteksi Saat Share Link

Panduan LENGKAP untuk menggunakan ngrok dengan sistem auto-detection API URL.

## 🎯 Masalah & Solusi

**Masalah**: Saat share link ngrok ke orang lain, database tidak terdeteksi karena API URL tidak diketahui.

**Solusi**: Sistem telah di-update dengan:
1. Dynamic API URL detection di frontend
2. Auto-detect dari backend `/api/config` endpoint
3. Support environment variable `NEXT_PUBLIC_API_URL`

## 📋 Cara Kerja

Aplikasi mencari API URL dalam urutan prioritas:

```
1. NEXT_PUBLIC_API_URL dari .env.local  ← USE THIS FOR NGROK
     ↓ (jika tidak ada)
2. Auto-detect dari /api/config endpoint
     ↓ (jika tidak ada)
3. Fallback localhost:8000
```

## 🚀 Setup Ngrok Step-by-Step

### **Step 1: Jalankan Backend**

```powershell
cd backend
php artisan serve
```

Backend akan jalan di `http://127.0.0.1:8000`

### **Step 2: Jalankan Ngrok untuk Backend**

Buka terminal baru:
```powershell
ngrok http 8000
```

Output akan seperti ini:
```
Forwarding                    https://contrapuntal-mallie-unheritable.ngrok-free.dev -> http://localhost:8000

Web Interface                 http://127.0.0.1:4040
```

**Catat URL ngrok**: `https://contrapuntal-mallie-unheritable.ngrok-free.dev`

### **Step 3: Update `.env.local` di Frontend**

Edit file `.env.local`:
```dotenv
# Ganti dengan URL ngrok Anda (TANPA /api)
NEXT_PUBLIC_API_URL=https://contrapuntal-mallie-unheritable.ngrok-free.dev
```

**PENTING**: 
- ❌ JANGAN tambah `/api`
- ✅ Format: `https://xxx.ngrok-free.dev`

### **Step 4: Jalankan Frontend**

Buka terminal baru:
```powershell
npm run dev
```

Frontend akan jalan di `http://localhost:80`

### **Step 5: Verify Everything Works**

Buka browser, buka `http://localhost` dan:
- [ ] Aplikasi loading
- [ ] Data (kuliner, reviews) tampil
- [ ] Login/Register bisa diakses
- [ ] API calls berhasil (cek F12 Console)

### **Step 6: Share Link ke Teman**

Buka terminal baru:
```powershell
ngrok http 80
```

Ini akan memberikan domain ngrok untuk frontend. Share domain ini ke teman.

**Teman Anda akan mengakses**:
- `https://your-ngrok-url.ngrok-free.dev` ← Frontend
- Otomatis terhubung ke backend API Anda ✅

## 🔍 Testing Checklist

```
Lokal Development
[ ] Backend jalan: http://127.0.0.1:8000
[ ] Ngrok backend aktif
[ ] Frontend jalan: http://localhost
[ ] .env.local sudah update
[ ] Data tampil di halaman home
[ ] Login works
[ ] Console (F12) tidak ada error

Sharing ke Teman
[ ] Share frontend ngrok domain
[ ] Teman bisa akses aplikasi
[ ] Database terbuka untuk teman
[ ] Tidak ada CORS error
```

## 📝 File yang Berubah

| File | Perubahan |
|------|-----------|
| `lib/data.ts` | Tambah `initializeApiUrl()` & getter functions |
| `components/api-initializer.tsx` | BARU: Component untuk init API URL |
| `app/layout.tsx` | Tambah `<ApiInitializer />` |
| `.env.local` | Template untuk NGROK config |
| `backend/routes/api.php` | Tambah endpoint `GET /api/config` |
| `backend/config/cors.php` | Sudah support ngrok domains |
| `backend/.env` | Sudah support ngrok SANCTUM domains |

## 🛠️ Troubleshooting

### 1. "Database Not Loading"
```
❌ Masalah: Data tidak muncul saat buka link ngrok
✅ Solusi:
   - Pastikan .env.local punya NEXT_PUBLIC_API_URL yang benar
   - Restart npm run dev
   - Buka F12 console, cari "API URL auto-detected:"
```

### 2. "CORS Error"
```
❌ Masalah: "Access to XMLHttpRequest blocked by CORS"
✅ Solusi:
   - Backend config/cors.php sudah support ngrok
   - Restart backend php artisan serve
   - Clear browser cache (Ctrl+Shift+Del)
```

### 3. "Login Tidak Bekerja"
```
❌ Masalah: Session/Cookie tidak ter-save
✅ Solusi:
   - Backend .env sudah punya SANCTUM_STATEFUL_DOMAINS=...ngrok-free.dev
   - Restart backend dan frontend
```

### 4. "API URL Masih Localhost"
```
❌ Masalah: Console menunjukkan "http://127.0.0.1:8000" (bukan ngrok)
✅ Solusi:
   - Cek .env.local apakah sudah punya NEXT_PUBLIC_API_URL
   - Jangan lupa Ctrl+Shift+R (hard refresh) di browser
   - Pastikan format URL benar (no /api at the end)
   - Restart npm run dev setelah update .env.local
```

### 5. "Ngrok Free Plan Warning"
```
⚠️  Warning: "Free Users: Agents ≤3.19.x stop connecting 2/17/26"
✅ Solusi:
   - Update ngrok: ngrok update
   - Atau upgrade ke paid plan untuk static domain
```

## 💡 Tips

### Melihat API URL yang Digunakan
```javascript
// Buka F12 > Console, ketik:
fetch('http://127.0.0.1:8000/api/config')
  .then(r => r.json())
  .then(d => console.log('Backend:', d.data.app_url))
```

### Monitor API Calls via Ngrok
Buka `http://127.0.0.1:4040` untuk melihat semua request/response.

### URL Ngrok Berubah Setiap Kali?
Ya, free plan memberikan URL baru setiap restart. Update `.env.local` lagi dengan URL baru.

## 🎯 Quick Commands

```powershell
# Development lokal (tanpa ngrok)
# Terminal 1
cd backend && php artisan serve

# Terminal 2
npm run dev
# Akses: http://localhost


# Development dengan ngrok (untuk share)
# Terminal 1
cd backend && php artisan serve

# Terminal 2
ngrok http 8000
# Copy URL

# Terminal 3 - Update .env.local
# NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.dev

# Terminal 4
npm run dev

# Terminal 5 (optional - untuk share frontend juga)
ngrok http 80
# Berikan URL ini ke teman
```

## 📞 Still Having Issues?

1. Check backend console untuk error
2. Check frontend console (F12) untuk error
3. Monitor ngrok web interface: `http://127.0.0.1:4040`
4. Cek `.env.local` format benar
5. Restart semua terminal dan browser

---

**Created**: 2026-01-05  
**Updated**: 2026-01-05  
**Auto-Detection System**: ✅ Active
