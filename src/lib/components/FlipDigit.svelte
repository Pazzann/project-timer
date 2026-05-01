<script lang="ts">
    let { char, previousChar, buttonStyle = 'default' } = $props<{ char: string, previousChar: string, buttonStyle?: string }>();

    let isFlipping:boolean = $state(false);

    $effect(() => {
        if (char !== previousChar) {
            isFlipping = true;
            const timer = setTimeout(() => {
                isFlipping = false;
            }, 600);
            return () => clearTimeout(timer);
        }
    });
</script>

<div class="digit-card timer-style-{buttonStyle}" class:flip={isFlipping}>
    <div class="card-half top"><span>{char}</span></div>

    <div class="card-half bottom"><span>{char}</span></div>

    <div class="card-half flip-top"><span>{previousChar}</span></div>

    <div class="card-half flip-bottom"><span>{char}</span></div>
</div>



<style>
    .digit-card {
        position: relative;
        width: 25px;
        height: 35px;
        font-size: 30px;
        border-width: 2px;
        border-radius: 4px;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        perspective: 300px;
        background: var(--primary-col);
        border-style: solid;
        border-color: var(--secondary-col);
        transition: border-color 0.1s;
    }

    .timer-style-minimal {
        border-color: transparent;
        border-radius: 2px;
    }

    .timer-style-glass {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        border-width: 1px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }

    .timer-style-neumorphism {
        border: none;
        box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2), -3px -3px 6px rgba(255, 255, 255, 0.07);
    }

    .timer-style-retro {
        border-radius: 0;
        box-shadow: 0 0 6px var(--secondary-col);
    }

    .timer-style-material {
        border: none;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
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
        text-shadow: none;
        transition: color 0.1s, text-shadow 0.1s;
    }

    .timer-style-retro .card-half span {
        text-shadow:
            0 0 5px var(--text-col),
            0 0 15px var(--secondary-col),
            0 0 25px var(--secondary-col);
    }

    .timer-style-glass .card-half span {
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .timer-style-neumorphism .card-half span {
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(255, 255, 255, 0.1);
    }

    /* --- Positioning --- */

    .top { top: 0; border-radius: 3px 3px 0 0; } /* SCALED */
    .top span { top: 0; line-height: 30px; } /* SCALED */

    .bottom { top: 50%; border-radius: 0 0 3px 3px; } /* SCALED */
    .bottom span { top: -18px; line-height: 30px; } /* SCALED */

    /* --- Flipper Elements (Start positions) --- */

    .flip-top {
        top: 0;
        border-radius: 4px 4px 0 0;
        background: var(--primary-col);
        z-index: 10;
        transform-origin: bottom;
    }
    /* Match .top span exactly so the overlay is invisible at rest */
    .flip-top span { top: 0; line-height: 30px; }

    .flip-bottom {
        top: 50%;
        border-radius: 0 0 4px 4px;
        background: var(--primary-col);
        z-index: 10;
        transform-origin: top;
        transform: rotateX(90deg);
    }
    /* Match .bottom span exactly so the reveal aligns with the static bottom */
    .flip-bottom span { top: -18px; line-height: 30px; }

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