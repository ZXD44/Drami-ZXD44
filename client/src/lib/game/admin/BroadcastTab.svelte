<script lang="ts">
    let { onBroadcast } = $props<{ onBroadcast: (msg: string) => Promise<void> }>();
    let broadcastMsg = $state("");

    async function handleSend() {
        if (!broadcastMsg.trim()) return;
        await onBroadcast(broadcastMsg);
        broadcastMsg = "";
    }
</script>

<div class="admin-tab-content fade-in">
    <div class="broadcast-container">
        <div class="broadcast-hero">
            <div class="broadcast-title-row">
                <span class="broadcast-icon-sm">📢</span>
                <h3 class="broadcast-title">ส่งประกาศเซิร์ฟเวอร์</h3>
            </div>
            <p class="broadcast-desc">ข้อความจะแสดงเป็นตัววิ่งบนหน้าจอผู้เล่นทุกคน</p>
        </div>
        <textarea 
            bind:value={broadcastMsg} 
            placeholder="พิมพ์ข้อความที่นี่..." 
            class="admin-textarea broadcast-textarea"
        ></textarea>
        <button class="btn-primary-gold full-width broadcast-send-btn" onclick={handleSend}>
            📡 ส่งประกาศทันที
        </button>
    </div>
</div>

<style>
    .broadcast-container {
        max-width: 440px;
        margin: 0 auto;
        padding-top: 1rem;
    }
    .broadcast-hero {
        text-align: center;
        margin-bottom: 1rem;
    }
    .broadcast-title-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 4px;
    }
    .broadcast-icon-sm {
        font-size: 1.5rem;
        filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.3));
    }
    .broadcast-title {
        color: #fbbf24;
        font-size: 1.1rem;
        font-weight: 800;
        margin: 0;
    }
    .broadcast-desc {
        color: #555;
        font-size: 0.75rem;
        margin: 0;
    }
    :global(.broadcast-textarea) {
        text-align: center !important;
        font-size: 0.95rem !important;
        font-weight: 600 !important;
        color: #fbbf24 !important;
        height: 80px !important;
        margin-bottom: 1rem !important;
    }
    :global(.broadcast-send-btn) {
        font-size: 0.9rem !important;
        padding: 0.8rem !important;
    }
</style>
