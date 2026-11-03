<script lang="ts">
    import { chatFeed, activeChatTab } from "$lib/game-ui";
    import Icon from "../Icon.svelte";
    import { tick } from "svelte";

    let { showChat = $bindable(), chatInput = $bindable(), handleChatSend, handleChatKeydown } = $props<{ 
        showChat: boolean; 
        chatInput: string; 
        handleChatSend: () => void; 
        handleChatKeydown: (e: KeyboardEvent) => void; 
    }>();
    
    let chatMessagesEl: HTMLDivElement | undefined = $state();
    let isMinimized = $state(false);

    function switchChatTab(tab: string) { activeChatTab.set(tab); }

    const tabs = [
        { id: 'ทั้งหมด', label: 'ทั้งหมด', icon: 'chat' },
        { id: 'ท้องถิ่น', label: 'ท้องถิ่น', icon: 'map' },
        { id: 'กิลด์', label: 'กิลด์', icon: 'shield' },
        { id: 'ปาร์ตี้', label: 'ปาร์ตี้', icon: 'party' },
        { id: 'ระบบ', label: 'ระบบ', icon: 'horn' },
    ];

    // Scroll to bottom on updates
    $effect(() => {
        const _feed = $chatFeed;
        const _tab = $activeChatTab;
        
        tick().then(() => {
            if (chatMessagesEl) {
                chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight + 1000;
                setTimeout(() => {
                    if (chatMessagesEl) chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
                }, 10);
            }
        });
    });
</script>

<div class="hud-chat-premium fade-in" class:minimized={isMinimized}>
    <!-- Top Glass Header with Modern Channel Tabs -->
    <div class="chat-header-glass">
        <div class="chat-channel-tabs">
            {#each tabs as tab}
                <button
                    class="channel-tab-btn"
                    class:active={$activeChatTab === tab.id}
                    onclick={() => switchChatTab(tab.id)}
                >
                    <Icon name={tab.icon as any} size={11} color={$activeChatTab === tab.id ? '#fcd34d' : '#94a3b8'} />
                    <span>{tab.label}</span>
                </button>
            {/each}
        </div>
        
        <div class="chat-actions-top">
            <button class="chat-tool-btn" onclick={() => isMinimized = !isMinimized} title={isMinimized ? "ขยาย" : "ย่อ"}>
                <span class="minimize-line">{isMinimized ? "▲" : "▼"}</span>
            </button>
            <button class="chat-tool-btn close" onclick={() => showChat = false} title="ปิดแชท">
                <Icon name="close" size={12} color="#cbd5e1" />
            </button>
        </div>
    </div>

    <!-- Message Stream -->
    {#if !isMinimized}
        <div class="chat-messages-stream" bind:this={chatMessagesEl}>
            {#each $chatFeed as line}
                {@const shouldShow =
                    $activeChatTab === 'ทั้งหมด' ||
                    ($activeChatTab === 'ระบบ' && (line.includes('[ระบบ]') || line.includes('[ประกาศ]'))) ||
                    ($activeChatTab === 'ท้องถิ่น' && line.includes('[ท้องถิ่น]')) ||
                    ($activeChatTab === 'กิลด์' && line.includes('[กิลด์]')) ||
                    ($activeChatTab === 'ปาร์ตี้' && line.includes('[ปาร์ตี้]'))
                }
                {#if shouldShow}
                    <div class="chat-bubble-row">
                        {#if line.includes('[กิลด์]')}
                            <span class="badge-tag badge-guild">กิลด์</span>
                            <span class="bubble-body">{line.replace('[กิลด์]', '')}</span>
                        {:else if line.includes('[ปาร์ตี้]')}
                            <span class="badge-tag badge-party">ปาร์ตี้</span>
                            <span class="bubble-body">{line.replace('[ปาร์ตี้]', '')}</span>
                        {:else if line.includes('[ท้องถิ่น]')}
                            <span class="badge-tag badge-local">ท้องถิ่น</span>
                            <span class="bubble-body">{line.replace('[ท้องถิ่น]', '')}</span>
                        {:else if line.includes('[ระบบ]') || line.includes('[ประกาศ]')}
                            <span class="badge-tag badge-system">ระบบ</span>
                            <span class="bubble-body system-text">{line.replace('[ระบบ]', '').replace('[ประกาศ]', '')}</span>
                        {:else if line.includes('⭐')}
                            <span class="badge-tag badge-admin">แอดมิน</span>
                            <span class="bubble-body admin-text">{line}</span>
                        {:else}
                            <span class="bubble-body plain">{line}</span>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>

        <!-- Modern Sleek Input Bar -->
        <div class="chat-input-deck">
            <div class="chat-input-wrapper">
                <Icon name="chat" size={14} color="#f59e0b" />
                <input
                    type="text"
                    placeholder="ส่งข้อความในช่อง [{$activeChatTab}]... (กด Enter)"
                    bind:value={chatInput}
                    onkeydown={(e) => { e.stopPropagation(); handleChatKeydown(e); }}
                />
            </div>
            <button class="chat-send-lux-btn" onclick={handleChatSend} title="ส่งข้อความ">
                <Icon name="send" size={13} color="#451a03" />
                <span>ส่ง</span>
            </button>
        </div>
    {/if}
</div>

<style>
    .hud-chat-premium {
        position: fixed;
        bottom: 5.4rem;
        left: 0.8rem;
        width: 440px;
        z-index: 30;
        background: rgba(10, 14, 23, 0.78);
        backdrop-filter: blur(14px) saturate(180%);
        border: 1px solid rgba(251, 191, 36, 0.28);
        border-radius: 12px;
        box-shadow: 
            0 12px 32px rgba(0, 0, 0, 0.65),
            0 0 15px rgba(251, 191, 36, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .hud-chat-premium.minimized {
        width: 320px;
    }

    /* Header & Tabs */
    .chat-header-glass {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 8px;
        background: linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.75) 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .chat-channel-tabs {
        display: flex;
        align-items: center;
        gap: 3px;
        overflow-x: auto;
    }

    .channel-tab-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.76rem;
        font-weight: 500;
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
    }

    .channel-tab-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #f1f5f9;
    }

    .channel-tab-btn.active {
        background: rgba(251, 191, 36, 0.16);
        border-color: rgba(251, 191, 36, 0.4);
        color: #fcd34d;
        font-weight: 600;
        box-shadow: 0 0 10px rgba(251, 191, 36, 0.15);
    }

    .chat-actions-top {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .chat-tool-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        color: #94a3b8;
        font-size: 0.65rem;
        transition: all 0.15s ease;
    }

    .chat-tool-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
    }

    .chat-tool-btn.close:hover {
        background: rgba(239, 68, 68, 0.3);
        border-color: #ef4444;
        color: #fca5a5;
    }

    /* Message Stream */
    .chat-messages-stream {
        height: 160px;
        max-height: 160px;
        overflow-y: auto;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        background: rgba(8, 12, 19, 0.65);
    }

    .chat-messages-stream::-webkit-scrollbar {
        width: 4px;
    }

    .chat-messages-stream::-webkit-scrollbar-thumb {
        background: rgba(251, 191, 36, 0.25);
        border-radius: 4px;
    }

    .chat-bubble-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.86rem;
        line-height: 1.45;
        word-break: break-word;
        animation: chatFade 0.2s ease-out;
    }

    /* Badges */
    .badge-tag {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 4px;
        flex-shrink: 0;
        letter-spacing: 0.2px;
    }

    .badge-local {
        background: rgba(245, 158, 11, 0.18);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.35);
    }

    .badge-guild {
        background: rgba(59, 130, 246, 0.18);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.35);
    }

    .badge-party {
        background: rgba(168, 85, 247, 0.18);
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.35);
    }

    .badge-system {
        background: rgba(16, 185, 129, 0.18);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.35);
    }

    .badge-admin {
        background: linear-gradient(90deg, #f59e0b, #ef4444);
        color: #ffffff;
        font-weight: 800;
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
    }

    .bubble-body {
        color: #e2e8f0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
    }

    .bubble-body.system-text {
        color: #6ee7b7;
        font-style: italic;
    }

    .bubble-body.admin-text {
        color: #fde047;
        font-weight: 600;
        text-shadow: 0 0 8px rgba(253, 224, 71, 0.4);
    }

    /* Input Deck */
    .chat-input-deck {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        background: rgba(15, 23, 42, 0.9);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .chat-input-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        padding: 4px 8px;
        transition: border-color 0.15s ease;
    }

    .chat-input-wrapper:focus-within {
        border-color: #f59e0b;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
    }

    .chat-input-wrapper input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.85rem;
        color: #f8fafc;
    }

    .chat-input-wrapper input::placeholder {
        color: #64748b;
    }

    .chat-send-lux-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        background: linear-gradient(180deg, #fde047 0%, #eab308 100%);
        border: none;
        border-radius: 6px;
        padding: 6px 14px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.82rem;
        font-weight: 700;
        color: #451a03;
        cursor: pointer;
        box-shadow: 
            0 2px 6px rgba(234, 179, 8, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        transition: all 0.15s ease;
    }

    .chat-send-lux-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
    }

    .chat-send-lux-btn:active {
        transform: translateY(0);
    }

    @keyframes chatFade {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive for mobile landscape */
    @media (max-width: 768px), (max-height: 500px) {
        .hud-chat-premium {
            width: 320px;
            bottom: 4.8rem;
            left: 0.4rem;
        }
        .chat-messages-stream {
            height: 120px;
            max-height: 120px;
        }
    }
</style>
