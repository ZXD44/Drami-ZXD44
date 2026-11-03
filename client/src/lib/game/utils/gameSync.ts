import { playerSummary } from "$lib/game-ui";

/**
 * Utility to sync player state with localStorage on startup
 */
export function loadPlayerData() {
	if (typeof window !== "undefined") {
		const params = new URLSearchParams(window.location.search);
		const guestId = params.get('guest_id');

		if (guestId) {
			const guestName = `ตัวละครทดสอบ_${guestId}`;
			const guestUser = {
				id: `guest-${guestId}`,
				username: guestName,
				role: "member",
				level: 1,
				gold: 0,
				diamonds: 0,
				exp: 0,
				avatar: `https://api.dicebear.com/9.x/pixel-art/svg?seed=${guestName}_male`
			};
			
			playerSummary.set({
				name: guestUser.username,
				role: guestUser.role,
				gender: "male",
				avatar: guestUser.avatar,
				hp: { current: 100, max: 100 },
				mp: { current: 100, max: 100 },
				stamina: { current: 100, max: 100 },
				level: guestUser.level,
				gold: guestUser.gold,
				silver: 0,
				diamonds: guestUser.diamonds,
				woodSigils: 0,
				exp: { current: guestUser.exp, max: 100 },
				title: "นักผจญภัยมือใหม่ (Guest)",
				location: "เริ่มต้น",
				server: "Test Server",
				clan: ""
			});
			return { success: true, user: guestUser, storedGender: "male", isGuest: true, token: "guest_mock_token" };
		}
	}

	const userStr = localStorage.getItem("drami_user");
	const storedGender = localStorage.getItem("drami_gender") || "male";
	const token = localStorage.getItem("drami_token");

	if (!userStr || !token) {
		return { success: false, redirect: true };
	}

	try {
		const user = JSON.parse(userStr);
		
		playerSummary.set({
			name: user?.username || "Hero",
			role: user?.role || 'member',
			gender: storedGender,
			avatar: user?.avatar || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${user?.username || 'unnamed'}_${storedGender}`,
			hp: { current: 100, max: 100 },
			mp: { current: 100, max: 100 },
			stamina: { current: 100, max: 100 },
			level: user?.level || 1,
			gold: user?.gold || 0,
			silver: 0,
			diamonds: user?.diamonds || 0,
			woodSigils: 0,
			exp: { current: 0, max: 100 },
			title: "นักผจญภัยมือใหม่",
			location: "เริ่มต้น",
			server: "Main Server",
			clan: ""
		});

		return { success: true, user, storedGender };
	} catch (e) {
		console.error("Error loading user data:", e);
		return { success: false, redirect: true };
	}
}
