
<script lang="ts">
    import {onMount} from "svelte";
    import type Stage from "../interfaces/Stage";
    import "../styles/Icons.css";
    import "../styles/Panel.css";
    import type {StageType} from "../types/StageTypes";
    import type Theme from "../interfaces/Theme";

    let {item, deleteStage, theme}: {item: Stage, deleteStage: Function, theme: Theme} = $props();
    let name= $state("");
    let time = $state(0);

    onMount(()=> {
        name = item.id;
        time = item.time;
    });

    const presets: StageType[] = ["auto-new-stage", "allow-overlap"];


</script>


<div class={"stage-body flex flex-row justify-between gap-0.5 timer-panel-" + theme.buttonStyle}>
    <p class="w-full text-center justify-center flex content-center text-4xl h-auto items-center">{+item.index + 1}.</p>
    <input class={"input-stage"+ " timer-input-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle} type="text" oninput={()=>{item.id = name;}} bind:value={name}/>
    <input class={"input-stage"+ " timer-input-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle} type="number" oninput={()=>{item.time = time}} bind:value={time}/>
    <select class={"timer-select-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle} bind:value={item.type}>
        {#each presets as preset}
            <option value={preset}>
                {preset}
            </option>
        {/each}
    </select>
    <button onclick={()=>deleteStage(item.index)} class={"timer-button-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle}><div class="icon delete-icon"/></button>
</div>

<style>

    .stage-body{
        width: 100%;
        padding: 2px;
    }

    .input-stage{
        width: 90px;
    }
</style>