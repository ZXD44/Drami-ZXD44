<script lang="ts">
    import { inventory, playerSummary } from "$lib/game-ui";
    import Icon from "../Icon.svelte";
    let { showInventory = $bindable() } = $props<{ showInventory: boolean }>();
</script>

<div class="panel-overlay fade-in panel-mobile">
			<div class="panel-overlay-header">
				<h3 style="display: flex; align-items: center; gap: 8px;">
					<Icon name="inventory" size={18} color="#f6d860" /> กระเป๋าไอเทม
				</h3>
				<button class="panel-overlay-close" onclick={() => showInventory = false}>✕</button>
			</div>
			<div class="panel-overlay-body">
				{#if $inventory.length === 0}
					<div class="empty-state" style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
						<Icon name="box" size={32} color="#94a3b8" />
						กระเป๋าว่างเปล่า<br/>
						<span>สำรวจโลกเพื่อค้นหาไอเทม!</span>
					</div>
				{:else}
					<div class="inv-grid">
						{#each $inventory as item}
							<div class="inv-slot rarity-{item.rarity}" title="{item.name} x{item.qty}">
								<span class="item-emoji">
									{#if item.icon && !item.icon.match(/[\u{1F300}-\u{1F9FF}]/u)}
										{item.icon}
									{:else}
										<Icon name="box" size={20} color="#f6d860" />
									{/if}
								</span>
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
				<div class="inv-gold-row" style="display: flex; align-items: center; gap: 12px; justify-content: flex-end;">
					<span style="display: inline-flex; align-items: center; gap: 4px;">
						<Icon name="gold" size={15} color="#f6d860" /> 
						<span style="color: var(--gold-bright);">{$playerSummary.gold} ทอง</span>
					</span>
					<span style="display: inline-flex; align-items: center; gap: 4px;">
						<Icon name="diamond" size={15} color="#60a5fa" /> 
						<span style="color: #60a5fa;">{($playerSummary.diamonds || 0).toLocaleString()} เพชร</span>
					</span>
					<span style="display: inline-flex; align-items: center; gap: 4px;">
						<Icon name="gold" size={15} color="#c0c0c0" /> 
						<span style="color: #c0c0c0;">{$playerSummary.silver} เงิน</span>
					</span>
				</div>
			</div>
		</div>
