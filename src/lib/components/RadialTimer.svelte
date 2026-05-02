<script lang="ts">
    import {MsToTime} from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";
    let progressBar : HTMLDivElement;
    let overTime: boolean = false;

    let {settings}: {settings: Settings} = $props();

    const isNegative = $derived(settings.currentStageTime < 0);

    $effect(() => {
        if (isNegative) {
            // Solid fill in contrast color — pulse handled by CSS
            progressBar.style.background = `var(--text-col)`;
        } else if(overTime){
            if (settings.currentStageTime % 1000 > 500){
                progressBar.style.background = `var(--timer-background-col)`;
            }else {
                progressBar.style.background = `var(--secondary-col)`;
            }
        }else{
            progressBar.style.background = `conic-gradient(var(--timer-background-col) ${(settings.currentStageTime%settings.stages[settings.activeStage].time)/settings.stages[settings.activeStage].time * 360}deg,var(--secondary-col) 0deg)`;
        }
        overTime = settings.currentStageTime >= settings.stages[settings.activeStage].time;
    });
</script>

<div bind:this={progressBar} class="circular-progress" class:negative={isNegative}>
    <div class="percentage text-5xl font-bold">
        <p>{MsToTime(settings.currentStageTime, settings.showSettings)}</p>
        <p>{MsToTime(settings.stages[settings.activeStage].time, settings.showSettings)}</p>
    </div>
</div>

<style>
    .circular-progress {
        width: var(--progress-bar-width);
        height: var(--progress-bar-height);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .percentage {
        display: flex;
        flex-direction: column;
        position: relative;
        color: var(--text-col);
    }

    /* Negative state: pulse the whole disc */
    .circular-progress.negative {
        animation: negative-pulse 1s ease-in-out infinite;
    }

    .circular-progress.negative .percentage,
    .circular-progress.negative .percentage p {
        color: var(--primary-col);
        text-shadow: none;
    }

    @keyframes negative-pulse {
        0%, 100% { filter: brightness(1); }
        50%      { filter: brightness(1.4); }
    }
</style>
