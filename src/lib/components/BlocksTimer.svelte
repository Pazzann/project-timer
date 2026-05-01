<script lang="ts">
    import { MsToTime } from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";

    let { settings }: { settings: Settings } = $props();

    const COLS = 8;
    const ROWS = 8;
    const TOTAL_CELLS = COLS * ROWS;

    let flashState = $state(false);

    const stage = $derived(settings.stages?.[settings.activeStage]);
    const currentTime = $derived(settings.currentStageTime);
    const isOvertime = $derived(stage ? currentTime >= stage.time : false);

    const filledCells = $derived((() => {
        if (!stage) return 0;
        if (isOvertime) return TOTAL_CELLS;
        const progress = (currentTime % stage.time) / stage.time;
        return Math.floor(progress * TOTAL_CELLS);
    })());

    $effect(() => {
        if (isOvertime) {
            flashState = currentTime % 1000 > 500;
        } else {
            flashState = false;
        }
    });

    function isFilled(index: number): boolean {
        return index < filledCells;
    }
</script>

{#if stage}
<div class="blocks-timer timer-style-{settings.theme.buttonStyle}">
    <div class="blocks-grid">
        {#each { length: TOTAL_CELLS } as _, i}
            <div
                class="block"
                class:filled={isFilled(i)}
                class:flash-on={isOvertime && flashState}
                class:flash-off={isOvertime && !flashState}
            ></div>
        {/each}
    </div>
    <div class="time-display text-3xl font-bold">
        <span>{MsToTime(currentTime, settings.showSettings)}</span>
        <span class="total-time">/ {MsToTime(stage.time, settings.showSettings)}</span>
    </div>
</div>
{/if}

<style>
    .blocks-timer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: var(--progress-bar-width);
        padding: 16px;
        border: 5px solid var(--secondary-col);
        border-radius: 8px;
        background: var(--timer-background-col);
        box-sizing: border-box;
    }

    .timer-style-minimal {
        border: none;
        border-radius: 2px;
        padding: 8px;
    }

    .timer-style-material {
        border: none;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        padding: 20px;
    }

    .timer-style-glass {
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        background: rgba(255, 255, 255, 0.05);
    }

    .timer-style-neumorphism {
        border: none;
        border-radius: 16px;
        box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.25), -8px -8px 16px rgba(255, 255, 255, 0.07);
    }

    .timer-style-retro {
        border: 2px solid var(--secondary-col);
        border-radius: 0;
        box-shadow: 0 0 12px var(--secondary-col), inset 0 0 20px rgba(0, 0, 0, 0.4);
    }

    .blocks-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 6px;
        width: 100%;
    }

    .timer-style-minimal .blocks-grid {
        gap: 3px;
    }

    .block {
        aspect-ratio: 1;
        background: var(--primary-col);
        border: 1px solid var(--secondary-col);
        border-radius: 4px;
        transition: background 0.08s ease, box-shadow 0.08s ease;
    }

    .timer-style-minimal .block {
        border: none;
        border-radius: 1px;
    }

    .timer-style-material .block {
        border: none;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .timer-style-glass .block {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
    }

    .timer-style-neumorphism .block {
        border: none;
        border-radius: 6px;
        box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.06);
    }

    .timer-style-retro .block {
        border-radius: 0;
        border: 1px solid var(--secondary-col);
    }

    /* Filled state */
    .block.filled {
        background: var(--secondary-col);
    }

    .timer-style-retro .block.filled {
        box-shadow: 0 0 6px var(--secondary-col), 0 0 12px var(--secondary-col);
    }

    .timer-style-glass .block.filled {
        background: var(--secondary-col);
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
    }

    .timer-style-neumorphism .block.filled {
        box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -1px -1px 3px rgba(255, 255, 255, 0.05);
    }

    /* Overtime flash */
    .block.flash-on.filled {
        background: var(--timer-background-col);
    }

    .block.flash-off.filled {
        background: var(--secondary-col);
    }

    .time-display {
        color: var(--text-col);
        display: flex;
        align-items: baseline;
        gap: 8px;
    }

    .timer-style-retro .time-display {
        text-shadow: 0 0 8px var(--secondary-col);
        font-family: 'Courier New', Courier, monospace;
    }

    .timer-style-glass .time-display {
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .total-time {
        font-size: 0.6em;
        opacity: 0.7;
    }
</style>
