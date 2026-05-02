<script lang="ts">
    import { MsToTime } from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";

    let { settings }: { settings: Settings } = $props();

    const stage = $derived(settings.stages?.[settings.activeStage]);
    const currentTime = $derived(settings.currentStageTime);
    const isOvertime = $derived(stage ? currentTime >= stage.time : false);
    const isNegative = $derived(currentTime < 0);
    const flashOn = $derived(isOvertime && currentTime % 1000 > 500);

    const currentTimeStr = $derived(stage ? MsToTime(currentTime, settings.showSettings) : '');
    const totalTimeStr = $derived(stage ? MsToTime(stage.time, settings.showSettings) : '');

    function isDigit(c: string) {
        return c >= '0' && c <= '9';
    }
</script>

{#if stage}
<div class="number-timer timer-style-{settings.theme.buttonStyle}" class:overtime={flashOn} class:negative={isNegative}>
    <div class="time-row main-time">
        {#each currentTimeStr.split('') as char}
            {#if isDigit(char)}
                <span class="digit">{char}</span>
            {:else}
                <span class="separator">{char}</span>
            {/if}
        {/each}
    </div>
    <div class="time-row total-row">
        {#each totalTimeStr.split('') as char}
            {#if isDigit(char)}
                <span class="digit small">{char}</span>
            {:else}
                <span class="separator small">{char}</span>
            {/if}
        {/each}
    </div>
</div>
{/if}

<style>
    .number-timer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 16px;
    }

    .time-row {
        display: flex;
        gap: 4px;
        align-items: center;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        line-height: 1;
    }

    .main-time { font-size: 60px; }
    .total-row { font-size: 28px; opacity: 0.65; }

    .digit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 0.75em;
        padding: 0.08em 0.18em;
        background: var(--primary-col);
        color: var(--text-col);
        border: 2px solid var(--secondary-col);
        border-radius: 6px;
        transition: background 0.1s linear, color 0.1s linear, box-shadow 0.1s linear, border-color 0.1s linear;
    }

    .digit.small {
        border-width: 1px;
        border-radius: 3px;
        padding: 0.05em 0.12em;
    }

    .separator {
        color: var(--text-col);
        padding: 0 0.05em;
    }

    /* --- Per-theme overrides --- */
    .timer-style-minimal .digit {
        border: none;
        background: transparent;
        padding: 0 0.1em;
    }

    .timer-style-material .digit {
        border: none;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .timer-style-glass .digit {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.22);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 10px;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .timer-style-neumorphism .digit {
        border: none;
        border-radius: 12px;
        box-shadow:
            4px 4px 10px rgba(0, 0, 0, 0.25),
            -4px -4px 10px rgba(255, 255, 255, 0.07);
    }

    .timer-style-retro .digit {
        border: 2px solid var(--secondary-col);
        border-radius: 0;
        box-shadow:
            0 0 8px var(--secondary-col),
            inset 0 0 12px rgba(0, 0, 0, 0.35);
        text-shadow:
            0 0 4px var(--text-col),
            0 0 12px var(--secondary-col),
            0 0 24px var(--secondary-col);
    }

    .timer-style-retro .separator {
        text-shadow:
            0 0 4px var(--text-col),
            0 0 12px var(--secondary-col),
            0 0 24px var(--secondary-col);
    }

    /* Overtime flash */
    .number-timer.overtime .digit {
        background: var(--timer-background-col);
        border-color: var(--timer-background-col);
    }

    /* Negative state — pulse + scheme color swap (fill = text-col, text = primary-col) */
    .number-timer.negative .digit {
        background: var(--text-col);
        color: var(--primary-col);
        border-color: var(--text-col);
        animation: number-negative-pulse 0.9s ease-in-out infinite;
    }

    .number-timer.negative .separator {
        color: var(--text-col);
        animation: number-negative-pulse 0.9s ease-in-out infinite;
    }

    .number-timer.negative.timer-style-retro .digit,
    .number-timer.negative.timer-style-retro .separator {
        text-shadow:
            0 0 4px var(--text-col),
            0 0 12px var(--text-col),
            0 0 24px var(--text-col);
    }

    .number-timer.negative.timer-style-retro .digit {
        box-shadow:
            0 0 8px var(--text-col),
            inset 0 0 12px rgba(0, 0, 0, 0.35);
    }

    @keyframes number-negative-pulse {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.55; }
    }
</style>
