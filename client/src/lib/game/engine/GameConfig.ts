import Phaser from "phaser";
import { MainScene } from "./MainScene";

export const getGameConfig = (container: HTMLElement) => {
    return {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: container,
        scene: [],
        backgroundColor: "#1a2419",
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: "arcade",
            arcade: { debug: false }
        },
        render: {
            antialias: true,
            roundPixels: false
        }
    };
};
