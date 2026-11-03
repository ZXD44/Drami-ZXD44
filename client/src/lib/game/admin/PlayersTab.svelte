<script lang="ts">
    import type { User } from "../admin/adminService";

    let { users, onEdit, onBanToggle } = $props<{ 
        users: User[], 
        onEdit: (u: User, mode: "basic" | "advanced") => void, 
        onBanToggle: (u: User) => void 
    }>();
</script>

<div class="admin-tab-content no-padding fade-in">
    <div class="table-scroll">
        <table class="drami-admin-table">
            <thead>
                <tr>
                    <th>นักผจญภัย</th>
                    <th>สถานะ</th>
                    <th>ข้อมูลตัวละคร</th>
                    <th>จัดการ</th>
                </tr>
            </thead>
            <tbody>
                {#each users as user}
                    <tr>
                        <td>
                            <div class="player-cell">
                                <span class="p-name">{user.username} {user.isBanned ? '🚫' : ''}</span>
                            </div>
                        </td>
                        <td>
                            <span class="role-chip {user.isBanned ? 'banned' : user.role}">
                                {user.isBanned ? 'ถูกระงับ' : (user.role === 'admin' ? 'ผู้ดูแล' : 'สมาชิก')}
                            </span>
                        </td>
                        <td>
                            <div class="stat-pill-group">
                                <span class="stat-pill lv">Lv.{user.level}</span>
                                <span class="stat-pill gold">{user.gold}G</span>
                                <span class="stat-pill" style="color: #60a5fa; background: rgba(96, 165, 250, 0.15);">{user.diamonds || 0}D</span>
                            </div>
                        </td>
                        <td>
                            <div class="action-btn-group">
                                <button class="action-mini extreme" onclick={() => onEdit(user, "advanced")} title="ข้อมูลส่วนตัว/บัญชี">!</button>
                                <button class="action-mini edit" onclick={() => onEdit(user, "basic")} title="แก้ไขค่าพลังตัวละคร">⚙️</button>
                                <button class="action-mini {user.isBanned ? 'unban' : 'ban'}" onclick={() => onBanToggle(user)} title={user.isBanned ? 'ปลดแบน' : 'แบน'}>
                                    {user.isBanned ? '✔️' : '🚫'}
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
