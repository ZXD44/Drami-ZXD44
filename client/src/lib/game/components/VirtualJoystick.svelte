<script lang="ts">
    import { onMount } from "svelte";

    let active = $state(false);
    let touchId: number | null = null;
    let basePos = { x: 0, y: 0 };
    let knobPos = $state({ x: 0, y: 0 });
    let maxRadius = 45;

    function handleTouchStart(e: TouchEvent) {
        if (active) return;
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        basePos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        active = true;
        updateKnob(touch.clientX, touch.clientY);
    }

    function handleTouchMove(e: TouchEvent) {
        if (!active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) {
                updateKnob(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                break;
            }
        }
    }

    function handleTouchEnd(e: TouchEvent) {
        if (!active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) {
                active = false;
                touchId = null;
                knobPos = { x: 0, y: 0 };
                // Dispatch release event
                window.dispatchEvent(new CustomEvent("drami-virtual-move", { detail: { x: 0, y: 0 } }));
                break;
            }
        }
    }

    function updateKnob(clientX: number, clientY: number) {
        let dx = clientX - basePos.x;
        let dy = clientY - basePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
        }

        knobPos = { x: dx, y: dy };
        const normX = dx / maxRadius;
        const normY = dy / maxRadius;

        window.dispatchEvent(new CustomEvent("drami-virtual-move", { detail: { x: normX, y: normY } }));
    }
</script>

<!-- Mobile & iPad Virtual Joystick (Left Hand) -->
<div 
    class="virtual-joystick-zone"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    ontouchcancel={handleTouchEnd}
>
    <div class="joystick-base" class:active>
        <div 
            class="joystick-knob" 
            style="transform: translate({knobPos.x}px, {knobPos.y}px);"
        ></div>
    </div>
</div>

<style>
    .virtual-joystick-zone {
        position: fixed;
        bottom: 24px;
        left: 24px;
        width: 130px;
        height: 130px;
        z-index: 900;
        touch-action: none;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Only show on touch / mobile / tablet devices */
    @media (hover: hover) and (pointer: fine) {
        .virtual-joystick-zone {
            display: none;
        }
    }

    .joystick-base {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%);
        border: 2px solid rgba(253, 224, 71, 0.3);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.15s ease;
    }

    .joystick-base.active {
        border-color: rgba(253, 224, 71, 0.8);
        box-shadow: 0 0 20px rgba(234, 179, 8, 0.4);
    }

    .joystick-knob {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
        border: 2px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        will-change: transform;
    }
</style>
