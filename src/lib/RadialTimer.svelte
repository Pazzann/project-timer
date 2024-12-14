<script lang="ts">
    import {msToTime} from "./Utils";
    import type Settings from "./Settings";
    let progressBar : HTMLDivElement;
    let overTime: boolean = false;

    let {settings}: {settings: Settings} = $props();

    $effect(() => {
        if(overTime){
            if (settings.currentStageTime % 1000 > 500){
                progressBar.style.background = `#6EACDA`;
            }else {
                progressBar.style.background = `#03346E`;
            }
        }else{
            progressBar.style.background = `conic-gradient(#6EACDA ${(settings.currentStageTime%settings.stages[settings.activeStage].time)/settings.stages[settings.activeStage].time * 360}deg,#03346E 0deg)`;
        }
        overTime = settings.currentStageTime >= settings.stages[settings.activeStage].time;
    });



</script>

<div  bind:this={progressBar} class="circular-progress" data-inner-circle-color="lightgrey" data-progress-color="crimson" data-bg-color="black">
    <!--<div  class="inner-circle"></div>-->
    <div class="percentage text-5xl font-bold">
        <p>{msToTime(settings.currentStageTime, settings.showSettings)}</p>
        <p>{msToTime(settings.stages[settings.activeStage].time, settings.showSettings)}</p>
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
        color: rgb(0, 0, 0, 0.8);
    }


</style>