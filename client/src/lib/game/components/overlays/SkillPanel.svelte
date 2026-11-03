<script lang="ts">
    import { skills } from "$lib/game-ui";
    let { showSkills = $bindable() } = $props<{ showSkills: boolean }>();
</script>

<div class="panel-overlay fade-in panel-mobile">
	<div class="panel-overlay-header">
		<h3>⚡ ทักษะ & สายอาชีพ</h3>
		<button class="panel-overlay-close" onclick={() => showSkills = false}>✕</button>
	</div>
	<div class="panel-overlay-body">
		{#if $skills.length === 0}
			<div class="empty-state">ยังไม่มีทักษะ</div>
		{:else}
			<div style="display: flex; flex-direction: column; gap: 0.75rem;">
				{#each $skills as skill}
					<div class="skill-item" style="display: flex; gap: 0.75rem; align-items: center; background: rgba(0,0,0,0.3); padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
						<img src={skill.image} alt={skill.name} style="width: 40px; height: 40px; object-fit: contain; image-rendering: pixelated; background: rgba(0,0,0,0.4); border-radius: 6px; padding: 2px;" />
						<div style="flex: 1;">
							<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
								<span style="font-weight: bold; color: var(--text-light); font-size: 0.9rem;">{skill.name}</span>
								<span class="skill-badge" style="background: rgba(234, 179, 8, 0.2); color: #fde047; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">LV {skill.level}</span>
							</div>
							<div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.35rem; line-height: 1.2;">{skill.description}</div>
							<div class="skill-exp-bar" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 2px;">
								<div style="height: 100%; width: {skill.maxExp > 0 ? (skill.exp / skill.maxExp * 100) : 0}%; background: linear-gradient(90deg, #eab308, #facc15); border-radius: 3px;"></div>
							</div>
							<div style="font-family: 'VT323', monospace; font-size: 0.75rem; color: var(--text-muted); text-align: right;">{skill.exp}/{skill.maxExp} EXP</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
