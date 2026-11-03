# 🎮 Drami Online — Heartwood-Style Frontend Redesign

ออกแบบใหม่ทั้งหมดสไตล์ **Heartwood Online** — Pixel Art Fantasy MMORPG UI

---

## 📸 ผลลัพธ์

### หน้า Login
![Login Page](C:/Users/ZirconX/.gemini/antigravity/brain/3993e1c2-ea7d-4079-bd01-41c5049b8f95/artifacts/login_screenshot.png)

- พื้นหลัง Pixel Art ป่าแฟนตาซี
- โลโก้ "Drami Online" ลอยขึ้นลงแบบ animated
- ปุ่ม **Login with Google** (สีขาว)
- ปุ่ม **Play as Guest** (สีทอง, pixel font)
- ปุ่ม **Login with Email** → เปิดฟอร์ม Login
- ปุ่ม **Discord** มุมซ้ายบน
- ปุ่ม **Account** มุมซ้ายล่าง
- Badge **v. BETA** มุมขวาล่าง
- Floating particles แบบ ambient

### หน้า Register
![Register Page](C:/Users/ZirconX/.gemini/antigravity/brain/3993e1c2-ea7d-4079-bd01-41c5049b8f95/artifacts/register_screenshot.png)

- ฟอร์ม **Create Account** สไตล์ fantasy
- ฟิลด์: Character Name, Email, Password, Confirm Password
- ปุ่ม **Begin Adventure** สีทอง
- Google signup
- ลิงก์กลับหน้า Login

### หน้า Game HUD
![Game Page](C:/Users/ZirconX/.gemini/antigravity/brain/3993e1c2-ea7d-4079-bd01-41c5049b8f95/artifacts/game_screenshot.png)

- **HUD ซ้ายบน**: Avatar + HP/MP/Stamina bars + ชื่อ/เลเวล
- **HUD ซ้ายบน (ล่าง)**: Gold/Silver display
- **HUD ขวาบน**: Minimap แสดงตำแหน่ง
- **HUD ล่างกลาง**: Action bar 10 slots (ปุ่ม 1-0)
- **HUD ซ้ายล่าง**: Chat system (Local/Guild/Party/System tabs)
- **HUD ขวา**: ปุ่มเมนูด้านข้าง (Inventory, Quests, Skills, Party, Settings)
- **Overlay panels**: Inventory grid, Quest log, Skills, Party

---

## 📁 ไฟล์ที่เปลี่ยนแปลง

| ไฟล์ | สถานะ |
|------|-------|
| `client/src/app.css` | 🔄 เขียนใหม่ทั้งหมด |
| `client/src/routes/+page.svelte` | 🔄 หน้า Login ใหม่ |
| `client/src/routes/register/+page.svelte` | ✨ สร้างใหม่ |
| `client/src/routes/game/+page.svelte` | ✨ สร้างใหม่ |
| `client/src/lib/game/Game.svelte` | 🔄 Fullscreen canvas |
| `client/static/login_bg.png` | ✨ Pixel art background |
| `client/static/game_logo.png` | ✨ Game logo |
| `client/static/game_world_bg.png` | ✨ World background |

---

## 🛠️ Routing

| Path | หน้า |
|------|------|
| `/` | Login / Landing page |
| `/register` | สมัครสมาชิก |
| `/game` | หน้าเล่นเกม + HUD |

> [!TIP]
> เปิดที่ **http://localhost:5173/** เพื่อดูผลลัพธ์

