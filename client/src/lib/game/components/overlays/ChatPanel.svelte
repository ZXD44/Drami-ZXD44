<script lang="ts">
    import { chatFeed, activeChatTab } from "$lib/game-ui";
    import { tick } from "svelte";

    let { showChat = $bindable(), chatInput = $bindable(), handleChatSend, handleChatKeydown } = $props<{ 
        showChat: boolean; 
        chatInput: string; 
        handleChatSend: () => void; 
        handleChatKeydown: (e: KeyboardEvent) => void; 
    }>();
    
    let chatMessagesEl: HTMLDivElement | undefined = $state();

    function switchChatTab(tab: string) { activeChatTab.set(tab); }

    // Use $effect to watch for changes in chatFeed and scroll to bottom
    $effect(() => {
        // Track dependencies
        const _feed = $chatFeed;
        const _tab = $activeChatTab;
        
        // Wait for Svelte to update the DOM, then wait one more frame for the browser to calculate layout
        tick().then(() => {
            if (chatMessagesEl) {
                // Instantly jump to bottom
                chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight + 1000;
                
                // Force it again after a tiny delay just in case of images or slow renders
                setTimeout(() => {
                    if (chatMessagesEl) chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
                }, 10);
            }
        });
    });
</script>

<div class="hud-chat-mobile fade-in">
    <div class="chat-header-mobile">
        <div class="chat-tab-bar">
            {#each ['ทั้งหมด', 'ท้องถิ่น', 'กิลด์', 'ปาร์ตี้', 'ระบบ'] as tab}
                <button
                    class="chat-tab"
                    class:active={$activeChatTab === tab}
                    onclick={() => switchChatTab(tab)}
                >{tab}</button>
            {/each}
        </div>
        <button class="chat-close-btn" onclick={() => showChat = false}>✕</button>
    </div>
    <div class="chat-messages" bind:this={chatMessagesEl}>
        {#each $chatFeed as line}
            {@const shouldShow =
                $activeChatTab === 'ทั้งหมด' ||
                ($activeChatTab === 'ระบบ' && (line.includes('[ระบบ]') || line.includes('[ประกาศ]'))) ||
                ($activeChatTab === 'ท้องถิ่น' && line.includes('[ท้องถิ่น]')) ||
                ($activeChatTab === 'กิลด์' && line.includes('[กิลด์]')) ||
                ($activeChatTab === 'ปาร์ตี้' && line.includes('[ปาร์ตี้]'))
            }
            {#if shouldShow}
                <div class="chat-msg">
                    {#if line.includes('[กิลด์]')}
                        <span class="channel">[กิลด์]</span>{line.replace('[กิลด์]', '')}
                    {:else if line.includes('[ปาร์ตี้]')}
                        <span class="channel">[ปาร์ตี้]</span>{line.replace('[ปาร์ตี้]', '')}
                    {:else if line.includes('[ท้องถิ่น]')}
                        <span class="channel">[ท้องถิ่น]</span>{line.replace('[ท้องถิ่น]', '')}
                    {:else if line.includes('[ระบบ]')}
                        <span class="system">{line}</span>
                    {:else}
                        {line}
                    {/if}
                </div>
            {/if}
        {/each}
    </div>
    <div class="chat-input-bar">
        <input
            type="text"
            placeholder="พิมพ์ข้อความ..."
            bind:value={chatInput}
            onkeydown={(e) => { e.stopPropagation(); handleChatKeydown(e); }}
        />
        <button class="chat-send-btn" onclick={handleChatSend}>ส่ง</button>
    </div>
</div>
