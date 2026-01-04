# 🚀 QUICK START - Ngrok Setup

## 5 Menit Setup

### Step 1️⃣
```powershell
cd backend
php artisan serve
```

### Step 2️⃣
```powershell
ngrok http 8000
# Copy URL: https://xxx.ngrok-free.dev
```

### Step 3️⃣
Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=https://xxx.ngrok-free.dev
```

### Step 4️⃣
```powershell
npm run dev
```

### Step 5️⃣
Share link ke teman:
```powershell
ngrok http 80
# Berikan URL ini ke teman
```

---

## ✅ Verification

✔️ Buka `http://localhost` - ada data?  
✔️ F12 Console - ada error?  
✔️ Login bisa?  
✔️ Data muncul?  

**DONE!** 🎉

---

## 🆘 Emergency Checklist

| Masalah | Solusi |
|---------|--------|
| Data tidak muncul | Update `.env.local` + restart `npm run dev` |
| CORS error | Restart backend |
| Login fail | Clear cookies + restart |
| API URL masih localhost | Hard refresh (Ctrl+Shift+R) |
| Ngrok URL berubah | Update `.env.local` lagi |

---

Docs lengkap: `NGROK_COMPLETE_GUIDE.md`
