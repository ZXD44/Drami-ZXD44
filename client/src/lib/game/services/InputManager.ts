import Phaser from "phaser";

export class InputManager {
    private scene: Phaser.Scene;
    public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public wasd!: { up: Phaser.Input.Keyboard.Key, down: Phaser.Input.Keyboard.Key, left: Phaser.Input.Keyboard.Key, right: Phaser.Input.Keyboard.Key };
    private virtualVector: { x: number, y: number } = { x: 0, y: 0 };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setup();
        this.setupVirtualListener();
    }

    private setupVirtualListener() {
        if (typeof window !== "undefined") {
            window.addEventListener("drami-virtual-move", (e: any) => {
                if (e?.detail) {
                    this.virtualVector = { x: e.detail.x || 0, y: e.detail.y || 0 };
                }
            });
        }
    }

    private setup() {
        if (!this.scene.input.keyboard) return;

        this.scene.input.keyboard.enabled = true;
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        this.scene.input.keyboard.removeCapture([
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.DOWN,
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            Phaser.Input.Keyboard.KeyCodes.SPACE
        ]);

        this.wasd = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
            left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
            right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
        };
    }

    public isTyping(): boolean {
        const activeTag = document.activeElement?.tagName;
        return activeTag === 'INPUT' || activeTag === 'TEXTAREA';
    }

    public update() {
        if (this.scene.input.keyboard) {
            this.scene.input.keyboard.enabled = !this.isTyping();
        }
    }

    public getMovementVector(): { x: number, y: number } {
        if (this.isTyping()) return { x: 0, y: 0 };

        // 1. Mobile Virtual Joystick Priority
        if (this.virtualVector.x !== 0 || this.virtualVector.y !== 0) {
            return this.virtualVector;
        }

        if (!this.cursors) return { x: 0, y: 0 };

        let moveX = 0;
        let moveY = 0;

        if (this.cursors.up.isDown || this.wasd.up.isDown) moveY -= 1;
        if (this.cursors.down.isDown || this.wasd.down.isDown) moveY += 1;
        if (this.cursors.left.isDown || this.wasd.left.isDown) moveX -= 1;
        if (this.cursors.right.isDown || this.wasd.right.isDown) moveX += 1;

        if (moveX !== 0 && moveY !== 0) {
            const len = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= len;
            moveY /= len;
        }

        return { x: moveX, y: moveY };
    }
}
