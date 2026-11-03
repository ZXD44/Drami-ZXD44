<script lang="ts">
	import { onMount } from 'svelte';
	import { getServerUrl } from '$lib/game/config';
	import Icon from '$lib/game/components/Icon.svelte';

	let particles: { left: string; delay: string; duration: string; size: string }[] = $state([]);
	let gender = $state("male");
	let serverOnline = $state(false);
	let showPassword = $state(false);

	async function checkServerStatus() {
		try {
			const res = await fetch(getServerUrl());
			serverOnline = res.ok;
		} catch (e) {
			serverOnline = false;
		}
	}

	onMount(() => {
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
	let email = $state("");
	let password = $state("");
	let confirmPassword = $state("");
	let errorMsg = $state("");
	let isLoading = $state(false);

	async function handleRegister() {
		if (password !== confirmPassword) {
			errorMsg = "รหัสผ่านไม่ตรงกัน!";
			return;
		}

		errorMsg = "";
		isLoading = true;

		try {
			const res = await fetch(`${getServerUrl()}/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password, gender })
			});

			const data = await res.json();
			if (res.ok) {
				localStorage.setItem("drami_token", data.token);
				localStorage.setItem("drami_user", JSON.stringify(data.user));
				localStorage.setItem("drami_gender", gender);
				window.location.href = '/game';
			} else {
				errorMsg = data.error || "การลงทะเบียนล้มเหลว";
			}
		} catch (e) {
			errorMsg = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Drami Online | สร้างบัญชี</title>
	<meta name="description" content="สร้างบัญชี Drami Online แล้วเริ่มการผจญภัยในโลกแฟนตาซีพิกเซลอาร์ต MMORPG!" />
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

	<!-- Discord Button -->
	<button class="btn-discord" id="btn-discord-register">
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
		</svg>
		เข้าร่วม Discord!
	</button>
	
	<!-- Server Status (Bottom-Left) -->
	<div class="server-status-badge">
		<div class="status-dot {serverOnline ? 'online' : 'offline'}"></div>
		<span class="status-text">
			เซิร์ฟเวอร์: {serverOnline ? 'ONLINE' : 'OFFLINE'}
		</span>
	</div>

	<!-- Version Badge -->
	<div class="version-badge">v. BETA</div>

	<!-- Main Content -->
	<div class="auth-overlay">
		<!-- Game Logo -->
		<div class="game-logo-container fade-in">
			<h1 class="game-logo-text">DRAMI</h1>
			<div class="game-logo-subtext">ONLINE</div>
		</div>

		<!-- Register Card -->
		<div class="auth-card register-card fade-in" style="animation-delay: 0.15s;">
			<h2>สร้างบัญชีนักผจญภัย</h2>

			<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="register-form">
				{#if errorMsg}
					<div class="auth-error fade-in">{errorMsg}</div>
				{/if}

				<!-- Row 1: Character Info -->
				<div class="form-row">
					<div class="auth-input-group flex-2">
						<label for="reg-username">ชื่อตัวละคร</label>
						<div class="input-wrapper">
							<input type="text" id="reg-username" class="auth-input" placeholder="Hero Name" required bind:value={username} />
						</div>
					</div>
					
					<div class="auth-input-group flex-1">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label>เพศ</label>
						<div class="gender-selector">
							<label class="gender-btn {gender === 'male' ? 'active' : ''}">
								<input type="radio" value="male" bind:group={gender} name="gender">
								<span title="ชาย" style="display: flex; align-items: center; justify-content: center;"><Icon name="male" size={16} /></span>
							</label>
							<label class="gender-btn {gender === 'female' ? 'active' : ''}">
								<input type="radio" value="female" bind:group={gender} name="gender">
								<span title="หญิง" style="display: flex; align-items: center; justify-content: center;"><Icon name="female" size={16} /></span>
							</label>
						</div>
					</div>
				</div>



				<!-- Row 2: Email -->
				<div class="auth-input-group">
					<label for="reg-email">อีเมล</label>
					<div class="input-wrapper">
						<input type="email" id="reg-email" class="auth-input" placeholder="hero@drami.online" required bind:value={email} />
					</div>
				</div>

				<!-- Row 3: Passwords -->
				<div class="form-row">
					<div class="auth-input-group" style="position: relative;">
						<label for="reg-password">รหัสผ่าน</label>
						<div class="input-wrapper">
							<input type={showPassword ? 'text' : 'password'} id="reg-password" class="auth-input" placeholder="••••••••" required minlength="6" bind:value={password} />
							<button type="button" class="password-toggle" onclick={() => showPassword = !showPassword}>
								<Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
							</button>
						</div>
					</div>
					<div class="auth-input-group">
						<label for="reg-confirm">ยืนยันรหัส</label>
						<div class="input-wrapper">
							<input type={showPassword ? 'text' : 'password'} id="reg-confirm" class="auth-input" placeholder="••••••••" required minlength="6" bind:value={confirmPassword} />
						</div>
					</div>
				</div>

				<button type="submit" class="btn-primary-gold" id="btn-register-submit" style="margin-top: 0.5rem;" disabled={isLoading}>
					{isLoading ? 'กำลังร่ายมนตร์...' : 'สร้างตัวละคร & เข้าสู่โลก'}
				</button>
			</form>

			<div class="auth-link">
				มีบัญชีอยู่แล้ว? <a href="/">เข้าสู่ระบบที่นี่</a>
			</div>
		</div>
	</div>
</div>


