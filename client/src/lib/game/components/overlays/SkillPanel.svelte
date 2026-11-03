<script lang="ts">
    import { skills } from "$lib/game-ui";
    let { showSkills = $bindable() } = $props<{ showSkills: boolean }>();
</script>

<div class="panel-overlay fade-in panel-mobile">
			<div class="panel-overlay-header">
				<h3>⚡ ทักษะ</h3>
				<button class="panel-overlay-close" onclick={() => showSkills = false}>✕</button>
			</div>
			<div class="panel-overlay-body">
				{#if $skills.length === 0}
					<div class="empty-state">ยังไม่มีทักษะ</div>
				{:else}
					<div style="display: flex; flex-direction: column; gap: 0.5rem;">
						{#each $skills as skill}
							<div class="skill-item">
								<div style="display: flex; align-items: center; justify-content: space-between;">
									<div>
										<div style="font-weight: 600; color: var(--text-light); font-size: 0.85rem;">{skill.name}</div>
										<div style="font-family: 'VT323', monospace; font-size: 0.85rem; color: var(--text-muted);">เลเวล {skill.level}</div>
									</div>
									<div class="skill-badge">LV {skill.level}</div>
								</div>
								<div class="skill-exp-bar">
									<div style="height: 100%; width: {skill.maxExp > 0 ? (skill.exp / skill.maxExp * 100) : 0}%; background: linear-gradient(90deg, var(--gold-soft), var(--gold-bright)); border-radius: 3px;"></div>
								</div>
								<div style="font-family: 'VT323', monospace; font-size: 0.7rem; color: var(--text-muted); text-align: right;">{skill.exp}/{skill.maxExp} EXP</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
