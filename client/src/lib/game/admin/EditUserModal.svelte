<script lang="ts">
    import type { User } from "../admin/adminService";

    let { 
        user, 
        mode, 
        items, 
        onClose, 
        onSave, 
        onGiveItem 
    } = $props<{ 
        user: User, 
        mode: "basic" | "advanced", 
        items: any[],
        onClose: () => void,
        onSave: (data: any) => Promise<void>,
        onGiveItem: (itemId: string, amount: number) => Promise<void>
    }>();

    // Local form state
    let editRole = $state(user.role);
    let editLevel = $state(user.level);
    let editGold = $state(user.gold);
    let editDiamonds = $state(user.diamonds || 0);
    let editExp = $state(user.exp || 0);
    let editEmail = $state(user.email || "");
    let editPassword = $state("");
    let selectedItemId = $state("");
    let giveAmount = $state(1);

    function handleSave() {
        onSave({
            role: editRole,
            level: editLevel,
            gold: editGold,
            diamonds: editDiamonds,
            exp: editExp,
            email: editEmail,
            password: editPassword
        });
    }
</script>

<div class="admin-modal-backdrop">
    <div class="admin-edit-modal fade-in">
        <div class="modal-header">
            <h4>
                {#if mode === 'advanced'}
                    🔐 จัดการบัญชี: {user.username}
                {:else}
                    🛠️ ปรับค่าพลัง: {user.username}
                {/if}
            </h4>
            <button class="btn-close-modal" onclick={onClose}>✕</button>
        </div>
        
        <div class="modal-body">
            {#if mode === 'advanced'}
                <div class="admin-field-grid">
                    <div class="field-item full-span">
                        <label for="admin-uid">Unique ID</label>
                        <input id="admin-uid" type="text" value={user.id} class="admin-input read-only" readonly />
                    </div>
                    <div class="field-item">
                        <label for="admin-uname">ชื่อผู้เล่น</label>
                        <input id="admin-uname" type="text" value={user.username} class="admin-input read-only" readonly />
                    </div>
                    <div class="field-item">
                        <label for="admin-email">อีเมล</label>
                        <input id="admin-email" type="email" bind:value={editEmail} class="admin-input" />
                    </div>
                    <div class="field-item full-span">
                        <label for="admin-pass">Reset Password</label>
                        <input id="admin-pass" type="password" bind:value={editPassword} class="admin-input" placeholder="พิมพ์รหัสใหม่..." />
                    </div>
                </div>
            {:else}
                <div class="admin-field-grid">
                    <div class="field-item">
                        <label for="admin-role">🔑 ระดับสิทธิ์ (Role)</label>
                        <select id="admin-role" bind:value={editRole} class="admin-select">
                            <option value="member">MEMBER</option>
                            <option value="admin">ADMIN</option>
                        </select>
                    </div>
                    <div class="field-item">
                        <label for="admin-level">⚔️ เลเวล</label>
                        <input id="admin-level" type="number" bind:value={editLevel} class="admin-input" />
                    </div>
                    <div class="field-item">
                        <label for="admin-gold">💰 ทอง (Gold)</label>
                        <input id="admin-gold" type="number" bind:value={editGold} class="admin-input gold-text" />
                    </div>
                    <div class="field-item">
                        <label for="admin-diamonds">💎 เพชร (Diamonds)</label>
                        <input id="admin-diamonds" type="number" bind:value={editDiamonds} class="admin-input diamond-text" />
                    </div>
                    <div class="field-item full-span">
                        <label for="admin-exp">✨ ค่าประสบการณ์ (EXP)</label>
                        <input id="admin-exp" type="number" bind:value={editExp} class="admin-input" />
                    </div>
                </div>

                <div class="item-gift-box">
                    <label for="admin-gift">🎁 เสกไอเทมเข้ากระเป๋า</label>
                    <div class="gift-row">
                        <select id="admin-gift" bind:value={selectedItemId} class="admin-select flex-1">
                            <option value="">— เลือกคลังไอเทม —</option>
                            {#each items as item}
                                <option value={item.id}>{item.name}</option>
                            {/each}
                        </select>
                        <input type="number" class="admin-input quantity" style="width: 80px" bind:value={giveAmount} />
                        <button class="btn-gift" onclick={() => onGiveItem(selectedItemId, giveAmount)}>ส่ง</button>
                    </div>
                </div>
            {/if}
        </div>

        <div class="modal-footer">
            <button class="btn-secondary" onclick={onClose}>ยกเลิก</button>
            <button class="btn-primary-gold" onclick={handleSave}>บันทึก</button>
        </div>
    </div>
</div>
