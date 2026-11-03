import Phaser from "phaser";
import { GameConstants } from "../constants/GameConstants";
import { InputManager } from "../services/InputManager";
import { SpeechBubbleManager } from "../components/SpeechBubbleManager";
import { playerPos, gameSettings, showNotification, showAnnouncement, activeAnnouncement, playerSummary } from "$lib/game-ui";

export class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private otherPlayers: Map<string, { sprite: Phaser.GameObjects.Sprite, nameText: Phaser.GameObjects.Text, lastDir: string }> = new Map();
    private worldEntities: Map<string, { container: Phaser.GameObjects.Container, label: Phaser.GameObjects.Text }> = new Map();
    private inputManager!: InputManager;
    private speechBubbleManager!: SpeechBubbleManager;
    private playerNameText!: Phaser.GameObjects.Text;
    private lastDirection: string = "down";

    private map!: Phaser.Tilemaps.Tilemap;
    private mapLayers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};

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
        (window as any).__drami_room = data.room;
    }

    preload() {
        // Load Custom RPG Cursor
        this.input.setDefaultCursor("url(/assets/ui/cursor-brown.cur), default");

        // Load Tiled Map & Tilesets from Drami-MMORPG
        this.load.tilemapTiledJSON("world-map", "/assets/map/world.json");
        this.load.image("tileset", "/assets/map/tileset/tileset.png");
        this.load.image("tileset2", "/assets/map/tileset/tileset2.png");
        this.load.image("Grass", "/assets/map/tileset/tileset_grass.png");

        // Load Classic 32x32 Drami-MMORPG Character Sprites
        this.load.spritesheet("player", "/assets/player-sprite.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet("other-player", "/assets/other-player-sprite.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
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
        try {
            this.map = this.make.tilemap({ key: "world-map" });
            const tileset = this.map.addTilesetImage("tileset", "tileset");
            const tileset2 = this.map.addTilesetImage("tileset2", "tileset2");
            const grassTileset = this.map.addTilesetImage("Grass", "Grass");

            const validTilesets = [tileset, tileset2, grassTileset].filter(Boolean) as Phaser.Tilemaps.Tileset[];

            // Render Tilemap Layers
            const grassLayer = this.map.createLayer("Grass", validTilesets, 0, 0);
            const decorLayer = this.map.createLayer("Decorations", validTilesets, 0, 0);
            const objectsLayer = this.map.createLayer("Objects", validTilesets, 0, 0);

            if (grassLayer) {
                grassLayer.setDepth(-10);
                this.mapLayers["Grass"] = grassLayer;
            }
            if (decorLayer) {
                decorLayer.setDepth(-5);
                this.mapLayers["Decorations"] = decorLayer;
            }
            if (objectsLayer) {
                objectsLayer.setDepth(-2);
                this.mapLayers["Objects"] = objectsLayer;
            }

            const mapWidthPx = this.map.widthInPixels || GameConstants.WORLD_WIDTH;
            const mapHeightPx = this.map.heightInPixels || GameConstants.WORLD_HEIGHT;

            this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
            this.physics.world.setBounds(0, 0, mapWidthPx, mapHeightPx);
        } catch (e) {
            console.warn("[MainScene] Could not load Tiled world, falling back to grid:", e);
            this.cameras.main.setBounds(0, 0, GameConstants.WORLD_WIDTH, GameConstants.WORLD_HEIGHT);
            this.physics.world.setBounds(0, 0, GameConstants.WORLD_WIDTH, GameConstants.WORLD_HEIGHT);

            const gridGraphics = this.add.graphics();
            gridGraphics.fillStyle(GameConstants.COLORS.BACKGROUND, 1);
            gridGraphics.fillRect(0, 0, GameConstants.WORLD_WIDTH, GameConstants.WORLD_HEIGHT);
        }
    }

    private setupAnimations() {
        // Player 4-direction animations (from Drami-MMORPG)
        // Down: [1, 0, 1, 2], Left: [4, 3, 4, 5], Right: [7, 6, 7, 8], Up: [10, 9, 10, 11]
        this.anims.create({
            key: "player-down",
            frames: this.anims.generateFrameNumbers("player", { frames: [1, 0, 1, 2] }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "player-left",
            frames: this.anims.generateFrameNumbers("player", { frames: [4, 3, 4, 5] }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "player-right",
            frames: this.anims.generateFrameNumbers("player", { frames: [7, 6, 7, 8] }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "player-up",
            frames: this.anims.generateFrameNumbers("player", { frames: [10, 9, 10, 11] }),
            frameRate: 10,
            repeat: -1,
        });

        // Other Player 4-direction animations
        this.anims.create({
            key: "other-player-down",
            frames: this.anims.generateFrameNumbers("other-player", { frames: [1, 0, 1, 2] }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "other-player-left",
            frames: this.anims.generateFrameNumbers("other-player", { frames: [4, 3, 4, 5] }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "other-player-right",
            frames: this.anims.generateFrameNumbers("other-player", { frames: [7, 6, 7, 8] }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "other-player-up",
            frames: this.anims.generateFrameNumbers("other-player", { frames: [10, 9, 10, 11] }),
            frameRate: 10,
            repeat: -1,
        });
    }

    private setupPlayer() {
        const myServerPlayer = this.room?.state?.players?.get(this.room?.sessionId);
        const spawnX = myServerPlayer?.spawnX || myServerPlayer?.x || (GameConstants.WORLD_WIDTH / 2);
        const spawnY = myServerPlayer?.spawnY || myServerPlayer?.y || (GameConstants.WORLD_HEIGHT / 2);
        const isAdmin = myServerPlayer?.role === "admin";

        this.player = this.add.sprite(spawnX, spawnY, "player", 1)
            .setOrigin(0.5, 1)
            .setScale(1.75)
            .setDepth(300);

        const displayName = isAdmin ? `⭐ ${this.username} ⭐` : this.username;
        const textColor = isAdmin ? "#fde047" : GameConstants.COLORS.NAME_TEXT;
        const strokeColor = isAdmin ? "#b45309" : "#000000";

        this.playerNameText = this.add.text(spawnX, spawnY - 60, displayName, {
            color: textColor,
            fontFamily: GameConstants.FONT,
            fontSize: "13px",
            fontStyle: 'bold',
            stroke: strokeColor,
            strokeThickness: 3,
            align: "center",
            resolution: 3
        }).setOrigin(0.5, 1).setDepth(301);

        if (isAdmin) {
            this.playerNameText.setShadow(0, 2, "rgba(0,0,0,0.8)", 3, false, true);
        }

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    }

    private async setupNetworkCallbacks() {
        if (!this.room) return;

        const { callbacks } = await import("colyseus.js");

        this.room.onMessage("force_reload", (data: { reason?: string }) => {
            const reason = data?.reason || "เซิร์ฟเวอร์มีการอัปเดตระบบ กำลังรีโหลดหน้าเว็บ...";
            showNotification(reason, "warning");
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        });

        this.room.onMessage("announcement", (data: { message: string, sender: string, timestamp: number }) => {
            activeAnnouncement.set(data);
            showAnnouncement.set(true);
            showNotification(`📢 ประกาศจาก ${data.sender}: ${data.message}`);
        });

        this.room.onMessage("chat", (data: { sessionId: string, username: string, message: string }) => {
            if (data.sessionId === this.room.sessionId) {
                this.speechBubbleManager.show(this.player.x, this.player.y - 70, data.message);
            } else {
                const other = this.otherPlayers.get(data.sessionId);
                if (other) {
                    this.speechBubbleManager.show(other.sprite.x, other.sprite.y - 70, data.message);
                }
            }
            this.addChatMessage(`[${data.username}]: ${data.message}`);
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

            const otherPlayer = this.add.sprite(serverPlayer.x, serverPlayer.y, "other-player", 1)
                .setOrigin(0.5, 1)
                .setScale(1.75);

            const isOtherAdmin = serverPlayer.role === "admin";
            const otherDisplayName = isOtherAdmin ? `⭐ ${serverPlayer.username || `Player_${sessionId.slice(0, 4)}`} ⭐` : (serverPlayer.username || `Player_${sessionId.slice(0, 4)}`);
            const otherTextColor = isOtherAdmin ? "#fde047" : GameConstants.COLORS.OTHER_NAME_TEXT;
            const otherStrokeColor = isOtherAdmin ? "#b45309" : "#000000";

            const otherName = this.add.text(serverPlayer.x, serverPlayer.y - 60, otherDisplayName, {
                color: otherTextColor,
                fontFamily: GameConstants.FONT,
                fontSize: "12px",
                fontStyle: "bold",
                stroke: otherStrokeColor,
                strokeThickness: 3,
                align: "center",
                resolution: 3
            }).setOrigin(0.5, 1);

            if (isOtherAdmin) {
                otherName.setShadow(0, 2, "rgba(0,0,0,0.8)", 3, false, true);
            }

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
                otherName.setPosition(serverPlayer.x, serverPlayer.y - 60);

                const otherData = this.otherPlayers.get(sessionId);

                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    let dir = "down";
                    if (Math.abs(dy) >= Math.abs(dx)) {
                        dir = dy < 0 ? "up" : "down";
                    } else {
                        dir = dx < 0 ? "left" : "right";
                    }
                    if (otherData) otherData.lastDir = dir;
                    otherPlayer.anims.play(`other-player-${dir}`, true);
                } else {
                    otherPlayer.anims.stop();
                    // Set standing idle frame
                    const dir = otherData?.lastDir || "down";
                    const frameMap: Record<string, number> = { down: 1, left: 4, right: 7, up: 10 };
                    otherPlayer.setFrame(frameMap[dir] || 1);
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

        // Sync Dynamic World Entities (Monsters, NPCs, Portals, Trees)
        if (this.room.state.entities) {
            callbacks(this.room.state).entities.onAdd((serverEntity: any, entityId: string) => {
                const container = this.add.container(serverEntity.x, serverEntity.y);

                let iconSymbol = "👾";
                let tagColor = "#f43f5e";
                let borderColor = "#881337";

                if (serverEntity.type === "npc") {
                    iconSymbol = "🧙";
                    tagColor = "#38bdf8";
                    borderColor = "#0369a1";
                } else if (serverEntity.type === "tree") {
                    iconSymbol = "🌲";
                    tagColor = "#4ade80";
                    borderColor = "#15803d";
                } else if (serverEntity.type === "teleport") {
                    iconSymbol = "🌀";
                    tagColor = "#c084fc";
                    borderColor = "#7e22ce";
                }

                // Entity Visual Graphic
                const baseGraphic = this.add.circle(0, 0, 16, Phaser.Display.Color.HexStringToColor(tagColor).color, 0.45);
                baseGraphic.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(borderColor).color);

                const iconText = this.add.text(0, 0, iconSymbol, {
                    fontSize: "18px",
                    align: "center"
                }).setOrigin(0.5);

                const nameLabel = this.add.text(0, -28, serverEntity.name || "Entity", {
                    fontFamily: GameConstants.FONT,
                    fontSize: "11px",
                    fontStyle: "bold",
                    color: tagColor,
                    stroke: "#000000",
                    strokeThickness: 3,
                    align: "center"
                }).setOrigin(0.5);

                container.add([baseGraphic, iconText, nameLabel]);
                container.setDepth(serverEntity.y);

                // Click interaction
                container.setSize(36, 36);
                container.setInteractive({ useHandCursor: true });
                container.on("pointerdown", () => {
                    this.speechBubbleManager.show(serverEntity.x, serverEntity.y - 40, `[${serverEntity.name}] สวัสดีนักเดินทาง!`);
                    showNotification(`คุณกำลังโต้ตอบกับ: ${serverEntity.name} (${serverEntity.type})`, "info");
                });

                this.worldEntities.set(entityId, { container, label: nameLabel });

                callbacks(serverEntity).onChange(() => {
                    container.setPosition(serverEntity.x, serverEntity.y);
                    container.setDepth(serverEntity.y);
                    nameLabel.setText(serverEntity.name);
                });
            });

            callbacks(this.room.state).entities.onRemove((_ent: any, entityId: string) => {
                const item = this.worldEntities.get(entityId);
                if (item) {
                    item.container.destroy();
                    this.worldEntities.delete(entityId);
                }
            });
        }
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
            const mapWidth = this.map?.widthInPixels || GameConstants.WORLD_WIDTH;
            const mapHeight = this.map?.heightInPixels || GameConstants.WORLD_HEIGHT;

            const newX = Phaser.Math.Clamp(this.player.x + move.x * speed, 16, mapWidth - 16);
            const newY = Phaser.Math.Clamp(this.player.y + move.y * speed, 32, mapHeight - 16);

            this.player.setPosition(newX, newY);
            this.player.setDepth(newY);
            this.playerNameText.setPosition(newX, newY - 60);
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

            this.player.anims.play(`player-${dir}`, true);
        } else {
            this.player.anims.stop();
            // Idle frame based on direction: Down=1, Left=4, Right=7, Up=10
            const idleFrameMap: Record<string, number> = { down: 1, left: 4, right: 7, up: 10 };
            this.player.setFrame(idleFrameMap[this.lastDirection] || 1);
        }
    }

    destroy() {
        this.cleanupFns.forEach(fn => fn());
    }
}
