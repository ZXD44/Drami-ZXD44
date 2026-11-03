import Phaser from "phaser";
import { GameConstants } from "../constants/GameConstants";
import { InputManager } from "../services/InputManager";
import { SpeechBubbleManager } from "../components/SpeechBubbleManager";
import { playerPos, gameSettings, showNotification, showAnnouncement, activeAnnouncement, playerSummary } from "$lib/game-ui";

// LPC Spritesheet Constants
const LPC = {
    FRAME_W: 64,
    FRAME_H: 64,
    // Row order in LPC sheets: 0=up, 1=left, 2=down, 3=right
    ROWS: { up: 0, left: 1, down: 2, right: 3 },
    DIR_NAMES: ["up", "left", "down", "right"] as const,
    // Column counts per animation sheet
    ANIM_COLS: {
        walk: 9,
        idle: 2,
        run: 8,
        slash: 6,
        thrust: 8,
        shoot: 13,
        spellcast: 7,
        hurt: 6,     // 1 row only
        sit: 3,
        jump: 5,
        combat_idle: 2,
        emote: 3,
        backslash: 13,
        halfslash: 6,
        climb: 6,     // 1 row only
    } as Record<string, number>,
    // Animations that only have 1 row (not 4 directional rows)
    SINGLE_ROW: ["hurt", "climb"],
};

// Animation frame rates
const ANIM_FPS: Record<string, number> = {
    walk: 10,
    idle: 3,
    run: 12,
    slash: 12,
    thrust: 12,
    shoot: 10,
    spellcast: 8,
    hurt: 6,
    sit: 4,
    jump: 10,
    combat_idle: 4,
    emote: 6,
    backslash: 12,
    halfslash: 12,
    climb: 8,
};

// Animations that should not loop
const NO_REPEAT = ["hurt", "slash", "thrust", "shoot", "spellcast", "jump", "backslash", "halfslash"];

export class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private otherPlayers: Map<string, { sprite: Phaser.GameObjects.Sprite, nameText: Phaser.GameObjects.Text, lastDir: string }> = new Map();
    private inputManager!: InputManager;
    private speechBubbleManager!: SpeechBubbleManager;
    private playerNameText!: Phaser.GameObjects.Text;
    private lastDirection: string = "down";

    private room: any;
    private gender!: string;
    private username!: string;
    private addChatMessage!: (msg: string) => void;
    private cleanupFns: Array<() => void> = [];

    constructor() {
        super("MainScene");
    }

    public init(data: { room: any, gender: string, username: string, addChatMessage: (msg: string) => void }) {
        this.room = data.room;
        this.gender = data.gender;
        this.username = data.username;
        this.addChatMessage = data.addChatMessage;
    }

    preload() {
        // Load ALL LPC spritesheets for each gender and animation type
        const animations = Object.keys(LPC.ANIM_COLS);
        for (const gender of ["male", "female"]) {
            for (const anim of animations) {
                const key = `player-${gender}-${anim}`;
                const url = `/characters/player-${gender}-${anim}.png`;
                this.load.spritesheet(key, url, {
                    frameWidth: LPC.FRAME_W,
                    frameHeight: LPC.FRAME_H,
                });
            }
        }
    }

    async create() {
        this.inputManager = new InputManager(this);
        this.speechBubbleManager = new SpeechBubbleManager(this);

        this.setupWorld();
        this.setupAnimations();
        this.setupPlayer();
        await this.setupNetworkCallbacks();
        this.setupReactiveSettings();
    }

    private setupWorld() {
        this.cameras.main.setBounds(0, 0, GameConstants.WORLD_WIDTH, GameConstants.WORLD_HEIGHT);
        this.physics.world.setBounds(0, 0, GameConstants.WORLD_WIDTH, GameConstants.WORLD_HEIGHT);

        const gridGraphics = this.add.graphics();
        gridGraphics.fillStyle(GameConstants.COLORS.BACKGROUND, 1);
        gridGraphics.fillRect(0, 0, GameConstants.WORLD_WIDTH, GameConstants.WORLD_HEIGHT);

        gridGraphics.lineStyle(2, GameConstants.COLORS.GRID, 0.4);
        gridGraphics.setDepth(-5);
        for (let x = 0; x <= GameConstants.WORLD_WIDTH; x += 64) {
            gridGraphics.lineBetween(x, 0, x, GameConstants.WORLD_HEIGHT);
        }
        for (let y = 0; y <= GameConstants.WORLD_HEIGHT; y += 64) {
            gridGraphics.lineBetween(0, y, GameConstants.WORLD_WIDTH, y);
        }
    }

    private setupAnimations() {
        const genders = ["male", "female"];
        const animations = Object.keys(LPC.ANIM_COLS);

        for (const gender of genders) {
            const prefix = `player-${gender}`;

            for (const anim of animations) {
                const cols = LPC.ANIM_COLS[anim];
                const isSingleRow = LPC.SINGLE_ROW.includes(anim);
                const fps = ANIM_FPS[anim] || 8;
                const repeat = NO_REPEAT.includes(anim) ? 0 : -1;

                if (isSingleRow) {
                    // Single row animations (hurt, climb) - no direction
                    this.anims.create({
                        key: `${prefix}-${anim}`,
                        frames: this.anims.generateFrameNumbers(`${prefix}-${anim}`, {
                            start: 0, end: cols - 1
                        }),
                        frameRate: fps,
                        repeat: repeat,
                    });
                } else {
                    // 4-direction animations
                    for (let rowIdx = 0; rowIdx < 4; rowIdx++) {
                        const dirName = LPC.DIR_NAMES[rowIdx];
                        const startFrame = rowIdx * cols;
                        // Skip first frame for walk/run (it's the stand frame)
                        const skipFirst = (anim === "walk" || anim === "run") ? 1 : 0;

                        this.anims.create({
                            key: `${prefix}-${anim}-${dirName}`,
                            frames: this.anims.generateFrameNumbers(`${prefix}-${anim}`, {
                                start: startFrame + skipFirst,
                                end: startFrame + cols - 1,
                            }),
                            frameRate: fps,
                            repeat: repeat,
                        });
                    }
                }
            }
        }
    }

    private setupPlayer() {
        const centerX = GameConstants.WORLD_WIDTH / 2;
        const centerY = GameConstants.WORLD_HEIGHT / 2;
        const idleKey = `player-${this.gender}-idle`;

        this.player = this.add.sprite(centerX, centerY, idleKey)
            .setOrigin(0.5, 1)
            .setScale(1.5)
            .setDepth(300);

        // Play initial idle animation facing down
        this.player.anims.play(`player-${this.gender}-idle-down`, true);

        this.playerNameText = this.add.text(centerX, centerY - 80, this.username, {
            color: GameConstants.COLORS.NAME_TEXT,
            fontFamily: GameConstants.FONT,
            fontSize: "14px",
            fontStyle: 'bold',
            stroke: "#000000",
            strokeThickness: 3,
            align: "center",
            resolution: 3
        }).setOrigin(0.5, 1).setDepth(301);

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    }

    /** Play a one-shot animation (attack, hurt, etc.) then return to idle */
    public playAction(animName: string, direction?: string) {
        const prefix = `player-${this.gender}`;
        const isSingleRow = LPC.SINGLE_ROW.includes(animName);

        let key: string;
        if (isSingleRow) {
            key = `${prefix}-${animName}`;
        } else {
            const dir = direction || this.lastDirection;
            key = `${prefix}-${animName}-${dir}`;
        }

        if (this.anims.exists(key)) {
            this.player.anims.play(key, true);
            // Return to idle after one-shot finishes
            if (NO_REPEAT.includes(animName)) {
                this.player.once('animationcomplete', () => {
                    this.player.anims.play(`${prefix}-idle-${this.lastDirection}`, true);
                });
            }
        }
    }

    private async setupNetworkCallbacks() {
        if (!this.room) return;

        const { getStateCallbacks } = await import("colyseus.js");
        const callbacks = getStateCallbacks(this.room);

        this.room.onMessage("chat", (data: any) => {
            const { sessionId, message, username } = data;
            const other = this.otherPlayers.get(sessionId);
            if (other) {
                this.speechBubbleManager.showBubble(other.sprite, message);
                this.addChatMessage(`${username || sessionId.slice(0,4)}: ${message}`);
            } else if (sessionId === this.room.sessionId) {
                this.speechBubbleManager.showBubble(this.player, message);
            } else {
                this.addChatMessage(message);
                if (message.includes("📢")) {
                    const cleanMsg = message.replace("📢", "").replace("[ประกาศ]", "").trim();
                    showNotification(cleanMsg, "info");
                    showAnnouncement(cleanMsg);
                }
            }
        });

        this.room.onMessage("inventory_update", () => {
            showNotification(`[ได้รับไอเทม] มีของขวัญส่งถึงคุณ!`, "success");
        });

        callbacks(this.room.state).players.onAdd((serverPlayer: any, sessionId: string) => {
            if (sessionId === this.room.sessionId) {
                const syncStats = () => {
                    playerSummary.update(p => ({
                        ...p,
                        role: serverPlayer.role,
                        level: serverPlayer.level,
                        gold: serverPlayer.gold,
                        diamonds: serverPlayer.diamonds,
                        avatar: serverPlayer.avatar || p.avatar,
                        exp: { ...p.exp, current: serverPlayer.exp }
                    }));
                };
                callbacks(serverPlayer).onChange(syncStats);
                syncStats();
                return;
            }

            const otherGender = serverPlayer.gender || "male";
            const otherPlayer = this.add.sprite(serverPlayer.x, serverPlayer.y, `player-${otherGender}-idle`)
                .setOrigin(0.5, 1)
                .setScale(1.5);

            otherPlayer.anims.play(`player-${otherGender}-idle-down`, true);

            const otherName = this.add.text(serverPlayer.x, serverPlayer.y - 80, serverPlayer.username || `Player_${sessionId.slice(0, 4)}`, {
                color: GameConstants.COLORS.OTHER_NAME_TEXT,
                fontFamily: GameConstants.FONT,
                fontSize: "13px",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
                align: "center",
                resolution: 3
            }).setOrigin(0.5, 1);

            this.otherPlayers.set(sessionId, { sprite: otherPlayer, nameText: otherName, lastDir: "down" });

            let prevX = serverPlayer.x;
            let prevY = serverPlayer.y;

            callbacks(serverPlayer).onChange(() => {
                const dx = serverPlayer.x - prevX;
                const dy = serverPlayer.y - prevY;
                prevX = serverPlayer.x;
                prevY = serverPlayer.y;

                otherPlayer.x = serverPlayer.x;
                otherPlayer.y = serverPlayer.y;
                otherPlayer.setDepth(otherPlayer.y);
                otherName.setPosition(serverPlayer.x, serverPlayer.y - 80);

                const otherData = this.otherPlayers.get(sessionId);
                const g = serverPlayer.gender || "male";

                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    let dir = "down";
                    if (Math.abs(dy) >= Math.abs(dx)) {
                        dir = dy < 0 ? "up" : "down";
                    } else {
                        dir = dx < 0 ? "left" : "right";
                    }
                    if (otherData) otherData.lastDir = dir;
                    otherPlayer.anims.play(`player-${g}-walk-${dir}`, true);
                } else {
                    const idleDir = otherData?.lastDir || "down";
                    const currentAnim = otherPlayer.anims.currentAnim?.key || "";
                    if (!currentAnim.includes("-idle-")) {
                        otherPlayer.anims.play(`player-${g}-idle-${idleDir}`, true);
                    }
                }
            });
        });

        callbacks(this.room.state).players.onRemove((_player: any, sessionId: string) => {
            const data = this.otherPlayers.get(sessionId);
            if (data) {
                data.sprite.destroy();
                data.nameText.destroy();
                this.otherPlayers.delete(sessionId);
            }
        });
    }

    private setupReactiveSettings() {
        const unsub = gameSettings.subscribe((settings: any) => {
            if (this.cameras?.main) {
                this.cameras.main.setZoom(settings.cameraZoom);
            }
        });
        this.cleanupFns.push(unsub);
    }

    update(_time: number, delta: number) {
        this.inputManager.update();
        this.speechBubbleManager.update();

        const move = this.inputManager.getMovementVector();
        const speed = (GameConstants.PLAYER_SPEED * delta) / 1000;

        if (move.x !== 0 || move.y !== 0) {
            const newX = Phaser.Math.Clamp(this.player.x + move.x * speed, 24, GameConstants.WORLD_WIDTH - 24);
            const newY = Phaser.Math.Clamp(this.player.y + move.y * speed, 72, GameConstants.WORLD_HEIGHT - 24);

            this.player.setPosition(newX, newY);
            this.player.setDepth(newY);
            this.playerNameText.setPosition(newX, newY - 80);
            this.playerNameText.setDepth(newY + 1);

            playerPos.set({ x: newX, y: newY });
            this.room?.send("move", { x: newX, y: newY });

            let dir = "down";
            if (Math.abs(move.y) >= Math.abs(move.x)) {
                dir = move.y < 0 ? "up" : "down";
            } else {
                dir = move.x < 0 ? "left" : "right";
            }
            this.lastDirection = dir;

            this.player.anims.play(`player-${this.gender}-walk-${dir}`, true);
        } else {
            // Play idle animation in the last-facing direction
            const currentAnim = this.player.anims.currentAnim?.key || "";
            // Don't interrupt one-shot animations
            if (!currentAnim.includes("-idle-") && !this.isPlayingOneShot()) {
                this.player.anims.play(`player-${this.gender}-idle-${this.lastDirection}`, true);
            }
        }
    }

    /** Check if a one-shot (non-looping) animation is currently playing */
    private isPlayingOneShot(): boolean {
        const currentAnim = this.player.anims.currentAnim;
        if (!currentAnim) return false;
        return NO_REPEAT.some(a => currentAnim.key.includes(`-${a}`)) && this.player.anims.isPlaying;
    }

    destroy() {
        this.cleanupFns.forEach(fn => fn());
    }
}
