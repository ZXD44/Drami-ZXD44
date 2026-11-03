<script lang="ts">
    import type { User } from "../admin/adminService";
    import Icon from "../components/Icon.svelte";

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
                                <span class="p-name" style="display: inline-flex; align-items: center; gap: 4px;">
                                    {user.username} 
                                    {#if user.isBanned}<Icon name="ban" size={14} color="#f43f5e" />{/if}
                                </span>
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
                                <button class="action-mini extreme" onclick={() => onEdit(user, "advanced")} title="ข้อมูลส่วนตัว/บัญชี">
                                    <Icon name="key" size={13} />
                                </button>
                                <button class="action-mini edit" onclick={() => onEdit(user, "basic")} title="แก้ไขค่าพลังตัวละคร">
                                    <Icon name="settings" size={13} />
                                </button>
                                <button class="action-mini {user.isBanned ? 'unban' : 'ban'}" onclick={() => onBanToggle(user)} title={user.isBanned ? 'ปลดแบน' : 'แบน'}>
                                    <Icon name={user.isBanned ? 'check' : 'ban'} size={13} />
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
