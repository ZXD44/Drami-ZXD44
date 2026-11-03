<script lang="ts">
    import { playerSummary, hpRatio, mpRatio, expRatio } from "$lib/game-ui";
</script>

<!-- ============================================
     HUD: ซ้ายบน – ข้อมูลผู้เล่น
     ============================================ -->
<div id="game-hud" class="hud-player">
    <div style="position: relative;">
        <div class="hud-avatar">
            <img src={$playerSummary.avatar} alt="รูปตัวละคร" />
        </div>
        <div class="hud-level">{$playerSummary.level}</div>
    </div>
    <div class="hud-bars" style="min-width: 220px;">
        <div class="hud-bar hp-bar">
            <div class="hud-bar-fill hp" style="width: {$hpRatio}%;"></div>
            <div class="hud-bar-text">{$playerSummary.hp.current}/{$playerSummary.hp.max}</div>
        </div>
        <div class="hud-bar mp-bar">
            <div class="hud-bar-fill mp" style="width: {$mpRatio}%;"></div>
            <div class="hud-bar-text">{$playerSummary.mp.current}/{$playerSummary.mp.max}</div>
        </div>
    </div>
</div>

<!-- ============================================
     HUD: ซ้ายบน (ล่าง) – เงิน
     ============================================ -->
<div id="game-gold" class="hud-gold">
    <div class="gold-item" title="Gold">
        <span>🪙</span>
        <span class="gold-text">{$playerSummary.gold.toLocaleString()}</span>
    </div>
    <div class="gold-item" title="Diamonds">
        <span>💎</span>
        <span class="diamond-text">{($playerSummary.diamonds || 0).toLocaleString()}</span>
    </div>
</div>
