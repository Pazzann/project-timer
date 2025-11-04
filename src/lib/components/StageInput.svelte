
<script lang="ts">
    import {onMount} from "svelte";
    import type Stage from "../interfaces/Stage";
    import "../styles/Icons.css";
    import type {StageType} from "../types/StageTypes";

    let {item, deleteStage}: {item: Stage, deleteStage: Function} = $props();
    let name= $state("");
    let time = $state(0);

    onMount(()=> {
        name = item.id;
        time = item.time;
    });

    const presets: StageType[] = ["auto-new-stage", "allow-overlap"];


</script>


<div class="stage-body flex flex-row justify-between gap-0.5">
    <p class="w-full text-center justify-center flex content-center text-4xl h-auto items-center">{+item.index + 1}.</p>
    <input class="input-stage" type="text" oninput={()=>{item.id = name;}} bind:value={name}/>
    <input class="input-stage" type="number" oninput={()=>{item.time = time}} bind:value={time}/>
    <select bind:value={item.type}>
        {#each presets as preset}
            <option value={preset}>
                {preset}
            </option>
        {/each}
    </select>
    <button onclick={()=>deleteStage(item.index)} class="timer-button"><div class="icon delete-icon"/></button>
</div>

<style>

    .stage-body{
        border-radius: 10px;
        width: 100%;
        padding: 2px;
        border: 5px solid var(--secondary-col);
    }

    .input-stage{
        width: 90px;
        background: var(--primary-col);
        border: 5px solid var(--secondary-col);
        border-radius: 10px;
    }

    select {
        font-size: 18px;
        padding: 5px;
        border-radius: 10px;
        width: 90px;
        /* Add your theme colors */
        background: var(--primary-col);
        color: var(--text-col);
        border: 5px solid var(--secondary-col);
    }

</style>