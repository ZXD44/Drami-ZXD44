import { writable, derived } from 'svelte/store';

// ============================================
// ข้อมูลผู้เล่น (Reactive Store)
// ============================================
export const playerPos = writable({ x: 1200, y: 900 });

export const playerSummary = writable({
	name: "นักผจญภัย",
	role: "member", // 'member' | 'admin'
	gender: "male", // 'male' | 'female'
	avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=adventurer", 
	title: "ผู้มาใหม่",
	level: 1,
	exp: { current: 0, max: 100 },
	hp: { current: 50, max: 50 },
	mp: { current: 20, max: 20 },
	stamina: { current: 30, max: 30 },
	gold: 0,
	silver: 0,
	diamonds: 0, // NEW: Premium Currency
	woodSigils: 0,
	location: "ป่าแสงหิ่งห้อย",
	server: "Drami-01",
	clan: "สมาชิกทั่วไป"
});

// ค่า Bar อัตโนมัติ
export const hpRatio = derived(playerSummary, ($p) =>
	$p.hp.max > 0 ? ($p.hp.current / $p.hp.max) * 100 : 0
);
export const mpRatio = derived(playerSummary, ($p) =>
	$p.mp.max > 0 ? ($p.mp.current / $p.mp.max) * 100 : 0
);
export const staminaRatio = derived(playerSummary, ($p) =>
	$p.stamina.max > 0 ? ($p.stamina.current / $p.stamina.max) * 100 : 0
);
export const expRatio = derived(playerSummary, ($p) =>
	$p.exp.max > 0 ? ($p.exp.current / $p.exp.max) * 100 : 0
);

// ============================================
// เควส
// ============================================
export const quests = writable<{
	name: string;
	progress: string;
	reward: string;
	description: string;
	completed: boolean;
}[]>([]);

// ============================================
// ทักษะ (Life Skills & Combat จาก Drami-MMORPG)
// ============================================
export const skills = writable<{
	id: string;
	name: string;
	description: string;
	image: string;
	level: number;
	tone: string;
	exp: number;
	maxExp: number;
}>([
	{ id: "woodcutting", name: "ตัดไม้", description: "ทักษะการตัดไม้ รวบรวมฟืนและไม้เพื่อเพิ่มทักษะนี้", image: "/assets/items/woodcutting.png", level: 1, tone: "amber", exp: 0, maxExp: 100 },
	{ id: "mining", name: "ทำเหมือง", description: "ทักษะการทำเหมือง ขุดแร่เพื่อเพิ่มทักษะนี้", image: "/assets/items/mining.png", level: 1, tone: "stone", exp: 0, maxExp: 100 },
	{ id: "farming", name: "ทำฟาร์ม", description: "ทักษะการทำฟาร์ม รวบรวมผลไม้และผักเพื่อเพิ่มทักษะนี้", image: "/assets/items/harvest.png", level: 1, tone: "green", exp: 0, maxExp: 100 },
	{ id: "combat", name: "การต่อสู้ระยะประชิด", description: "ทักษะการต่อสู้ กำจัดมอนสเตอร์เพื่อฝึกฝนร่างกาย", image: "/assets/items/resources-tree.png", level: 1, tone: "red", exp: 0, maxExp: 100 }
]);

// ============================================
// กระเป๋าไอเทม
// ============================================
export const inventory = writable<{
	name: string;
	qty: number;
	rarity: string;
	icon: string;
}[]>([]);

// ============================================
// ปาร์ตี้
// ============================================
export const party = writable<{
	name: string;
	role: string;
	status: string;
	hp: number;
	maxHp: number;
}[]>([]);

// ============================================
// แชท
// ============================================
export const chatFeed = writable<string[]>([
	"[ระบบ] ยินดีต้อนรับสู่ Drami Online! การผจญภัยเริ่มต้นแล้ว",
	"[ระบบ] ใช้ลูกศร หรือ WASD เพื่อเดิน",
]);

// แท็บแชท
export const activeChatTab = writable<string>('ทั้งหมด');

// ============================================
// คราฟ
// ============================================
export const crafting = writable<{
	name: string;
	needs: string;
	ready: boolean;
}[]>([]);

// ============================================
// Hotbar สกิล (4 ช่อง)
// ============================================
export const hotbarSkills = writable<{
	icon: string;
	name: string;
	key: string;
	cooldown: number;
}[]>([
	{ icon: '', name: 'ว่าง', key: '1', cooldown: 0 },
	{ icon: '', name: 'ว่าง', key: '2', cooldown: 0 },
	{ icon: '', name: 'ว่าง', key: '3', cooldown: 0 },
	{ icon: '', name: 'ว่าง', key: '4', cooldown: 0 },
]);

// Slot ที่เลือก
export const selectedSlot = writable<number>(-1);

// Action bar เดิม (ยังเก็บไว้)
export const actionBarSlots = writable<{
	icon: string;
	key: string;
	name: string;
	cooldown: number;
}[]>([]);

// ============================================
// การตั้งค่า
// ============================================
export const gameSettings = writable({
	musicVolume: 50,
	sfxVolume: 70,
	showNames: true,
	showDamage: true,
	chatOpacity: 80,
	cameraZoom: 1.5,
});

export const chatBubbles = writable<{ name: string, message: string, sessionId?: string } | null>(null);
export const activeAnnouncement = writable<string | null>(null);

// Notifications
export type NotificationType = 'info' | 'success' | 'error' | 'warning' | 'general';
export const notifications = writable<{ id: number; type: NotificationType; message: string }[]>([]);

let notifTimeout: any = null;
let nextNotifId = 0;
export function showNotification(message: string, type: NotificationType = 'info') {
    const id = nextNotifId++;
    if (notifTimeout) clearTimeout(notifTimeout);
    
    // แสดงแจ้งเตือนตัวเดียวเท่านั้น (แทนที่ตัวเก่า)
    notifications.set([{ id, type, message }]);
    
    notifTimeout = setTimeout(() => {
        notifications.set([]);
        notifTimeout = null;
    }, 4500);
}

let announcementTimeout: any = null;
export function showAnnouncement(message: string, duration: number = 28000) {
    if (announcementTimeout) clearTimeout(announcementTimeout);
    
    activeAnnouncement.set(message);
    
    announcementTimeout = setTimeout(() => {
        activeAnnouncement.set(null);
        announcementTimeout = null;
    }, duration);
}

// Bridge for UI to send messages to Server via Game.svelte
export const networkMsg = writable<{ type: string, data: any } | null>(null);

export function sendServerMessage(type: string, data: any) {
	networkMsg.set({ type, data });
}

// Confirmation Dialog System
export type ConfirmOptions = {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
    onConfirm: () => void;
    onCancel?: () => void;
};

export const currentConfirm = writable<ConfirmOptions | null>(null);

export function askConfirm(options: ConfirmOptions) {
    currentConfirm.set(options);
}

// ============================================
// ฟังก์ชัน: เพิ่มข้อความแชท
// ============================================
export function addChatMessage(message: string) {
	chatFeed.update(feed => {
		const newFeed = [...feed, message];
		if (newFeed.length > 50) newFeed.shift();
		return newFeed;
	});
}

// ============================================
// ฟังก์ชัน: เพิ่มไอเทม
// ============================================
export function addItem(item: { name: string; qty: number; rarity: string; icon: string }) {
	inventory.update(items => {
		const existing = items.find(i => i.name === item.name);
		if (existing) {
			existing.qty += item.qty;
			return [...items];
		}
		return [...items, { ...item }];
	});
}

// ============================================
// ฟังก์ชัน: รับ EXP
// ============================================
export function gainExp(amount: number) {
	playerSummary.update(p => {
		p.exp.current += amount;
		while (p.exp.current >= p.exp.max) {
			p.exp.current -= p.exp.max;
			p.level++;
			p.exp.max = Math.floor(p.exp.max * 1.5);
			p.hp.max += 10;
			p.hp.current = p.hp.max;
			p.mp.max += 5;
			p.mp.current = p.mp.max;
			p.stamina.max += 5;
			p.stamina.current = p.stamina.max;
			addChatMessage(`[ระบบ] ✨ เลเวลอัพ! คุณเป็นเลเวล ${p.level} แล้ว!`);
		}
		return p;
	});
}
