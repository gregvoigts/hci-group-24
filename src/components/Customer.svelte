<script>
    import TableArea from "./TableArea.svelte";
    import Reservation from "./Reservation.svelte";

    let showContent = 'reservation';
</script>

<div class="tabs is-centered is-medium is-boxed">
    <ul>
        <!-- svelte-ignore a11y-missing-attribute -->
        <li class:is-active="{showContent == 'reservation'}"><a on:click="{() => showContent='reservation'}">Reservierung</a></li>
        <!-- svelte-ignore a11y-missing-attribute -->
        <li class:is-active="{showContent == 'tables'}"><a on:click="{() => showContent='tables'}">Tischauswahl</a></li>
        <!-- svelte-ignore a11y-missing-attribute -->
        <li class:is-active="{showContent == 'menu'}"><a on:click="{() => showContent='menu'}">Speisekarte</a></li>
    </ul>
</div>
<div id="tab-content">
    {#if showContent == 'reservation'}
        <Reservation/>
    {:else if showContent == 'tables'}        
        <TableArea gridCols=9 gridRows=9 />
    {:else if showContent == 'menu'}
        <div id="menu">

        </div>
    {/if}
</div>

<style>

</style>
