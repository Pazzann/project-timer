<script lang="ts">
    import type Settings from "./lib/interfaces/Settings";
    import RadialTimer from "./lib/components/RadialTimer.svelte";
    import LinearTimer from "./lib/components/LinearTimer.svelte";
    import NumberTimer from "./lib/components/NumberTimer.svelte";
    import "./lib/styles/Button.css";
    import "./lib/styles/Icons.css";
    import {MsToTime} from "./lib/functions/MsToTime";
    import {SortableList} from '@jhubbardsf/svelte-sortablejs';

    import {
        fade,
        scale,
        fly
    } from 'svelte/transition';
    import StageInput from "./lib/components/StageInput.svelte";
    import type CameraSettings from "./lib/interfaces/CameraSettings";


    let settings: Settings = $state({
        theme: {
            backgroundCol: "#021526",
            primaryColor: "#3f6c7a",
            secondaryColor: "#03346E",
            timerSecondaryColor: "#6EACDA",
            textColor: "#E2E2B6",
            timerType: "radial"
        },
        name: "Default Timer",
        stages: [
            {id: "Default1", time: 15000, type: "allow-overlap", index: 0},
            {id: "Default2", time: 15000, type: "allow-overlap", index: 1},
            {id: "Default3", time: 5000, type: "allow-overlap", index: 2},

        ],
        showSettings: ["h", "m", "s", "ms"],
        currentStageTime: 0,
        activeStage: 2
    });

    let cameraSettings: CameraSettings = $state({
        width: 1280,
        height: 720,
        fps: 30,
        enabled: false
    });

    let cameraSettingsVisible: boolean = $state(false);

    function toggleCameraSettings() {
        cameraSettingsVisible = !cameraSettingsVisible;
        if (cameraSettingsVisible) {
            menuVisible = false;
            infoVisible = false;
        }
    }

    function toggleInfoPanel() {
        infoVisible = !infoVisible;
        if (infoVisible) {
            menuVisible = false;
            cameraSettingsVisible = false;
        }
    }

    function changeCameraState() {

    }


    let progress: ReturnType<typeof setInterval> | null = $state(null);

    let menuVisible: boolean = $state(false);

    let infoVisible: boolean = $state(false);

    let deltaTime: number = $state(10000);

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

    function onFullResetButtonClick() {
        settings.currentStageTime = 0;
        settings.activeStage = 0;
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

    function changeTimerTime(dt: number) {
        settings.currentStageTime += dt;
        startTime = Date.now();
    }

    function toggleMenu() {
        menuVisible = !menuVisible;
        if (menuVisible) {
            cameraSettingsVisible = false;
            infoVisible = false;
        }
    }

    function copy() {
        navigator.clipboard.writeText(JSON.stringify(settings));
    }

    let parseFieldValue: string = $state("");

    function parse() {
        let parsedSettings: Settings = JSON.parse(parseFieldValue);
        // settings.stages = parsedSettings.stages;

        for (let i = 0; i < parsedSettings.stages.length; i++) {
            parsedSettings.stages[i].index = i;
        }
        settings = parsedSettings;
        parseFieldValue = "";
        updateColor('--background-col', settings.theme.backgroundCol);
        updateColor('--primary-col', settings.theme.primaryColor);
        updateColor('--secondary-col', settings.theme.secondaryColor);
        updateColor('--timer-background-col', settings.theme.timerSecondaryColor);
        updateColor('--text-col', settings.theme.textColor);

    }

    function updateColor(variable: string, value: string) {
        document.documentElement.style.setProperty(variable, value);
    }

    function deleteStage(index: number) {
        settings.stages = settings.stages.filter((item) => item.index !== index);
        for (let i = 0; i < settings.stages.length; i++) {
            settings.stages[i].index = i;
        }
        shiza++;
    }


    let shiza = $state(0);

</script>

<main>
    <div class="main-body">

        <!--Settings-->
        <div class="defaultSettings settingsPanel">
            {#key settings}
                <button onclick={toggleMenu} class="timer-button">
                    {#if menuVisible}
                        <div class="close-icon icon"/>
                    {:else}
                        <div class="settings-icon icon"/>
                    {/if}
                </button>
                {#if menuVisible}
                    <div transition:fly={{x: -200,  duration: 300}} class="settingsBody panelBody flex flex-col gap-1.5">
                        <div class="flex flex-row justify-between w-full"><p> Stages: </p>
                            <button onclick={()=>{settings.stages.push({id: "Default", time: 15000, type:"allow-overlap", index: settings.stages.length})}}
                                    class="timer-button"><div class="icon add-icon"/>
                            </button>
                        </div>
                        <div class="stages-panel flex flex-col overflow-scroll">
                            {#key shiza}
                                <SortableList
                                        onUpdate={(event) => {
                        let temp = settings.stages[event.oldIndex];
                        settings.stages[event.oldIndex] = settings.stages[event.newIndex];
                        settings.stages[event.oldIndex].index = event.oldIndex;
                        settings.stages[event.newIndex] = temp;
                        settings.stages[event.newIndex].index = event.newIndex;

                        shiza+=1;
                        onResetButtonClick();

                      }}
                                        class="flex flex-col gap-1.5"
                                        group="nested"
                                        animation={150}
                                        forceFallback={true}
                                        swapThreshold={0.65}
                                >

                                    {#each settings.stages as item}
                                        <StageInput deleteStage={deleteStage} item={item}></StageInput>
                                    {/each}


                                </SortableList>
                            {/key}
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
                                    bind:value={settings.theme.timerSecondaryColor}
                                    oninput={() => updateColor('--timer-background-col', settings.theme.timerSecondaryColor)}
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

        <!--Camera-->
        <div class="cameraSettings settingsPanel">
            {#key cameraSettings}
                <button onclick={toggleCameraSettings} class="timer-button">
                    {#if cameraSettingsVisible}
                        <div class="close-icon icon"/>
                    {:else}
                        <div class="camera-icon icon"/>
                    {/if}
                </button>
                {#if cameraSettingsVisible}
                    <div transition:fly={{x: 200,  duration: 300}}
                         class="cameraSettingsBody panelBody flex flex-col gap-1.5">
                        <p> Camera Settings: </p>


                        <div class="flex flex-row gap-1.5 justify-between">
                            <div>Width:</div>
                            <input class="parse-in" type="number" bind:value={cameraSettings.width}
                                   placeholder="width"/>
                        </div>

                        <div class="flex flex-row gap-1.5 justify-between">
                            <div>Height:</div>
                            <input class="parse-in" type="number" bind:value={cameraSettings.height}
                                   placeholder="height"/>
                        </div>
                        <div class="flex flex-row gap-1.5 justify-between">
                            <div>fps:</div>
                            <input class="parse-in" type="number" bind:value={cameraSettings.fps}
                                   placeholder="fps"/>
                        </div>


                        <div class="flex flex-row gap-1.5">
                            Camera Enabled:
                            {#if cameraSettings.enabled}
                                Camera Is Working!
                            {:else}
                                Camera Is Disabled!
                            {/if}
                        </div>

                        <div class="flex flex-row">
                            <button onclick={changeCameraState} class="timer-button">
                                {#if cameraSettings.enabled}
                                    Disable
                                {:else}
                                    Enable
                                {/if}
                            </button>
                        </div>

                    </div>
                {/if}
            {/key}
        </div>

        <!--Info-->
        <div class="settingsPanel infoPanel">
            <button onclick={toggleInfoPanel} class="timer-button">
                {#if infoVisible}
                    <div class="close-icon icon"/>
                {:else}
                    <div class="info-icon icon"/>
                {/if}
            </button>
            {#if infoVisible}
                <div transition:fly={{x: 200,  duration: 300}}
                     class="infoSettingsBody panelBody flex flex-col gap-1.5">
                    La la la
                    developed by Anton Matiash)
                </div>
            {/if}
        </div>

        {#key settings}
            <input bind:value={settings.name} class="input-name text-center text-7xl" type="text"/>

            <div class="flex flex-col gap-4">
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
                                <p transition:scale>{item.id}   {MsToTime(item.time, settings.showSettings)}</p>
                            {/each}
                        </div>

                        {#key settings.stages[settings.activeStage].id}
                            <div in:scale
                                 class="sel-stage text-6xl font-bold text-center">{settings.stages[settings.activeStage].id}</div>
                        {/key}

                        <div class="stage-last-line flex-col text-center overflow-hidden text-2xl">
                            {#each settings.stages as item, i}
                                {#if i > settings.activeStage}
                                    <p transition:scale>{item.id}   {MsToTime(item.time, settings.showSettings)}</p>
                                {/if}
                            {/each}
                        </div>
                    </div>
                </div>
                <nav class="flex flex-row">
                    <button onclick={onTimerButtonClick} class="timer-button">{progress ? "Pause" : "Start"}</button>
                    <button onclick={onResetButtonClick} class="timer-button">{"Reset"}</button>
                    <button onclick={onFullResetButtonClick} class="timer-button">{"Full reset"}</button>
                    <div class="flex">
                        <button onclick={()=>changeTimerStage(-1)} class="timer-button">{"<<"}</button>
                        <button onclick={()=>changeTimerStage(1)} class="timer-button">{">>"}</button>
                    </div>
                    <div class="flex">
                        <input class="delta-input text-4xl" type="number" bind:value={deltaTime}/>
                        <button onclick={()=>changeTimerTime(deltaTime)} class="timer-button">{"▲"}</button>
                        <button onclick={()=>changeTimerTime(-deltaTime)} class="timer-button">{"▼"}</button>
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

    nav {
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .stages-body {
        width: var(--progress-bar-width);
        max-height: 400px;
    }

    .defaultSettings {
        left: 10px;
    }

    .cameraSettings {
        right: 10px;
    }

    .infoPanel {
        right: 80px;
    }

    .cameraSettingsBody {
        right: 0;
    }

    .infoSettingsBody{
        right: -70px;
    }

    .settingsBody{
        left: 0;
    }

    .settingsPanel {
        z-index: 10;
        position: absolute;
        top: 10px;
    }

    .panelBody {
        position: absolute;
        object-fit: contain;
        outline: none;
        align-items: center;
        background: var(--primary-col);
        border: 5px solid var(--secondary-col);
        border-radius: 8px;
        text-align: center;
        font-size: 23px;
        padding: 20px;

        top: 70px;
    }

    .delta-input {
        background: var(--primary-col);
        border: 5px solid var(--secondary-col);
        border-radius: 8px;
        width: 140px;
    }

    main {
        margin: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 40px;
        scrollbar-width: none;

        overflow: hidden;
    }

    main::-webkit-scrollbar {
        display: none;
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
