# 🚀 CONTEXT & HANDOVER FOR AI ASSISTANTS (CLI BOOTSTRAP)

เอกสารนี้สร้างขึ้นเพื่อให้ AI Assistant ทุกตัวที่ถูกเปิดใช้งานใหม่ผ่าน Antigravity / Gemini CLI สามารถเข้าใจภาพรวม สถาปัตยกรรม ความคืบหน้า และสิ่งที่ต้องทำต่อได้ทันที 100%

---

## 1. ข้อมูลสำคัญของระบบ (Production Endpoints & Credentials)
* **Frontend Web Game (Vercel)**: [https://drami.vercel.app](https://drami.vercel.app)
* **Backend Game Server (Render Singapore)**: [https://drami-zxd44.onrender.com](https://drami-zxd44.onrender.com)
* **GitHub Repository**: [https://github.com/ZXD44/Drami-ZXD44](https://github.com/ZXD44/Drami-ZXD44) (Branch: `main`)
* **Admin Login**:
  * **Username**: `ZirconX`
  * **Password**: `123456`
  * **Role**: `admin` (ระบบ Auto-Elevate สิทธิ์และใส่ตราดาวทอง `⭐ ZirconX ⭐` บนหัวตัวละครและแชท)

---

## 2. สิ่งแวดล้อมและ Environment Variables (`.env`)

### ฝั่ง Server (`server/.env` & Render Dashboard)
```env
DATABASE_URL="file:./prisma/dev.db"
PORT="2567"
CLIENT_ORIGIN="https://drami.vercel.app"
```
*(หมายเหตุ: บน Render ตั้งค่าผ่าน Environment Variables เรียบร้อย และใน `schema.prisma` ใช้ URL ชี้ตรงที่ `file:./prisma/dev.db`)*

### ฝั่ง Client (`client/.env` & Vercel Dashboard)
```env
VITE_SERVER_URL="https://drami-zxd44.onrender.com"
VITE_IMGBB_API_KEY="1aa357e65c7f52d080aa13859e6040ec"
```
*(หมายเหตุ: ใน `client/src/lib/game/config.ts` มีระบบ Fallback: ถ้าเปิดจาก localhost จะต่อ `http://localhost:2567`, ถ้าเปิดจากเว็บจริงจะชี้เข้า Render)*

---

## 3. งานที่ทำเสร็จสมบูรณ์แล้ว (Completed Milestones)

| วันที่ | รายการที่ทำเสร็จ | รายละเอียด |
| :--- | :--- | :--- |
| **03/11/2026** | **Deploy Client & Server** | Client ขึ้น Vercel (`drami.vercel.app`), Server ขึ้น Render Node.js Singapore เชื่อมต่อผ่าน HTTPS/WSS สำเร็จ |
| **03/11/2026** | **DramiShield & Security** | ดักจับ DevTools, ป้องกัน Speedhack/Teleport ด้วย Vector displacement check และทำ Chat Anti-Spam |
| **03/11/2026** | **Tiled World Map (Step 1-2)** | ย้าย `world.json` + tileset 32x32 และเคอร์เซอร์ RPG โบราณ `cursor-brown.cur` จาก `Drami-MMORPG` มาแสดงผล |
| **03/11/2026** | **Clean Assets & Sprites (Step 3)** | ลบโฟลเดอร์ LPC 1GB ทิ้ง และเปลี่ยนมาใช้ตัวละครคลาสสิก 32x32 (`player-sprite.png`, `other-player-sprite.png`) โหลดเร็วขึ้น 90% |
| **03/11/2026** | **Admin Integration** | ยศแอดมินดาวทอง `⭐ ZirconX ⭐`, ตัวอักษรสีทองเรืองแสงในแชท, และปุ่มเปิด Admin Dashboard สำหรับจัดการผู้เล่น |
| **03/11/2026** | **Mobile / iPad Virtual Joystick** | สร้าง [`VirtualJoystick.svelte`](file:///home/zirconx/Documents/Drami-Web-Game/client/src/lib/game/components/VirtualJoystick.svelte) สำหรับนิ้วโป้งซ้าย รองรับจอสัมผัส และอัปเกรดไอคอนเป็น Vector SVG |

---

## 4. แผนงานที่ AI ตัวถัดไปต้องทำต่อ (Next Tasks / Roadmap)

1. **Life Skills Interactive Gathering (ตัดไม้ / ขุดแร่ / ทำฟาร์ม ในแมพจริง)**:
   * ใน [`client/static/assets/map/world.json`](file:///home/zirconx/Documents/Drami-Web-Game/client/static/assets/map/world.json) มีเลเยอร์ Objects ที่มีตำแหน่งต้นไม้และก้อนหิน
   * ให้เขียนตรรกะใน `MainScene.ts` ให้คลิกที่ต้นไม้/แร่แล้วมีแถบ Progress Bar การเก็บเกี่ยว
   * ส่ง packet ไปยัง `GameRoom.ts` เพื่อสุ่มดรอปไอเทม `log_beech_item`, `log_maple_item`, `plants_items` เข้ากระเป๋า `Inventory`
2. **Interactive Minimap Radar**:
   * นำภาพ [`client/static/assets/map/minimap.jpg`](file:///home/zirconx/Documents/Drami-Web-Game/client/static/assets/map/minimap.jpg) มาเป็นพื้นหลังของ [`MiniMap.svelte`](file:///home/zirconx/Documents/Drami-Web-Game/client/src/lib/game/components/MiniMap.svelte) พร้อมจุดเรดาร์ผู้เล่น
3. **Database Migration to PostgreSQL (Optional)**:
   * เมื่อมีผู้เล่นจำนวนมาก สามารถย้ายจาก SQLite ไปใช้ Neon.tech หรือ Supabase ได้โดยเปลี่ยน provider ใน `schema.prisma`

---

## 5. กฎเหล็กในการพัฒนา (AI Invariants)
* ห้ามปน Render Pipeline: Phaser คุม Canvas/Sprite/Map ส่วน Svelte คุม HUD/Modals/UI
* อัปเดตโค้ดต้องคำนึงถึงขนาดไฟล์ ไม่เพิ่มไฟล์ขยะที่ไม่จำเป็นลง Git
* การสร้าง UI ใหม่ ต้องใช้สไตล์ไอคอน SVG จาก [`Icon.svelte`](file:///home/zirconx/Documents/Drami-Web-Game/client/src/lib/game/components/Icon.svelte) แทนการใช้อีโมจิทั่วไป
