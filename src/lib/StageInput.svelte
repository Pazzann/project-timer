
<script lang="ts">

    import type Settings from "./Settings";
    import {onMount} from "svelte";

    let {settings, index}: {settings: Settings, index: number} = $props();
    let name= $state("");
    let time = $state(0);

    onMount(()=> {
        name = settings.stages[index].id;
        time = settings.stages[index].time;
    });

    function deleteStage(){
        settings.stages.splice(index, 1);
    }

</script>


<div class="stage-body flex flex-row justify-between gap-3.5">
    <input class="input-stage" type="text" oninput={()=>{settings.stages[index].id = name}} bind:value={name}/>
    <input class="input-stage" type="text" oninput={()=>{settings.stages[index].time = time}} bind:value={time}/>
    <button onclick={()=>deleteStage()} class="timer-button">X</button>
</div>

<style>

    .stage-body{
        border-radius: 10px;
        width: 100%;
        padding: 10px;
        border: 5px solid var(--secondary-col);
    }

    .input-stage{
        width: 100px;
        background: var(--primary-col);
        border: 5px solid var(--secondary-col);
        border-radius: 10px;
    }

</style>