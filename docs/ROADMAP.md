# 🗺️ Drami Online - Future Development Roadmap

This document outlines the strategic technical goals and implementation blueprints for the next phases of development.

---

## 🚨 0. Immediate Priority Actions (Recommended First)
These tasks address critical security gaps and structural technical debt identified during initial analysis.

### 🔐 0.1 Secure Room Joining (JWT Validation)
**Problem:** Currently, anyone can join a room as any user by simply providing a `userId`.
**Fix:**
- **Server:** Implement `onAuth` in `GameRoom.ts` to verify the JWT token provided by the client.
- **Client:** Send the stored `drami_token` during the `room.join()` process.
- **Result:** Only authenticated users can access their own characters.

### 🧹 0.2 ESM Refactoring & Dependency Cleanup
**Problem:** The project uses a mix of CommonJS (`require`) and ES Modules, leading to potential circular dependencies and "Lazy Import" hacks.
**Fix:**
- Convert all `require()` calls to top-level `import` statements.
- Resolve the circular dependency between `GameRoom.ts` and `index.ts` by moving shared state (like `tempBans`) to a dedicated `server/store/` directory.

### 🛠️ 0.3 Admin Tool Integration
**Problem:** Scripts like `แต่งยศแอดมิน.js` are external and manual.
**Fix:**
- Move the logic for granting admin roles into the `server/routes/admin.routes.ts`.
- Expose this functionality through a secure endpoint that only existing admins can call, or create a first-time "Super Admin" setup script.

---

## 🛡️ 1. Anti-Cheat: Server-Side Speed Hack Detection
Current movement is client-authoritative. We need to implement a "Sanity Check" on the server to prevent teleporting or speed hacks.

### ⚙️ Logic (Server-side in `GameRoom.ts`)
1. **Store Timestamp:** For every player, store the `lastUpdateTime`.
2. **Calculate Distance:** When a `move` message arrives:
    - Distance = `Math.sqrt((newX - oldX)**2 + (newY - oldY)**2)`
    - Time Delta = `CurrentTime - lastUpdateTime`
3. **Validation:** 
    - `MaxAllowedDistance = (BaseSpeed + Buffer) * TimeDelta`
    - If `Distance > MaxAllowedDistance`, the movement is rejected or the player is snapped back.

### 🛠️ Proposed Implementation snippet:
```typescript
// In GameRoom.ts
onMessage("move", (client, data) => {
    const player = this.state.players.get(client.sessionId);
    const now = Date.now();
    const dt = (now - player.lastMoveTime) / 1000; // seconds

    const dist = Math.sqrt(Math.pow(data.x - player.x, 2) + Math.pow(data.y - player.y, 2));
    const maxDist = (GameConstants.PLAYER_SPEED + 50) * dt; // 50 is buffer for latency

    if (dist > maxDist && dt > 0) {
        // Teleport detected! Send back to old position
        client.send("position_correction", { x: player.x, y: player.y });
    } else {
        player.x = data.x;
        player.y = data.y;
        player.lastMoveTime = now;
    }
});
```

---

## 📜 2. Database Schema: Quest System
To support progression, we need a flexible quest system integrated with Prisma.

### 🗄️ Proposed Schema (`schema.prisma`)
```prisma
model Quest {
  id          String   @id @default(uuid())
  title       String
  description String
  minLevel    Int      @default(1)
  rewardGold  Int      @default(0)
  rewardExp   Int      @default(0)
  
  tasks       QuestTask[]
  userQuests  UserQuest[]
}

model QuestTask {
  id        String @id @default(uuid())
  questId   String
  type      String // "KILL", "COLLECT", "TALK"
  targetId  String // ID of Monster or Item
  required  Int    @default(1)
  
  quest     Quest  @relation(fields: [questId], references: [id])
}

model UserQuest {
  userId    String
  questId   String
  status    String // "START", "PROGRESS", "COMPLETED"
  progress  String // JSON string: {"task_id_1": 5, "task_id_2": 1}
  
  user      User   @relation(fields: [userId], references: [id])
  quest     Quest  @relation(fields: [questId], references: [id])
  @@id([userId, questId])
}
```

---

## 🎭 3. Technical Breakdown: 4-Directional Animations in Phaser
The characters use **LPC (Liberated Pixel Cup)** spritesheets. Understanding how they are sliced and animated is key to adding new actions.

### 📐 Spritesheet Layout
- **Row 0:** Up
- **Row 1:** Left
- **Row 2:** Down
- **Row 3:** Right

### 🛠️ How it works in `MainScene.ts`:
1. **Loading:** Each animation (walk, slash, etc.) is a separate PNG.
2. **Creation:** We loop through the 4 rows to create 4 distinct animation keys.
   ```typescript
   // Example: Creating Walk Animation
   for (let rowIdx = 0; rowIdx < 4; rowIdx++) {
       const dir = ["up", "left", "down", "right"][rowIdx];
       this.anims.create({
           key: `player-walk-${dir}`,
           frames: this.anims.generateFrameNumbers('player-walk', {
               start: rowIdx * 9, // 9 columns per row
               end: (rowIdx * 9) + 8
           }),
           frameRate: 10,
           repeat: -1
       });
   }
   ```
3. **Execution:** In the `update()` loop, we check the movement vector. If `y < 0`, we play `player-walk-up`.

---

## 🚀 4. Detailed Bonus Features (Technical Briefs)

### 🤝 4.1 ระบบปาร์ตี้ (Party System)
**Goal:** Allow players to team up for shared experience and private communication.
- **Server Logic:**
    - Create a `Parties` Map in `GameRoom`. Each party has a `leader` and a list of `members`.
    - **Shared XP:** When a monster dies, check if the killer is in a party. If so, find all party members within a specific radius (e.g., 500px) and distribute XP equally.
    - **Messages:** `party_invite`, `party_accept`, `party_leave`, `party_chat`.
- **Client UI:** A new `PartyPanel.svelte` to show health bars and levels of teammates.

### 🐎 4.2 ระบบสัตว์ขี่ (Mount System)
**Goal:** Increase exploration speed and add visual flair.
- **Implementation:**
    - **State:** Add `isMounted: boolean` and `mountId: string` to the `Player` schema.
    - **Movement:** If `isMounted` is true, apply a multiplier (e.g., 1.5x) to `PLAYER_SPEED` in both Client and Server validation.
    - **Visuals:** In `MainScene.ts`, if a player is mounted, swap their base spritesheet for a "Mounted" spritesheet that includes both the character and the animal (LPC format supports this).

### 🌑 4.3 ระบบกลางวัน-กลางคืน (Day/Night Cycle)
**Goal:** Dynamic atmosphere and time-based gameplay.
- **Logic:**
    - **Global Timer:** The Server maintains a `worldTime` (0-2400) where 1200 is noon and 0 is midnight.
    - **Broadcasting:** The server broadcasts the time every minute.
- **Visuals (Phaser):**
    - Use `this.cameras.main.setTint(color)` to simulate lighting.
    - **Midnight:** Dark blue/purple tint (`0x222266`).
    - **Noon:** Clear/No tint (`0xffffff`).
    - **Sunset/Sunrise:** Orange/Golden tint (`0xffa500`).
- **Gameplay Impact:** Increase monster spawn rates or difficulty during "Night" cycles.

### 💰 4.4 ระบบแลกเปลี่ยน (Trading System)
**Goal:** Enable a secure player-driven economy.
- **Implementation:**
    - **Two-Step Verification:** Both players must "Lock" their trade before the "Confirm" button becomes active. If any item changes after locking, it auto-unlocks.
    - **Server Truth:** The trade happens in a single transaction on the server using Prisma (`prisma.$transaction`) to prevent item duplication bugs.
- **UI:** A side-by-side window showing both players' offered items and gold.

### 🛡️ 4.5 ระบบกิลด์ (Guild System)
**Goal:** Build long-term player communities.
- **Data Structure:** A `Guild` model in Prisma with `ownerId`, `members`, and `guildLevel`.
- **Visuals:** Display the Guild Name in brackets `[GuildName]` above the player's username in Phaser.
- **Features:** Shared Guild Storage, Guild Chat channel, and eventually Guild Wars.

### ⚡ 4.6 การปรับแต่งประสิทธิภาพ (Optimization & Scaling)
**Goal:** Ensure smooth performance for hundreds of players.
- **Object Pooling:** Reuse sprites for projectiles and damage numbers instead of creating/destroying them constantly (reduces Garbage Collection lag).
- **Lazy Loading:** Only load spritesheets when a player with those specific items enters the screen.
- **Culling:** Stop rendering or updating players/monsters that are far outside the camera's view.

---

## 🛠️ 5. Maintenance, Monitoring, and Deployment
**Goal:** Prepare the game for a stable production release on a live server.

### 📊 5.1 Structured Logging & Monitoring
- **Centralized Logs:** Implement a library like `winston` to save logs to files (e.g., `combined.log`, `error.log`) with timestamps.
- **Activity Tracking:** Log sensitive actions like Large Gold Transfers, Admin Command Usage, and Failed Login Attempts.
- **Dashboard:** Use a tool like PM2 (Process Manager) to monitor CPU/RAM usage and auto-restart the server if it crashes.

### 🧪 5.2 Automated Testing
- **Unit Tests:** Write tests for core "Calculations" (e.g., Experience to Level logic, Item Stat math) using a framework like `Vitest` or `Jest`.
- **Integration Tests:** Test the API endpoints (Login, Register) to ensure they return the correct status codes and headers.

### 🐳 5.3 Dockerization (Containerization)
- **Environment Consistency:** Create a `Dockerfile` and `docker-compose.yml` to bundle the Node.js server, Svelte client, and SQLite database together.
- **Simplified Deployment:** Allows you to deploy the entire game to any VPS (DigitalOcean, AWS, Linode) with a single command: `docker-compose up -d`.

---
*Roadmap generated by Gemini CLI - Complete Production Version.*
