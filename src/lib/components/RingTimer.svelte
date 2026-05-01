<script lang="ts">
    import {MsToTime} from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";
    let progressBar : HTMLDivElement;
    let overTime: boolean = false;

    let {settings}: {settings: Settings} = $props();

    $effect(() => {
        if(overTime){
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

<div class="ring-wrapper timer-style-{settings.theme.buttonStyle}">
    <div bind:this={progressBar} class="circular-progress"></div>
    <div class="inner-circle">
        <div class="percentage text-5xl font-bold">
            <p>{MsToTime(settings.currentStageTime, settings.showSettings)}</p>
            <p class="total">{MsToTime(settings.stages[settings.activeStage].time, settings.showSettings)}</p>
        </div>
    </div>
</div>

<style>
    .ring-wrapper {
        position: relative;
        width: var(--progress-bar-width);
        height: var(--progress-bar-height);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .circular-progress {
        position: absolute;
        inset: 0;
        border-radius: 50%;
    }

    .inner-circle {
        position: relative;
        z-index: 2;
        width: 70%;
        height: 70%;
        border-radius: 50%;
        background: var(--background-col);
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
    }

    .percentage {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--text-col);
    }

    .percentage .total {
        font-size: 0.55em;
        opacity: 0.7;
    }

    /* --- Theme variants on the inner circle --- */
    .timer-style-minimal .inner-circle {
        background: var(--background-col);
    }

    .timer-style-material .inner-circle {
        background: var(--primary-col);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    }

    .timer-style-glass .inner-circle {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.22);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
    }

    .timer-style-glass .percentage {
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .timer-style-neumorphism .inner-circle {
        background: var(--primary-col);
        box-shadow:
            inset 8px 8px 16px rgba(0, 0, 0, 0.25),
            inset -8px -8px 16px rgba(255, 255, 255, 0.07);
    }

    .timer-style-retro .ring-wrapper,
    .timer-style-retro .circular-progress {
        border-radius: 0;
    }

    .timer-style-retro .inner-circle {
        border-radius: 0;
        background: var(--background-col);
        border: 2px solid var(--secondary-col);
        width: 60%;
        height: 60%;
        box-shadow:
            0 0 12px var(--secondary-col),
            inset 0 0 18px rgba(0, 0, 0, 0.4);
    }

    .timer-style-retro .percentage {
        text-shadow:
            0 0 6px var(--secondary-col),
            0 0 14px var(--secondary-col);
        font-family: 'Courier New', Courier, monospace;
    }
</style>
