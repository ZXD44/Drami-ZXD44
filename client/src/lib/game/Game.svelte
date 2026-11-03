<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import Phaser from "phaser";
	import { getGameConfig } from "./engine/GameConfig";
	import { MainScene } from "./engine/MainScene";
	import { NetworkService } from "./services/NetworkService";
	import { loadPlayerData } from "./utils/gameSync";

	let { 
		addChatMessage, 
		loading = $bindable(true), 
		connectionError = $bindable(false), 
		errorMessage = $bindable("") 
	} = $props();

	let gameContainer: HTMLDivElement;
	let gameInstance: Phaser.Game | null = null;
	let networkService: NetworkService | null = null;

	onMount(async () => {
		try {
			// 1. Initialize Network Service
			networkService = new NetworkService(addChatMessage);
			
			const { user: userData, success } = loadPlayerData();
			
			if (!success || !userData?.id) {
				throw new Error("⚠️ กรุณาเข้าสู่ระบบก่อน\n\nไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
			}

			const room = await networkService.connect({ userId: userData.id, username: userData.username });
			addChatMessage(`[ระบบ] เชื่อมต่อกับเซิร์ฟเวอร์แล้ว (เซสชัน: ${room.sessionId.slice(0, 8)}...)`);

			// 2. Initialize Phaser Game
			const gender = localStorage.getItem("drami_gender") || "male";
			const username = userData.username || "Adventurer";
			const config = getGameConfig(gameContainer);
			
			gameInstance = new Phaser.Game(config);

			// Start scene with data
			gameInstance.events.once('ready', () => {
				gameInstance!.scene.add('MainScene', MainScene, true, { 
					room, 
					gender, 
					username, 
					addChatMessage 
				});
				
				setTimeout(() => {
					loading = false;
				}, 800);
			});

		} catch (error: any) {
			console.error("[Game] Initialization failed:", error);
			connectionError = true;
			
			if (error?.message?.includes('websocket') || error?.message?.includes('WebSocket')) {
				errorMessage = `❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้\n\nกรุณาตรวจสอบเซิร์ฟเวอร์ของคุณ`;
			} else {
				errorMessage = error.message || "🛰️ ขาดการติดต่อกับเซิร์ฟเวอร์";
			}
			loading = false;
		}
	});

	onDestroy(() => {
		networkService?.disconnect();
		if (gameInstance) {
			gameInstance.destroy(true);
			gameInstance = null;
		}
	});
</script>

<div
	bind:this={gameContainer}
	class="w-full h-full absolute inset-0"
></div>
