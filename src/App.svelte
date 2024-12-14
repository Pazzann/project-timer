<script lang="ts">
    import type Settings from "./lib/Settings";
    import RadialTimer from "./lib/RadialTimer.svelte";
    import LinearTimer from "./lib/LinearTimer.svelte";
    import NumberTimer from "./lib/NumberTimer.svelte";
    import "./lib/button.css";
    import {msToTime} from "./lib/Utils";
    import {SortableList} from '@jhubbardsf/svelte-sortablejs';

    import {
        fade,
        scale,
        fly
    } from 'svelte/transition';
    import StageInput from "./lib/StageInput.svelte";


    let settings: Settings = $state({
        theme: {
            backgroundCol: "#021526",
            primaryColor: "#3f6c7a",
            secondaryColor: "#03346E",
            textColor: "#E2E2B6",
            timerType: "radial"},
        name: "Default Timer",
        stages: [
            {id: "Default1", time: 15000, type: "allow-overlap"},
            {id: "Default2", time: 15000, type: "allow-overlap"},
            {id: "Default3", time: 5000, type: "allow-overlap"},

        ],
        showSettings: ["h", "m", "s", "ms"],
        currentStageTime: 0,
        activeStage: 2
    });


    let progress: ReturnType<typeof setInterval> | null = $state(null);

    let menuVisible: boolean = $state(false);

    // progress = setInterval(() => {
    //   settings.currentStageTime +=10;
    // }, 10);

    let startTime: number = 0;

    function onTimerButtonClick() {
        if (progress) {
            clearInterval(progress);
            progress = null;
        } else {
            startTime = Date.now();
            progress = setInterval(() => {
                const now = Date.now();
                settings.currentStageTime += now - startTime;
                startTime = now;
            }, 10);
        }
    }

    function onResetButtonClick() {
        settings.currentStageTime = 0;
        if (progress) {
            clearInterval(progress);
            progress = null;
        }
    }

    function changeTimerStage(di: number) {
        let potentialStage = settings.activeStage + di;
        if (potentialStage >= 0 && potentialStage < settings.stages.length) {
            settings.activeStage = potentialStage;
            settings.currentStageTime = 0;
            startTime = Date.now();
        }
    }

    function toggleMenu() {
        menuVisible = !menuVisible;
    }

    function copy() {
        navigator.clipboard.writeText(JSON.stringify(settings));
    }

    let parseFieldValue: string = $state("");

    function parse() {
        let parsedSettings: Settings = JSON.parse(parseFieldValue);
        // settings.stages = parsedSettings.stages;
        settings = parsedSettings;
        parseFieldValue = "";
    }

    function updateColor(variable: string, value: string) {
        document.documentElement.style.setProperty(variable, value);
    }




</script>

<main>
    <div class="main-body">

        <div class="settingsPanel">
            {#key settings}
                <button onclick={toggleMenu} class="timer-button">=</button>
                {#if menuVisible}
                    <div transition:fly={{x: -200,  duration: 300}} class="settingsPanelBody flex flex-col gap-1.5">
                        <div class="flex flex-row justify-between w-full"><p> Stages: </p>
                            <button onclick={()=>{settings.stages.push({id: "Default", time: 15000, type:"allow-overlap"})}}
                                    class="timer-button">+
                            </button>
                        </div>
                        <div class="stages-panel flex flex-col overflow-scroll">
                            <SortableList
                                    onUpdate={(event) => {
                        let temp = settings.stages[event.oldIndex];
                        settings.stages[event.oldIndex] = settings.stages[event.newIndex];
                        settings.stages[event.newIndex] = temp;
                        onResetButtonClick();

                      }}
                                    class="flex flex-col gap-1.5"
                                    group="nested"
                                    animation={150}
                                    forceFallback={true}
                                    swapThreshold={0.65}
                            >
                                {#each settings.stages as item, i}
                                    <StageInput settings={settings} index={i}></StageInput>
                                {/each}
                            </SortableList>
                        </div>

                        <div class="flex flex-row gap-1.5">
                            h:
                            <input type="checkbox" bind:group={settings.showSettings} value="h"/>
                            m:
                            <input type="checkbox" bind:group={settings.showSettings} value="m"/>
                            s:
                            <input type="checkbox" bind:group={settings.showSettings} value="s"/>
                            ms:
                            <input type="checkbox" bind:group={settings.showSettings} value="ms"/>
                        </div>

                        <div class="flex">
                            <input
                                    type="color"
                                    bind:value={settings.theme.backgroundCol}
                                    oninput={() => updateColor('--background-col', settings.theme.backgroundCol)}
                            />

                            <input
                                    type="color"
                                    bind:value={settings.theme.primaryColor}
                                    oninput={() => updateColor('--primary-col', settings.theme.primaryColor)}
                            />


                            <input
                                    type="color"
                                    bind:value={settings.theme.secondaryColor}
                                    oninput={() => updateColor('--secondary-col', settings.theme.secondaryColor)}
                            />
                            <input
                                    type="color"
                                    bind:value={settings.theme.textColor}
                                    oninput={() => updateColor('--text-col', settings.theme.textColor)}
                            />

                        </div>


                        <div>Preset:</div>
                        <input class="parse-in" type="text" bind:value={parseFieldValue}
                               placeholder="parse preset here"/>
                        <div class="flex flex-row">
                            <button onclick={copy} class="timer-button">Copy</button>
                            <button onclick={parse} class="timer-button">Parse</button>
                        </div>

                    </div>
                {/if}
            {/key}
        </div>


        {#key settings}
            <input bind:value={settings.name} class="input-name text-center text-7xl" type="text"/>

            <div class="timer-body flex flex-col gap-4">
                <div class="timer content-center justify-center flex flex-row">
                    {#if settings.theme.timerType === "radial"}
                        <RadialTimer settings={settings}></RadialTimer>
                    {:else if settings.theme.timerType === "linear"}
                        <LinearTimer></LinearTimer>
                    {:else}
                        <NumberTimer></NumberTimer>
                    {/if}

                    <div class="stages-body flex flex-col justify-center content-center gap-1.5">
                        <div class="stage-first-line flex text-center overflow-hidden flex-col-reverse text-2xl">
                            {#each settings.stages.filter((item, index) => index < settings.activeStage).reverse() as item, i}
                                <p transition:scale>{item.id}   {msToTime(item.time, settings.showSettings)}</p>
                            {/each}
                        </div>

                        {#key settings.stages[settings.activeStage].id}
                            <div in:scale
                                 class="sel-stage text-6xl font-bold text-center">{settings.stages[settings.activeStage].id}</div>
                        {/key}

                        <div class="stage-last-line flex-col text-center overflow-hidden text-2xl">
                            {#each settings.stages as item, i}
                                {#if i > settings.activeStage}
                                    <p transition:scale>{item.id}   {msToTime(item.time, settings.showSettings)}</p>
                                {/if}
                            {/each}
                        </div>
                    </div>
                </div>
                <nav class="flex flex-row">
                    <button onclick={onTimerButtonClick} class="timer-button">{progress ? "Pause" : "Start"}</button>
                    <button onclick={onResetButtonClick} class="timer-button">{"Reset"}</button>
                    <div class="flex">
                        <button onclick={()=>changeTimerStage(-1)} class="timer-button">{"<<"}</button>
                        <button onclick={()=>changeTimerStage(1)} class="timer-button">{">>"}</button>
                    </div>
                </nav>


            </div>
        {/key}
    </div>

</main>

<style>
    .input-name {
        background: var(--background-col);
    }

    .stages-panel {
        max-height: 300px;

    }

    .timer-body {
        height: var(--progress-bar-height);
    }

    nav {
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .stages-body {
        width: var(--progress-bar-width);
        max-height: 400px;
    }


    .settingsPanel {
        z-index: 10;
        position: absolute;
        left: 10px;
        top: 10px;
    }

    .settingsPanelBody {
        position: absolute;
        object-fit: contain;
        outline: none;
        align-items: center;
        background: var(--primary-col);
        border: 5px solid var(--secondary-col);
        border-radius: 8px;
        color: #11274b;
        text-align: center;
        font-size: 23px;
        padding: 20px;
    }

    main {
        margin: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 40px;

    }

    .sel-stage {
        overflow-wrap: break-word;
        font-family: Segoe UI, sans-serif;
    }

    .stage-first-line {
        height: 100%;
        overflow-wrap: break-word;
    }

    .stage-last-line {
        height: 100%;
        overflow-wrap: break-word;
    }

    .main-body {
        width: calc(var(--progress-bar-width) * 2);
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 40px;
    }

    .parse-in {
        background: var(--primary-col);
        border: 5px solid var(--secondary-col);
        border-radius: 10px;
    }
</style>
