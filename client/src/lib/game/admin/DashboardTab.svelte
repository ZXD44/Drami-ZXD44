<script lang="ts">
    import type { AdminStats } from "../admin/adminService";
    import Icon from "../components/Icon.svelte";

    let { stats } = $props<{ stats: AdminStats }>();

    function spawnGuest() {
        window.open('/game?guest_id=' + Math.floor(Math.random() * 99999), '_blank');
    }
</script>

<div class="dashboard-compact fade-in">
    <!-- Stat 4 Cards Row -->
    <div class="stats-mini-grid">
        <div class="stat-mini-card">
            <div class="stat-icon-wrap" style="color: #fcd34d; background: rgba(251, 191, 36, 0.15);">
                <Icon name="users" size={20} color="#fcd34d" />
            </div>
            <div class="stat-meta">
                <span class="stat-title">ผู้เล่นทั้งหมด</span>
                <span class="stat-figure">{stats.totalUsers}</span>
            </div>
        </div>

        <div class="stat-mini-card">
            <div class="stat-icon-wrap" style="color: #f59e0b; background: rgba(245, 158, 11, 0.15);">
                <Icon name="gold" size={20} color="#f59e0b" />
            </div>
            <div class="stat-meta">
                <span class="stat-title">ทองรวมทั้งเซิร์ฟ</span>
                <span class="stat-figure gold">{stats.totalGold.toLocaleString()} G</span>
            </div>
        </div>

        <div class="stat-mini-card">
            <div class="stat-icon-wrap" style="color: #60a5fa; background: rgba(96, 165, 250, 0.15);">
                <Icon name="diamond" size={20} color="#60a5fa" />
            </div>
            <div class="stat-meta">
                <span class="stat-title">เพชรรวมทั้งเซิร์ฟ</span>
                <span class="stat-figure diamond">{stats.totalDiamonds?.toLocaleString() || 0} D</span>
            </div>
        </div>

        <div class="stat-mini-card">
            <div class="stat-icon-wrap" style="color: #10b981; background: rgba(16, 185, 129, 0.15);">
                <Icon name="ping" size={20} color="#10b981" />
            </div>
            <div class="stat-meta">
                <span class="stat-title">สถานะระบบ</span>
                <span class="stat-figure online">ปกติ (Online)</span>
            </div>
        </div>
    </div>

    <!-- Quick Server Control Hub -->
    <div class="server-control-hub">
        <div class="control-card">
            <div class="control-header">
                <Icon name="users" size={15} color="#38bdf8" />
                <span>Sandbox / การทดสอบระบบ</span>
            </div>
            <p class="control-desc">เปิดหน้าต่างใหม่ในโหมด Guest เพื่อทดสอบการเล่นหลายผู้เล่น (Multiplayer Session)</p>
            <button class="btn-gold-action" onclick={spawnGuest}>
                <Icon name="sparkles" size={14} color="#451a03" />
                <span>จำลองผู้เล่น Guest (เปิดแท็บใหม่)</span>
            </button>
        </div>

        <div class="control-card">
            <div class="control-header">
                <Icon name="shield" size={15} color="#10b981" />
                <span>DramiShield Security Status</span>
            </div>
            <div class="shield-badges">
                <span class="shield-tag active">Anti-Teleport: ON</span>
                <span class="shield-tag active">Chat Sanitizer: ON</span>
                <span class="shield-tag active">Anti-DevTools: ON</span>
            </div>
            <p class="control-desc" style="margin-top: 6px;">ระบบรักษาความปลอดภัยฝั่งเซิร์ฟเวอร์พร้อมดักจับการดัดแปลงและ Snapback ผู้เล่นทันที</p>
        </div>
    </div>
</div>

<style>
    .dashboard-compact {
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: 100%;
    }

    .stats-mini-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
    }

    .stat-mini-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 8px 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .stat-icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .stat-meta {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .stat-title {
        font-size: 0.7rem;
        color: #94a3b8;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .stat-figure {
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        color: #f8fafc;
        white-space: nowrap;
    }
    .stat-figure.gold { color: #fcd34d; }
    .stat-figure.diamond { color: #60a5fa; }
    .stat-figure.online { color: #34d399; font-size: 0.85rem; }

    /* Control Hub */
    .server-control-hub {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        flex: 1;
    }

    .control-card {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .control-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 700;
        color: #f1f5f9;
        margin-bottom: 4px;
    }

    .control-desc {
        font-size: 0.75rem;
        color: #94a3b8;
        line-height: 1.4;
        margin: 0;
    }

    .btn-gold-action {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: linear-gradient(180deg, #fde047 0%, #eab308 100%);
        border: none;
        border-radius: 6px;
        padding: 8px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #451a03;
        cursor: pointer;
        margin-top: 10px;
        transition: all 0.15s ease;
    }

    .btn-gold-action:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
    }

    .shield-badges {
        display: flex;
        gap: 6px;
        margin-top: 6px;
    }

    .shield-tag {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
    }
    .shield-tag.active {
        background: rgba(16, 185, 129, 0.18);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.35);
    }

    @media (max-width: 768px) {
        .stats-mini-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        .server-control-hub {
            grid-template-columns: 1fr;
        }
    }
</style>