<script>
    import TableArea from "./TableArea.svelte";
    import Reservation from "./Reservation.svelte";
    import Menu from "./Menu.svelte";
    import Staff from "./Staff-scaffold.svelte"
    

    let showContent = 'staff';
</script>

<div class="tabs is-centered is-medium is-boxed">
    <ul>
        <!-- svelte-ignore a11y-missing-attribute -->
        <li class:is-active="{showContent == 'reservation'}"><a on:click="{() => showContent='reservation'}">Reservierung</a></li>
        <!-- svelte-ignore a11y-missing-attribute -->
        <li class:is-active="{showContent == 'menu'}"><a on:click="{() => showContent='menu'}">Speisekarte</a></li>
        <!-- svelte-ignore a11y-missing-attribute -->
        <li class:is-active="{showContent == 'staff'}"><a on:click="{() => showContent='staff'}">Staff</a></li>
    </ul>
</div>
<div id="tab-content">
    {#if showContent == 'reservation'}
    <div class="columns">
        <div class="column is-half">
            <Reservation/>   
        </div>
        <div class="column">
            <TableArea gridCols=9 gridRows=9 />
        </div>
    </div>
    {:else if showContent == 'menu'}
    <Menu/>
    {:else if showContent == 'staff'}  
        <Staff/>
    {/if}
</div>

<style>

</style>
