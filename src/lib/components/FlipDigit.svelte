<script lang="ts">
    let { char, previousChar } = $props<{ char: string, previousChar: string }>();

    let isFlipping:boolean = $state(false);

    // Use an effect to watch for changes to `char`
    $effect(() => {
        // Only trigger flip if the char actually changed
        if (char !== previousChar) {
            isFlipping = true;

            // Reset the flipping class after the animation finishes
            const timer = setTimeout(() => {
                isFlipping = false;
            }, 600); // Must match animation duration

            // Svelte cleanup function
            return () => clearTimeout(timer);
        }
    });
</script>

<div class="digit-card" class:flip={isFlipping}>
    <div class="card-half top"><span>{char}</span></div>

    <div class="card-half bottom"><span>{char}</span></div>

    <div class="card-half flip-top"><span>{previousChar}</span></div>

    <div class="card-half flip-bottom"><span>{char}</span></div>
</div>



<style>
    .digit-card {
        position: relative;

        /* --- SCALED VALUES --- */
        width: 25px;
        height: 35px;
        font-size: 30px;
        border-width: 2px;
        border-radius: 4px;
        /* --------------------- */

        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        perspective: 300px;
        background: var(--primary-col);
        border-style: solid; /* Added this for clarity */
        border-color: var(--secondary-col);
        transition: border-color 0.1s;
    }

    .card-half {
        position: absolute;
        left: 0;
        width: 100%;
        height: 50%;
        overflow: hidden;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
    }

    .card-half span {
        display: block;
        position: absolute;
        left: 0;
        width: 100%;
        text-align: center;
        color: var(--text-col);
        text-shadow:
                0 0 5px var(--text-col),
                0 0 15px var(--secondary-col),
                0 0 25px var(--secondary-col);
        transition: color 0.1s, text-shadow 0.1s;
    }

    /* --- Positioning --- */

    .top { top: 0; border-radius: 3px 3px 0 0; } /* SCALED */
    .top span { top: 0; line-height: 30px; } /* SCALED */

    .bottom { top: 50%; border-radius: 0 0 3px 3px; } /* SCALED */
    .bottom span { top: -18px; line-height: 30px; } /* SCALED */

    /* --- Flipper Elements (Start positions) --- */

    .flip-top {
        top: 0;
        border-radius: 4px 4px 0 0; /* SCALED */
        background: var(--primary-col);
        z-index: 10;
        transform-origin: bottom;
    }
    .flip-top span { top: 0; line-height: 50px; } /* SCALED */

    .flip-bottom {
        top: 50%;
        border-radius: 0 0 4px 4px; /* SCALED */
        background: var(--primary-col);
        z-index: 10;
        transform-origin: top;
        transform: rotateX(90deg);
    }
    .flip-bottom span { top: -25px; line-height: 50px; } /* SCALED */

    /* --- Animation (No changes needed) --- */

    .flip .flip-top {
        animation: flipTop 0.6s ease-in-out;
        transform: rotateX(-90deg);
    }

    .flip .flip-bottom {
        animation: flipBottom 0.6s ease-in-out;
        transform: rotateX(0deg);
    }

    @keyframes flipTop {
        from { transform: rotateX(0deg); }
        to { transform: rotateX(-90deg); }
    }

    @keyframes flipBottom {
        from { transform: rotateX(90deg); }
        to { transform: rotateX(0deg); }
    }
</style>