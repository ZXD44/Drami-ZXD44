import { playerSummary, addChatMessage } from "$lib/game-ui";
import { getServerUrl } from "$lib/game/config";

/**
 * Service to handle player-related business logic (Avatar, Character Creation)
 */

export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '1aa357e65c7f52d080aa13859e6040ec';
export const getApiBaseUrl = () => getServerUrl();

/**
 * Uploads an image to ImgBB and updates player avatar in backend and local state
 */
export async function uploadAvatar(file: File) {
	const formData = new FormData();
	formData.append('image', file);

	try {
		const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
			method: 'POST',
			body: formData
		});

		const data = await response.json();
		if (!data.success) throw new Error(data.error?.message || "Upload failed");

		const newAvatarUrl = data.data.url;
		
		// Update Frontend
		playerSummary.update(p => ({ ...p, avatar: newAvatarUrl }));

		// Update LocalStorage
		const userStr = localStorage.getItem("drami_user");
		if (userStr) {
			const user = JSON.parse(userStr);
			user.avatar = newAvatarUrl;
			localStorage.setItem("drami_user", JSON.stringify(user));
		}

		// Sync Backend
		const userObj = userStr ? JSON.parse(userStr) : null;
		if (userObj?.id) {
			await fetch(`${getApiBaseUrl()}/api/update-avatar`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: userObj.id, avatarUrl: newAvatarUrl })
			});
		}

		addChatMessage("[ระบบ] อัปโหลดรูปภาพโปรไฟล์เรียบร้อย!");
		return newAvatarUrl;
	} catch (err) {
		console.error("Avatar Upload Error:", err);
		addChatMessage("[ระบบ] เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
		throw err;
	}
}

/**
 * Creates/Updates character config (from Avatar Creator)
 */
export async function createCharacter(characterData: any) {
	try {
		// Update Store
		playerSummary.update(p => ({
			...p,
			name: characterData.username,
			gender: characterData.gender,
			playerClass: characterData.playerClass,
			avatar: characterData.avatar || p.avatar // Could be a default or custom
		}));

		// Update LocalStorage
		const userStr = localStorage.getItem("drami_user");
		if (userStr) {
			const user = JSON.parse(userStr);
			user.username = characterData.username;
			user.avatar = characterData.avatar || user.avatar; 
			user.characterCreated = true;
			localStorage.setItem("drami_user", JSON.stringify(user));
		}

		// Sync Backend
		const userObj = userStr ? JSON.parse(userStr) : null;
		if (userObj?.id) {
			await fetch(`${getApiBaseUrl()}/api/create-character`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: userObj.id, ...characterData })
			});
		}

		addChatMessage(`[ระบบ] ยินดีต้อนรับสู่โลก Drami! คุณเริ่มการผจญภัยในฐานะ ${characterData.playerClass}`);
		return true;
	} catch (e) {
		console.error("Character Creation Error:", e);
		throw e;
	}
}
