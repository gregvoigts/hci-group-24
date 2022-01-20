<script>
    export let date = null;
    export let time = null;
    export let persons = null;
    export let name = '';
    export let email = '';
    let wishes, tel;
</script>

<div class="p-4 control">
    <div class="columns">
        <div class="column" >
            <p>Datum</p>
            <input bind:value={date} class="input is-primary" type="text" placeholder="24.12.2022">
        </div>
        <div class="column">
            <p>Uhrzeit</p>
            <input bind:value={time} class="input is-primary" type="text" placeholder="16:00">
        </div>
        <div class="column">
            <p>Anzahl Personen</p>
            <input bind:value={persons} class="input is-primary" type="text" placeholder="4">
        </div>
    </div>
    
    <div class="columns">
        <div class="column">
            <p>Name</p>
            <input bind:value={name} class="input is-primary" type="text" placeholder="Santa Claus">
        </div>
        <div class="column">
            <p>E-Mail</p>
            <input bind:value={email} class="input is-primary" type="email" placeholder="santas.reindeers@christmas.com">
        </div>
        <div class="column">
            <p>Telefonnummer</p>
            <input bind:value={tel} class="input is-primary" type="tel" placeholder="0511 237475">
        </div>
    </div>
    <div class="columns">
        <div class="column">
            <p>Besondere Wünsche:</p>
            <textarea bind:value={wishes} class="textarea is-primary" placeholder="Tisch in Nähe von Spielecke"></textarea>
        </div>
    </div>
</div>