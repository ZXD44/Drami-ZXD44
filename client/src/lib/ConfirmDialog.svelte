<script lang="ts">
    import { currentConfirm } from './game-ui';
    import { fly, fade } from 'svelte/transition';

    function close() {
        $currentConfirm = null;
    }

    function handleConfirm() {
        if ($currentConfirm?.onConfirm) {
            $currentConfirm.onConfirm();
        }
        close();
    }

    function handleCancel() {
        if ($currentConfirm?.onCancel) {
            $currentConfirm.onCancel();
        }
        close();
    }
</script>

{#if $currentConfirm}
<div class="confirm-overlay {$currentConfirm.type || 'warning'}" transition:fade={{ duration: 200 }} role="button" tabindex="0" onclick={(e) => { if (e.target === e.currentTarget) handleCancel() }} onkeydown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) handleCancel() }}>
    <div class="confirm-box" transition:fly={{ y: 20, duration: 300 }}>
        <div class="confirm-icon-outer {$currentConfirm.type || 'warning'}">
            <div class="confirm-icon-inner">
                {#if $currentConfirm.type === 'danger' || $currentConfirm.type === 'warning'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                {:else if $currentConfirm.type === 'info'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                {:else if $currentConfirm.type === 'success'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                {/if}
            </div>
            <div class="icon-pulse"></div>
        </div>

        <div class="confirm-content">
            <h2 class="confirm-title">{$currentConfirm.title || 'ยืนยันการดำเนินการ'}</h2>
            <p class="confirm-message">{$currentConfirm.message}</p>
        </div>

        <div class="confirm-actions">
            <button class="btn-cancel" onclick={handleCancel}>
                {$currentConfirm.cancelText || 'ยกเลิก'}
            </button>
            <button class="btn-confirm {$currentConfirm.type || 'warning'}" onclick={handleConfirm}>
                {$currentConfirm.confirmText || 'ยืนยัน'}
            </button>
        </div>
    </div>
</div>
{/if}

<style>
    .confirm-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        font-family: 'IBM Plex Sans Thai', sans-serif;
    }

    .confirm-box {
        background: #161512;
        border: 3px solid #0a0a09;
        border-radius: 20px;
        width: 100%;
        max-width: 420px;
        padding: 2.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 30px 100px rgba(0, 0, 0, 0.95);
        position: relative;
        overflow: hidden;
    }

    .confirm-icon-outer {
        position: relative;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
    }

    .confirm-icon-inner {
        width: 70px;
        height: 70px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.2rem;
        z-index: 2;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .icon-pulse {
        position: absolute;
        inset: 0;
        border-radius: 20px;
        z-index: 1;
        animation: pulse 2s infinite;
    }

    /* Types */
    .warning .confirm-icon-inner { background: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.2); }
    .warning .icon-pulse { background: rgba(251, 191, 36, 0.15); }
    
    .danger .confirm-icon-inner { background: rgba(248, 113, 113, 0.08); border-color: rgba(248, 113, 113, 0.2); }
    .danger .icon-pulse { background: rgba(248, 113, 113, 0.15); }

    .info .confirm-icon-inner { background: rgba(96, 165, 250, 0.08); border-color: rgba(96, 165, 250, 0.2); }
    .info .icon-pulse { background: rgba(96, 165, 250, 0.15); }

    .success .confirm-icon-inner { background: rgba(52, 211, 153, 0.08); border-color: rgba(52, 211, 153, 0.2); }
    .success .icon-pulse { background: rgba(52, 211, 153, 0.15); }

    .svg-icon {
        width: 34px;
        height: 34px;
    }

    .warning .svg-icon { color: #fbbf24; filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.4)); }
    .danger .svg-icon { color: #f87171; filter: drop-shadow(0 0 10px rgba(248, 113, 113, 0.4)); }
    .info .svg-icon { color: #60a5fa; filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.4)); }
    .success .svg-icon { color: #34d399; filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.4)); }

    @keyframes pulse {
        0% { transform: scale(0.8); opacity: 0.6; }
        100% { transform: scale(1.5); opacity: 0; }
    }

    .confirm-title {
        color: #fff;
        font-size: 1.4rem;
        font-weight: 800;
        margin: 0 0 0.8rem 0;
        letter-spacing: -0.01em;
    }

    .danger .confirm-title { color: #f87171; }
    .warning .confirm-title { color: #fbbf24; }
    .info .confirm-title { color: #60a5fa; }
    .success .confirm-title { color: #34d399; }

    .confirm-message {
        color: #888;
        font-size: 1rem;
        line-height: 1.6;
        margin: 0 0 2rem 0;
        white-space: pre-line;
        font-weight: 500;
    }

    .confirm-actions {
        width: 100%;
        display: flex;
        gap: 1rem;
    }

    .btn-cancel, .btn-confirm {
        flex: 1;
        padding: 0.9rem 1rem;
        border-radius: 12px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
    }

    .btn-cancel {
        background: #1a1917;
        color: #888;
        border: 1.5px solid #222;
    }

    .btn-cancel:hover {
        background: #22211e;
        color: #fff;
        border-color: #333;
        transform: translateY(-2px);
    }

    .btn-confirm.warning {
        background: linear-gradient(180deg, #fbbf24, #d97706);
        color: #000;
        box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3);
    }

    .btn-confirm.danger {
        background: linear-gradient(180deg, #f87171, #dc2626);
        color: #fff;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
    }

    .btn-confirm.info {
        background: linear-gradient(180deg, #60a5fa, #2563eb);
        color: #fff;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    }

    .btn-confirm.success {
        background: linear-gradient(180deg, #34d399, #059669);
        color: #fff;
        box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
    }

    .btn-confirm:hover {
        transform: translateY(-2px);
        filter: brightness(1.1);
    }

    .btn-confirm:active {
        transform: translateY(1px);
    }
</style>
