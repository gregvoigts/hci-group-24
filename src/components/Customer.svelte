<script>
    import TableArea from "./TableArea.svelte";
    import Reservation from "./Reservation.svelte";
    import Menu from "./Menu.svelte";
    import Collapsable from "./Collapsable.svelte";
    
    let date, time, persons, name, email;
    let isValid = false;

    $: isValid = date !== null && time !== null && persons > 0 && persons < 17 && name !== "" && email !== "";
</script>


<div class="columns m-5">
    <div class="column is-half">
        <div class="box">
            <Reservation
                bind:date
                bind:time
                bind:persons
                bind:name
                bind:email
            />
        </div>
        <div class="box">
        <Collapsable
            label="Speisekarte"
        >
            <Menu/>
        </Collapsable>
        </div>
        <div class="column">
            <div class="buttons is-right">
                <button disabled={!isValid} class="button is-primary" on:click="{() => alert('Vielen Dank für Ihre Reservierung, wir haben Ihre Daten erhalten!\nSie haben eine Bestätigung per E-Mail erhalten.')}">
                    <span>Reservieren</span>
                </button>
            </div>
        </div>
    </div>
    <div class="column is-half">
        <TableArea isStaff=0/>
    </div>
</div>

<style>

</style>
