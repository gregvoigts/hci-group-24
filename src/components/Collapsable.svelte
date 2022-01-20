<script>
    import Minus from "./icons/Minus.svelte";
    import Plus from "./icons/Plus.svelte";

    export let label;
    export let optional = true;
    let visible = false;

    function collapse() {
        visible = !visible;
    }
</script>

<div class="level" on:click={collapse}>
    <div>
        <span class="mr-2">
            {label}
        </span>
        {#if optional}
            <span class="tag is-primary is-light">Optional</span>
        {/if}
    </div>
    {#if !visible}
        <Plus />
    {:else}
        <Minus />
    {/if}
</div>

<div class="px-8 py-2" style={visible ? "display: block" : "display: none"}>
    <slot />
</div>

<hr />