//TODO: FIX


<script lang="ts">
    import { MsToTime } from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";
    import FlipDigit from "./FlipDigit.svelte";

    let { settings }: { settings: Settings } = $props();

    const stage = $derived(settings.stages?.[settings.activeStage]);
    const currentTime = $derived(settings.currentStageTime);

    const timeStrings = $derived((() => {
        if (!stage) {
            return { current: [], total: [] };
        }

        const totalTime = stage.time;
        const newTimeStr = MsToTime(currentTime, settings.showSettings);
        const newTimeArr = newTimeStr.split('');
        const totalTimeStr = MsToTime(totalTime, settings.showSettings);
        const totalTimeArr = totalTimeStr.split('');

        return {
            current: newTimeArr,
            total: totalTimeArr,
        };
    })());

    let previousTimeStrings = $state.raw(timeStrings);

    $effect(() => {
        // The effect's cleanup function runs right before the effect re-runs.
        // This means we can capture the "current" value of timeStrings just before it changes.
        return () => {
            previousTimeStrings = timeStrings;
        };
    });

    const showOvertime = $derived(stage && currentTime >= stage.time && (currentTime % 1000 > 500));

</script>

{#if stage}
<div class="neon-timer" class:overtime-flash={showOvertime}>
    <div class="flip-clock">
        {#each timeStrings.current as char, i}
            {#if char === ':'}
                <div class="colon">:</div>
            {:else}
                <FlipDigit
                        char={char}
                        previousChar={previousTimeStrings.current[i] || char}
                />
            {/if}
        {/each}
    </div>

    <div class="flip-clock total-time">
        {#each timeStrings.total as char, i}
            {#if char === ':'}
                <div class="colon">:</div>
            {:else}
                <FlipDigit char={char} previousChar={previousTimeStrings.total[i] || char} />
            {/if}
        {/each}
    </div>
</div>
{/if}



<style>
    .neon-timer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .flip-clock {
        display: flex;
        gap: 8px; /* Gap between digits */
        align-items: center;
        justify-content: center;
    }

    .colon {
        font-family: 'Courier New', Courier, monospace;
        font-size: 60px;
        font-weight: bold;
        color: var(--text-col);
        /* Neon glow effect */
        text-shadow:
                0 0 5px var(--text-col),
                0 0 15px var(--secondary-col),
                0 0 25px var(--secondary-col);

        /* Align with the flipping digits */
        line-height: 1;
        padding-bottom: 10px; /* Manual alignment */
        transition: color 0.1s;
    }

    /* Style for the smaller total-time clock */
    .total-time {
        transform: scale(0.5); /* Make it half size */
        opacity: 0.7;
    }

    /* --- Overtime Flash Effect --- */
    /* This overrides the colors in FlipDigit.svelte */
    .overtime-flash .colon {
        color: var(--timer-background-col);
        text-shadow: none;
    }

    .overtime-flash :global(.digit-card) {
        border-color: var(--timer-background-col);
    }
    .overtime-flash :global(.digit-card span) {
        color: var(--timer-background-col);
        text-shadow: none;
    }
</style>