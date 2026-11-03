<script lang="ts">
    import type { User } from "../admin/adminService";
    import Icon from "../components/Icon.svelte";

    let { users, onEdit, onBanToggle } = $props<{ 
        users: User[], 
        onEdit: (u: User, mode: "basic" | "advanced") => void, 
        onBanToggle: (u: User) => void 
    }>();

    let searchTerm = $state("");

    let filteredUsers = $derived(
        users.filter(u => 
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );
</script>

<div class="players-compact fade-in">
    <!-- Search and Count Bar -->
    <div class="players-top-filter">
        <div class="search-box">
            <Icon name="zoom" size={13} color="#94a3b8" />
            <input 
                type="text" 
                placeholder="ค้นหาชื่อผู้เล่น หรือ อีเมล..." 
                bind:value={searchTerm}
                class="search-input"
            />
        </div>
        <div class="count-tag">
            <span>แสดง {filteredUsers.length} / {users.length} คน</span>
        </div>
    </div>

    <div class="players-table-scroll">
        <table class="lux-table">
            <thead>
                <tr>
                    <th>ผู้เล่น</th>
                    <th>สิทธิ์</th>
                    <th>เลเวล</th>
                    <th>ทอง / เพชร</th>
                    <th style="text-align: right;">จัดการ</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredUsers as user}
                    <tr class:banned-row={user.isBanned}>
                        <td>
                            <div class="user-meta-cell">
                                <span class="user-name">
                                    {user.username}
                                    {#if user.isBanned}<span class="banned-indicator">BANNED</span>{/if}
                                </span>
                                {#if user.email}
                                    <span class="user-sub">{user.email}</span>
                                {/if}
                            </div>
                        </td>
                        <td>
                            <span class="role-pill {user.role}">
                                {user.role === 'admin' ? 'แอดมิน' : 'สมาชิก'}
                            </span>
                        </td>
                        <td>
                            <span class="lv-badge">Lv.{user.level}</span>
                        </td>
                        <td>
                            <div class="currency-cell">
                                <span class="gold-text"><Icon name="gold" size={12} color="#f59e0b" /> {user.gold}</span>
                                <span class="diamond-text"><Icon name="diamond" size={12} color="#60a5fa" /> {user.diamonds || 0}</span>
                            </div>
                        </td>
                        <td>
                            <div class="action-btns-cell">
                                <button class="action-btn edit" onclick={() => onEdit(user, "basic")} title="ปรับค่าพลัง/เสกไอเทม">
                                    <Icon name="settings" size={12} />
                                    <span>ปรับค่า</span>
                                </button>
                                <button class="action-btn info" onclick={() => onEdit(user, "advanced")} title="รีเซ็ตรหัสผ่าน/ข้อมูล">
                                    <Icon name="key" size={12} />
                                    <span>รหัสผ่าน</span>
                                </button>
                                <button class="action-btn {user.isBanned ? 'unban' : 'ban'}" onclick={() => onBanToggle(user)} title={user.isBanned ? 'ปลดแบน' : 'ระงับการใช้งาน'}>
                                    <Icon name={user.isBanned ? 'check' : 'ban'} size={12} />
                                    <span>{user.isBanned ? 'ปลด' : 'แบน'}</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .players-compact {
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;
        overflow: hidden;
    }

    .players-top-filter {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .search-box {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 4px 8px;
    }

    .search-input {
        background: transparent;
        border: none;
        outline: none;
        color: #f1f5f9;
        font-size: 0.78rem;
        width: 100%;
    }

    .search-input::placeholder {
        color: #64748b;
    }

    .count-tag {
        font-size: 0.72rem;
        color: #94a3b8;
        white-space: nowrap;
    }

    .players-table-scroll {
        flex: 1;
        overflow-y: auto;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        max-height: 380px;
    }

    .players-table-scroll::-webkit-scrollbar {
        width: 4px;
    }

    .players-table-scroll::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
    }

    .lux-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.78rem;
    }

    .lux-table th {
        text-align: left;
        padding: 8px 10px;
        background: rgba(15, 23, 42, 0.95);
        color: #94a3b8;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 2;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .lux-table td {
        padding: 6px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        color: #e2e8f0;
    }

    .lux-table tr:hover td {
        background: rgba(251, 191, 36, 0.04);
    }

    .banned-row td {
        opacity: 0.6;
        background: rgba(239, 68, 68, 0.05);
    }

    .user-meta-cell {
        display: flex;
        flex-direction: column;
    }

    .user-name {
        font-weight: 600;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .banned-indicator {
        font-size: 0.55rem;
        font-weight: 700;
        background: rgba(239, 68, 68, 0.25);
        color: #fca5a5;
        padding: 1px 4px;
        border-radius: 3px;
    }

    .user-sub {
        font-size: 0.68rem;
        color: #64748b;
    }

    .role-pill {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
    }
    .role-pill.admin {
        background: rgba(251, 191, 36, 0.18);
        color: #fcd34d;
        border: 1px solid rgba(251, 191, 36, 0.35);
    }
    .role-pill.member {
        background: rgba(148, 163, 184, 0.12);
        color: #cbd5e1;
    }

    .lv-badge {
        font-family: monospace;
        font-weight: 700;
        color: #38bdf8;
    }

    .currency-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: monospace;
    }

    .gold-text {
        color: #fcd34d;
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }

    .diamond-text {
        color: #60a5fa;
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }

    .action-btns-cell {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
    }

    .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 3px 6px;
        border-radius: 4px;
        font-size: 0.68rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.15s ease;
    }

    .action-btn.edit {
        background: rgba(251, 191, 36, 0.12);
        color: #fcd34d;
        border-color: rgba(251, 191, 36, 0.25);
    }
    .action-btn.edit:hover {
        background: rgba(251, 191, 36, 0.25);
    }

    .action-btn.info {
        background: rgba(56, 189, 248, 0.12);
        color: #38bdf8;
        border-color: rgba(56, 189, 248, 0.25);
    }
    .action-btn.info:hover {
        background: rgba(56, 189, 248, 0.25);
    }

    .action-btn.ban {
        background: rgba(239, 68, 68, 0.15);
        color: #fca5a5;
        border-color: rgba(239, 68, 68, 0.3);
    }
    .action-btn.ban:hover {
        background: rgba(239, 68, 68, 0.35);
        color: #fff;
    }

    .action-btn.unban {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
    }
    .action-btn.unban:hover {
        background: rgba(16, 185, 129, 0.35);
        color: #fff;
    }
</style>