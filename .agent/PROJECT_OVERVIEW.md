# AGENT CONTEXT & SYSTEM ARCHITECTURE: DRAMI ONLINE

## 1. Project Overview
Drami Online is a real-time 2D pixel-art MMORPG running in modern web browsers.
- **Client (`/client`)**: SvelteKit 2 + Svelte 5 (Runes) + Phaser 3 (Engine) + Tailwind CSS v4 + Colyseus.js (Client SDK).
- **Server (`/server`)**: Node.js + Express + Colyseus (Multiplayer WS Framework) + Prisma ORM (SQLite / PostgreSQL).
- **Assets (`/character`)**: LPC (Liberated Pixel Cup) 4-direction spritesheets with layer compositing scripts.

---

## 2. Directory Layout & Boundaries
```text
Drami-Web-Game/
├── .agent/                 # AI Agent instructions, rules & architecture
├── .workflow/deploy/       # CI/CD deployment workflows (Vercel, Cloudflare Pages)
├── client/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── game/
│   │   │   │   ├── admin/       # In-game admin dashboard & modals
│   │   │   │   ├── components/  # Svelte 5 UI HUD (Chat, Inventory, Hotbar, Minimap)
│   │   │   │   ├── engine/      # Phaser scenes (MainScene.ts, BootScene.ts)
│   │   │   │   └── services/    # NetworkService, PlayerService, Colyseus room
│   │   │   └── game-ui.ts       # Shared reactive state bridges
│   │   └── routes/              # SvelteKit pages (/game, /register, login)
├── server/
│   ├── prisma/                  # schema.prisma (User, Item, Inventory)
│   ├── rooms/                   # GameRoom.ts (Colyseus room authoritative logic)
│   ├── routes/                  # Express HTTP endpoints (auth, admin, users)
│   ├── index.ts                 # Server entry point (Colyseus + Express listen on 2567)
│   └── db.ts                    # Prisma Client instance
└── run_game.sh / run_game.bat   # Unified cross-platform startup scripts
```

---

## 3. Communication & State Flow
- **Phaser & Svelte Coordination**:
  - Phaser handles raw game canvas, tilemaps, physics, and input events.
  - Svelte components overlay Phaser via CSS `pointer-events-none` (containers) and `pointer-events-auto` (interactive controls).
  - State bridge: Event emitters and reactive stores/runes in `$lib/game-ui.ts` sync player position, health, inventory, and chat between Phaser and Svelte.
- **Client-Server Networking**:
  - Real-time movement & world sync: Colyseus rooms (`room.send(...)`, `room.onMessage(...)`, state sync).
  - REST API: Authentication (`/login`, `/register`), admin actions (`/api/admin`).
  - Auth header: `Authorization: Bearer <token>`.

---

## 4. Development & Runtime Ports
- **Server Port**: `2567` (HTTP + WebSocket)
- **Client Port**: `5173` (Vite dev server)
