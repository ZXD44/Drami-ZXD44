<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "../components/Icon.svelte";
    import { playerPos, showNotification } from "$lib/game-ui";
    import { adminService } from "./adminService";

    let currentX = $state(1200);
    let currentY = $state(900);
    let isSaving = $state(false);

    // Entity Creator State
    let entityType = $state<"monster" | "npc" | "teleport" | "tree">("monster");
    let entityName = $state("Forest Goblin");
    let entityHp = $state(80);
    let placedEntities = $state<Array<{ id: string; type: string; name: string; x: number; y: number }>>([
        { id: "npc_elder", type: "npc", name: "Elder Thorne", x: 1250, y: 920 },
        { id: "npc_guide", type: "npc", name: "Ranger Lina", x: 1350, y: 980 },
        { id: "mob_goblin_1", type: "monster", name: "Forest Goblin", x: 1600, y: 880 },
        { id: "tree_ancient", type: "tree", name: "Ancient Oak", x: 1100, y: 850 }
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
            const win = window as any;
            if (win.__drami_room) {
                win.__drami_room.send("set_spawn_point", { x: currentX, y: currentY });
            }

            const token = localStorage.getItem("drami_token");
            let userId = "";
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.userId || payload.id || "";
                } catch (e) {}
            }

            await adminService.setSpawnPoint(userId, currentX, currentY);
            showNotification(`บันทึกจุดเกิดที่พิกัด (${currentX}, ${currentY}) สำเร็จ!`, "success");
        } catch (e: any) {
            showNotification(e.message || "เกิดข้อผิดพลาดในการบันทึกจุดเกิด", "error");
        } finally {
            isSaving = false;
        }
    }

    async function triggerGlobalReload() {
        if (!confirm("ต้องการสั่งรีโหลดหน้าเว็บของผู้เล่นทุกคนทันทีใช่หรือไม่?")) return;
        try {
            await adminService.reloadAllPlayers();
            showNotification("ส่งคำสั่งรีโหลดหน้าเว็บผู้เล่นทุกคนเรียบร้อย!", "success");
        } catch (e: any) {
            showNotification(e.message || "เกิดข้อผิดพลาด", "error");
        }
    }

    function addEntityAtPlayer() {
        const win = window as any;
        const newId = `ent_${Date.now()}`;
        if (win.__drami_room) {
            win.__drami_room.send("admin_spawn_entity", {
                type: entityType,
                name: entityName,
                x: currentX,
                y: currentY,
                hp: entityHp
            });
        }

        placedEntities = [
            { id: newId, type: entityType, name: entityName, x: currentX, y: currentY },
            ...placedEntities
        ];
        showNotification(`วาง ${entityName} (${entityType}) ที่ (${currentX}, ${currentY}) เรียบร้อย!`, "success");
    }

    function removeEntity(id: string) {
        const win = window as any;
        if (win.__drami_room) {
            win.__drami_room.send("admin_remove_entity", { id });
        }
        placedEntities = placedEntities.filter(e => e.id !== id);
        showNotification("ลบเอนทิตีเรียบร้อย", "info");
    }

    function teleportToEntity(x: number, y: number) {
        const win = window as any;
        if (win.__drami_room) {
            win.__drami_room.send("admin_teleport_to", { x, y });
            showNotification(`วาร์ปไปพิกัด (${x}, ${y})`, "success");
        }
    }
</script>

<div class="map-editor-compact">
    <!-- Top Action Bar -->
    <div class="top-command-bar">
        <div class="live-coords-pill">
            <span class="live-dot"></span>
            <span class="coords-label">พิกัดปัจจุบัน:</span>
            <span class="coords-val">X: {currentX} | Y: {currentY}</span>
        </div>
        <div class="quick-btns">
            <button class="btn-save-spawn" onclick={setSpawnHere} disabled={isSaving}>
                <Icon name="pin" size={14} color="#000" />
                <span>{isSaving ? 'กำลังบันทึก...' : 'เซฟจุดเกิดตรงนี้'}</span>
            </button>
            <button class="btn-force-reload" onclick={triggerGlobalReload} title="รีโหลดหน้าต่างผู้เล่นทุกคนในเซิร์ฟ">
                <Icon name="horn" size={14} color="#fca5a5" />
                <span>รีโหลดทุกคน (Sync)</span>
            </button>
        </div>
    </div>

    <!-- 2 Column Compact Grid (Zero Waste Space) -->
    <div class="two-col-layout">
        <!-- Left: Quick Spawner Form -->
        <div class="card-box">
            <div class="card-header">
                <Icon name="sparkles" size={14} color="#fcd34d" />
                <span>วางเอนทิตีลงแมพ (Instant Spawner)</span>
            </div>
            
            <div class="form-compact-grid">
                <div class="field-group">
                    <label for="c-type">ประเภท</label>
                    <select id="c-type" bind:value={entityType} class="select-lux">
                        <option value="monster">👾 มอนสเตอร์ (Monster)</option>
                        <option value="npc">🧙 NPC เควส/ร้านค้า</option>
                        <option value="tree">🌲 ทรัพยากร (ต้นไม้/แร่)</option>
                        <option value="teleport">🌀 ประตูวาร์ป (Portal)</option>
                    </select>
                </div>

                <div class="field-group">
                    <label for="c-name">ชื่อเอนทิตี</label>
                    <input id="c-name" type="text" bind:value={entityName} class="input-lux" placeholder="เช่น Forest Goblin" />
                </div>
            </div>

            <button class="btn-action-spawn" onclick={addEntityAtPlayer}>
                <Icon name="sparkles" size={14} color="#ffffff" />
                <span>วางเอนทิตีตรงตำแหน่งที่ยืนอยู่ ({currentX}, {currentY})</span>
            </button>

            <div class="quick-tips">
                * เอนทิตีจะแสดงในเกมทันทีและผู้เล่นทุกคนจะเห็นพร้อมกันแบบ Real-time
            </div>
        </div>

        <!-- Right: Active Entities List with Teleport -->
        <div class="card-box">
            <div class="card-header space-between">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <Icon name="map" size={14} color="#38bdf8" />
                    <span>รายการเอนทิตีในแมพ ({placedEntities.length})</span>
                </div>
                <span class="subtext-badge">คลิกปุ่มเพื่อวาร์ปหา</span>
            </div>

            <div class="entities-compact-list">
                {#each placedEntities as ent}
                    <div class="entity-compact-row">
                        <div class="ent-info">
                            <span class="ent-badge {ent.type}">{ent.type}</span>
                            <span class="ent-title">{ent.name}</span>
                            <span class="ent-pos">({ent.x}, {ent.y})</span>
                        </div>
                        <div class="ent-btns">
                            <button class="btn-sm warp" onclick={() => teleportToEntity(ent.x, ent.y)} title="วาร์ปไปหา">
                                <Icon name="ping" size={11} color="#38bdf8" />
                                <span>วาร์ป</span>
                            </button>
                            <button class="btn-sm del" onclick={() => removeEntity(ent.id)} title="ลบออก">
                                <Icon name="close" size={11} color="#f87171" />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .map-editor-compact {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 100%;
        overflow: hidden;
    }

    .top-command-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(251, 191, 36, 0.25);
        border-radius: 8px;
        padding: 6px 10px;
    }

    .live-coords-pill {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pulseDot 1.5s infinite;
    }

    .coords-label {
        font-size: 0.78rem;
        color: #94a3b8;
    }

    .coords-val {
        font-family: monospace;
        font-size: 0.85rem;
        font-weight: 700;
        color: #fcd34d;
    }

    .quick-btns {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .btn-save-spawn {
        display: flex;
        align-items: center;
        gap: 5px;
        background: linear-gradient(180deg, #fde047 0%, #eab308 100%);
        border: none;
        border-radius: 6px;
        padding: 5px 12px;
        font-size: 0.78rem;
        font-weight: 700;
        color: #451a03;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn-save-spawn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
    }

    .btn-force-reload {
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.45);
        border-radius: 6px;
        padding: 5px 10px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #fca5a5;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn-force-reload:hover {
        background: rgba(239, 68, 68, 0.35);
        color: #fff;
    }

    /* 2 Column Layout */
    .two-col-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        flex: 1;
        min-height: 0;
    }

    .card-box {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 0;
    }

    .card-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #f1f5f9;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding-bottom: 5px;
    }

    .card-header.space-between {
        justify-content: space-between;
    }

    .subtext-badge {
        font-size: 0.65rem;
        color: #94a3b8;
    }

    .form-compact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .field-group label {
        font-size: 0.7rem;
        color: #94a3b8;
    }

    .select-lux, .input-lux {
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 5px;
        padding: 5px 8px;
        font-size: 0.78rem;
        color: #f8fafc;
        outline: none;
    }

    .select-lux:focus, .input-lux:focus {
        border-color: #f59e0b;
    }

    .btn-action-spawn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
        border: none;
        border-radius: 6px;
        padding: 7px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #ffffff;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn-action-spawn:hover {
        filter: brightness(1.15);
    }

    .quick-tips {
        font-size: 0.68rem;
        color: #64748b;
        margin-top: auto;
    }

    /* Entities List */
    .entities-compact-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 280px;
    }

    .entities-compact-list::-webkit-scrollbar {
        width: 4px;
    }

    .entities-compact-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
    }

    .entity-compact-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 5px;
        padding: 4px 8px;
    }

    .ent-info {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.74rem;
    }

    .ent-badge {
        font-size: 0.6rem;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 3px;
        text-transform: uppercase;
    }
    .ent-badge.monster { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .ent-badge.npc { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .ent-badge.tree { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .ent-badge.teleport { background: rgba(168, 85, 247, 0.2); color: #c084fc; }

    .ent-title {
        color: #e2e8f0;
        font-weight: 600;
    }

    .ent-pos {
        color: #64748b;
        font-family: monospace;
        font-size: 0.7rem;
    }

    .ent-btns {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .btn-sm {
        display: flex;
        align-items: center;
        gap: 3px;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 0.65rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
    }
    .btn-sm.warp {
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .btn-sm.warp:hover {
        background: rgba(56, 189, 248, 0.3);
        color: #fff;
    }
    .btn-sm.del {
        background: rgba(239, 68, 68, 0.15);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .btn-sm.del:hover {
        background: rgba(239, 68, 68, 0.35);
        color: #fff;
    }

    @keyframes pulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.3; transform: scale(1.2); }
    }
</style>