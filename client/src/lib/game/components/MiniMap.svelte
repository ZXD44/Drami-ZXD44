<script lang="ts">
    import { playerSummary, playerPos } from "$lib/game-ui";
    import Icon from "./Icon.svelte";
</script>

<div class="hud-minimap">
    <div class="minimap-header" style="display: flex; align-items: center; gap: 6px;">
        <Icon name="map" size={14} color="#f6d860" />
        <span>แผนที่: {$playerSummary.location}</span>
    </div>
    <div class="minimap-content" style="position: relative; overflow: hidden;">
        <!-- แผนที่ย่อ (Map Container) เลื่อนตามตำแหน่งผู้เล่นสวนทางกัน -->
        <div class="minimap-map" style="
            position: absolute;
            width: 480px;
            height: 360px;
            left: calc(50% - {($playerPos.x / 2400) * 480}px);
            top: calc(50% - {($playerPos.y / 1800) * 360}px);
            background: repeating-linear-gradient(rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 24px),
                        repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 24px);
            border: 1px dashed rgba(255,255,255,0.2);
        ">
            <div class="minimap-dot quest" style="left: 75%; top: 30%;"></div>
            <div class="minimap-dot npc" style="left: 25%; top: 65%;"></div>
        </div>
        
        <!-- ตัวละครอยู่ตรงกลางจอเสมอ -->
        <div class="minimap-dot player" style="left: 50%; top: 50%; transform: translate(-50%, -50%);"></div>
    </div>

    <!-- Floating Coordinates (Below the Edge) -->
    <div class="minimap-coords-container">
        <div class="coord-box">
            <span class="coord-label">X</span>
            <span class="coord-val">{Math.floor($playerPos.x)}</span>
        </div>
        <div class="coord-divider"></div>
        <div class="coord-box">
            <span class="coord-label">Y</span>
            <span class="coord-val">{Math.floor($playerPos.y)}</span>
        </div>
    </div>
</div>
