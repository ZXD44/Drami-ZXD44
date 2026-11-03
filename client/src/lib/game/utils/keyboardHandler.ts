import { selectedSlot } from "$lib/game-ui";

/**
 * Maps keyboard keys to their actions for the game viewport
 */

export function triggerVisualFeedback(selector: string) {
	const el = document.querySelector(selector);
	if (el) {
		el.classList.add('is-pressed');
		setTimeout(() => el.classList.remove('is-pressed'), 100);
	}
}

export type GameAction = 
	| 'chat' | 'inventory' | 'mainMenu' | 'party' 
	| 'quests' | 'skills' | 'emoji' | 'settings' | 'close' | 'slot0' | 'slot1' | 'slot2' | 'slot3';

export function getActionByKeyCode(code: string): GameAction | null {
	switch (code) {
		case 'KeyC': return 'chat';
		case 'KeyB': case 'KeyI': return 'inventory';
		case 'Tab': return 'mainMenu';
		case 'KeyF': case 'KeyP': return 'party';
		case 'KeyQ': return 'quests';
		case 'KeyT': case 'KeyK': return 'skills';
		case 'KeyV': return 'emoji';
		case 'Digit1': return 'slot0';
		case 'Digit2': return 'slot1';
		case 'Digit3': return 'slot2';
		case 'Digit4': return 'slot3';
		case 'Escape': return 'settings';
		default: return null;
	}
}

export function handleGameAction(action: GameAction, toggleFn: (panel: string) => void, closePanels: () => void, isAnyPanelOpen: boolean) {
	switch (action) {
		case 'chat': triggerVisualFeedback('button[title*="(C)"]'); toggleFn('chat'); break;
		case 'inventory': triggerVisualFeedback('button[title*="(B)"]'); toggleFn('inventory'); break;
		case 'mainMenu': triggerVisualFeedback('button[title*="(Tab)"]'); toggleFn('mainMenu'); break;
		case 'party': triggerVisualFeedback('button[title*="(F)"]'); toggleFn('party'); break;
		case 'quests': triggerVisualFeedback('button[title*="(Q)"]'); toggleFn('quests'); break;
		case 'skills': triggerVisualFeedback('button[title*="(T)"]'); toggleFn('skills'); break;
		case 'emoji': triggerVisualFeedback('button[title*="(V)"]'); toggleFn('emoji'); break;
		case 'slot0': triggerVisualFeedback('.hotbar-skill-slot:nth-child(1)'); selectedSlot.set(0); break;
		case 'slot1': triggerVisualFeedback('.hotbar-skill-slot:nth-child(2)'); selectedSlot.set(1); break;
		case 'slot2': triggerVisualFeedback('.hotbar-skill-slot:nth-child(3)'); selectedSlot.set(2); break;
		case 'slot3': triggerVisualFeedback('.hotbar-skill-slot:nth-child(4)'); selectedSlot.set(3); break;
		case 'settings':
			triggerVisualFeedback('button[title*="(ESC)"]');
			if (isAnyPanelOpen) {
				closePanels();
			} else {
				toggleFn('settings');
			}
			break;
	}
}
