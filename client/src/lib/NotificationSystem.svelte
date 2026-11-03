<script lang="ts">
    import { notifications } from './game-ui';
    import { flip } from 'svelte/animate';
    import { fly } from 'svelte/transition';

    const icons = {
        general: '⌨️',
        info: 'ℹ️',
        success: '✅',
        error: '🚨',
        warning: '⚠️'
    };
</script>

<div class="notifications-container">
    {#each $notifications as notif (notif.id)}
        <div 
            class="notification {notif.type}" 
            animate:flip={{ duration: 300 }}
            transition:fly={{ x: 100, duration: 300 }}
        >
            <div class="notif-accent"></div>
            <div class="notif-content">
                <div class="notif-header">
                    <span class="notif-icon">{icons[notif.type]}</span>
                    <span class="notif-label">{notif.type.toUpperCase()}</span>
                </div>
                <div class="notif-message">{notif.message}</div>
            </div>
        </div>
    {/each}
</div>

<style>
    .notifications-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        pointer-events: none;
        width: 320px;
    }

    .notification {
        position: relative;
        background: #1a1b1e;
        border-radius: 8px;
        display: flex;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        overflow: hidden;
        pointer-events: auto;
        min-height: 70px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
    }

    .notif-accent {
        width: 6px;
        flex-shrink: 0;
    }

    .notif-content {
        padding: 0.8rem 1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        background: linear-gradient(90deg, rgba(255,255,255,0.02), transparent);
    }

    .notif-header {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .notif-label {
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 1px;
        opacity: 0.9;
    }

    .notif-message {
        font-size: 0.9rem;
        color: #f4e8c1;
        line-height: 1.4;
    }

    .info .notif-accent { background: #3498db; }
    .info .notif-label { color: #3498db; }
    
    .success .notif-accent { background: #5cb85c; }
    .success .notif-label { color: #5cb85c; }
    
    .error .notif-accent { background: #e74c3c; }
    .error .notif-label { color: #e74c3c; }
    
    .warning .notif-accent { background: #f1c40f; }
    .warning .notif-label { color: #f1c40f; }
    
    .general .notif-accent { background: #95a5a6; }
    .general .notif-label { color: #95a5a6; }
</style>
