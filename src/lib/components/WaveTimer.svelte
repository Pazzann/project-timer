<script lang="ts">
    import { MsToTime } from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";

    let waveFill: HTMLDivElement;

    let { settings }: { settings: Settings } = $props();

    const stage = $derived(settings.stages?.[settings.activeStage]);
    const currentTime = $derived(settings.currentStageTime);
    const isOvertime = $derived(stage ? currentTime >= stage.time : false);

    $effect(() => {
        if (!waveFill || !stage) return;

        if (isOvertime) {
            waveFill.style.height = '100%';
            const flashOn = currentTime % 1000 > 500;
            waveFill.style.background = flashOn
                ? `var(--timer-background-col)`
                : `var(--secondary-col)`;
        } else {
            const progress = (currentTime % stage.time) / stage.time;
            waveFill.style.height = `${progress * 100}%`;
            waveFill.style.background = `var(--secondary-col)`;
        }
    });
</script>

{#if stage}
<div class="wave-container timer-style-{settings.theme.buttonStyle}">
    <div bind:this={waveFill} class="wave-fill">
        <div class="wave-surface"></div>
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
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        background: rgba(255, 255, 255, 0.05);
    }

    .timer-style-neumorphism {
        border: none;
        border-radius: 50%;
        box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.3), -10px -10px 20px rgba(255, 255, 255, 0.07);
    }

    .timer-style-retro {
        border: 3px solid var(--secondary-col);
        border-radius: 0;
        box-shadow: 0 0 15px var(--secondary-col), inset 0 0 20px rgba(0, 0, 0, 0.5);
    }

    /* The rising fill — sits at the bottom, grows upward */
    .wave-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background: var(--secondary-col);
        transition: height 0.05s linear, background 0.05s linear;
    }

    /* Wave surface — wide ellipse that slides horizontally to simulate a wave */
    .wave-surface {
        position: absolute;
        top: -20px;
        left: -100%;
        width: 300%;
        height: 40px;
        background: inherit;
        border-radius: 50%;
        animation: wave-slide 3s linear infinite;
    }

    .timer-style-retro .wave-surface {
        animation: wave-slide 1.5s linear infinite;
        filter: drop-shadow(0 0 6px var(--secondary-col));
    }

    .timer-style-minimal .wave-surface {
        display: none;
    }

    @keyframes wave-slide {
        from { transform: translateX(0); }
        to   { transform: translateX(33.33%); }
    }

    .time-overlay {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--text-col);
        mix-blend-mode: difference;
        text-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
    }

    .timer-style-retro .time-overlay {
        mix-blend-mode: normal;
        text-shadow: 0 0 10px var(--secondary-col), 0 0 20px var(--secondary-col);
        color: var(--text-col);
    }

    .timer-style-glass .time-overlay {
        mix-blend-mode: normal;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .timer-style-neumorphism .time-overlay {
        mix-blend-mode: normal;
        text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3), -1px -1px 4px rgba(255, 255, 255, 0.1);
    }

    .total-time {
        font-size: 0.55em;
        opacity: 0.8;
    }
</style>
