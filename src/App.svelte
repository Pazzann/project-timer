<script lang="ts">
    import type Settings from "./lib/interfaces/Settings";
    import RadialTimer from "./lib/components/RadialTimer.svelte";
    import LinearTimer from "./lib/components/LinearTimer.svelte";
    import NumberTimer from "./lib/components/NumberTimer.svelte";
    import "./lib/styles/Button.css";
    import "./lib/styles/Icons.css";
    import "./lib/styles/ColorInput.css";
    import "./lib/styles/CheckBoxInput.css";
    import {MsToTime} from "./lib/functions/MsToTime";
    import {SortableList} from '@jhubbardsf/svelte-sortablejs';
    import {
        scale,
        fly
    } from 'svelte/transition';
    import StageInput from "./lib/components/StageInput.svelte";
    import type CameraSettings from "./lib/interfaces/CameraSettings";
    import type {TimerType} from "./lib/types/TimerType";
    import {getDefaultSettings} from "./lib/functions/getDefaultSettings";


    // main variables
    let settings: Settings = $state(getDefaultSettings());

    let cameraSettings: CameraSettings = $state({
        width: 900,
        height: 720,
        fps: 30,
        enabled: false
    });


    let isElectron: boolean = $state(false);
    let files: string[] = $state([]);

    if (window?.api && window?.api.isElectron) {
        isElectron = true;
        readSaves();
        if(files.length > 0){
            loadSave(files[files.length - 1]);
        }
    } else {
        isElectron = false;
    }

    function readSaves(){
        files = window.api.fs.readdir().filter(file => file.endsWith(".json"));
    }

    function loadSave(fileName: string){
        readSaves()
        if(!files.includes(fileName)){
            return;
        }
        let fileContent: string = window.api.fs.readFile(fileName) as string;
        parse(fileContent)
    }

    function deleteSave(fileName: string){
        window.api.fs.removeFile(fileName);
        readSaves();
    }

    function makeSave(){
        let fileName = settings.name.split(" ").join("_") + ".json";
        window.api.fs.writeFile(fileName, JSON.stringify(settings));
        readSaves();
    }

    //

    //Menu panels visibility
    let cameraSettingsVisible: boolean = $state(false);
    let menuVisible: boolean = $state(false);
    let infoVisible: boolean = $state(false);
    let savesVisible: boolean = $state(false);

    function toggleSavesPanel() {
        savesVisible = !savesVisible;
        if (savesVisible) {
            menuVisible = false;
            cameraSettingsVisible = false;
            infoVisible = false;
        }
    }

    function toggleCameraSettings() {
        cameraSettingsVisible = !cameraSettingsVisible;
        if (cameraSettingsVisible) {
            menuVisible = false;
            infoVisible = false;
            savesVisible = false;
        }
    }

    function toggleInfoPanel() {
        infoVisible = !infoVisible;
        if (infoVisible) {
            menuVisible = false;
            cameraSettingsVisible = false;
            savesVisible = false;
        }
    }

    function toggleMenu() {
        menuVisible = !menuVisible;
        if (menuVisible) {
            cameraSettingsVisible = false;
            infoVisible = false;
            savesVisible = false;
        }
    }

    // settings updates
    //
    let parseFieldValue: string = $state("");
    let timerTypePresets: TimerType[] = ["radial", "linear", "number"];

    function copy() {
        navigator.clipboard.writeText(JSON.stringify(settings));
    }

    function parse(value: string = parseFieldValue) {
        let parsedSettings: Settings = JSON.parse(value);
        // settings.stages = parsedSettings.stages;

        for (let i = 0; i < parsedSettings.stages.length; i++) {
            parsedSettings.stages[i].index = i;
        }
        settings = parsedSettings;
        updateColor('--background-col', settings.theme.backgroundCol);
        updateColor('--primary-col', settings.theme.primaryColor);
        updateColor('--secondary-col', settings.theme.secondaryColor);
        updateColor('--timer-background-col', settings.theme.timerSecondaryColor);
        updateColor('--text-col', settings.theme.textColor);

    }

    function updateColor(variable: string, value: string) {
        document.documentElement.style.setProperty(variable, value);
    }

    // it's here because Idk why it doesn't work without it
    let shiza = $state(0);

    function deleteStage(index: number) {
        settings.stages = settings.stages.filter((item) => item.index !== index);
        for (let i = 0; i < settings.stages.length; i++) {
            settings.stages[i].index = i;
        }
        if (settings.stages.length == 0) {
            settings.stages.push({id: "Default", time: 15000, type: "allow-overlap", index: 0});
            settings.activeStage = 0;
        }
        if (settings.activeStage >= settings.stages.length) {
            settings.activeStage = settings.stages.length - 1;
        }
        shiza++;
    }

    function setToDefault(){
        parse(JSON.stringify(getDefaultSettings()));
    }

    //

    function changeCameraState() {
        //todo
    }


    //timer logic
    //

    let progress: ReturnType<typeof setInterval> | null = $state(null);
    let deltaTime: number = $state(10000);
    let startTime: number = 0;

    function stopTimer() {
        if (progress) {
            clearInterval(progress);
            progress = null;
        }
    }

    function onTimerButtonClick() {
        if (progress) {
            stopTimer();
        } else {
            startTime = Date.now();
            progress = setInterval(() => {
                const now = Date.now();
                settings.currentStageTime += now - startTime;
                startTime = now;
                if (settings.stages[settings.activeStage].type === "auto-new-stage" && settings.currentStageTime >= settings.stages[settings.activeStage].time) {
                    if (settings.activeStage < settings.stages.length - 1) {
                        settings.activeStage += 1;
                        settings.currentStageTime = 0;
                    } else {
                        stopTimer();
                    }
                }
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
        if (settings.currentStageTime < 0) {
            settings.currentStageTime = 0;
        }
        startTime = Date.now();
    }

    //


</script>

<main>
    <div class="main-body">

        <!--Settings-->
        <div class="defaultSettings settingsPanel">
            {#key settings}
                <button onclick={toggleMenu} class="timer-button" aria-label="Toggle settings">
                    {#if menuVisible}
                        <div class="close-icon icon"/>
                    {:else}
                        <div class="settings-icon icon"/>
                    {/if}
                </button>
                {#if menuVisible}
                    <div transition:fly={{x: -200,  duration: 300}}
                         class="settingsBody panelBody flex flex-col gap-1.5">
                        <div class="flex flex-row justify-between w-full items-center">
                            <p> Stages: </p>
                            <button onclick={()=>{settings.stages.push({id: "Default", time: 15000, type:"allow-overlap", index: settings.stages.length})}}
                                    class="timer-button" aria-label="Add stage">
                                <div class="icon add-icon"/>
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

                        <div class="flex flex-row justify-between w-full items-center">
                            <p>Display time:</p>
                            <div class="flex flex-row gap-1.5 items-center justify-center">
                                h:
                                <input class="custom-checkbox" type="checkbox" bind:group={settings.showSettings}
                                       value="h"/>
                                m:
                                <input class="custom-checkbox" type="checkbox" bind:group={settings.showSettings}
                                       value="m"/>
                                s:
                                <input class="custom-checkbox" type="checkbox" bind:group={settings.showSettings}
                                       value="s"/>
                                ms:
                                <input class="custom-checkbox" type="checkbox" bind:group={settings.showSettings}
                                       value="ms"/>
                            </div>
                        </div>

                        <div class="flex flex-row w-full justify-between items-center">
                            <p>Timer type:</p>
                            <select bind:value={settings.theme.timerType}>
                                {#each timerTypePresets as preset}
                                    <option value={preset}>
                                        {preset}
                                    </option>
                                {/each}
                            </select>
                        </div>

                        <div class="flex flex-row w-full justify-between items-center">
                            <p>Colors: </p>
                            <div class="flex flex-row items-center">
                                <button class="timer-button"><div class="palette-icon icon"/></button>
                                <div>or</div>
                                <input
                                        class="custom-color-input"
                                        type="color"
                                        bind:value={settings.theme.backgroundCol}
                                        oninput={() => updateColor('--background-col', settings.theme.backgroundCol)}
                                />

                                <input
                                        class="custom-color-input"
                                        type="color"
                                        bind:value={settings.theme.primaryColor}
                                        oninput={() => updateColor('--primary-col', settings.theme.primaryColor)}
                                />


                                <input
                                        class="custom-color-input"
                                        type="color"
                                        bind:value={settings.theme.secondaryColor}
                                        oninput={() => updateColor('--secondary-col', settings.theme.secondaryColor)}
                                />
                                <input
                                        class="custom-color-input"
                                        type="color"
                                        bind:value={settings.theme.timerSecondaryColor}
                                        oninput={() => updateColor('--timer-background-col', settings.theme.timerSecondaryColor)}
                                />
                                <input
                                        class="custom-color-input"
                                        type="color"
                                        bind:value={settings.theme.textColor}
                                        oninput={() => updateColor('--text-col', settings.theme.textColor)}
                                />

                            </div>
                        </div>


                        <div class="flex flex-row gap-1.5 justify-between w-full items-center">
                            <div>Preset:</div>
                            <input class="parse-in w-full" type="text" bind:value={parseFieldValue}
                                   placeholder="parse preset here"/>
                            <div class="flex flex-row gap-3 justify-between">
                                <button onclick={copy} class="timer-button"><div class="icon copy-icon"/></button>
                                <button onclick={()=>{parse(); parseFieldValue="";}} class="timer-button"><div class="icon paste-icon"/></button>
                                <button onclick={setToDefault} class="timer-button"><div class="icon reset-icon"/></button>
                            </div>
                        </div>




                    </div>
                {/if}
            {/key}
        </div>

        <!--Saves-->
        {#if isElectron}
            <div class="savesPanel settingsPanel">
                <button onclick={toggleSavesPanel} class="timer-button" aria-label="Toggle info panel">
                    {#if savesVisible}
                        <div class="close-icon icon"/>
                    {:else}
                        <div class="saves-icon icon"/>
                    {/if}
                </button>
                {#if savesVisible}
                    <div transition:fly={{x: -200,  duration: 300}}
                         class="savesPanelBody panelBody flex flex-col gap-1.5">

                        <button class="timer-button" onclick={makeSave}><div class="icon saves-icon" /></button>
                        <p> Saves panel is under development... </p>
                        {#each files as item}
                            <div class="flex flex-row justify-between w-full items-center">
                                <p>{item.split(".json").join("")}</p>
                                <div class="flex flex-row gap-1.5">
                                    <button class="timer-button" onclick={()=>loadSave(item)}><div class="icon load-icon" /></button>
                                    <button class="timer-button" onclick={()=>deleteSave(item)} ><div class="icon delete-icon" /></button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}


        <!--Camera-->
        {#if isElectron}
            <div class="cameraSettings settingsPanel">
                {#key cameraSettings}
                    <button onclick={toggleCameraSettings} class="timer-button" aria-label="Toggle camera settings">
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


                            <div class="flex flex-row gap-1.5 justify-between w-full">
                                <div>Width:</div>
                                <input class="parse-in" type="number" bind:value={cameraSettings.width}
                                       placeholder="width"/>
                            </div>

                            <div class="flex flex-row gap-1.5 justify-between w-full">
                                <div>Height:</div>
                                <input class="parse-in" type="number" bind:value={cameraSettings.height}
                                       placeholder="height"/>
                            </div>
                            <div class="flex flex-row gap-1.5 justify-between w-full">
                                <div>fps:</div>
                                <input class="parse-in" type="number" bind:value={cameraSettings.fps}
                                       placeholder="FPS"/>
                            </div>


                            <div class="flex flex-row justify-between gap-1.5 w-full">
                                <p>Camera:</p>
                                <p>
                                    {#if cameraSettings.enabled}
                                        Working!
                                    {:else}
                                        Disabled!
                                    {/if}
                                </p>
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
        {/if}



        <!--Info-->
        <div class:cameraSettings={!isElectron} class:infoPanel={isElectron} class="settingsPanel">
            <button onclick={toggleInfoPanel} class="timer-button" aria-label="Toggle info panel">
                {#if infoVisible}
                    <div class="close-icon icon"/>
                {:else}
                    <div class="info-icon icon"/>
                {/if}
            </button>
            {#if infoVisible}
                <div transition:fly={{x: 200,  duration: 300}}
                     class:cameraSettingsBody={!isElectron} class:infoSettingsBody={isElectron}
                     class="panelBody flex flex-col gap-1.5">
                    <div class="flex flex-row justify-between w-full items-center">
                        <p>Git repository(Instructions): </p>
                        <a target="_blank" href="https://github.com/Pazzann/project-timer">here</a>
                    </div>
                    <div class="flex flex-row justify-between w-full items-center">
                        <p>Version: </p>
                        <p>1.0.0</p>
                    </div>
                    <div class="flex flex-row justify-between w-full items-center">
                        <p>Developed by: </p>
                        <a target="_blank" href="https://github.com/Pazzann">Anton Matiash</a>
                    </div>
                    <div class="flex flex-row justify-between w-full items-center">
                        <p>Special thanks: </p>
                        <div class="flex flex-col justify-between items-center">
                            <p><a target="_blank" href="https://github.com/yegorvk">Egor Vaskonyan</a>(Camera)</p>

                            <p>Svelte devs ❤️</p>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!--Main Body-->
        {#key settings}
            <input bind:value={settings.name} class="input-name text-center text-7xl" type="text"/>

            <div class="flex flex-col gap-4">
                <div class="timer content-center justify-center flex flex-row">
                    {#if settings.theme.timerType === "radial"}
                        <RadialTimer settings={settings}></RadialTimer>
                    {:else if settings.theme.timerType === "linear"}
                        <LinearTimer settings={settings}></LinearTimer>
                    {:else if settings.theme.timerType === "number"}
                        <NumberTimer settings={settings}></NumberTimer>
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
                        <button onclick={()=>changeTimerStage(-1)} class="timer-button">
                            <div class="icon left-arrow-icon"/>
                        </button>
                        <button onclick={()=>changeTimerStage(1)} class="timer-button">
                            <div class="icon right-arrow-icon"/>
                        </button>
                    </div>
                    <div class="flex">
                        <input class="delta-input text-4xl" type="number" bind:value={deltaTime}/>
                        <button onclick={()=>changeTimerTime(deltaTime)} class="timer-button">
                            <div class="icon plus-icon"/>
                        </button>
                        <button onclick={()=>changeTimerTime(-deltaTime)} class="timer-button">
                            <div class="icon minus-icon"/>
                        </button>
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
        max-height: 200px;
        scrollbar-width: thin;
        scrollbar-color: var(--secondary-col) var(--primary-col);
        overflow-x: hidden;
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
    .savesPanel{
        left: 80px;
    }
    .savesPanelBody{
        left: -70px;
    }

    .cameraSettingsBody {
        right: 0;
    }

    .infoSettingsBody {
        right: -70px;
        width: 450px;
    }

    .settingsBody {
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
        padding: 10px;

        top: 70px;
    }

    a {
        color: var(--timer-background-col);
    }

    a:hover {
        color: var(--secondary-col);
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

        overflow: visible;
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



    select {
        font-size: 18px;
        padding: 5px;
        border-radius: 10px;
        width: 120px;
        /* Add your theme colors */
        background: var(--primary-col);
        color: var(--text-col);
        border: 5px solid var(--secondary-col);
    }
</style>
