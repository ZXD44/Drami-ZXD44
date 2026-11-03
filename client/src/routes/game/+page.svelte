<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { initDramiShield } from "$lib/security/DramiShield";
	import "$lib/game/styles/main.css";
	
	// Components
	import InventoryPanel from "$lib/game/components/overlays/InventoryPanel.svelte";
	import QuestLogPanel from "$lib/game/components/overlays/QuestLogPanel.svelte";
	import SkillPanel from "$lib/game/components/overlays/SkillPanel.svelte";
	import PartyPanel from "$lib/game/components/overlays/PartyPanel.svelte";
	import ChatPanel from "$lib/game/components/overlays/ChatPanel.svelte";
	import Game from "$lib/game/Game.svelte";
	import PlayerHUD from "$lib/game/components/PlayerHUD.svelte";
	import MiniMap from "$lib/game/components/MiniMap.svelte";
	import Hotbar from "$lib/game/components/Hotbar.svelte";
	import AdminPanel from "$lib/game/AdminPanel.svelte";
	import AvatarCreator from "$lib/game/AvatarCreator.svelte";
	import VirtualJoystick from "$lib/game/components/VirtualJoystick.svelte";
	import Icon from "$lib/game/components/Icon.svelte";

	// Services & Utils
	import { uploadAvatar, createCharacter } from "$lib/game/services/playerService";
	import { getActionByKeyCode, handleGameAction } from "$lib/game/utils/keyboardHandler";
	import { loadPlayerData } from "$lib/game/utils/gameSync";

	// Forest UI (Shared Global State)
	import {
		chatFeed,
		playerSummary,
		gameSettings,
		expRatio,
		addChatMessage,
		sendServerMessage,
		activeAnnouncement,
		notifications,
	} from "$lib/game-ui";

	/* -------------------------------------------------------------------------
	   Panel States
	   ------------------------------------------------------------------------- */
	let showInventory = $state(false);
	let showQuests = $state(false);
	let showSkills = $state(false);
	let showParty = $state(false);
	let showSettings = $state(false);
	let showMainMenu = $state(false);
	let showChat = $state(true); // Always on by default
	let showEmoji = $state(false);
	let showAdminPanel = $state(false);
	let showAvatarCreator = $state(false);
	let activePartyTab = $state('party');
	
	let isAdmin = $derived($playerSummary.role === 'admin');
	let isAnyPanelOpen = $derived(showInventory || showQuests || showSkills || showParty || showSettings || showMainMenu || showEmoji);

	let chatInput = $state('');

	function closeAllPanels() {
		showInventory = showQuests = showSkills = showParty = showSettings = showMainMenu = showEmoji = false;
	}

	function togglePanel(panel: string) {
		if (panel === 'chat') {
			showChat = !showChat;
			return;
		}

		const panels: Record<string, boolean> = { inventory: showInventory, quests: showQuests, skills: showSkills, party: showParty, settings: showSettings, mainMenu: showMainMenu, emoji: showEmoji };
		const isOpen = panels[panel];
		
		// Close all interactive panels except Chat
		showInventory = showQuests = showSkills = showParty = showSettings = showMainMenu = showEmoji = false;
		
		if (!isOpen) {
			if (panel === 'inventory') showInventory = true;
			else if (panel === 'quests') showQuests = true;
			else if (panel === 'skills') showSkills = true;
			else if (panel === 'party') showParty = true;
			else if (panel === 'settings') showSettings = true;
			else if (panel === 'mainMenu') showMainMenu = true;
			else if (panel === 'emoji') showEmoji = true;
		}
	}

	/* -------------------------------------------------------------------------
	   Handlers
	   ------------------------------------------------------------------------- */
	function handleKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
		
		// ไม่ทำงานหากมีการกดปุ่มพิเศษร่วมรด้วย (เช่น Ctrl+C สำหรับ Copy)
		if (e.ctrlKey || e.altKey || e.metaKey) return;

		const action = getActionByKeyCode(e.code);
		if (e.code === 'Tab') e.preventDefault();
		if (action) handleGameAction(action, togglePanel, closeAllPanels, isAnyPanelOpen);
	}

	function handleChatSend() {
		if (chatInput.trim()) {
			sendServerMessage('chat', chatInput.trim());
			addChatMessage(`[ท้องถิ่น] ${$playerSummary.name}: ${chatInput.trim()}`);
			chatInput = '';
		}
	}

	/* -------------------------------------------------------------------------
	   Lifecycle
	   ------------------------------------------------------------------------- */
	let loading = $state(true);
	let connectionError = $state(false);
	let errorMessage = $state("");
	let isUploading = $state(false);
	let fileInput = $state() as HTMLInputElement;
	let cleanupFns: (() => void)[] = [];

	onMount(() => {
		const cleanupDrami = initDramiShield();
		const playerLoad = loadPlayerData();

		if (playerLoad.redirect) { window.location.href = '/'; return; }
		if (!playerLoad.user?.avatar || playerLoad.user?.avatar.includes('dicebear.com')) showAvatarCreator = true;

		window.addEventListener('keydown', handleKeydown);
		cleanupFns.push(() => window.removeEventListener('keydown', handleKeydown), cleanupDrami);
	});

	onDestroy(() => cleanupFns.forEach(fn => fn()));

	/* -------------------------------------------------------------------------
	   Business Logic Calls (Via Services)
	   ------------------------------------------------------------------------- */
	const onLogout = () => { localStorage.clear(); window.location.href = '/'; };
	const onAvatarUpload = async (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		isUploading = true;
		try { await uploadAvatar(file); } finally { isUploading = false; }
	};
	const onCharacterCreate = async (data: any) => {
		loading = true;
		try { await createCharacter(data); showAvatarCreator = false; } finally { loading = false; }
	};
</script>

<svelte:head>
	<title>Drami Online | World</title>
</svelte:head>

<div class="game-viewport">
	<div class="game-canvas-container">
		<Game {addChatMessage} bind:loading bind:connectionError bind:errorMessage />
	</div>
</div>

<!-- Global Overlays -->
<div class="notifications-container">
	{#each $notifications as n (n.id)}
		<div class="notif-toast notif-{n.type} fade-in-right">
			<div class="notif-icon">
				{#if n.type === 'success'}
					<Icon name="check" size={16} color="#4ade80" />
				{:else if n.type === 'error'}
					<Icon name="close" size={16} color="#f43f5e" />
				{:else if n.type === 'warning'}
					<Icon name="alert" size={16} color="#fbbf24" />
				{:else}
					<Icon name="info" size={16} color="#60a5fa" />
				{/if}
			</div>
			<div class="notif-content">{n.message}</div>
		</div>
	{/each}
</div>

{#if $activeAnnouncement}
	<div class="announcement-banner fade-in">
		<div class="banner-icon"><Icon name="horn" size={18} color="#f6d860" /></div>
		<div class="marquee-wrapper"><div class="marquee-content">{$activeAnnouncement}</div></div>
	</div>
{/if}

<PlayerHUD />
<MiniMap />
<VirtualJoystick />

<div class="hud-side-panel">
	<button class="side-btn" class:side-btn-active={showQuests} onclick={() => togglePanel('quests')} title="เควส">
		<Icon name="quest" size={16} /> <span class="hotbar-skill-key">Q</span>
	</button>
	<button class="side-btn" class:side-btn-active={showSkills} onclick={() => togglePanel('skills')} title="ทักษะ">
		<Icon name="skill" size={16} /> <span class="hotbar-skill-key">T</span>
	</button>
	<button class="side-btn" class:side-btn-active={showParty} onclick={() => togglePanel('party')} title="ปาร์ตี้">
		<Icon name="party" size={16} /> <span class="hotbar-skill-key">F</span>
	</button>
	<button class="side-btn" class:side-btn-active={showSettings} onclick={() => togglePanel('settings')} title="ตั้งค่า">
		<Icon name="settings" size={16} /> <span class="hotbar-skill-key">ESC</span>
	</button>
</div>

<Hotbar bind:showEmoji sendEmoji={(e) => { sendServerMessage('chat', e); addChatMessage(`[ท้องถิ่น] ${$playerSummary.name}: ${e}`); showEmoji = false; }} {togglePanel} />

<!-- Panels -->
{#if showChat} <ChatPanel bind:showChat bind:chatInput {handleChatSend} handleChatKeydown={(e) => e.key === 'Enter' && handleChatSend()} /> {/if}
{#if showInventory} <InventoryPanel bind:showInventory /> {/if}
{#if showQuests} <QuestLogPanel bind:showQuests /> {/if}
{#if showSkills} <SkillPanel bind:showSkills /> {/if}
{#if showParty} <PartyPanel bind:showParty bind:activePartyTab /> {/if}

{#if showSettings}
	<div class="panel-overlay fade-in panel-settings-premium">
		<div class="panel-overlay-header settings-header-gold">
			<div class="settings-title-group" style="display: flex; align-items: center; gap: 8px;">
				<Icon name="settings" size={20} color="#f6d860" />
				<h3>ตั้งค่าระบบ</h3>
			</div>
			<button class="panel-overlay-close-btn" onclick={() => showSettings = false}>✕</button>
		</div>
		<div class="panel-overlay-body settings-body-centered">
			<div class="settings-container-grid">
				{#each [
					{ label: 'เสียงเพลงประกอบ', key: 'musicVolume', icon: 'music', min: 0, max: 100, step: 1, suffix: '%' },
					{ label: 'เอฟเฟกต์เสียง', key: 'sfxVolume', icon: 'sound', min: 0, max: 100, step: 1, suffix: '%' },
					{ label: 'ระยะซูมกล้องหน้าจอ', key: 'cameraZoom', icon: 'zoom', min: 1, max: 4, step: 0.1, suffix: 'x' }
				] as item}
					<div class="setting-card-premium">
						<div class="setting-info-top">
							<div class="setting-label-main">
								<span class="setting-icon-mini" style="display: flex; align-items: center;"><Icon name={item.icon} size={16} color="#f6d860" /></span>
								<span class="setting-text">{item.label}</span>
							</div>
							<div class="setting-value-display">
								{$gameSettings[item.key]}{item.suffix}
							</div>
						</div>
						<div class="setting-slider-wrapper">
							<input 
								type="range" 
								min={item.min} max={item.max} step={item.step} 
								bind:value={$gameSettings[item.key]} 
								class="premium-range-slider"
							/>
						</div>
					</div>
				{/each}
			</div>
			
			<div class="settings-footer-note">
				* การซูมหน้าจอมือถือจะมีผลทันทีต่อมุมมองการเล่น
			</div>
		</div>
	</div>
{/if}

{#if showMainMenu}
	<div class="panel-overlay fade-in panel-mobile menu-main-panel">
		<div class="panel-overlay-header"><h3>☰ เมนูผู้เล่น</h3><button class="panel-overlay-close" onclick={() => showMainMenu = false}>✕</button></div>
		<div class="panel-overlay-body no-padding" style="overflow-x: hidden;">
			<!-- Profile: Centered Avatar -->
			<div class="menu-profile-hero">
				<button class="profile-avatar-lg" onclick={() => fileInput.click()} disabled={isUploading} title="เปลี่ยนรูปโปรไฟล์">
					<img src={$playerSummary.avatar} alt="Avatar" class="profile-avatar-img" />
					<div class="avatar-hover-overlay" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
						<Icon name="camera" size={14} /> เปลี่ยนรูป
					</div>
					{#if isUploading}<div class="avatar-loading-overlay"><div class="spinner"></div></div>{/if}
					<div class="profile-level-badge">Lv.{$playerSummary.level}</div>
				</button>
				<h4 class="profile-hero-name">{$playerSummary.name}</h4>
				<div class="profile-hero-title">{$playerSummary.title}</div>
				{#if $playerSummary.clan}
					<div class="profile-hero-guild" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
						<Icon name="shield" size={14} color="#f6d860" /> {$playerSummary.clan}
					</div>
				{/if}
			</div>
			<input type="file" accept="image/*" bind:this={fileInput} onchange={onAvatarUpload} style="display: none;" />


			<!-- Quick Nav Buttons -->
			<div class="menu-nav-grid">
				<button class="menu-nav-btn" onclick={() => { showMainMenu = false; togglePanel('inventory'); }}>
					<span class="nav-icon"><Icon name="inventory" size={18} color="#fde047" /></span><span>กระเป๋า</span>
				</button>
				<button class="menu-nav-btn" onclick={() => { showMainMenu = false; togglePanel('skills'); }}>
					<span class="nav-icon"><Icon name="skill" size={18} color="#eab308" /></span><span>ทักษะ</span>
				</button>
				<button class="menu-nav-btn" onclick={() => { showMainMenu = false; togglePanel('quests'); }}>
					<span class="nav-icon"><Icon name="quest" size={18} color="#60a5fa" /></span><span>เควส</span>
				</button>
				<button class="menu-nav-btn" onclick={() => { showMainMenu = false; togglePanel('party'); }}>
					<span class="nav-icon"><Icon name="party" size={18} color="#4ade80" /></span><span>ปาร์ตี้</span>
				</button>
			</div>

			<!-- Bottom Actions -->
			<div class="menu-bottom-actions">
				<button class="menu-action-btn discord-action" onclick={() => window.open('https://discord.gg/drami', '_blank')}>
					<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
					<span>Discord</span>
				</button>
				{#if isAdmin}
					<button class="menu-action-btn admin-action" onclick={() => { showMainMenu = false; showAdminPanel = true; }}>
						<span class="action-icon"><Icon name="admin" size={16} color="#fde047" /></span>
						<span>จัดการ</span>
					</button>
				{/if}
				<button class="menu-action-btn logout-action" onclick={onLogout}>
					<span class="action-icon"><Icon name="logout" size={16} color="#ef4444" /></span>
					<span>ออกจากเกม</span>
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showAdminPanel} <AdminPanel onDispose={() => showAdminPanel = false} /> {/if}

{#if showAvatarCreator}
	<div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
		<AvatarCreator username={$playerSummary.name} gender={$playerSummary.gender} on:create={(e) => onCharacterCreate(e.detail)} on:cancel={() => showAvatarCreator = false} />
	</div>
{/if}

{#if loading}
	<div class="game-boot-loader">
		<div class="loader-content">
			<div class="premium-ring-loader"><div class="ring-inner"></div><div class="ring-outer"></div><div class="ring-center"></div></div>
			<div class="loader-text pulse">กำลังเข้าสู่โลก...</div>
		</div>
	</div>
{/if}

{#if connectionError}
	<div class="game-boot-overlay error-overlay fade-in">
		<div class="error-panel">
			<div class="error-header">
				<div class="error-icon-pulse"><Icon name="ping" size={28} color="#f43f5e" /></div>
				<h2 class="error-title">ขาดการเชื่อมต่อ</h2>
			</div>
			<div class="error-content">
				<p class="error-subtitle">ดูเหมือนสัญญาณโลกขัดข้อง</p>
				<div class="error-box">
					<span class="error-code-label">CODE_ERROR</span>
					<div class="error-msg text-glow">{errorMessage}</div>
				</div>
			</div>
			<div class="error-footer">
				<button class="btn-retry-premium" onclick={() => window.location.reload()}>
					<span>สถาปนาการเชื่อมต่อใหม่</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.error-overlay { background: rgba(0,0,0,0.92) !important; backdrop-filter: blur(12px); z-index: 999999; display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; }
	.error-panel { background: #161512; border: 3px solid #0a0a09; border-radius: 20px; width: 440px; padding: 2.5rem; text-align: center; box-shadow: 0 30px 100px rgba(0,0,0,0.9); }
	.error-header { margin-bottom: 1.5rem; }
	.error-icon-pulse { font-size: 3rem; margin-bottom: 1rem; animation: pulse-error 2s infinite; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4)); }
	.error-title { color: #fbbf24; font-size: 1.8rem; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
	.error-subtitle { color: #888; font-size: 0.95rem; margin-top: 5px; font-weight: 500; }
	.error-box { background: #000; padding: 1.2rem; border-radius: 12px; margin: 1.5rem 0; border: 1px solid #222; }
	.error-code-label { display: block; font-size: 0.7rem; color: #555; text-transform: uppercase; margin-bottom: 8px; font-weight: 800; }
	.error-msg { color: #f87171; font-family: monospace; font-size: 0.9rem; line-height: 1.6; word-break: break-word; }
	.btn-retry-premium { 
		width: 100%; padding: 1rem; border-radius: 12px; 
		background: linear-gradient(180deg, #fbbf24, #d97706); 
		color: #000; border: none; font-weight: 800; cursor: pointer;
		font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 10px 30px rgba(217, 119, 6, 0.3);
	}
	.btn-retry-premium:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(217, 119, 6, 0.5); filter: brightness(1.1); }
	@keyframes pulse-error { 0%, 100% { opacity: 0.7; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }

	/* --- Settings Panel Premium Styles (Compact Version) --- */
	.panel-settings-premium { background: rgba(10, 10, 9, 0.95); border: 3px solid #000; border-radius: 16px; box-shadow: 0 40px 100px rgba(0,0,0,0.9); width: 360px; }
	.settings-header-gold { background: #000; padding: 0.8rem 1.2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #fbbf2433; }
	.settings-title-group { display: flex; align-items: center; gap: 10px; }
	.settings-icon-glow { font-size: 1.2rem; filter: drop-shadow(0 0 8px #fbbf2466); }
	.settings-title-group h3 { color: #fbbf24; margin: 0; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; font-size: 1rem; }
	.panel-overlay-close-btn { background: none; border: none; color: #555; font-size: 1rem; cursor: pointer; transition: color 0.2s; }
	.panel-overlay-close-btn:hover { color: #fff; }

	.settings-body-centered { padding: 1.2rem; }
	.settings-container-grid { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1rem; }
	.setting-card-premium { background: #161512; border: 1.5px solid #222; border-radius: 10px; padding: 0.8rem 1rem; transition: border-color 0.2s; }
	.setting-card-premium:hover { border-color: #fbbf2466; }
	
	.setting-info-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
	.setting-label-main { display: flex; align-items: center; gap: 6px; }
	.setting-icon-mini { font-size: 1rem; }
	.setting-text { color: #888; font-weight: 700; font-size: 0.8rem; }
	.setting-value-display { background: #000; border: 1px solid #222; padding: 2px 8px; border-radius: 6px; color: #fbbf24; font-weight: 900; font-size: 0.85rem; min-width: 44px; text-align: center; }

	.setting-slider-wrapper { padding: 2px 0; }
	.premium-range-slider {
		-webkit-appearance: none; width: 100%; background: #0a0a09; height: 5px; border-radius: 2.5px; outline: none; border: 1px solid #1a1917;
	}
	.premium-range-slider::-webkit-slider-thumb {
		-webkit-appearance: none; appearance: none; width: 15px; height: 15px; border-radius: 50%;
		background: #fbbf24; cursor: pointer; border: 2.5px solid #000;
		box-shadow: 0 0 8px rgba(251, 191, 36, 0.4); transition: transform 0.1s;
	}
	.premium-range-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
	
	.settings-footer-note { color: #555; text-align: center; font-size: 0.7rem; font-style: italic; }
</style>
