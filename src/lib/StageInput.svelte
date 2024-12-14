
<script lang="ts">
    import {onMount} from "svelte";
    import type Stage from "./Stage";

    let {item, deleteStage}: {item: Stage, deleteStage: Function} = $props();
    let name= $state("");
    let time = $state(0);

    onMount(()=> {
        name = item.id;
        time = item.time;
    });


</script>


<div class="stage-body flex flex-row justify-between gap-3.5">
    <p class="w-full text-center justify-center flex content-center text-4xl h-auto items-center">{+item.index + 1}.</p>
    <input class="input-stage" type="text" oninput={()=>{item.id = name;}} bind:value={name}/>
    <input class="input-stage" type="number" oninput={()=>{item.time = time}} bind:value={time}/>
    <button onclick={()=>deleteStage(item.index)} class="timer-button">X</button>
</div>

<style>

    .stage-body{
        border-radius: 10px;
        width: 100%;
        padding: 10px;
        border: 5px solid var(--secondary-col);
    }

    .input-stage{
        width: 150px;
        background: var(--primary-col);
        border: 5px solid var(--secondary-col);
        border-radius: 10px;
    }

</style>