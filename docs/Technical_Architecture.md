# ⚔️ Drami Online: System & Deployment Master Documentation

**Drami Online** is a cross-platform 2D MMORPG built with pixel art fidelity, high performance WebSocket networking, and strict client-server authoritative architecture.

---

## 🌟 Production URLs
- **Game Client (Web / Mobile Landscape)**: [https://drami.vercel.app](https://drami.vercel.app)
- **Authoritative Server (Render Singapore)**: [https://drami-zxd44.onrender.com](https://drami-zxd44.onrender.com)
- **GitHub Repository**: [https://github.com/ZXD44/Drami-ZXD44](https://github.com/ZXD44/Drami-ZXD44)

---

## 🛡️ Security Architecture & Anti-Cheat (DramiShield)

```text
[Browser / Hacker Client]
         │
         ├── 1. Client-Side Defense (DramiShield.ts)
         │       ├── Anti-DevTools Detection & Console Scam Warnings
         │       ├── DOM Modification & Local Storage tamper traps
         │       └── Keyboard shortcut / Right-click inspection intercepts
         │
         ▼ (Encrypted WebSocket)
[Colyseus Server (Singapore Node)]
         │
         ├── 2. Server-Authoritative Verification (GameRoom.ts)
         │       ├── Displacement Vector & Speedhack Validation (Anti-Teleport)
         │       ├── Chat Sanitization & Message Length Throttling (Anti-Spam)
         │       ├── Strict Token-Based JWT Authorization on Sensitive Routes
         │       └── Temporary & Permanent Hardware/Account Ban Matrix
         │
         ▼
[Database (SQLite Dev / PostgreSQL Production)]
```

### Key Security Measures:
1. **Server Authoritative**: Client never dictates stats, gold, or valid map bounds. Position packets with abnormal delta displacements trigger immediate snapbacks or bans.
2. **Sanitized Communication**: Chat inputs are trimmed and bounded to prevent XSS payloads and memory flooding.
3. **Admin Privilege Isolation**: Only authenticated accounts with role `admin` can query statistical endpoints or invoke item grants.

---

## 🏗️ Architecture & Stack
- **Frontend**: SvelteKit 2 (Svelte 5 Runes) + Phaser 3.90 + Tailwind CSS v4
- **Engine Coordination**: Phaser manages rendering canvas and tile physics; Svelte overlays HUD components with decoupled reactive stores.
- **Backend**: Node.js + Express + Colyseus v0.16 + Prisma ORM
- **Database**: SQLite (`prisma/dev.db`) for isolated environments, ready for PostgreSQL migration.
- **Hosting**: Vercel Edge CDN (Client) + Render Web Service (Backend, Singapore region).

---

## 🚀 Running Locally

```bash
# Start whole infrastructure automatically:
./run_game.sh      # Linux / macOS
run_game.bat       # Windows
```

---
© 2026 Drami Online. Crafted by ZirconX (ZXD44).
