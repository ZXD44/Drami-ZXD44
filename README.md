# ⚔️ Drami Online

**Drami Online** เป็นโปรเจกต์เกม MMORPG บนเว็บเบราวเซอร์ที่เน้นความสวยงามของสไตล์พิกเซลอาร์ต (Pixel Art) และระบบการเล่นที่ลื่นไหล ขับเคลื่อนด้วย **Phaser 3** และ **SvelteKit** รองรับการเล่นข้ามแพลตฟอร์มทั้ง PC และ Mobile Landscape

---

## 👤 เกี่ยวกับผู้สร้าง
- **ผู้พัฒนาหลัก:** ZirconX
- **GitHub:** [ZXD44](https://github.com/ZXD44)

---

## 🚀 ฟีเจอร์หลัก (Features)
- **กราฟิก & แอนิเมชัน:** Phaser 3 + LPC Spritesheets 4 ทิศทาง (เดิน, โจมตี, ท่าทาง)
- **หน้าจอผู้ใช้งาน (HUD Overlays):**
  - **Hotbar & Bag:** 4 ช่องสกิล คีย์ลัด และระบบจัดการช่องเก็บของ (Inventory)
  - **Minimap:** เรดาร์ย่อระบุพิกัดผู้เล่นแบบเรียลไทม์
  - **Chat System:** ช่องแชทแยกแท็บ (ทั้งหมด, ท้องถิ่น, กิลด์, ปาร์ตี้)
  - **Admin Dashboard:** ระบบจัดการผู้เล่น (แบน, แก้ไขยศ, เสกไอเทม)
- **ระบบเครือข่าย & ความปลอดภัย:** Real-time WebSocket ผ่าน Colyseus Server พร้อม DramiShield ป้องกันการแก้ไข DOM/UI ผ่าน DevTools

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5 Runes), [Phaser 3](https://phaser.io/), Tailwind CSS v4
- **Backend:** [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/), [Colyseus.js](https://colyseus.io/) (v0.16)
- **Database:** SQLite (Local Dev) / PostgreSQL (Production) with [Prisma ORM](https://www.prisma.io/)
- **Protocol:** HTTP REST + WebSockets (`ws://` / `wss://`)

---

## 📦 การติดตั้งและรันโปรเจกต์ (Development)

### วิธีเริ่มระบบทันที (All-in-One Script)
```bash
# บน Linux / macOS:
chmod +x run_game.sh
./run_game.sh

# บน Windows:
run_game.bat
```

### การรันแยกทีละฝั่ง
```bash
# 1. รัน Server (พอร์ต 2567)
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev

# 2. รัน Client (พอร์ต 5173)
cd client
npm install
npm run dev
```

---

## 🌐 การ Deploy ขึ้นเว็บจริง (Production Deployment)

ดูคู่มือและสคริปต์การ Deploy ที่จัดเตรียมไว้ใน [`.workflow/deploy/README.md`](file:///home/zirconx/Documents/Drami-Web-Game/.workflow/deploy/README.md):
- **Client (Frontend)**: รองรับการขึ้น **Vercel** หรือ **Cloudflare Pages** (ฟรี 100% เร็ว ลื่น) ผ่าน GitHub Actions
- **Server (Backend)**: รองรับการขึ้น **Render.com** หรือ **Koyeb** เชื่อมต่อฐานข้อมูล PostgreSQL ฟรีจาก Neon.tech

---

## 🤖 สำหรับ AI Assistant & Developers
- สถาปัตยกรรมและโครงสร้างโปรเจกต์: [`.agent/PROJECT_OVERVIEW.md`](file:///home/zirconx/Documents/Drami-Web-Game/.agent/PROJECT_OVERVIEW.md)
- กฎเกณฑ์และมาตรฐานการพัฒนา (Coding Invariants): [`.agent/RULES.md`](file:///home/zirconx/Documents/Drami-Web-Game/.agent/RULES.md)

---
© 2026 Drami Online. Created by ZirconX.
