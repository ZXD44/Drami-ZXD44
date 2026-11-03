<script lang="ts">
    import { quests } from "$lib/game-ui";
    let { showQuests = $bindable() } = $props<{ showQuests: boolean }>();
</script>

<div class="panel-overlay fade-in panel-mobile">
			<div class="panel-overlay-header">
				<h3>📜 บันทึกเควส</h3>
				<button class="panel-overlay-close" onclick={() => showQuests = false}>✕</button>
			</div>
			<div class="panel-overlay-body">
				{#if $quests.length === 0}
					<div class="empty-state">
						📜 ยังไม่มีเควส<br/>
						<span>พูดคุยกับ NPC เพื่อรับเควส!</span>
					</div>
				{:else}
					<div style="display: flex; flex-direction: column; gap: 0.6rem;">
						{#each $quests as quest}
							<div class="quest-item" style="{quest.completed ? 'opacity: 0.5;' : ''}">
								<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
									<span style="font-weight: 700; color: var(--text-light); font-size: 0.85rem;">{quest.completed ? '✅' : '📌'} {quest.name}</span>
									<span class="quest-progress">{quest.progress}</span>
								</div>
								<p style="margin-top: 0.3rem; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">{quest.description}</p>
								<div style="margin-top: 0.3rem; font-family: 'VT323', monospace; font-size: 0.85rem; color: var(--green-bright);">
									⭐ รางวัล: {quest.reward}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
