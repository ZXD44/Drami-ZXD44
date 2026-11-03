# ⚔️ Drami Online

Drami Online is a modern browser-based MMORPG built with a focus on high-fidelity pixel art and a smooth, cross-platform experience. It leverages **Phaser 3** for high-performance rendering and **SvelteKit** for a reactive, modular user interface.

## 🏗️ Project Overview

The project follows a **Client-Server Architecture** using WebSockets for real-time synchronization.

### Technologies
- **Frontend:** [SvelteKit](https://kit.svelte.dev/) (UI & Routing), [Phaser 3](https://phaser.io/) (Game Engine), Vanilla CSS (Styling).
- **Backend:** [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/), [Colyseus.js](https://colyseus.io/) (Multiplayer Framework).
- **Database:** [SQLite](https://sqlite.org/) with [Prisma ORM](https://www.prisma.io/).
- **Networking:** WebSockets (via Colyseus) and HTTP/REST (via Express).

### Architecture
- **Client (`/client`):** A SvelteKit application where Phaser handles the game world (rendering, input, movement) and Svelte manages the HUD, menus (Inventory, Quest Log, Chat), and overlay systems.
- **Server (`/server`):** A TypeScript-based server that manages authoritative game state, room logic (`GameRoom.ts`), user authentication, and administrative functions.
- **Asset Pipeline:** Custom tools like `sprite_tool.py` and `_copy_layer_sheets.js` are used to manage LPC (Liberated Pixel Cup) spritesheets.

---

## 🚀 Building and Running

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun

### Server Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```
*The server listens on port **2567** by default.*

### Client Setup
```bash
cd client
npm install
npm run dev
```
*The client typically runs on port **5173**.*

---

## 🛠️ Development Conventions

### Code Style & Patterns
- **Svelte 5:** The client uses Svelte 5 snippets and runes for reactivity.
- **Phaser Integration:** Phaser scenes (e.g., `MainScene.ts`) are injected into Svelte components (`Game.svelte`). Shared state is managed via Svelte stores (`$lib/game-ui.ts`).
- **Networking:** 
    - Use `room.send("type", data)` for client-to-server messages.
    - Use `room.broadcast("type", data)` or `client.send` for server-to-client updates.
- **Auth:** Every administrative or user-specific API request must include a `Bearer Token` in the Authorization header.

### Key Directories
- `client/src/lib/game/engine/`: Core Phaser logic and scene management.
- `client/src/lib/game/components/`: Svelte UI components (HUD, Overlays).
- `server/rooms/`: Colyseus room logic (e.g., `GameRoom.ts`).
- `server/routes/`: Express API routes for auth, admin, and users.
- `docs/`: Technical documentation and design plans.

### Security (DramiShield)
- **Anti-Cheat:** Server-side validation for movement and sensitive actions is a priority. Client-side checks (Anti-DevTools) are implemented to prevent UI tampering.

### Asset Management
- Characters use the **LPC (Liberated Pixel Cup)** format.
- Spritesheets are organized by action and gender (e.g., `player-male-walk.png`).
- Use `sprite_tool.py` for batch processing or generating new sprite layers.

---
*Created and maintained by ZirconX (ZXD44).*
