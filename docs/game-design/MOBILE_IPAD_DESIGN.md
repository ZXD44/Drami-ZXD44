# 📱 คู่มือการออกแบบและรองรับอุปกรณ์ Mobile, iPad & Responsive UX

## 1. ปรัชญาการออกแบบ (Design Philosophy)
Drami Online ออกแบบเพื่อรองรับการเล่นแบบ **Mobile Landscape (แนวนอน)** และ **iPad/Tablet** ให้ได้รับประสบการณ์เช่นเดียวกับบน Desktop PC โดยไม่ต้องโหลดแอปพลิเคชันเพิ่ม (เล่นผ่าน Mobile Web / Safari / Chrome)

---

## 2. ระบบการควบคุมเสมือน (Virtual Controls)
- **Virtual Joystick (นิ้วโป้งซ้าย)**:
  - Component: [`VirtualJoystick.svelte`](file:///home/zirconx/Documents/Drami-Web-Game/client/src/lib/game/components/VirtualJoystick.svelte)
  - ซ่อนอัตโนมัติบนคอมพิวเตอร์ และแสดงขึ้นมาเมื่อสัมผัสหน้าจอ Mobile / iPad
  - ส่ง Custom Event `drami-virtual-move` เข้าสู่ `InputManager.ts` โดยตรง
  - มีรัศมี 45px สัมผัสนุ่มนวล ควบคุมได้ 360 องศา
- **Action Hotbar & Buttons (นิ้วโป้งขวา)**:
  - ช่องสกิล 1-4, กระเป๋า, และอิโมจิถูกจัดวางมุมขวาล่างในระยะเอื้อมของนิ้วโป้งขวา
  - Touch Target มีขนาดขั้นต่ำ 44x44px เพื่อให้กดติดง่าย ไม่กดพลาด

---

## 3. การแสดงผล & Responsive Safe Zones
```text
+-------------------------------------------------------------+
| [Player HUD / หลอดเลือด]               [MiniMap / ปิดเสียง] |
| (มุมซ้ายบน)                                     (มุมขวาบน) |
|                                                             |
|                                                             |
|                       (สนามรบ / เกม)                        |
|                                                             |
|                                                             |
| [🕹️ Virtual Joystick]                [⚔️ Hotbar / สกิล]     |
| (นิ้วโป้งซ้าย)                           (นิ้วโป้งขวา)      |
+-------------------------------------------------------------+
```
- **iPad Viewport**: ใช้อัตราส่วน 4:3 และ 3:2 กล้องของ Phaser จะขยายขอบเขตอัตโนมัติ (`Phaser.Scale.RESIZE`)
- **Mobile Notch Safe-Area**: เว้นระยะขอบ (Padding) ซ้าย-ขวาอย่างน้อย 16-24px ป้องกันรอยบากกล้องหน้า

---

## 4. แผงควบคุมระบบ (Panels)
- หน้าต่าง `Inventory`, `Skills`, `Quests`, `Chat`:
  - บนมือถือจะขยายเป็น Overlay กึ่งกลางจอ พร้อมปุ่มปิด ✕ ขนาดใหญ่
  - รองรับการ Scroll ด้วยนิ้วสัมผัส และบล็อกไม่ให้เกิดการเลื่อนพื้นหลังของเบราว์เซอร์ (`overscroll-behavior: contain`)
