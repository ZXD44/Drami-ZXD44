<script lang="ts">
    import { onMount } from "svelte";
    import { showNotification, askConfirm } from "../game-ui";
    import ConfirmDialog from "../ConfirmDialog.svelte";
    
    // Services & Types
    import { adminService, type User, type AdminStats } from "./admin/adminService";
    
    // Components
    import DashboardTab from "./admin/DashboardTab.svelte";
    import PlayersTab from "./admin/PlayersTab.svelte";
    import BroadcastTab from "./admin/BroadcastTab.svelte";
    import MapEditorTab from "./admin/MapEditorTab.svelte";
    import EditUserModal from "./admin/EditUserModal.svelte";
    import Icon from "./components/Icon.svelte";

    let { onDispose } = $props<{ onDispose: () => void }>();

    let users: User[] = $state([]);
    let items: any[] = $state([]);
    let stats = $state<AdminStats>({ totalUsers: 0, totalGold: 0, totalDiamonds: 0, avgLevel: 0 });
    
    let loading = $state(true);
    let activeTab = $state("dashboard");
    let editingUser = $state<User | null>(null);
    let editMode = $state<"basic" | "advanced">("basic");
    let motto = $state("");

    const mottos = [
        "THE ARCHITECT OF ADVENTURE.", 
        "CONTROL THE WORLD, SHAPE THE LEGEND.", 
        "AUTHORITY IN EVERY PIXEL.", 
        "SECURED SYSTEM - DRAMI AUTHENTICATED.", 
        "SYSTEM OVERRIDE: ACTIVE.", 
        "THE POWER OF CREATION IS YOURS.",
        "DRAMI ONLINE - WORLD OF ADVENTURE"
    ];

    let displayedMotto = $state("");
    let isTyping = false;

    async function typeWriter(text: string) {
        if (isTyping) return;
        isTyping = true;
        while (displayedMotto.length > 0) {
            displayedMotto = displayedMotto.slice(0, -1);
            await new Promise(r => setTimeout(r, 20));
        }
        await new Promise(r => setTimeout(r, 500));
        for (let i = 0; i < text.length; i++) {
            displayedMotto += text[i];
            await new Promise(r => setTimeout(r, 50));
        }
        isTyping = false;
    }

    onMount(() => {
        let index = Math.floor(Math.random() * mottos.length);
        typeWriter(mottos[index]);

        const timer = setInterval(() => {
            index = (index + 1) % mottos.length;
            typeWriter(mottos[index]);
        }, 10000);

        fetchData();
        return () => clearInterval(timer);
    });

    async function fetchData() {
        loading = true;
        try {
            const results = await Promise.all([
                adminService.fetchUsers(),
                adminService.fetchStats(),
                adminService.fetchItems()
            ]);
            [users, stats, items] = results;
        } catch (e: any) {
            showNotification(e.message, "error");
        } finally {
            loading = false;
        }
    }

    async function handleBroadcast(msg: string) {
        try {
            await adminService.sendBroadcast(msg);
            showNotification("ประกาศเซิร์ฟเวอร์เรียบร้อยแล้ว", "success");
            onDispose(); // ปิดหน้าต่างทันทีหลังประกาศสำเร็จ
        } catch (e: any) {
            showNotification(e.message, "error");
        }
    }

    async function handleGiveItem(itemId: string, amount: number) {
        if (!editingUser) return;
        try {
            await adminService.giveItem(editingUser.id, itemId, amount);
            showNotification("ส่งไอเทมเรียบร้อยแล้ว", "success");
        } catch (e: any) {
            showNotification(e.message, "error");
        }
    }

    async function handleSaveUser(data: any) {
        if (!editingUser) return;
        try {
            await adminService.saveUserChanges(editingUser.id, data);
            await fetchData();
            editingUser = null;
            showNotification("บันทึกการเปลี่ยนแปลงสำเร็จ", "success");
        } catch (e: any) {
            showNotification(e.message, "error");
        }
    }

    async function handleToggleBan(user: User) {
        const actionText = user.isBanned ? "ปลดแบน" : "แบน";
        askConfirm({
            title: `ยืนยันการ${actionText}ผู้เล่น`,
            message: `คุณต้องการดำเนินการกับผู้เล่น ${user.username} ใช่หรือไม่?`,
            confirmText: `ยืนยันการ${actionText}`,
            cancelText: "ยกเลิก",
            type: user.isBanned ? "success" : "danger",
            onConfirm: async () => {
                try {
                    await adminService.deleteUser(user.id);
                    showNotification(`${actionText}ผู้เล่นเรียบร้อยแล้ว`, "success");
                    await fetchData();
                } catch (e: any) {
                    showNotification(e.message, "error");
                }
            }
        });
    }
</script>

<div class="panel-overlay fade-in admin-panel-large">
    <div class="panel-overlay-header">
        <div class="header-content"><span class="admin-title">ศูนย์บัญชาการผู้ดูแล</span><span class="motto-text">{displayedMotto}<span class="typing-cursor">|</span></span></div>
        <button class="panel-overlay-close" onclick={onDispose}>✕</button>
    </div>

    <div class="admin-nav-bar">
        <div class="nav-tabs">
            <button class="nav-tab" class:active={activeTab === 'dashboard'} onclick={() => activeTab = 'dashboard'}>
                <Icon name="ping" size={15} />
                <span>ภาพรวม</span>
            </button>
            <button class="nav-tab" class:active={activeTab === 'players'} onclick={() => activeTab = 'players'}>
                <Icon name="users" size={15} />
                <span>ผู้เล่น</span>
            </button>
            <button class="nav-tab" class:active={activeTab === 'map_editor'} onclick={() => activeTab = 'map_editor'}>
                <Icon name="map" size={15} color="#fcd34d" />
                <span>จัดการแมพ/จุดเกิด</span>
            </button>
            <button class="nav-tab" class:active={activeTab === 'broadcast'} onclick={() => activeTab = 'broadcast'}>
                <Icon name="horn" size={15} />
                <span>ประกาศ</span>
            </button>
        </div>
        <button class="btn-refresh" onclick={fetchData} disabled={loading} title="รีเฟรชข้อมูล">
            {#if loading}
                <div class="spinner-sm"></div>
            {:else}
                <Icon name="sparkles" size={16} />
            {/if}
        </button>
    </div>

    <div class="admin-body-scroll">
        {#if activeTab === 'dashboard'}
            <DashboardTab {stats} />
        {:else if activeTab === 'map_editor'}
            <MapEditorTab />
        {:else if activeTab === 'broadcast'}
            <BroadcastTab onBroadcast={handleBroadcast} />
        {:else if activeTab === 'players'}
            <PlayersTab {users} 
                onEdit={(u, mode) => { editingUser = u; editMode = mode; }} 
                onBanToggle={handleToggleBan} 
            />
        {/if}
    </div>

    {#if editingUser}
        <EditUserModal 
            user={editingUser} 
            mode={editMode} 
            {items} 
            onClose={() => editingUser = null} 
            onSave={handleSaveUser}
            onGiveItem={handleGiveItem}
        />
    {/if}

    <ConfirmDialog />
</div>

<style>
    .admin-panel-large {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) !important;
        width: 720px !important; height: 580px !important; max-width: 95vw !important; max-height: 90vh !important;
        z-index: 500; display: flex; flex-direction: column;
        background: #161512 !important;
        border: 3px solid #0a0a09 !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 80px rgba(0, 0, 0, 0.95) !important;
        font-family: 'IBM Plex Sans Thai', sans-serif !important;
        overflow: hidden !important;
    }

    .header-content {
        display: flex; flex-direction: column; gap: 2px;
    }
    .admin-title { color: #fbbf24; font-weight: 800; font-size: 1.4rem; text-shadow: 0 2px 8px rgba(0,0,0,0.6), 0 0 10px rgba(251, 191, 36, 0.2); }
    .motto-text { font-size: 0.6rem; color: #666; letter-spacing: 0.15em; text-transform: uppercase; min-height: 1.2em; display: flex; align-items: center; }
    .typing-cursor { animation: blink 1s infinite; color: #fbbf24; margin-left: 2px; font-weight: 400; }
    @keyframes blink { 0%, 50% { opacity: 0; } 51%, 100% { opacity: 1; } }

    .admin-nav-bar {
        display: flex; background: #111110; padding: 0.6rem 1.2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        align-items: center; justify-content: space-between;
    }
    .nav-tabs { display: flex; gap: 4px; }
    .nav-tab {
        background: #1a1917; border: 1px solid #222;
        color: #888; padding: 0.5rem 1.2rem; border-radius: 8px;
        cursor: pointer; display: flex; align-items: center; gap: 8px;
        font-size: 0.85rem; font-weight: 600; transition: all 0.2s;
    }
    .nav-tab:hover { background: #22211e; color: #ccc; }
    .nav-tab.active {
        background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.3);
        color: #fbbf24; box-shadow: 0 0 12px rgba(251, 191, 36, 0.08);
    }
    .btn-refresh {
        background: #1a1917; border: 1.5px solid #222; color: #666;
        width: 36px; height: 36px; border-radius: 10px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s; font-size: 1rem;
    }
    .btn-refresh:hover { background: #22211e; border-color: #fbbf24; color: #fbbf24; }
    .admin-body-scroll { flex: 1; overflow-y: auto; background: #131210; }

    :global(.admin-tab-content) { padding: 1.5rem; }
    :global(.no-padding) { padding: 0; }
    :global(.stats-grid) { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 1.5rem; }
    :global(.stat-card) {
        background: #1a1917; padding: 1.2rem; border-radius: 12px;
        display: flex; align-items: center; gap: 1.2rem;
        transition: all 0.2s; border: 1px solid #222;
    }
    :global(.stat-card:hover) { transform: translateY(-2px); background: #1f1e1b; border-color: rgba(251, 191, 36, 0.15); }
    :global(.stat-icon) {
        font-size: 1.8rem; min-width: 48px; height: 48px;
        background: rgba(0, 0, 0, 0.3); border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.04);
    }
    :global(.stat-info) { display: flex; flex-direction: column; }
    :global(.stat-label) { font-size: 0.75rem; color: #888; font-weight: 600; }
    :global(.stat-value) { font-size: 1.4rem; font-weight: 800; color: #fff; font-family: 'Inter', sans-serif; }
    :global(.stat-value.gold) { color: #fbbf24; }
    :global(.status-online) { color: #4ade80; }

    :global(.admin-info-box) { background: #1a1917; border-left: 3px solid #fbbf24; padding: 1rem 1.2rem; border-radius: 8px; margin-top: 1.2rem; }
    :global(.admin-info-box h5) { color: #fbbf24; margin-bottom: 0.4rem; font-weight: 700; }
    :global(.admin-info-box p) { font-size: 0.85rem; color: #888; margin: 0; }

    :global(.broadcast-container) { max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.2rem; }
    :global(.admin-textarea) {
        background: #0f0f0e; border: 1.5px solid #222; border-radius: 10px;
        padding: 1rem; color: #fff; height: 150px; resize: none;
        font-family: inherit; outline: none; transition: border-color 0.2s;
    }
    :global(.admin-textarea:focus) { border-color: #fbbf24; }
    :global(.btn-primary-gold) {
        background: linear-gradient(180deg, #fde047, #d97706); color: #000;
        border: none; padding: 0.8rem; border-radius: 10px;
        font-weight: 700; cursor: pointer; transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
    }
    :global(.btn-primary-gold:hover) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(251, 191, 36, 0.3); }
    :global(.full-width) { width: 100%; }

    :global(.table-scroll) { max-height: 400px; overflow-y: auto; }
    :global(.drami-admin-table) { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    :global(.drami-admin-table th) {
        text-align: left; padding: 1rem; background: #0a0a09;
        color: #888; font-weight: 700; position: sticky; top: 0;
        border-bottom: 1px solid #1a1a1a;
    }
    :global(.drami-admin-table td) { padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.02); }
    :global(.drami-admin-table tr:hover td) { background: rgba(251, 191, 36, 0.03); }

    :global(.player-cell) { display: flex; flex-direction: column; gap: 2px; }
    :global(.p-name) { font-weight: 700; color: #fff; }
    :global(.role-chip) { padding: 3px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    :global(.role-chip.admin) { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
    :global(.role-chip.member) { background: rgba(96, 165, 250, 0.1); color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.2); }
    :global(.role-chip.banned) { background: rgba(248, 113, 113, 0.1); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.2); }

    :global(.stat-pill-group) { display: flex; gap: 6px; }
    :global(.stat-pill) { background: #1a1917; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; border: 1px solid #222; }
    :global(.stat-pill.lv) { color: #a78bfa; }
    :global(.stat-pill.gold) { color: #fbbf24; }

    :global(.action-btn-group) { display: flex; gap: 6px; }
    :global(.action-mini) {
        background: #1a1917; border: 1.5px solid #222; color: #888;
        width: 34px; height: 34px; border-radius: 8px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s;
    }
    :global(.action-mini:hover) { background: #22211e; border-color: #fbbf24; color: #fbbf24; }

    :global(.admin-modal-backdrop) { position: absolute; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(6px); z-index: 600; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    :global(.admin-edit-modal) {
        background: #161512; border: 3px solid #0a0a09; border-radius: 16px;
        width: 100%; max-width: 480px; display: flex; flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9); overflow: hidden;
        max-height: 90vh; /* Don't let it exceed screen */
    }
    :global(.modal-header) { padding: 1.2rem 1.5rem; background: #000; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    :global(.modal-header h4) { color: #fbbf24; margin: 0; font-size: 1.2rem; font-weight: 800; }
    :global(.modal-body) { 
        padding: 1.5rem; 
        display: flex; 
        flex-direction: column; 
        gap: 1.5rem; 
        overflow-y: auto; /* Make body scrollable */
        max-height: 400px; /* Limit height of content area */
    }
    :global(.admin-field-grid) { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    :global(.field-item) { display: flex; flex-direction: column; gap: 6px; }
    :global(.field-item label) { font-size: 0.8rem; color: #888; font-weight: 600; }
    :global(.admin-input), :global(.admin-select) {
        background: #0f0f0e; border: 1.5px solid #222; border-radius: 8px;
        padding: 0.7rem; color: #fff; outline: none; transition: border-color 0.2s;
    }
    :global(.admin-select:focus) { border-color: #fbbf24; box-shadow: 0 0 10px rgba(251, 191, 36, 0.1); }
    :global(.item-gift-box) { 
        background: #111110; 
        padding: 1.5rem; 
        border-radius: 12px; 
        border: 1px solid #222;
        box-shadow: inset 0 2px 15px rgba(0,0,0,0.4);
    }
    :global(.item-gift-box label) {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #fbbf24;
        font-weight: 700;
        margin-bottom: 12px;
        text-transform: uppercase;
        font-size: 0.85rem;
    }
    :global(.gift-row) { display: flex; gap: 10px; margin-top: 10px; }
    :global(.btn-gift) { 
        background: linear-gradient(180deg, #60a5fa, #2563eb); 
        color: #fff; 
        border: none; 
        padding: 0 1.5rem; 
        border-radius: 8px; 
        font-weight: 700; 
        cursor: pointer; 
        transition: all 0.2s;
        box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
    }
    :global(.btn-gift:hover) { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3); }
    :global(.modal-footer) { padding: 1.5rem; display: flex; gap: 12px; background: #0a0a09; flex-shrink: 0; }
    :global(.btn-secondary) { flex: 1; padding: 0.8rem; border-radius: 10px; background: #1a1917; color: #fff; border: 1.5px solid #222; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    :global(.btn-secondary:hover) { background: #22211e; border-color: #fbbf24; }

    .fade-in { animation: fadeIn 0.25s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, calc(-50% + 15px)); } to { opacity: 1; transform: translate(-50%, -50%); } }

    .spinner-sm {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(251, 191, 36, 0.1);
        border-top: 2px solid #fbbf24;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
</style>
