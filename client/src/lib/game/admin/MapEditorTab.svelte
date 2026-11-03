<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "../components/Icon.svelte";
    import { playerPos, showNotification } from "$lib/game-ui";
    import { adminService } from "./adminService";

    let currentX = $state(1200);
    let currentY = $state(900);
    let isSaving = $state(false);

    // World Boundaries
    let mapWidth = $state(4800);
    let mapHeight = $state(4800);
    let zoomScale = $state(1);

    // Entity Creator State
    let entityType = $state<"monster" | "npc" | "teleport" | "tree">("monster");
    let entityName = $state("Slime");
    let entityHp = $state(100);
    let placedEntities = $state<Array<{ id: string; type: string; name: string; x: number; y: number }>>([
        { id: "e1", type: "npc", name: "Elder Thorne", x: 1250, y: 920 },
        { id: "e2", type: "monster", name: "Forest Goblin", x: 1400, y: 880 },
        { id: "e3", type: "tree", name: "Ancient Beech", x: 1100, y: 950 }
    ]);

    onMount(() => {
        const unsub = playerPos.subscribe(pos => {
            currentX = Math.floor(pos.x);
            currentY = Math.floor(pos.y);
        });
        return unsub;
    });

    async function setSpawnHere() {
        isSaving = true;
        try {
            const token = localStorage.getItem("drami_token");
            let userId = "";
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.id;
                } catch (e) {}
            }

            await adminService.setSpawnPoint(userId, currentX, currentY);
            showNotification(`บันทึกจุดเกิดที่พิกัด (${currentX}, ${currentY}) เรียบร้อย!`, "success");
        } catch (e: any) {
            showNotification(e.message || "เกิดข้อผิดพลาดในการบันทึกจุดเกิด", "error");
        } finally {
            isSaving = false;
        }
    }

    async function triggerGlobalReload() {
        if (!confirm("ต้องการรีโหลดหน้าเว็บของผู้เล่นทุกคนทันทีใช่หรือไม่?")) return;
        try {
            await adminService.reloadAllPlayers();
            showNotification("ส่งคำสั่งรีโหลดหน้าเว็บผู้เล่นทุกคนเรียบร้อย!", "success");
        } catch (e: any) {
            showNotification(e.message || "เกิดข้อผิดพลาด", "error");
        }
    }

    function addEntityAtPlayer() {
        const newObj = {
            id: `entity_${Date.now()}`,
            type: entityType,
            name: entityName,
            x: currentX,
            y: currentY
        };
        placedEntities = [...placedEntities, newObj];
        showNotification(`วาง ${entityName} (${entityType}) ที่พิกัด (${currentX}, ${currentY})`, "success");
    }

    function removeEntity(id: string) {
        placedEntities = placedEntities.filter(e => e.id !== id);
        showNotification("ลบเอนทิตีออกจากแผนที่แล้ว", "info");
    }
</script>

<div class="map-editor-tab fade-in">
    <!-- Top Global Deployment & Reload Bar -->
    <div class="editor-header-card">
        <div class="header-status-group">
            <div class="live-dot-pulse"></div>
            <div>
                <h4 class="card-title">Live World Orchestrator</h4>
                <p class="card-desc">จัดการขอบเขตแมพ พิกัดเกิด และเอนทิตีแบบเรียลไทม์</p>
            </div>
        </div>
        <div class="header-btn-group">
            <button class="btn-reload-world" onclick={triggerGlobalReload} title="รีโหลดหน้าต่างผู้เล่นทุกคนในเซิร์ฟ">
                <Icon name="horn" size={14} color="#fca5a5" />
                <span>รีโหลดหน้าเว็บทุกคน (Sync Update)</span>
            </button>
        </div>
    </div>

    <!-- 2 Column Layout: Controls & Entity Placer -->
    <div class="editor-columns-grid">
        <!-- Left: Spawn Point & Map Bounds -->
        <div class="editor-subpanel">
            <h5 class="subpanel-title">
                <Icon name="map" size={15} color="#fcd34d" />
                <span>จุดเกิดหลัก & พิกัดปัจจุบัน</span>
            </h5>
            
            <div class="coord-display-card">
                <div class="coord-stat">
                    <span class="coord-key">CURRENT X</span>
                    <span class="coord-val">{currentX}</span>
                </div>
                <div class="coord-divider"></div>
                <div class="coord-stat">
                    <span class="coord-key">CURRENT Y</span>
                    <span class="coord-val">{currentY}</span>
                </div>
            </div>

            <button class="btn-primary-gold full-width" onclick={setSpawnHere} disabled={isSaving} style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <Icon name="pin" size={16} />
                <span>{isSaving ? 'กำลังบันทึก...' : 'ตั้งพิกัดปัจจุบันเป็นจุดเกิด (Save Spawn)'}</span>
            </button>

            <!-- Map Dimensions -->
            <div class="bounds-config-section">
                <h5 class="subpanel-title" style="margin-top: 1.2rem;">
                    <Icon name="settings" size={15} color="#60a5fa" />
                    <span>ขอบเขตแผนที่ (Map Boundary)</span>
                </h5>
                <div class="bounds-input-grid">
                    <div class="bound-field">
                        <label for="bound-w">ความกว้าง (Width Px)</label>
                        <input id="bound-w" type="number" bind:value={mapWidth} class="admin-input" />
                    </div>
                    <div class="bound-field">
                        <label for="bound-h">ความสูง (Height Px)</label>
                        <input id="bound-h" type="number" bind:value={mapHeight} class="admin-input" />
                    </div>
                </div>
                <div class="bound-summary">
                    <span>ขนาดย่อย: {Math.floor(mapWidth / 32)} x {Math.floor(mapHeight / 32)} Tiles</span>
                </div>
            </div>
        </div>

        <!-- Right: Spawner / Asset Placer -->
        <div class="editor-subpanel">
            <h5 class="subpanel-title">
                <Icon name="swords" size={15} color="#f43f5e" />
                <span>เครื่องมือวางมอนสเตอร์ / NPC / ทรัพยากร</span>
            </h5>

            <div class="spawner-form-grid">
                <div class="bound-field">
                    <label for="ent-type">ประเภทเอนทิตี</label>
                    <select id="ent-type" bind:value={entityType} class="admin-select">
                        <option value="monster">👾 Monster (มอนสเตอร์โจมตี)</option>
                        <option value="npc">🧙 NPC (ผู้มอบเควส/พูดคุย)</option>
                        <option value="tree">🌲 Resource (ต้นไม้/แร่)</option>
                        <option value="teleport">🌀 Teleport Portal (วาร์ป)</option>
                    </select>
                </div>

                <div class="bound-field">
                    <label for="ent-name">ชื่อเอนทิตี</label>
                    <input id="ent-name" type="text" bind:value={entityName} class="admin-input" placeholder="เช่น Slime King" />
                </div>
            </div>

            <button class="btn-create-entity" onclick={addEntityAtPlayer}>
                <Icon name="sparkles" size={15} color="#fff" />
                <span>วางที่ตำแหน่งผู้เล่นยืนอยู่ ({currentX}, {currentY})</span>
            </button>

            <!-- Entities List in Scene -->
            <div class="entities-list-header">
                <span>เอนทิตีในแผนที่ ({placedEntities.length})</span>
            </div>

            <div class="entities-scroll-container">
                {#each placedEntities as ent}
                    <div class="entity-item-row">
                        <div class="entity-meta">
                            <span class="entity-tag {ent.type}">{ent.type.toUpperCase()}</span>
                            <span class="entity-name">{ent.name}</span>
                            <span class="entity-coords">({ent.x}, {ent.y})</span>
                        </div>
                        <button class="btn-del-ent" onclick={() => removeEntity(ent.id)} title="ลบ">
                            <Icon name="close" size={12} color="#f87171" />
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .map-editor-tab {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem 0;
    }

    .editor-header-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%);
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 8px;
    }

    .header-status-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .live-dot-pulse {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ef4444;
        box-shadow: 0 0 10px #ef4444;
        animation: pulse 1.5s infinite;
    }

    .card-title {
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.95rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0;
    }

    .card-desc {
        font-size: 0.75rem;
        color: #94a3b8;
        margin: 2px 0 0 0;
    }

    .btn-reload-world {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: #fca5a5;
        padding: 6px 12px;
        border-radius: 6px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn-reload-world:hover {
        background: rgba(239, 68, 68, 0.4);
        border-color: #ef4444;
        color: #ffffff;
    }

    /* 2 Column Layout */
    .editor-columns-grid {
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: 1rem;
    }

    .editor-subpanel {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }

    .subpanel-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.85rem;
        font-weight: 700;
        color: #f1f5f9;
        margin: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 6px;
    }

    .coord-display-card {
        display: flex;
        align-items: center;
        justify-content: space-around;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(251, 191, 36, 0.2);
        border-radius: 6px;
        padding: 8px;
    }

    .coord-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    .coord-key {
        font-family: 'Press Start 2P', monospace;
        font-size: 0.5rem;
        color: #94a3b8;
    }

    .coord-val {
        font-family: 'IBM Plex Sans Thai', monospace;
        font-size: 1.1rem;
        font-weight: 700;
        color: #fcd34d;
    }

    .coord-divider {
        width: 1px;
        height: 25px;
        background: rgba(255, 255, 255, 0.15);
    }

    .bounds-input-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 6px;
    }

    .bound-field label {
        display: block;
        font-size: 0.75rem;
        color: #94a3b8;
        margin-bottom: 4px;
    }

    .bound-summary {
        font-size: 0.72rem;
        color: #38bdf8;
        margin-top: 4px;
        text-align: right;
    }

    /* Spawner Controls */
    .spawner-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .btn-create-entity {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
        border: none;
        border-radius: 6px;
        padding: 8px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.8rem;
        font-weight: 600;
        color: #ffffff;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
        transition: all 0.15s ease;
    }

    .btn-create-entity:hover {
        filter: brightness(1.15);
    }

    .entities-list-header {
        font-size: 0.75rem;
        font-weight: 600;
        color: #94a3b8;
        margin-top: 4px;
    }

    .entities-scroll-container {
        max-height: 120px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .entity-item-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 4px 8px;
    }

    .entity-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
    }

    .entity-tag {
        font-size: 0.62rem;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 3px;
    }
    .entity-tag.monster { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .entity-tag.npc { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .entity-tag.tree { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .entity-tag.teleport { background: rgba(168, 85, 247, 0.2); color: #c084fc; }

    .entity-name {
        color: #e2e8f0;
        font-weight: 500;
    }

    .entity-coords {
        color: #64748b;
        font-family: monospace;
    }

    .btn-del-ent {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 2px;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.15); }
    }
</style>