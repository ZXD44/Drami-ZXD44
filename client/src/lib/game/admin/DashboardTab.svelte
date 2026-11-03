<script lang="ts">
    import type { AdminStats } from "../admin/adminService";

    let { stats } = $props<{ stats: AdminStats }>();

    function spawnGuest() {
        window.open('/game?guest_id=' + Math.floor(Math.random() * 99999), '_blank');
    }
</script>

<div class="admin-tab-content fade-in">
    <div class="stats-grid">
        <div class="stat-card gold-border">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
                <span class="stat-label">ผู้เล่นทั้งหมด</span>
                <span class="stat-value">{stats.totalUsers}</span>
            </div>
        </div>
        <div class="stat-card gold-border">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
                <span class="stat-label">ทองรวมทั้งเซิร์ฟ</span>
                <span class="stat-value gold">{stats.totalGold.toLocaleString()} G</span>
            </div>
        </div>
        <div class="stat-card gold-border">
            <div class="stat-icon">💎</div>
            <div class="stat-info">
                <span class="stat-label">เพชรรวมทั้งเซิร์ฟ</span>
                <span class="stat-value" style="color: #60a5fa;">{stats.totalDiamonds?.toLocaleString() || 0} D</span>
            </div>
        </div>
        <div class="stat-card gold-border">
            <div class="stat-icon">🌐</div>
            <div class="stat-info">
                <span class="stat-label">สถานะระบบ</span>
                <span class="stat-value status-online">ปกติ</span>
            </div>
        </div>
    </div>

    <div class="admin-actions-row" style="margin-bottom: 5px; display: flex; gap: 1rem;">
        <button class="btn-primary-gold" onclick={spawnGuest} style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            <span style="font-weight: 800; letter-spacing: 0.5px;">จำลองผู้เล่น Guest (เปิดแท็บใหม่)</span>
        </button>
    </div>

    <div class="admin-info-box">
        <h5>ยินดีต้อนรับ ผู้ดูแลระบบ</h5>
        <p>ที่นี่คือส่วนสำหรับจัดการข้อมูลพื้นฐานและความเคลื่อนไหวของเซิร์ฟเวอร์ กรุณาดำเนินการด้วยความระมัดระวัง</p>
    </div>
</div>
