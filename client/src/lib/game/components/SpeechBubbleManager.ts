import type Phaser from "phaser";
import { GameConstants } from "../constants/GameConstants";

export interface ActiveBubble {
    container: Phaser.GameObjects.Container;
    sprite: Phaser.GameObjects.Sprite;
    offsetY: number;
}

export class SpeechBubbleManager {
    private scene: Phaser.Scene;
    public activeBubbles: ActiveBubble[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public showBubble(sprite: Phaser.GameObjects.Sprite, message: string) {
        if (!sprite || !message) return;
        
        // --- 1. Replacement Logic: Remove older bubbles for this sprite ---
        const existingIdx = this.activeBubbles.findIndex(b => b.sprite === sprite);
        if (existingIdx > -1) {
            const oldBubble = this.activeBubbles[existingIdx];
            if (oldBubble.container && oldBubble.container.active) {
                oldBubble.container.destroy();
            }
            this.activeBubbles.splice(existingIdx, 1);
        }

        const offsetY = -75;
        const bubbleContainer = this.scene.add.container(sprite.x, sprite.y + offsetY);
        
        const bubbleText = this.scene.add.text(0, 0, message, {
            fontSize: '15px',
            fontFamily: "'IBM Plex Sans Thai', 'Inter', sans-serif",
            fontStyle: 'bold',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: 180 },
            stroke: '#000000',
            strokeThickness: 3,
            resolution: 3
        }).setOrigin(0.5);

        const b = bubbleText.getBounds();
        const width = Math.max(b.width, 40);
        const height = Math.max(b.height, 20);
        const pad = 12;
        
        const bubbleBg = this.scene.add.graphics();
        
        // Faded transparent background (matching currency badges theme)
        const bgColor = 0x000000;
        const bgAlpha = 0.45;
        const borderColor = 0xFFFFFF;
        const borderAlpha = 0.1;

        bubbleBg.fillStyle(bgColor, bgAlpha);
        bubbleBg.fillRoundedRect(-width/2 - pad, -height/2 - pad, width + pad*2, height + pad*2, 12);
        
        bubbleBg.lineStyle(1.5, borderColor, borderAlpha);
        bubbleBg.strokeRoundedRect(-width/2 - pad, -height/2 - pad, width + pad*2, height + pad*2, 12);

        // Speech bubble tip
        bubbleBg.fillStyle(bgColor, bgAlpha);
        bubbleBg.fillTriangle(-8, height/2 + pad, 8, height/2 + pad, 0, height/2 + pad + 8);
        
        // Inner glow/highlight for that 'glass' look
        bubbleBg.lineStyle(1, 0xFFFFFF, 0.05);
        bubbleBg.strokeRoundedRect(-width/2 - pad + 1, -height/2 - pad + 1, width + pad*2 - 2, height + pad*2 - 2, 11);

        bubbleContainer.add([bubbleBg, bubbleText]);
        bubbleContainer.setDepth(2000);
        
        // Subtle entrance animation
        bubbleContainer.setScale(0.8);
        this.scene.tweens.add({
            targets: bubbleContainer,
            scale: 1,
            duration: 150,
            ease: 'Back.easeOut'
        });

        this.scene.time.delayedCall(4500, () => {
            if (bubbleContainer && bubbleContainer.active) {
                this.scene.tweens.add({
                    targets: bubbleContainer,
                    alpha: 0,
                    scale: 0.9,
                    duration: 300,
                    onComplete: () => {
                        bubbleContainer.destroy();
                        const idx = this.activeBubbles.findIndex(b => b.container === bubbleContainer);
                        if (idx > -1) this.activeBubbles.splice(idx, 1);
                    }
                });
            }
        });

        this.activeBubbles.push({ container: bubbleContainer, sprite, offsetY });
    }

    public update() {
        for (let i = this.activeBubbles.length - 1; i >= 0; i--) {
            const b = this.activeBubbles[i];
            if (b.container && b.container.active && b.sprite && b.sprite.active) {
                b.container.setPosition(b.sprite.x, b.sprite.y + b.offsetY);
            } else {
                this.activeBubbles.splice(i, 1);
            }
        }
    }
}
