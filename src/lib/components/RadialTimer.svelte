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

<div bind:this={progressBar} class="circular-progress timer-style-{settings.theme.buttonStyle}">
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

    .timer-style-retro .percentage {
        text-shadow: 0 0 8px var(--secondary-col), 0 0 20px var(--secondary-col);
    }

    .timer-style-neumorphism .percentage {
        text-shadow: 1px 1px 3px rgba(0,0,0,0.3), -1px -1px 3px rgba(255,255,255,0.1);
    }

    .timer-style-glass .percentage {
        text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
</style>