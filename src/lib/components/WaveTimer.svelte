<script lang="ts">
    import { MsToTime } from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";

    let { settings }: { settings: Settings } = $props();

    const stage = $derived(settings.stages?.[settings.activeStage]);
    const currentTime = $derived(settings.currentStageTime);
    const isOvertime = $derived(stage ? currentTime >= stage.time : false);
    const flashOn = $derived(isOvertime && currentTime % 1000 > 500);

    const fillHeight = $derived((() => {
        if (!stage) return 0;
        if (isOvertime) return 100;
        return ((currentTime % stage.time) / stage.time) * 100;
    })());
</script>

{#if stage}
<div class="wave-container timer-style-{settings.theme.buttonStyle}" class:overtime={flashOn}>
    <div class="wave-fill" style="height: {fillHeight}%">
        <svg class="wave-svg wave-front-svg" viewBox="0 0 200 40" preserveAspectRatio="none">
            <path d="M0,20 Q25,0 50,20 Q75,0 100,20 Q125,0 150,20 Q175,0 200,20 L200,40 L0,40 Z" />
        </svg>
        <svg class="wave-svg wave-back-svg" viewBox="0 0 200 40" preserveAspectRatio="none">
            <path d="M0,22 Q25,4 50,22 Q75,4 100,22 Q125,4 150,22 Q175,4 200,22 L200,40 L0,40 Z" />
        </svg>
    </div>
    <div class="time-overlay text-5xl font-bold">
        <p>{MsToTime(currentTime, settings.showSettings)}</p>
        <p class="total-time">{MsToTime(stage.time, settings.showSettings)}</p>
    </div>
</div>
{/if}

<style>
    .wave-container {
        position: relative;
        width: var(--progress-bar-width);
        height: var(--progress-bar-height);
        border-radius: 50%;
        border: 5px solid var(--secondary-col);
        background: var(--timer-background-col);
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .timer-style-minimal {
        border: none;
        border-radius: 8px;
    }

    .timer-style-material {
        border: none;
        border-radius: 24px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
    }

    .timer-style-glass {
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 50%;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        background: rgba(255, 255, 255, 0.05);
    }

    .timer-style-neumorphism {
        border: none;
        border-radius: 50%;
        box-shadow:
            10px 10px 20px rgba(0, 0, 0, 0.3),
            -10px -10px 20px rgba(255, 255, 255, 0.07);
    }

    .timer-style-retro {
        border: 3px solid var(--secondary-col);
        border-radius: 0;
        box-shadow:
            0 0 15px var(--secondary-col),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
    }

    /* Rising water column */
    .wave-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background: var(--secondary-col);
        transition: height 0.05s linear;
    }

    /* SVG sits at the top of the fill — wavy edge poking above the water surface.
       Width 200% + translateX(-50%) gives a perfectly seamless horizontal loop. */
    .wave-svg {
        position: absolute;
        top: -20px;
        left: 0;
        width: 200%;
        height: 40px;
        pointer-events: none;
    }

    .wave-front-svg {
        animation: wave-slide 4s linear infinite;
    }

    .wave-back-svg {
        animation: wave-slide 6s linear infinite reverse;
        opacity: 0.55;
    }

    .wave-front-svg path,
    .wave-back-svg path {
        fill: var(--secondary-col);
    }

    .wave-container.overtime .wave-fill {
        background: var(--timer-background-col);
    }

    .wave-container.overtime .wave-front-svg path,
    .wave-container.overtime .wave-back-svg path {
        fill: var(--timer-background-col);
    }

    @keyframes wave-slide {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
    }

    /* Theme-specific wave tweaks */
    .timer-style-retro .wave-front-svg {
        animation-duration: 2.5s;
        filter: drop-shadow(0 0 6px var(--secondary-col));
    }
    .timer-style-retro .wave-back-svg {
        animation-duration: 3.5s;
        opacity: 0.7;
    }

    .timer-style-minimal .wave-back-svg {
        display: none;
    }

    .time-overlay {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--text-col);
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
    }

    .timer-style-retro .time-overlay {
        text-shadow:
            0 0 8px var(--secondary-col),
            0 0 18px var(--secondary-col);
        font-family: 'Courier New', Courier, monospace;
    }

    .timer-style-glass .time-overlay {
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
    }

    .timer-style-neumorphism .time-overlay {
        text-shadow:
            1px 1px 4px rgba(0, 0, 0, 0.35),
            -1px -1px 4px rgba(255, 255, 255, 0.08);
    }

    .total-time {
        font-size: 0.55em;
        opacity: 0.8;
    }
</style>
