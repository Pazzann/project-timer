<script lang="ts">
    import {onMount} from "svelte";
    import type Stage from "../interfaces/Stage";
    import "../styles/Icons.css";
    import "../styles/Panel.css";
    import type {OverlapBehaviour} from "../types/OverlapBehaviour";
    import type Theme from "../interfaces/Theme";
    import { slide } from "svelte/transition";

    let {item, deleteStage, theme}: {item: Stage, deleteStage: Function, theme: Theme} = $props();
    let name= $state("");
    let time = $state(0);

    onMount(()=> {
        name = item.title;
        time = item.time;
    });

    const overlapPresets: OverlapBehaviour[] = ["auto-new-stage", "allow-overlap"];

    let advancedVisible:boolean = $state(false);


</script>

<div class={"stage-body flex flex-col timer-panel-" + theme.buttonStyle}>
    <div class={" flex flex-row justify-between gap-0.5"}>
        <p class="w-full text-center justify-center flex content-center text-4xl h-auto items-center">{+item.index + 1}.</p>
        <input class={"input-stage"+ " timer-input-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle} type="text" oninput={()=>{item.title = name;}} bind:value={name}/>
        <input class={"input-stage-time"+" timer-input-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle} type="number" oninput={()=>{item.time = time}} bind:value={time}/>
        <button onclick={()=>deleteStage(item.index)} class={"timer-button-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle}><div class={"icon icon-" + theme.iconPack + " delete-icon"}/></button>
        <button onclick={()=>advancedVisible = !advancedVisible} class={"timer-button-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle}><div class:flip-y={advancedVisible} class={"icon icon-" + theme.iconPack + " expand-icon"}/></button>
    </div>
    {#if advancedVisible}
        <div transition:slide={{ duration: 180 }}>
            <div class={" flex flex-row justify-between gap-0.5 m-1"}>
                <p>Overlap behaviour:</p>
                <select class={"timer-select-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle} bind:value={item.settings.overlapBehaviour}>
                    {#each overlapPresets as preset}
                        <option value={preset}>
                            {preset}
                        </option>
                    {/each}
                </select>
            </div>
            <div class={" flex flex-row justify-between gap-0.5 m-1"}>
                <p>Can be negative:</p>
                <select class={"timer-select-"+theme.buttonStyle + " timer-common-" + theme.buttonStyle} bind:value={item.settings.canGoNegative}>
                        <option value={true}>
                            yes
                        </option>
                        <option value={false}>
                            no
                        </option>
                </select>
            </div>
        </div>
    {/if}
</div>

<style>
    .stage-body{
        width: 100%;
        padding: 2px;
        cursor: grab;
    }

    /* Inputs inside the stage keep their native cursor (text-edit, pointer, etc.) */
    .stage-body :global(input),
    .stage-body :global(select),
    .stage-body :global(textarea),
    .stage-body :global(button),
    .stage-body :global(.icon) {
        cursor: auto;
    }
    .stage-body :global(button),
    .stage-body :global(.icon) {
        cursor: pointer;
    }
    .stage-body :global(input[type="text"]),
    .stage-body :global(input[type="number"]),
    .stage-body :global(textarea) {
        cursor: text;
    }

    /* While SortableJS is actively dragging this stage */
    :global(.sortable-chosen) .stage-body,
    :global(.sortable-drag) .stage-body,
    .stage-body:active {
        cursor: grabbing;
    }
    .flip-y {
        transform: scaleY(-1);
    }

    .input-stage{
        width: 150px;
    }
    .input-stage-time{
        width: 80px;
    }
</style>