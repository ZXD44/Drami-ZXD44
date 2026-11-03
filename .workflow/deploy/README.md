# Drami Online - Client Deployment Guide (Vercel & Cloudflare Pages)

## ภาพรวมโครงสร้าง Deployment

- **Client Directory**: `./client`
- **Framework**: SvelteKit 2 + Vite 7
- **Output Target**:
  - Vercel: รองรับผ่าน `@sveltejs/adapter-auto` ทันที
  - Cloudflare Pages: สามารถใช้ Git Integration หรือ GitHub Actions ผ่าน Wrangler

---

## ตัวเลือกที่ 1: Deploy บน Vercel (แนะนำ - ง่ายและเร็วที่สุด)

### วิธี A: เชื่อมต่อผ่าน Git Dashboard (ไม่ต้องเขียน CI/CD เอง)
1. นำโค้ดขึ้น GitHub Repository
2. เข้าไปที่ [Vercel Dashboard](https://vercel.com/new) -> กด **Import** โปรเจกต์
3. ตั้งค่า Root Directory:
   - **Root Directory**: `client`
4. ตั้งค่า Environment Variables ใน Vercel:
   - `VITE_SERVER_URL`: URL เซิร์ฟเวอร์ Colyseus ของคุณ (เช่น `https://drami-server.onrender.com` หรือ `wss://...`)
   - `VITE_IMGBB_API_KEY`: API Key สำหรับอัปโหลดรูปภาพ
5. กด **Deploy**

### วิธี B: ใช้งานผ่าน GitHub Actions
ใช้ไฟล์ [`.workflow/deploy/deploy-client-vercel.yml`](file:///home/zirconx/Documents/Drami-Web-Game/.workflow/deploy/deploy-client-vercel.yml):
1. คัดลอกไปไว้ที่ `.github/workflows/deploy-client-vercel.yml`
2. กำหนด GitHub Repository Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `VITE_SERVER_URL`
   - `VITE_IMGBB_API_KEY`

---

## ตัวเลือกที่ 2: Deploy บน Cloudflare Pages (แบนด์วิดท์ฟรีไม่จำกัด)

### วิธี A: เชื่อมต่อผ่าน Cloudflare Dashboard
1. เข้าไปที่ [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**
2. เลือก Repo แล้วตั้งค่า Build Configuration:
   - **Framework Preset**: `SvelteKit`
   - **Root directory**: `client`
   - **Build command**: `npm run build`
   - **Build output directory**: `.svelte-kit/cloudflare` หรือสลับ adapter เป็น `@sveltejs/adapter-cloudflare` หากต้องการ Edge functions เต็มรูปแบบ
3. เพิ่ม Environment Variables (`VITE_SERVER_URL`, `VITE_IMGBB_API_KEY`)
4. กด **Save and Deploy**

### วิธี B: ใช้งานผ่าน GitHub Actions
ใช้ไฟล์ [`.workflow/deploy/deploy-client-cloudflare.yml`](file:///home/zirconx/Documents/Drami-Web-Game/.workflow/deploy/deploy-client-cloudflare.yml):
1. คัดลอกไปไว้ที่ `.github/workflows/deploy-client-cloudflare.yml`
2. กำหนด GitHub Repository Secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `VITE_SERVER_URL`
   - `VITE_IMGBB_API_KEY`
