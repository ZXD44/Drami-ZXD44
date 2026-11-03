<script lang="ts">
    import { inventory, playerSummary } from "$lib/game-ui";
    let { showInventory = $bindable() } = $props<{ showInventory: boolean }>();
</script>

<div class="panel-overlay fade-in panel-mobile">
			<div class="panel-overlay-header">
				<h3>🎒 กระเป๋าไอเทม</h3>
				<button class="panel-overlay-close" onclick={() => showInventory = false}>✕</button>
			</div>
			<div class="panel-overlay-body">
				{#if $inventory.length === 0}
					<div class="empty-state">
						🗃️ กระเป๋าว่างเปล่า<br/>
						<span>สำรวจโลกเพื่อค้นหาไอเทม!</span>
					</div>
				{:else}
					<div class="inv-grid">
						{#each $inventory as item}
							<div class="inv-slot rarity-{item.rarity}" title="{item.name} x{item.qty}">
								<span class="item-emoji">{item.icon || '📦'}</span>
								{#if item.qty > 1}
									<span class="item-qty">x{item.qty}</span>
								{/if}
							</div>
						{/each}
						{#each Array(Math.max(0, 20 - $inventory.length)) as _}
							<div class="inv-slot"></div>
						{/each}
					</div>
				{/if}
				<div class="inv-gold-row">
					<span>🪙 <span style="color: var(--gold-bright);">{$playerSummary.gold} ทอง</span></span>
					<span><span style="color: #60a5fa;">💎 {($playerSummary.diamonds || 0).toLocaleString()} เพชร</span></span>
					<span>🥈 <span style="color: #c0c0c0;">{$playerSummary.silver} เงิน</span></span>
				</div>
			</div>
		</div>
