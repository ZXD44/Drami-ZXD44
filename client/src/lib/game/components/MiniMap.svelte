<script lang="ts">
    import { playerSummary, playerPos } from "$lib/game-ui";
    import Icon from "./Icon.svelte";

    // World Map Dimensions: 150 tiles * 32px = 4800px x 4800px
    const WORLD_WIDTH = 4800;
    const WORLD_HEIGHT = 4800;
    const MAP_IMAGE_SIZE = 1200; // Scaled minimap image rendering size

    let zoomLevel = $state(1); // 1x or 1.5x zoom
    let isExpanded = $state(false);

    function toggleZoom() {
        zoomLevel = zoomLevel === 1 ? 1.5 : 1;
    }
</script>

<div class="hud-minimap-premium" class:expanded={isExpanded}>
    <!-- Top Header / Title Bar -->
    <div class="minimap-header-bar">
        <div class="minimap-location-tag">
            <span class="location-pulse-dot"></span>
            <Icon name="map" size={13} color="#fcd34d" />
            <span class="location-text">{$playerSummary.location}</span>
        </div>
        <div class="minimap-controls">
            <button class="minimap-tool-btn" onclick={toggleZoom} title="ซูมแผนที่">
                <Icon name="zoom" size={12} color="#cbd5e1" />
            </button>
            <button class="minimap-tool-btn" onclick={() => isExpanded = !isExpanded} title={isExpanded ? "ย่อ" : "ขยาย"}>
                <Icon name={isExpanded ? "close" : "sparkles"} size={12} color="#cbd5e1" />
            </button>
        </div>
    </div>

    <!-- Map Viewport Frame -->
    <div class="minimap-viewport">
        <!-- Radar Scanning Wave Effect -->
        <div class="minimap-radar-sweep"></div>
        <div class="minimap-crosshair"></div>

        <!-- Scrollable/Movable Map Layer -->
        <div 
            class="minimap-surface" 
            style="
                width: {MAP_IMAGE_SIZE * zoomLevel}px;
                height: {MAP_IMAGE_SIZE * zoomLevel}px;
                left: calc(50% - {($playerPos.x / WORLD_WIDTH) * MAP_IMAGE_SIZE * zoomLevel}px);
                top: calc(50% - {($playerPos.y / WORLD_HEIGHT) * MAP_IMAGE_SIZE * zoomLevel}px);
            "
        >
            <!-- Real World Minimap JPG Texture -->
            <img 
                src="/assets/map/minimap.jpg" 
                alt="Minimap Texture" 
                class="minimap-texture" 
                draggable="false"
            />

            <!-- POI / Quest / NPC Markers on Map Coordinates -->
            <div 
                class="map-poi quest-marker" 
                style="left: {(2400 / WORLD_WIDTH) * 100}%; top: {(1800 / WORLD_HEIGHT) * 100}%;"
                title="จุดศูนย์กลางเมือง"
            >
                <div class="poi-ping"></div>
            </div>
        </div>

        <!-- Center Player Pin (Always Center of Radar) -->
        <div class="minimap-player-center" title="ตำแหน่งของคุณ">
            <div class="player-pulse-ring"></div>
            <div class="player-core-dot"></div>
            <div class="player-heading-pointer"></div>
        </div>

        <!-- Compass Cardinal Directions -->
        <div class="compass-marker north">N</div>
        <div class="compass-marker east">E</div>
        <div class="compass-marker south">S</div>
        <div class="compass-marker west">W</div>
    </div>

    <!-- Bottom Telemetry: Coordinates & Server Realm -->
    <div class="minimap-footer-telemetry">
        <div class="coord-pill">
            <span class="coord-axis">X</span>
            <span class="coord-num">{Math.floor($playerPos.x)}</span>
        </div>
        <div class="coord-separator"></div>
        <div class="coord-pill">
            <span class="coord-axis">Y</span>
            <span class="coord-num">{Math.floor($playerPos.y)}</span>
        </div>
        <div class="realm-pill">
            <span class="realm-dot"></span>
            <span>{$playerSummary.server || 'Drami-01'}</span>
        </div>
    </div>
</div>

<style>
    .hud-minimap-premium {
        position: fixed;
        top: 0.8rem;
        right: 0.8rem;
        z-index: 20;
        width: 175px;
        height: 175px;
        background: rgba(10, 14, 23, 0.78);
        backdrop-filter: blur(12px) saturate(180%);
        border: 1px solid rgba(251, 191, 36, 0.35);
        border-radius: 14px;
        box-shadow: 
            0 12px 30px rgba(0, 0, 0, 0.6),
            0 0 15px rgba(251, 191, 36, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        user-select: none;
    }

    .hud-minimap-premium.expanded {
        width: 260px;
        height: 260px;
    }

    /* Header Bar */
    .minimap-header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        background: linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.75) 100%);
        border-bottom: 1px solid rgba(251, 191, 36, 0.2);
    }

    .minimap-location-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow: hidden;
    }

    .location-pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: radarPulse 2s infinite ease-in-out;
        flex-shrink: 0;
    }

    .location-text {
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.78rem;
        font-weight: 600;
        color: #f1f5f9;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        letter-spacing: 0.2px;
    }

    .minimap-controls {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .minimap-tool-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: all 0.15s ease;
    }

    .minimap-tool-btn:hover {
        background: rgba(251, 191, 36, 0.25);
        border-color: #f59e0b;
    }

    /* Viewport Frame */
    .minimap-viewport {
        position: relative;
        flex: 1;
        width: 100%;
        overflow: hidden;
        background: #090d16;
    }

    .minimap-surface {
        position: absolute;
        pointer-events: none;
        transition: transform 0.05s linear;
    }

    .minimap-texture {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.88;
        filter: contrast(1.15) brightness(0.95);
        display: block;
    }

    /* Crosshair overlay */
    .minimap-crosshair {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: 
            linear-gradient(to right, transparent calc(50% - 0.5px), rgba(255, 255, 255, 0.08) calc(50% - 0.5px), rgba(255, 255, 255, 0.08) calc(50% + 0.5px), transparent calc(50% + 0.5px)),
            linear-gradient(to bottom, transparent calc(50% - 0.5px), rgba(255, 255, 255, 0.08) calc(50% - 0.5px), rgba(255, 255, 255, 0.08) calc(50% + 0.5px), transparent calc(50% + 0.5px));
    }

    /* Radar sweeping light */
    .minimap-radar-sweep {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(251, 191, 36, 0.1) 360deg);
        animation: radarRotate 6s linear infinite;
        border-radius: 50%;
        transform: scale(1.4);
    }

    /* Player Pin */
    .minimap-player-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 5;
    }

    .player-pulse-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 22px;
        height: 22px;
        transform: translate(-50%, -50%);
        border: 1.5px solid #38bdf8;
        border-radius: 50%;
        animation: playerRingPulse 1.8s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .player-core-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #38bdf8;
        box-shadow: 0 0 10px #0284c7, 0 0 4px #fff;
        border: 1.5px solid #ffffff;
    }

    .player-heading-pointer {
        position: absolute;
        top: -7px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 6px solid #38bdf8;
    }

    /* Compass Directions */
    .compass-marker {
        position: absolute;
        font-family: 'Press Start 2P', monospace, sans-serif;
        font-size: 0.5rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.45);
        pointer-events: none;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }
    .compass-marker.north { top: 4px; left: 50%; transform: translateX(-50%); color: #ef4444; }
    .compass-marker.south { bottom: 4px; left: 50%; transform: translateX(-50%); }
    .compass-marker.east  { right: 4px; top: 50%; transform: translateY(-50%); }
    .compass-marker.west  { left: 4px; top: 50%; transform: translateY(-50%); }

    /* Map POI marker */
    .map-poi {
        position: absolute;
        transform: translate(-50%, -50%);
    }

    .quest-marker .poi-ping {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #f59e0b;
        box-shadow: 0 0 8px #f59e0b;
        animation: radarPulse 1.5s infinite;
    }

    /* Footer Telemetry */
    .minimap-footer-telemetry {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px;
        background: rgba(15, 23, 42, 0.92);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-family: monospace;
    }

    .coord-pill {
        display: flex;
        align-items: center;
        gap: 3px;
    }

    .coord-axis {
        font-family: 'Press Start 2P', monospace;
        font-size: 0.45rem;
        color: #94a3b8;
    }

    .coord-num {
        font-family: 'IBM Plex Sans Thai', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        color: #fcd34d;
    }

    .coord-separator {
        width: 1px;
        height: 10px;
        background: rgba(255, 255, 255, 0.15);
    }

    .realm-pill {
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: 'IBM Plex Sans Thai', sans-serif;
        font-size: 0.65rem;
        color: #94a3b8;
    }

    .realm-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #10b981;
    }

    /* Animations */
    @keyframes radarPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.2); }
    }

    @keyframes radarRotate {
        from { transform: rotate(0deg) scale(1.4); }
        to { transform: rotate(360deg) scale(1.4); }
    }

    @keyframes playerRingPulse {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.9; }
        100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
    }

    /* Mobile landscape optimization */
    @media (max-width: 768px), (max-height: 500px) {
        .hud-minimap-premium {
            width: 130px;
            height: 130px;
            top: 0.5rem;
            right: 0.5rem;
        }
        .hud-minimap-premium.expanded {
            width: 190px;
            height: 190px;
        }
        .location-text {
            font-size: 0.7rem;
        }
        .minimap-footer-telemetry {
            padding: 2px 6px;
        }
    }
</style>
