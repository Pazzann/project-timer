<script lang="ts">
    import { MsToTime } from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";

    let progressFill: HTMLDivElement;
    let overTime: boolean = false;

    let { settings }: { settings: Settings } = $props();

    const isNegative = $derived(settings.currentStageTime < 0);

    $effect(() => {
        const totalTime = settings.stages[settings.activeStage].time;
        const currentTime = settings.currentStageTime;

        if (progressFill) {
            if (isNegative) {
                // Drain: 100% at t=0 -> 0% at t=-totalTime
                const drainProgress = Math.max(0, Math.min(1, 1 + currentTime / totalTime));
                progressFill.style.width = `${drainProgress * 100}%`;
                progressFill.style.background = `var(--text-col)`;
            } else if (overTime) {
                progressFill.style.width = '100%';
                if (currentTime % 1000 > 500) {
                    progressFill.style.background = `var(--timer-background-col)`;
                } else {
                    progressFill.style.background = `var(--secondary-col)`;
                }
            } else {
                const percentage = (currentTime % totalTime) / totalTime * 100;
                progressFill.style.width = `${percentage}%`;
                progressFill.style.background = `var(--secondary-col)`;
            }
        }

        overTime = currentTime >= totalTime;
    });
</script>

<div class="linear-progress-bar timer-style-{settings.theme.buttonStyle}" class:negative={isNegative}>

    <div bind:this={progressFill} class="progress-fill"></div>

    <div class="percentage text-5xl font-bold">
        <p>{MsToTime(settings.currentStageTime, settings.showSettings)}</p>
        <p>{MsToTime(settings.stages[settings.activeStage].time, settings.showSettings)}</p>
    </div>
</div>

<style>
    .linear-progress-bar {
        width: var(--progress-bar-width);
        height: 120px;
        background: var(--timer-background-col);
        border: 5px solid var(--secondary-col);
        border-radius: 8px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: auto;
        overflow: hidden;
    }

    /* --- Per-theme overrides --- */
    .timer-style-minimal {
        border: none;
        border-radius: 2px;
    }

    .timer-style-material {
        border: none;
        border-radius: 24px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .timer-style-glass {
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }

    .timer-style-neumorphism {
        border: none;
        border-radius: 12px;
        box-shadow: inset 6px 6px 14px rgba(0, 0, 0, 0.25), inset -6px -6px 14px rgba(255, 255, 255, 0.08);
    }

    .timer-style-retro {
        border: 2px solid var(--secondary-col);
        border-radius: 0;
        box-shadow: 0 0 10px var(--secondary-col), inset 0 0 15px rgba(0, 0, 0, 0.4);
    }

    .progress-fill {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 0%;
        background: var(--secondary-col);
        transition: width 0.03s linear, background 0.03s linear;
    }

    .timer-style-retro .progress-fill {
        box-shadow: 0 0 12px var(--secondary-col);
    }

    .percentage {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 4;
        color: var(--text-col);
        text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
    }

    .timer-style-minimal .percentage,
    .timer-style-material .percentage {
        text-shadow: none;
    }

    .timer-style-retro .percentage {
        text-shadow: 0 0 8px var(--secondary-col);
    }

    /* Negative drain — fill in text-col, text in secondary-col */
    .linear-progress-bar.negative {
        border-color: var(--text-col);
    }

    .linear-progress-bar.negative .percentage,
    .linear-progress-bar.negative .percentage p {
        color: var(--primary-col);
        text-shadow: none;
    }

    .linear-progress-bar.negative.timer-style-retro {
        box-shadow: 0 0 10px var(--text-col), inset 0 0 15px rgba(0, 0, 0, 0.4);
    }

    .linear-progress-bar.negative.timer-style-retro .percentage,
    .linear-progress-bar.negative.timer-style-retro .percentage p {
        text-shadow: 0 0 8px var(--text-col);
    }
</style>
