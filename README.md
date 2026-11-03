# ⚔️ Drami Online

**Drami Online** เป็นโปรเจกต์เกม MMORPG สไตล์ Pixel Art บนเว็บเบราว์เซอร์ ขับเคลื่อนด้วย **Phaser 3** และ **SvelteKit (Svelte 5)** พร้อมระบบ Multiplayer ผ่าน **Colyseus WebSocket** และการปกป้องความปลอดภัยด้วย **DramiShield**

---

## 🌐 ลิงก์ระบบจริง (Live Production)
- **เข้าเล่นเกมได้ที่**: [https://drami.vercel.app](https://drami.vercel.app)
- **สถานะเซิร์ฟเวอร์ (API/WebSocket)**: [https://drami-zxd44.onrender.com](https://drami-zxd44.onrender.com)
- **GitHub Repository**: [https://github.com/ZXD44/Drami-ZXD44](https://github.com/ZXD44/Drami-ZXD44)

---

## 👤 เกี่ยวกับผู้สร้าง
- **ผู้พัฒนาหลัก:** ZirconX
- **GitHub:** [ZXD44](https://github.com/ZXD44)

---

## 🛡️ ระบบความปลอดภัยขั้นสูง (DramiShield Security)
1. **Server Authoritative Validation**:
   - ป้องกัน Speedhack / Teleportation ตรวจจับการกระโดดพิกัดที่ผิดปกติและดึงตัวกลับ (Snapback) ทันที
   - แชทถูกฟิลเตอร์ ป้องกันการยิงสแปม (Anti-Spam) และ Buffer Overload
2. **Client-Side Defense**:
   - ดักจับการเปิด DevTools และการคลิกขวาสำหรับผู้เล่นทั่วไป (Admin ยกเว้นอัตโนมัติ)
   - แจ้งเตือนข้อความความปลอดภัยและป้องกันการถูกขโมย Token

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5 Runes), [Phaser 3](https://phaser.io/), Tailwind CSS v4
- **Backend:** [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/), [Colyseus.js](https://colyseus.io/) (v0.16)
- **Database:** SQLite / PostgreSQL พร้อม [Prisma ORM](https://www.prisma.io/)
- **Infra:** Vercel (Client CDN) + Render.com (WebSocket Server Node Singapore)

---

## 📦 การรันโปรเจกต์ในเครื่อง (Development)

```bash
# รันทุกอย่างในคำสั่งเดียว:
./run_game.sh    # Linux / macOS
run_game.bat     # Windows
```

---

## 📚 เอกสารสถาปัตยกรรมและการพัฒนา
- [Technical Architecture & Security Model](docs/Technical_Architecture.md)
- [Agent Overview & Boundaries](.agent/PROJECT_OVERVIEW.md)
- [Agent Invariants & Rules](.agent/RULES.md)
- [Deployment Workflows](.workflow/deploy/README.md)

---
© 2026 Drami Online. Created by ZirconX.
