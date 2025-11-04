<script lang="ts">
    import { MsToTime } from "../functions/MsToTime";
    import type Settings from "../interfaces/Settings";

    // We bind to the inner 'fill' element
    let progressFill: HTMLDivElement;
    let overTime: boolean = false;

    let { settings }: { settings: Settings } = $props();

    $effect(() => {
        // Get the total time for the current stage
        const totalTime = settings.stages[settings.activeStage].time;
        const currentTime = settings.currentStageTime;

        if (progressFill) {
            if (overTime) {
                // --- Overtime Logic ---
                // Keep the bar full, but flash the color
                progressFill.style.width = '100%';
                if (currentTime % 1000 > 500) {
                    progressFill.style.background = `var(--timer-background-col)`;
                } else {
                    progressFill.style.background = `var(--secondary-col)`;
                }
            } else {
                // --- Normal Progress Logic ---
                // Calculate the percentage width
                const percentage = (currentTime % totalTime) / totalTime * 100;

                // Set the width and ensure the color is normal
                progressFill.style.width = `${percentage}%`;
                progressFill.style.background = `var(--secondary-col)`;
            }
        }

        // Update overTime state for the *next* run
        overTime = currentTime >= totalTime;
    });
</script>

<div class="linear-progress-bar">

    <div bind:this={progressFill} class="progress-fill"></div>

    <div class="percentage text-5xl font-bold">
        <p>{MsToTime(settings.currentStageTime, settings.showSettings)}</p>
        <p>{MsToTime(settings.stages[settings.activeStage].time, settings.showSettings)}</p>
    </div>
</div>

<style>
    .linear-progress-bar {
        /* Use your variable, or set to 100% */
        width: var(--progress-bar-width);
        /* Height should be much smaller for a linear bar */
        height: 120px;

        /* Style to match your buttons */
        background: var(--timer-background-col);
        border: 5px solid var(--secondary-col);
        border-radius: 8px;

        /* This is key for centering the text */
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: auto;

        /* This clips the .progress-fill inside the rounded border */
        overflow: hidden;
    }

    .progress-fill {
        /* This element sits *behind* the text */
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 0%; /* Default, will be set by $effect */

        background: var(--secondary-col);

        /* Smooth transitions for time, fast enough for flash */
        transition: width 0.03s linear, background 0.03s linear;
    }

    .percentage {
        display: flex;
        flex-direction: column;
        align-items: center;

        /* Sit on top of the .progress-fill */
        position: relative;
        z-index: 4;

        /* Use your main text color */
        color: var(--text-col);

        /* Add a shadow. This is IMPORTANT for readability
          when the text is over two different backgrounds.
        */
        text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
    }
</style>