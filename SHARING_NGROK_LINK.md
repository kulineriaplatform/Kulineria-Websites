# Cara Share Link Ngrok agar Database Terdeteksi

Masalah: Ketika link ngrok frontend di-share ke orang lain, database tidak terdeteksi karena URL backend ngrok tidak diketahui.

**Solusi**: Sistem sekarang menggunakan auto-detection API URL + environment variable.

## 📋 Cara Kerja

Aplikasi frontend akan mencari API URL dalam urutan berikut:

1. **Via Environment Variable** (Prioritas tertinggi): `NEXT_PUBLIC_API_URL` dari `.env.local`
2. **Auto-detect dari Backend**: Fetch ke `http://127.0.0.1:8000/api/config`
3. **Fallback Default**: `http://127.0.0.1:8000`

## 🚀 Cara Sharing Link

### **Opsi 1: Menggunakan Environment Variable (Rekomendasi)**

**Langkah 1**: Jalankan backend dengan ngrok
```powershell
cd backend
php artisan serve

# Terminal baru
ngrok http 8000
```

Catat URL ngrok, contoh: `https://abc123xyz789.ngrok-free.dev`

**Langkah 2**: Update `.env.local` di frontend
```dotenv
NEXT_PUBLIC_API_URL=https://abc123xyz789.ngrok-free.dev
```

**Langkah 3**: Jalankan frontend
```powershell
npm run dev
```

**Langkah 4**: Share link ke teman
- URL Frontend: `https://contrapuntal-mallie-unheritable.ngrok-free.dev`
- ✅ Database akan terdeteksi karena sudah set di `.env.local`

### **Opsi 2: Menggunakan Auto-detect (Jika Backend di Localhost)**

Jika backend tetap di `localhost:8000` dan hanya frontend yang di-share via ngrok:

```powershell
# Backend tetap berjalan di localhost:8000
cd backend
php artisan serve

# Frontend berjalan di localhost:80 + ngrok
npm run dev

# Terminal baru
ngrok http 80
```

Sekarang orang lain bisa akses via link ngrok, dan aplikasi akan auto-detect backend di `localhost:8000`.

**Catatan**: Ini hanya bekerja jika backend terbuka untuk akses dari internet (misal sudah public).

## 📝 File yang Diubah

1. **`lib/data.ts`**: 
   - Menambahkan `initializeApiUrl()` function
   - Support dynamic API URL changes

2. **`components/api-initializer.tsx`**: 
   - Client component yang menjalankan `initializeApiUrl()` saat app load

3. **`app/layout.tsx`**: 
   - Menambahkan `<ApiInitializer />` untuk inisialisasi API URL

4. **`backend/routes/api.php`**: 
   - Menambahkan endpoint `/api/config` untuk return config aplikasi

5. **`backend/config/cors.php`**: 
   - Sudah support ngrok domains

## ✅ Testing Checklist

- [ ] Jalankan backend: `php artisan serve`
- [ ] Jalankan ngrok backend: `ngrok http 8000`
- [ ] Update `.env.local` dengan URL ngrok
- [ ] Jalankan frontend: `npm run dev`
- [ ] Cek browser console (F12) untuk melihat API URL yang digunakan
- [ ] Test API calls (login, fetch data, dll)
- [ ] Share link frontend ke teman
- [ ] Pastikan database terdeteksi di browser teman

## 🔍 Debug

Untuk melihat API URL yang sedang digunakan:

```javascript
// Buka F12 > Console
// Cari log "API URL auto-detected:" atau tanyakan API URL saat ini
fetch('http://127.0.0.1:8000/api/config')
  .then(r => r.json())
  .then(d => console.log('Backend URL:', d.data.app_url))
```

## 🎯 Best Practice

1. **Selalu gunakan `.env.local`** saat sharing link ngrok
2. **Jangan hardcode URL** di kode - gunakan environment variable
3. **Test API calls** sebelum share link ke orang lain
4. **Gunakan curl/Postman** untuk test backend API secara direct

---

Created: 2026-01-05
