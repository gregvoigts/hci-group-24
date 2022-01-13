<script>
    import TableArea from "./TableArea.svelte";
    import Reservation from "./Reservation.svelte";
    import Menu from "./Menu.svelte";
    

    let showContent = 'reservation';
</script>

<div class="tabs is-centered is-medium is-boxed">
    <ul>
        <!-- svelte-ignore a11y-missing-attribute -->
        <li class:is-active="{showContent == 'reservation'}"><a on:click="{() => showContent='reservation'}">Reservierung</a></li>
        <!-- svelte-ignore a11y-missing-attribute -->
        <li class:is-active="{showContent == 'menu'}"><a on:click="{() => showContent='menu'}">Speisekarte</a></li>
    </ul>
</div>
<div id="tab-content">
    {#if showContent == 'reservation'}
    <div class="columns">
        <div class="column is-half">
            <Reservation/>   
            <div class="columns p-4 ">
                <div class="column">
                    <button class="button is-primary" on:click="{() => alert('Vielen Dank für Ihre Reservierung, wir haben Ihre Daten erhalten!\nSie haben eine Bestätigung per E-Mail erhalten.')}">
                        <span>reservieren</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="column">
            <TableArea gridCols=9 gridRows=9 />
        </div>
    </div>
    {:else if showContent == 'menu'}
    <Menu/>
    {/if}
</div>

<style>

</style>
