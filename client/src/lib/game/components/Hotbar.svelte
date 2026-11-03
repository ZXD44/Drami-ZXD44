<script lang="ts">
    import { playerSummary, hpRatio, mpRatio, staminaRatio, expRatio, hotbarSkills, selectedSlot } from "$lib/game-ui";

    let {
        showEmoji = $bindable(),
        sendEmoji,
        togglePanel
    } = $props<{
        showEmoji: boolean;
        sendEmoji: (emoji: string) => void;
        togglePanel: (panel: string) => void;
    }>();
</script>

<div class="hotbar-wrapper">
    {#if showEmoji}
        <div class="emoji-picker fade-in">
            {#each ['😄', '😂', '😎', '😡', '😭', '❤️', '🔥', '💀', '⚔️', '👋', '🎉', '💩'] as emoji}
                <button class="emoji-btn" onclick={() => sendEmoji(emoji)}>{emoji}</button>
            {/each}
        </div>
    {/if}

    <!-- New High-Quality EXP Bar -->
    <div class="hotbar-exp-container">
        <div class="hotbar-exp-bar-wrapper" title="EXP {$playerSummary.exp.current}/{$playerSummary.exp.max}">
            <div class="hotbar-exp-bar-fill" style="width: {$expRatio}%;"></div>
            <div class="hotbar-exp-text">{$expRatio}%</div>
        </div>
    </div>

    <div class="hotbar-main">
        <!-- Left: Chat & Emoji -->
        <div class="hotbar-side hotbar-left">
            <button class="hotbar-icon-btn" title="แชท (C)" onclick={() => togglePanel('chat')}>
                💬
                <span class="hotbar-skill-key">C</span>
            </button>
            <button class="hotbar-icon-btn" title="อิโมจิ (V)" onclick={() => togglePanel('emoji')} class:hotbar-skill-active={showEmoji}>
                {#if showEmoji}
                    <div style="transform: scale(1.2);">😄</div>
                {:else}
                    😄
                {/if}
                <span class="hotbar-skill-key">V</span>
            </button>
        </div>

        <!-- Center: 6 Skill Slots (Wider than before) -->
        <div class="hotbar-skills">
            {#each $hotbarSkills as slot, i}
                <button
                    class="hotbar-skill-slot"
                    class:hotbar-skill-active={$selectedSlot === i}
                    onclick={() => selectedSlot.set(i)}
                    title={slot.name}
                >
                    {#if slot.icon}
                        <span class="hotbar-skill-icon">{slot.icon}</span>
                    {:else}
                        <span class="hotbar-skill-empty"></span>
                    {/if}
                    {#if slot.key}
                        <span class="hotbar-skill-key">{slot.key}</span>
                    {/if}
                </button>
            {/each}
        </div>

        <!-- Right: Inventory, Menu, etc. -->
        <div class="hotbar-side hotbar-right" style="gap: 2px;">
            <button class="hotbar-bag-btn" title="กระเป๋า (B)" onclick={() => togglePanel('inventory')}>
                🎒
                <span class="hotbar-skill-key">B</span>
            </button>
            
            <button class="hotbar-icon-btn" onclick={() => togglePanel('mainMenu')} title="เมนูควบคุม (Tab)">
                <div class="btn-menu-center"><span></span><span></span><span></span></div>
                <span class="hotbar-skill-key">Tab</span>
            </button>

            <button class="hotbar-icon-btn" title="พาหนะ">
                🐴
            </button>
        </div>
    </div>
</div>
