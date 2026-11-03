# 🗺️ คู่มือการออกแบบด่านด้วย Tiled (สำหรับมือใหม่)

**Tiled** เป็นโปรแกรมฟรียอดนิยมที่นักพัฒนาเกมใช้สำหรับสร้างฉากและแผนที่ (Tilemap) ในรูปแบบตาราง 2 มิติ ซึ่งนำมาใช้ร่วมกับ Phaser ได้อย่างสมบูรณ์แบบ!

---

## 🛠️ ขั้นตอนที่ 1: ติดตั้งโปรแกรม Tiled
1. เข้าไปที่เว็บ [mapeditor.org](https://www.mapeditor.org/)
2. กดปุ่ม **Download** ซ้ายมือ (สามารถโดเนทหรือกด "No thanks, just take me to the downloads" เพื่อโหลดฟรี)
3. ติดตั้งโปรแกรมให้เรียบร้อยแล้วเปิดขึ้นมา

---

## 🎨 ขั้นตอนที่ 2: เตรียมภาพ Tileset
ก่อนที่เราจะสร้างฉากได้ เราต้องมีรูปภาพ "กระเบื้อง" (Tileset) เพื่อเอามาต่อกันเป็นฉาก
- คุณต้องใช้ภาพแบบตาราง เช่น ภาพแพ็คกระเบื้องขนาด 16x16, 32x32 หรือ 64x64 พิกเซล
- นำไฟล์ภาพ (เช่น `tileset.png`) ไปเก็บไว้ในโฟลเดอร์ของโปรเจกต์ (เช่น `client/static/tileset.png`)

---

## 🏗️ ขั้นตอนที่ 3: สร้างแผนที่ (Map)
1. เปิด Tiled ขึ้นมา กด **New Map...** (สร้างแผนที่ใหม่)
2. ตั้งค่าพื้นฐาน:
   - **Orientation:** เลือก `Orthogonal` (มุมมองตารางปกติ)
   - **Tile format:** เลือก `CSV`
   - **Map size:** กำหนดขนาดฉาก กว้าง/ยาว (เช่น Width 50, Height 50)
   - **Tile size:** กำหนดขนาดของตารางให้ตรงกับภาพ Tileset ของคุณ (เช่น 32x32 พิกเซล)
3. กด **Save As** แล้วตั้งชื่อไฟล์ เช่น `map.tmx`

---

## 🧩 ขั้นตอนที่ 4: ใส่ภาพ Tileset เข้ามาใน Tiled
1. มองหาพาเนล **Tilesets** ด้านล่างขวา
2. กดปุ่มไอคอน **New Tileset** (รูปแผ่นกระดาษที่มีรูปดาว)
3. หน้าต่างใหม่จะเด้งขึ้นมา:
   - **Name:** ตั้งชื่อ Tileset (สำคัญ! จำชื่อนี้ไว้ใช้ในโค้ด)
   - **Type:** เลือก `Based on Tileset Image`
   - **Image:** กดปุ่ม `Browse...` แล้วเลือกไฟล์รูปภาพ `tileset.png` ของเรามาใส่
4. กด **OK** ตอนนี้คุณจะมีบล็อคต่างๆ ให้เลือกวาดแล้ว!

---

## 🖌️ ขั้นตอนที่ 5: เริ่มวาดแผนที่ด้วย Layer
ในเกม RPG ควรแบ่งแผนที่เป็นชั้นๆ (Layer) เพื่อให้มีมิติ ทับซ้อน และเดินชนได้

1. มองหาพาเนล **Layers** (มุมบนขวา)
2. ค่าเริ่มต้นจะมี `Tile Layer 1` ให้ดับเบิ้ลคลิกเปลี่ยนชื่อเป็น `Background` (พื้น) สำหรับวาดพื้นหญ้า ดิน หรือน้ำ
3. กดปุ่ม `+` เพิ่ม Layer ใหม่ (พยายามเลือก **Tile Layer**)
4. ตั้งชื่อ Layer ใหม่ว่า `Obstacles` (สิ่งกีดขวาง) หรือ `Decorations`
5. ตอนวาด: 
   - ให้เลือก Layer ที่ต้องการในพาเนล Layers
   - เลือกกระเบื้องในพาเนล Tileset
   - ลากเมาส์คลิกซ้ายวาดบนฉาก (กดไอคอน **Stamp Brush** บนแท็บเครื่องมือ)
6. บล็อกที่เป็นสิ่งกีดขวาง (เช่น รั้ว, ท่อนไม้, ต้นไม้) ให้วาดในชั้น `Obstacles`

---

## 📦 ขั้นตอนที่ 6: Export (ส่งออก) ไปหา Phaser
เมื่อวาดฉากเสร็จแล้ว เราต้องพิมพ์ไฟล์นี้ไปใช้ใน Svelte/Phaser
1. ไปที่เมนู **File > Export As...**
2. เลือกนามสกุลไฟล์เป็น **JSON map files (*.json)**
3. ตั้งชื่อว่า `map.json` แล้วเซฟไปไว้ที่โฟลเดอร์รูปภาพของโปรเจกต์ (เช่น `client/static/map.json`)

---

## 💻 ขั้นตอนที่ 7: การเขียนโค้ด Phaser โหลดแผนที่ Tiled
แก้ไขไฟล์ `Game.svelte` ของคุณในเมธอด `preload()` และ `create()`

```javascript
preload() {
    // โหลดไฟล์รูปภาพตัวละคร (เดิม)
    this.load.image("character", "/character.png");

    // 1. โหลดไฟล์ภาพ Tileset ที่เราเอาเข้า Tiled
    this.load.image("tiles", "/tileset.png");
    
    // 2. โหลดไฟล์ JSON แผนที่ ที่เรา Export ออกมา
    this.load.tilemapTiledJSON("map", "/map.json");
}

async create() {
    // 3. สร้าง Map จากไฟล์ JSON ที่โหลดมา
    const map = this.make.tilemap({ key: "map" });

    // 4. เชื่อมโยงชื่อ Tileset จาก Tiled เข้ากับภาพที่เราเตรียมไว้
    // (พารามิเตอร์แรก = ชื่อ Tileset ที่ตั้งใน Tiled, พารามิเตอร์สอง = key จาก this.load.image)
    const tileset = map.addTilesetImage("ชื่อTilesetในTiled", "tiles");

    // 5. สร้าง Layer ตามที่ตั้งชื่อไว้ใน Tiled และวาดลงฉากเกม (0, 0)
    const bgLayer = map.createLayer("Background", tileset, 0, 0);
    const obsLayer = map.createLayer("Obstacles", tileset, 0, 0);

    // 6. กำหนดขอบเขตกล้องและฟิสิกส์ให้พอดีกับแผนที่
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // ...หลังจากนี้วาด Player เหมือนเดิม...
}
```

### 💡 ตัวดักชน (Collisions) - ขั้นตอนถัดไป
หากคุณมี Layer อย่าง `Obstacles` และต้องการให้ตัวละครเดินทะลุไม่ได้ คุณสามารถเพิ่มโค้ดในบรรทัดหลังจากสร้าง Layer เสร็จ:

```javascript
// สั่งให้กระเบื้องทุกแผ่นใน Obstacles กลายเป็นสิ่งกีดขวาง
obsLayer.setCollisionByExclusion([-1]);

// สั่งให้ตัวละครของเรา ชนกับ Obstacles ได้
this.physics.add.collider(this.player, obsLayer);
```

แค่นี้แผนที่ก็จะมาพร้อมระบบการเดินชนอย่างสมบูรณ์! ลองใช้เวลาทำความคุ้นเคยกับการวาดใน Tiled ดูนะครับ มันเป็นเครื่องมือที่สนุกและช่วยร่นเวลาทำเกมลงได้มากๆ 🎮
