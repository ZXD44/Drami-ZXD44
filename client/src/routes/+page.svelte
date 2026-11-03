<script lang="ts">
	import { onMount } from 'svelte';
	import { getServerUrl } from '$lib/game/config';

	let particles: { left: string; delay: string; duration: string; size: string }[] = $state([]);
	let showLoginForm = $state(false);
	let serverOnline = $state(false);

	async function checkServerStatus() {
		try {
			const res = await fetch(getServerUrl());
			serverOnline = res.ok;
		} catch (e) {
			serverOnline = false;
		}
	}

	onMount(() => {
		// Auto login if token exists
		const token = localStorage.getItem("drami_token");
		if (token) {
			window.location.href = '/game';
			return;
		}

		// Generate floating particles
		particles = Array.from({ length: 20 }, () => ({
			left: `${Math.random() * 100}%`,
			delay: `${Math.random() * 6}s`,
			duration: `${6 + Math.random() * 6}s`,
			size: `${2 + Math.random() * 3}px`
		}));

		checkServerStatus();
		const interval = setInterval(checkServerStatus, 5000);
		return () => clearInterval(interval);
	});


	let username = $state("");
	let password = $state("");
	let errorMsg = $state("");
	let isLoading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		errorMsg = "";
		isLoading = true;

		try {
			const res = await fetch(`${getServerUrl()}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password })
			});

			const data = await res.json();
			if (res.ok) {
				localStorage.setItem("drami_token", data.token);
				localStorage.setItem("drami_user", JSON.stringify(data.user));
				window.location.href = '/game';
			} else {
				errorMsg = data.error || "เข้าสู่ระบบล้มเหลว";
			}
		} catch (e) {
			errorMsg = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Drami Online | แฟนตาซี MMORPG</title>
	<meta name="description" content="Drami Online — สำรวจโลกแฟนตาซีพิกเซลอาร์ต เข้าสู่ระบบเพื่อเริ่มการผจญภัย!" />
</svelte:head>

<div class="auth-page">
	<!-- Pixel Art Background -->
	<div class="auth-bg" style="background-image: url('/login_bg.png');"></div>

	<!-- Floating Particles -->
	<div class="particle-container">
		{#each particles as p}
			<div
				class="particle"
				style="left: {p.left}; animation-delay: {p.delay}; animation-duration: {p.duration}; width: {p.size}; height: {p.size};"
			></div>
		{/each}
	</div>

	<!-- Discord Button (Top-Left) -->
	<button class="btn-discord" id="btn-discord">
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
		</svg>
		เข้าร่วม Discord!
	</button>

	<!-- Server Status (Top-Right) -->
	<div class="server-status-badge">
		<div class="status-dot {serverOnline ? 'online' : 'offline'}"></div>
		<span class="status-text">
			เซิร์ฟเวอร์: {serverOnline ? 'ONLINE' : 'OFFLINE'}
		</span>
	</div>

	<!-- Version Badge (Bottom-Right) -->
	<div class="version-badge">v. BETA</div>

	<!-- Main Content Overlay -->
	<div class="auth-overlay">
		<div class="game-logo-container fade-in">
			<h1 class="game-logo-text">DRAMI</h1>
			<div class="game-logo-subtext">ONLINE</div>
		</div>

		{#if !showLoginForm}
			<!-- Quick Login Buttons (Heartwood-style) -->
			<div class="fade-in" style="display: flex; flex-direction: column; align-items: center; gap: 0.8rem; animation-delay: 0.2s;">
				<button class="btn-primary-gold" id="btn-start-game" style="max-width: 320px;" onclick={() => showLoginForm = true}>
					เข้าสู่ระบบ / เริ่มผจญภัย
				</button>

				<button class="btn-secondary" id="btn-go-register" style="max-width: 320px;" onclick={() => window.location.href = '/register'}>
					สร้างบัญชีใหม่ / สมัครสมาชิก
				</button>
			</div>
		{:else}
			<!-- Email Login Form -->
			<div class="auth-card fade-in">
				<h2>⚔️ เข้าสู่ระบบ ⚔️</h2>

				<form onsubmit={handleLogin}>
					{#if errorMsg}
						<div class="auth-error fade-in">{errorMsg}</div>
					{/if}

					<div class="auth-input-group">
						<label for="email">อีเมล / ชื่อผู้ใช้</label>
						<input
							type="text"
							id="email"
							class="auth-input"
							placeholder="นักรบ@drami.online"
							autocomplete="username"
							bind:value={username}
							required
						/>
					</div>

					<div class="auth-input-group">
						<label for="password">รหัสผ่าน</label>
						<input
							type="password"
							id="password"
							class="auth-input"
							placeholder="••••••••"
							autocomplete="current-password"
							bind:value={password}
							required
						/>
					</div>

					<button type="submit" class="btn-primary-gold" id="btn-login-submit" disabled={isLoading}>
						{isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่โลก'}
					</button>
				</form>

				<div class="auth-link">
					ยังไม่มีบัญชี? <a href="/register">สร้างบัญชี</a>
				</div>

				<button
					class="btn-secondary"
					style="margin-top: 0.8rem;"
					onclick={() => showLoginForm = false}
				>
					← กลับ
				</button>
			</div>
		{/if}
	</div>
</div>
