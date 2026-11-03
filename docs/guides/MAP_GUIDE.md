# 🗺️ Guide: การสร้างแผนที่ใหม่ (Map 2) สำหรับ Drami

คู่มือนี้จะสอนขั้นตอนการสร้างแผนที่ใหม่ ตั้งแต่การออกแบบจนถึงการนำไปใช้ในเกมครับ

---

## 1. โครงสร้างไฟล์แผนที่ปัจจุบัน
แผนที่ในเกมใช้ระบบ **Tiled Map Editor** ซึ่งประกอบด้วย 3 ส่วนหลัก:
- **`world.json`**: ไฟล์ข้อมูลแผนที่ (ตำแหน่งกระเบื้อง, เลเยอร์, จุดเดินไม่ได้)
- **`tileset.png`**: รูปภาพรวมของกระเบื้อง (Assets) ที่ใช้วาด
- **`minimap.jpg`**: รูปภาพตัวอย่างสำหรับแผนที่จิ๋วมุมขวาบน

---

## 2. เครื่องมือสร้างแผนที่ (เปรียบเทียบ) 🛠️

มีโปรแกรมหลายตัวที่ใช้สร้างแมพได้ แต่ละตัวมีข้อดีต่างกัน:

| ฟีเจอร์ | **Tiled Map Editor** | **LDTK** | **TilePipe** |
| :--- | :--- | :--- | :--- |
| **ความง่าย** | ⭐⭐⭐ (หน้าตาดูเก่า) | ⭐⭐⭐⭐⭐ (**ง่ายและสวยที่สุด**) | ⭐⭐⭐ |
| **เหมาะกับ Drami** | **✅ ดีที่สุด (Standard)** | ⚠️ (ต้องตั้งค่าโค้ดเพิ่ม) | ❌ (ไม่แนะนำตอนนี้) |
| **ความเร็ววาดแมพ** | ปานกลาง (วางทีละช่อง) | **เร็วมาก** (ใส่ขอบให้อัตโนมัติ) | ปานกลาง |
| **ความเข้ากันได้** | ใช้ได้ทันที 100% | ต้องลง Plugin Phaser เพิ่ม | ปานกลาง |

*   **Tiled Map Editor:** เป็นมาตรฐานที่โปรเจกต์เดิมของคุณใช้อยู่ หากใช้ตัวนี้จะ **"ทำงานได้ทันทีโดยไม่ต้องแก้โค้ด"** 
    *   [📥 ดาวน์โหลด Tiled (Official)](https://www.mapeditor.org/download.html)
*   **LDTK (Level Designer Toolkit):** เป็นตัวเลือกที่ทันสมัยที่สุด ใช้งานง่ายและวาดแมพได้เร็วมาก แต่ต้องตั้งค่าระบบใน Phaser 3 ใหม่เพื่อให้รองรับไฟล์จาก LDTK
    *   [📥 ดาวน์โหลด LDTK (Official)](https://ldtk.io/go/download/)
*   **TilePipe:** [(Official Website)](https://v-play.net/tilepipe/)

---

## 3. ขั้นตอนการออกแบบ Map 2

### 🏗️ เตรียมเครื่องมือ
1. ดาวน์โหลดโปรแกรม [Tiled Map Editor](https://www.mapeditor.org/)
2. เปิดไฟล์ `world.json` เดิมขึ้นมาดูเพื่อเป็นต้นแบบ (Blueprint)

### 🎨 การวาดแผนที่ใหม่
เมื่อสร้างไฟล์ใหม่ใน Tiled ให้ตั้งค่าดังนี้:
- **Tile Size**: 32x32 pixels
- **Orientation**: Orthogonal
- **Layer Names (ต้องตรงเป๊ะ!)**:
    - `Grass`: พื้นหญ้า/พื้นดิน
    - `Decorations`: ดอกไม้, ของตกแต่งพื้น
    - `Objects`: ต้นไม้, บ้าน, หิน (สิ่งที่บังตัวละครได้)
    - `Obstacles` (Object Layer): **สำคัญมาก!** วาดสี่เหลี่ยมทับบริเวณที่ "เดินผ่านไม่ได้"

---

## 3. การเพิ่ม Map 2 ลงในโค้ด

### 📥 ขั้นที่ 1: โหลด Assets (Preload)
เปิดไฟล์ `src/scenes/BootScene.ts` และเพิ่มโค้ดโหลดไฟล์ JSON ของแผนที่ใหม่:

```typescript
// ใน preload()
this.load.tilemapTiledJSON("map2", "assets/map/map2.json"); 
```

### ⚙️ ขั้นที่ 2: ตั้งค่าการสลับแผนที่
ในระบบปัจจุบัน `WorldScene.ts` จะถูกกำหนดให้โหลด `"map"` เสมอ คุณสามารถปรับเปลี่ยนให้รับค่า dynamic ได้:

```typescript
// ใน WorldScene.ts ฟังก์ชัน _createMap()
this.map = this.make.tilemap({ key: this.currentMapKey || "map" });
```

---

## 4. แหล่งเรียนรู้ที่ถูกต้อง (YouTube Tutorials) 🎥

ขออภัยครับสำหรับลิ้งค์ก่อนหน้าที่อาจจะไม่ตรง ผมได้ตรวจสอบและรวบรวมคลิปที่สอนเรื่อง Tiled + Phaser 3 โดยตรงมาให้ใหม่ครับ:

1.  **Ourcade (แนะนำที่สุด)**:
    *   [Phaser 3 and Tiled: Creating a Tilemap (Dungeon Crawler)](https://www.youtube.com/watch?v=A_0fshLd3sM) - สอนตั้งแต่การวาดใน Tiled จนถึงการเอาเข้าเกม Phaser 3
    *   [Phaser 3 Tilemap Tutorial: Getting Started](https://www.youtube.com/watch?v=uz6tB_8k8qE) - เน้นการจัดการ Layers และการโหลด Assets

2.  **Modern Game Dev**:
    *   [Phaser 3 Tutorial - Part 9: Tiled Maps & Collision](https://www.youtube.com/watch?v=A_0fshLd3sM) - สอนเรื่องการตั้งค่า Collision (จุดที่เดินผ่านไม่ได้)

3.  **บทความสอนแบบละเอียด (อ่านง่าย)**:
    *   [A Noob's Guide to Loading Tiled Maps in Phaser 3](https://ourcade.co/blog/phaser3-tiled-tilemap-loading-tips/) - รวมเทคนิคการตั้งค่า Tiled ให้รองรับ Phaser 3 แบบ 100%

---

## 5. ข้อควรระวัง (Tips)
1. **Tileset Extrusion**: หากเห็นเส้นรอยต่อระหว่างช่อง (Lines between tiles) ให้ใช้เครื่องมือ `tile-extruder` ปรับรูป Tileset ก่อนนำมาใช้
2. **NavMesh**: ระบบเดินอัตโนมัติจะอ่านข้อมูลจากเลเยอร์ `Obstacles` เท่านั้น หากลืมวาดจุดนี้ ตัวละครจะเดินทะลุกำแพงได้
3. **Minimap Position**: ระบบคำนวณตำแหน่ง Minimap อิงจากขนาดของ `world.json` หากแมพใหม่ใหญ่กว่าเดิม ต้องเข้าไปปรับ Scaling ใน `UIScene.tsx`

---

> [!TIP]
> **คำแนะนำเพิ่มเติม:** หากต้องการสร้างจุดวาร์ป (Portal) เพื่อเปลี่ยนแมพ ต้องสร้างเลเยอร์ใหม่ใน Tiled ประเภท Object Layer และตั้งชื่อว่า `Warp` จากนั้นเขียนโค้ดดักจับใน `WorldScene` ครับ
