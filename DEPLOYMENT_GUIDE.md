# 📝 Panduan Deployment API ke Vercel - NGABERS

## ✅ Status Deployment

### API Local
- ✅ **Status**: Berfungsi dengan baik
- 🌐 **URL**: http://localhost:5000
- 📡 **API Endpoint**: http://localhost:5000/api/movies/trending?page=1
- 💾 **Database**: Firestore (menggunakan Application Default Credentials)

### Deployment Vercel
- ✅ **Status**: Code berhasil di-push
- 🌐 **Production URL**: https://ngabers.vercel.app
- 📦 **Build**: Berhasil tanpa error
- ⚠️ **API Status**: Memerlukan konfigurasi environment variables

---

## 🔧 Langkah-langkah Memperbaiki API di Vercel

### 1️⃣ Dapatkan Firebase Service Account Key

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda (NGABERS)
3. Klik **⚙️ Settings** (ikon gear) → **Project Settings**
4. Pilih tab **Service Accounts**
5. Klik tombol **Generate New Private Key**
6. Konfirmasi dan download file JSON

**File JSON akan terlihat seperti ini:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 2️⃣ Tambahkan Environment Variable di Vercel

#### Cara A: Melalui Dashboard Vercel (RECOMMENDED)

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **ngabers**
3. Klik **Settings** → **Environment Variables**
4. Klik **Add New**
5. Isi form:
   - **Name**: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - **Value**: Paste **seluruh isi** file service account JSON (copy-paste semua text dari file JSON yang Anda download)
   - **Environments**: Centang **Production**, **Preview**, dan **Development**
6. Klik **Save**

#### Cara B: Melalui CLI (Alternatif)

```bash
# Di terminal, jalankan:
vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON

# Pilih environment: Production, Preview, Development (pilih semua)
# Paste seluruh isi file service account JSON
# Tekan Enter
```

### 3️⃣ Redeploy Project

Setelah menambahkan environment variable, Anda perlu redeploy:

**Opsi 1: Auto Redeploy (Mudah)**
- Vercel akan otomatis redeploy setelah Anda menambahkan environment variable
- Tunggu beberapa menit dan cek https://ngabers.vercel.app

**Opsi 2: Manual Redeploy**
```bash
vercel --prod
```

### 4️⃣ Verifikasi API Berfungsi

Setelah redeploy selesai, test API dengan membuka:

1. **Homepage**: https://ngabers.vercel.app
   - Seharusnya menampilkan daftar film
   
2. **API Endpoint**: https://ngabers.vercel.app/api/movies/trending?page=1
   - Seharusnya mengembalikan JSON dengan data film

---

## 📊 Perubahan yang Telah Dilakukan

### File yang Diupdate

#### 1. `server/firebase.ts`
- ✅ Ditambahkan support untuk environment variable `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- ✅ Tetap support local development dengan Application Default Credentials
- ✅ Error handling untuk parsing JSON

#### 2. `vercel.json`
- ✅ Konfigurasi rewrites untuk API routes
- ✅ Build command dan output directory

### Commit yang Dibuat
```
commit cd20064
Update Firebase config for Vercel deployment
```

---

## 🐛 Troubleshooting

### Error: 500 INTERNAL_SERVER_ERROR
**Penyebab**: Environment variable belum dikonfigurasi atau salah format

**Solusi**:
1. Pastikan environment variable `GOOGLE_APPLICATION_CREDENTIALS_JSON` sudah ditambahkan
2. Pastikan value-nya adalah **valid JSON** (seluruh isi file service account)
3. Pastikan tidak ada karakter tambahan atau spasi di awal/akhir
4. Redeploy setelah menambahkan variable

### Error: Invalid Service Account
**Penyebab**: File service account tidak valid atau expired

**Solusi**:
1. Generate ulang service account key dari Firebase Console
2. Update environment variable dengan key yang baru
3. Redeploy

### API Berfungsi di Local tapi Tidak di Vercel
**Penyebab**: Local menggunakan Application Default Credentials, Vercel memerlukan explicit credentials

**Solusi**:
1. Ikuti langkah 1-3 di atas untuk menambahkan environment variable
2. Pastikan service account memiliki permission yang cukup di Firebase

---

## 📝 Catatan Penting

1. **Jangan commit file service account ke Git**
   - File service account berisi credentials sensitif
   - Selalu gunakan environment variables
   - File `.gitignore` sudah dikonfigurasi untuk mengabaikan file credentials

2. **Environment Variables**
   - Pastikan environment variable ditambahkan untuk **Production**, **Preview**, dan **Development**
   - Setiap perubahan environment variable memerlukan redeploy

3. **Firebase Permissions**
   - Pastikan service account memiliki role **Firebase Admin SDK Administrator Service Agent**
   - Cek di Firebase Console → IAM & Admin

---

## 🎯 Next Steps

1. ✅ **Selesai**: API local sudah berfungsi
2. ✅ **Selesai**: Code sudah di-push ke Vercel
3. ⏳ **Pending**: Tambahkan environment variable di Vercel Dashboard
4. ⏳ **Pending**: Verifikasi API berfungsi di production

---

## 📞 Support

Jika masih ada masalah setelah mengikuti panduan ini:

1. Cek Vercel logs:
   ```bash
   vercel logs
   ```

2. Cek Firebase Console untuk memastikan service account aktif

3. Pastikan project Firebase Anda aktif dan tidak ada billing issues

---

**Deployment Date**: 2026-02-05
**Vercel Project**: ngabers
**Production URL**: https://ngabers.vercel.app
