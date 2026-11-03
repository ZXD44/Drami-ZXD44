<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Icon from './components/Icon.svelte';
	
	let { username = "Adventurer", gender = "male" } = $props();
	const dispatch = createEventDispatcher();

	// ==================== OPTION DEFINITIONS ====================
	// These match the extracted layer filenames in /characters/layers/{gender}/
	
	const hairOptions = [
		{ id: 'xlong', name: 'ผมยาว' },
		{ id: 'flat_top_fade', name: 'ผมสั้น' },
	];

	// Gender-specific options
	const shirtOptionsByGender: Record<string, {id: string, name: string}[]> = {
		male: [
			{ id: 'longsleeve', name: 'เสื้อแขนยาว' },
			{ id: 'longsleeve2', name: 'เสื้อแขนยาว 2' },
			{ id: 'shortsleeve', name: 'เสื้อแขนสั้น' },
			{ id: 'tshirt', name: 'เสื้อยืด' },
		],
		female: [
			{ id: 'longsleeve', name: 'เสื้อแขนยาว' },
			{ id: 'longsleeve2', name: 'เสื้อแขนยาว 2' },
			{ id: 'shortsleeve', name: 'เสื้อแขนสั้น' },
			{ id: 'blouse', name: 'เสื้อเบลาส์' },
			{ id: 'corset', name: 'คอร์เซ็ท' },
		],
	};

	const pantsOptionsByGender: Record<string, {id: string, name: string}[]> = {
		male: [
			{ id: 'pants', name: 'กางเกงขายาว' },
			{ id: 'shorts', name: 'กางเกงขาสั้น' },
			{ id: 'leggings', name: 'เลกกิ้ง' },
		],
		female: [
			{ id: 'pants', name: 'กางเกงขายาว' },
			{ id: 'skirt_plain', name: 'กระโปรง' },
			{ id: 'skirt_slit', name: 'กระโปรงผ่า' },
		],
	};

	const shoesOptionsByGender: Record<string, {id: string, name: string}[]> = {
		male: [
			{ id: 'shoes_basic', name: 'รองเท้า' },
			{ id: 'boots_basic', name: 'บูทธรรมดา' },
			{ id: 'boots_fold', name: 'บูทพับ' },
			{ id: 'sandals', name: 'รองเท้าแตะ' },
		],
		female: [
			{ id: 'shoes_basic', name: 'รองเท้า' },
		],
	};

	const classes = [
		{ id: "knight", name: "Knight", nameTH: "อัศวิน",
		  desc: "นักรบผู้สวมเกราะหนา เชี่ยวชาญการรบประชิดและปกป้องพันธมิตร",
		  iconName: "swords", color: "#8b2c2c" },
		{ id: "rogue", name: "Rogue", nameTH: "โจร",
		  desc: "ปรมาจารย์แห่งการลอบเร้น หลบหลีกศัตรูเพื่อโจมตีอย่างร้ายกาจ",
		  iconName: "swords", color: "#4c6e4b" },
		{ id: "cleric", name: "Cleric", nameTH: "นักบวช",
		  desc: "ผู้รักษาผู้ศรัทธา ใช้เวทมนตร์ศักดิ์สิทธิ์เยียวยาบาดแผลและปราบอสูร",
		  iconName: "sparkles", color: "#9da1aa" },
		{ id: "mage", name: "Mage", nameTH: "จอมเวท",
		  desc: "นักวิชาการแห่งศาสตร์มืด บัญชาการร่ายเวทธาตุทำลายล้างศัตรู",
		  iconName: "sparkles", color: "#2e4874" },
	];

	// ==================== STATE ====================
	let hairIndex = $state(0);
	let shirtIndex = $state(0);
	let pantsIndex = $state(0);
	let shoesIndex = $state(0);
	let selectedClass = $state("knight");

	// ==================== DERIVED ====================
	let shirtOptions = $derived(shirtOptionsByGender[gender] || shirtOptionsByGender.male);
	let pantsOptions = $derived(pantsOptionsByGender[gender] || pantsOptionsByGender.male);
	let shoesOptions = $derived(shoesOptionsByGender[gender] || shoesOptionsByGender.male);

	let currentHair = $derived(hairOptions[hairIndex % hairOptions.length]);
	let currentShirt = $derived(shirtOptions[shirtIndex % shirtOptions.length]);
	let currentPants = $derived(pantsOptions[pantsIndex % pantsOptions.length]);
	let currentShoes = $derived(shoesOptions[shoesIndex % shoesOptions.length]);
	let activeClassObj = $derived(classes.find(c => c.id === selectedClass) || classes[0]);

	// Layer image paths (64x64 transparent PNGs)
	const layerBase = $derived(`/characters/layers/${gender}`);
	let bodyUrl    = $derived(`${layerBase}/body-default.png`);
	let headUrl    = $derived(`${layerBase}/head-human.png`);
	let faceUrl    = $derived(`${layerBase}/face-neutral.png`);
	let pantsUrl   = $derived(`${layerBase}/pants-${currentPants.id}.png`);
	let shoesUrl   = $derived(`${layerBase}/shoes-${currentShoes.id}.png`);
	let shirtUrl   = $derived(`${layerBase}/shirt-${currentShirt.id}.png`);
	let hairUrl    = $derived(`${layerBase}/hair-${currentHair.id}.png`);

	// ==================== HANDLERS ====================
	function next(type: string) {
		if (type === 'hair') hairIndex = (hairIndex + 1) % hairOptions.length;
		if (type === 'shirt') shirtIndex = (shirtIndex + 1) % shirtOptions.length;
		if (type === 'pants') pantsIndex = (pantsIndex + 1) % pantsOptions.length;
		if (type === 'shoes') shoesIndex = (shoesIndex + 1) % shoesOptions.length;
	}

	function prev(type: string) {
		if (type === 'hair') hairIndex = (hairIndex - 1 + hairOptions.length) % hairOptions.length;
		if (type === 'shirt') shirtIndex = (shirtIndex - 1 + shirtOptions.length) % shirtOptions.length;
		if (type === 'pants') pantsIndex = (pantsIndex - 1 + pantsOptions.length) % pantsOptions.length;
		if (type === 'shoes') shoesIndex = (shoesIndex - 1 + shoesOptions.length) % shoesOptions.length;
	}

	function handleCreate() {
		dispatch('create', {
			username, gender,
			hair: currentHair.id,
			shirt: currentShirt.id,
			pants: currentPants.id,
			shoes: currentShoes.id,
			playerClass: selectedClass
		});
	}
</script>

<div class="avatar-creator-window">
	<div class="ac-inner-border">
		
		<!-- Header -->
		<div class="ac-header">
			<div class="ac-username-container">
				<span class="ac-username-label"><Icon name="swords" size={18} color="#f6d860" /></span>
				<input type="text" class="ac-username-input" bind:value={username} placeholder="ตั้งชื่อตัวละคร" />
			</div>
		</div>

		<div class="ac-content">
			<!-- Left Column: Customization -->
			<div class="ac-col-left">
				{#each [
					{ type: 'hair', label: 'ทรงผม', idx: hairIndex, max: hairOptions.length, current: currentHair.name },
					{ type: 'shirt', label: 'เสื้อ', idx: shirtIndex, max: shirtOptions.length, current: currentShirt.name },
					{ type: 'pants', label: 'กางเกง', idx: pantsIndex, max: pantsOptions.length, current: currentPants.name },
					{ type: 'shoes', label: 'รองเท้า', idx: shoesIndex, max: shoesOptions.length, current: currentShoes.name },
				] as opt}
					<div class="ac-toggle-row">
						<button class="ac-arrow-btn" onclick={() => prev(opt.type)}>◀</button>
						<div class="ac-toggle-label">
							<span class="ac-label-text">{opt.label}</span>
							<span class="ac-label-counter">{opt.idx % opt.max + 1}/{opt.max}</span>
						</div>
						<button class="ac-arrow-btn" onclick={() => next(opt.type)}>▶</button>
					</div>
				{/each}

				<div class="ac-gender-badge" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
					<Icon name={gender === 'male' ? 'male' : 'female'} size={16} /> {gender === 'male' ? 'เพศชาย' : 'เพศหญิง'}
				</div>
			</div>

			<!-- Center: Character Preview -->
			<div class="ac-col-center">
				<div class="ac-preview-box">
					<div class="ac-preview-glow"></div>
					<div class="ac-sprite-stack">
						<!-- Layers stacked bottom-to-top (render order) -->
						<img src={bodyUrl}  class="ac-layer" alt="body"   draggable="false" />
						<img src={headUrl}  class="ac-layer" alt="head"   draggable="false" />
						<img src={faceUrl}  class="ac-layer" alt="face"   draggable="false" />
						<img src={pantsUrl} class="ac-layer" alt="pants"  draggable="false" />
						<img src={shoesUrl} class="ac-layer" alt="shoes"  draggable="false" />
						<img src={shirtUrl} class="ac-layer" alt="shirt"  draggable="false" />
						<img src={hairUrl}  class="ac-layer" alt="hair"   draggable="false" />
					</div>
					<div class="ac-preview-shadow"></div>
					<div class="ac-preview-label">{currentHair.name} • {currentShirt.name}</div>
				</div>
			</div>

			<!-- Right Column: Class Selection -->
			<div class="ac-col-right">
				<div class="ac-class-info-box">
					<div class="ac-class-badge" style="background: {activeClassObj.color};">
						<span class="ac-class-icon"><Icon name={activeClassObj.iconName} size={22} color="#fff" /></span>
					</div>
					<h3 class="ac-class-title">{activeClassObj.name}</h3>
					<p class="ac-class-subtitle">{activeClassObj.nameTH}</p>
					<p class="ac-class-desc">{activeClassObj.desc}</p>
				</div>

				<div class="ac-class-icons">
					{#each classes as cls}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="ac-icon {selectedClass === cls.id ? 'ac-icon-active' : ''}"
							style="background-color: {cls.color};"
							onclick={() => selectedClass = cls.id}
							title={cls.nameTH}
						>
							<Icon name={cls.iconName} size={20} color="#fff" />
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="ac-footer">
			<button class="ac-btn ac-btn-cancel" onclick={() => dispatch('cancel')}>
				<span class="ac-btn-icon">✕</span> ยกเลิก
			</button>
			<button class="ac-btn ac-btn-create" onclick={handleCreate}>
				<span class="ac-btn-icon">✓</span> สร้างตัวละคร
			</button>
		</div>
	</div>
</div>

<style>
	.avatar-creator-window {
		width: 100%; max-width: 840px;
		background: linear-gradient(180deg, #3a2a1a 0%, #2a1e12 100%);
		border: 3px solid #1a1008; border-radius: 12px; padding: 4px;
		font-family: 'Segoe UI', 'Courier New', monospace;
		box-shadow: 0 0 0 1px #8b6914 inset, 0 20px 60px rgba(0,0,0,0.8), 0 0 80px rgba(139,105,20,0.15);
		margin: 20px auto;
		animation: fadeScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }

	.ac-inner-border {
		border: 2px solid #5a4020; border-radius: 8px; padding: 18px;
		display: flex; flex-direction: column;
		background: linear-gradient(180deg, rgba(90,64,32,0.15) 0%, rgba(30,20,10,0.1) 100%);
	}

	/* HEADER */
	.ac-header { display: flex; justify-content: center; margin-bottom: 18px; }
	.ac-username-container {
		background: linear-gradient(180deg, #1a1008, #0d0a05); border: 2px solid #8b6914;
		border-radius: 10px; padding: 6px 20px; display: flex; align-items: center; gap: 8px;
		box-shadow: 0 2px 12px rgba(139,105,20,0.25), inset 0 1px 0 rgba(255,255,255,0.05);
	}
	.ac-username-label { font-size: 1.1rem; filter: drop-shadow(0 0 4px rgba(251,191,36,0.5)); }
	.ac-username-input {
		background: transparent; border: none; color: #fbbf24; font-size: 1.1rem;
		text-align: center; font-weight: 700; outline: none; width: 200px;
		letter-spacing: 0.5px; text-shadow: 0 0 8px rgba(251,191,36,0.3);
	}
	.ac-username-input::placeholder { color: #6b5520; font-weight: 500; }

	/* CONTENT */
	.ac-content { display: flex; justify-content: space-between; align-items: stretch; gap: 16px; }

	/* LEFT */
	.ac-col-left { flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
	.ac-toggle-row { display: flex; align-items: center; }
	.ac-arrow-btn {
		background: linear-gradient(180deg, #4a3520, #3a2815); border: 2px solid #6b4e2a;
		border-radius: 6px; color: #d4a850; width: 32px; height: 36px; font-size: 0.85rem;
		cursor: pointer; display: flex; align-items: center; justify-content: center;
		box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: all 0.15s;
	}
	.ac-arrow-btn:hover { background: linear-gradient(180deg, #5a4525, #4a3518); border-color: #8b6914; color: #fbbf24; }
	.ac-arrow-btn:active { transform: scale(0.92); box-shadow: none; }

	.ac-toggle-label {
		flex: 1; text-align: center;
		background: linear-gradient(180deg, #3a2818, #2d1e10); border: 2px solid #5a4020;
		margin: 0 6px; padding: 7px 6px; border-radius: 6px;
		font-weight: 700; font-size: 0.78rem; color: #d4a850;
		text-shadow: 0 1px 2px rgba(0,0,0,0.5);
		display: flex; align-items: center; justify-content: center; gap: 5px;
	}
	.ac-label-icon { font-size: 0.85rem; }
	.ac-label-text { flex: 1; text-align: center; }
	.ac-label-counter { font-size: 0.7rem; color: #8b6914; background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; }

	.ac-gender-badge {
		text-align: center; padding: 7px; margin-top: 4px;
		background: linear-gradient(180deg, #1a1008, #0d0a05); border: 1px solid #5a4020;
		border-radius: 6px; color: #8b6914; font-size: 0.78rem; font-weight: 700;
		letter-spacing: 1px; text-transform: uppercase;
	}

	/* CENTER */
	.ac-col-center { flex: 0 0 200px; display: flex; justify-content: center; align-items: center; }
	.ac-preview-box {
		width: 190px; height: 280px;
		background: linear-gradient(180deg, #2a1e12 0%, #1a1008 50%, #2a1e12 100%);
		border: 2px solid #5a4020; border-radius: 14px;
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		position: relative; overflow: hidden;
		box-shadow: inset 0 0 30px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3);
	}
	.ac-preview-glow {
		position: absolute; width: 120px; height: 120px;
		background: radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%);
		border-radius: 50%; pointer-events: none;
	}

	/* THE KEY PART: stacked layers for live preview */
	.ac-sprite-stack {
		width: 64px; height: 64px;
		position: relative;
		transform: scale(3);
		image-rendering: pixelated;
		z-index: 2;
	}
	.ac-layer {
		position: absolute; top: 0; left: 0;
		width: 64px; height: 64px;
		image-rendering: pixelated;
		pointer-events: none;
		transition: opacity 0.15s ease;
	}

	.ac-preview-shadow {
		width: 50px; height: 10px;
		background: radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%);
		border-radius: 50%; margin-top: 28px; z-index: 1;
	}
	.ac-preview-label {
		position: absolute; bottom: 8px;
		color: #8b6914; font-size: 0.62rem; font-weight: 600;
		text-align: center; opacity: 0.7; z-index: 3;
	}

	/* RIGHT */
	.ac-col-right { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
	.ac-class-info-box {
		background: linear-gradient(180deg, #3a2818, #2d1e10); border: 2px solid #5a4020;
		border-radius: 10px; padding: 14px; flex: 1; margin-bottom: 12px;
		text-align: center; display: flex; flex-direction: column; align-items: center;
	}
	.ac-class-badge {
		width: 44px; height: 44px; border-radius: 50%;
		display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
		border: 2px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.3);
	}
	.ac-class-icon { font-size: 1.4rem; filter: drop-shadow(0 0 4px rgba(255,255,255,0.3)); }
	.ac-class-title {
		margin: 0; font-weight: 900; font-size: 1.1rem; color: #fbbf24;
		text-shadow: 0 0 8px rgba(251,191,36,0.3); letter-spacing: 0.5px;
	}
	.ac-class-subtitle { margin: 2px 0 6px 0; color: #8b6914; font-size: 0.75rem; font-weight: 600; }
	.ac-class-desc { margin: 0; font-size: 0.78rem; line-height: 1.5; color: #a08050; }

	.ac-class-icons { display: flex; justify-content: center; gap: 8px; }
	.ac-icon {
		width: 46px; height: 46px; border: 2px solid #1a1008; border-radius: 10px;
		display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
		cursor: pointer; transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
		box-shadow: 0 3px 8px rgba(0,0,0,0.4);
	}
	.ac-icon:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 16px rgba(0,0,0,0.5); }
	.ac-icon-active {
		border-color: #fbbf24;
		box-shadow: 0 0 0 2px rgba(251,191,36,0.3), 0 4px 16px rgba(251,191,36,0.25);
		transform: translateY(-2px);
	}

	/* FOOTER */
	.ac-footer { display: flex; justify-content: center; gap: 16px; margin-top: 18px; }
	.ac-btn {
		padding: 10px 28px; font-size: 1rem; font-weight: 800; border-radius: 10px;
		cursor: pointer; color: white; border: 2px solid rgba(0,0,0,0.3);
		display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;
		transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
	}
	.ac-btn-icon { font-size: 0.9rem; }
	.ac-btn:active { transform: scale(0.95); }
	.ac-btn-cancel {
		background: linear-gradient(180deg, #8b2020, #6b1515);
		box-shadow: 0 4px 12px rgba(139,32,32,0.4);
	}
	.ac-btn-cancel:hover {
		background: linear-gradient(180deg, #a52525, #8b1515);
		box-shadow: 0 6px 20px rgba(139,32,32,0.6); transform: translateY(-2px);
	}
	.ac-btn-create {
		background: linear-gradient(180deg, #2d8b30, #1a6b1d);
		box-shadow: 0 4px 12px rgba(45,139,48,0.4);
	}
	.ac-btn-create:hover {
		background: linear-gradient(180deg, #35a538, #228b25);
		box-shadow: 0 6px 20px rgba(45,139,48,0.6); transform: translateY(-2px);
	}
</style>
