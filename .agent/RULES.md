# AGENT INVARIANTS & ENGINEERING RULES (RULES.md)

Any AI agent operating on the Drami Online codebase MUST adhere to the following rules:

---

## 1. Architectural Guardrails
1. **Never Mix Render Pipelines**:
   - Do NOT render DOM-based game entities inside Phaser Canvas.
   - Do NOT render Phaser physics objects in HTML elements.
   - Phaser manages viewport, sprites, tilemaps, and animations. Svelte manages HUD overlays, modal dialogs, chat windows, and menus.
2. **Authoritative Server Principle**:
   - Player movement and critical action validation (damage, inventory modification, trades) belong on the Server (`server/rooms/GameRoom.ts`).
   - Client is predictive/interpolative only; never trust client-sent stats or inventory quantities.
3. **Svelte 5 Reactivity Strictness**:
   - Use Runes (`$state`, `$derived`, `$effect`, `$props`).
   - FORBIDDEN: Capturing initial props directly into local `$state` if they need continuous sync (`state_referenced_locally` violation). Use `$derived` or update via `$effect`.

---

## 2. Code Hygiene & Quality Standards
1. **Zero Fluff & Structural Determinism**:
   - Keep answers terse, direct, and actionable. First token should be meaningful structure/diff.
2. **Cyclomatic Complexity & Span**:
   - Maximum cyclomatic complexity: 7 per function.
   - Maximum span: 70 lines for core business logic functions.
   - Use early returns and guard clauses (nesting depth <= 3).
3. **Forbidden Generic Identifiers**:
   - Do NOT use names like `data`, `res`, `req`, `item`, `val`, `temp`, `obj`, `info`, `payload`, `result`, `handleData`, `doAction` in domain state or data models.
4. **Banned Junk Drawers**:
   - Never create or dump generic functions into `utils/`, `helpers/`, or `common/`. Co-locate them strictly within domain feature directories.
5. **No Silent Error Swallowing**:
   - Never use empty `catch {}`, raw `expect()`, or unhandled promise rejections. Provide explicit domain logging or error propagation.

---

## 3. Deployment & Environment Rules
1. **Ephemeral File System Protection**:
   - SQLite (`dev.db`) is strictly for local development. Production deployments on Render, Koyeb, or serverless MUST point `DATABASE_URL` to an external database (PostgreSQL via Neon / Supabase).
2. **Client Config Independence**:
   - All client-side server targets must read from environment variables (`VITE_SERVER_URL`), with fallback to `http://localhost:2567` for dev mode.
