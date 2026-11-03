import { get } from 'svelte/store';
import { playerSummary, sendServerMessage } from '$lib/game-ui';

export function initDramiShield() {
	// --- Console Security Warning (Thai Version) ---
	console.log(
		"%c  ____  ____   QUOI   __  __  ___ \n |  _ \\|  _ \\ / _ \\ |  \\/  ||_ _|\n | | | | |_) | |_| || |\\/| | | | \n | |_| |  _ <|  _  || |  | | | | \n |____/|_| \\_\\_| |_||_|  |_||___|\n",
		"color: #f0c040; font-weight: bold; font-size: 16px; text-shadow: 2px 2px #000;"
	);
	console.log(
		"%cหยุดเดี๋ยวนี้!!!",
		"color: #ff4444; font-size: 50px; font-weight: bold; -webkit-text-stroke: 1px black; font-family: 'IBM Plex Sans Thai', sans-serif;"
	);
	console.log(
		"%cนี่คือฟีเจอร์สำหรับนักพัฒนาซอฟต์แวร์เท่านั้น หากมีใครบอกให้คุณก๊อปปี้โค้ดมาวางที่นี่เพื่อรับทองหรือเพชรฟรี มันคือการหลอกลวง (SCAM) และจะทำให้เขาขโมยไอดีของคุณไปได้!",
		"color: #ffffff; font-size: 18px; font-weight: bold; font-family: 'IBM Plex Sans Thai', sans-serif;"
	);
	console.log(
		"%cการพยายามเจาะระบบหรือดัดแปลงเกม Drami Online จะส่งผลให้ถูกแบนทันที! และจะมีการบันทึกหลักฐาน Hardware ID เพื่อดำเนินการขั้นเด็ดขาด เรากำลังเฝ้าดูคุณอยู่...",
		"color: #ffaa00; font-size: 14px; font-style: italic; font-weight: bold; font-family: 'IBM Plex Sans Thai', sans-serif;"
	);

	// --- Drami Shield: Anti-DevTools Policy ---
	const preventDevTools = (e: any) => {
		const role = get(playerSummary).role;
		if (role === 'admin') return; // Bypass for Admins
		
		// Block Right Click
		if (e.type === 'contextmenu') {
			e.preventDefault();
			return false;
		}
		
		// Block Shortcuts
		if (e.type === 'keydown') {
			const isCtrlOrMeta = e.ctrlKey || e.metaKey;
			const isShift = e.shiftKey;
			
			// F12, Ctrl+Shift+I/J/C, Ctrl+U
			if (
				e.keyCode === 123 || // F12
				(isCtrlOrMeta && isShift && [73, 74, 67].includes(e.keyCode)) || // Ctrl+Shift+I/J/C
				(isCtrlOrMeta && e.keyCode === 85) // Ctrl+U (View Source)
			) {
				e.preventDefault();
				console.warn("🛡️ Drami Shield: Access Denied. Admins Only.");
				return false;
			}
		}
	};

	window.addEventListener('contextmenu', preventDevTools);
	window.addEventListener('keydown', preventDevTools);

	// --- Anti-Cheat Detection Loop ---
	const checkDevTools = () => {
		const role = get(playerSummary).role;
		if (role === 'admin') return;
		
		const startTime = Date.now();
		// DevTools detection via time auditing
		(function() { debugger; })(); 
		const endTime = Date.now();
		
		// If gap > 100ms, execution was paused (DevTools open)
		if (endTime - startTime > 100) {
			console.error("🚨 Anti-Cheat: Tampering detected.");
			sendServerMessage('cheat_detected', {});
			
			// Force immediate kick visual
			alert("🚨 ระบบตรวจพบการพยายามดัดแปลงข้อมูล! บัญชีของคุณถูกระงับชั่วคราว 1 นาที");
			window.location.href = '/';
		}
	};

	const antiCheatInterval = setInterval(checkDevTools, 2000);

	// --- MutationObserver: UI Integrity Guard ---
	const observerConfig = { attributes: true, childList: true, subtree: true };
	const uiObserver = new MutationObserver((mutations) => {
		const role = get(playerSummary).role;
		if (role === 'admin') return;
		
		for (const mutation of mutations) {
			// Detection of element deletion or manual attribute modification
			if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
				// Check if a critical UI element was removed
				const wasCritical = Array.from(mutation.removedNodes).some(node => {
					const el = node as HTMLElement;
					return el.id === 'game-hud' || el.id === 'game-gold' || el.classList?.contains('panel-overlay');
				});
				
				if (wasCritical) {
					console.error("🚨 UI Integrity Violation: Critical element removed.");
					sendServerMessage('cheat_detected', {});
					window.location.href = '/';
				}
			}
		}
	});
	uiObserver.observe(document.body, observerConfig);

	return () => {
		window.removeEventListener('contextmenu', preventDevTools);
		window.removeEventListener('keydown', preventDevTools);
		clearInterval(antiCheatInterval);
		uiObserver.disconnect();
	};
}
