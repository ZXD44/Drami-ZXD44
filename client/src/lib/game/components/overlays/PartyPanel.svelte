<script lang="ts">
    import { party } from "$lib/game-ui";
    import Icon from "../Icon.svelte";
    let { showParty = $bindable(), activePartyTab = $bindable() } = $props<{ showParty: boolean; activePartyTab: string }>();
</script>

<div class="panel-overlay fade-in panel-mobile">
			<div class="panel-overlay-header" style="flex-direction: column; align-items: stretch; gap: 0.5rem; padding-bottom: 0;">
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<h3 style="display: flex; align-items: center; gap: 8px;">
						<Icon name="party" size={18} color="#f6d860" /> สังคม
					</h3>
					<button class="panel-overlay-close" onclick={() => showParty = false}>✕</button>
				</div>
				<div class="chat-tab-bar" style="border-bottom: none; margin-bottom: 0;">
					<button class="chat-tab" class:active={activePartyTab === 'party'} onclick={() => activePartyTab = 'party'}>ปาร์ตี้</button>
					<button class="chat-tab" class:active={activePartyTab === 'friends'} onclick={() => activePartyTab = 'friends'}>เพื่อน</button>
				</div>
			</div>
			<div class="panel-overlay-body" style="padding-top: 0.8rem; border-top: 1px solid var(--panel-border);">
				{#if activePartyTab === 'party'}
					{#if $party.length === 0}
						<div class="empty-state" style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
							<Icon name="users" size={32} color="#94a3b8" />
							ยังไม่มีสมาชิก<br/>
							<span>ชวนเพื่อนเข้าปาร์ตี้!</span>
						</div>
					{:else}
						<div style="display: flex; flex-direction: column; gap: 0.4rem;">
							{#each $party as member}
								<div class="party-item">
									<div style="display: flex; align-items: center; justify-content: space-between;">
										<div>
											<div style="font-weight: 600; color: var(--text-light); font-size: 0.85rem;">{member.name}</div>
											<div style="font-family: 'VT323', monospace; font-size: 0.85rem; color: var(--text-muted);">{member.role}</div>
										</div>
										<span class="party-status" class:party-ready={member.status === 'พร้อม'}>{member.status}</span>
									</div>
									<div class="skill-exp-bar" style="margin-top: 0.3rem;">
										<div style="height: 100%; width: {member.maxHp > 0 ? (member.hp / member.maxHp * 100) : 0}%; background: linear-gradient(90deg, #e74c3c, #c0392b); border-radius: 3px;"></div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				{:else}
					<div class="empty-state" style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
						<Icon name="party" size={32} color="#94a3b8" />
						ยังไม่มีเพื่อน<br/>
						<span>ยังไม่ได้เพิ่มใครเป็นเพื่อนในขณะนี้!</span>
					</div>
				{/if}
			</div>
		</div>
